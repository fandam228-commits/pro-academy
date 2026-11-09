import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  canManageHomework,
  canViewHomeworkSubmissionFile,
  canSubmitHomework,
  canAccessHomeworkCourse,
  getHomeworkFileAccessDecision,
  canAssignHomeworkToCourse,
  canReplaceHomeworkSubmission,
} from "./homework-authorization.mjs";

test("teachers can manage only their own homework with a consistent course owner", () => {
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: null, courseTeacherId: null,
    }),
    true,
    "grade-only homework remains supported",
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-2",
      homeworkCourseId: null, courseTeacherId: null,
    }),
    false
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: null,
      homeworkCourseId: null, courseTeacherId: null,
    }),
    false
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: "course-a", courseTeacherId: "teacher-1",
    }),
    true
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: "course-a", courseTeacherId: "teacher-2",
    }),
    false,
    "stale homework ownership must not override the current course owner",
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
      homeworkCourseId: "course-a", courseTeacherId: null,
    }),
    false,
    "missing course owner must fail closed",
  );
  assert.equal(
    canManageHomework({
      role: "teacher", requesterId: "teacher-1", homeworkTeacherId: "teacher-1",
    }),
    false,
    "missing course context must fail closed rather than assume grade-only homework",
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

test("only the submission owner, course-owning teacher, or admin can view a submission file", () => {
  const context = {
    requesterId: "student-1",
    submissionStudentId: "student-1",
    homeworkTeacherId: "teacher-1",
    homeworkCourseId: "course-a",
    courseTeacherId: "teacher-1",
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
    canViewHomeworkSubmissionFile({
      role: "teacher",
      ...context,
      homeworkTeacherId: "teacher-1",
      courseTeacherId: "teacher-2",
    }),
    false,
    "a stale homework teacherId must not override the current course owner",
  );
  assert.equal(
    canViewHomeworkSubmissionFile({
      role: "teacher",
      ...context,
      courseTeacherId: null,
    }),
    false,
    "course-linked homework must fail closed when the course owner cannot be resolved",
  );
  assert.equal(
    canViewHomeworkSubmissionFile({
      role: "teacher",
      requesterId: "teacher-1",
      homeworkTeacherId: "teacher-1",
      homeworkCourseId: null,
      courseTeacherId: null,
    }),
    true,
    "grade-only homework remains accessible to its assigned teacher",
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
    homeworkCourseId: "course-a",
    courseTeacherId: "teacher-1",
  };
  assert.equal(getHomeworkFileAccessDecision(allowed), "allowed");
  assert.equal(
    getHomeworkFileAccessDecision({
      ...allowed,
      role: "teacher",
      requesterId: "teacher-1",
      courseTeacherId: "teacher-2",
    }),
    "not-found",
    "teacher access must be denied if the current course owner differs from the homework teacher",
  );
  assert.equal(
    getHomeworkFileAccessDecision({
      ...allowed,
      role: "teacher",
      requesterId: "teacher-1",
      courseTeacherId: null,
    }),
    "not-found",
    "missing course ownership must fail closed for course-linked homework",
  );
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


test("teacher homework reads, grading, and deletion enforce linked course ownership", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  assert.match(route, /\.leftJoin\(courses, eq\(homework\.courseId, courses\.id\)\)/);
  assert.match(route, /or\(isNull\(homework\.courseId\), eq\(courses\.teacherId, ctx\.user\.id\)\)/);
  assert.match(route, /homeworkCourseId:\s*hw\.courseId[\s\S]*?courseTeacherId/);
  assert.match(route, /homeworkCourseId:\s*hw\[0\]\.courseId[\s\S]*?courseTeacherId/);
  assert.match(route, /homeworkCourseId:\s*own\.courseId[\s\S]*?courseTeacherId/);
  assert.match(route, /async function getHomeworkCourseTeacherId\(/);
});

test("graded homework submissions cannot be replaced", () => {
  assert.equal(canReplaceHomeworkSubmission({ status: "graded" }), false);
  assert.equal(canReplaceHomeworkSubmission({ status: "submitted" }), true);
  assert.equal(canReplaceHomeworkSubmission({ status: "pending" }), true);
  assert.equal(canReplaceHomeworkSubmission({ status: null }), true);
  assert.equal(canReplaceHomeworkSubmission({}), true);
});

test("submission replacement checks status before upload and uses transaction-scoped authorization and atomic row guards", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const preflight = route.indexOf("canReplaceHomeworkSubmission({ status: existing[0].status })");
  const upload = route.indexOf("await put(");
  const saveTransaction = route.indexOf("const saveResult = await db.transaction", upload);
  const finalAuthorization = route.indexOf("lockHomeworkSubmissionAuthorization(", saveTransaction);
  const advisoryLock = route.indexOf("pg_advisory_xact_lock", finalAuthorization);
  const rowLock = route.indexOf('.for("update")', advisoryLock);
  const guardedUpdate = route.indexOf("const updated = await tx", rowLock);

  assert.ok(preflight >= 0 && upload > preflight, "graded submissions must be rejected before a Blob upload");
  assert.ok(saveTransaction > upload && finalAuthorization > saveTransaction,
    "authorization must be revalidated after upload inside the write transaction");
  assert.ok(advisoryLock > finalAuthorization && rowLock > advisoryLock,
    "concurrent submissions must be serialized and the existing submission row locked");
  assert.ok(guardedUpdate > rowLock, "the replacement update must occur after the row lock");
  assert.ok(route.includes('or(isNull(homeworkSubmissions.status), ne(homeworkSubmissions.status, "graded"))'));
  assert.ok(route.includes("removeUnreferencedPrivateHomeworkUpload(uploadedStoragePath, uploadToken)"));
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

test("student homework GET and submission routes enforce course enrollment before persistence", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const helper = await readFile(new URL("./homework-submission-authorization.mjs", import.meta.url), "utf8");
  const studentListStart = route.indexOf('const myGrade = ctx.user.grade || ""');
  const studentListEnd = route.indexOf("const mySubs", studentListStart);
  assert.ok(studentListStart >= 0 && studentListEnd > studentListStart);
  const studentList = route.slice(studentListStart, studentListEnd);
  assert.ok(studentList.includes(".from(enrollments)"));
  assert.ok(studentList.includes('inArray(enrollments.status, ["active", "completed"])'));
  assert.ok(studentList.includes("const courseVisibility = enrolledCourseIds.length > 0"));
  assert.ok(studentList.includes("inArray(homework.courseId, enrolledCourseIds)"));

  const submitStart = route.indexOf('if (contentType.includes("multipart/form-data"))');
  const submitEnd = route.indexOf("// ============ JSON ACTIONS", submitStart);
  assert.ok(submitStart >= 0 && submitEnd > submitStart);
  const submitRoute = route.slice(submitStart, submitEnd);
  const preflight = submitRoute.indexOf("const preflight = await db.transaction");
  const upload = submitRoute.indexOf("await put(");
  const finalTransaction = submitRoute.indexOf("const saveResult = await db.transaction", upload);
  const finalAuthorization = submitRoute.indexOf("lockHomeworkSubmissionAuthorization(", finalTransaction);
  const persist = submitRoute.indexOf("await tx.insert(homeworkSubmissions).values(submission)", finalAuthorization);
  assert.ok(preflight >= 0 && upload > preflight && finalAuthorization > finalTransaction && persist > finalAuthorization,
    "current role/enrollment authorization must be checked before upload and again before submission persistence");
  assert.ok(helper.includes('inArray(enrollments.status, ["active", "completed"])'),
    "only active or completed course enrollments may submit course-specific homework");
  assert.ok(helper.includes('.for("share")'),
    "the live role, homework, course, and enrollment rows must remain locked through the write transaction");
});

test("homework GET and POST authenticate before database setup", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");

  for (const method of ["GET", "POST"]) {
    const start = route.indexOf(`export async function ${method}(`);
    assert.notEqual(start, -1, `${method} handler must exist`);
    const nextHandler = method === "GET"
      ? route.indexOf("export async function POST(", start)
      : route.length;
    const handler = route.slice(start, nextHandler < 0 ? route.length : nextHandler);
    const auth = handler.indexOf("const ctx = await getAuthContext(req)");
    const unauthorizedGuard = handler.indexOf("if (!ctx)", auth);
    const setup = handler.indexOf("await ensureDbSetup()");

    assert.ok(auth >= 0, `${method} must resolve authentication context`);
    assert.ok(unauthorizedGuard > auth, `${method} must reject missing authentication`);
    assert.ok(setup > unauthorizedGuard, `${method} must not run database setup before authentication`);
  }
});


test("homework GET rejects unsupported roles before database setup", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const start = route.indexOf("export async function GET(");
  const next = route.indexOf("export async function POST(", start);
  const handler = route.slice(start, next);
  const roleGate = handler.indexOf('if (!["teacher", "admin", "student"].includes(role))');
  const setup = handler.indexOf("await ensureDbSetup()");
  assert.ok(roleGate >= 0 && setup > roleGate,
    "unsupported authenticated roles must be rejected before database setup");
});

test("homework POST authorizes role and action before database setup", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const start = route.indexOf("export async function POST(");
  const handler = route.slice(start);
  const multipartStart = handler.indexOf('if (contentType.includes("multipart/form-data"))');
  const multipartRoleGate = handler.indexOf('if (ctx.user.role !== "student")', multipartStart);
  const multipartSetup = handler.indexOf("await ensureDbSetup()", multipartStart);
  assert.ok(multipartRoleGate >= 0 && multipartSetup > multipartRoleGate,
    "non-student multipart requests must be rejected before database setup");

  const jsonStart = handler.indexOf("// ============ JSON ACTIONS");
  const actionGate = handler.indexOf('if (!["create", "grade", "delete"].includes(action))', jsonStart);
  const roleGate = handler.indexOf('if (!["admin", "teacher"].includes(ctx.user.role))', jsonStart);
  const jsonSetup = handler.indexOf("await ensureDbSetup()", jsonStart);
  assert.ok(actionGate >= 0 && roleGate >= 0 && jsonSetup > actionGate && jsonSetup > roleGate,
    "invalid actions and non-teacher/admin roles must be rejected before database setup");
});


