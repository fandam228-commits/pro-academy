import test from "node:test";
import assert from "node:assert/strict";
import {
  canAttachPdfToCourse,
  canManagePdfDocument,
  canStudentAccessPdf,
} from "./pdf-authorization.mjs";

test("admins can manage any PDF; teachers can manage only trusted new records they own", () => {
  assert.equal(canManagePdfDocument({ role: "admin", requesterId: "admin-1", uploaderId: "teacher-1", documentId: "pdf_legacy" }), true);
  assert.equal(canManagePdfDocument({ role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-1", documentId: "pdfu_new" }), true);
  assert.equal(canManagePdfDocument({ role: "teacher", requesterId: "teacher-2", uploaderId: "teacher-1", documentId: "pdfu_new" }), false);
  assert.equal(canManagePdfDocument({ role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-1", documentId: "pdf_legacy" }), false);
  assert.equal(canManagePdfDocument({ role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-1", documentId: "pdf_ext_legacy" }), false);
  assert.equal(canManagePdfDocument({ role: "student", requesterId: "student-1", uploaderId: "student-1", documentId: "pdfu_new" }), false);
});

test("course-linked PDF mutations also require verified course ownership", () => {
  const base = { role: "teacher", requesterId: "teacher-1", uploaderId: "teacher-1", documentId: "pdfu_new", documentCourseId: "course-1" };
  assert.equal(canManagePdfDocument({ ...base, courseTeacherId: "teacher-1" }), true);
  assert.equal(canManagePdfDocument({ ...base, courseTeacherId: "teacher-2" }), false);
  assert.equal(canManagePdfDocument({ ...base, courseTeacherId: null }), false);
});

test("teachers may attach course PDFs only to courses they own", () => {
  assert.equal(canAttachPdfToCourse({ role: "admin", requesterId: "admin-1", courseTeacherId: "teacher-1" }), true);
  assert.equal(canAttachPdfToCourse({ role: "teacher", requesterId: "teacher-1", courseTeacherId: "teacher-1" }), true);
  assert.equal(canAttachPdfToCourse({ role: "teacher", requesterId: "teacher-2", courseTeacherId: "teacher-1" }), false);
  assert.equal(canAttachPdfToCourse({ role: "student", requesterId: "student-1", courseTeacherId: "teacher-1" }), false);
});

test("students must be enrolled to access course-linked PDFs", () => {
  const base = { studentGrade: "Third Secondary", documentGrade: "Third Secondary", documentCourseId: "course-1", isProtected: true };
  assert.equal(canStudentAccessPdf({ ...base, activeCourseIds: ["course-1"] }), true);
  assert.equal(canStudentAccessPdf({ ...base, activeCourseIds: ["course-2"] }), false);
  assert.equal(canStudentAccessPdf({ ...base, activeCourseIds: [] }), false);
});

test("protected course-less PDFs are limited to the student's grade", () => {
  assert.equal(canStudentAccessPdf({ studentGrade: "Third Prep", documentGrade: "Third Prep", isProtected: true }), true);
  assert.equal(canStudentAccessPdf({ studentGrade: "Third Prep", documentGrade: "First Secondary", isProtected: true }), false);
  assert.equal(canStudentAccessPdf({ studentGrade: null, documentGrade: "Third Prep", isProtected: true }), false);
});

test("unprotected course-less PDFs remain accessible", () => {
  assert.equal(canStudentAccessPdf({ documentGrade: "Third Prep", isProtected: false }), true);
});
