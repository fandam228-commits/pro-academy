import test from "node:test";
import assert from "node:assert/strict";
import { attendanceRate, calculatePerformanceIndex } from "./analytics-metrics.mjs";

test("attendance with no records is unreported, not 100 percent", () => {
  assert.equal(attendanceRate([]), null);
  assert.equal(attendanceRate(null), null);
});

test("attendance rate accounts for present, late, excused, and absent records", () => {
  assert.equal(
    attendanceRate([
      { status: "present" },
      { status: "late" },
      { status: "excused" },
      { status: "absent" },
    ]),
    64
  );
});

test("performance index excludes and reweights unreported attendance", () => {
  assert.equal(
    calculatePerformanceIndex({ avgScore: 80, hwAvg: 70, attRate: null, hwCompletion: 60 }),
    73
  );
});

test("performance index includes attendance when it is reported", () => {
  assert.equal(
    calculatePerformanceIndex({ avgScore: 80, hwAvg: 70, attRate: 50, hwCompletion: 60 }),
    69
  );
});
