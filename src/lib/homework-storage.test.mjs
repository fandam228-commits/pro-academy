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

test("failed locked homework persistence cleans up the newly uploaded private Blob", () => {
  const upload = homeworkApiRouteSource.indexOf("const blob = await put(");
  const transaction = homeworkApiRouteSource.indexOf("persistence = await db.transaction(");
  const lock = homeworkApiRouteSource.indexOf("withHomeworkSubmissionLock(", transaction);
  const insert = homeworkApiRouteSource.indexOf("await lockedTx.insert(homeworkSubmissions).values(sub)");
  const cleanupFunctionStart = homeworkApiRouteSource.indexOf("const cleanupUnreferencedUpload = async () =>");
  const cleanupFunctionEnd = homeworkApiRouteSource.indexOf("let persistence;", cleanupFunctionStart);
  const transactionCatch = homeworkApiRouteSource.indexOf("} catch (error) {", transaction);
  const cleanupCall = homeworkApiRouteSource.indexOf("await cleanupUnreferencedUpload();", transactionCatch);
  const rethrow = homeworkApiRouteSource.indexOf("throw error;", cleanupCall);

  assert.ok(upload >= 0 && transaction > upload && lock > transaction && insert > lock,
    "private upload must precede the locked database insert");
  assert.ok(cleanupFunctionStart > upload && cleanupFunctionEnd > cleanupFunctionStart);
  const cleanup = homeworkApiRouteSource.slice(cleanupFunctionStart, cleanupFunctionEnd);
  assert.match(cleanup, /if \(!storagePath \|\| !uploadToken \|\| !isPrivateHomeworkBlobPath\(storagePath\)\) return/);
  assert.match(cleanup, /await del\(storagePath, \{ token: uploadToken \}\)/);
  assert.match(cleanup, /Private homework Blob cleanup failed; manual reconciliation may be required/);
  assert.ok(transactionCatch > insert && cleanupCall > transactionCatch && rethrow > cleanupCall,
    "a failed transaction must clean the unreferenced upload and then rethrow the original failure");
  assert.match(homeworkApiRouteSource, /if \(persistence\.kind === "conflict"\)[\s\S]*?await cleanupUnreferencedUpload\(\)/);
  assert.doesNotMatch(cleanup, /console\.error\([^;]*,\s*cleanupError/);
});

test("teacher file access resolves the current course owner from the database", () => {
  assert.match(
    homeworkFileRouteSource,
    /\.leftJoin\(courses, eq\(homework\.courseId, courses\.id\)\)/,
    "file authorization must resolve the course linked to the homework",
  );
  assert.match(homeworkFileRouteSource, /courseId:\s*homework\.courseId/);
  assert.match(homeworkFileRouteSource, /courseTeacherId:\s*courses\.teacherId/);
  assert.match(homeworkFileRouteSource, /homeworkCourseId:\s*homeworkRow\?\.courseId/);
  assert.match(homeworkFileRouteSource, /courseTeacherId:\s*homeworkRow\?\.courseTeacherId/);
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

test("new homework submissions upload only to the private Blob store with the dedicated token", () => {
  const tokenHelperIndex = homeworkApiRouteSource.indexOf("const privateBlobToken = getHomeworkPrivateBlobToken()");
  const missingTokenGuardIndex = homeworkApiRouteSource.indexOf("if (!privateBlobToken)", tokenHelperIndex);
  const uploadStart = homeworkApiRouteSource.indexOf("const blob = await put(", missingTokenGuardIndex);
  const uploadEnd = homeworkApiRouteSource.indexOf("const cleanupUnreferencedUpload", uploadStart);

  assert.ok(tokenHelperIndex >= 0, "uploads must use the dedicated private-store token helper");
  assert.ok(missingTokenGuardIndex > tokenHelperIndex, "the missing-token guard must follow token lookup");
  assert.ok(uploadStart > missingTokenGuardIndex, "the upload must not happen before the fail-closed token guard");
  assert.ok(uploadEnd > uploadStart, "the submission upload block must exist");

  const tokenGuardSource = homeworkApiRouteSource.slice(tokenHelperIndex, uploadStart);
  const uploadSource = homeworkApiRouteSource.slice(uploadStart, uploadEnd);
  assert.match(tokenGuardSource, /if \(!privateBlobToken\)[\s\S]*?status:\s*503/);
  assert.match(uploadSource, /await put\([\s\S]*?access:\s*"private"[\s\S]*?token:\s*privateBlobToken/);
  assert.match(uploadSource, /storagePath = blob\.pathname/);
  assert.doesNotMatch(uploadSource, /access:\s*"public"/);
  assert.doesNotMatch(uploadSource, /storagePath\s*=\s*blob\.url/);
});
