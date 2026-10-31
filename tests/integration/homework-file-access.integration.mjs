import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { getHomeworkFileAccessDecision } from "../../src/lib/homework-authorization.mjs";
import { getHomeworkFileStorageDecision } from "../../src/lib/homework-storage.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

integrationTest("database-derived homework file access is owner-scoped and legacy URLs fail closed", async () => {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Connection-scoped temporary fixtures only; never touches application or production tables.
    await client.query(`
      CREATE TEMP TABLE homework (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL
      );
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        homework_id TEXT NOT NULL,
        storage_path TEXT
      );
      INSERT INTO homework (id, teacher_id) VALUES
        ('hw-owned', 'teacher-1'),
        ('hw-other', 'teacher-2');
      INSERT INTO homework_submissions (id, student_id, homework_id, storage_path) VALUES
        ('sub-private', 'student-1', 'hw-owned', 'homework/sub-private.pdf'),
        ('sub-legacy', 'student-2', 'hw-other', 'https://store.public.blob.vercel-storage.com/legacy.pdf');
    `);

    async function lookup(submissionId) {
      const result = await client.query(
        `SELECT s.id, s.student_id, s.storage_path, h.teacher_id
         FROM homework_submissions AS s
         INNER JOIN homework AS h ON h.id = s.homework_id
         WHERE s.id = $1`,
        [submissionId],
      );
      return result.rows[0] ?? null;
    }

    const privateSubmission = await lookup("sub-private");
    assert.ok(privateSubmission);
    const access = (role, requesterId, row) => getHomeworkFileAccessDecision({
      submissionFound: Boolean(row),
      homeworkFound: Boolean(row),
      role,
      requesterId,
      submissionStudentId: row?.student_id,
      homeworkTeacherId: row?.teacher_id,
    });

    assert.equal(access("student", "student-1", privateSubmission), "allowed");
    assert.equal(access("student", "student-2", privateSubmission), "not-found");
    assert.equal(access("teacher", "teacher-1", privateSubmission), "allowed");
    assert.equal(access("teacher", "teacher-2", privateSubmission), "not-found");
    assert.equal(access("parent", "parent-1", privateSubmission), "not-found");
    assert.equal(access("student", "student-1", null), "not-found");

    assert.equal(
      getHomeworkFileStorageDecision({
        storagePath: privateSubmission.storage_path,
        privateBlobToken: "synthetic-test-token",
      }),
      "stream-private",
    );

    const legacySubmission = await lookup("sub-legacy");
    assert.ok(legacySubmission);
    assert.equal(access("student", "student-2", legacySubmission), "allowed");
    assert.equal(
      getHomeworkFileStorageDecision({
        storagePath: legacySubmission.storage_path,
        privateBlobToken: "synthetic-test-token",
      }),
      "legacy-public-url",
      "an authorized caller must still not turn a legacy absolute URL into a private redirect",
    );
  } finally {
    await client.end();
  }
});
