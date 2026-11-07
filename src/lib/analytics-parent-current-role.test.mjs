import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/analytics/route.ts", import.meta.url), "utf8");
const scopeSource = await readFile(new URL("./analytics-report-scope.mjs", import.meta.url), "utf8");
const parentAuthorizationSource = await readFile(new URL("./parent-report-authorization.mjs", import.meta.url), "utf8");

test("parent analytics revalidates the parent's current database role before trusting verified links", () => {
  const parentStart = routeSource.indexOf('if (role === "parent")');
  const studentStart = routeSource.indexOf("// ---------- STUDENT: own report only ----------", parentStart);
  assert.notEqual(parentStart, -1, "parent branch must exist");
  assert.notEqual(studentStart, -1, "student branch must follow parent branch");
  const parentSource = routeSource.slice(parentStart, studentStart);

  assert.match(parentSource, /\.innerJoin\(parentAccount, eq\(parentLinks\.parentId, parentAccount\.id\)\)/);
  assert.match(parentSource, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(parentSource, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(parentSource, /\.leftJoin\(verifiedByUser, eq\(parentLinks\.verifiedBy, verifiedByUser\.id\)\)/);
  assert.match(parentSource, /verifierRole:\s*verifiedByUser\.role/);
  assert.match(parentSource, /getParentAnalyticsSelectionData\(parentLinkRows\)/);
  assert.match(scopeSource, /row\.verifierRole === "admin"/,
    "only a currently admin-verified row may enter the authorized child set");
  assert.match(parentSource, /eq\(users\.role, "student"\)/);
});


test("parent Analytics revalidates the verified relationship after report reads and before responding", () => {
  const parentStart = routeSource.indexOf('if (role === "parent")');
  const studentStart = routeSource.indexOf("// ---------- STUDENT: own report only ----------", parentStart);
  assert.ok(parentStart >= 0 && studentStart > parentStart, "parent Analytics branch must exist");
  const parentSource = routeSource.slice(parentStart, studentStart);

  const reportBuild = parentSource.indexOf("const report = await buildStudentReport(studentId);");
  const finalGuard = parentSource.indexOf("const parentAccessStillValid = await db", reportBuild);
  const response = parentSource.indexOf('return NextResponse.json({ scope: "parent", ...report });', finalGuard);
  assert.ok(reportBuild >= 0 && finalGuard > reportBuild && response > finalGuard,
    "the relationship must be checked again after report reads and before student data is returned");

  const guardSource = parentSource.slice(finalGuard, response);
  for (const required of [
    'eq(users.role, "student")',
    "buildVerifiedParentLinkPredicate({",
    "parentId: ctx.user.id",
    "studentId,",
    "parentAccessStillValid.length === 0",
    "status: 403",
  ]) {
    assert.ok(guardSource.includes(required), "final parent Analytics guard must include " + required);
  }
  assert.ok(routeSource.includes('analyticsVerifiedStudent = alias(users, "analytics_verified_student")'));
  assert.ok(parentAuthorizationSource.includes('eq(verifiedByUser.role, "admin")'));
  assert.ok(parentAuthorizationSource.includes("isNotNull(parentLinks.verifiedAt)"));
  assert.ok(parentAuthorizationSource.includes("isNotNull(parentLinks.verifiedBy)"));
});
