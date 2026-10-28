import test from "node:test";
import assert from "node:assert/strict";
import { resolveParentAnalyticsStudent } from "./analytics-parent-selection.mjs";

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

test("explicit student selection is returned for the authorization check", () => {
  assert.deepEqual(resolveParentAnalyticsStudent("student-2", ["student-1"]), {
    status: "selected",
    studentId: "student-2",
  });
});
