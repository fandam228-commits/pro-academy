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

async function waitForBlockedQuery(observerClient, tableName, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await observerClient.query(
      `SELECT pid
       FROM pg_stat_activity
       WHERE datname = current_database()
         AND pid <> pg_backend_pid()
         AND state = 'active'
         AND wait_event_type = 'Lock'
         AND query ~* '^\\s*select'
         AND query ILIKE $1
       LIMIT 1`,
      [`%${tableName}%`],
    );
    if (result.rowCount > 0) return;
    await delay(50);
  }
  throw new Error(`Timed out waiting for a PostgreSQL query blocked on ${tableName}`);
}

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
      secondOwnedStudent: id("second_owned_student"),
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
      otherCourseQuiz: id("other_course_quiz"),
      otherCourseQuizSubmission: id("other_course_quiz_submission"),
      ownedCourseHomework: id("owned_course_homework"),
      otherTeacherHomework: id("other_teacher_homework"),
      staleOwnerHomework: id("stale_owner_homework"),
      ownedCourseHomeworkSubmission: id("owned_course_homework_submission"),
      otherTeacherHomeworkSubmission: id("other_teacher_homework_submission"),
      staleOwnerHomeworkSubmission: id("stale_owner_homework_submission"),
      attendanceRecord: id("attendance_record"),
      enrollmentOwned: id("enrollment_owned"),
      enrollmentSecondOwned: id("enrollment_second_owned"),
      enrollmentSecondOtherCourse: id("enrollment_second_other_course"),
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
      otherTeacher: token("other_teacher"),
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
    let lockClient;
    let observerClient;
    let reportLockClient;
    let reportObserverClient;
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
        [ids.secondOwnedStudent, "Second Owned Student HTTP Test", `second-owned-student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
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
         VALUES ($1, $2, $3, 'active'), ($4, $5, $6, 'active'), ($7, $2, $6, 'active'), ($8, $9, $10, 'cancelled'), ($11, $12, $3, 'active'), ($13, $12, $6, 'active')`,
        [
          ids.enrollmentOwned, ids.student, ids.ownedCourse,
          ids.enrollmentOtherStudent, ids.otherStudent, ids.otherCourse,
          ids.enrollmentStudentOtherCourse,
          ids.enrollmentCancelled, ids.unverifiedStudent, ids.ownedCourse,
          ids.enrollmentSecondOwned, ids.secondOwnedStudent,
          ids.enrollmentSecondOtherCourse,
        ],
      );
      // Seed one valid owned-course homework and two out-of-scope assignments.
      // The student is enrolled in both courses, so enrollment alone must not expose
      // another teacher's work. The stale-owner row simulates a course transfer where
      // homework.teacher_id was not updated; current course ownership must still win.
      await client.query(
        `INSERT INTO homework (id, title, description, teacher_id, teacher_name, stage, grade, course_id, unit, due_date, total_points)
         VALUES ($1, 'Owned course homework', 'Disposable integration fixture', $2, 'Teacher HTTP Test', 'Secondary', 'Third Secondary', $3, 'Unit 1', '2026-11-20', 50),
                ($4, 'Other teacher homework', 'Disposable integration fixture', $5, 'Other Teacher HTTP Test', 'Secondary', 'Third Secondary', $6, 'Unit 1', '2026-11-20', 50),
                ($7, 'Stale owner homework', 'Disposable integration fixture', $2, 'Teacher HTTP Test', 'Secondary', 'Third Secondary', $6, 'Unit 1', '2026-11-20', 50)`,
        [
          ids.ownedCourseHomework, ids.teacher, ids.ownedCourse,
          ids.otherTeacherHomework, ids.otherTeacher, ids.otherCourse,
          ids.staleOwnerHomework,
        ],
      );
      await client.query(
        `INSERT INTO homework_submissions (id, homework_id, student_id, student_name, answer_text, status, score, feedback)
         VALUES ($1, $2, $3, 'Student HTTP Test', 'owned-course answer', 'graded', 40, 'owned-course fixture'),
                ($4, $5, $3, 'Student HTTP Test', 'other-teacher answer', 'graded', 50, 'other-teacher fixture'),
                ($6, $7, $3, 'Student HTTP Test', 'stale-owner answer', 'graded', 50, 'stale-owner fixture')`,
        [
          ids.ownedCourseHomeworkSubmission, ids.ownedCourseHomework, ids.student,
          ids.otherTeacherHomeworkSubmission, ids.otherTeacherHomework,
          ids.staleOwnerHomeworkSubmission, ids.staleOwnerHomework,
        ],
      );

      // Seed assessment and attendance data from a course the test teacher does not own.
      // The same student is also enrolled in the teacher's owned course; these rows must
      // still be excluded from that teacher's report because their scope is unrelated.
      await client.query(
        `INSERT INTO quizzes (id, course_id, title, stage)
         VALUES ($1, $2, 'Other teacher private quiz', 'Secondary')`,
        [ids.otherCourseQuiz, ids.otherCourse],
      );
      await client.query(
        `INSERT INTO quiz_submissions (id, quiz_id, student_id, score, total_questions, percentage, passed, answers)
         VALUES ($1, $2, $3, 9, 10, 90, true, '{}'::jsonb)`,
        [ids.otherCourseQuizSubmission, ids.otherCourseQuiz, ids.student],
      );
      await client.query(
        `INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade, marked_by)
         VALUES ($1, $2, 'Student HTTP Test', 'Unscoped attendance fixture', '2026-11-04', 'present', 'Third Secondary', $3)`,
        [ids.attendanceRecord, ids.student, ids.otherTeacher],
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
        [id("session_other_teacher"), tokens.otherTeacher, ids.otherTeacher, "teacher"],
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

      async function requestAnalytics(sessionToken, studentId) {
        const url = new URL("/api/analytics", baseUrl);
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
        return { status: response.status, body, cacheControl: response.headers.get("cache-control") };
      }

      async function requestPost(path, sessionToken, payload) {
        const response = await fetch(new URL(path, baseUrl), {
          method: "POST",
          headers: {
            authorization: `Bearer ${sessionToken}`,
            "cache-control": "no-store",
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
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

      const teacherOwnStudent = await requestAnalytics(tokens.teacher, ids.student);
      assert.equal(teacherOwnStudent.status, 200, JSON.stringify(teacherOwnStudent.body));
      assert.equal(teacherOwnStudent.body.student?.id, ids.student);
      assert.equal(
        teacherOwnStudent.body.kpis?.totalHomework,
        1,
        "teacher report must include only the submission from the teacher-owned course, not submissions from another teacher or a transferred course",
      );
      assert.equal(
        teacherOwnStudent.body.kpis?.hwAvg,
        80,
        "teacher homework average must use only the 40/50 result from the owned course and exclude out-of-scope 50/50 results",
      );
      assert.equal(
        teacherOwnStudent.body.kpis?.totalExams,
        0,
        "teacher report must exclude quiz results from another teacher's course even when the student is also enrolled in an owned course",
      );
      assert.deepEqual(teacherOwnStudent.body.timeline, [], "unscoped assessment history must not appear in a teacher report");
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
      const teacherClassOwnStudent = (teacherClass.body.students || []).find((row) => row.id === ids.student);
      assert.ok(teacherClassOwnStudent, "teacher class analytics must include the student enrolled in the owned course");
      assert.equal(
        teacherClassOwnStudent.hwCompletion,
        100,
        "class analytics homework completion must include only the owned-course assignment and exclude other teachers' assignments",
      );
      assert.equal(
        teacherClassOwnStudent.avgScore,
        0,
        "class analytics assessment average must not include a quiz result from another teacher's course",
      );
      assert.equal(
        teacherClassOwnStudent.attRate,
        null,
        "class analytics must not include attendance records without provable course ownership",
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
      assert.equal(studentOwnReport.body.kpis?.totalExams, 1, "the student can still see their own quiz result");
      assert.equal(studentOwnReport.body.kpis?.totalSessions, 1, "the student can still see their own attendance record");

      // Omitting studentId for a student session must resolve only to that session's owner,
      // never to a class-wide response or another student's report.
      const studentImplicitOwnReport = await requestAnalytics(tokens.student);
      assert.equal(studentImplicitOwnReport.status, 200, JSON.stringify(studentImplicitOwnReport.body));
      assert.equal(studentImplicitOwnReport.body.scope, "student");
      assert.equal(studentImplicitOwnReport.body.student?.id, ids.student);
      assert.equal(studentImplicitOwnReport.body.kpis?.totalExams, 1);
      assert.equal(studentImplicitOwnReport.body.kpis?.totalSessions, 1);
      assert.equal(Object.hasOwn(studentImplicitOwnReport.body, "students"), false,
        "a student request without studentId must not return a class roster");

      const studentCrossReport = await requestAnalytics(tokens.student, ids.otherStudent);
      assert.equal(studentCrossReport.status, 403, "student must not access another student's report");

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

      // Exercise the other student-facing report surfaces through real HTTP requests.
      // These assertions share the same isolated PostgreSQL fixtures and session tokens.
      const teacherWeeklyReport = await requestRoute("/api/reports", tokens.teacher, ids.student);
      assert.equal(teacherWeeklyReport.status, 200, JSON.stringify(teacherWeeklyReport.body));
      assert.equal(teacherWeeklyReport.body.success, true);
      assert.match(teacherWeeklyReport.cacheControl || "", /private.*no-store/i,
        "weekly student reports must not be stored in shared caches");
      assert.equal(teacherWeeklyReport.body.report?.student?.id, ids.student);
      assert.equal(teacherWeeklyReport.body.report?.homework?.weekSubmissions, 1,
        "teacher weekly report must include only homework from the teacher-owned course");
      assert.equal(teacherWeeklyReport.body.report?.homework?.avgScore, 40,
        "teacher weekly report must exclude the other teacher's and stale-owner homework scores");
      assert.equal(teacherWeeklyReport.body.report?.quizzes?.weekAttempts, 0,
        "teacher weekly report must not expose quiz attempts from another teacher's course");
      assert.equal(teacherWeeklyReport.body.report?.attendance?.totalSessions, 0,
        "teacher weekly report must omit attendance without a provable owned-course scope");
      assert.deepEqual(teacherWeeklyReport.body.report?.courses?.courseNames, ["HTTP test owned course"]);

      const teacherOtherWeeklyReport = await requestRoute("/api/reports", tokens.teacher, ids.otherStudent);
      assert.equal(teacherOtherWeeklyReport.status, 403,
        "teacher weekly reports must reject a student enrolled only in another teacher's course");

      // The weekly report reads homework before quiz submissions. Pause the quiz
      // read, transfer the owned course, then ensure the final scope check rejects
      // the already-assembled homework aggregate instead of returning stale access.
      reportLockClient = new Client({ connectionString });
      reportObserverClient = new Client({ connectionString });
      await Promise.all([reportLockClient.connect(), reportObserverClient.connect()]);
      await reportLockClient.query("BEGIN");
      await reportLockClient.query("LOCK TABLE quiz_submissions IN ACCESS EXCLUSIVE MODE");
      const teacherWeeklyReportInFlight = requestRoute("/api/reports", tokens.teacher, ids.student)
        .catch((error) => ({ status: 0, body: { error: String(error) }, cacheControl: null }));
      await waitForBlockedQuery(reportObserverClient, "quiz_submissions");
      await client.query("UPDATE courses SET teacher_id = $2 WHERE id = $1", [ids.ownedCourse, ids.otherTeacher]);
      await reportLockClient.query("COMMIT");
      const transferredDuringWeeklyReport = await teacherWeeklyReportInFlight;
      assert.equal(transferredDuringWeeklyReport.status, 403,
        "weekly reports must deny the response when an owned course transfers after homework was read");
      await client.query("UPDATE courses SET teacher_id = $2 WHERE id = $1", [ids.ownedCourse, ids.teacher]);
      await reportLockClient.end();
      await reportObserverClient.end();
      reportLockClient = null;
      reportObserverClient = null;

      // A student's session may also become stale during report generation.
      // The route must re-check the current database role before returning data.
      reportLockClient = new Client({ connectionString });
      reportObserverClient = new Client({ connectionString });
      await Promise.all([reportLockClient.connect(), reportObserverClient.connect()]);
      await reportLockClient.query("BEGIN");
      await reportLockClient.query("LOCK TABLE quiz_submissions IN ACCESS EXCLUSIVE MODE");
      const studentWeeklyReportInFlight = requestRoute("/api/reports", tokens.student, ids.student)
        .catch((error) => ({ status: 0, body: { error: String(error) }, cacheControl: null }));
      await waitForBlockedQuery(reportObserverClient, "quiz_submissions");
      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.student]);
      await reportLockClient.query("COMMIT");
      const demotedDuringWeeklyReport = await studentWeeklyReportInFlight;
      assert.equal(demotedDuringWeeklyReport.status, 403,
        "weekly reports must reject a student whose account role changes while report reads are in flight");
      await client.query("UPDATE users SET role = 'student' WHERE id = $1", [ids.student]);
      await reportLockClient.end();
      await reportObserverClient.end();
      reportLockClient = null;
      reportObserverClient = null;

      const parentWeeklyReportWithoutSelection = await requestRoute("/api/reports", tokens.parent);
      assert.equal(parentWeeklyReportWithoutSelection.status, 400,
        "weekly reports must require explicit selection when multiple children are linked");
      const parentWeeklyReportEmptySelection = await requestRoute("/api/reports", tokens.parent, "");
      assert.equal(parentWeeklyReportEmptySelection.status, 400,
        "an empty studentId must not bypass explicit selection for weekly reports");
      const parentWeeklyReport = await requestRoute("/api/reports", tokens.parent, ids.student);
      assert.equal(parentWeeklyReport.status, 200, `${JSON.stringify(parentWeeklyReport.body)}\n${serverLog}`);
      assert.equal(parentWeeklyReport.body.report?.student?.id, ids.student);
      const parentWeeklyReportUnverified = await requestRoute("/api/reports", tokens.parent, ids.unverifiedStudent);
      assert.equal(parentWeeklyReportUnverified.status, 403,
        "weekly reports must reject a linked child whose relationship is not admin-verified");

      // An unverified legacy child still counts toward ambiguity, but selecting
      // that child must never authorize the weekly report.
      const parentMixedWeeklyReportWithoutSelection = await requestRoute("/api/reports", tokens.parentMixed);
      assert.equal(parentMixedWeeklyReportWithoutSelection.status, 400,
        "weekly reports must require explicit selection when one verified and one unverified child are linked");
      const parentMixedWeeklyReportVerifiedChild = await requestRoute("/api/reports", tokens.parentMixed, ids.student);
      assert.equal(parentMixedWeeklyReportVerifiedChild.status, 200,
        JSON.stringify(parentMixedWeeklyReportVerifiedChild.body));
      assert.equal(parentMixedWeeklyReportVerifiedChild.body.report?.student?.id, ids.student);
      const parentMixedWeeklyReportUnverifiedChild = await requestRoute("/api/reports", tokens.parentMixed, ids.unverifiedStudent);
      assert.equal(parentMixedWeeklyReportUnverifiedChild.status, 403,
        "explicit selection must not authorize an unverified child in weekly reports");

      const parentSingleWeeklyReport = await requestRoute("/api/reports", tokens.parentSingle);
      assert.equal(parentSingleWeeklyReport.status, 200, JSON.stringify(parentSingleWeeklyReport.body));
      assert.equal(parentSingleWeeklyReport.body.report?.student?.id, ids.student,
        "a parent with one distinct linked child may resolve that child without a selector");

      const studentWeeklyReport = await requestRoute("/api/reports", tokens.student);
      assert.equal(studentWeeklyReport.status, 200, JSON.stringify(studentWeeklyReport.body));
      assert.equal(studentWeeklyReport.body.report?.student?.id, ids.student,
        "student weekly reports must default only to the authenticated student");
      const studentCrossWeeklyReport = await requestRoute("/api/reports", tokens.student, ids.otherStudent);
      assert.equal(studentCrossWeeklyReport.status, 403,
        "student weekly reports must reject a forged studentId for another student");

      const crossTeacherAttendanceWrite = await requestPost("/api/attendance", tokens.teacher, {
        action: "bulk_mark",
        sessionTitle: "Unscoped attendance fixture",
        sessionDate: "2026-11-04",
        marks: [
          { studentId: ids.secondOwnedStudent, status: "present" },
          { studentId: ids.student, status: "absent" },
        ],
      });
      assert.equal(crossTeacherAttendanceWrite.status, 409,
        "a teacher must not overwrite an attendance record created by another teacher");
      const partialAttendanceWrite = await client.query(
        "SELECT id FROM attendance_records WHERE student_id = $1 AND session_title = $2 AND session_date = $3",
        [ids.secondOwnedStudent, "Unscoped attendance fixture", "2026-11-04"],
      );
      assert.equal(partialAttendanceWrite.rowCount, 0,
        "a rejected bulk mark must not partially create records for earlier marks");
      const originalAttendance = await client.query(
        "SELECT status, marked_by FROM attendance_records WHERE id = $1",
        [ids.attendanceRecord],
      );
      assert.equal(originalAttendance.rows[0]?.status, "present");
      assert.equal(originalAttendance.rows[0]?.marked_by, ids.otherTeacher,
        "a rejected request must preserve the other teacher's attendance record");

      // The second student is enrolled in both teachers' courses. With no existing
      // attendance row, concurrent requests must still serialize: exactly one
      // teacher creates the row and the other receives a conflict.
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const sessionTitle = `Concurrent attendance lock ${attempt}`;
        const payload = (status) => ({
          action: "bulk_mark",
          sessionTitle,
          sessionDate: "2026-11-05",
          marks: [{ studentId: ids.secondOwnedStudent, status }],
        });
        const [teacherWrite, otherTeacherWrite] = await Promise.all([
          requestPost("/api/attendance", tokens.teacher, payload("present")),
          requestPost("/api/attendance", tokens.otherTeacher, payload("absent")),
        ]);
        assert.deepEqual(
          [teacherWrite.status, otherTeacherWrite.status].sort(),
          [200, 409],
          "concurrent teachers must not both create the same attendance key",
        );
        const rows = await client.query(
          "SELECT marked_by FROM attendance_records WHERE student_id = $1 AND session_title = $2 AND session_date = $3",
          [ids.secondOwnedStudent, sessionTitle, "2026-11-05"],
        );
        assert.equal(rows.rowCount, 1, "concurrent marking must leave exactly one attendance row");
        assert.ok(
          [ids.teacher, ids.otherTeacher].includes(rows.rows[0].marked_by),
          "the winning attendance row must retain the authenticated teacher as its owner",
        );
      }

      const teacherAttendance = await requestRoute("/api/attendance", tokens.teacher);
      assert.equal(teacherAttendance.status, 200, JSON.stringify(teacherAttendance.body));
      assert.deepEqual(
        (teacherAttendance.body.roster || []).map((row) => row.studentId).sort(),
        [ids.student, ids.secondOwnedStudent].sort(),
        "teacher attendance roster must contain only active students in courses owned by that teacher",
      );
      assert.equal(
        (teacherAttendance.body.roster || []).some((row) => row.studentId === ids.otherStudent || row.studentId === ids.unverifiedStudent),
        false,
        "teacher attendance must exclude other-course and cancelled-enrollment students",
      );

      const parentAttendanceWithoutSelection = await requestRoute("/api/attendance", tokens.parent);
      assert.equal(parentAttendanceWithoutSelection.status, 400,
        "parent attendance must require explicit selection when multiple children are linked");
      const parentAttendance = await requestRoute("/api/attendance", tokens.parent, ids.student);
      assert.equal(parentAttendance.status, 200, JSON.stringify(parentAttendance.body));
      assert.equal(parentAttendance.body.studentId, ids.student);
      assert.equal(parentAttendance.body.total, 1);
      const parentAttendanceUnverified = await requestRoute("/api/attendance", tokens.parent, ids.unverifiedStudent);
      assert.equal(parentAttendanceUnverified.status, 403,
        "parent attendance must reject an unverified linked child");
      const studentAttendanceWithForgedSelector = await requestRoute("/api/attendance", tokens.student, ids.otherStudent);
      assert.equal(studentAttendanceWithForgedSelector.status, 200, JSON.stringify(studentAttendanceWithForgedSelector.body));
      assert.equal(studentAttendanceWithForgedSelector.body.studentId, ids.student,
        "attendance requests must resolve a student session to its own account, never a query-string target");

      const parentOverviewWithoutSelection = await requestRoute("/api/parent", tokens.parent);
      assert.equal(parentOverviewWithoutSelection.status, 400,
        "parent overview must require explicit selection when multiple children are linked");
      const parentOverview = await requestRoute("/api/parent", tokens.parent, ids.student);
      assert.equal(parentOverview.status, 200, JSON.stringify(parentOverview.body));
      assert.equal(parentOverview.body.student?.id, ids.student);

      // Pause the overview after its initial relationship check, revoke the link
      // while the quiz-submission read is blocked, then prove the final guard denies
      // the response instead of returning data authorized by a stale link.
      lockClient = new Client({ connectionString });
      observerClient = new Client({ connectionString });
      await Promise.all([lockClient.connect(), observerClient.connect()]);
      await lockClient.query("BEGIN");
      await lockClient.query("LOCK TABLE quiz_submissions IN ACCESS EXCLUSIVE MODE");
      const parentOverviewInFlight = requestRoute("/api/parent", tokens.parent, ids.student)
        .catch((error) => ({ status: 0, body: { error: String(error) } }));
      await waitForBlockedQuery(observerClient, "quiz_submissions");
      await client.query(
        "UPDATE parent_links SET verified_at = NULL, verified_by = NULL WHERE id = $1",
        [ids.linkStudent],
      );
      await lockClient.query("COMMIT");
      const revokedDuringOverview = await parentOverviewInFlight;
      assert.equal(
        revokedDuringOverview.status,
        403,
        "parent overview must revalidate the verified link after report reads and deny a link revoked in flight",
      );
      await client.query(
        "UPDATE parent_links SET verified_at = NOW(), verified_by = $2 WHERE id = $1",
        [ids.linkStudent, ids.admin],
      );

      // The link may remain verified while its administrator verifier loses
      // the admin role during the report reads. The final predicate must deny
      // the response just as it does when the link itself is revoked.
      await lockClient.query("BEGIN");
      await lockClient.query("LOCK TABLE quiz_submissions IN ACCESS EXCLUSIVE MODE");
      const verifierDemotionInFlight = requestRoute("/api/parent", tokens.parent, ids.student)
        .catch((error) => ({ status: 0, body: { error: String(error) } }));
      await waitForBlockedQuery(observerClient, "quiz_submissions");
      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.admin]);
      await lockClient.query("COMMIT");
      const verifierDemotedDuringOverview = await verifierDemotionInFlight;
      assert.equal(
        verifierDemotedDuringOverview.status,
        403,
        "parent overview must revalidate that the link's verifier is still an admin before returning student data",
      );
      await client.query("UPDATE users SET role = 'admin' WHERE id = $1", [ids.admin]);

      for (const privateField of ["email", "password", "phone", "parentPhone", "username"]) {
        assert.equal(Object.hasOwn(parentOverview.body.student || {}, privateField), false,
          `parent overview must not expose the student's ${privateField} field`);
      }
      const parentOverviewUnverified = await requestRoute("/api/parent", tokens.parent, ids.unverifiedStudent);
      assert.equal(parentOverviewUnverified.status, 403,
        "parent overview must reject an unverified linked child");
      const parentSingleOverview = await requestRoute("/api/parent", tokens.parentSingle);
      assert.equal(parentSingleOverview.status, 200, JSON.stringify(parentSingleOverview.body));
      assert.equal(parentSingleOverview.body.student?.id, ids.student);
      const studentParentOverview = await requestRoute("/api/parent", tokens.student, ids.student);
      assert.equal(studentParentOverview.status, 403,
        "students must not access the parent overview endpoint");
      const teacherParentOverview = await requestRoute("/api/parent", tokens.teacher, ids.student);
      assert.equal(teacherParentOverview.status, 403,
        "teachers must not use the parent overview endpoint to bypass course-scoped reports");
    } finally {
      if (reportLockClient) {
        await reportLockClient.query("ROLLBACK").catch(() => {});
        await reportLockClient.end().catch(() => {});
      }
      if (reportObserverClient) await reportObserverClient.end().catch(() => {});
      if (lockClient) {
        await lockClient.query("ROLLBACK").catch(() => {});
        await lockClient.end().catch(() => {});
      }
      if (observerClient) await observerClient.end().catch(() => {});
      await stopServer(server);
      if (client) {
        try {
          await client.query("DELETE FROM sessions WHERE id = ANY($1::text[])", [[ids.teacherSession, ids.studentSession, ids.parentSession, ids.parentSingleSession, ids.parentMixedSession, ids.parentUnverifiedOnlySession]]);
          await client.query("DELETE FROM parent_links WHERE id = ANY($1::text[])", [[ids.linkStudent, ids.linkOtherStudent, ids.linkUnverified, ids.linkUnverifiedOnly, ids.linkSingle, ids.linkSingleDuplicate, ids.linkMixedVerified, ids.linkMixedUnverified]]);
          await client.query("DELETE FROM homework_submissions WHERE id = ANY($1::text[])", [[ids.ownedCourseHomeworkSubmission, ids.otherTeacherHomeworkSubmission, ids.staleOwnerHomeworkSubmission]]);
          await client.query("DELETE FROM homework WHERE id = ANY($1::text[])", [[ids.ownedCourseHomework, ids.otherTeacherHomework, ids.staleOwnerHomework]]);
          await client.query("DELETE FROM quiz_submissions WHERE id = $1", [ids.otherCourseQuizSubmission]);
          await client.query("DELETE FROM quizzes WHERE id = $1", [ids.otherCourseQuiz]);
          await client.query(
            "DELETE FROM attendance_records WHERE id = $1 OR (student_id = $2 AND (session_title = $3 OR session_title LIKE $4))",
            [ids.attendanceRecord, ids.secondOwnedStudent, "Unscoped attendance fixture", "Concurrent attendance lock %"],
          );
          await client.query("DELETE FROM enrollments WHERE id = ANY($1::text[])", [[ids.enrollmentOwned, ids.enrollmentSecondOwned, ids.enrollmentSecondOtherCourse, ids.enrollmentOtherStudent, ids.enrollmentStudentOtherCourse, ids.enrollmentCancelled]]);
          await client.query("DELETE FROM courses WHERE id = ANY($1::text[])", [[ids.ownedCourse, ids.otherCourse]]);
          await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[ids.teacher, ids.otherTeacher, ids.student, ids.secondOwnedStudent, ids.otherStudent, ids.unlinkedStudent, ids.unverifiedStudent, ids.unverifiedOnlyStudent, ids.parent, ids.parentSingle, ids.parentMixed, ids.parentUnverifiedOnly, ids.admin]]);
        } catch {
          // The CI database is disposable; cleanup is best-effort if schema setup failed.
        } finally {
          await client.end().catch(() => {});
        }
      }
    }
  },
);
