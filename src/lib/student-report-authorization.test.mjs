import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessStudentReport,
  getTeacherStudentIds,
  getTeacherCourseIdsForStudent,
  isTeacherOwnedHomework,
  isTeacherCourseRecord,
} from "./student-report-authorization.mjs";

test("student report access is self-only", () => {
  assert.equal(canAccessStudentReport({
    role: "student", requesterId: "student-1", studentId: "student-1",
  }), true);
  assert.equal(canAccessStudentReport({
    role: "student", requesterId: "student-1", studentId: "student-2",
  }), false);
});

test("parent report access requires an exact linked student id", () => {
  assert.equal(canAccessStudentReport({
    role: "parent", requesterId: "parent-1", studentId: "student-1",
    linkedParentStudentIds: ["student-1", "student-10"],
  }), true);
  assert.equal(canAccessStudentReport({
    role: "parent", requesterId: "parent-1", studentId: "student-10",
    linkedParentStudentIds: ["student-1"],
  }), false);
});

test("teacher report access requires an enrolled student in an owned course", () => {
  const enrollments = [
    { studentId: "student-1", courseId: "course-a", teacherId: "teacher-1", status: "active" },
    { studentId: "student-2", courseId: "course-b", teacherId: "teacher-2", status: "active" },
    { studentId: "student-3", courseId: "course-c", teacherId: "teacher-1", status: "cancelled" },
    { studentId: "student-4", courseId: "course-d", teacherId: "teacher-1", status: "completed" },
  ];
  const visibleStudentIds = getTeacherStudentIds(enrollments, "teacher-1");

  assert.deepEqual(visibleStudentIds, ["student-1", "student-4"]);
  assert.equal(canAccessStudentReport({
    role: "teacher", requesterId: "teacher-1", studentId: "student-1",
    teacherStudentIds: visibleStudentIds,
  }), true);
  assert.equal(canAccessStudentReport({
    role: "teacher", requesterId: "teacher-1", studentId: "student-2",
    teacherStudentIds: visibleStudentIds,
  }), false);
  assert.equal(canAccessStudentReport({
    role: "teacher", requesterId: "teacher-1", studentId: "student-3",
    teacherStudentIds: visibleStudentIds,
  }), false);
});

test("teacher course scope includes only the requested student's eligible courses", () => {
  const enrollments = [
    { studentId: "student-1", courseId: "course-a", teacherId: "teacher-1", status: "active" },
    { studentId: "student-1", courseId: "course-b", teacherId: "teacher-2", status: "active" },
    { studentId: "student-2", courseId: "course-c", teacherId: "teacher-1", status: "active" },
    { studentId: "student-1", courseId: "course-d", teacherId: "teacher-1", status: "cancelled" },
  ];

  assert.deepEqual(getTeacherCourseIdsForStudent(enrollments, "teacher-1", "student-1"), ["course-a"]);
});

test("teacher homework must be owned by the teacher and tied to an authorized course", () => {
  const allowedCourseIds = ["course-a"];
  assert.equal(isTeacherOwnedHomework({
    id: "hw-1", teacherId: "teacher-1", courseId: "course-a",
  }, "teacher-1", allowedCourseIds), true);
  assert.equal(isTeacherOwnedHomework({
    id: "hw-2", teacherId: "teacher-2", courseId: "course-a",
  }, "teacher-1", allowedCourseIds), false);
  assert.equal(isTeacherOwnedHomework({
    id: "hw-3", teacherId: "teacher-1", courseId: "course-b",
  }, "teacher-1", allowedCourseIds), false);
  assert.equal(isTeacherOwnedHomework({
    id: "hw-4", teacherId: "teacher-1", courseId: null,
  }, "teacher-1", allowedCourseIds), false);
});

test("teacher quiz records must belong to an authorized course", () => {
  assert.equal(isTeacherCourseRecord({ id: "quiz-1", courseId: "course-a" }, ["course-a"]), true);
  assert.equal(isTeacherCourseRecord({ id: "quiz-2", courseId: "course-b" }, ["course-a"]), false);
  assert.equal(isTeacherCourseRecord({ id: "quiz-3", courseId: null }, ["course-a"]), false);
});

test("invalid identifiers and malformed relationship arrays fail closed", () => {
  assert.equal(canAccessStudentReport({
    role: "teacher", requesterId: "teacher-1", studentId: "student-1",
    teacherStudentIds: "student-1",
  }), false);
  assert.equal(canAccessStudentReport({
    role: "parent", requesterId: "parent-1", studentId: "student-1",
    linkedParentStudentIds: ["student-1", 1],
  }), false);
  assert.equal(canAccessStudentReport({
    role: "admin", requesterId: " ", studentId: "student-1",
  }), false);
  assert.deepEqual(getTeacherStudentIds("not-an-array", "teacher-1"), []);
  assert.deepEqual(getTeacherCourseIdsForStudent([], "teacher-1", ""), []);
});
