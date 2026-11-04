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
      unverifiedStudent: id("unverified_student"),
      parent: id("parent"),
      parentSingle: id("parent_single"),
      admin: id("admin"),
      ownedCourse: id("owned_course"),
      otherCourse: id("other_course"),
      otherCourseQuiz: id("other_course_quiz"),
      otherCourseQuizSubmission: id("other_course_quiz_submission"),
      attendanceRecord: id("attendance_record"),
      enrollmentOwned: id("enrollment_owned"),
      enrollmentOtherStudent: id("enrollment_other_student"),
      enrollmentStudentOtherCourse: id("enrollment_student_other_course"),
      linkStudent: id("link_student"),
      linkOtherStudent: id("link_other_student"),
      linkUnverified: id("link_unverified"),
      linkSingle: id("link_single"),
      teacherSession: id("session_teacher"),
      studentSession: id("session_student"),
      parentSession: id("session_parent"),
      parentSingleSession: id("session_parent_single"),
    };
    const tokens = {
      teacher: token("teacher"),
      student: token("student"),
      parent: token("parent"),
      parentSingle: token("parent_single"),
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
        [ids.unverifiedStudent, "Unverified Student HTTP Test", `unverified-student-${suffix}@example.test`, "test-only-password", "student", "Third Secondary"],
        [ids.parent, "Parent HTTP Test", `parent-${suffix}@example.test`, "test-only-password", "parent", null],
        [ids.parentSingle, "Single Child Parent HTTP Test", `single-parent-${suffix}@example.test`, "test-only-password", "parent", null],
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
         VALUES ($1, $2, $3, 'active'), ($4, $5, $6, 'active'), ($7, $2, $6, 'active')`,
        [
          ids.enrollmentOwned, ids.student, ids.ownedCourse,
          ids.enrollmentOtherStudent, ids.otherStudent, ids.otherCourse,
          ids.enrollmentStudentOtherCourse,
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
        `INSERT INTO attendance_records (id, student_id, student_name, session_title, session_date, status, grade)
         VALUES ($1, $2, 'Student HTTP Test', 'Unscoped attendance fixture', '2026-11-04', 'present', 'Third Secondary')`,
        [ids.attendanceRecord, ids.student],
      );

      await client.query(
        `INSERT INTO parent_links (id, parent_id, student_id, relationship, verified_at, verified_by)
         VALUES ($1, $2, $3, 'Guardian', NOW(), $4),
                ($5, $2, $6, 'Guardian', NOW(), $4),
                ($7, $2, $8, 'Guardian', NULL, NULL),
                ($9, $10, $11, 'Guardian', NOW(), $12)`,
        [
          ids.linkStudent, ids.parent, ids.student, ids.admin,
          ids.linkOtherStudent, ids.otherStudent,
          ids.linkUnverified, ids.unverifiedStudent,
          ids.linkSingle, ids.parentSingle, ids.student, ids.admin,
        ],
      );
      const sessions = [
        [ids.teacherSession, tokens.teacher, ids.teacher, "teacher"],
        [ids.studentSession, tokens.student, ids.student, "student"],
        [ids.parentSession, tokens.parent, ids.parent, "parent"],
        [ids.parentSingleSession, tokens.parentSingle, ids.parentSingle, "parent"],
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

      const teacherOwnStudent = await requestAnalytics(tokens.teacher, ids.student);
      assert.equal(teacherOwnStudent.status, 200, JSON.stringify(teacherOwnStudent.body));
      assert.equal(teacherOwnStudent.body.student?.id, ids.student);
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

      const teacherClass = await requestAnalytics(tokens.teacher);
      assert.equal(teacherClass.status, 200, JSON.stringify(teacherClass.body));
      assert.equal(
        (teacherClass.body.students || []).some((row) => row.id === ids.otherStudent),
        false,
        "teacher roster must exclude students outside the teacher's owned-course enrollments",
      );

      const parentWithoutSelection = await requestAnalytics(tokens.parent);
      assert.equal(parentWithoutSelection.status, 400, "parent must explicitly choose when multiple verified children are linked");

      const parentSelectedChild = await requestAnalytics(tokens.parent, ids.student);
      assert.equal(parentSelectedChild.status, 200, JSON.stringify(parentSelectedChild.body));
      assert.equal(parentSelectedChild.body.student?.id, ids.student);

      const parentSingleChildDefault = await requestAnalytics(tokens.parentSingle);
      assert.equal(parentSingleChildDefault.status, 200, JSON.stringify(parentSingleChildDefault.body));
      assert.equal(
        parentSingleChildDefault.body.student?.id,
        ids.student,
        "a parent with exactly one verified linked child may default to that child",
      );

      const parentUnverifiedChild = await requestAnalytics(tokens.parent, ids.unverifiedStudent);
      assert.equal(parentUnverifiedChild.status, 403, "an unverified legacy link must not authorize a report");

      const studentOwnReport = await requestAnalytics(tokens.student, ids.student);
      assert.equal(studentOwnReport.status, 200, JSON.stringify(studentOwnReport.body));
      assert.equal(studentOwnReport.body.student?.id, ids.student);
      assert.equal(studentOwnReport.body.kpis?.totalExams, 1, "the student can still see their own quiz result");
      assert.equal(studentOwnReport.body.kpis?.totalSessions, 1, "the student can still see their own attendance record");

      const studentCrossReport = await requestAnalytics(tokens.student, ids.otherStudent);
      assert.equal(studentCrossReport.status, 403, "student must not access another student's report");

      // Revalidate current database roles rather than trusting the role copied into a session.
      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.otherStudent]);
      const parentStaleStudentRole = await requestAnalytics(tokens.parent, ids.otherStudent);
      assert.equal(parentStaleStudentRole.status, 403, "a link to an account that is no longer a student must fail closed");
      await client.query("UPDATE users SET role = 'student' WHERE id = $1", [ids.otherStudent]);

      await client.query("UPDATE users SET role = 'teacher' WHERE id = $1", [ids.parent]);
      const staleParentRole = await requestAnalytics(tokens.parent, ids.student);
      assert.equal(staleParentRole.status, 403, "a stale parent session must not authorize reports after the account role changes");
      await client.query("UPDATE users SET role = 'parent' WHERE id = $1", [ids.parent]);
    } finally {
      await stopServer(server);
      if (client) {
        try {
          await client.query("DELETE FROM sessions WHERE id = ANY($1::text[])", [[ids.teacherSession, ids.studentSession, ids.parentSession, ids.parentSingleSession]]);
          await client.query("DELETE FROM parent_links WHERE id = ANY($1::text[])", [[ids.linkStudent, ids.linkOtherStudent, ids.linkUnverified, ids.linkSingle]]);
          await client.query("DELETE FROM quiz_submissions WHERE id = $1", [ids.otherCourseQuizSubmission]);
          await client.query("DELETE FROM quizzes WHERE id = $1", [ids.otherCourseQuiz]);
          await client.query("DELETE FROM attendance_records WHERE id = $1", [ids.attendanceRecord]);
          await client.query("DELETE FROM enrollments WHERE id = ANY($1::text[])", [[ids.enrollmentOwned, ids.enrollmentOtherStudent, ids.enrollmentStudentOtherCourse]]);
          await client.query("DELETE FROM courses WHERE id = ANY($1::text[])", [[ids.ownedCourse, ids.otherCourse]]);
          await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[ids.teacher, ids.otherTeacher, ids.student, ids.otherStudent, ids.unverifiedStudent, ids.parent, ids.parentSingle, ids.admin]]);
        } catch {
          // The CI database is disposable; cleanup is best-effort if schema setup failed.
        } finally {
          await client.end().catch(() => {});
        }
      }
    }
  },
);
