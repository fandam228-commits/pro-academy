import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/analytics/route.ts", import.meta.url), "utf8");
const verificationRouteSource = await readFile(new URL("../app/api/parent-links/[id]/verify/route.ts", import.meta.url), "utf8");
const attendanceRouteSource = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");
const reportsRouteSource = await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8");
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

test("teacher reports omit unscopable exam, attendance, and question-bank data", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);
  assert.match(reportSource, /const attempts = scope\s*\?\s*\[\]/,
    "exam attempts without a reliable course key must not enter teacher reports");
  assert.match(reportSource, /const attendance = scope\s*\?\s*\[\]/,
    "attendance without a teacher/course ownership key must not enter teacher reports");
  assert.match(reportSource, /const bank = scope \? \[\] : await db\.select\(\)\.from\(questionBank\)/,
    "global question-bank records must not be used to derive teacher-scoped mastery");
});

test("Analytics GET authenticates and validates supported roles before database setup", () => {
  const getStart = routeSource.indexOf("export async function GET(req: Request)");
  assert.notEqual(getStart, -1, "Analytics GET handler must exist");
  const getSource = routeSource.slice(getStart);
  const auth = getSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = getSource.indexOf('if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });', auth);
  const role = getSource.indexOf("const role = ctx.user.role as string", unauthorized);
  const roleGuard = getSource.indexOf('if (!["admin", "teacher", "parent", "student"].includes(role))', role);
  const setup = getSource.indexOf("await ensureDbSetup()");
  assert.ok(
    auth >= 0 && unauthorized > auth && role > unauthorized && roleGuard > role && setup > roleGuard,
    "authentication and supported-role validation must finish before database setup",
  );
});

test("parent-link verification and revocation authenticate and authorize before database setup", () => {
  for (const method of ["POST", "DELETE"]) {
    const handlerStart = verificationRouteSource.indexOf("export async function " + method + "(");
    assert.notEqual(handlerStart, -1, method + " handler must exist");
    const nextHandler = verificationRouteSource.indexOf("export async function ", handlerStart + 1);
    const handler = verificationRouteSource.slice(handlerStart, nextHandler === -1 ? undefined : nextHandler);
    const auth = handler.indexOf("const ctx = await getAuthContext(req)");
    const unauthorized = handler.indexOf('if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });', auth);
    const adminGuard = handler.indexOf('if (ctx.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });', unauthorized);
    const setup = handler.indexOf("await ensureDbSetup()");
    assert.ok(
      auth >= 0 && unauthorized > auth && adminGuard > unauthorized && setup > adminGuard,
      method + " must reject unauthenticated/non-admin callers before schema setup",
    );
  }
});


test("unscoped report profile lookup also requires a current student account", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);
  const studentMarker = reportSource.indexOf("const student = userRows[0];");
  assert.notEqual(studentMarker, -1, "student profile lookup must exist");
  const unscopedQueryStart = reportSource.lastIndexOf(": await db", studentMarker);
  assert.notEqual(unscopedQueryStart, -1, "unscoped profile query must exist");
  const unscopedQuery = reportSource.slice(unscopedQueryStart, studentMarker);
  assert.match(
    unscopedQuery,
    /eq\(users\.role, "student"\)/,
    "admin and parent report builders must not resolve a non-student account as a student report",
  );
});


