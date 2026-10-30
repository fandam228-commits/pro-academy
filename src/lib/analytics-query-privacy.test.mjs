import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/analytics/route.ts", import.meta.url), "utf8");
const reportStart = routeSource.indexOf("async function buildStudentReport(");
const reportEnd = routeSource.indexOf("function buildClassAnalyticsResponse", reportStart);

test("analytics report profile query uses an explicit field allowlist", () => {
  assert.notEqual(reportStart, -1, "buildStudentReport must exist");
  assert.notEqual(reportEnd, -1, "buildStudentReport must have a bounded source section");
  const reportSource = routeSource.slice(reportStart, reportEnd);

  assert.doesNotMatch(
    reportSource,
    /db\.select\(\)\.from\(users\)/,
    "report generation must not load the entire user row",
  );
  assert.match(reportSource, /id:\s*users\.id/);
  assert.match(reportSource, /name:\s*users\.name/);
  assert.match(reportSource, /grade:\s*users\.grade/);
  assert.match(reportSource, /points:\s*users\.points/);
  assert.match(reportSource, /streak:\s*users\.streak/);
  assert.match(reportSource, /level:\s*users\.level/);
});

test("profile projection includes gamification only for non-teacher reports", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);
  const queryStart = reportSource.indexOf("const userRows: AnalyticsStudentProfile[] = dataVisibility.includeStudentGamification");
  const queryEnd = reportSource.indexOf("const student = userRows[0];", queryStart);
  assert.notEqual(queryStart, -1, "profile projection must use the centralized visibility policy");
  assert.notEqual(queryEnd, -1, "profile projection must have a bounded query block");
  const query = reportSource.slice(queryStart, queryEnd);
  const restrictedBranchStart = query.indexOf(": await db");
  assert.notEqual(restrictedBranchStart, -1, "teacher-safe profile projection must exist");
  const fullProfileBranch = query.slice(0, restrictedBranchStart);
  const restrictedProfileBranch = query.slice(restrictedBranchStart);

  assert.match(fullProfileBranch, /points:\s*users\.points/);
  assert.match(fullProfileBranch, /streak:\s*users\.streak/);
  assert.match(fullProfileBranch, /level:\s*users\.level/);
  assert.doesNotMatch(restrictedProfileBranch, /points:\s*users\.points|streak:\s*users\.streak|level:\s*users\.level/);
  assert.equal((query.match(/eq\(users\.role, "student"\)/g) || []).length, 2,
    "both profile projections must reject non-student and stale accounts");
});

