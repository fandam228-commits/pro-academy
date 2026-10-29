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
    /db\\.select\\(\\)\\.from\\(users\\)/,
    "report generation must not load the entire user row",
  );
  assert.match(reportSource, /id:\\s*users\\.id/);
  assert.match(reportSource, /name:\\s*users\\.name/);
  assert.match(reportSource, /grade:\\s*users\\.grade/);
  assert.match(reportSource, /points:\\s*users\\.points/);
  assert.match(reportSource, /streak:\\s*users\\.streak/);
  assert.match(reportSource, /level:\\s*users\\.level/);
});

test("teacher-scoped report profile query verifies the account role in SQL", () => {
  const reportSource = routeSource.slice(reportStart, reportEnd);
  assert.match(
    reportSource,
    /eq\\(users\\.role, "student"\\)/,
    "teacher-scoped profile lookup must fail closed for non-student or stale accounts",
  );
});
