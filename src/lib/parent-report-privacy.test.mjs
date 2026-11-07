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

function assertMixedParentSelection(source, routeName, requestedIdName) {
  assert.match(source, /innerJoin\(parentAccount, eq\(parentLinks\.parentId, parentAccount\.id\)\)/,
    routeName + " must verify the current parent account");
  assert.match(source, /eq\(parentAccount\.role, "parent"\)/,
    routeName + " must require the current parent role");
  assert.match(source, /leftJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/,
    routeName + " must retain unverified current-student links for ambiguity detection");
  assert.match(source, /leftJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/,
    routeName + " must resolve the current verifier role");
  assert.match(source, /getParentAnalyticsSelectionData\(/,
    routeName + " must derive both all-linked and verified child sets");
  assert.match(source, /selectionData\.allLinkedStudentIds/,
    routeName + " must require explicit choice across all current linked students");
  assert.match(source, new RegExp("resolveParentAnalyticsStudentId\\(\\s*" + requestedIdName + ",\\s*selectionData\\.allLinkedStudentIds,?\\s*\\)"),
    routeName + " must resolve the requested child against every linked student");
  assert.match(source, /selectionData\.verifiedStudentIds\.includes\(/,
    routeName + " must deny explicitly selected but unverified children");
  assert.doesNotMatch(source, /links\s*\[\s*0\s*\]\s*\??\.\s*studentId/,
    routeName + " must not silently select the first linked child");
}

test("student reports authenticate before setup and verify parent links", () => {
  assertAuthBeforeSetup(routeFiles.reports, "reports");
  assertMixedParentSelection(routeFiles.reports, "reports", "studentId");
});

test("attendance authenticates before setup and verifies parent links", () => {
  assertAuthBeforeSetup(routeFiles.attendance, "attendance");
  assertMixedParentSelection(routeFiles.attendance, "attendance", "requestedStudent");
});

test("parent overview requires verified explicit child selection and never returns the full users row", () => {
  assertAuthBeforeSetup(routeFiles.parent, "parent overview");
  assertMixedParentSelection(routeFiles.parent, "parent overview", "requestedStudent");
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

  assert.match(parentBranch, /leftJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/);
  assert.match(parentBranch, /leftJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/);
  assert.match(parentBranch, /getParentAnalyticsSelectionData\(/);
  assert.match(parentBranch, /resolveParentAnalyticsStudentId\(\s*requestedStudent,\s*selectionData\.allLinkedStudentIds,?\s*\)/);
  assert.match(parentBranch, /linkedParentStudentIds\.includes\(studentId\)/);
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


test("analytics teacher reports query only authorized course data and omit unscopable records", () => {
  const source = routeFiles.analytics;
  const builderStart = source.indexOf("async function buildStudentReport(");
  const builderEnd = source.indexOf("function buildClassAnalyticsResponse(", builderStart);
  assert.ok(builderStart >= 0 && builderEnd > builderStart, "student report builder must exist");
  const builder = source.slice(builderStart, builderEnd);

  assert.match(builder, /const attempts = scope\s*\?\s*\[\]\s*:/,
    "exam attempts without a reliable course key must be omitted from teacher reports");
  assert.match(builder, /inArray\(quizzes\.courseId, scope\.allowedCourseIds\)/,
    "teacher quiz submissions must be constrained by the allowed course IDs");
  assert.match(builder, /eq\(homework\.teacherId, scope\.teacherId\)/,
    "teacher homework must also match the current teacher owner");
  assert.match(builder, /inArray\(homework\.courseId, scope\.allowedCourseIds\)/,
    "teacher homework must be constrained by the allowed course IDs");
  assert.match(builder, /const attendance = scope\s*\?\s*\[\]\s*:/,
    "attendance without a course ownership key must be omitted from teacher reports");
  assert.match(builder, /const bank = scope \? \[\] : await db\.select\(\)\.from\(questionBank\)/,
    "unscoped question-bank data must not be loaded for teacher reports");

  assert.match(builder, /id: users\.id,\s*name: users\.name,\s*grade: users\.grade/,
    "teacher report profiles must use an explicit minimal column projection");
  assert.doesNotMatch(builder, /scope\s*\?\s*await db\.select\(\)\.from\(users\)/,
    "teacher report must not load a full user row");
  assert.match(builder, /points: scope \? null : student\.points/);
  assert.match(builder, /streak: scope \? null : student\.streak/);
  assert.match(builder, /level: scope \? null : student\.level/);
});


test("teacher attendance reads only current owned-course students at the database layer", () => {
  const source = routeFiles.attendance;
  const teacherRecords = source.indexOf('const allRecords = role === "teacher"');
  const studentScope = source.indexOf("inArray(attendanceRecords.studentId, visibleStudentIds)", teacherRecords);
  assert.ok(
    teacherRecords >= 0 && studentScope > teacherRecords,
    "teacher attendance queries must constrain student IDs in SQL, not only filter results afterward",
  );
  assert.match(
    source,
    /visibleStudentIds\.length === 0[\s\S]*?inArray\(attendanceRecords\.studentId, visibleStudentIds\)/,
    "an empty authorized roster must return no attendance rows without issuing an unscoped read",
  );
});

test("attendance self check-in is student-only before any attendance read or write", () => {
  const source = routeFiles.attendance;
  const checkInStart = source.indexOf('if (action === "check_in")');
  assert.notEqual(checkInStart, -1, "self check-in action must exist");
  const roleGuard = source.indexOf('if (ctx.user.role !== "student")', checkInStart);
  const forbiddenResponse = source.indexOf('status: 403', roleGuard);
  const todaySetup = source.indexOf("const today =", checkInStart);
  const attendanceRead = source.indexOf("const existing = await db", checkInStart);
  assert.ok(
    roleGuard > checkInStart && forbiddenResponse > roleGuard &&
    todaySetup > forbiddenResponse && attendanceRead > todaySetup,
    "non-students must be rejected before self check-in reads or writes attendance",
  );
});



test("attendance POST validates action-specific roles before database setup", () => {
  const source = routeFiles.attendance;
  const postStart = source.indexOf("export async function POST(req: Request)");
  assert.notEqual(postStart, -1, "attendance POST handler must exist");
  const postSource = source.slice(postStart);
  const auth = postSource.indexOf("const ctx = await getAuthContext(req)");
  const roleAllowlist = postSource.indexOf('if (!["teacher", "admin", "student"].includes(ctx.user.role))', auth);
  const parseBody = postSource.indexOf("const { action } = body;", roleAllowlist);
  const bulkGuard = postSource.indexOf('if (action === "bulk_mark" && !["teacher", "admin"].includes(ctx.user.role))', parseBody);
  const checkInGuard = postSource.indexOf('if (action === "check_in" && ctx.user.role !== "student")', parseBody);
  const unsupportedGuard = postSource.indexOf('if (action !== "bulk_mark" && action !== "check_in")', parseBody);
  const setup = postSource.indexOf("await ensureDbSetup()", parseBody);
  assert.ok(auth >= 0 && roleAllowlist > auth && parseBody > roleAllowlist,
    "request must authenticate and parse the requested action before setup");
  assert.ok(bulkGuard > parseBody && checkInGuard > parseBody && unsupportedGuard > parseBody,
    "each supported action must enforce its own role and unknown actions must be rejected");
  assert.ok(setup > bulkGuard && setup > checkInGuard && setup > unsupportedGuard,
    "database setup must occur only after action-specific authorization");
});
