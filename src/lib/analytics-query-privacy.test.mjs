import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const analyticsRouteUrl = new URL("../app/api/analytics/route.ts", import.meta.url);

test("Analytics class rosters query only student IDs, not password/contact fields", async () => {
  const source = await readFile(analyticsRouteUrl, "utf8");
  const idOnlyRosterQuery =
    /db\.select\(\{\s*id:\s*users\.id\s*\}\)\.from\(users\)\.where\(eq\(users\.role,\s*"student"\)\)/g;
  const broadRosterQuery =
    /db\.select\(\)\.from\(users\)\.where\(eq\(users\.role,\s*"student"\)\)/g;

  assert.equal(
    (source.match(idOnlyRosterQuery) ?? []).length,
    2,
    "admin and teacher roster enumeration should project only the student ID",
  );
  assert.equal(
    (source.match(broadRosterQuery) ?? []).length,
    0,
    "roster enumeration must not load full student records including password hashes and contact data",
  );
});
