import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  canManageHomework,
  canViewHomeworkSubmissionFile,
  canSubmitHomework,
  canAccessHomeworkGrade,
  canAccessHomeworkCourse,
  getHomeworkFileAccessDecision,
  canAssignHomeworkToCourse,
  canReplaceHomeworkSubmission,
} from "./homework-authorization.mjs";

test("teachers can manage only homework whose recorded teacher and current course owner match", () => {
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: null, courseTeacherId: null,
    }),
    true,
    "grade-only homework remains scoped to its recorded teacher",
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-2",
      homeworkCourseId: null, courseTeacherId: null,
    }),
    false,
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: null,
      homeworkCourseId: null, courseTeacherId: null,
    }),
    false,
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: "course-1", courseTeacherId: "teacher-1",
    }),
    true,
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: "course-1", courseTeacherId: "teacher-2",
    }),
    false,
    "a former teacher must lose access when the course is reassigned",
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: "course-missing", courseTeacherId: null,
    }),
    false,
    "a missing course owner must fail closed",
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      courseTeacherId: "teacher-1",
    }),
    false,
    "missing course-scope data must not be mistaken for grade-only homework",
  );
});

test("admins can manage homework while students and parents cannot", () => {
  assert.equal(
    canManageHomework({ role: "admin", requesterId: "admin-1", homeworkTeacherId: "teacher-2", homeworkCourseId: "course-2", courseTeacherId: "teacher-2" }),
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

test("teacher homework detail, listing, grading, and deletion re-check current course ownership", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");

  assert.match(route, /\.leftJoin\(courses, eq\(homework\.courseId, courses\.id\)\)/,
    "teacher management queries must resolve the course's current owner from the database");
  assert.match(route, /homeworkCourseId: hw\.courseId,\s*courseTeacherId/,
    "single-homework reads and grading must pass current course ownership to the policy");
  assert.match(route, /homeworkCourseId: ownedHomework\.homework\.courseId,\s*courseTeacherId: ownedHomework\.courseTeacherId/,
    "deletion must use the same current-owner policy");
  assert.match(route, /or\(isNull\(homework\.courseId\), eq\(courses\.teacherId, ctx\.user\.id\)\)/,
    "teacher homework lists must exclude reassigned and orphaned course records");

  const detailStart = route.indexOf("const detailQuery = db");
  const listStart = route.indexOf("const assignmentQuery = db", detailStart);
  assert.ok(detailStart >= 0 && listStart > detailStart,
    "single-homework and list reads must use explicit joined queries");
  const detailQuerySource = route.slice(detailStart, listStart);
  assert.match(detailQuerySource, /\.leftJoin\(homeworkSubmissions, eq\(homeworkSubmissions\.homeworkId, homework\.id\)\)/,
    "homework detail and submissions must be read in the same SQL statement");
  assert.match(detailQuerySource, /eq\(homework\.teacherId, ctx\.user\.id\)/);
  assert.match(detailQuerySource, /eq\(courses\.teacherId, ctx\.user\.id\)/,
    "teacher detail reads must apply current course ownership in the joined statement");
  assert.doesNotMatch(detailQuerySource, /db\.select\(\)\.from\(homeworkSubmissions\)/,
    "detail reads must not fetch submissions in a second statement after the owner check");

  const listEnd = route.indexOf("const homeworkList =", listStart);
  assert.ok(listStart >= 0 && listEnd > listStart);
  const listQuerySource = route.slice(listStart, listEnd);
  assert.match(listQuerySource, /\.leftJoin\(homeworkSubmissions, eq\(homeworkSubmissions\.homeworkId, homework\.id\)\)/,
    "homework list counts and submission rows must share the owner-scoped statement");
  assert.match(listQuerySource, /eq\(homework\.teacherId, ctx\.user\.id\)/);
  assert.match(listQuerySource, /eq\(courses\.teacherId, ctx\.user\.id\)/,
    "list reads must apply current course ownership before exposing submission counts");
  assert.doesNotMatch(listQuerySource, /const allSubs = await db/,
    "list reads must not fetch submissions in a second statement using a stale homework ID list");
});

test("grading and deletion recheck current course ownership in the mutation statement", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const gradeStart = route.indexOf('if (action === "grade")');
  const deleteStart = route.indexOf('if (action === "delete")', gradeStart);
  assert.ok(gradeStart >= 0 && deleteStart > gradeStart);

  const gradeSource = route.slice(gradeStart, deleteStart);
  assert.ok(gradeSource.includes('const gradeUpdateScope = ctx.user.role === "teacher"'));
  assert.ok(gradeSource.includes("eq(homework.id, homeworkSubmissions.homeworkId)"));
  assert.ok(gradeSource.includes("eq(homework.teacherId, ctx.user.id)"));
  assert.ok(gradeSource.includes("eq(courses.teacherId, ctx.user.id)"));
  assert.ok(gradeSource.includes(".returning({ id: homeworkSubmissions.id })"),
    "grading must detect when the guarded update affects no row");

  const deleteSource = route.slice(deleteStart);
  assert.ok(deleteSource.includes("eq(homework.teacherId, ctx.user.id)"));
  assert.ok(deleteSource.includes("eq(courses.id, homework.courseId)"));
  assert.ok(deleteSource.includes("eq(courses.teacherId, ctx.user.id)"),
    "deletion must recheck the current course owner in the DELETE predicate");
  assert.ok(deleteSource.includes(".returning({ id: homework.id })"),
    "deletion must detect when the guarded delete affects no row");
});

test("only the submission owner, owning teacher, or admin can view a submission file", () => {
  const context = {
    requesterId: "student-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
    homeworkCourseId: null,
    courseTeacherId: null,
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
  assert.equal(canSubmitHomework({ role: "student" }), true, "grade-agnostic legacy homework remains submittable");
  assert.equal(canSubmitHomework({ role: "student", studentGrade: "Third Secondary", homeworkGrade: "Third Secondary" }), true);
  assert.equal(canSubmitHomework({ role: "student", studentGrade: "First Secondary", homeworkGrade: "Third Secondary" }), false);
  assert.equal(canSubmitHomework({ role: "student", studentGrade: null, homeworkGrade: "Third Secondary" }), false,
    "a missing student grade must not authorize submission to grade-specific homework");
  assert.equal(canSubmitHomework({ role: "student", studentGrade: null, homeworkGrade: null }), true,
    "blank-grade homework remains grade-agnostic");
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


test("graded homework submissions cannot be replaced", () => {
  assert.equal(canReplaceHomeworkSubmission({ status: "graded" }), false);
  assert.equal(canReplaceHomeworkSubmission({ status: "submitted" }), true);
  assert.equal(canReplaceHomeworkSubmission({ status: "pending" }), true);
  assert.equal(canReplaceHomeworkSubmission({ status: null }), true);
  assert.equal(canReplaceHomeworkSubmission({}), true);
});

test("submission replacement checks status before upload and uses an atomic guarded update", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const preflight = route.indexOf("canReplaceHomeworkSubmission({ status: existing[0].status })");
  const upload = route.indexOf("await put(");
  assert.ok(preflight >= 0 && upload > preflight, "graded submissions must be rejected before a Blob upload");
  assert.match(route, /or\(isNull\(homeworkSubmissions\.status\), ne\(homeworkSubmissions\.status, "graded"\)\)/);
  assert.match(route, /await del\(storagePath, \{ token: uploadToken \}\)/);
});


test("course-linked homework requires an active/completed enrollment", () => {
  const enrolled = ["course-active", "course-completed"];
  assert.equal(canAccessHomeworkCourse({
    role: "student", homeworkCourseId: "course-active", enrolledCourseIds: enrolled,
  }), true);
  assert.equal(canAccessHomeworkCourse({
    role: "student", homeworkCourseId: "course-completed", enrolledCourseIds: enrolled,
  }), true);
  assert.equal(canAccessHomeworkCourse({
    role: "student", homeworkCourseId: "course-other", enrolledCourseIds: enrolled,
  }), false);
  assert.equal(canAccessHomeworkCourse({
    role: "student", homeworkCourseId: "course-cancelled", enrolledCourseIds: [],
  }), false);
  assert.equal(canAccessHomeworkCourse({
    role: "student", homeworkCourseId: "", enrolledCourseIds: enrolled,
  }), false);
  assert.equal(canAccessHomeworkCourse({
    role: "parent", homeworkCourseId: "course-active", enrolledCourseIds: enrolled,
  }), false);
  assert.equal(canAccessHomeworkCourse({
    role: "student", homeworkCourseId: null, enrolledCourseIds: [],
  }), true, "grade-only homework remains available to the existing grade policy");
});

test("student homework GET and submission routes both enforce course enrollment", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const studentListStart = route.indexOf("list = list.filter((assignment) =>");
  const studentListEnd = route.indexOf("const mySubs", studentListStart);
  assert.ok(studentListStart >= 0 && studentListEnd > studentListStart);
  const studentList = route.slice(studentListStart, studentListEnd);
  assert.match(studentList, /canAccessHomeworkGrade/,
    "grade-specific assignments must use the fail-closed student-grade policy");
  assert.doesNotMatch(studentList, /!myGrade\s*\|\|/,
    "a missing student grade must not expose every grade-specific assignment");
  assert.match(studentList, /canAccessHomeworkCourse/);
  assert.match(studentList, /enrolledCourseIds/,
    "the list filter must use course IDs resolved from enrollment records");

  const listEnrollmentStart = route.indexOf("const enrollmentRows = await db");
  assert.ok(listEnrollmentStart >= 0 && studentListStart > listEnrollmentStart,
    "the enrollment lookup must happen before filtering the student homework list");
  const listEnrollmentQuery = route.slice(listEnrollmentStart, studentListStart);
  assert.match(listEnrollmentQuery, /\.from\(enrollments\)/);
  assert.match(listEnrollmentQuery, /\.innerJoin\(courses/);
  assert.match(listEnrollmentQuery, /eq\(enrollments\.studentId, ctx\.user\.id\)/);
  assert.match(listEnrollmentQuery, /inArray\(enrollments\.status, \["active", "completed"\]\)/,
    "only active or completed enrollments may authorize course-specific homework");

  const submitStart = route.indexOf('if (contentType.includes("multipart/form-data"))');
  const submitEnd = route.indexOf("// ============ JSON ACTIONS", submitStart);
  assert.ok(submitStart >= 0 && submitEnd > submitStart);
  const submitRoute = route.slice(submitStart, submitEnd);
  const submissionEnrollmentStart = submitRoute.indexOf("const submissionEnrollmentRows = homeworkCourseId");
  const enrollmentGuard = submitRoute.indexOf("canAccessHomeworkCourse(");
  const upload = submitRoute.indexOf("await put(");
  const persist = submitRoute.indexOf("await db.insert(homeworkSubmissions).values(sub)");
  assert.ok(submissionEnrollmentStart >= 0 && enrollmentGuard > submissionEnrollmentStart &&
    upload > enrollmentGuard && persist > enrollmentGuard,
    "course enrollment must be resolved and checked before file upload or submission persistence");
  assert.match(submitRoute, /\.from\(enrollments\)/);
  assert.match(submitRoute, /eq\(enrollments\.studentId, ctx\.user\.id\)/);
  assert.match(submitRoute, /eq\(enrollments\.courseId, homeworkCourseId\)/);
  assert.match(submitRoute, /inArray\(enrollments\.status, \["active", "completed"\]\)/);
});


test("grade-specific homework fails closed when the student's current grade is missing", () => {
  assert.equal(canAccessHomeworkGrade({
    role: "student", studentGrade: "Third Secondary", homeworkGrade: "Third Secondary",
  }), true);
  assert.equal(canAccessHomeworkGrade({
    role: "student", studentGrade: "First Secondary", homeworkGrade: "Third Secondary",
  }), false);
  assert.equal(canAccessHomeworkGrade({
    role: "student", studentGrade: null, homeworkGrade: "Third Secondary",
  }), false);
  assert.equal(canAccessHomeworkGrade({
    role: "student", studentGrade: "  ", homeworkGrade: "Third Secondary",
  }), false);
  assert.equal(canAccessHomeworkGrade({
    role: "student", studentGrade: null, homeworkGrade: null,
  }), true);
  assert.equal(canAccessHomeworkGrade({
    role: "student", studentGrade: null, homeworkGrade: "  ",
  }), true);
  assert.equal(canAccessHomeworkGrade({
    role: "parent", studentGrade: "Third Secondary", homeworkGrade: "Third Secondary",
  }), false);
});

test("course-linked homework notifications are limited to active/completed enrolled students", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const createStart = route.indexOf('if (action === "create")');
  const gradeStart = route.indexOf('if (action === "grade")', createStart);
  assert.ok(createStart >= 0 && gradeStart > createStart);
  const createRoute = route.slice(createStart, gradeStart);

  const recipientsStart = createRoute.indexOf("const notificationRows = newHw.courseId");
  const recipientsEnd = createRoute.indexOf("const notificationStudentIds", recipientsStart);
  assert.ok(recipientsStart >= 0 && recipientsEnd > recipientsStart,
    "notification recipients must be derived after the assignment is created");
  const recipientQuery = createRoute.slice(recipientsStart, recipientsEnd);
  const courseQueryStart = recipientQuery.indexOf("? await db");
  const gradeOnlyQueryStart = recipientQuery.indexOf(": await db");
  assert.ok(courseQueryStart >= 0 && gradeOnlyQueryStart > courseQueryStart,
    "both course-linked and grade-only notification query branches must be present");
  const courseQuery = recipientQuery.slice(courseQueryStart, gradeOnlyQueryStart);
  const gradeOnlyQuery = recipientQuery.slice(gradeOnlyQueryStart);

  assert.match(courseQuery, /\.from\(enrollments\)/,
    "course-specific notifications must start from enrollment records");
  assert.match(courseQuery, /\.innerJoin\(users, eq\(enrollments\.studentId, users\.id\)\)/);
  assert.match(courseQuery, /eq\(enrollments\.courseId, newHw\.courseId\)/);
  assert.match(courseQuery, /eq\(users\.role, "student"\)/);
  assert.match(courseQuery, /eq\(users\.grade, newHw\.grade\)/);
  assert.match(courseQuery, /inArray\(enrollments\.status, \["active", "completed"\]\)/,
    "cancelled or pending enrollments must not receive course-only homework notifications");

  assert.match(gradeOnlyQuery, /\.from\(users\)/,
    "grade-only homework must retain grade-based notifications");
  assert.match(gradeOnlyQuery, /eq\(users\.role, "student"\)/);
  assert.match(gradeOnlyQuery, /eq\(users\.grade, newHw\.grade\)/);
  assert.match(createRoute, /new Set\(notificationRows\.map\(\(row\) => row\.id\)\)/,
    "duplicate enrollment rows must not send duplicate notifications");
  assert.match(createRoute, /for \(const studentId of notificationStudentIds\)/);
});

test("teacher file access requires the current linked course owner for course-scoped homework", () => {
  const courseScoped = {
    submissionFound: true,
    homeworkFound: true,
    role: "teacher",
    requesterId: "teacher-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
    homeworkCourseId: "course-1",
    courseTeacherId: "teacher-1",
  };
  assert.equal(getHomeworkFileAccessDecision(courseScoped), "allowed");
  assert.equal(
    getHomeworkFileAccessDecision({ ...courseScoped, courseTeacherId: "teacher-2" }),
    "not-found",
    "the linked course's current owner must override a stale homework.teacherId",
  );
  assert.equal(
    getHomeworkFileAccessDecision({ ...courseScoped, homeworkTeacherId: "teacher-2" }),
    "not-found",
  );
  assert.equal(
    getHomeworkFileAccessDecision({ ...courseScoped, courseTeacherId: null }),
    "not-found",
  );
  assert.equal(
    getHomeworkFileAccessDecision({ ...courseScoped, homeworkCourseId: undefined }),
    "not-found",
    "missing course-scope data must fail closed for teacher file reads",
  );
  assert.equal(
    getHomeworkFileAccessDecision({ ...courseScoped, homeworkCourseId: null, courseTeacherId: null }),
    "allowed",
    "grade-only legacy homework remains scoped to its recorded teacher",
  );
});
