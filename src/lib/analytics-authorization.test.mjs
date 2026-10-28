import test from "node:test";
import assert from "node:assert/strict";
import { canAccessStudentAnalytics } from "./analytics-authorization.mjs";

test("admin can access a student's analytics", () => {
  assert.equal(
    canAccessStudentAnalytics({ role: "admin", requesterId: "admin-1", studentId: "student-1" }),
    true
  );
});

test("teacher can access analytics only for exact student IDs in owned-course enrollments", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: ["student-1", "student-2"],
    }),
    true
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-3",
      teacherStudentIds: ["student-1", "student-2"],
    }),
    false
  );
});

test("parent can access only explicitly linked students", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
      linkedParentStudentIds: ["student-1"],
    }),
    true
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-2",
      linkedParentStudentIds: ["student-1"],
    }),
    false
  );
});

test("student can access only their own analytics", () => {
  assert.equal(
    canAccessStudentAnalytics({ role: "student", requesterId: "student-1", studentId: "student-1" }),
    true
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "student", requesterId: "student-1", studentId: "student-2" }),
    false
  );
});

test("malformed relationship collections fail closed instead of matching partial IDs", () => {
  // A string has substring semantics; it must never be accepted as an ID list.
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: "student-10",
    }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
      linkedParentStudentIds: "student-10",
    }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: null,
    }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
      linkedParentStudentIds: [{ id: "student-1" }, 1, null],
    }),
    false
  );
});

test("missing or non-string identity fields and unknown roles are denied", () => {
  assert.equal(
    canAccessStudentAnalytics({ role: "staff", requesterId: "staff-1", studentId: "student-1" }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "teacher", requesterId: "teacher-1", studentId: "" }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "teacher", requesterId: 123, studentId: "student-1", teacherStudentIds: ["student-1"] }),
    false
  );
  assert.equal(canAccessStudentAnalytics(), false);
});
