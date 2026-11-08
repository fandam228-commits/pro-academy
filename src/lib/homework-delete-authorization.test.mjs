import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routeSource = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
const helperSource = await readFile(new URL("./homework-delete-authorization.mjs", import.meta.url), "utf8");

test("homework deletion locks live role and ownership rows before deleting in the same transaction", () => {
  const deleteStart = routeSource.indexOf('if (action === "delete")');
  const invalidAction = routeSource.indexOf('return NextResponse.json({ error: "Invalid action" }, { status: 400 });', deleteStart);
  assert.ok(deleteStart >= 0 && invalidAction > deleteStart);
  const deleteBlock = routeSource.slice(deleteStart, invalidAction);
  const transaction = deleteBlock.indexOf("await db.transaction(async (tx) =>");
  const authorization = deleteBlock.indexOf("lockHomeworkDeletionAuthorization(", transaction);
  const deletion = deleteBlock.indexOf(".delete(homework)", authorization);
  assert.ok(transaction >= 0 && authorization > transaction && deletion > authorization,
    "the authorization lock and DELETE must execute in one transaction");
  assert.match(deleteBlock, /\.returning\(\{ id: homework\.id \}\)/);
  assert.match(deleteBlock, /if \(!deletion\.allowed\)/);
  assert.doesNotMatch(deleteBlock, /ownRows|await db\.delete\(homework\)/,
    "the former unprotected preflight-then-delete path must be absent");
});

test("homework deletion authorization locks the current account, assignment, and linked course rows", () => {
  const lockCalls = helperSource.match(/\.for\("share"\)/g) || [];
  assert.equal(lockCalls.length, 3,
    "account, homework, and course rows must be locked before the delete");
  assert.match(helperSource, /account\.role !== sessionRole/,
    "a stale teacher/admin session role must not authorize deletion");
  assert.match(helperSource, /canManageHomework\(/);
  assert.match(helperSource, /homeworkCourseId: assignment\.courseId/);
  assert.match(helperSource, /courseTeacherId/);
});
