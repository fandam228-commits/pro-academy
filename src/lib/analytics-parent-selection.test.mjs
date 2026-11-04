import test from "node:test";
import assert from "node:assert/strict";
import { filterParentLinkedStudentIds, resolveParentAnalyticsStudent } from "./analytics-parent-selection.mjs";

test("one linked student is selected by default", () => {
  assert.deepEqual(resolveParentAnalyticsStudent(null, ["student-1"]), {
    status: "selected",
    studentId: "student-1",
  });
});

test("multiple linked students require an explicit selection", () => {
  assert.deepEqual(resolveParentAnalyticsStudent(null, ["student-1", "student-2"]), {
    status: "ambiguous",
  });
});

test("duplicate links do not create false ambiguity", () => {
  assert.deepEqual(resolveParentAnalyticsStudent(null, ["student-1", "student-1"]), {
    status: "selected",
    studentId: "student-1",
  });
});

test("no linked students returns missing", () => {
  assert.deepEqual(resolveParentAnalyticsStudent(null, []), { status: "missing" });
});

test("an explicit selection is accepted only when it belongs to the linked-student set", () => {
  assert.deepEqual(resolveParentAnalyticsStudent("student-1", ["student-1", "student-2"]), {
    status: "selected",
    studentId: "student-1",
  });
  assert.deepEqual(
    resolveParentAnalyticsStudent("unlinked-student", ["student-1", "student-2"]),
    { status: "missing" },
  );
});

test("malformed link data and empty explicit selections fail closed", () => {
  assert.deepEqual(resolveParentAnalyticsStudent(null, "student-1"), { status: "missing" });
  assert.deepEqual(resolveParentAnalyticsStudent(null, ["student-1", null]), { status: "missing" });
  assert.deepEqual(resolveParentAnalyticsStudent("", ["student-1"]), { status: "missing" });
});


test("parent analytics ignores linked IDs that do not resolve to student accounts", () => {
  assert.deepEqual(
    filterParentLinkedStudentIds(
      ["student-1", "teacher-1", "missing-user", "student-1"],
      ["student-1"],
    ),
    ["student-1"],
  );
});

test("parent analytics fails closed on malformed student-account lookup data", () => {
  assert.deepEqual(filterParentLinkedStudentIds(["student-1"], null), []);
  assert.deepEqual(filterParentLinkedStudentIds(null, ["student-1"]), []);
});
