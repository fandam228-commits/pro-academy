import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { assertSafeHomeworkAuditTarget } from "../src/lib/homework-storage-audit.mjs";
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
