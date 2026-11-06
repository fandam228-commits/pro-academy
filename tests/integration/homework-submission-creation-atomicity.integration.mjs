import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { withHomeworkSubmissionLock } from "../../src/lib/homework-submission-lock.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

const submissions = pgTable("homework_submission_lock_test", {
  id: text("id").primaryKey(),
  homeworkId: text("homework_id").notNull(),
  studentId: text("student_id").notNull(),
  answerText: text("answer_text").notNull(),
});

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

integrationTest("concurrent first submissions for one student/homework pair create only one row", async () => {
  assertLocalTestDatabase(connectionString);
  const setup = new Client({ connectionString });
  const clients = [new Client({ connectionString }), new Client({ connectionString })];
  await setup.connect();
  try {
    await setup.query(`
      CREATE TABLE IF NOT EXISTS homework_submission_lock_test (
        id TEXT PRIMARY KEY,
        homework_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        answer_text TEXT NOT NULL
      )
    `);

    for (const client of clients) await client.connect();

    const homeworkId = randomUUID();
    const studentId = randomUUID();

    const submit = (client, answerText) => {
      const database = drizzle(client);
      return database.transaction(async (tx) =>
        withHomeworkSubmissionLock(
          tx,
          { homeworkId, studentId },
          async (lockedTx) => {
            const existing = await lockedTx
              .select()
              .from(submissions)
              .where(and(
                eq(submissions.homeworkId, homeworkId),
                eq(submissions.studentId, studentId),
              ));

            if (existing.length === 0) {
              // Hold the first transaction briefly so the other request overlaps
              // while attempting to acquire the same advisory lock.
              await delay(75);
              await lockedTx.insert(submissions).values({
                id: randomUUID(),
                homeworkId,
                studentId,
                answerText,
              });
              return "inserted";
            }

            assert.equal(existing.length, 1, "legacy duplicate rows must never be silently selected");
            await lockedTx
              .update(submissions)
              .set({ answerText })
              .where(eq(submissions.id, existing[0].id));
            return "updated";
          },
        )
      );
    };

    const outcomes = await Promise.all([
      submit(clients[0], "concurrent answer A"),
      submit(clients[1], "concurrent answer B"),
    ]);
    assert.deepEqual([...outcomes].sort(), ["inserted", "updated"]);

    const stored = await setup.query(
      "SELECT id, answer_text FROM homework_submission_lock_test WHERE homework_id = $1 AND student_id = $2",
      [homeworkId, studentId],
    );
    assert.equal(stored.rowCount, 1, "only one submission row may exist for the pair");
    assert.ok(
      ["concurrent answer A", "concurrent answer B"].includes(stored.rows[0].answer_text),
      "the serialized replacement must leave one complete submitted answer",
    );

    await setup.query(
      "DELETE FROM homework_submission_lock_test WHERE homework_id = $1 AND student_id = $2",
      [homeworkId, studentId],
    );
  } finally {
    for (const client of clients) {
      if (client._connected) await client.end();
    }
    await setup.query("DROP TABLE IF EXISTS homework_submission_lock_test");
    await setup.end();
  }
});
