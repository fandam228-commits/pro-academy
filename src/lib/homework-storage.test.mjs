import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getHomeworkPrivateBlobToken,
  getHomeworkFileStorageDecision,
  isLegacyPublicHomeworkBlobUrl,
  isPrivateHomeworkBlobPath,
} from "./homework-storage.mjs";

test("private homework storage fails closed when its dedicated token is absent", () => {
  assert.equal(getHomeworkPrivateBlobToken({}), null);
  assert.equal(getHomeworkPrivateBlobToken({ HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN: "   " }), null);
});

test("private homework storage token is trimmed", () => {
  assert.equal(
    getHomeworkPrivateBlobToken({ HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN: "  private-token  " }),
    "private-token"
  );
});

test("legacy public Blob URLs are detected and must not be redirected", () => {
  assert.equal(isLegacyPublicHomeworkBlobUrl("https://store.public.blob.vercel-storage.com/homework/file.pdf"), true);
  assert.equal(isLegacyPublicHomeworkBlobUrl("http://example.test/file.pdf"), true);
  assert.equal(isLegacyPublicHomeworkBlobUrl("homework/file.pdf"), false);
  assert.equal(isLegacyPublicHomeworkBlobUrl(null), false);
});

test("only safe homework namespace pathnames are accepted for private Blob reads", () => {
  assert.equal(isPrivateHomeworkBlobPath("homework/hws_123_file.pdf"), true);
  assert.equal(isPrivateHomeworkBlobPath("homework/nested/file.pdf"), true);
  assert.equal(isPrivateHomeworkBlobPath("https://store.public.blob.vercel-storage.com/homework/file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/../secrets.txt"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework//file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("other/file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/file.pdf?token=x"), false);
  assert.equal(isPrivateHomeworkBlobPath(null), false);
});


test("private homework path validation rejects percent-encoded traversal and separators", () => {
  assert.equal(isPrivateHomeworkBlobPath("homework/%2e%2e/secrets.txt"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/%2E%2E/secrets.txt"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework%2Fsecrets.txt"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/file%2F..%2Fsecrets.txt"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/%ZZ/file.pdf"), false);
});


test("homework file storage policy fails closed before any private Blob read", () => {
  assert.equal(getHomeworkFileStorageDecision({ storagePath: null, privateBlobToken: "private-token" }), "no-file");
  assert.equal(getHomeworkFileStorageDecision({ storagePath: "", privateBlobToken: "private-token" }), "no-file");
  assert.equal(
    getHomeworkFileStorageDecision({ storagePath: "https://store.public.blob.vercel-storage.com/old.pdf", privateBlobToken: "private-token" }),
    "legacy-public-url",
  );
  assert.equal(
    getHomeworkFileStorageDecision({ storagePath: "homework/../outside.pdf", privateBlobToken: "private-token" }),
    "invalid-private-path",
  );
  assert.equal(
    getHomeworkFileStorageDecision({ storagePath: "homework/submission.pdf", privateBlobToken: null }),
    "private-storage-not-configured",
  );
  assert.equal(
    getHomeworkFileStorageDecision({ storagePath: "homework/submission.pdf", privateBlobToken: "  " }),
    "private-storage-not-configured",
  );
  assert.equal(
    getHomeworkFileStorageDecision({ storagePath: "homework/submission.pdf", privateBlobToken: "private-token" }),
    "stream-private",
  );
});


const homeworkFileRouteSource = await readFile(
  new URL("../app/api/homework/file/[id]/route.ts", import.meta.url),
  "utf8",
);

test("legacy public homework URLs fail with 410 before any Blob provider read", () => {
  const legacyDecision = homeworkFileRouteSource.indexOf('storageDecision === "legacy-public-url"');
  const privateBlobRead = homeworkFileRouteSource.indexOf('await get(sub.storagePath as string');
  assert.notEqual(legacyDecision, -1, "the authenticated file route must handle legacy public URLs explicitly");
  assert.notEqual(privateBlobRead, -1, "private file streaming must use the Blob provider");
  assert.ok(legacyDecision < privateBlobRead, "legacy URLs must be rejected before a provider read");
  assert.match(
    homeworkFileRouteSource.slice(legacyDecision, privateBlobRead),
    /status:\s*410/,
    "legacy public references must not be served through the authenticated route",
  );
  assert.doesNotMatch(
    homeworkFileRouteSource,
    /NextResponse\.redirect\s*\(\s*sub\.storagePath/,
    "the route must never redirect callers to the stored legacy URL",
  );
});


const homeworkApiRouteSource = await readFile(
  new URL("../app/api/homework/route.ts", import.meta.url),
  "utf8",
);

test("private homework downloads use private Blob access and non-cacheable response headers", () => {
  assert.ok(
    homeworkFileRouteSource.includes('await get(sub.storagePath as string, { access: "private", token: privateBlobToken })'),
    "file reads must use the dedicated private token and private Blob access",
  );
  assert.ok(homeworkFileRouteSource.includes('"Cache-Control": "private, no-store"'));
  assert.ok(homeworkFileRouteSource.includes('"X-Content-Type-Options": "nosniff"'));
  assert.ok(homeworkFileRouteSource.includes('"Content-Disposition": `attachment; filename="${safeFileName}"`'));
});

test("homework API strips storagePath from teacher, student, and submit response payloads", () => {
  assert.ok(
    homeworkApiRouteSource.includes("submissions: subs.map((submission) => withoutStoragePath(submission))"),
    "teacher submission lists must not expose the private storage pathname",
  );
  assert.ok(
    homeworkApiRouteSource.includes("mySubmission: mine ? withoutStoragePath(mine) : null"),
    "student responses must not expose the private storage pathname",
  );
  assert.ok(
    homeworkApiRouteSource.includes("submission: withoutStoragePath(sub)"),
    "new submission responses must not expose the private storage pathname",
  );
});

test("failed homework submission inserts clean up the newly uploaded private Blob", () => {
  const upload = homeworkApiRouteSource.indexOf("const blob = await put(");
  const insert = homeworkApiRouteSource.indexOf("await db.insert(homeworkSubmissions).values(sub);");
  assert.ok(upload !== -1 && insert > upload, "the private upload must precede the database insert");

  const guardStart = homeworkApiRouteSource.lastIndexOf("try {", insert);
  const guardEnd = homeworkApiRouteSource.indexOf("throw insertError;", insert);
  assert.ok(guardStart !== -1 && guardEnd > insert, "the insert must have a failure cleanup guard");
  const guardedInsert = homeworkApiRouteSource.slice(guardStart, guardEnd + "throw insertError;".length);

  assert.match(guardedInsert, /if \(storagePath && uploadToken\)/);
  assert.match(guardedInsert, /await del\(storagePath, \{ token: uploadToken \}\)/);
  assert.match(guardedInsert, /Failed to remove homework upload after insert failure/);
  assert.match(guardedInsert, /throw insertError;/);
});

test("homework file route authenticates before database setup or private record reads", () => {
  const authIndex = homeworkFileRouteSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthorizedGuardIndex = homeworkFileRouteSource.indexOf("if (!ctx)");
  const setupIndex = homeworkFileRouteSource.indexOf("await ensureDbSetup()");
  const submissionReadIndex = homeworkFileRouteSource.indexOf("const subs = await db.select().from(homeworkSubmissions)");

  assert.ok(authIndex >= 0, "the route must resolve the session before database setup");
  assert.ok(unauthorizedGuardIndex > authIndex, "unauthenticated requests must be rejected");
  assert.ok(setupIndex > unauthorizedGuardIndex, "unauthenticated requests must not trigger database setup");
  assert.ok(submissionReadIndex > setupIndex, "submission records must be read only after authentication and setup");
  assert.match(homeworkFileRouteSource, /if\s*\(!ctx\)[\s\S]*?status:\s*401/);
});
