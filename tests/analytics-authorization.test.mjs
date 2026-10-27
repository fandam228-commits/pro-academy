import test from "node:test";
import assert from "node:assert/strict";
import { canAccessStudentAnalytics } from "../src/lib/analytics-authorization.mjs";

test("teacher cannot access a student who is not enrolled in a course they teach", () => {
  assert.equal(canAccessStudentAnalytics({
    role: "teacher", requesterId: "teacher-1", studentId: "student-2",
    teacherStudentIds: ["student-1"],
  }), false);
});

test("teacher can access a student enrolled in their course", () => {
  assert.equal(canAccessStudentAnalytics({
    role: "teacher", requesterId: "teacher-1", studentId: "student-1",
    teacherStudentIds: ["student-1"],
  }), true);
});

test("parent cannot access a student without a parent link", () => {
  assert.equal(canAccessStudentAnalytics({
    role: "parent", requesterId: "parent-1", studentId: "student-2",
    linkedParentStudentIds: ["student-1"],
  }), false);
});

test("parent can access a linked student's report only", () => {
  assert.equal(canAccessStudentAnalytics({
    role: "parent", requesterId: "parent-1", studentId: "student-1",
    linkedParentStudentIds: ["student-1"],
  }), true);
});

test("student can access only their own report", () => {
  assert.equal(canAccessStudentAnalytics({
    role: "student", requesterId: "student-1", studentId: "student-2",
  }), false);
  assert.equal(canAccessStudentAnalytics({
    role: "student", requesterId: "student-1", studentId: "student-1",
  }), true);
});

test("unknown roles and incomplete identities are denied", () => {
  assert.equal(canAccessStudentAnalytics({
    role: "staff", requesterId: "staff-1", studentId: "student-1",
  }), false);
  assert.equal(canAccessStudentAnalytics({
    role: "teacher", requesterId: "teacher-1", studentId: "",
  }), false);
});
