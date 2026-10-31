import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSafeHomeworkAuditTarget,
  beginConsistentReadOnlyHomeworkAudit,
  classifyHomeworkStoragePath,
  summarizeHomeworkStoragePaths,
  mergeHomeworkStoragePathSummaries,
} from "./homework-storage-audit.mjs";

test("storage audit classifies empty and private homework paths without exposing values", () => {
  assert.equal(classifyHomeworkStoragePath(null), "empty");
  assert.equal(classifyHomeworkStoragePath("  "), "empty");
  assert.equal(classifyHomeworkStoragePath("homework/submission-123.pdf"), "private-path");
  assert.equal(classifyHomeworkStoragePath("homework/nested/submission-123.pdf"), "private-path");
});

test("absolute URLs are flagged for review, not assumed to be public", () => {
  assert.equal(
    classifyHomeworkStoragePath("https://example.invalid/student-file.pdf"),
    "absolute-url-needs-review",
  );
  assert.equal(classifyHomeworkStoragePath("HTTP://example.invalid/student-file.pdf"), "absolute-url-needs-review");
});

test("malformed paths and traversal attempts are never classified as private", () => {
  for (const value of [
    "homework/../secrets.pdf",
    "homework/%2e%2e/secrets.pdf",
    "homework/%2Fescape.pdf",
    "homework/%ZZ/file.pdf",
    "homework//file.pdf",
    "homework/file.pdf?token=secret",
    "homework\\file.pdf",
    "other/file.pdf",
    "file.pdf",
  ]) {
    assert.equal(classifyHomeworkStoragePath(value), "unknown-or-malformed", value);
  }
});

test("audit summary reports aggregate counts only", () => {
  assert.deepEqual(
    summarizeHomeworkStoragePaths([
      null,
      "homework/file.pdf",
      "https://example.invalid/private.pdf",
      "homework/../escape.pdf",
      "homework/%2e%2e/escape.pdf",
      "",
    ]),
    {
      totalRows: 6,
      empty: 2,
      privatePath: 1,
      absoluteUrlNeedsReview: 1,
      unknownOrMalformed: 2,
    },
  );
});



test("audit summaries can be combined across bounded batches without retaining paths", () => {
  const firstBatch = summarizeHomeworkStoragePaths([
    null,
    "homework/first.pdf",
    "https://example.invalid/legacy.pdf",
  ]);
  const secondBatch = summarizeHomeworkStoragePaths([
    "homework/%2e%2e/escape.pdf",
    "  ",
  ]);

  assert.deepEqual(
    mergeHomeworkStoragePathSummaries(firstBatch, secondBatch),
    {
      totalRows: 5,
      empty: 2,
      privatePath: 1,
      absoluteUrlNeedsReview: 1,
      unknownOrMalformed: 1,
    },
  );
});

test("audit target requires a PostgreSQL URL and defaults to local databases only", () => {
  assert.throws(() => assertSafeHomeworkAuditTarget(""), /DATABASE_URL is required/);
  assert.throws(() => assertSafeHomeworkAuditTarget("https://example.invalid/db"), /postgres/);
  assert.equal(
    assertSafeHomeworkAuditTarget("postgresql://audit:password@localhost/proacademy"),
    "local",
  );
  assert.equal(
    assertSafeHomeworkAuditTarget("postgresql://audit:password@127.0.0.1/proacademy"),
    "local",
  );
  assert.throws(
    () => assertSafeHomeworkAuditTarget("postgresql://audit:password@db.example.invalid/proacademy"),
    /Refusing a non-local database/,
  );
});

test("remote audit requires explicit opt-in and verified TLS identity", () => {
  const remoteUrl = "postgresql://audit:password@db.example.invalid/proacademy";
  assert.throws(
    () => assertSafeHomeworkAuditTarget(remoteUrl),
    /Refusing a non-local database/,
  );
  assert.throws(
    () => assertSafeHomeworkAuditTarget(remoteUrl, true),
    /require DATABASE_URL sslmode=verify-full/,
  );
  for (const sslmode of ["prefer", "require", "verify-ca", "disable"]) {
    assert.throws(
      () => assertSafeHomeworkAuditTarget(`${remoteUrl}?sslmode=${sslmode}`, true),
      /require DATABASE_URL sslmode=verify-full/,
      sslmode,
    );
  }
  assert.equal(
    assertSafeHomeworkAuditTarget(`${remoteUrl}?sslmode=verify-full`, true),
    "remote-read-only-opt-in",
  );
});

test("read-only storage audit uses one repeatable-read snapshot across batches", async () => {
  const statements = [];
  await beginConsistentReadOnlyHomeworkAudit({
    async query(statement) {
      statements.push(statement);
    },
  });
  assert.deepEqual(statements, [
    "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
  ]);
});

test("read-only storage audit refuses a client without a query method", async () => {
  await assert.rejects(
    () => beginConsistentReadOnlyHomeworkAudit(null),
    /PostgreSQL-compatible client is required/,
  );
});
