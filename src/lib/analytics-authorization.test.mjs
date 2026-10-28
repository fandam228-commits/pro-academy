import test from "node:test";
import assert from "node:assert/strict";
import { canAccessStudentAnalytics } from "./analytics-authorization.mjs";

test("admin can access a student's analytics", () => {
  assert.equal(
    canAccessStudentAnalytics({ role: "admin", requesterId: "admin-1", studentId: "student-1" }),
    true
  );
});

test("teacher can access analytics only for students enrolled in the teacher's courses", () => {
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

test("teacher with no owned-course enrollments cannot access student reports", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: [],
    }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
    }),
    false
  );
});

test("teacher cannot bypass enrollment scope by targeting their own identifier", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "teacher-1",
      teacherStudentIds: [],
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

test("parent with no linked children cannot access a student report", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
      linkedParentStudentIds: [],
    }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
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

test("missing requester identity is denied for non-admin roles", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "",
      studentId: "student-1",
      teacherStudentIds: ["student-1"],
    }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: undefined,
      studentId: "student-1",
      linkedParentStudentIds: ["student-1"],
    }),
    false
  );
});

test("unknown roles and missing identifiers are denied", () => {
  assert.equal(
    canAccessStudentAnalytics({ role: "staff", requesterId: "staff-1", studentId: "student-1" }),
    false
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "teacher", requesterId: "teacher-1", studentId: "" }),
    false
  );
});
