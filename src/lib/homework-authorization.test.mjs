import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  canManageHomework,
  canViewHomeworkSubmissionFile,
  canSubmitHomework,
  getHomeworkFileAccessDecision,
  canAssignHomeworkToCourse,
} from "./homework-authorization.mjs";

test("teachers can manage only homework they own", () => {
  assert.equal(
    canManageHomework({ role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1" }),
    true
  );
  assert.equal(
    canManageHomework({ role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-2" }),
    false
  );
  assert.equal(
    canManageHomework({ role: "teacher", requesterId: "teacher-1", homeworkTeacherId: null }),
    false
  );
});

test("admins can manage homework while students and parents cannot", () => {
  assert.equal(
    canManageHomework({ role: "admin", requesterId: "admin-1", homeworkTeacherId: "teacher-2" }),
    true
  );
  assert.equal(
    canManageHomework({ role: "student", requesterId: "student-1", homeworkTeacherId: "teacher-1" }),
    false
  );
  assert.equal(
    canManageHomework({ role: "parent", requesterId: "parent-1", homeworkTeacherId: "teacher-1" }),
    false
  );
});

test("only the submission owner, owning teacher, or admin can view a submission file", () => {
  const context = {
    requesterId: "student-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
  };
  assert.equal(canViewHomeworkSubmissionFile({ role: "student", ...context }), true);
  assert.equal(
    canViewHomeworkSubmissionFile({ role: "student", ...context, requesterId: "student-2" }),
    false
  );
  assert.equal(
    canViewHomeworkSubmissionFile({ role: "teacher", ...context, requesterId: "teacher-1" }),
    true
  );
  assert.equal(
    canViewHomeworkSubmissionFile({ role: "teacher", ...context, requesterId: "teacher-2" }),
    false
  );
  assert.equal(
    canViewHomeworkSubmissionFile({ role: "admin", requesterId: "admin-1", ...context }),
    true
  );
});

test("parents, unknown roles, and incomplete relationships are denied file access", () => {
  assert.equal(
    canViewHomeworkSubmissionFile({
      role: "parent",
      requesterId: "parent-1",
      submissionStudentId: "student-1",
      homeworkTeacherId: "teacher-1",
    }),
    false
  );
  assert.equal(
    canViewHomeworkSubmissionFile({
      role: "teacher",
      requesterId: "teacher-1",
      submissionStudentId: "student-1",
    }),
    false
  );
  assert.equal(
    canViewHomeworkSubmissionFile({
      role: "student",
      requesterId: "student-1",
      homeworkTeacherId: "teacher-1",
    }),
    false
  );
  assert.equal(
    canViewHomeworkSubmissionFile({
      role: "teacher",
      requesterId: "",
      homeworkTeacherId: "teacher-1",
    }),
    false
  );
});

test("only student accounts may submit homework answers and only for their recorded grade", () => {
  assert.equal(canSubmitHomework({ role: "student" }), true);
  assert.equal(canSubmitHomework({ role: "student", studentGrade: "Third Secondary", homeworkGrade: "Third Secondary" }), true);
  assert.equal(canSubmitHomework({ role: "student", studentGrade: "First Secondary", homeworkGrade: "Third Secondary" }), false);
  assert.equal(canSubmitHomework({ role: "teacher" }), false);
  assert.equal(canSubmitHomework({ role: "admin" }), false);
  assert.equal(canSubmitHomework({ role: "parent" }), false);
  assert.equal(canSubmitHomework({ role: null }), false);
});

test("homework file access hides missing and unauthorized records behind one not-found decision", () => {
  const allowed = {
    submissionFound: true,
    homeworkFound: true,
    role: "student",
    requesterId: "student-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
  };
  assert.equal(getHomeworkFileAccessDecision(allowed), "allowed");
  assert.equal(getHomeworkFileAccessDecision({ ...allowed, submissionFound: false }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...allowed, homeworkFound: false }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...allowed, requesterId: "student-2" }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...allowed, role: "teacher", requesterId: "teacher-2" }), "not-found");
  assert.equal(getHomeworkFileAccessDecision({ ...allowed, role: "parent", requesterId: "parent-1" }), "not-found");
});


test("teachers can attach homework only to a course they own", () => {
  assert.equal(canAssignHomeworkToCourse({
    role: "teacher", requesterId: "teacher-1", courseTeacherId: "teacher-1",
  }), true);
  assert.equal(canAssignHomeworkToCourse({
    role: "teacher", requesterId: "teacher-1", courseTeacherId: "teacher-2",
  }), false);
});

test("admins can attach homework to another teacher's existing course", () => {
  assert.equal(canAssignHomeworkToCourse({
    role: "admin", requesterId: "admin-1", courseTeacherId: "teacher-2",
  }), true);
});

test("course assignment authorization fails closed for missing owners, identities, and unsupported roles", () => {
  assert.equal(canAssignHomeworkToCourse({
    role: "teacher", requesterId: "teacher-1", courseTeacherId: "",
  }), false);
  assert.equal(canAssignHomeworkToCourse({
    role: "teacher", requesterId: "", courseTeacherId: "teacher-1",
  }), false);
  assert.equal(canAssignHomeworkToCourse({
    role: "parent", requesterId: "parent-1", courseTeacherId: "teacher-1",
  }), false);
});

test("homework create route verifies course existence and ownership before inserting the assignment", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const createStart = route.indexOf('if (action === "create")');
  const gradeStart = route.indexOf('if (action === "grade")', createStart);
  assert.notEqual(createStart, -1);
  assert.notEqual(gradeStart, -1);
  const createSource = route.slice(createStart, gradeStart);
  const ownershipCheck = createSource.indexOf("canAssignHomeworkToCourse(");
  const insert = createSource.indexOf("await db.insert(homework).values(newHw)");
  assert.ok(ownershipCheck >= 0 && insert > ownershipCheck,
    "course ownership must be checked before a homework record is inserted");
  assert.match(createSource, /\.from\(courses\)/,
    "the course owner must be loaded from the database, not trusted from request input");
  assert.match(createSource, /if\s*\(!course\)/,
    "a supplied course ID must refer to an existing course");
  assert.match(createSource, /courseId,\s*unit:/,
    "the persisted homework must use the validated course ID");
});
