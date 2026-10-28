import test from "node:test";
import assert from "node:assert/strict";
import { scopeTeacherWeeklyReportData } from "./teacher-report-scope.mjs";

test("teacher report excludes attendance marked by another teacher or by student self-check-in", () => {
  const scoped = scopeTeacherWeeklyReportData({
    teacherId: "teacher-1",
    attendanceRecords: [
      { id: "a1", markedBy: "teacher-1" },
      { id: "a2", markedBy: "teacher-2" },
      { id: "a3", markedBy: "self" },
      { id: "a4", markedBy: "teacher" },
    ],
  });
  assert.deepEqual(scoped.attendanceRecords.map((row) => row.id), ["a1"]);
});

test("teacher report includes only homework they own and that is not attached to another teacher's course", () => {
  const scoped = scopeTeacherWeeklyReportData({
    teacherId: "teacher-1",
    teacherCourseIds: ["course-1"],
    homeworkRows: [
      { id: "hw-own-course", teacherId: "teacher-1", courseId: "course-1" },
      { id: "hw-own-general", teacherId: "teacher-1", courseId: null },
      { id: "hw-other-teacher", teacherId: "teacher-2", courseId: "course-1" },
      { id: "hw-foreign-course", teacherId: "teacher-1", courseId: "course-2" },
    ],
    homeworkSubmissions: [
      { id: "s1", homeworkId: "hw-own-course" },
      { id: "s2", homeworkId: "hw-own-general" },
      { id: "s3", homeworkId: "hw-other-teacher" },
      { id: "s4", homeworkId: "hw-foreign-course" },
    ],
  });
  assert.deepEqual(scoped.homeworkRows.map((row) => row.id), ["hw-own-course", "hw-own-general"]);
  assert.deepEqual(scoped.homeworkSubmissions.map((row) => row.id), ["s1", "s2"]);
});

test("teacher report includes quiz results only for quizzes in owned courses", () => {
  const scoped = scopeTeacherWeeklyReportData({
    teacherId: "teacher-1",
    teacherCourseIds: ["course-1"],
    quizzes: [
      { id: "q1", courseId: "course-1" },
      { id: "q2", courseId: "course-2" },
      { id: "q3", courseId: null },
    ],
    quizSubmissions: [
      { id: "qs1", quizId: "q1" },
      { id: "qs2", quizId: "q2" },
      { id: "qs3", quizId: "q3" },
    ],
  });
  assert.deepEqual(scoped.quizzes.map((row) => row.id), ["q1"]);
  assert.deepEqual(scoped.quizSubmissions.map((row) => row.id), ["qs1"]);
});

test("teacher report exposes only owned courses in which the student is enrolled", () => {
  const scoped = scopeTeacherWeeklyReportData({
    teacherId: "teacher-1",
    teacherCourseIds: ["course-1", "course-2"],
    enrollments: [
      { courseId: "course-1" },
      { courseId: "course-3" },
    ],
    courses: [
      { id: "course-1", title: "Owned course" },
      { id: "course-2", title: "Owned but not enrolled" },
      { id: "course-3", title: "Foreign course" },
    ],
  });
  assert.deepEqual(scoped.enrolledCourses.map((row) => row.id), ["course-1"]);
});

test("missing teacher identity fails closed for all scoped report data", () => {
  const scoped = scopeTeacherWeeklyReportData({
    teacherId: "",
    teacherCourseIds: ["course-1"],
    attendanceRecords: [{ id: "a1", markedBy: "teacher-1" }],
    homeworkRows: [{ id: "hw1", teacherId: "teacher-1" }],
    quizzes: [{ id: "q1", courseId: "course-1" }],
  });
  assert.deepEqual(scoped.attendanceRecords, []);
  assert.deepEqual(scoped.homeworkRows, []);
  assert.deepEqual(scoped.homeworkSubmissions, []);
  assert.deepEqual(scoped.quizzes, []);
  assert.deepEqual(scoped.quizSubmissions, []);
  assert.deepEqual(scoped.enrollments, []);
  assert.deepEqual(scoped.enrolledCourses, []);
});
