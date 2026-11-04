import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

test("homework storage audit refuses to run without DATABASE_URL and emits no database or row details", () => {
  const script = resolve("scripts/audit-homework-storage.mjs");
  const result = spawnSync(process.execPath, [script], {
    cwd: tmpdir(),
    encoding: "utf8",
    env: {
      PATH: process.env.PATH || "",
      HOME: process.env.HOME || tmpdir(),
      NODE_ENV: "test",
    },
    timeout: 10000,
  });

  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /DATABASE_URL is required/);
  assert.doesNotMatch(result.stdout + result.stderr, /postgres(?:ql)?:\/\//i);
  assert.doesNotMatch(result.stdout + result.stderr, /student_id|storage_path|homework_submissions/i);
});
