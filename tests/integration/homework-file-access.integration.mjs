import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "pg";
import {
  getHomeworkFileAccessDecision,
  getHomeworkFileStorageDecision,
} from "../../src/lib/homework-file-access.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

integrationTest("database-derived homework file authorization denies unrelated teachers and legacy public URLs", async () => {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Connection-scoped temporary fixtures only; no application or production tables are touched.
    await client.query(`
      CREATE TEMP TABLE users (id TEXT PRIMARY KEY, role TEXT NOT NULL);
      CREATE TEMP TABLE courses (id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL);
      CREATE TEMP TABLE homework (id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, course_id TEXT);
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY, student_id TEXT NOT NULL, homework_id TEXT NOT NULL, storage_path TEXT
      );
      INSERT INTO users VALUES
        ('teacher-1', 'teacher'), ('teacher-2', 'teacher'),
        ('student-1', 'student'), ('student-2', 'student'),
        ('admin-1', 'admin'), ('parent-1', 'parent');
      INSERT INTO courses VALUES ('course-owned', 'teacher-1'), ('course-other', 'teacher-2');
      INSERT INTO homework VALUES
        ('hw-owned', 'teacher-1', 'course-owned'),
        ('hw-mismatch', 'teacher-1', 'course-other'),
        ('hw-grade-only', 'teacher-1', NULL),
        ('hw-other', 'teacher-2', 'course-other');
      INSERT INTO homework_submissions VALUES
        ('sub-owned', 'student-1', 'hw-owned', 'homework/sub-owned.pdf'),
        ('sub-mismatch', 'student-1', 'hw-mismatch', 'homework/sub-mismatch.pdf'),
        ('sub-grade-only', 'student-1', 'hw-grade-only', 'homework/sub-grade-only.pdf'),
        ('sub-legacy', 'student-2', 'hw-other', 'https://public.blob.vercel-storage.com/legacy.pdf');
    `);

    async function resolve(submissionId, requesterId) {
      const requester = await client.query("SELECT role FROM users WHERE id = $1", [requesterId]);
      const row = await client.query(
        `SELECT s.id, s.student_id, s.storage_path, h.teacher_id, h.course_id, c.teacher_id AS course_teacher_id
         FROM homework_submissions AS s
         INNER JOIN homework AS h ON h.id = s.homework_id
         LEFT JOIN courses AS c ON c.id = h.course_id
         WHERE s.id = $1`,
        [submissionId],
      );
      const record = row.rows[0] ?? null;
      return {
        record,
        decision: getHomeworkFileAccessDecision({
          submissionFound: Boolean(record),
          homeworkFound: Boolean(record),
          role: requester.rows[0]?.role,
          requesterId,
          submissionStudentId: record?.student_id,
          homeworkTeacherId: record?.teacher_id,
          homeworkCourseId: record?.course_id,
          courseTeacherId: record?.course_teacher_id,
        }),
      };
    }

    assert.equal((await resolve("sub-owned", "student-1")).decision, "allowed");
    assert.equal((await resolve("sub-owned", "student-2")).decision, "not-found");
    assert.equal((await resolve("sub-owned", "teacher-1")).decision, "allowed");
    assert.equal((await resolve("sub-owned", "teacher-2")).decision, "not-found");
    assert.equal((await resolve("sub-owned", "admin-1")).decision, "allowed");
    assert.equal((await resolve("sub-owned", "parent-1")).decision, "not-found");
    assert.equal((await resolve("missing", "teacher-1")).decision, "not-found");

    const mismatched = await resolve("sub-mismatch", "teacher-1");
    assert.equal(mismatched.decision, "not-found",
      "the current course owner must override stale homework teacher metadata");

    assert.equal((await resolve("sub-grade-only", "teacher-1")).decision, "allowed");

    const legacy = await resolve("sub-legacy", "student-2");
    assert.equal(legacy.decision, "allowed");
    assert.equal(
      getHomeworkFileStorageDecision({
        storagePath: legacy.record.storage_path,
        privateBlobToken: "synthetic-test-token",
      }),
      "legacy-public-url",
      "an authorized caller must still not receive a redirect to a legacy public URL",
    );
  } finally {
    await client.end();
  }
});
