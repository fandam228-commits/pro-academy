import test from "node:test";
import assert from "node:assert/strict";
import {
  canAssignPdfToCourse,
  canManagePdfDocument,
  isPrivateVercelBlobUrl,
} from "./pdf-authorization.mjs";

test("admins can manage any PDF", () => {
  assert.equal(canManagePdfDocument({
    role: "admin", requesterId: "admin-1", uploaderId: "teacher-2",
    courseId: "course-2", courseTeacherId: "teacher-2",
  }), true);
});

test("teacher can manage an unlinked PDF they uploaded", () => {
  assert.equal(canManagePdfDocument({
    role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-1",
    courseId: null, courseTeacherId: null,
  }), true);
});

test("teacher can manage a course-linked PDF only when they own the course", () => {
  assert.equal(canManagePdfDocument({
    role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-2",
    courseId: "course-1", courseTeacherId: "teacher-1",
  }), true);
  assert.equal(canManagePdfDocument({
    role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-1",
    courseId: "course-2", courseTeacherId: "teacher-2",
  }), false);
});

test("teacher cannot manage an unlinked PDF uploaded by another teacher", () => {
  assert.equal(canManagePdfDocument({
    role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-2",
    courseId: null, courseTeacherId: null,
  }), false);
});

test("students, parents, unknown roles, and missing identities cannot manage PDFs", () => {
  for (const role of ["student", "parent", "unknown"]) {
    assert.equal(canManagePdfDocument({
      role, requesterId: "user-1", uploaderId: "user-1",
      courseId: null, courseTeacherId: null,
    }), false);
  }
  assert.equal(canManagePdfDocument({ role: "teacher", requesterId: "", uploaderId: "teacher-1" }), false);
});

test("teachers can assign a PDF only to their own course; unlinked PDFs are allowed", () => {
  assert.equal(canAssignPdfToCourse({
    role: "teacher", requesterId: "teacher-1", courseId: "course-1", courseTeacherId: "teacher-1",
  }), true);
  assert.equal(canAssignPdfToCourse({
    role: "teacher", requesterId: "teacher-1", courseId: "course-2", courseTeacherId: "teacher-2",
  }), false);
  assert.equal(canAssignPdfToCourse({
    role: "teacher", requesterId: "teacher-1", courseId: null, courseTeacherId: null,
  }), true);
});

test("only HTTPS URLs in Vercel private Blob hosts are accepted", () => {
  assert.equal(isPrivateVercelBlobUrl("https://store-id.private.blob.vercel-storage.com/folder/lesson.pdf"), true);
  assert.equal(isPrivateVercelBlobUrl("https://store-id.public.blob.vercel-storage.com/lesson.pdf"), false);
  assert.equal(isPrivateVercelBlobUrl("http://store-id.private.blob.vercel-storage.com/lesson.pdf"), false);
  assert.equal(isPrivateVercelBlobUrl("https://store-id.private.blob.vercel-storage.com.evil.example/lesson.pdf"), false);
  assert.equal(isPrivateVercelBlobUrl("https://user@store-id.private.blob.vercel-storage.com/lesson.pdf"), false);
  assert.equal(isPrivateVercelBlobUrl("https://store-id.private.blob.vercel-storage.com/lesson.pdf?token=1"), false);
  assert.equal(isPrivateVercelBlobUrl("not a URL"), false);
});
