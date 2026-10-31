import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reports = await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8");
const attendance = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");

for (const [name, source] of [["reports", reports], ["attendance", attendance]]) {
  test(`${name} authenticates before database setup and rejects unsupported roles`, () => {
    const auth = source.indexOf("const ctx = await getAuthContext(req)");
    const unauthorized = source.indexOf("if (!ctx)", auth);
    const setup = source.indexOf("await ensureDbSetup()");
    assert.ok(auth >= 0 && unauthorized > auth && setup > unauthorized && setup > auth);
    assert.match(source, /\["admin", "teacher", "parent", "student"\]\.includes\(role\)/);
  });

  test(`${name} requires a verified link to a current student and current admin verifier`, () => {
    assert.match(source, /eq\(parentAccount\.role, "parent"\)/);
    assert.match(source, /eq\(linkedStudentAccount\.role, "student"\)/);
    assert.match(source, /eq\(verifierAccount\.role, "admin"\)/);
    assert.match(source, /isNotNull\(parentLinks\.verifiedAt\)/);
    assert.match(source, /isNotNull\(parentLinks\.verifiedBy\)/);
    assert.match(source, /getVerifiedParentAnalyticsStudentIds\(/);
  });

  test(`${name} requires explicit selection for multiple verified children and rejects unlinked IDs`, () => {
    assert.match(source, /resolveParentAnalyticsStudentId\(/);
    assert.match(source, /student-id-required/);
    assert.match(source, /Forbidden/);
    assert.doesNotMatch(source, /studentId\s*=\s*links\[0\]\?\.studentId/);
  });
}

for (const [name, source] of [["reports", reports], ["attendance", attendance]]) {
  test(`${name} fails closed for teachers before database setup while data is not course-scoped`, () => {
    const guard = source.indexOf('if (role === "teacher")');
    const setup = source.indexOf("await ensureDbSetup()");
    assert.ok(guard >= 0 && setup > guard, "teacher access must be denied before setup");
    assert.match(source.slice(guard, setup), /status:\s*403/);
  });
}
