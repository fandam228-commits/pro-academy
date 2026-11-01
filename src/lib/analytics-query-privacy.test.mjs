import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/analytics/route.ts", import.meta.url), "utf8");
const verificationRouteSource = await readFile(new URL("../app/api/parent-links/[id]/verify/route.ts", import.meta.url), "utf8");
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
