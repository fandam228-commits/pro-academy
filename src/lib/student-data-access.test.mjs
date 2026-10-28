import test from "node:test";
import assert from "node:assert/strict";
import { resolveStudentDataAccess } from "./student-data-access.mjs";

test("student can read only their own report and defaults to self", () => {
  assert.deepEqual(
    resolveStudentDataAccess({ role: "student", requesterId: "student-1" }),
    { allowed: true, studentId: "student-1", reason: null }
  );
  assert.equal(
    resolveStudentDataAccess({
      role: "student", requesterId: "student-1", requestedStudentId: "student-2",
    }).allowed,
    false
  );
});

test("teacher can read only a student enrolled in a course they own", () => {
  assert.equal(
    resolveStudentDataAccess({
      role: "teacher", requesterId: "teacher-1", requestedStudentId: "student-1",
      teacherStudentIds: ["student-1", "student-2"],
    }).allowed,
    true
  );
  assert.equal(
    resolveStudentDataAccess({
      role: "teacher", requesterId: "teacher-1", requestedStudentId: "student-3",
      teacherStudentIds: ["student-1", "student-2"],
    }).allowed,
    false
  );
  assert.equal(
    resolveStudentDataAccess({ role: "teacher", requesterId: "teacher-1" }).reason,
    "student_required"
  );
});

test("parent may choose any linked child, defaults to first linked child, and cannot choose an unlinked child", () => {
  assert.equal(
    resolveStudentDataAccess({
      role: "parent", requesterId: "parent-1",
      linkedParentStudentIds: ["student-1", "student-2"],
    }).studentId,
    "student-1"
  );
  assert.deepEqual(
    resolveStudentDataAccess({
      role: "parent", requesterId: "parent-1", requestedStudentId: "student-2",
      linkedParentStudentIds: ["student-1", "student-2"],
    }),
    { allowed: true, studentId: "student-2", reason: null }
  );
  assert.equal(
    resolveStudentDataAccess({
      role: "parent", requesterId: "parent-1", requestedStudentId: "student-3",
      linkedParentStudentIds: ["student-1", "student-2"],
    }).allowed,
    false
  );
  assert.equal(
    resolveStudentDataAccess({ role: "parent", requesterId: "parent-1" }).reason,
    "no_linked_student"
  );
});

test("admin can request a specific student's report but unsupported roles are denied", () => {
  assert.equal(
    resolveStudentDataAccess({
      role: "admin", requesterId: "admin-1", requestedStudentId: "student-1",
    }).allowed,
    true
  );
  assert.equal(
    resolveStudentDataAccess({
      role: "staff", requesterId: "staff-1", requestedStudentId: "student-1",
    }).allowed,
    false
  );
  assert.equal(
    resolveStudentDataAccess({
      role: "teacher", requesterId: "", requestedStudentId: "student-1",
      teacherStudentIds: ["student-1"],
    }).allowed,
    false
  );
});
