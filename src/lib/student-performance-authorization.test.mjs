import test from "node:test";
import assert from "node:assert/strict";
import { resolveStudentPerformanceAccess } from "./student-performance-authorization.mjs";

test("students can access only their own performance history", () => {
  assert.deepEqual(
    resolveStudentPerformanceAccess({ role: "student", requesterId: "s-1", requestedStudentId: null }),
    { allowed: true, studentId: "s-1" }
  );
  assert.deepEqual(
    resolveStudentPerformanceAccess({ role: "student", requesterId: "s-1", requestedStudentId: "s-1" }),
    { allowed: true, studentId: "s-1" }
  );
  assert.equal(
    resolveStudentPerformanceAccess({ role: "student", requesterId: "s-1", requestedStudentId: "s-2" }).allowed,
    false
  );
});

test("parents can access only a student confirmed by an exact parent-link lookup", () => {
  assert.deepEqual(
    resolveStudentPerformanceAccess({
      role: "parent",
      requesterId: "p-1",
      requestedStudentId: "s-1",
      parentLinked: true,
    }),
    { allowed: true, studentId: "s-1" }
  );
  assert.equal(
    resolveStudentPerformanceAccess({
      role: "parent",
      requesterId: "p-1",
      requestedStudentId: "s-2",
      parentLinked: false,
    }).allowed,
    false
  );
  assert.equal(
    resolveStudentPerformanceAccess({
      role: "parent",
      requesterId: "p-1",
      requestedStudentId: "s-1",
      parentLinked: "true",
    }).allowed,
    false
  );
});

test("teachers can access only students with an enrollment in a course they own", () => {
  assert.deepEqual(
    resolveStudentPerformanceAccess({
      role: "teacher",
      requesterId: "t-1",
      requestedStudentId: "s-1",
      teacherEnrolled: true,
    }),
    { allowed: true, studentId: "s-1" }
  );
  assert.equal(
    resolveStudentPerformanceAccess({
      role: "teacher",
      requesterId: "t-1",
      requestedStudentId: "s-2",
      teacherEnrolled: false,
    }).allowed,
    false
  );
  assert.equal(
    resolveStudentPerformanceAccess({
      role: "teacher",
      requesterId: "t-1",
      requestedStudentId: "s-1",
      teacherEnrolled: 1,
    }).allowed,
    false
  );
});

test("admins can access a specified student's performance history", () => {
  assert.deepEqual(
    resolveStudentPerformanceAccess({ role: "admin", requesterId: "a-1", requestedStudentId: "s-1" }),
    { allowed: true, studentId: "s-1" }
  );
});

test("missing targets, invalid identities, and unsupported roles fail closed", () => {
  assert.deepEqual(
    resolveStudentPerformanceAccess({ role: "teacher", requesterId: "t-1" }),
    { allowed: false, reason: "student_required" }
  );
  assert.deepEqual(
    resolveStudentPerformanceAccess({ role: "admin", requesterId: "a-1", requestedStudentId: "" }),
    { allowed: false, reason: "student_required" }
  );
  assert.deepEqual(
    resolveStudentPerformanceAccess({ role: "staff", requesterId: "x-1", requestedStudentId: "s-1" }),
    { allowed: false, reason: "forbidden" }
  );
  assert.deepEqual(resolveStudentPerformanceAccess(), { allowed: false, reason: "invalid_identity" });
});
