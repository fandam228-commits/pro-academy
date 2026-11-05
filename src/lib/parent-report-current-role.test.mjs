import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reportsRoute = await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8");
const attendanceRoute = await readFile(new URL("../app/api/attendance/route.ts", import.meta.url), "utf8");

function assertMixedVerificationSelection(source, requestedId, routeName) {
  assert.ok(source.includes("leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))"),
    routeName + " must retain unverified links in the ambiguity query");
  assert.ok(source.includes("verifierRole: verifiedByUser.role"));
  assert.ok(source.includes('eq(parentAccount.role, "parent")'));
  assert.ok(source.includes('eq(users.role, "student")'));
  assert.ok(source.includes("getParentAnalyticsSelectionData(links)"));
  assert.ok(source.includes("allLinkedStudentIds: linkedStudentIds"));
  assert.ok(source.includes("resolveParentAnalyticsStudentId(" + requestedId + ", linkedStudentIds)"));
  assert.ok(source.includes("verifiedStudentIds.includes(resolution.studentId)"));
  assert.ok(!source.includes('eq(verifiedByUser.role, "admin")'),
    routeName + " must not filter unverified children out before checking ambiguity");
  assert.ok(!source.includes("isNotNull(parentLinks.verifiedAt)"));
  assert.ok(!source.includes("isNotNull(parentLinks.verifiedBy)"));
  assert.ok(!source.includes("links[0]"),
    routeName + " must not silently select the first linked child");
}

test("weekly reports require explicit selection across all linked children and current parent/student roles", () => {
  const start = reportsRoute.indexOf('if (role === "parent")');
  const end = reportsRoute.indexOf('} else if (role === "student")', start);
  assert.ok(start >= 0 && end > start, "parent report branch must exist");
  assertMixedVerificationSelection(reportsRoute.slice(start, end), "studentId", "reports");
});

test("attendance reports require explicit selection across all linked children and current parent/student roles", () => {
  const start = attendanceRoute.indexOf('if (role === "parent")');
  const end = attendanceRoute.indexOf("// ============ STUDENT: own records ============", start);
  assert.ok(start >= 0 && end > start, "parent attendance branch must exist");
  assertMixedVerificationSelection(attendanceRoute.slice(start, end), "requestedStudent", "attendance");
});
