import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const parentRoute = await readFile(new URL("../app/api/parent/route.ts", import.meta.url), "utf8");

test("parent overview rejects unverified or ambiguous selection before reading student data", () => {
  const roleGuard = parentRoute.indexOf('if (ctx.user.role !== "parent" && ctx.user.role !== "admin")');
  const selectionRead = parentRoute.indexOf(".from(parentLinks)");
  const verifiedGuard = parentRoute.indexOf("if (!verifiedStudentIds.includes(resolution.studentId))");
  const profileRead = parentRoute.indexOf("const studentList = await db");
  const enrollmentRead = parentRoute.indexOf("const studentEnrs = await db");
  const quizRead = parentRoute.indexOf("const studentSubs = await db");
  const attendanceRead = parentRoute.indexOf("const studentAtt = await db");

  assert.ok(roleGuard >= 0 && selectionRead > roleGuard,
    "the endpoint must reject unsupported roles before querying parent links");
  assert.ok(verifiedGuard > selectionRead,
    "the link selection must be resolved and verified before student data reads");
  for (const [name, read] of [
    ["profile", profileRead],
    ["enrollments", enrollmentRead],
    ["quiz submissions", quizRead],
    ["attendance", attendanceRead],
  ]) {
    assert.ok(read > verifiedGuard, name + " must not be read before current verified-link authorization");
  }

  const profileProjection = parentRoute.slice(profileRead, enrollmentRead);
  assert.match(profileProjection, /id: users\.id[\s\S]*name: users\.name[\s\S]*grade: users\.grade/);
  assert.doesNotMatch(profileProjection, /\.select\(\)\.from\(users\)/,
    "the overview must keep an explicit profile field allowlist");
});
