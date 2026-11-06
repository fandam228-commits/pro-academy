import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { assertSafeHomeworkAuditTarget } from "../src/lib/homework-storage-audit.mjs";
import { runHomeworkStorageAudit } from "../scripts/audit-homework-storage.mjs";
import { tmpdir } from "node:os";

function runAudit(envOverrides = {}) {
  const script = resolve("scripts/audit-homework-storage.mjs");
  return spawnSync(process.execPath, [script], {
    cwd: tmpdir(),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH || "",
      HOME: process.env.HOME || tmpdir(),
      NODE_ENV: "test",
      ...envOverrides,
    },
    timeout: 10000,
  });
}

test("homework storage audit refuses to run without DATABASE_URL and emits no database or row details", () => {
  const result = runAudit();

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /DATABASE_URL is required/);
  assert.doesNotMatch(result.stdout + result.stderr, /postgres(?:ql)?:\/\//i);
  assert.doesNotMatch(result.stdout + result.stderr, /student_id|storage_path|homework_submissions/i);
});

test("homework storage audit refuses remote databases by default before attempting a connection", () => {
  const connectionString = "postgresql://audit-user:do-not-print@db.example.invalid/proacademy";
  const result = runAudit({ DATABASE_URL: connectionString });

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing a non-local database by default/);
  assert.doesNotMatch(result.stdout + result.stderr, /audit-user|do-not-print|db\.example\.invalid|postgres(?:ql)?:\/\//i);
});

test("remote homework storage audits require exactly one sslmode=verify-full", () => {
  const remoteDatabaseUrl = "postgresql://audit-user:do-not-print@db.example.invalid/proacademy";

  assert.throws(
    () => assertSafeHomeworkAuditTarget(remoteDatabaseUrl, true),
    /require DATABASE_URL sslmode=verify-full/,
  );
  for (const sslmode of ["prefer", "require", "verify-ca", "disable"]) {
    assert.throws(
      () => assertSafeHomeworkAuditTarget(remoteDatabaseUrl + "?sslmode=" + sslmode, true),
      /require DATABASE_URL sslmode=verify-full/,
    );
  }
  assert.throws(
    () => assertSafeHomeworkAuditTarget(
      remoteDatabaseUrl + "?sslmode=verify-full&sslmode=disable",
      true,
    ),
    /require DATABASE_URL sslmode=verify-full/,
  );
  assert.equal(
    assertSafeHomeworkAuditTarget(remoteDatabaseUrl + "?sslmode=verify-full", true),
    "remote-read-only-opt-in",
  );
});

test("CLI rejects an opted-in remote audit without verified TLS before connecting and redacts its URL", () => {
  const connectionString = "postgresql://audit-user:do-not-print@db.example.invalid/proacademy";
  const result = runAudit({
    DATABASE_URL: connectionString,
    ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT: "true",
  });

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /require DATABASE_URL sslmode=verify-full/);
  assert.doesNotMatch(result.stdout + result.stderr, /audit-user|do-not-print|db\.example\.invalid|postgres(?:ql)?:\/\//i);
});

test("remote audit opt-in must be the boolean true, not a truthy string", () => {
  const remoteDatabaseUrl = "postgresql://audit-user:do-not-print@db.example.invalid/proacademy?sslmode=verify-full";

  assert.throws(
    () => assertSafeHomeworkAuditTarget(remoteDatabaseUrl, "true"),
    /Refusing a non-local database by default/,
  );
  assert.equal(
    assertSafeHomeworkAuditTarget(remoteDatabaseUrl, true),
    "remote-read-only-opt-in",
  );
});

test("successful multi-batch storage audit emits aggregate counts only and redacts database, submission, student, and legacy URL values", async () => {
  const secrets = {
    connectionString: "postgresql://audit-user:do-not-print@localhost:5432/proacademy_test",
    submissionId: "submission-private-123",
    secondSubmissionId: "submission-private-789",
    studentId: "student-private-456",
    legacyUrl: "https://store.public.blob.vercel-storage.com/private-student-answer.pdf",
    privatePath: "homework/private/answer.pdf",
  };

  let clientInstance;
  class FakeClient {
    constructor({ connectionString }) {
      this.connectionString = connectionString;
      this.batchReads = 0;
      this.batchParameters = [];
      this.queries = [];
      clientInstance = this;
    }

    async connect() {
      this.connected = true;
    }

    async query(statement, parameters = []) {
      const sql = String(statement).trim();
      this.queries.push(sql);
      if (sql.startsWith("SELECT current_setting")) {
        return { rows: [{ read_only: "on", isolation: "repeatable read" }] };
      }
      if (sql.includes("FROM homework_submissions")) {
        this.batchReads += 1;
        this.batchParameters.push(parameters);
        if (this.batchReads === 1) {
          return {
            rows: [{
              id: secrets.submissionId,
              storage_path: secrets.legacyUrl,
            }],
          };
        }
        if (this.batchReads === 2) {
          return {
            rows: [{
              id: secrets.secondSubmissionId,
              storage_path: secrets.privatePath,
            }],
          };
        }
        return { rows: [] };
      }
      return { rows: [] };
    }

    async end() {
      this.ended = true;
    }
  }

  const output = [];
  const summary = await runHomeworkStorageAudit({
    connectionString: secrets.connectionString,
    allowRemote: false,
    batchSize: 1,
    ClientClass: FakeClient,
    write: (line) => output.push(line),
  });

  assert.deepEqual(summary, {
    totalRows: 2,
    empty: 0,
    privatePath: 1,
    absoluteUrlNeedsReview: 1,
    unknownOrMalformed: 0,
  });
  assert.equal(output.length, 1);
  const report = output[0];
  const parsed = JSON.parse(report);
  assert.equal(parsed.audit, "homework-storage-reference-inventory");
  assert.equal(parsed.target, "local");
  assert.equal(parsed.readOnly, true);
  assert.equal(parsed.snapshotIsolation, "repeatable read");
  assert.deepEqual(parsed.counts, summary);
  assert.doesNotMatch(
    report,
    /audit-user|do-not-print|proacademy_test|submission-private-123|submission-private-789|student-private-456|store\.public\.blob\.vercel-storage\.com|private-student-answer\.pdf|homework\/private\/answer\.pdf/,
    "successful audit output must not expose connection credentials, row identifiers, student IDs, or stored URLs/paths",
  );
  const batchQueries = clientInstance.queries.filter((sql) => sql.includes("FROM homework_submissions"));
  assert.equal(batchQueries.length, 3, "the audit must continue until an empty final batch");
  for (const sql of batchQueries) {
    assert.match(sql, /^SELECT id, storage_path\s+FROM homework_submissions/);
    assert.doesNotMatch(sql, /student_id/i, "the inventory must not select student identifiers");
  }
  assert.deepEqual(clientInstance.batchParameters, [
    [null, 1],
    [secrets.submissionId, 1],
    [secrets.secondSubmissionId, 1],
  ], "keyset pagination must use only the last row ID as an internal cursor");
  assert.ok(clientInstance.queries.some((sql) => sql.startsWith("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY")));
  assert.ok(clientInstance.queries.includes("ROLLBACK"), "the audit must roll back its read-only transaction");
  assert.equal(clientInstance.ended, true, "the client must always be closed");
});
