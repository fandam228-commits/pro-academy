import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getHomeworkFileAccessDecision,
  getHomeworkFileStorageDecision,
  getHomeworkPrivateBlobToken,
  isLegacyPublicHomeworkBlobUrl,
  isPrivateHomeworkBlobPath,
} from "./homework-file-access.mjs";

test("submission files are limited to the owning student, current course teacher, or admin", () => {
  const base = {
    submissionFound: true,
    homeworkFound: true,
    requesterId: "student-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
    homeworkCourseId: "course-a",
    courseTeacherId: "teacher-1",
  };

  assert.equal(getHomeworkFileAccessDecision({ ...base, role: "student" }), "allowed");
  assert.equal(getHomeworkFileAccessDecision({ ...base, role: "student", requesterId: "student-2" }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...base, role: "teacher", requesterId: "teacher-1" }), "allowed");
  assert.equal(getHomeworkFileAccessDecision({ ...base, role: "teacher", requesterId: "teacher-2" }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...base, role: "admin", requesterId: "admin-1" }), "allowed");
  assert.equal(getHomeworkFileAccessDecision({ ...base, role: "parent", requesterId: "parent-1" }), "not-found");
});

test("course-linked homework requires the current course owner to match the homework teacher", () => {
  const base = {
    submissionFound: true,
    homeworkFound: true,
    role: "teacher",
    requesterId: "teacher-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
    homeworkCourseId: "course-a",
    courseTeacherId: "teacher-1",
  };
  assert.equal(getHomeworkFileAccessDecision(base), "allowed");
  assert.equal(getHomeworkFileAccessDecision({ ...base, courseTeacherId: "teacher-2" }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...base, courseTeacherId: null }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...base, homeworkCourseId: " " }), "not-found");
});

test("grade-only homework remains available to its assigned teacher, but incomplete records fail closed", () => {
  const base = {
    submissionFound: true,
    homeworkFound: true,
    role: "teacher",
    requesterId: "teacher-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
    homeworkCourseId: null,
    courseTeacherId: null,
  };
  assert.equal(getHomeworkFileAccessDecision(base), "allowed");
  assert.equal(getHomeworkFileAccessDecision({ ...base, homeworkTeacherId: "teacher-2" }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...base, submissionFound: false }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...base, homeworkFound: false }), "not-found");
});

test("private Blob storage fails closed for legacy URLs, malformed paths, and missing tokens", () => {
  assert.equal(getHomeworkPrivateBlobToken({}), null);
  assert.equal(getHomeworkPrivateBlobToken({ HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN: "  token  " }), "token");
  assert.equal(isLegacyPublicHomeworkBlobUrl("https://public.blob.vercel-storage.com/legacy.pdf"), true);
  assert.equal(isLegacyPublicHomeworkBlobUrl("homework/file.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/submission.pdf"), true);
  assert.equal(isPrivateHomeworkBlobPath("homework/../secret.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/%2e%2e/secret.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/" + String.fromCharCode(92) + "secret.pdf"), false);
  assert.equal(isPrivateHomeworkBlobPath("homework/file.pdf?download=1"), false);
  assert.equal(isPrivateHomeworkBlobPath("other/file.pdf"), false);

  assert.equal(getHomeworkFileStorageDecision({ storagePath: null, privateBlobToken: "token" }), "no-file");
  assert.equal(getHomeworkFileStorageDecision({ storagePath: "https://public.blob.vercel-storage.com/old.pdf", privateBlobToken: "token" }), "legacy-public-url");
  assert.equal(getHomeworkFileStorageDecision({ storagePath: "homework/../old.pdf", privateBlobToken: "token" }), "invalid-private-path");
  assert.equal(getHomeworkFileStorageDecision({ storagePath: "homework/private.pdf", privateBlobToken: null }), "private-storage-not-configured");
  assert.equal(getHomeworkFileStorageDecision({ storagePath: "homework/private.pdf", privateBlobToken: "token" }), "stream-private");
});

const routeSource = readFileSync(new URL("../app/api/homework/file/[id]/route.ts", import.meta.url), "utf8");

test("homework file route authenticates and rejects unsupported roles before database setup", () => {
  const auth = routeSource.indexOf("const ctx = await getAuthContext(req)");
  const unauth = routeSource.indexOf("if (!ctx)", auth);
  const roleGate = routeSource.indexOf('if (!["teacher", "admin", "student"].includes(ctx.user.role))', unauth);
  const setup = routeSource.indexOf("await ensureDbSetup()");
  assert.ok(auth >= 0 && unauth > auth && roleGate > unauth && setup > roleGate);
});

test("homework file route revalidates database ownership after private Blob lookup and never redirects legacy URLs", () => {
  assert.match(routeSource, /\.leftJoin\(courses, eq\(homework\.courseId, courses\.id\)\)/);
  assert.ok((routeSource.match(/loadHomeworkFileContext\(/g) || []).length >= 3,
    "the route must load authorization context before and after private Blob lookup");
  assert.match(routeSource, /access:\s*"private",\s*token:\s*privateBlobToken/);
  assert.match(routeSource, /Cache-Control":\s*"private, no-store"/);
  assert.match(routeSource, /X-Content-Type-Options":\s*"nosniff"/);
  assert.doesNotMatch(routeSource, /NextResponse\.redirect\s*\(/);
  assert.match(routeSource, /legacy-public-url/);
  assert.match(routeSource, /details withheld/);
});
