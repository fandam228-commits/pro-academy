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
  assert.notEqual(handlerStart, -1, routeName + " GET handler must exist");
  const handler = source.slice(handlerStart);
  const auth = handler.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = handler.indexOf("if (!ctx)", auth);
  const setup = handler.indexOf("await ensureDbSetup()");
  assert.ok(auth >= 0 && unauthorized > auth && setup > unauthorized,
    routeName + " must authenticate before database setup");
}

function assertVerifiedParentSelection(source, routeName) {
  assert.match(source, /innerJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/,
    routeName + " must join the current verifier account");
  assert.match(source, /eq\(verifiedByUser\.role, "admin"\)/,
    routeName + " must require a current admin verifier");
  assert.match(source, /eq\(users\.role, "student"\)/,
    routeName + " must require a current student account");
  assert.match(source, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(source, /isNotNull\(parentLinks\.verifiedBy\)/);
  assert.match(source, /getVerifiedParentAnalyticsStudentIds\(links\)/);
  assert.match(source, /resolveParentAnalyticsStudentId\((?:requestedStudent|studentId), linkedStudentIds\)/);
  assert.doesNotMatch(source, /links\s*\[\s*0\s*\]\s*\??\.\s*studentId/,
    routeName + " must not silently select the first linked child");
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
  assert.match(routeFiles.parent, /ctx\.user\.role !== "parent" && ctx\.user\.role !== "admin"/,
    "parent overview must deny teacher access; teachers use course-scoped reports");
  assert.doesNotMatch(routeFiles.parent, /ctx\.user\.role !== "parent" && ctx\.user\.role !== "admin" && ctx\.user\.role !== "teacher"/,
    "parent overview must not allow teachers to query arbitrary parentId values");
  assert.doesNotMatch(routeFiles.parent, /db\.select\(\)\.from\(users\)/,
    "parent overview must not hydrate/return password and unrelated private user columns");
  assert.match(routeFiles.parent, /id:\s*users\.id[\s\S]*name:\s*users\.name[\s\S]*grade:\s*users\.grade/,
    "parent overview must project only an explicit student profile allowlist");
});

