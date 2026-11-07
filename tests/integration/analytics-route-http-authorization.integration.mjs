import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { Client } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function stopServer(server) {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    delay(5000).then(() => {
      if (server.exitCode === null) server.kill("SIGKILL");
    }),
  ]);
}

integrationTest(
  "Analytics HTTP route enforces owned-course teacher scope, verified parent selection, and student self-only access",
  async () => {
    assertLocalTestDatabase(connectionString);

    const suffix = randomBytes(5).toString("hex");
    const prefix = `http_analytics_${suffix}_`;
    const id = (name) => `${prefix}${name}`;
    const token = (name) => `test-only-${suffix}-${name}-${randomBytes(12).toString("hex")}`;
    const ids = {
      teacher: id("teacher"),
      otherTeacher: id("other_teacher"),
      student: id("student"),
      otherStudent: id("other_student"),
      unlinkedStudent: id("unlinked_student"),
      unverifiedStudent: id("unverified_student"),
      unverifiedOnlyStudent: id("unverified_only_student"),
      parent: id("parent"),
      parentSingle: id("parent_single"),
      parentMixed: id("parent_mixed"),
      parentUnverifiedOnly: id("parent_unverified_only"),
      admin: id("admin"),
      ownedCourse: id("owned_course"),
      otherCourse: id("other_course"),
      ownedCourseQuiz: id("owned_course_quiz"),
      ownedCourseQuizSubmission: id("owned_course_quiz_submission"),
      otherCourseQuiz: id("other_course_quiz"),
      otherCourseQuizSubmission: id("other_course_quiz_submission"),
      attendanceRecord: id("attendance_record"),
      enrollmentOwned: id("enrollment_owned"),
      enrollmentOtherStudent: id("enrollment_other_student"),
      enrollmentStudentOtherCourse: id("enrollment_student_other_course"),
      enrollmentCancelled: id("enrollment_cancelled"),
      linkStudent: id("link_student"),
      linkOtherStudent: id("link_other_student"),
      linkUnverified: id("link_unverified"),
      linkUnverifiedOnly: id("link_unverified_only"),
      linkSingle: id("link_single"),
      linkSingleDuplicate: id("link_single_duplicate"),
      linkMixedVerified: id("link_mixed_verified"),
      linkMixedUnverified: id("link_mixed_unverified"),
      teacherSession: id("session_teacher"),
      studentSession: id("session_student"),
      parentSession: id("session_parent"),
      parentSingleSession: id("session_parent_single"),
      parentMixedSession: id("session_parent_mixed"),
      parentUnverifiedOnlySession: id("session_parent_unverified_only"),
    };
    const tokens = {
      teacher: token("teacher"),
      student: token("student"),
      parent: token("parent"),
      parentSingle: token("parent_single"),
      parentMixed: token("parent_mixed"),
      parentUnverifiedOnly: token("parent_unverified_only"),
    };

    const port = 31000 + (process.pid % 10000);
    const baseUrl = `http://127.0.0.1:${port}`;
    let server;
    let serverLog = "";
    let client;
    let serverError = "";

    try {
      server = spawn(
        process.execPath,
        ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            DATABASE_URL: connectionString,
            TEST_DATABASE_URL: connectionString,
            NODE_ENV: "development",
            NEXT_TELEMETRY_DISABLED: "1",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      server.on("error", (error) => {
        serverError = String(error);
      });
      for (const stream of [server.stdout, server.stderr]) {
        stream?.on("data", (chunk) => {
          serverLog = (serverLog + chunk.toString()).slice(-12000);
        });
      }

      // The first unauthenticated request runs the app's idempotent schema setup
      // against the disposable local PostgreSQL service, then must be rejected.
      let ready = false;
      let lastStatus = "no response";
      for (let attempt = 0; attempt < 90; attempt += 1) {
        if (server.exitCode !== null || serverError) {
          throw new Error(`Next.js test server exited before readiness. ${serverError}\n${serverLog}`);
        }
        try {
          const response = await fetch(`${baseUrl}/api/auth`, {
            headers: { "cache-control": "no-store" },
            signal: AbortSignal.timeout(4000),
          });
          lastStatus = String(response.status);
          await response.arrayBuffer();
          if (response.status === 401) {
            ready = true;
            break;
          }
        } catch {
          // The dev server may still be compiling; retry until the bounded deadline.
        }
        await delay(1000);
      }
      assert.equal(ready, true, `Next.js analytics route did not become ready (last status: ${lastStatus}).\n${serverLog}`);

      client = new Client({ connectionString });
      await client.connect();

      const unauthenticatedAnalytics = await fetch(`${baseUrl}/api/analytics`, {
        headers: { "cache-control": "no-store" },
        signal: AbortSignal.timeout(15000),
      });
      assert.equal(
        unauthenticatedAnalytics.status,
        401,
        "Analytics reports must reject requests without an authenticated session",
      );
      await unauthenticatedAnalytics.arrayBuffer();

      const fixtureUsers = [
        [ids.teacher, "Teacher HTTP Test", `teacher-${suffix}@example.test`, "test-only-password", "teacher", null],
        [ids.otherTeacher, "Other Teacher HTTP Test", `other-teacher-${suffix}@example.test`, "test-only-password", "teacher", null],
        [ids.student, "Student HTTP Test", `student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
        [ids.otherStudent, "Other Student HTTP Test", `other-student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
        [ids.unlinkedStudent, "Unlinked Student HTTP Test", `unlinked-student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
        [ids.unverifiedStudent, "Unverified Student HTTP Test", `unverified-student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
        [ids.unverifiedOnlyStudent, "Unverified-Only Student HTTP Test", `unverified-only-student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
        [ids.parent, "Parent HTTP Test", `parent-${suffix}@example.test`, "test-only-password", "parent", null],
        [ids.parentSingle, "Single Child Parent HTTP Test", `single-parent-${suffix}@example.test`, "test-only-password", "parent", null],
        [ids.parentMixed, "Mixed Verification Parent HTTP Test", `mixed-parent-${suffix}@example.test`, "test-only-password", "parent", null],
        [ids.parentUnverifiedOnly, "Unverified-Only Parent HTTP Test", `unverified-only-parent-${suffix}@example.test`, "test-only-password", "parent", null],
        [ids.admin, "Admin HTTP Test", `admin-${suffix}@example.test`, "test-only-password", "admin", null],
      ];
      for (const row of fixtureUsers) {
        await client.query(
          "INSERT INTO users (id, name, email, password, role, grade) VALUES ($1, $2, $3, $4, $5, $6)",
          row,
        );
      }

      await client.query(
        `INSERT INTO courses (id, title, description, stage, grade, teacher_id, thumbnail)
         VALUES ($1, 'HTTP test owned course', 'Disposable integration fixture', 'Secondary', 'Third Secondary', $2, 'test://owned'),
                ($3, 'HTTP test other course', 'Disposable integration fixture', 'Secondary', 'Third Secondary', $4, 'test://other')`,
        [ids.ownedCourse, ids.teacher, ids.otherCourse, ids.otherTeacher],
      );
      await client.query(
        `INSERT INTO enrollments (id, student_id, course_id, status)
         VALUES ($1, $2, $3, 'active'), ($4, $5, $6, 'active'), ($7, $2, $6, 'active'), ($8, $9, $10, 'cancelled')`,
        [
          ids.enrollmentOwned, ids.student, ids.ownedCourse,
          ids.enrollmentOtherStudent, ids.otherStudent, ids.otherCourse,
          ids.enrollmentStudentOtherCourse,
          ids.enrollmentCancelled, ids.unverifiedStudent, ids.ownedCourse,
        ],
      );
      // Seed assessment and attendance data from a course the test teacher does not own.
      // The same student is also enrolled in the teacher's owned course; these rows must
      // still be excluded from that teacher's report because their scope is unrelated.
      await client.query(
        `INSERT INTO quizzes (id, course_id, title, stage)
         VALUES ($1, $2, 'Owned teacher quiz', 'Secondary'),
                ($3, $4, 'Other teacher private quiz', 'Secondary')`,
        [ids.ownedCourseQuiz, ids.ownedCourse, ids.otherCourseQuiz, ids.otherCourse],
      );
      await client.query(
        `INSERT INTO quiz_submissions (id, quiz_id, student_id, score, total_questions, percentage, passed, answers)
         VALUES ($1, $2, $3, 7, 10, 70, true, '{}'::jsonb),
                ($4, $5, $3, 9, 10, 90, true, '{}'::jsonb)`,
        [ids.ownedCourseQuizSubmission, ids.ownedCourseQuiz, ids.student, ids.otherCourseQuizSubmission, ids.otherCourseQuiz],
      );
      await client.query(
        `INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade)
         VALUES ($1, $2, 'Student HTTP Test', 'Unscoped attendance fixture', '2026-11-04', 'present', 'Third Secondary')`,
        [ids.attendanceRecord, ids.student],
      );

      await client.query(
        `INSERT INTO parent_links (id, parent_id, student_id, relationship, verified_at, verified_by)
         VALUES ($1, $2, $3, 'Guardian', NOW(), $4),
                ($5, $2, $6, 'Guardian', NOW(), $4),
                ($7, $2, $8, 'Guardian', NULL, NULL),
                ($9, $10, $11, 'Guardian', NOW(), $12),
                ($13, $14, $15, 'Guardian', NOW(), $16),
                ($17, $14, $18, 'Guardian', NULL, NULL),
                ($19, $20, $21, 'Guardian', NULL, NULL)`,
        [
          ids.linkStudent, ids.parent, ids.student, ids.admin,
          ids.linkOtherStudent, ids.otherStudent,
          ids.linkUnverified, ids.unverifiedStudent,
          ids.linkSingle, ids.parentSingle, ids.student, ids.admin,
          ids.linkMixedVerified, ids.parentMixed, ids.student, ids.admin,
          ids.linkMixedUnverified, ids.unverifiedStudent,
          ids.linkUnverifiedOnly, ids.parentUnverifiedOnly, ids.unverifiedOnlyStudent,
        ],
      );
      // Duplicate verified rows for the same child must still represent one distinct child.
      await client.query(
        `INSERT INTO parent_links (id, parent_id, student_id, relationship, verified_at, verified_by)
         VALUES ($1, $2, $3, 'Guardian', NOW(), $4)`,
        [ids.linkSingleDuplicate, ids.parentSingle, ids.student, ids.admin],
      );
      const sessions = [
        [ids.teacherSession, tokens.teacher, ids.teacher, "teacher"],
        [ids.studentSession, tokens.student, ids.student, "student"],
        [ids.parentSession, tokens.parent, ids.parent, "parent"],
        [ids.parentSingleSession, tokens.parentSingle, ids.parentSingle, "parent"],
        [ids.parentMixedSession, tokens.parentMixed, ids.parentMixed, "parent"],
        [ids.parentUnverifiedOnlySession, tokens.parentUnverifiedOnly, ids.parentUnverifiedOnly, "parent"],
      ];
      for (const [sessionId, sessionToken, userId, role] of sessions) {
        await client.query(
          "INSERT INTO sessions (id, token, user_id, role, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 hour')",
          [sessionId, sessionToken, userId, role],
        );
      }

      async function requestRoute(path, sessionToken, studentId) {
        const url = new URL(path, baseUrl);
        if (studentId !== undefined) url.searchParams.set("studentId", studentId);
        const response = await fetch(url, {
          headers: { authorization: `Bearer ${sessionToken}`, "cache-control": "no-store" },
          signal: AbortSignal.timeout(15000),
        });
        const raw = await response.text();
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          body = { nonJsonResponse: raw.slice(0, 500) };
        }
        return { status: response.status, body };
      }
      const requestAnalytics = (sessionToken, studentId) =>
        requestRoute("/api/analytics", sessionToken, studentId);
      const requestReports = (sessionToken, studentId) =>
        requestRoute("/api/reports", sessionToken, studentId);
      const requestParentOverview = (sessionToken, studentId) =>
        requestRoute("/api/parent", sessionToken, studentId);

      const teacherOwnStudent = await requestAnalytics(tokens.teacher, ids.student);
      assert.equal(teacherOwnStudent.status, 200, JSON.stringify(teacherOwnStudent.body));
      assert.equal(teacherOwnStudent.body.student?.id, ids.student);
      assert.equal(
        teacherOwnStudent.body.kpis?.totalExams,
        1,
        "teacher report must include the owned-course quiz but exclude the other teacher's quiz",
      );
      assert.deepEqual(
        (teacherOwnStudent.body.timeline || []).map((entry) => entry.percentage),
        [70],
        "teacher timeline must contain only the owned-course assessment result",
      );
      assert.equal(teacherOwnStudent.body.kpis?.totalSessions, 0, "attendance without course ownership metadata must be excluded from teacher reports");
      assert.equal(teacherOwnStudent.body.kpis?.attRate, null, "unscoped attendance must not contribute an attendance rate");
      for (const privateField of ["email", "password", "phone", "parentPhone", "username"]) {
        assert.equal(
          Object.hasOwn(teacherOwnStudent.body.student || {}, privateField),
          false,
          `teacher analytics must not expose the student's ${privateField} field`,
        );
      }

      const teacherOtherCourseStudent = await requestAnalytics(tokens.teacher, ids.otherStudent);
      assert.equal(teacherOtherCourseStudent.status, 403, "teacher must not access a student enrolled only in another teacher's course");

      const teacherCancelledEnrollmentStudent = await requestAnalytics(tokens.teacher, ids.unverifiedStudent);
      assert.equal(
        teacherCancelledEnrollmentStudent.status,
        403,
        "a cancelled enrollment must not authorize a teacher to access a student's report",
      );

      const teacherClass = await requestAnalytics(tokens.teacher);
      assert.equal(teacherClass.status, 200, JSON.stringify(teacherClass.body));
      assert.equal(
        (teacherClass.body.students || []).some((row) => row.id === ids.otherStudent),
        false,
        "teacher roster must exclude students outside the teacher's owned-course enrollments",
      );
      assert.equal(
        (teacherClass.body.students || []).some((row) => row.id === ids.unverifiedStudent),
        false,
        "teacher roster must exclude students whose only owned-course enrollment is cancelled",
      );

      const parentWithoutSelection = await requestAnalytics(tokens.parent);
      assert.equal(parentWithoutSelection.status, 400, "parent must explicitly choose when multiple verified children are linked");

      // An explicitly empty studentId is malformed input, not permission to silently
      // fall back to the first linked child when multiple verified children exist.
      const parentEmptySelection = await requestAnalytics(tokens.parent, "");
      assert.equal(parentEmptySelection.status, 400, "parent must not bypass explicit child selection with an empty studentId");

      const parentSelectedChild = await requestAnalytics(tokens.parent, ids.student);
      assert.equal(parentSelectedChild.status, 200, JSON.stringify(parentSelectedChild.body));
      assert.equal(parentSelectedChild.body.student?.id, ids.student);

      const parentSingleChildDefault = await requestAnalytics(tokens.parentSingle);
      assert.equal(parentSingleChildDefault.status, 200, JSON.stringify(parentSingleChildDefault.body));
      assert.equal(
        parentSingleChildDefault.body.student?.id,
        ids.student,
        "a parent with exactly one linked child may default to that child",
      );

      // A second legacy link still makes the parent's selection ambiguous even if
      // only one of the linked children has an admin-verified relationship.
      const parentMixedWithoutSelection = await requestAnalytics(tokens.parentMixed);
      assert.equal(
        parentMixedWithoutSelection.status,
        400,
        "parent must explicitly select when multiple children are linked, including an unverified legacy link",
      );
      const parentMixedVerifiedChild = await requestAnalytics(tokens.parentMixed, ids.student);
      assert.equal(parentMixedVerifiedChild.status, 200, JSON.stringify(parentMixedVerifiedChild.body));
      assert.equal(parentMixedVerifiedChild.body.student?.id, ids.student);
      const parentMixedUnverifiedChild = await requestAnalytics(tokens.parentMixed, ids.unverifiedStudent);
      assert.equal(parentMixedUnverifiedChild.status, 403, "explicit selection must still reject an unverified linked child");

      const parentUnverifiedChild = await requestAnalytics(tokens.parent, ids.unverifiedStudent);
      assert.equal(parentUnverifiedChild.status, 403, "an unverified legacy link must not authorize a report");

      const parentOnlyUnverifiedWithoutSelection = await requestAnalytics(tokens.parentUnverifiedOnly);
      assert.equal(
        parentOnlyUnverifiedWithoutSelection.status,
        404,
        "a parent with only an unverified linked student must not receive a report by default",
      );
      const parentOnlyUnverifiedSelected = await requestAnalytics(tokens.parentUnverifiedOnly, ids.unverifiedOnlyStudent);
      assert.equal(
        parentOnlyUnverifiedSelected.status,
        403,
        "explicitly selecting the only unverified linked student must still be denied",
      );

      const parentUnlinkedChild = await requestAnalytics(tokens.parent, ids.unlinkedStudent);
      assert.equal(parentUnlinkedChild.status, 403, "a parent must not access a student who has no linked parent relationship");

      const studentOwnReport = await requestAnalytics(tokens.student, ids.student);
      assert.equal(studentOwnReport.status, 200, JSON.stringify(studentOwnReport.body));
      assert.equal(studentOwnReport.body.student?.id, ids.student);
      assert.equal(studentOwnReport.body.kpis?.totalExams, 2, "the student can see both of their own quiz results across enrolled courses");
      assert.equal(studentOwnReport.body.kpis?.totalSessions, 1, "the student can still see their own attendance record");

      // Omitting studentId for a student session must resolve only to that session's owner,
      // never to a class-wide response or another student's report.
      const studentImplicitOwnReport = await requestAnalytics(tokens.student);
      assert.equal(studentImplicitOwnReport.status, 200, JSON.stringify(studentImplicitOwnReport.body));
      assert.equal(studentImplicitOwnReport.body.scope, "student");
      assert.equal(studentImplicitOwnReport.body.student?.id, ids.student);
      assert.equal(studentImplicitOwnReport.body.kpis?.totalExams, 2);
      assert.equal(studentImplicitOwnReport.body.kpis?.totalSessions, 1);
      assert.equal(Object.hasOwn(studentImplicitOwnReport.body, "students"), false,
        "a student request without studentId must not return a class roster");

      const studentCrossReport = await requestAnalytics(tokens.student, ids.otherStudent);
      assert.equal(studentCrossReport.status, 403, "student must not access another student's report");

      // Apply the same role and relationship guarantees to the weekly reports endpoint.
      const reportsTeacherOwn = await requestReports(tokens.teacher, ids.student);
      assert.equal(reportsTeacherOwn.status, 200, JSON.stringify(reportsTeacherOwn.body));
      assert.equal(reportsTeacherOwn.body.report?.student?.id, ids.student);
      assert.equal(reportsTeacherOwn.body.report?.attendance?.totalSessions, 0,
        "weekly teacher reports must omit attendance rows that have no course ownership key");
      assert.equal(reportsTeacherOwn.body.report?.quizzes?.weekAttempts, 1,
        "weekly teacher reports must include only the quiz from the teacher-owned course");
      assert.equal(reportsTeacherOwn.body.report?.quizzes?.avgPercentage, 70,
        "weekly teacher reports must not include the other teacher's 90% quiz result");
      const reportsTeacherOtherCourse = await requestReports(tokens.teacher, ids.otherStudent);
      assert.equal(reportsTeacherOtherCourse.status, 403,
        "weekly teacher reports must reject students without an active enrollment in a teacher-owned course");

      // Authorization must be recalculated from current ownership and enrollment,
      // not retained from an earlier successful report request.
      await client.query("UPDATE enrollments SET status = 'cancelled' WHERE id = $1", [ids.enrollmentOwned]);
      const reportsAfterEnrollmentRevocation = await requestReports(tokens.teacher, ids.student);
      assert.equal(reportsAfterEnrollmentRevocation.status, 403,
        "weekly reports must deny access immediately after the owned-course enrollment is revoked");
      await client.query("UPDATE enrollments SET status = 'active' WHERE id = $1", [ids.enrollmentOwned]);

      await client.query("UPDATE courses SET teacher_id = $1 WHERE id = $2", [ids.otherTeacher, ids.ownedCourse]);
      const reportsAfterOwnershipTransfer = await requestReports(tokens.teacher, ids.student);
      assert.equal(reportsAfterOwnershipTransfer.status, 403,
        "weekly reports must deny access immediately after the course is transferred to another teacher");
      await client.query("UPDATE courses SET teacher_id = $1 WHERE id = $2", [ids.teacher, ids.ownedCourse]);

      const reportsParentNoSelection = await requestReports(tokens.parent);
      assert.equal(reportsParentNoSelection.status, 400,
        "weekly reports must require explicit selection when a parent has multiple linked children");
      const reportsParentVerifiedChild = await requestReports(tokens.parent, ids.student);
      assert.equal(reportsParentVerifiedChild.status, 200, JSON.stringify(reportsParentVerifiedChild.body));
      assert.equal(reportsParentVerifiedChild.body.report?.student?.id, ids.student);
      const reportsParentUnverifiedChild = await requestReports(tokens.parent, ids.unverifiedStudent);
      assert.equal(reportsParentUnverifiedChild.status, 403,
        "weekly reports must not authorize an unverified legacy parent link");

      // Weekly reports must treat every current linked child as part of the
      // ambiguity set, even when one legacy link is unverified. Verification
      // is checked again after an explicit choice; selection alone is not access.
      const reportsParentMixedNoSelection = await requestReports(tokens.parentMixed);
      assert.equal(reportsParentMixedNoSelection.status, 400,
        "weekly reports must require explicit selection when verified and unverified child links coexist");
      const reportsParentMixedVerifiedChild = await requestReports(tokens.parentMixed, ids.student);
      assert.equal(reportsParentMixedVerifiedChild.status, 200,
        "weekly reports must allow the explicitly selected verified child");
      const reportsParentMixedUnverifiedChild = await requestReports(tokens.parentMixed, ids.unverifiedStudent);
      assert.equal(reportsParentMixedUnverifiedChild.status, 403,
        "weekly reports must reject an explicitly selected unverified child");

      const reportsStudentOwn = await requestReports(tokens.student);
      assert.equal(reportsStudentOwn.status, 200, JSON.stringify(reportsStudentOwn.body));
      assert.equal(reportsStudentOwn.body.report?.student?.id, ids.student);
      const reportsStudentCross = await requestReports(tokens.student, ids.otherStudent);
      assert.equal(reportsStudentCross.status, 403,
        "weekly reports must reject a student-supplied ID belonging to another student");

      // The parent overview is a separate endpoint and must enforce the same verified-link
      // and explicit-selection rules instead of trusting the Analytics route's guard.
      const parentOverviewNoSelection = await requestParentOverview(tokens.parent);
      assert.equal(parentOverviewNoSelection.status, 400,
        "parent overview must require explicit selection when multiple children are linked");
      const parentOverviewVerifiedChild = await requestParentOverview(tokens.parent, ids.student);
      assert.equal(parentOverviewVerifiedChild.status, 200, JSON.stringify(parentOverviewVerifiedChild.body));
      assert.equal(parentOverviewVerifiedChild.body.student?.id, ids.student);
      const parentOverviewUnverifiedChild = await requestParentOverview(tokens.parent, ids.unverifiedStudent);
      assert.equal(parentOverviewUnverifiedChild.status, 403,
        "parent overview must reject a selected child whose link is not admin-verified");
      const parentOverviewMixedNoSelection = await requestParentOverview(tokens.parentMixed);
      assert.equal(parentOverviewMixedNoSelection.status, 400,
        "parent overview must count unverified links when deciding whether selection is ambiguous");
      const parentOverviewMixedVerifiedChild = await requestParentOverview(tokens.parentMixed, ids.student);
      assert.equal(parentOverviewMixedVerifiedChild.status, 200,
        "parent overview must allow an explicitly selected admin-verified child");
      const parentOverviewMixedUnverifiedChild = await requestParentOverview(tokens.parentMixed, ids.unverifiedStudent);
      assert.equal(parentOverviewMixedUnverifiedChild.status, 403,
        "parent overview must not treat explicit selection as a substitute for verification");

      // Revalidate current database roles rather than trusting the role copied into a session.
      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.otherStudent]);
      const parentStaleStudentRole = await requestAnalytics(tokens.parent, ids.otherStudent);
      assert.equal(parentStaleStudentRole.status, 403, "a link to an account that is no longer a student must fail closed");
      await client.query("UPDATE users SET role = 'student' WHERE id = $1", [ids.otherStudent]);

      // A session must not retain teacher analytics privileges after the account role is downgraded.
      // getAuthContext must use the current database role rather than the role captured when the session was created.
      await client.query("UPDATE users SET role = 'student' WHERE id = $1", [ids.teacher]);
      const staleTeacherRole = await requestAnalytics(tokens.teacher, ids.student);
      assert.equal(
        staleTeacherRole.status,
        403,
        "a stale teacher session must not retain analytics access after the account role changes",
      );
      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.teacher]);

      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.parent]);
      const staleParentRole = await requestAnalytics(tokens.parent, ids.student);
      assert.equal(staleParentRole.status, 403, "a stale parent session must not authorize reports after the account role changes");
      await client.query("UPDATE users SET role = 'parent' WHERE id = $1", [ids.parent]);

      // A verification stamp is not sufficient if its recorded verifier no longer has the admin role.
      // The report route must revalidate the verifier's current database role on every request.
      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.admin]);
      const staleVerifierRole = await requestAnalytics(tokens.parent, ids.student);
      assert.equal(
        staleVerifierRole.status,
        403,
        "a previously verified parent link must fail closed when the verifying account is no longer an admin",
      );
      await client.query("UPDATE users SET role = 'admin' WHERE id = $1", [ids.admin]);
    } finally {
      await stopServer(server);
      if (client) {
        try {
          await client.query("DELETE FROM sessions WHERE id = ANY($1::text[])", [[ids.teacherSession, ids.studentSession, ids.parentSession, ids.parentSingleSession, ids.parentMixedSession, ids.parentUnverifiedOnlySession]]);
          await client.query("DELETE FROM parent_links WHERE id = ANY($1::text[])", [[ids.linkStudent, ids.linkOtherStudent, ids.linkUnverified, ids.linkUnverifiedOnly, ids.linkSingle, ids.linkSingleDuplicate, ids.linkMixedVerified, ids.linkMixedUnverified]]);
          await client.query("DELETE FROM quiz_submissions WHERE id = ANY($1::text[])", [[ids.ownedCourseQuizSubmission, ids.otherCourseQuizSubmission]]);
          await client.query("DELETE FROM quizzes WHERE id = ANY($1::text[])", [[ids.ownedCourseQuiz, ids.otherCourseQuiz]]);
          await client.query("DELETE FROM attendance_records WHERE id = $1", [ids.attendanceRecord]);
          await client.query("DELETE FROM enrollments WHERE id = ANY($1::text[])", [[ids.enrollmentOwned, ids.enrollmentOtherStudent, ids.enrollmentStudentOtherCourse, ids.enrollmentCancelled]]);
          await client.query("DELETE FROM courses WHERE id = ANY($1::text[])", [[ids.ownedCourse, ids.otherCourse]]);
          await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[ids.teacher, ids.otherTeacher, ids.student, ids.otherStudent, ids.unlinkedStudent, ids.unverifiedStudent, ids.unverifiedOnlyStudent, ids.parent, ids.parentSingle, ids.parentMixed, ids.parentUnverifiedOnly, ids.admin]]);
        } catch {
          // The CI database is disposable; cleanup is best-effort if schema setup failed.
        } finally {
          await client.end().catch(() => {});
        }
      }
    }
  },
);
