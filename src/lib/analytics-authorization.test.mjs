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

test("teacher relationship checks require exact IDs in a valid array", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: "student-12",
    }),
    false,
    "a string must not match by substring",
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: ["student-12"],
    }),
    false,
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "teacher",
      requesterId: "teacher-1",
      studentId: "student-1",
      teacherStudentIds: ["student-1", null],
    }),
    false,
    "malformed relationship lists must fail closed",
  );
});

test("parent relationship checks reject malformed or substring-like link lists", () => {
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
      linkedParentStudentIds: "prefix-student-1-suffix",
    }),
    false,
  );
  assert.equal(
    canAccessStudentAnalytics({
      role: "parent",
      requesterId: "parent-1",
      studentId: "student-1",
      linkedParentStudentIds: ["student-1", ""],
    }),
    false,
  );
});

test("invalid policy inputs fail closed without throwing", () => {
  assert.equal(canAccessStudentAnalytics(null), false);
  assert.equal(canAccessStudentAnalytics([]), false);
  assert.equal(
    canAccessStudentAnalytics({ role: "teacher", requesterId: 1, studentId: "student-1", teacherStudentIds: ["student-1"] }),
    false,
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "student", requesterId: "student-1", studentId: " student-1 " }),
    false,
  );
});
