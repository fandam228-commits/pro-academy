import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getParentAnalyticsSelectionData,
  resolveParentAnalyticsStudentId,
} from "./analytics-report-scope.mjs";

const reportsSource = await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8");
const attendanceSource = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");

function assertAuthBeforeSetup(source, routeName, method = "GET") {
  const handlerStart = source.indexOf(`export async function ${method}(req: Request)`);
  assert.notEqual(handlerStart, -1, routeName + " handler must exist");
  const handler = source.slice(handlerStart);
  const auth = handler.indexOf("const ctx = await getAuthContext(req)");
  const unauthorized = handler.indexOf("if (!ctx)", auth);
  const setup = handler.indexOf("await ensureDbSetup()", unauthorized);
  assert.ok(auth >= 0 && unauthorized > auth && setup > unauthorized,
    routeName + " must authenticate before database setup");
}

function assertMixedVerificationSelection(source, routeName) {
  assert.match(source, /innerJoin\(parentAccount, eq\(parentLinks\.parentId, parentAccount\.id\)\)/,
    routeName + " must revalidate the current parent account");
  assert.match(source, /eq\(parentAccount\.role, "parent"\)/,
    routeName + " must reject a stale parent session role");
  assert.match(source, /innerJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/);
  assert.match(source, /eq\(users\.role, "student"\)/,
    routeName + " must require a current student account");
  assert.match(source, /leftJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/,
    routeName + " must include unverified links in the ambiguity set");
  assert.match(source, /verifierRole: verifiedByUser\.role/);
  assert.match(source, /getParentAnalyticsSelectionData\(parentLinkRows\)/);
  assert.match(source, /if \(!(?:studentId|requestedStudent) && allLinkedStudentIds\.length > 1\)/,
    routeName + " must require explicit selection across all linked children, including unverified links");
  assert.match(source, /resolveParentAnalyticsStudentId\((?:studentId|requestedStudent), verifiedStudentIds\)/,
    routeName + " must authorize only admin-verified children");
  assert.doesNotMatch(source, /links\s*\[\s*0\s*\]\s*\??\.\s*studentId/,
    routeName + " must never silently choose the first linked child");
}

test("mixed verified/unverified parent links remain ambiguous but only verified children are authorized", () => {
  const selection = getParentAnalyticsSelectionData([
    { studentId: "child-1", verifiedAt: "2026-11-01T10:00:00Z", verifiedBy: "admin-1", verifierRole: "admin" },
    { studentId: "child-2", verifiedAt: null, verifiedBy: null, verifierRole: null },
  ]);
  assert.deepEqual(selection.allLinkedStudentIds, ["child-1", "child-2"]);
  assert.deepEqual(selection.verifiedStudentIds, ["child-1"]);
  assert.equal(selection.allLinkedStudentIds.length > 1, true);
  assert.equal(resolveParentAnalyticsStudentId(null, selection.verifiedStudentIds).ok, true);
  assert.equal(resolveParentAnalyticsStudentId("child-2", selection.verifiedStudentIds).ok, false);
});

test("reports require verified explicit parent selection across all linked children", () => {
  assertAuthBeforeSetup(reportsSource, "reports");
  assertMixedVerificationSelection(reportsSource, "reports");
});

test("attendance requires verified explicit parent selection across all linked children", () => {
  assertAuthBeforeSetup(attendanceSource, "attendance");
  assertMixedVerificationSelection(attendanceSource, "attendance");
});

