import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reportsRoute = await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8");
const attendanceRoute = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");

test("weekly reports revalidate the current parent role in the same verified-link query", () => {
  const start = reportsRoute.indexOf('if (role === "parent")');
  const end = reportsRoute.indexOf('} else if (role === "student")', start);
  assert.ok(start >= 0 && end > start, "parent report branch must exist");
  const source = reportsRoute.slice(start, end);

  assert.match(reportsRoute, /const parentAccount = alias\(users, "reports_parent_account"\)/);
  assert.match(source, /innerJoin\(parentAccount, eq\(parentLinks\.parentId, parentAccount\.id\)\)/);
  assert.match(source, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(source, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(source, /eq\(users\.role, "student"\)/);
  assert.match(source, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(source, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(source, /isNotNull\(parentLinks\.verifiedBy\)/);
});

test("attendance reports revalidate the current parent role in the same verified-link query", () => {
  const start = attendanceRoute.indexOf('if (role === "parent")');
  const end = attendanceRoute.indexOf("// ============ STUDENT: own records ============", start);
  assert.ok(start >= 0 && end > start, "parent attendance branch must exist");
  const source = attendanceRoute.slice(start, end);

  assert.match(attendanceRoute, /const parentAccount = alias\(users, "attendance_parent_account"\)/);
  assert.match(source, /innerJoin\(parentAccount, eq\(parentLinks\.parentId, parentAccount\.id\)\)/);
  assert.match(source, /eq\(parentAccount\.role, "parent"\)/);
  assert.match(source, /eq\(parentLinks\.parentId, ctx\.user\.id\)/);
  assert.match(source, /eq\(users\.role, "student"\)/);
  assert.match(source, /eq\(verifiedByUser\.role, "admin"\)/);
  assert.match(source, /isNotNull\(parentLinks\.verifiedAt\)/);
  assert.match(source, /isNotNull\(parentLinks\.verifiedBy\)/);
});
