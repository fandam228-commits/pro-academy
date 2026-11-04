import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import {
  beginConsistentReadOnlyHomeworkAudit,
  scanHomeworkStorageReferences,
  buildHomeworkStorageAuditReport,
} from "../../src/lib/homework-storage-audit.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

integrationTest("homework audit transaction keeps a stable snapshot and rejects persistent writes", async () => {
  assertLocalTestDatabase(connectionString);

  const tableName = `homework_audit_snapshot_${randomUUID().replaceAll("-", "")}`;
  const admin = new Client({ connectionString });
  const reader = new Client({ connectionString });
  const writer = new Client({ connectionString });
  let readerConnected = false;
  let adminConnected = false;
  let writerConnected = false;
  let tableCreated = false;

  try {
    await admin.connect();
    adminConnected = true;
    await reader.connect();
    readerConnected = true;
    await writer.connect();
    writerConnected = true;

    // This integration test is restricted to the disposable localhost test DB.
    // A uniquely named table is removed in finally; no application tables are touched.
    await admin.query(`CREATE TABLE "${tableName}" (id TEXT PRIMARY KEY)`);
    tableCreated = true;
    await admin.query(`INSERT INTO "${tableName}" (id) VALUES ('before-snapshot')`);

    await beginConsistentReadOnlyHomeworkAudit(reader);
    const mode = await reader.query(
      "SELECT current_setting('transaction_read_only') AS read_only, current_setting('transaction_isolation') AS isolation",
    );
    assert.equal(mode.rows[0].read_only, "on");
    assert.equal(mode.rows[0].isolation, "repeatable read");

    const firstRead = await reader.query(`SELECT count(*)::int AS count FROM "${tableName}"`);
    assert.equal(firstRead.rows[0].count, 1);

    await writer.query(`INSERT INTO "${tableName}" (id) VALUES ('after-snapshot')`);

    const secondRead = await reader.query(`SELECT count(*)::int AS count FROM "${tableName}"`);
    assert.equal(secondRead.rows[0].count, 1, "later batches must continue to see the original snapshot");

    await assert.rejects(
      () => reader.query(`INSERT INTO "${tableName}" (id) VALUES ('must-not-write')`),
      /read-only transaction/i,
    );
  } finally {
    if (readerConnected) {
      try {
        await reader.query("ROLLBACK");
      } catch {
        // Preserve the original test result if the transaction is already closed.
      }
    }
    if (tableCreated && adminConnected) {
      try {
        await admin.query(`DROP TABLE IF EXISTS "${tableName}"`);
      } catch {
        // The CI database is disposable; preserve the original assertion failure.
      }
    }
    if (writerConnected) await writer.end();
    if (readerConnected) await reader.end();
    if (adminConnected) await admin.end();
  }
});

integrationTest("homework audit scans legacy public Blob references and returns counts without leaking paths", async () => {
  assertLocalTestDatabase(connectionString);

  const client = new Client({ connectionString });
  let connected = false;
  let transactionStarted = false;

  try {
    await client.connect();
    connected = true;

    // A session-local temp table shadows any real homework_submissions table.
    // Synthetic rows only: this test never reads or writes application submissions.
    await client.query("CREATE TEMP TABLE homework_submissions (id TEXT PRIMARY KEY, storage_path TEXT)");
    await client.query(
      "INSERT INTO homework_submissions (id, storage_path) VALUES ($1, $2), ($3, $4), ($5, $6)",
      [
        "audit-test-private",
        "homework/synthetic-private.pdf",
        "audit-test-public",
        "https://store-id.public.blob.vercel-storage.com/homework/synthetic-student-secret.pdf",
        "audit-test-other-url",
        "https://example.invalid/synthetic-student-secret.pdf",
      ],
    );

    await beginConsistentReadOnlyHomeworkAudit(client);
    transactionStarted = true;
    const summary = await scanHomeworkStorageReferences(client, { batchSize: 2 });
    const report = buildHomeworkStorageAuditReport("local", summary);
    const serialized = JSON.stringify(report);

    assert.deepEqual(summary, {
      totalRows: 3,
      empty: 0,
      privatePath: 1,
      vercelPublicBlobUrlNeedsReview: 1,
      absoluteUrlNeedsReview: 1,
      unknownOrMalformed: 0,
    });
    assert.doesNotMatch(
      serialized,
      /audit-test-|synthetic-student-secret|public\.blob\.vercel-storage\.com|example\.invalid/,
      "the audit result must contain aggregate counts, not row IDs or stored references",
    );
  } finally {
    if (connected) {
      if (transactionStarted) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // Preserve the original test failure if rollback is unavailable.
        }
      }
      await client.end();
    }
  }
});

