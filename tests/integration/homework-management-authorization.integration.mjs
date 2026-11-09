import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import {
  gradeHomeworkSubmission,
  deleteHomeworkWithAuthorization,
} from "../../src/lib/homework-management-authorization.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

const users = pgTable("users", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
  points: integer("points").notNull(),
});
const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
});
const homework = pgTable("homework", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  teacherId: text("teacher_id").notNull(),
  courseId: text("course_id"),
  totalPoints: integer("total_points"),
});
const homeworkSubmissions = pgTable("homework_submissions", {
  id: text("id").primaryKey(),
  homeworkId: text("homework_id").notNull(),
  studentId: text("student_id").notNull(),
  status: text("status"),
  score: integer("score"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
});

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      CREATE TEMP TABLE users (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0
      );
      CREATE TEMP TABLE courses (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL
      );
      CREATE TEMP TABLE homework (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        course_id TEXT,
        total_points INTEGER
      );
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY,
        homework_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT,
        score INTEGER,
        feedback TEXT,
        graded_at TIMESTAMPTZ
      );
      INSERT INTO users (id, role, points) VALUES
        ('teacher-1', 'teacher', 0),
        ('teacher-2', 'teacher', 0),
        ('admin-1', 'admin', 0),
        ('student-1', 'student', 0);
      INSERT INTO courses (id, teacher_id) VALUES
        ('course-owned', 'teacher-1'),
        ('course-other', 'teacher-2');
      INSERT INTO homework (id, title, teacher_id, course_id, total_points) VALUES
        ('hw-owned', 'Owned assignment', 'teacher-1', 'course-owned', 50),
        ('hw-stale-owner', 'Stale owner assignment', 'teacher-1', 'course-other', 50),
        ('hw-other', 'Other assignment', 'teacher-2', 'course-other', 50),
        ('hw-grade-only', 'Grade-only assignment', 'teacher-1', NULL, 20);
      INSERT INTO homework_submissions (id, homework_id, student_id, status) VALUES
        ('sub-owned', 'hw-owned', 'student-1', 'submitted'),
        ('sub-stale-owner', 'hw-stale-owner', 'student-1', 'submitted'),
        ('sub-other', 'hw-other', 'student-1', 'submitted'),
        ('sub-grade-only', 'hw-grade-only', 'student-1', 'submitted');
    `);
    await run({ client, database: drizzle(client) });
  } finally {
    await client.end();
  }
}

async function waitForBlockedQuery(observer, tableName, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await observer.query(
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
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for a PostgreSQL query blocked on ${tableName}`);
}

const tables = { users, courses, homework, homeworkSubmissions };

integrationTest("PostgreSQL grading allows only the current owner and keeps the grade write atomic", async () => {
  await withFixture(async ({ client, database }) => {
    const allowed = await gradeHomeworkSubmission({
      database, tables, actorId: "teacher-1", actorRole: "teacher",
      submissionId: "sub-owned", score: "42", feedback: "Good work",
    });
    assert.deepEqual(allowed, {
      ok: true, studentId: "student-1", homeworkTitle: "Owned assignment", score: 42, maxPoints: 50,
    });

    const row = await client.query(
      "SELECT status, score, feedback FROM homework_submissions WHERE id = 'sub-owned'",
    );
    assert.deepEqual(row.rows[0], { status: "graded", score: 42, feedback: "Good work" });
    const student = await client.query("SELECT points FROM users WHERE id = 'student-1'");
    assert.equal(student.rows[0].points, 42);

    for (const submissionId of ["sub-stale-owner", "sub-other"]) {
      const denied = await gradeHomeworkSubmission({
        database, tables, actorId: "teacher-1", actorRole: "teacher", submissionId, score: 50, feedback: "",
      });
      assert.deepEqual(denied, { ok: false, status: 403, error: "Forbidden" });
    }
    const gradeOnly = await gradeHomeworkSubmission({
      database, tables, actorId: "teacher-1", actorRole: "teacher",
      submissionId: "sub-grade-only", score: 25, feedback: "",
    });
    assert.equal(gradeOnly.ok, true, "grade-only homework remains manageable by its assigned teacher");

    const admin = await gradeHomeworkSubmission({
      database, tables, actorId: "admin-1", actorRole: "admin",
      submissionId: "sub-other", score: 45, feedback: "Admin review",
    });
    assert.equal(admin.ok, true, "an administrator may grade another teacher's assignment");
  });
});