test("successful submission replacement deletes only a prior validated private Blob path after the transaction commits", async () => {
  const route = await readFile(new URL("../app/api/homework/route.ts", import.meta.url), "utf8");
  const updateStart = route.indexOf("const updated = await tx");
  const failedUpdateGuard = route.indexOf("if (updated.length === 0)", updateStart);
  const previousPathRead = route.indexOf("previousStoragePath: current.storagePath", updateStart);
  const cleanupCall = route.indexOf("await removeUnreferencedPrivateHomeworkUpload(saveResult.previousStoragePath, uploadToken)", previousPathRead);
  const successResponse = route.indexOf("return NextResponse.json({ success: true, updated: true })", cleanupCall);

  assert.ok(updateStart >= 0, "the atomic guarded database update must exist");
  assert.ok(failedUpdateGuard > updateStart, "a failed guarded update must be handled before old-file cleanup");
  assert.ok(previousPathRead > failedUpdateGuard, "the previous path must be captured only for a successful update");
  assert.ok(cleanupCall > previousPathRead && successResponse > cleanupCall);
  const cleanupBlock = route.slice(previousPathRead, successResponse);
  assert.ok(cleanupBlock.includes("saveResult.previousStoragePath !== storagePath"));
  assert.ok(cleanupBlock.includes("isPrivateHomeworkBlobPath(saveResult.previousStoragePath)"),
    "legacy absolute URLs and malformed paths must never be sent to private Blob deletion");
});

test("homework file GET rejects unsupported roles before database setup", async () => {
  const route = await readFile(new URL("../app/api/homework/file/[id]/route.ts", import.meta.url), "utf8");
  const start = route.indexOf("export async function GET(");
  const handler = route.slice(start);
  const auth = handler.indexOf("const ctx = await getAuthContext(req)");
  const unauthorizedGuard = handler.indexOf("if (!ctx)", auth);
  const roleDeclaration = handler.indexOf("const role = ctx.user.role as string", unauthorizedGuard);
  const roleGuard = handler.indexOf('if (!["teacher", "admin", "student"].includes(role))', roleDeclaration);
  const setup = handler.indexOf("await ensureDbSetup()");

  assert.ok(
    auth >= 0 &&
      unauthorizedGuard > auth &&
      roleDeclaration > unauthorizedGuard &&
      roleGuard > roleDeclaration &&
      setup > roleGuard,
    "homework file GET must reject unauthenticated and unsupported-role callers before database setup",
  );
});
