import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
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

test("homework storage audit rejects malformed batch sizes before database target validation or connection", () => {
  const connectionString = "postgresql://audit-user:do-not-print@db.example.invalid/proacademy";
  const invalidBatchSizes = ["", "0", "-1", "+1", "01", "1.5", "1e2", "5001", "9007199254740992"];

  for (const batchSize of invalidBatchSizes) {
    const result = runAudit({
      DATABASE_URL: connectionString,
      HOMEWORK_AUDIT_BATCH_SIZE: batchSize,
    });

    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 1, `batch size ${JSON.stringify(batchSize)} must fail closed`);
    assert.match(
      result.stderr,
      /HOMEWORK_AUDIT_BATCH_SIZE must be an integer between 1 and 5000/,
      `batch size ${JSON.stringify(batchSize)} must be rejected before target validation`,
    );
    assert.doesNotMatch(
      result.stdout + result.stderr,
      /audit-user|do-not-print|db\.example\.invalid|postgres(?:ql)?:\/\//i,
      "audit configuration errors must not disclose connection details",
    );
  }
});;
