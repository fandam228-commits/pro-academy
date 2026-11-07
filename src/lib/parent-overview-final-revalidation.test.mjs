import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../app/api/parent/route.ts", import.meta.url), "utf8");

test("parent overview revalidates parent, student, and admin verifier after every student-data read", () => {
  const enrollmentRead = route.indexOf("const studentEnrs = await db");
  const submissionRead = route.indexOf("const studentSubs = await db");
  const attendanceRead = route.indexOf("const studentAtt = await db");
  const finalCheck = route.indexOf("const parentAccessStillValid = await db");
  const denyGuard = route.indexOf("if (parentAccessStillValid.length === 0)", finalCheck);
  const successResponse = route.indexOf("return NextResponse.json({\n      student,", denyGuard);

  assert.ok(enrollmentRead >= 0 && submissionRead > enrollmentRead && attendanceRead > submissionRead);
  assert.ok(finalCheck > attendanceRead, "the final relationship check must follow all student-data reads");
  assert.ok(denyGuard > finalCheck, "the final relationship check must be evaluated before the response");
  assert.ok(successResponse > denyGuard, "student data must be returned only after the final authorization guard");

  const finalQuery = route.slice(finalCheck, denyGuard);
  for (const required of [
    'eq(parentAccountUser.role, "parent")',
    'eq(studentAccountUser.role, "student")',
    'eq(verifiedByUser.role, "admin")',
    "isNotNull(parentLinks.verifiedAt)",
    "isNotNull(parentLinks.verifiedBy)",
    "eq(parentLinks.parentId, parentId)",
    "eq(studentAccountUser.id, studentId)",
  ]) {
    assert.ok(finalQuery.includes(required), "final query must include " + required);
  }
});

test("parent overview keeps teacher access denied and never silently selects links[0]", () => {
  assert.ok(route.includes('if (ctx.user.role !== "parent" && ctx.user.role !== "admin")'));
  assert.ok(!route.includes("links[0]"));
  assert.ok(!route.includes(".select().from(users)"));
});