test("teacher-scoped report profile query verifies the account role in SQL", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);
  assert.match(
    reportSource,
    /eq\(users\.role, "student"\)/,
    "teacher-scoped profile lookup must fail closed for non-student or stale accounts",
  );
});
test("parent analytics route requires an admin-verified link to a current student account", () => {
  const parentStart = routeSource.indexOf('if (role === "parent")');
  const studentStart = routeSource.indexOf("// ---------- STUDENT: own report only ----------", parentStart);
  assert.notEqual(parentStart, -1, "parent analytics branch must exist");
  assert.notEqual(studentStart, -1, "student branch must follow the parent branch");
  const parentSource = routeSource.slice(parentStart, studentStart);

  assert.match(parentSource, /\.innerJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/);
  assert.match(parentSource, /\.innerJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/);
  assert.match(parentSource, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(parentSource, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(parentSource, /eq\(users\.role, "student"\)/);
  assert.match(parentSource, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(parentSource, /isNotNull\(parentLinks\.verifiedBy\)/);
  assert.match(parentSource, /getVerifiedParentAnalyticsStudentIds\(links\)/);
});

test("student analytics route authorizes the requested ID but only builds the authenticated student's report", () => {
  const studentStart = routeSource.indexOf("// ---------- STUDENT: own report only ----------");
  assert.notEqual(studentStart, -1, "student analytics branch must exist");
  const studentSource = routeSource.slice(studentStart);

  assert.match(studentSource, /studentId:\s*requestedStudent\s*\|\|\s*ctx\.user\.id/);
  assert.match(studentSource, /if\s*\(!canAccessStudentAnalytics\(/);
  assert.match(studentSource, /const report = await buildStudentReport\(ctx\.user\.id\)/);
  assert.doesNotMatch(studentSource, /buildStudentReport\(requestedStudent\)/);
});

test("teacher reports always pass an owned-course scope to the report builder", () => {
  const teacherStart = routeSource.indexOf('if (role === "teacher")');
  const parentStart = routeSource.indexOf('if (role === "parent")', teacherStart);
  assert.notEqual(teacherStart, -1, "teacher analytics branch must exist");
  assert.notEqual(parentStart, -1, "parent analytics branch must follow teacher branch");
  const teacherSource = routeSource.slice(teacherStart, parentStart);

  assert.match(
    teacherSource,
    /const allowedCourseIds = getTeacherAnalyticsCourseIds\(teacherEnrollmentRows, ctx\.user\.id, requestedStudent\)/,
    "single-student reports must derive the requesting teacher's enrolled-course scope",
  );
  assert.match(
    teacherSource,
    /buildStudentReport\(requestedStudent,\s*\{\s*teacherId:\s*ctx\.user\.id,\s*allowedCourseIds,\s*\}\)/,
    "single-student teacher reports must pass the explicit scope to the builder",
  );
  assert.match(
    teacherSource,
    /buildStudentReport\(student\.id,\s*\{\s*teacherId:\s*ctx\.user\.id,\s*allowedCourseIds:\s*getTeacherAnalyticsCourseIds\(teacherEnrollmentRows,\s*ctx\.user\.id,\s*student\.id\),\s*\}\)/,
    "class reports must pass a per-student owned-course scope to the builder",
  );
  assert.doesNotMatch(
    teacherSource,
    /buildStudentReport\(requestedStudent\)/,
    "teacher-specific report requests must never call the unscoped report builder",
  );
});

test("parent analytics route requires explicit selection when multiple verified children are linked", () => {
  const parentStart = routeSource.indexOf('if (role === "parent")');
  const studentStart = routeSource.indexOf("// ---------- STUDENT: own report only ----------", parentStart);
  assert.notEqual(parentStart, -1, "parent analytics branch must exist");
  assert.notEqual(studentStart, -1, "student analytics branch must follow the parent branch");
  const parentSource = routeSource.slice(parentStart, studentStart);

  assert.match(
    parentSource,
    /resolveParentAnalyticsStudentId\(requestedStudent,\s*linkedParentStudentIds\)/,
    "the route must resolve the requested child against verified linked IDs",
  );
  assert.match(
    parentSource,
    /resolution\.reason === "student-id-required"/,
    "the route must return an explicit-selection error when multiple children are linked",
  );
  assert.doesNotMatch(
    parentSource,
    /links\s*\[\s*0\s*\]\s*\??\.\s*studentId|linkedParentStudentIds\s*\[\s*0\s*\]/,
    "the route must never silently select the first linked child",
  );
});


test("teacher reports scope quiz, homework, submission, and enrollment reads to owned courses", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);
  assert.match(reportSource, /innerJoin\(quizzes, eq\(quizSubmissions\.quizId, quizzes\.id\)\)/);
  assert.match(reportSource, /inArray\(quizzes\.courseId, scope\.allowedCourseIds\)/);
  assert.match(reportSource, /eq\(homework\.teacherId, scope\.teacherId\)/);
  assert.match(reportSource, /inArray\(homework\.courseId, scope\.allowedCourseIds\)/);
  assert.match(reportSource, /eq\(homeworkSubmissions\.studentId, studentId\)/);
  assert.match(reportSource, /inArray\(homeworkSubmissions\.homeworkId, \[\.\.\.visibleHomeworkIds\]\)/);
  assert.match(reportSource, /eq\(enrollments\.studentId, studentId\)/);
  assert.match(reportSource, /inArray\(enrollments\.courseId, scope\.allowedCourseIds\)/);
});

test("teacher reports use the centralized fail-closed visibility policy for unscopable sources", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);

  assert.ok(
    reportSource.includes("const dataVisibility = getAnalyticsReportDataVisibility(scope);"),
    "report generation must derive source visibility from the centralized policy",
  );
  assert.ok(
    reportSource.includes("const attempts = dataVisibility.includeGeneratedExamAttempts"),
    "exam attempts without a reliable course key must be excluded from teacher reports",
  );
  assert.ok(
    reportSource.includes("const attendance = dataVisibility.includeAttendance"),
    "attendance without a teacher/course ownership key must be excluded from teacher reports",
  );
  assert.ok(
    reportSource.includes("const bank = dataVisibility.includeGlobalQuestionBank"),
    "global question-bank records must not be used to derive teacher-scoped mastery",
  );
});