test("teacher reports are limited to active/completed students in currently owned courses", () => {
  assert.match(reportsSource, /innerJoin\(courses, eq\(enrollments\.courseId, courses\.id\)\)/);
  assert.match(reportsSource, /innerJoin\(users, eq\(enrollments\.studentId, users\.id\)\)/);
  assert.match(reportsSource, /eq\(users\.role, "student"\)/);
  assert.match(reportsSource, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(reportsSource, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(reportsSource, /innerJoin\(courses, eq\(homework\.courseId, courses\.id\)\)/,
    "homework must recheck current course ownership when resolving visible assignments");
  assert.match(reportsSource, /eq\(homework\.teacherId, ctx\.user\.id\)/);
  assert.match(reportsSource, /innerJoin\(enrollments, and\([\s\S]*?eq\(enrollments\.studentId, homeworkSubmissions\.studentId\)[\s\S]*?eq\(enrollments\.courseId, homework\.courseId\)/,
    "homework submission reads must recheck the same student's current enrollment in the exact course");
  assert.match(reportsSource, /innerJoin\(courses, eq\(quizzes\.courseId, courses\.id\)\)/,
    "quiz submissions must recheck the current course owner");
  assert.match(reportsSource, /innerJoin\(enrollments, and\([\s\S]*?eq\(enrollments\.studentId, quizSubmissions\.studentId\)[\s\S]*?eq\(enrollments\.courseId, quizzes\.courseId\)/,
    "quiz reads must recheck the same student's current enrollment in the exact course");
  assert.match(reportsSource, /role === "teacher" \? \[\] : await db\.select\(\)\.from\(attendanceRecords\)/,
    "teacher reports must omit attendance because it has no course ownership key");
  assert.match(reportsSource, /role === "teacher" \? null : \(student\.points \|\| 0\)/,
    "global gamification values must not be exposed to teachers");
});

test("students can request only their own report", () => {
  const studentBranch = reportsSource.indexOf('} else if (role === "student") {');
  assert.notEqual(studentBranch, -1);
  const forbidden = reportsSource.indexOf("studentId !== ctx.user.id", studentBranch);
  const selfAssignment = reportsSource.indexOf("studentId = ctx.user.id", forbidden);
  const profileRead = reportsSource.indexOf("const stList = await db", selfAssignment);
  assert.ok(forbidden > studentBranch && selfAssignment > forbidden && profileRead > selfAssignment);
  assert.match(reportsSource.slice(studentBranch, selfAssignment), /status: 403/);
});

test("teacher attendance roster and writes are limited to currently enrolled students in owned courses", () => {
  assert.match(attendanceSource, /eq\(courses\.teacherId, ctx\.user\.id\)/);
  assert.match(attendanceSource, /eq\(users\.role, "student"\)/);
  assert.match(attendanceSource, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(attendanceSource, /eq\(attendanceRecords\.markedBy, ctx\.user\.id\)/,
    "teacher attendance reads must not expose records marked by other staff");
  assert.match(attendanceSource, /allowedStudentIds\.has\(mark\.studentId\)/);
  assert.match(attendanceSource, /Attendance includes a student outside your owned courses/);
});

test("attendance self check-in is restricted to student accounts", () => {
  const checkInStart = attendanceSource.indexOf('if (action === "check_in")');
  assert.notEqual(checkInStart, -1);
  const checkInGuard = attendanceSource.indexOf('if (ctx.user.role !== "student")', checkInStart);
  const firstRead = attendanceSource.indexOf("await db", checkInStart);
  assert.ok(checkInGuard > checkInStart && firstRead > checkInGuard);
  assert.match(attendanceSource.slice(checkInStart, firstRead), /status: 403/);
});

test("report and attendance failures never log raw database error objects", () => {
  assert.ok(reportsSource.includes('console.error("Reports GET failed; details withheld.");'));
  assert.ok(attendanceSource.includes('console.error("Attendance GET failed; details withheld.");'));
  assert.ok(attendanceSource.includes('console.error("Attendance POST failed; details withheld.");'));
  assert.doesNotMatch(reportsSource, /console\.error\([^\n]*,\s*error\s*\)/);
  assert.doesNotMatch(attendanceSource, /console\.error\([^\n]*,\s*error\s*\)/);
});

test("attendance POST authenticates before database setup", () => {
  assertAuthBeforeSetup(attendanceSource, "attendance POST", "POST");
});
