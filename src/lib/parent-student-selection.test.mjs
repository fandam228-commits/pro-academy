import test from "node:test";
import assert from "node:assert/strict";
import { resolveParentStudentSelection } from "./parent-student-selection.mjs";

test("parent with one unique linked student may omit studentId", () => {
  assert.deepEqual(resolveParentStudentSelection(null, ["student-1", "student-1"]), {
    ok: true,
    studentId: "student-1",
  });
});

test("parent with multiple linked students must explicitly select one", () => {
  assert.deepEqual(resolveParentStudentSelection(null, ["student-1", "student-2"]), {
    ok: false,
    reason: "student-id-required",
  });
  assert.deepEqual(resolveParentStudentSelection("student-2", ["student-1", "student-2"]), {
    ok: true,
    studentId: "student-2",
  });
});

test("parent cannot select a student that is not linked", () => {
  assert.deepEqual(resolveParentStudentSelection("student-3", ["student-1", "student-2"]), {
    ok: false,
    reason: "forbidden",
  });
});

test("parent with no valid linked students is denied", () => {
  assert.deepEqual(resolveParentStudentSelection(null, []), {
    ok: false,
    reason: "no-linked-student",
  });
});

test("empty and malformed selections fail closed", () => {
  assert.deepEqual(resolveParentStudentSelection("", ["student-1"]), {
    ok: false,
    reason: "invalid-student-id",
  });
  assert.deepEqual(resolveParentStudentSelection(null, ["student-1", null]), {
    ok: false,
    reason: "invalid-links",
  });
  assert.deepEqual(resolveParentStudentSelection(null, "student-1"), {
    ok: false,
    reason: "invalid-links",
  });
});

test("attendance API resolves parent links only through current student accounts", async () => {
  const { readFile } = await import("node:fs/promises");
  const route = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");
  const parentBlock = route.match(/if \(role === "parent"\) \{[\s\S]*?return NextResponse\.json\(\{ role: "parent"/);
  assert.ok(parentBlock, "parent attendance branch should exist");
  assert.match(parentBlock[0], /innerJoin\(users, eq\(parentLinks\.studentId, users\.id\)\)/);
  assert.match(parentBlock[0], /eq\(users\.role, "student"\)/);
  assert.match(parentBlock[0], /resolveParentStudentSelection/);
  assert.doesNotMatch(parentBlock[0], /links\[0\]/, "must never silently select the first child");
});