test("parent-link verification rechecks current admin, parent, and student roles atomically", () => {
  const postStart = verificationRouteSource.indexOf("export async function POST(");
  const deleteStart = verificationRouteSource.indexOf("export async function DELETE(", postStart + 1);
  assert.notEqual(postStart, -1, "verification POST handler must exist");
  assert.notEqual(deleteStart, -1, "revocation DELETE handler must exist");
  const postSource = verificationRouteSource.slice(postStart, deleteStart);
  const mutationStart = postSource.indexOf("const verifiedRows = await db.update(parentLinks)");
  const mutationEnd = postSource.indexOf(".returning({ id: parentLinks.id })", mutationStart);
  assert.ok(mutationStart >= 0 && mutationEnd > mutationStart, "verification must use a guarded UPDATE");
  const mutation = postSource.slice(mutationStart, mutationEnd);
  assert.match(mutation, /exists\(db\.select\(\{ id: verifierAccount\.id \}\)/);
  assert.match(mutation, /eq\(verifierAccount\.role, "admin"\)/);
  assert.match(mutation, /exists\(db\.select\(\{ id: parentAccount\.id \}\)/);
  assert.match(mutation, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(mutation, /exists\(db\.select\(\{ id: studentAccount\.id \}\)/);
  assert.match(mutation, /eq\(studentAccount\.role, "student"\)/);
  assert.match(postSource, /if\s*\(!verifiedRows\[0\]\)[\s\S]*?status:\s*409/);
});


test("attendance GET authenticates and validates supported roles before database setup", () => {
  const getStart = attendanceRouteSource.indexOf("export async function GET(req: Request)");
  const postStart = attendanceRouteSource.indexOf("export async function POST(", getStart);
  assert.notEqual(getStart, -1, "attendance GET handler must exist");
  assert.notEqual(postStart, -1, "attendance POST handler must follow GET");
  const getSource = attendanceRouteSource.slice(getStart, postStart);
  const auth = getSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = getSource.indexOf("if (!ctx)", auth);
  const role = getSource.indexOf("const role = ctx.user.role as string", unauthorized);
  const roleGuard = getSource.indexOf('if (!["teacher", "admin", "parent", "student"].includes(role))', role);
  const setup = getSource.indexOf("await ensureDbSetup()");
  assert.ok(auth >= 0 && unauthorized > auth && role > unauthorized && roleGuard > role && setup > roleGuard,
    "attendance GET must reject unauthenticated and unsupported-role callers before database setup");
});

test("teacher attendance GET is limited to owned-course student roster and records marked by that teacher", () => {
  const getStart = attendanceRouteSource.indexOf("export async function GET(req: Request)");
  const postStart = attendanceRouteSource.indexOf("export async function POST(", getStart);
  const getSource = attendanceRouteSource.slice(getStart, postStart);
  assert.match(getSource, /eq\(courses\.teacherId, ctx\.user\.id\)/,
    "teacher roster must be based on courses owned by the requesting teacher");
  assert.match(getSource, /eq\(users\.role, "student"\)/,
    "malformed enrollments must not add non-student accounts to the roster");
  assert.match(getSource, /inArray\(enrollments\.status, \["active", "completed"\]\)/,
    "cancelled or invalid enrollments must not authorize roster visibility");
  assert.match(getSource, /eq\(attendanceRecords\.markedBy, ctx\.user\.id\)/,
    "teacher attendance reads must include only records marked by the requesting teacher");
  assert.match(getSource, /inArray\(attendanceRecords\.studentId, visibleStudentIds\)/,
    "teacher attendance reads must be limited in SQL to the current owned-course roster");
  assert.match(getSource, /visibleStudentIds\.length === 0\s*\?\s*\[\]/,
    "an empty authorized roster must fail closed without an unscoped attendance query");
  assert.match(getSource, /allRecords\.filter\(\(record\) => visibleStudents\.some\(\(student\) => student\.id === record\.studentId\)\)/,
    "teacher session metadata must also be limited to the owned-course roster");
});

test("parent attendance GET requires an admin-verified current student and explicit child resolution", () => {
  const parentStart = attendanceRouteSource.indexOf('if (role === "parent")');
  const studentStart = attendanceRouteSource.indexOf("// ============ STUDENT: own records ============", parentStart);
  assert.notEqual(parentStart, -1, "parent attendance branch must exist");
  assert.notEqual(studentStart, -1, "student attendance branch must follow parent branch");
  const parentSource = attendanceRouteSource.slice(parentStart, studentStart);
  assert.match(parentSource, /innerJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/);
  assert.match(parentSource, /innerJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/);
  assert.match(parentSource, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(parentSource, /eq\(users\.role, "student"\)/);
  assert.match(parentSource, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(parentSource, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(parentSource, /resolveParentAnalyticsStudentId\(requestedStudent, linkedStudentIds\)/);
  assert.doesNotMatch(parentSource, /links\s*\[\s*0\s*\]\s*\??\.\s*studentId/,
    "parent attendance must not silently select the first linked child");
  assert.match(parentSource, /eq\(attendanceRecords\.studentId, studentId\)/,
    "records must be queried only for the explicitly resolved authorized child");
});

test("student attendance GET always queries only the authenticated student's records", () => {
  const studentStart = attendanceRouteSource.indexOf("// ============ STUDENT: own records ============");
  assert.notEqual(studentStart, -1, "student attendance branch must exist");
  const studentSource = attendanceRouteSource.slice(studentStart);
  assert.match(studentSource, /eq\(attendanceRecords\.studentId, ctx\.user\.id\)/);
  assert.doesNotMatch(studentSource, /searchParams\.get\(["']studentId["']\)/,
    "student attendance must not accept a caller-selected student ID");
});

test("teacher attendance POST rejects students outside owned active/completed enrollments", () => {
  const postStart = attendanceRouteSource.indexOf("export async function POST(");
  assert.notEqual(postStart, -1, "attendance POST handler must exist");
  const postSource = attendanceRouteSource.slice(postStart);
  const auth = postSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = postSource.indexOf("if (!ctx)", auth);
  const roleGuard = postSource.indexOf('if (!["teacher", "admin", "student"].includes(ctx.user.role))', unauthorized);
  const setup = postSource.indexOf("await ensureDbSetup()");
  assert.ok(auth >= 0 && unauthorized > auth && roleGuard > unauthorized && setup > roleGuard,
    "attendance POST must authorize the role before database setup");
  assert.match(postSource, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(postSource, /eq\(users\.role, "student"\)/);
  assert.match(postSource, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(postSource, /const allowedStudentIds = new Set\(rows\.map\(\(row\) => row\.studentId\)\)/);
  assert.match(postSource, /requireRoles\(req, \["teacher", "admin"\]\)/,
    "bulk attendance marking must independently restrict writes to teachers and admins");
  assert.match(postSource, /marks\.some\(\(mark\) => typeof mark\?\.studentId !== "string" \|\| !allowedStudentIds\.has\(mark\.studentId\)\)/,
    "every teacher-submitted attendance mark must belong to an allowed student");
});


test("Analytics GET authenticates and validates the role before database setup", () => {
  const getStart = routeSource.indexOf("export async function GET(req: Request)");
  assert.notEqual(getStart, -1, "Analytics GET handler must exist");
  const getSource = routeSource.slice(getStart);
  const auth = getSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = getSource.indexOf("if (!ctx)", auth);
  const roleGuard = getSource.indexOf('if (!["admin", "teacher", "parent", "student"].includes(role))', unauthorized);
  const setup = getSource.indexOf("await ensureDbSetup()");

  assert.ok(
    auth >= 0 && unauthorized > auth && roleGuard > unauthorized && setup > roleGuard,
    "Analytics GET must reject unauthenticated and unsupported-role callers before database setup",
  );
});


test("teacher Analytics enrollment SQL excludes cancelled and unknown statuses before report scoping", () => {
  const getStart = routeSource.indexOf("export async function GET(req: Request)");
  const teacherStart = routeSource.indexOf('if (role === "teacher")', getStart);
  const requestedStudentStart = routeSource.indexOf("if (requestedStudent)", teacherStart);
  assert.ok(getStart >= 0 && teacherStart > getStart && requestedStudentStart > teacherStart,
    "teacher Analytics branch and enrollment query must exist");
  const enrollmentQuery = routeSource.slice(teacherStart, requestedStudentStart);
  assert.match(enrollmentQuery, /eq\(courses\.teacherId, ctx\.user\.id\)/,
    "the enrollment allowlist must only include courses owned by the requesting teacher");
  assert.match(enrollmentQuery, /eq\(users\.role, "student"\)/,
    "malformed enrollments must not authorize non-student accounts");
  assert.match(enrollmentQuery, /inArray\(enrollments\.status, \["active", "completed"\]\)/,
    "cancelled and unknown enrollment statuses must be excluded in SQL before building report scope");
});

test("teacher class roster selects only authorized student profile fields", () => {
  const teacherStart = routeSource.indexOf('if (role === "teacher")');
  const parentStart = routeSource.indexOf('if (role === "parent")', teacherStart);
  assert.ok(teacherStart >= 0 && parentStart > teacherStart, "teacher report branch must exist");
  const teacherSource = routeSource.slice(teacherStart, parentStart);

  assert.match(
    teacherSource,
    /const visibleStudents = teacherStudentIds\.length === 0\s*\?\s*\[\]\s*:\s*await db\s*\.select\(\{\s*id: users\.id,\s*name: users\.name,\s*grade: users\.grade\s*\}\)\s*\.from\(users\)\s*\.where\(and\(eq\(users\.role, "student"\), inArray\(users\.id, teacherStudentIds\)\)\)/,
    "teacher roster SQL must select only id/name/grade and filter by the authorized student-ID allowlist",
  );
  assert.doesNotMatch(
    teacherSource,
    /db\.select\(\)\.from\(users\)/,
    "teacher roster must not hydrate every user row or unrelated account fields",
  );

  const rowsStart = teacherSource.indexOf("const classRows = reports");
  const rowsEnd = teacherSource.indexOf("const topicAgg", rowsStart);
  assert.ok(rowsStart >= 0 && rowsEnd > rowsStart, "teacher class response mapping must exist");
  const responseMapping = teacherSource.slice(rowsStart, rowsEnd);
  assert.match(responseMapping, /id:\s*r\.student\?\.id/);
  assert.match(responseMapping, /name:\s*r\.student\?\.name/);
  assert.match(responseMapping, /grade:\s*r\.student\?\.grade/);
  assert.doesNotMatch(
    responseMapping,
    /email|phone|password|token|storagePath|parentId|verifiedBy/i,
    "teacher class analytics must not expose account contact, authentication, storage, or parent-link fields",
  );
});


test("parent-link revocation rechecks the current administrator role in the UPDATE predicate", () => {
  const deleteStart = verificationRouteSource.indexOf("export async function DELETE(");
  assert.notEqual(deleteStart, -1, "revocation DELETE handler must exist");
  const deleteSource = verificationRouteSource.slice(deleteStart);
  const mutationStart = deleteSource.indexOf("const revokedRows = await db.update(parentLinks)");
  const mutationEnd = deleteSource.indexOf(".returning({ id: parentLinks.id })", mutationStart);
  assert.ok(mutationStart >= 0 && mutationEnd > mutationStart, "revocation must use a guarded UPDATE");
  const mutation = deleteSource.slice(mutationStart, mutationEnd);
  assert.match(mutation, /exists\(db\.select\(\{ id: verifierAccount\.id \}\)/);
  assert.match(mutation, /eq\(verifierAccount\.id, ctx\.user\.id\)/);
  assert.match(mutation, /eq\(verifierAccount\.role, "admin"\)/);
  assert.match(deleteSource, /if\s*\(!revokedRows\[0\]\)[\s\S]*?status:\s*409/,
    "a stale or revoked administrator must not receive a successful revocation response");
});


test("admin class analytics loads only student IDs before building individual reports", () => {
  const adminStart = routeSource.indexOf("// ---------- ADMIN: unrestricted analytics ----------");
  const teacherStart = routeSource.indexOf("// ---------- TEACHER: only students enrolled in courses owned by this teacher ----------", adminStart);
  assert.ok(adminStart >= 0 && teacherStart > adminStart, "admin and teacher Analytics branches must exist");
  const adminSource = routeSource.slice(adminStart, teacherStart);

  assert.ok(
    adminSource.includes('const students = await db.select({ id: users.id }).from(users).where(eq(users.role, "student"));'),
    "admin class roster should fetch only IDs needed to build reports",
  );
  assert.doesNotMatch(
    adminSource,
    /db\.select\(\)\.from\(users\)/,
    "class report generation must not load password, contact, or other unrelated user columns",
  );
  assert.ok(adminSource.includes("students.map((s) => buildStudentReport(s.id))"));
});


test("reports GET authenticates and validates supported roles before database setup", () => {
  const getStart = reportsRouteSource.indexOf("export async function GET(req: Request)");
  assert.notEqual(getStart, -1, "reports GET handler must exist");
  const getSource = reportsRouteSource.slice(getStart);
  const auth = getSource.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = getSource.indexOf("if (!ctx)", auth);
  const roleGuard = getSource.indexOf('if (!["admin", "teacher", "parent", "student"].includes(role))', unauthorized);
  const setup = getSource.indexOf("await ensureDbSetup()");
  assert.ok(auth >= 0 && unauthorized > auth && roleGuard > unauthorized && setup > roleGuard,
    "reports GET must reject unauthenticated and unsupported-role callers before database setup");
});

test("reports parent access requires a verified current student and current admin verifier", () => {
  const parentStart = reportsRouteSource.indexOf('if (role === "parent")');
  const studentStart = reportsRouteSource.indexOf('else if (role === "student")', parentStart);
  assert.ok(parentStart >= 0 && studentStart > parentStart, "parent and student report branches must exist");
  const parentSource = reportsRouteSource.slice(parentStart, studentStart);
  assert.match(parentSource, /\.innerJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/);
  assert.match(parentSource, /\.innerJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/);
  assert.match(parentSource, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(parentSource, /eq\(users\.role, "student"\)/);
  assert.match(parentSource, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(parentSource, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(parentSource, /isNotNull\(parentLinks\.verifiedBy\)/);
  assert.match(parentSource, /resolveParentAnalyticsStudentId\(studentId, linkedStudentIds\)/);
  assert.doesNotMatch(parentSource, /links\s*\[\s*0\s*\]\s*\??\.\s*studentId|linkedStudentIds\s*\[\s*0\s*\]/,
    "reports must never silently choose the first linked child");
});

test("reports student access is self-only and rejects a forged target ID", () => {
  const studentStart = reportsRouteSource.indexOf('else if (role === "student")');
  const studentEnd = reportsRouteSource.indexOf("if (!studentId)", studentStart);
  assert.ok(studentStart >= 0 && studentEnd > studentStart, "student report selector must exist");
  const studentSource = reportsRouteSource.slice(studentStart, studentEnd);
  assert.match(studentSource, /if\s*\(studentId\s*&&\s*studentId\s*!==\s*ctx\.user\.id\)/);
  assert.match(studentSource, /studentId\s*=\s*ctx\.user\.id/);
});

test("reports teacher data is scoped to owned courses and active/completed enrollments", () => {
  const teacherStart = reportsRouteSource.indexOf('if (role === "teacher")');
  const profileStart = reportsRouteSource.indexOf("const stList", teacherStart);
  assert.ok(teacherStart >= 0 && profileStart > teacherStart, "teacher report scope query must exist");
  const teacherScope = reportsRouteSource.slice(teacherStart, profileStart);
  assert.match(teacherScope, /eq\(enrollments\.studentId, studentId\)/);
  assert.match(teacherScope, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(teacherScope, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(teacherScope, /if\s*\(teacherCourseIds\.length === 0\)[\s\S]*?status:\s*403/);
  assert.match(reportsRouteSource, /eq\(homework\.teacherId, ctx\.user\.id\)/);
  assert.match(reportsRouteSource, /inArray\(homework\.courseId, teacherCourseIds \?\? \[\]\)/);
  assert.match(reportsRouteSource, /inArray\(homeworkSubmissions\.homeworkId, visibleHomeworkIds!\)/);
  assert.match(reportsRouteSource, /inArray\(quizzes\.courseId, teacherCourseIds \?\? \[\]\)/);
  assert.match(reportsRouteSource, /inArray\(quizSubmissions\.quizId, visibleQuizIds!\)/);
  assert.match(reportsRouteSource, /inArray\(enrollments\.courseId, teacherCourseIds \?\? \[\]\)/);
});

test("reports do not expose unscoped attendance or global gamification values to teachers", () => {
  assert.match(reportsRouteSource, /role === "teacher" \? \[\] : await db\.select\(\)\.from\(attendanceRecords\)/);
  assert.match(reportsRouteSource, /role === "teacher" \? null/);
  assert.match(reportsRouteSource, /role === "teacher" \? null : \(student\.streak \|\| 0\)/);
  assert.match(reportsRouteSource, /role === "teacher" \? null : \(student\.points \|\| 0\)/);
  assert.match(reportsRouteSource, /role === "teacher" \? null : \(student\.level \|\| "Intermediate"\)/);
});


test("Analytics homework scope fails closed when the student grade is missing", () => {
  assert.match(routeSource, /isHomeworkGradeVisibleToStudent/);
  assert.match(routeSource, /isHomeworkGradeVisibleToStudent\(item\.grade, student\?\.grade\)/);
  assert.match(routeSource, /isHomeworkGradeVisibleToStudent\(h\.grade, student\?\.grade\)/);
});

const securityModuleSource = await readFile(new URL("./security.ts", import.meta.url), "utf8");

test("authorization context uses the current database role rather than a stale session role", () => {
  const authStart = securityModuleSource.indexOf("export async function getAuthContext");
  const requireRolesStart = securityModuleSource.indexOf("export async function requireRoles", authStart);
  assert.notEqual(authStart, -1, "getAuthContext must exist");
  assert.notEqual(requireRolesStart, -1, "requireRoles must follow getAuthContext");
  const authSource = securityModuleSource.slice(authStart, requireRolesStart);

  assert.match(
    authSource,
    /const userRows = await db\.select\(\)\.from\(users\)\.where\(eq\(users\.id, session\.userId\)\)/,
    "the authenticated account must be reloaded from the current users row",
  );
  assert.match(
    authSource,
    /return\s*\{\s*user:\s*userRows\[0\],\s*session\s*\}/,
    "authorization must use the current database user, including its current role",
  );
  assert.doesNotMatch(
    authSource,
    /return\s*\{\s*user:\s*session\b/,
    "a stored session role must not replace the current database role",
  );
});
