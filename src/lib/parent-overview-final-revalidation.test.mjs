import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../app/api/parent/route.ts", import.meta.url), "utf8");

test("parent overview revalidates parent, student, and admin verifier after every student-data read", () => {
  const enrollmentRead = route.indexOf("const studentEnrs = await db");
  const submissionRead = route.indexOf("const studentSubs = await db");
  const attendanceRead = route.indexOf("const studentAtt = await db");
  const finalCheck = route.indexOf("const parentAccessStillValid = await db");
  const response = route.indexOf("return NextResponse.json({", finalCheck);

  assert.ok(enrollmentRead >= 0 && submissionRead > enrollmentRead && attendanceRead > submissionRead);
  assert.ok(finalCheck > attendanceRead, "the final relationship check must follow all student-data reads");
  assert.ok(response > finalCheck, "student data must not be returned before final authorization");

  const finalQuery = route.slice(finalCheck, response);
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
