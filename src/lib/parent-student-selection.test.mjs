import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveParentStudentSelection } from "./parent-student-selection.mjs";

test("a parent with one linked child may use the unambiguous default", () => {
  assert.deepEqual(resolveParentStudentSelection({ linkedStudentIds: ["student-1"] }), {
    status: "allowed", studentId: "student-1",
  });
});

test("a parent with multiple distinct children must select one explicitly", () => {
  assert.deepEqual(resolveParentStudentSelection({ linkedStudentIds: ["student-1", "student-2"] }), {
    status: "selection-required", studentId: null,
  });
  assert.deepEqual(resolveParentStudentSelection({
    requestedStudentId: "student-2", linkedStudentIds: ["student-1", "student-2"],
  }), { status: "allowed", studentId: "student-2" });
});

test("duplicate legacy link rows do not create false ambiguity", () => {
  assert.deepEqual(resolveParentStudentSelection({ linkedStudentIds: ["student-1", "student-1"] }), {
    status: "allowed", studentId: "student-1",
  });
});

test("a parent cannot select an unlinked child", () => {
  assert.deepEqual(resolveParentStudentSelection({
    requestedStudentId: "student-3", linkedStudentIds: ["student-1", "student-2"],
  }), { status: "not-linked", studentId: null });
});

test("missing, blank, or malformed links fail closed", () => {
  assert.equal(resolveParentStudentSelection({ linkedStudentIds: [] }).status, "no-linked-student");
  assert.equal(resolveParentStudentSelection({ requestedStudentId: " ", linkedStudentIds: ["student-1"] }).status, "invalid-student-id");
  assert.equal(resolveParentStudentSelection({ linkedStudentIds: ["student-1", ""] }).status, "invalid-links");
});

for (const [name, path] of [
  ["Analytics", "../app/api/analytics/route.ts"],
  ["reports", "../app/api/reports/route.ts"],
  ["attendance", "../app/api/attendance/route.ts"],
]) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  test(`${name} route uses the shared parent-child selection policy`, () => {
    assert.match(source, /resolveParentStudentSelection\(/);
    assert.match(source, /selection\.status !== "allowed"/);
    assert.match(source, /selection\.status === "selection-required"/);
  });
}
