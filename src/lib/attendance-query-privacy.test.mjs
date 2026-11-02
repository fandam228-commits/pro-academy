import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");

test("attendance roster queries select only the fields returned to the roster", () => {
  const rosterStart = route.indexOf('const allStudents = role === "admin"');
  const rosterEnd = route.indexOf("const visibleStudentIds", rosterStart);
  assert.ok(rosterStart >= 0 && rosterEnd > rosterStart, "the roster query block must exist");

  const rosterSource = route.slice(rosterStart, rosterEnd);
  const projectedUserQuery = /db\.select\(\{\s*id:\s*users\.id,\s*name:\s*users\.name,\s*grade:\s*users\.grade\s*\}\)\.from\(users\)/g;
  assert.equal(
    (rosterSource.match(projectedUserQuery) || []).length,
    2,
    "both admin and teacher roster reads must project only id, name, and grade",
  );
  assert.doesNotMatch(
    rosterSource,
    /db\.select\(\)\.from\(users\)/,
    "attendance roster generation must not load full user records into memory",
  );
});
