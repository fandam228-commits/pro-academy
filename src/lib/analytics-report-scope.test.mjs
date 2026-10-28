import test from "node:test";
import assert from "node:assert/strict";
import {
  getTeacherAnalyticsStudentIds,
  getTeacherAnalyticsCourseIds,
  isTeacherScopedHomework,
  isCourseScopedQuiz,
  resolveParentAnalyticsStudentId,
  isAnalyticsStudentAccount,
} from "./analytics-report-scope.mjs";

const enrollmentRows = [
  { studentId: "student-1", courseId: "course-a", teacherId: "teacher-1", status: "active" },
  { studentId: "student-1", courseId: "course-b", teacherId: "teacher-2", status: "active" },
  { studentId: "student-2", courseId: "course-c", teacherId: "teacher-1", status: "completed" },
  { studentId: "student-3", courseId: "course-d", teacherId: "teacher-1", status: "cancelled" },
  { studentId: "student-4", courseId: "course-e", teacherId: "teacher-1", status: null },
];

test("teacher student list includes only active/completed enrollments in owned courses", () => {
  assert.deepEqual(
    getTeacherAnalyticsStudentIds(enrollmentRows, "teacher-1"),
    ["student-1", "student-2"]
  );
});

test("teacher report scope contains only the target student's owned-course enrollments", () => {
  assert.deepEqual(
    getTeacherAnalyticsCourseIds(enrollmentRows, "teacher-1", "student-1"),
    ["course-a"]
  );
  assert.deepEqual(
    getTeacherAnalyticsCourseIds(enrollmentRows, "teacher-1", "student-3"),
    []
  );
});

test("homework is visible only when both owner and course match", () => {
  const allowed = ["course-a"];
  assert.equal(isTeacherScopedHomework({
    id: "hw-1", teacherId: "teacher-1", courseId: "course-a",
  }, "teacher-1", allowed), true);
  assert.equal(isTeacherScopedHomework({
    id: "hw-2", teacherId: "teacher-2", courseId: "course-a",
  }, "teacher-1", allowed), false);
  assert.equal(isTeacherScopedHomework({
    id: "hw-3", teacherId: "teacher-1", courseId: "course-b",
  }, "teacher-1", allowed), false);
  assert.equal(isTeacherScopedHomework({
    id: "hw-4", teacherId: "teacher-1", courseId: null,
  }, "teacher-1", allowed), false);
});

test("quiz results are scoped to explicitly linked authorized courses", () => {
  assert.equal(isCourseScopedQuiz({ id: "quiz-1", courseId: "course-a" }, ["course-a"]), true);
  assert.equal(isCourseScopedQuiz({ id: "quiz-2", courseId: "course-b" }, ["course-a"]), false);
  assert.equal(isCourseScopedQuiz({ id: "quiz-3", courseId: null }, ["course-a"]), false);
  assert.equal(isCourseScopedQuiz({ id: "quiz-4" }, ["course-a"]), false);
});

test("malformed enrollment inputs fail closed", () => {
  assert.deepEqual(getTeacherAnalyticsStudentIds("invalid", "teacher-1"), []);
  assert.deepEqual(getTeacherAnalyticsCourseIds(enrollmentRows, "teacher-1", ""), []);
});

test("parent analytics resolves an explicitly selected linked student only", () => {
  assert.deepEqual(
    resolveParentAnalyticsStudentId("student-2", ["student-1", "student-2"]),
    { ok: true, studentId: "student-2" }
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId("student-3", ["student-1", "student-2"]),
    { ok: false, reason: "forbidden" }
  );
});

test("parent analytics requires studentId when multiple distinct children are linked", () => {
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1", "student-2"]),
    { ok: false, reason: "student-id-required" }
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1", "student-1"]),
    { ok: true, studentId: "student-1" }
  );
});

test("parent analytics handles no links and malformed relationship data fail-closed", () => {
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, []),
    { ok: false, reason: "no-linked-student" }
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, "student-1"),
    { ok: false, reason: "invalid-links" }
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1", null]),
    { ok: false, reason: "invalid-links" }
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId("", ["student-1"]),
    { ok: false, reason: "invalid-student-id" }
  );
});

test("only user records whose role is student may be analytics targets", () => {
  assert.equal(isAnalyticsStudentAccount({ id: "student-1", role: "student" }), true);
  assert.equal(isAnalyticsStudentAccount({ id: "teacher-1", role: "teacher" }), false);
  assert.equal(isAnalyticsStudentAccount({ id: "parent-1", role: "parent" }), false);
  assert.equal(isAnalyticsStudentAccount({ id: "admin-1", role: "admin" }), false);
  assert.equal(isAnalyticsStudentAccount({ id: "student-1" }), false);
  assert.equal(isAnalyticsStudentAccount(null), false);
  assert.equal(isAnalyticsStudentAccount({ id: " ", role: "student" }), false);
});
