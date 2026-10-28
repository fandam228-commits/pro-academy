import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const analyticsRouteUrl = new URL("../app/api/analytics/route.ts", import.meta.url);

test("Analytics rosters minimize user fields and constrain teacher IDs in SQL", async () => {
  const source = await readFile(analyticsRouteUrl, "utf8");
  const adminIdOnlyRosterQuery =
    /db\\.select\\(\\{\\s*id:\\s*users\\.id\\s*\\}\\)\\.from\\(users\\)\\.where\\(eq\\(users\\.role,\\s*"student"\\)\\)/g;
  const teacherScopedRosterQuery =
    /db\\.select\\(\\{\\s*id:\\s*users\\.id\\s*\\}\\)\\.from\\(users\\)\\.where\\(and\\(\\s*eq\\(users\\.role,\\s*"student"\\),\\s*inArray\\(users\\.id,\\s*teacherStudentIds\\)\\s*\\)\\)/g;
  const broadRosterQuery =
    /db\\.select\\(\\)\\.from\\(users\\)\\.where\\(eq\\(users\\.role,\\s*"student"\\)\\)/g;

  assert.equal(
    (source.match(adminIdOnlyRosterQuery) ?? []).length,
    1,
    "admin roster enumeration should project only the student ID",
  );
  assert.equal(
    (source.match(teacherScopedRosterQuery) ?? []).length,
    1,
    "teacher roster queries must be constrained in SQL to authorized student IDs",
  );
  assert.match(
    source,
    /teacherStudentIds\\.length === 0\\s*\\?\\s*\\[\\]\\s*:/,
    "an empty authorized roster must not trigger an unscoped student query",
  );
  assert.equal(
    (source.match(broadRosterQuery) ?? []).length,
    0,
    "roster enumeration must not load full student records including password hashes and contact data",
  );
});
