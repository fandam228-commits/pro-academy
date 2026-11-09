import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homework grading and deletion routes use transaction-locked authorization helpers", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const gradeStart = route.indexOf('if (action === "grade")');
  const deleteStart = route.indexOf('if (action === "delete")', gradeStart);
  const invalidStart = route.indexOf('return NextResponse.json({ error: "Invalid action" }', deleteStart);
  assert.ok(gradeStart >= 0 && deleteStart > gradeStart && invalidStart > deleteStart);

  const gradeBlock = route.slice(gradeStart, deleteStart);
  const deleteBlock = route.slice(deleteStart, invalidStart);
  assert.match(gradeBlock, /gradeHomeworkSubmission\(/);
  assert.match(deleteBlock, /deleteHomeworkWithAuthorization\(/);
  assert.doesNotMatch(gradeBlock, /await db\.update\(homeworkSubmissions\)/,
    "grading writes must be performed inside the authorization transaction");
  assert.doesNotMatch(deleteBlock, /await db\.delete\(homework\)/,
    "deletion must be performed inside the authorization transaction");
});
