import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const authorizationSource = await readFile(new URL("./homework-submission-authorization.mjs", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");

test("submission authorization locks current homework, student, and eligible enrollment rows", () => {
  const homeworkRead = authorizationSource.indexOf(".from(homework)");
  const studentRead = authorizationSource.indexOf(".from(users)");
  const enrollmentRead = authorizationSource.indexOf(".from(enrollments)");
  assert.ok(homeworkRead >= 0 && studentRead > homeworkRead && enrollmentRead > studentRead);
  assert.match(authorizationSource.slice(homeworkRead, studentRead), /\.for\("share"\)/);
  assert.match(authorizationSource.slice(studentRead, enrollmentRead), /\.for\("share"\)/);
  assert.match(authorizationSource.slice(enrollmentRead), /\.for\("share"\)/);
  assert.match(authorizationSource, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
  assert.match(authorizationSource, /student\.role !== "student"/);
  assert.match(authorizationSource, /canSubmitHomework\(/);
  assert.match(authorizationSource, /canAccessHomeworkCourse\(/);
});

test("locked current authorization runs before submission rows are read or written", () => {
  const authorization = routeSource.indexOf("lockCurrentHomeworkSubmissionAccess(");
  const existingRead = routeSource.indexOf("const lockedExisting", authorization);
  const insert = routeSource.indexOf("lockedTx.insert(homeworkSubmissions).values(sub)", authorization);
  assert.ok(authorization >= 0 && existingRead > authorization && insert > existingRead);
  assert.match(routeSource, /studentName: currentStudent\.name/);
  assert.match(routeSource, /notifyTeacherId: currentHomework\.teacherId/);
});

test("notification failure after commit cannot turn a saved submission into an ambiguous failure", () => {
  const inserted = routeSource.indexOf('if (persistence.kind === "inserted")');
  const notification = routeSource.indexOf("await notifyUser(", inserted);
  const catchIndex = routeSource.indexOf("Homework submission notification failed; details withheld.", notification);
  const response = routeSource.indexOf("return NextResponse.json({ success: true, submission:", notification);
  assert.ok(inserted >= 0 && notification > inserted && catchIndex > notification && response > catchIndex);
  assert.doesNotMatch(routeSource.slice(notification, response), /console\.error\([^)]*,\s*error/);
});
