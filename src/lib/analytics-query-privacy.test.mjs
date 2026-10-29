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
