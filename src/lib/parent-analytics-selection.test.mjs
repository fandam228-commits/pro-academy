import test from "node:test";
import assert from "node:assert/strict";
import {
  getParentAnalyticsSelectionData,
  resolveParentAnalyticsStudentId,
} from "./analytics-report-scope.mjs";

const verifiedAt = new Date("2026-11-04T10:00:00.000Z");

test("parent selection counts unverified children for ambiguity but authorizes only admin-verified links", () => {
  const selection = getParentAnalyticsSelectionData([
    { studentId: "student-1", verifiedAt, verifiedBy: "admin-1", verifierRole: "admin" },
    { studentId: "student-2", verifiedAt: null, verifiedBy: null, verifierRole: null },
    { studentId: "student-3", verifiedAt, verifiedBy: "admin-demoted", verifierRole: "teacher" },
    { studentId: "student-1", verifiedAt, verifiedBy: "admin-1", verifierRole: "admin" },
    { studentId: " ", verifiedAt, verifiedBy: "admin-1", verifierRole: "admin" },
    null,
  ]);

  assert.deepEqual(selection.allLinkedStudentIds, ["student-1", "student-2", "student-3"]);
  assert.deepEqual(selection.verifiedStudentIds, ["student-1"]);

  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, selection.allLinkedStudentIds),
    { ok: false, reason: "student-id-required" },
  );

  const verifiedSelection = resolveParentAnalyticsStudentId("student-1", selection.allLinkedStudentIds);
  assert.deepEqual(verifiedSelection, { ok: true, studentId: "student-1" });
  assert.equal(selection.verifiedStudentIds.includes(verifiedSelection.studentId), true);

  const unverifiedSelection = resolveParentAnalyticsStudentId("student-2", selection.allLinkedStudentIds);
  assert.deepEqual(unverifiedSelection, { ok: true, studentId: "student-2" });
  assert.equal(selection.verifiedStudentIds.includes(unverifiedSelection.studentId), false);

  const demotedVerifierSelection = resolveParentAnalyticsStudentId("student-3", selection.allLinkedStudentIds);
  assert.deepEqual(demotedVerifierSelection, { ok: true, studentId: "student-3" });
  assert.equal(selection.verifiedStudentIds.includes(demotedVerifierSelection.studentId), false);
});

test("duplicate links to one distinct child do not create false ambiguity", () => {
  const selection = getParentAnalyticsSelectionData([
    { studentId: "student-1", verifiedAt, verifiedBy: "admin-1", verifierRole: "admin" },
    { studentId: "student-1", verifiedAt: null, verifiedBy: null, verifierRole: null },
  ]);

  assert.deepEqual(selection.allLinkedStudentIds, ["student-1"]);
  assert.deepEqual(selection.verifiedStudentIds, ["student-1"]);
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, selection.allLinkedStudentIds),
    { ok: true, studentId: "student-1" },
  );
});

test("a single unverified child is never authorized by default", () => {
  const selection = getParentAnalyticsSelectionData([
    { studentId: "student-1", verifiedAt: null, verifiedBy: null, verifierRole: null },
  ]);
  const resolution = resolveParentAnalyticsStudentId(null, selection.allLinkedStudentIds);

  assert.deepEqual(resolution, { ok: true, studentId: "student-1" });
  assert.equal(selection.verifiedStudentIds.includes(resolution.studentId), false);
});

test("malformed parent link results fail closed", () => {
  assert.deepEqual(getParentAnalyticsSelectionData(null), {
    allLinkedStudentIds: [],
    verifiedStudentIds: [],
  });
});
