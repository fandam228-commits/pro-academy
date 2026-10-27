import test from "node:test";
import assert from "node:assert/strict";
import {
  canManageAttendanceStudent,
  canSelfCheckIn,
  isValidAttendanceStatus,
} from "./attendance-authorization.mjs";

test("teacher can manage attendance only for students enrolled in a course they own", () => {
  assert.equal(
    canManageAttendanceStudent({
      role: "teacher",
      studentId: "student-1",
      teacherStudentIds: ["student-1", "student-2"],
    }),
    true
  );
  assert.equal(
    canManageAttendanceStudent({
      role: "teacher",
      studentId: "student-3",
      teacherStudentIds: ["student-1", "student-2"],
    }),
    false
  );
});

test("admin can manage any identified student but missing targets are denied", () => {
  assert.equal(canManageAttendanceStudent({ role: "admin", studentId: "student-99" }), true);
  assert.equal(canManageAttendanceStudent({ role: "admin", studentId: "" }), false);
});

test("non-teacher roles cannot use teacher roster management policy", () => {
  assert.equal(canManageAttendanceStudent({ role: "parent", studentId: "student-1" }), false);
  assert.equal(canManageAttendanceStudent({ role: "student", studentId: "student-1" }), false);
  assert.equal(canManageAttendanceStudent({ role: "staff", studentId: "student-1" }), false);
});

test("only student accounts can self check in", () => {
  assert.equal(canSelfCheckIn("student"), true);
  assert.equal(canSelfCheckIn("teacher"), false);
  assert.equal(canSelfCheckIn("parent"), false);
  assert.equal(canSelfCheckIn("admin"), false);
  assert.equal(canSelfCheckIn("staff"), false);
});

test("attendance statuses are restricted to supported values", () => {
  for (const status of ["present", "late", "absent", "excused"]) {
    assert.equal(isValidAttendanceStatus(status), true);
  }
  assert.equal(isValidAttendanceStatus("admin"), false);
  assert.equal(isValidAttendanceStatus(""), false);
  assert.equal(isValidAttendanceStatus(undefined), false);
});