test("teacher student report scope requires owned-course enrollment and excludes unscopable data", () => {
  assert.match(routeFiles.reports, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(routeFiles.reports, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(routeFiles.reports, /eq\(homework\.teacherId, ctx\.user\.id\)/);
  assert.match(routeFiles.reports, /inArray\(homeworkSubmissions\.homeworkId, visibleHomeworkIds!\)/);
  assert.match(routeFiles.reports, /inArray\(quizSubmissions\.quizId, visibleQuizIds!\)/);
  assert.match(routeFiles.reports, /const overallRate = role === "teacher" \? null :/,
    "teacher reports must not fabricate a 100% attendance rate when attendance cannot be scoped");
  assert.match(routeFiles.reports, /role === "teacher" \? \[\] : await db\.select\(\)\.from\(attendanceRecords\)/,
    "attendance has no course ownership key and must be omitted from teacher reports");
  assert.match(routeFiles.reports, /role === "teacher" \? null : \(student\.points \|\| 0\)/,
    "global gamification values must not be exposed in teacher reports");
  assert.match(routeFiles.reports, /if \(streak !== null\) \{\s*if \(streak >= 7\)/,
    "teacher reports must guard nullable streak before numeric comparison");
});

test("teacher attendance bulk marking rejects students outside owned-course enrollments", () => {
  assert.match(routeFiles.attendance, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(routeFiles.attendance, /allowedStudentIds\.has\(mark\.studentId\)/);
  assert.match(routeFiles.attendance, /Attendance includes a student outside your owned courses/);
});


test("student report endpoint rejects attempts to select another student", () => {
  const source = routeFiles.reports;
  const studentBranch = source.indexOf('} else if (role === "student") {');
  assert.notEqual(studentBranch, -1, "student report branch must exist");
  const forbiddenGuard = source.indexOf('if (studentId && studentId !== ctx.user.id)', studentBranch);
  const selfAssignment = source.indexOf("studentId = ctx.user.id;", forbiddenGuard);
  const studentLookup = source.indexOf("const stList = await db", selfAssignment);
  assert.ok(
    forbiddenGuard > studentBranch && selfAssignment > forbiddenGuard && studentLookup > selfAssignment,
    "a student-supplied target ID must be rejected before report data is queried, then the authenticated ID is used",
  );
  assert.match(
    source.slice(studentBranch, selfAssignment),
    /return NextResponse\.json\(\{ error: "Forbidden" \}, \{ status: 403 \}\)/,
    "cross-student report requests must return HTTP 403",
  );
});


routeFiles.analytics = await readFile(new URL("../app/api/analytics/route.ts", import.meta.url), "utf8");

test("analytics authenticates before setup and rejects unsupported roles", () => {
  assertAuthBeforeSetup(routeFiles.analytics, "analytics");
  assert.match(
    routeFiles.analytics,
    /if \(!\["admin", "teacher", "parent", "student"\]\.includes\(role\)\)/,
    "analytics must reject unsupported roles before database setup",
  );
});

test("analytics teacher reports require owned-course enrollment and current student role", () => {
  const source = routeFiles.analytics;
  const teacherStart = source.indexOf('if (role === "teacher") {');
  const parentStart = source.indexOf("// ---------- PARENT: linked student report ----------", teacherStart);
  assert.ok(teacherStart >= 0 && parentStart > teacherStart, "teacher analytics branch must exist");
  const teacherBranch = source.slice(teacherStart, parentStart);

  assert.match(teacherBranch, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(teacherBranch, /eq\(users\.role, "student"\)/);
  assert.match(teacherBranch, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(teacherBranch, /canAccessStudentAnalytics\(/);
  assert.match(teacherBranch, /allowedCourseIds:\s*getTeacherAnalyticsCourseIds\(/);
  assert.match(teacherBranch, /return NextResponse\.json\(\{ error: "Forbidden" \}, \{ status: 403 \}\)/);
});

test("analytics parent reports require a verified link and explicit selection for multiple children", () => {
  const source = routeFiles.analytics;
  const parentStart = source.indexOf('// ---------- PARENT: linked student report ----------');
  const studentStart = source.indexOf('// ---------- STUDENT: own report only ----------', parentStart);
  assert.ok(parentStart >= 0 && studentStart > parentStart, "parent analytics branch must exist");
  const parentBranch = source.slice(parentStart, studentStart);

  assert.match(parentBranch, /innerJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/);
  assert.match(parentBranch, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(parentBranch, /eq\(users\.role, "student"\)/);
  assert.match(parentBranch, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(parentBranch, /resolveParentAnalyticsStudentId\(requestedStudent, linkedParentStudentIds\)/);
  assert.match(parentBranch, /student-id-required/);
  assert.doesNotMatch(parentBranch, /links\s*\[\s*0\s*\]\s*\??\.\s*studentId/,
    "analytics must never silently choose the first linked child");
});

test("analytics students can only request their own report", () => {
  const source = routeFiles.analytics;
  const studentStart = source.indexOf("// ---------- STUDENT: own report only ----------");
  assert.notEqual(studentStart, -1, "student analytics branch must exist");
  const studentBranch = source.slice(studentStart);
  const authorization = studentBranch.indexOf(
    'if (!canAccessStudentAnalytics({ role, requesterId: ctx.user.id, studentId: requestedStudent || ctx.user.id }))',
  );
  const forbidden = studentBranch.indexOf('return NextResponse.json({ error: "Forbidden" }, { status: 403 })', authorization);
  const ownReport = studentBranch.indexOf("buildStudentReport(ctx.user.id)", forbidden);

  assert.ok(authorization >= 0 && forbidden > authorization && ownReport > forbidden,
    "student target ID must be authorized before report data is loaded");
  assert.doesNotMatch(studentBranch, /buildStudentReport\(requestedStudent\)/,
    "student reports must use the authenticated user's ID, never the caller-supplied target");
});