integrationTest("PostgreSQL deletion enforces current course ownership and preserves admin access", async () => {
  await withFixture(async ({ client, database }) => {
    const denied = await deleteHomeworkWithAuthorization({
      database, tables, actorId: "teacher-1", actorRole: "teacher", homeworkId: "hw-stale-owner",
    });
    assert.deepEqual(denied, { ok: false, status: 403, error: "Forbidden" });
    const stillThere = await client.query("SELECT id FROM homework WHERE id = 'hw-stale-owner'");
    assert.equal(stillThere.rowCount, 1);

    const allowed = await deleteHomeworkWithAuthorization({
      database, tables, actorId: "teacher-1", actorRole: "teacher", homeworkId: "hw-owned",
    });
    assert.deepEqual(allowed, { ok: true });
    const deleted = await client.query("SELECT id FROM homework WHERE id = 'hw-owned'");
    assert.equal(deleted.rowCount, 0);

    const admin = await deleteHomeworkWithAuthorization({
      database, tables, actorId: "admin-1", actorRole: "admin", homeworkId: "hw-other",
    });
    assert.deepEqual(admin, { ok: true });
  });
});

integrationTest("PostgreSQL grading fails closed when the actor role changes while authorization waits for its row lock", async () => {
  await withFixture(async ({ client, database }) => {
    const blocker = new Client({ connectionString });
    const observer = new Client({ connectionString });
    await Promise.all([blocker.connect(), observer.connect()]);
    try {
      await blocker.query("BEGIN");
      await blocker.query("SELECT id FROM users WHERE id = 'teacher-1' FOR UPDATE");
      const pending = gradeHomeworkSubmission({
        database, tables, actorId: "teacher-1", actorRole: "teacher",
        submissionId: "sub-owned", score: 40, feedback: "",
      });
      await waitForBlockedQuery(observer, "users");
      await blocker.query("UPDATE users SET role = 'student' WHERE id = 'teacher-1'");
      await blocker.query("COMMIT");

      const result = await pending;
      assert.deepEqual(result, { ok: false, status: 403, error: "Forbidden" });
      const submission = await client.query("SELECT status FROM homework_submissions WHERE id = 'sub-owned'");
      assert.equal(submission.rows[0].status, "submitted");
    } finally {
      try { await blocker.query("ROLLBACK"); } catch { /* Preserve the test result if cleanup already committed. */ }
      await Promise.all([blocker.end(), observer.end()]);
    }
  });
});

integrationTest("PostgreSQL grading fails closed when course ownership changes while authorization waits for the course lock", async () => {
  await withFixture(async ({ client, database }) => {
    const blocker = new Client({ connectionString });
    const observer = new Client({ connectionString });
    await Promise.all([blocker.connect(), observer.connect()]);
    try {
      await blocker.query("BEGIN");
      await blocker.query("SELECT id FROM courses WHERE id = 'course-owned' FOR UPDATE");
      const pending = gradeHomeworkSubmission({
        database, tables, actorId: "teacher-1", actorRole: "teacher",
        submissionId: "sub-owned", score: 40, feedback: "",
      });
      await waitForBlockedQuery(observer, "courses");
      await blocker.query("UPDATE courses SET teacher_id = 'teacher-2' WHERE id = 'course-owned'");
      await blocker.query("COMMIT");

      const result = await pending;
      assert.deepEqual(result, { ok: false, status: 403, error: "Forbidden" });
      const submission = await client.query("SELECT status FROM homework_submissions WHERE id = 'sub-owned'");
      assert.equal(submission.rows[0].status, "submitted");
    } finally {
      try { await blocker.query("ROLLBACK"); } catch {}
      await Promise.all([blocker.end(), observer.end()]);
    }
  });
});
