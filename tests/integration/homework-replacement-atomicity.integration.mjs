import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
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
        answer_text TEXT NOT NULL,
        storage_path TEXT
      );
      INSERT INTO homework_submissions (id, status, answer_text, storage_path)
      VALUES ('submission-1', 'submitted', 'original answer', 'homework/original.pdf');
    `);
    await run(client);
  } finally {
    await client.end();
  }
}

integrationTest("a grading update that wins after preflight cannot be overwritten by replacement", async () => {
  await withFixture(async (client) => {
    const preflight = await client.query(
      "SELECT status FROM homework_submissions WHERE id = $1",
      ["submission-1"],
    );
    assert.equal(preflight.rows[0].status, "submitted");

    // Simulate the teacher grading the row after the application's preflight read.
    await client.query(
      "UPDATE homework_submissions SET status = 'graded' WHERE id = $1",
      ["submission-1"],
    );

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

integrationTest("concurrent replacements cannot overwrite a storage path read from stale preflight state", async () => {
  await withFixture(async (client) => {
    const preflight = await client.query(
      "SELECT storage_path FROM homework_submissions WHERE id = $1",
      ["submission-1"],
    );
    const originalPath = preflight.rows[0].storage_path;
    assert.equal(originalPath, "homework/original.pdf");

    const firstReplacement = await client.query(
      `UPDATE homework_submissions
       SET answer_text = $1, storage_path = $2
       WHERE id = $3
         AND (status IS NULL OR status <> 'graded')
         AND storage_path = $4
       RETURNING id`,
      ["first replacement", "homework/first.pdf", "submission-1", originalPath],
    );
    assert.equal(firstReplacement.rowCount, 1);

    // A competing request that read the same original path must lose its
    // compare-and-swap update instead of overwriting the first replacement.
    const staleReplacement = await client.query(
      `UPDATE homework_submissions
       SET answer_text = $1, storage_path = $2
       WHERE id = $3
         AND (status IS NULL OR status <> 'graded')
         AND storage_path = $4
       RETURNING id`,
      ["stale replacement", "homework/stale.pdf", "submission-1", originalPath],
    );
    assert.equal(staleReplacement.rowCount, 0);

    const after = await client.query(
      "SELECT answer_text, storage_path FROM homework_submissions WHERE id = $1",
      ["submission-1"],
    );
    assert.equal(after.rows[0].answer_text, "first replacement");
    assert.equal(after.rows[0].storage_path, "homework/first.pdf");
  });
});
