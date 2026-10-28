import test from "node:test";
import assert from "node:assert/strict";
import { calculateOverallAttendanceRate } from "./report-metrics.mjs";

test("missing attendance is reported as unrecorded rather than 100 percent", () => {
  assert.equal(calculateOverallAttendanceRate([]), null);
  assert.equal(calculateOverallAttendanceRate(null), null);
});

test("attendance uses the same present, late, excused and absent weights as analytics", () => {
  assert.equal(
    calculateOverallAttendanceRate([
      { status: "present" },
      { status: "late" },
      { status: "excused" },
      { status: "absent" },
    ]),
    64
  );
});

test("all-present and all-absent attendance are scored correctly", () => {
  assert.equal(calculateOverallAttendanceRate([{ status: "present" }, { status: "present" }]), 100);
  assert.equal(calculateOverallAttendanceRate([{ status: "absent" }, { status: "absent" }]), 0);
});
