import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(
  new URL("../app/api/homework/file/[id]/route.ts", import.meta.url),
  "utf8",
);

test("private homework file route derives current course ownership before authorizing teachers", () => {
  assert.ok(route.includes("leftJoin(courses, eq(homework.courseId, courses.id))"));
  assert.ok(route.includes("courseId: homework.courseId"));
  assert.ok(route.includes("courseTeacherId: courses.teacherId"));
  assert.ok(route.includes("homeworkCourseId: homeworkRow?.courseId"));
  assert.ok(route.includes("courseTeacherId: homeworkRow?.courseTeacherId"));
  assert.ok(route.includes("getHomeworkFileAccessDecision"));
});
