import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");

test("legacy homework route fails closed before reading or writing submission data when a file is attached", () => {
  const multipartStart = route.indexOf('if (contentType.includes("multipart/form-data"))');
  const guard = route.indexOf("File attachments are temporarily unavailable until private homework storage is enabled.");
  const homeworkRead = route.indexOf(
    "const hw = await db.select().from(homework).where(eq(homework.id, homeworkId));",
    multipartStart
  );

  assert.notEqual(multipartStart, -1, "multipart submission route must exist");
  assert.notEqual(guard, -1, "file uploads must return the explicit temporary block response");
  assert.notEqual(homeworkRead, -1, "homework lookup must remain available for text-only submissions");
  assert.ok(guard < homeworkRead, "file attachments must be rejected before database reads or writes");
  assert.match(route, /status:\s*503/);
  assert.match(route, /Cache-Control.*no-store/);
});

test("legacy public Blob upload implementation is absent from the homework route", () => {
  assert.doesNotMatch(route, /from ["']@vercel\/blob["']/);
  assert.doesNotMatch(route, /access:\s*["']public["']/);
  assert.doesNotMatch(route, /await\s+put\(/);
});

test("text-only submission and replacement paths remain present", () => {
  assert.match(route, /const answerText = String\(form\.get\("answerText"\) \|\| ""\)/);
  assert.match(route, /if \(existing\.length > 0\)/);
  assert.match(route, /answerText, fileName: fileName \?\? existing\[0\]\.fileName/);
});
