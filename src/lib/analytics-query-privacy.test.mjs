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

test("Analytics student report projects only the fields required by each report scope", async () => {
  const source = await readFile(analyticsRouteUrl, "utf8");
  const profileQuery = source.match(
    /const userRows = scope[\\s\\S]*?const student = userRows\\[0\\];/,
  );

  assert.ok(profileQuery, "student profile lookup must use explicit projections");
  assert.match(
    profileQuery[0],
    /select\\(\\{[\\s\\S]*?id: users\\.id,[\\s\\S]*?name: users\\.name,[\\s\\S]*?grade: users\\.grade,[\\s\\S]*?role: users\\.role,[\\s\\S]*?\\}\\)[\\s\\S]*?from\\(users\\)/,
    "teacher and non-teacher report lookups must project an explicit minimal profile",
  );
  assert.match(
    profileQuery[0],
    /scope[\\s\\S]*?select\\(\\{[\\s\\S]*?role: users\\.role,[\\s\\S]*?\\}\\)[\\s\\S]*?from\\(users\\)/,
    "teacher-scoped reports must select only identity, grade, and role",
  );
  assert.doesNotMatch(
    profileQuery[0].split(": await db")[0],
    /users\\.(email|password|phone|parentPhone|avatar|points|streak|level)/,
    "teacher report lookups must not read password hashes, contact details, or private profile metrics",
  );
  assert.doesNotMatch(
    profileQuery[0],
    /db\\.select\\(\\)\\.from\\(users\\)/,
    "analytics student report must not load every user column",
  );
});
