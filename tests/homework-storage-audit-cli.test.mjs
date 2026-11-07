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
      () => assertSafeHomeworkAuditTarget(`${remoteDatabaseUrl}?sslmode=${sslmode}`, true),
      /require DATABASE_URL sslmode=verify-full/,
    );
  }
  assert.throws(
    () => assertSafeHomeworkAuditTarget(
      `${remoteDatabaseUrl}?sslmode=verify-full&sslmode=disable`,
      true,
    ),
    /require DATABASE_URL sslmode=verify-full/,
  );
  assert.equal(
    assertSafeHomeworkAuditTarget(`${remoteDatabaseUrl}?sslmode=verify-full`, true),
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


test("successful audit keyset-paginates in a read-only snapshot and emits aggregate counts only", async () => {
  class FakeAuditClient {
    constructor() {
      this.calls = [];
      this.batches = [
        [
          { id: "submission-secret-001", storage_path: "https://store-secret.public.blob.vercel-storage.com/student-secret.pdf" },
          { id: "submission-secret-002", storage_path: "homework/private/student-secret.pdf" },
        ],
        [
          { id: "submission-secret-003", storage_path: "https://legacy-secret.example/student-secret.pdf" },
        ],
      ];
      this.ended = false;
    }

    async connect() {}

    async query(sql, params) {
      this.calls.push({ sql, params });
      if (sql.includes("current_setting('transaction_read_only')")) {
        return { rows: [{ read_only: "on", isolation: "repeatable read" }] };
      }
      if (sql.includes("FROM homework_submissions")) {
        return { rows: this.batches.shift() ?? [] };
      }
      return { rows: [] };
    }

    async end() {
      this.ended = true;
    }
  }

  const client = new FakeAuditClient();
  const output = [];
  const summary = await runHomeworkStorageAudit({
    connectionString: "postgresql://audit:audit@127.0.0.1:5432/proacademy_test",
    allowRemote: false,
    batchSize: 2,
    ClientClass: class {
      constructor() { return client; }
    },
    write: (line) => output.push(line),
  });

  assert.deepEqual(summary, {
    totalRows: 3,
    empty: 0,
    privatePath: 1,
    vercelPublicBlobUrlNeedsReview: 1,
    absoluteUrlNeedsReview: 1,
    unknownOrMalformed: 0,
  });

  const batchQueries = client.calls.filter((call) => call.sql.includes("FROM homework_submissions"));
  assert.deepEqual(batchQueries.map((call) => call.params), [
    [null, 2],
    ["submission-secret-002", 2],
  ], "the next bounded batch must continue after the last ID from the previous batch");

  assert.ok(client.calls.some((call) => call.sql === "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY"));
  assert.equal(client.calls.filter((call) => call.sql === "ROLLBACK").length, 1);
  assert.equal(client.calls.some((call) => /\\bCOMMIT\\b/i.test(call.sql)), false);
  assert.equal(client.ended, true);

  const serialized = output.join("\\n");
  assert.equal(output.length, 1);
  assert.match(serialized, /"readOnly": true/);
  assert.match(serialized, /"vercelPublicBlobUrlNeedsReview": 1/);
  assert.doesNotMatch(serialized, /store-secret|legacy-secret|student-secret|submission-secret|\.pdf/);
});

test("audit rolls back and closes the client when a batch read fails", async () => {
  class FailingAuditClient {
    constructor() { this.calls = []; this.ended = false; }
    async connect() {}
    async query(sql, params) {
      this.calls.push({ sql, params });
      if (sql.includes("current_setting('transaction_read_only')")) {
        return { rows: [{ read_only: "on", isolation: "repeatable read" }] };
      }
      if (sql.includes("FROM homework_submissions")) {
        throw new Error("synthetic audit read failure");
      }
      return { rows: [] };
    }
    async end() { this.ended = true; }
  }

  const client = new FailingAuditClient();
  await assert.rejects(
    runHomeworkStorageAudit({
      connectionString: "postgresql://audit:audit@127.0.0.1:5432/proacademy_test",
      allowRemote: false,
      ClientClass: class {
        constructor() { return client; }
      },
      write: () => assert.fail("failed audits must not emit a partial inventory"),
    }),
    /synthetic audit read failure/,
  );

  assert.equal(client.calls.filter((call) => call.sql === "ROLLBACK").length, 1);
  assert.equal(client.ended, true);
});
