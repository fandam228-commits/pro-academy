import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(
  new URL("../app/api/attendance/route.ts", import.meta.url),
  "utf8",
);
const getStart = routeSource.indexOf("export async function GET(req: Request)");
const postStart = routeSource.indexOf("export async function POST(req: Request)");
assert.ok(getStart >= 0, "attendance GET handler must exist");
assert.ok(postStart > getStart, "attendance POST handler must follow GET");

const getSource = routeSource.slice(getStart, postStart);
const postSource = routeSource.slice(postStart);

test("attendance GET authenticates and rejects unsupported roles before database setup", () => {
  const authIndex = getSource.indexOf("const ctx = await getAuthContext(req)");
  const authGuardIndex = getSource.indexOf("if (!ctx)");
  const roleGuardIndex = getSource.indexOf('if (!["admin", "teacher", "parent", "student"].includes(role))');
  const teacherGuardIndex = getSource.indexOf('if (role === "teacher")');
  const setupIndex = getSource.indexOf("await ensureDbSetup()");

  assert.ok(authIndex >= 0, "GET must resolve the current session");
  assert.ok(authGuardIndex > authIndex, "GET must reject unauthenticated requests");
  assert.ok(roleGuardIndex > authGuardIndex, "GET must reject unsupported roles");
  assert.ok(teacherGuardIndex > roleGuardIndex, "GET must apply the teacher privacy guard");
  assert.ok(setupIndex > teacherGuardIndex, "database setup must follow authorization guards");
});

test("attendance POST authenticates, validates JSON, and authorizes the action before database setup", () => {
  const authIndex = postSource.indexOf("const ctx = await getAuthContext(req)");
  const authGuardIndex = postSource.indexOf("if (!ctx)");
  const parseIndex = postSource.indexOf("body = await req.json()");
  const actionPolicyIndex = postSource.indexOf("authorizeAttendanceWrite(ctx.user.role as string, action)");
  const denialIndex = postSource.indexOf("if (!access.ok)");
  const setupIndex = postSource.indexOf("await ensureDbSetup()");

  assert.ok(authIndex >= 0, "POST must resolve the current session");
  assert.ok(authGuardIndex > authIndex, "POST must reject unauthenticated requests");
  assert.ok(parseIndex > authGuardIndex, "POST must not parse an action before authentication");
  assert.ok(actionPolicyIndex > parseIndex, "POST must authorize the parsed action");
  assert.ok(denialIndex > actionPolicyIndex, "POST must return on denied actions");
  assert.ok(setupIndex > denialIndex, "database setup must only run after authorization succeeds");
  assert.doesNotMatch(postSource.slice(0, setupIndex), /await ensureDbSetup\(\)/,
    "no setup/migration work may occur before the authorization decision");
});

test("attendance POST uses one policy gate for bulk marking and self check-in", () => {
  const actionPolicyIndex = postSource.indexOf("authorizeAttendanceWrite(ctx.user.role as string, action)");
  const setupIndex = postSource.indexOf("await ensureDbSetup()");
  const bulkIndex = postSource.indexOf('if (action === "bulk_mark")');
  const checkInIndex = postSource.indexOf('if (action === "check_in")');

  assert.ok(actionPolicyIndex >= 0 && setupIndex > actionPolicyIndex);
  assert.ok(bulkIndex > setupIndex, "bulk marking must occur after the policy gate");
  assert.ok(checkInIndex > bulkIndex, "self check-in must occur after the policy gate");
  assert.match(postSource, /const access = authorizeAttendanceWrite\(ctx\.user\.role as string, action\)/);
});
