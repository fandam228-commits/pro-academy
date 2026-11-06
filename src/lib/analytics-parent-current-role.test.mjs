import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/analytics/route.ts", import.meta.url), "utf8");

test("parent analytics revalidates the parent's current database role before trusting verified links", () => {
  const parentStart = routeSource.indexOf('if (role === "parent")');
  const studentStart = routeSource.indexOf("// ---------- STUDENT: own report only ----------", parentStart);
  assert.notEqual(parentStart, -1, "parent branch must exist");
  assert.notEqual(studentStart, -1, "student branch must follow parent branch");
  const parentSource = routeSource.slice(parentStart, studentStart);

  assert.match(parentSource, /\.innerJoin\(parentAccount, eq\(parentLinks\.parentId, parentAccount\.id\)\)/);
  assert.match(parentSource, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(parentSource, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(parentSource, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(parentSource, /eq\(users\.role, "student"\)/);
});
