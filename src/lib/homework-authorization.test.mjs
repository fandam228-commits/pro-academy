import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  canManageHomework,
  canViewHomeworkSubmissionFile,
  canSubmitHomework,
  canReplaceHomeworkSubmission,
  getHomeworkFileAccessDecision,
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

test("graded submissions are rejected before a replacement file is uploaded", () => {
  assert.equal(canReplaceHomeworkSubmission({ status: "graded" }), false);
  assert.equal(canReplaceHomeworkSubmission({ status: "submitted" }), true);
  assert.equal(canReplaceHomeworkSubmission({ status: null }), true);
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


const homeworkRouteSource = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");

test("replacement update atomically rejects a concurrent grading race and cleans up the unreferenced upload", () => {
  const updateStart = homeworkRouteSource.indexOf(".update(homeworkSubmissions)");
  const updateEnd = homeworkRouteSource.indexOf("return NextResponse.json({ success: true, updated: true });", updateStart);
  assert.notEqual(updateStart, -1, "submission replacement update must exist");
  assert.notEqual(updateEnd, -1, "successful replacement response must follow the guarded update");
  const updateSource = homeworkRouteSource.slice(updateStart, updateEnd);

  assert.match(updateSource, /or\\(isNull\\(homeworkSubmissions\\.status\\),\\s*ne\\(homeworkSubmissions\\.status,\\s*"graded"\\)\\)/);
  assert.match(updateSource, /\\.returning\\(\\{\\s*id:\\s*homeworkSubmissions\\.id\\s*\\}\\)/);
  assert.match(updateSource, /if \\(updated\\.length === 0\\)/);
  assert.match(updateSource, /await del\\(storagePath,\\s*\\{\\s*token:\\s*uploadToken\\s*\\}\\)/);
});
