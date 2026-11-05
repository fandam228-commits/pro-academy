import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(
  new URL("../app/api/homework/file/[id]/route.ts", import.meta.url),
  "utf8",
);

test("private homework file route resolves submission and current course ownership in one joined query", () => {
  const lookupStart = route.indexOf("const [fileAccessRow] = await db");
  const decisionStart = route.indexOf("const accessDecision = getHomeworkFileAccessDecision");
  assert.ok(lookupStart >= 0 && decisionStart > lookupStart,
    "the joined authorization lookup must happen before the access decision");

  const lookup = route.slice(lookupStart, decisionStart);
  assert.match(lookup, /submission:\s*\{/,
    "the query must project only the submission fields needed for authorization and streaming");
  assert.match(lookup, /studentId: homeworkSubmissions\.studentId/);
  assert.match(lookup, /storagePath: homeworkSubmissions\.storagePath/);
  assert.match(lookup, /fileName: homeworkSubmissions\.fileName/);
  assert.match(lookup, /homeworkTeacherId: homework\.teacherId/);
  assert.match(lookup, /homeworkCourseId: homework\.courseId/);
  assert.match(lookup, /courseTeacherId: courses\.teacherId/);
  assert.match(lookup, /\.from\(homeworkSubmissions\)/);
  assert.match(lookup, /\.innerJoin\(homework, eq\(homeworkSubmissions\.homeworkId, homework\.id\)\)/);
  assert.match(lookup, /\.leftJoin\(courses, eq\(homework\.courseId, courses\.id\)\)/);
  assert.match(lookup, /\.where\(eq\(homeworkSubmissions\.id, id\)\)/);
  assert.doesNotMatch(lookup, /const homeworkRows = sub[\s\S]*?await db/,
    "the endpoint must not load the homework/course relationship in a second query");
  assert.match(route, /const sub = fileAccessRow\?\.submission/);
  assert.match(route, /homeworkTeacherId: fileAccessRow\?\.homeworkTeacherId/);
  assert.match(route, /homeworkCourseId: fileAccessRow\?\.homeworkCourseId/);
  assert.match(route, /courseTeacherId: fileAccessRow\?\.courseTeacherId/);
  assert.ok(route.includes("getHomeworkFileAccessDecision"));
});
