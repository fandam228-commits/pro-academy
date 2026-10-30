import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY,
        status TEXT,
        answer_text TEXT NOT NULL
      );
      INSERT INTO homework_submissions (id, status, answer_text)
      VALUES ('submission-1', 'submitted', 'original answer');
    `);
    await run(client);
  } finally {
    await client.end();
  }
}

integrationTest("a grading update that wins after preflight cannot be overwritten by replacement", async () => {
  await withFixture(async (client) => {
    // This represents the route's initial preflight read.
    const preflight = await client.query(
      "SELECT status FROM homework_submissions WHERE id = $1",
      ["submission-1"],
    );
    assert.equal(preflight.rows[0].status, "submitted");

    // Simulate a concurrent teacher grading the submission after preflight.
    await client.query(
      "UPDATE homework_submissions SET status = 'graded' WHERE id = $1",
      ["submission-1"],
    );

    // Match the route's final atomic predicate: only an ungraded row may change.
    const replacement = await client.query(
      `UPDATE homework_submissions
       SET answer_text = $1, status = 'submitted'
       WHERE id = $2 AND (status IS NULL OR status <> 'graded')
       RETURNING id`,
      ["replacement answer", "submission-1"],
    );

    assert.equal(replacement.rowCount, 0, "the guarded update must affect no graded row");
    const after = await client.query(
      "SELECT status, answer_text FROM homework_submissions WHERE id = $1",
      ["submission-1"],
    );
    assert.equal(after.rows[0].status, "graded");
    assert.equal(after.rows[0].answer_text, "original answer");
  });
});

integrationTest("the atomic replacement predicate still permits an ungraded submission", async () => {
  await withFixture(async (client) => {
    const replacement = await client.query(
      `UPDATE homework_submissions
       SET answer_text = $1
       WHERE id = $2 AND (status IS NULL OR status <> 'graded')
       RETURNING id`,
      ["replacement answer", "submission-1"],
    );
    assert.equal(replacement.rowCount, 1);
    const after = await client.query(
      "SELECT status, answer_text FROM homework_submissions WHERE id = $1",
      ["submission-1"],
    );
    assert.equal(after.rows[0].status, "submitted");
    assert.equal(after.rows[0].answer_text, "replacement answer");
  });
});
