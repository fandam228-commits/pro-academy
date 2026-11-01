import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeFiles = {
  reports: await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8"),
  attendance: await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8"),
  parent: await readFile(new URL("../app/api/parent/route.ts", import.meta.url), "utf8"),
};

function assertAuthBeforeSetup(source, routeName) {
  const handlerStart = source.indexOf("export async function GET(req: Request)");
  assert.notEqual(handlerStart, -1, `${routeName} GET handler must exist`);
  const handler = source.slice(handlerStart);
  const auth = handler.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = handler.indexOf("if (!ctx)", auth);
  const setup = handler.indexOf("await ensureDbSetup()");
  assert.ok(auth >= 0 && unauthorized > auth && setup > unauthorized,
    `${routeName} must authenticate before database setup`);
}

function assertVerifiedParentSelection(source, routeName) {
  assert.match(source, /innerJoin\\(verifiedByUser, eq\\(parentLinks\\.verifiedBy, verifiedByUser\\.id\\)\\)/,
    `${routeName} must join the current verifier account`);
  assert.match(source, /eq\\(verifiedByUser\\.role, "admin"\\)/,
    `${routeName} must require a current admin verifier`);
  assert.match(source, /eq\\(users\\.role, "student"\\)/,
    `${routeName} must require a current student account`);
  assert.match(source, /isNotNull\\(parentLinks\\.verifiedAt\\)/);
  assert.match(source, /isNotNull\\(parentLinks\\.verifiedBy\\)/);
  assert.match(source, /getVerifiedParentAnalyticsStudentIds\\(links\\)/);
  assert.match(source, /resolveParentAnalyticsStudentId\\((?:requestedStudent|studentId), linkedStudentIds\\)/);
  assert.doesNotMatch(source, /links\\s*\\[\\s*0\\s*\\]\\s*\\??\\.\\s*studentId/,
    `${routeName} must not silently select the first linked child`);
}

test("student reports authenticate before setup and verify parent links", () => {
  assertAuthBeforeSetup(routeFiles.reports, "reports");
  assertVerifiedParentSelection(routeFiles.reports, "reports");
});

test("attendance authenticates before setup and verifies parent links", () => {
  assertAuthBeforeSetup(routeFiles.attendance, "attendance");
  assertVerifiedParentSelection(routeFiles.attendance, "attendance");
});

test("parent overview requires verified explicit child selection and never returns the full users row", () => {
  assertAuthBeforeSetup(routeFiles.parent, "parent overview");
  assertVerifiedParentSelection(routeFiles.parent, "parent overview");
  assert.doesNotMatch(routeFiles.parent, /db\\.select\\(\\)\\.from\\(users\\)/,
    "parent overview must not hydrate/return password and unrelated private user columns");
  assert.match(routeFiles.parent, /id:\\s*users\\.id[\\s\\S]*name:\\s*users\\.name[\\s\\S]*grade:\\s*users\\.grade/,
    "parent overview must project only an explicit student profile allowlist");
});

test("teacher student report scope requires owned-course enrollment and excludes unscopable data", () => {
  assert.match(routeFiles.reports, /eq\\(courses\\.teacherId, ctx\\.user\\.id\\)/);
  assert.match(routeFiles.reports, /inArray\\(enrollments\\.status, \\["active", "completed"\\]\\)/);
  assert.match(routeFiles.reports, /eq\\(homework\\.teacherId, ctx\\.user\\.id\\)/);
  assert.match(routeFiles.reports, /inArray\\(homeworkSubmissions\\.homeworkId, visibleHomeworkIds!\\)/);
  assert.match(routeFiles.reports, /inArray\\(quizSubmissions\\.quizId, visibleQuizIds!\\)/);
  assert.match(routeFiles.reports, /const overallRate = role === "teacher" \\? null :/,
    "teacher reports must not fabricate a 100% attendance rate when attendance cannot be scoped");
  assert.match(routeFiles.reports, /role === "teacher" \\? \\[\\] : await db\\.select\\(\\)\\.from\\(attendanceRecords\\)/,
    "attendance has no course ownership key and must be omitted from teacher reports");
  assert.match(routeFiles.reports, /role === "teacher" \\? null : \\(student\\.points \\|\\| 0\\)/,
    "global gamification values must not be exposed in teacher reports");
});

test("teacher attendance bulk marking rejects students outside owned-course enrollments", () => {
  assert.match(routeFiles.attendance, /eq\\(courses\\.teacherId, ctx\\.user\\.id\\)/);
  assert.match(routeFiles.attendance, /allowedStudentIds\\.has\\(mark\\.studentId\\)/);
  assert.match(routeFiles.attendance, /Attendance includes a student outside your owned courses/);
});
