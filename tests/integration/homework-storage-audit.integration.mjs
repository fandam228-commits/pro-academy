import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import {
  beginConsistentReadOnlyHomeworkAudit,
  assertSafeHomeworkAuditTarget,
  classifyHomeworkStoragePath,
  summarizeHomeworkStoragePaths,
  mergeHomeworkStoragePathSummaries,
} from "../../src/lib/homework-storage-audit.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

test("storage audit classifies references without exposing their values", () => {
  assert.equal(classifyHomeworkStoragePath(null), "empty");
  assert.equal(classifyHomeworkStoragePath("  "), "empty");
  assert.equal(classifyHomeworkStoragePath("homework/submission.pdf"), "private-path");
  assert.equal(classifyHomeworkStoragePath("https://blob.example/file.pdf"), "absolute-url-needs-review");
  assert.equal(classifyHomeworkStoragePath("homework/../secrets.pdf"), "unknown-or-malformed");
  assert.equal(classifyHomeworkStoragePath("homework/%2e%2e/secrets.pdf"), "unknown-or-malformed");

  const summary = summarizeHomeworkStoragePaths([
    null,
    "homework/a.pdf",
    "https://blob.example/old.pdf",
    "homework/../bad.pdf",
  ]);
  assert.deepEqual(summary, {
    totalRows: 4,
    empty: 1,
    privatePath: 1,
    absoluteUrlNeedsReview: 1,
    unknownOrMalformed: 1,
  });
  assert.deepEqual(
    mergeHomeworkStoragePathSummaries(summary, { totalRows: 1, absoluteUrlNeedsReview: 1 }),
    {
      totalRows: 5,
      empty: 1,
      privatePath: 1,
      absoluteUrlNeedsReview: 2,
      unknownOrMalformed: 1,
    },
  );
});

test("storage audit keeps local targets available and fails closed for remote targets without verified TLS", () => {
  assert.throws(() => assertSafeHomeworkAuditTarget(""), /DATABASE_URL is required/);
  assert.throws(
    () => assertSafeHomeworkAuditTarget("https://example.test"),
    (error) => error instanceof Error && error.message.includes("must use the postgres:// or postgresql:// protocol"),
  );
  assert.equal(
    assertSafeHomeworkAuditTarget("postgresql://postgres:postgres@127.0.0.1:5432/proacademy_test"),
    "local",
  );

  const remoteWithoutTls = "postgresql://user:pass@db.example.test/prod";
  assert.throws(
    () => assertSafeHomeworkAuditTarget(remoteWithoutTls),
    /Refusing a non-local database by default/,
  );
  assert.throws(
    () => assertSafeHomeworkAuditTarget(remoteWithoutTls, true),
    /require DATABASE_URL sslmode=verify-full/,
  );

  for (const sslmode of ["disable", "allow", "prefer", "require", "verify-ca"]) {
    assert.throws(
      () => assertSafeHomeworkAuditTarget(`${remoteWithoutTls}?sslmode=${sslmode}`, true),
      /require DATABASE_URL sslmode=verify-full/,
    );
  }

  assert.throws(
    () => assertSafeHomeworkAuditTarget(
      `${remoteWithoutTls}?sslmode=verify-full&sslmode=disable`,
      true,
    ),
    /require DATABASE_URL sslmode=verify-full/,
  );
  assert.equal(
    assertSafeHomeworkAuditTarget(`${remoteWithoutTls}?sslmode=verify-full`, true),
    "remote-read-only-opt-in",
  );
});

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
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

    // The test touches only a uniquely named table in the disposable localhost CI database.
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
    assert.equal(secondRead.rows[0].count, 1, "later audit batches must keep the original snapshot");

    await assert.rejects(
      () => reader.query(`INSERT INTO "${tableName}" (id) VALUES ('must-not-write')`),
      /read-only transaction/i,
    );
  } finally {
    if (readerConnected) {
      try { await reader.query("ROLLBACK"); } catch { /* Preserve the original test failure. */ }
    }
    if (tableCreated && adminConnected) {
      try { await admin.query(`DROP TABLE IF EXISTS "${tableName}"`); } catch { /* Disposable CI database. */ }
    }
    if (writerConnected) await writer.end();
    if (readerConnected) await reader.end();
    if (adminConnected) await admin.end();
  }
});
