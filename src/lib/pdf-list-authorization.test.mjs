import test from "node:test";
import assert from "node:assert/strict";
import { canListPdfDocument, toPublicPdfMetadata } from "./pdf-list-authorization.mjs";

const base = {
  requesterId: "teacher-1",
  uploaderId: "teacher-1",
  documentCourseId: "course-1",
  courseTeacherId: "teacher-1",
  documentGrade: "Third Secondary",
  studentGrade: "Third Secondary",
  isProtected: true,
  activeCourseIds: [],
  linkedStudentGrades: [],
};

test("admins can list all PDF metadata", () => {
  assert.equal(canListPdfDocument({ ...base, role: "admin", courseTeacherId: "other" }), true);
});

test("teachers see course-linked PDFs only for courses they own", () => {
  assert.equal(canListPdfDocument({ ...base, role: "teacher" }), true);
  assert.equal(canListPdfDocument({ ...base, role: "teacher", courseTeacherId: "teacher-2" }), false);
  assert.equal(canListPdfDocument({ ...base, role: "teacher", courseTeacherId: null }), false);
});

test("teachers see course-less PDFs only when they uploaded them", () => {
  assert.equal(canListPdfDocument({ ...base, role: "teacher", documentCourseId: null }), true);
  assert.equal(canListPdfDocument({ ...base, role: "teacher", documentCourseId: null, uploaderId: "teacher-2" }), false);
});

test("students must have enrollment for course-linked PDFs regardless of protection flag", () => {
  assert.equal(canListPdfDocument({ ...base, role: "student", activeCourseIds: ["course-1"], isProtected: false }), true);
  assert.equal(canListPdfDocument({ ...base, role: "student", activeCourseIds: ["course-2"], isProtected: false }), false);
  assert.equal(canListPdfDocument({ ...base, role: "student", activeCourseIds: [] }), false);
});

test("students see protected course-less PDFs only for their own grade", () => {
  assert.equal(canListPdfDocument({ ...base, role: "student", documentCourseId: null }), true);
  assert.equal(canListPdfDocument({ ...base, role: "student", documentCourseId: null, documentGrade: "First Prep" }), false);
});

test("parents see linked-course PDFs only when a linked child is enrolled", () => {
  assert.equal(canListPdfDocument({ ...base, role: "parent", activeCourseIds: ["course-1"] }), true);
  assert.equal(canListPdfDocument({ ...base, role: "parent", activeCourseIds: ["course-2"] }), false);
});

test("parents see protected course-less PDFs only for a linked child's grade", () => {
  assert.equal(canListPdfDocument({ ...base, role: "parent", documentCourseId: null, linkedStudentGrades: ["Third Secondary"] }), true);
  assert.equal(canListPdfDocument({ ...base, role: "parent", documentCourseId: null, linkedStudentGrades: ["First Prep"] }), false);
  assert.equal(canListPdfDocument({ ...base, role: "parent", documentCourseId: null, linkedStudentGrades: [] }), false);
});

test("unknown roles are denied", () => {
  assert.equal(canListPdfDocument({ ...base, role: "visitor" }), false);
});

test("public metadata omits file contents, internal paths, external URLs, and uploader IDs", () => {
  const safe = toPublicPdfMetadata({
    id: "pdf-1",
    title: "Unit notes",
    uploaderId: "teacher-1",
    fileData: "base64-private",
    storagePath: "/srv/private/notes.pdf",
    externalUrl: "https://example.invalid/private.pdf",
    courseId: "course-1",
  });
  assert.deepEqual(safe, { id: "pdf-1", title: "Unit notes", courseId: "course-1" });
});

test("metadata sanitizer rejects non-object payloads", () => {
  assert.equal(toPublicPdfMetadata(null), null);
  assert.equal(toPublicPdfMetadata([]), null);
});
