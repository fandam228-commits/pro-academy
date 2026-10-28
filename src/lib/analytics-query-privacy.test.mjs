import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const analyticsRouteUrl = new URL("../app/api/analytics/route.ts", import.meta.url);

test("Analytics rosters minimize user fields and constrain teacher IDs in SQL", async () => {
  const source = await readFile(analyticsRouteUrl, "utf8");
  const adminIdOnlyRosterQuery =
    /db\.select\(\{\s*id:\s*users\.id\s*\}\)\.from\(users\)\.where\(eq\(users\.role,\s*"student"\)\)/g;
  const broadRosterQuery =
    /db\.select\(\)\.from\(users\)\.where\(eq\(users\.role,\s*"student"\)\)/g;
  const teacherRosterBlock = source.match(
    /const visibleStudents = teacherStudentIds\.length === 0[\s\S]*?const reports =/,
  );

  assert.equal(
    (source.match(adminIdOnlyRosterQuery) ?? []).length,
    1,
    "admin roster enumeration should project only the student ID",
  );
  assert.ok(teacherRosterBlock, "teacher roster must explicitly short-circuit an empty authorization scope");
  assert.match(
    teacherRosterBlock[0],
    /inArray\(\s*users\.id,\s*teacherStudentIds\s*\)/,
    "teacher roster queries must be constrained in SQL to authorized student IDs",
  );
  assert.match(
    teacherRosterBlock[0],
    /eq\(\s*users\.role,\s*"student"\s*\)/,
    "teacher roster query must still reject non-student accounts",
  );
  assert.doesNotMatch(
    teacherRosterBlock[0],
    /students\.filter/,
    "teacher roster authorization must not be deferred to in-memory filtering",
  );
  assert.equal(
    (source.match(broadRosterQuery) ?? []).length,
    0,
    "roster enumeration must not load full student records including password hashes and contact data",
  );
});
