import test from "node:test";
import assert from "node:assert/strict";
import { createLoginAttemptLimiter } from "./login-attempts.mjs";

function makeLimiter(options = {}) {
  let currentTime = 1_000_000;
  const limiter = createLoginAttemptLimiter({ now: () => currentTime, ...options });
  return {
    limiter,
    advance: (milliseconds) => { currentTime += milliseconds; },
  };
}

test("locks after the configured number of failures and normalizes identifiers", () => {
  const { limiter } = makeLimiter();
  for (let i = 0; i < 4; i += 1) limiter.recordFailedLogin(" Teacher@Example.com ");
  assert.equal(limiter.checkLoginLock("teacher@example.com"), 0);
  limiter.recordFailedLogin("TEACHER@example.com");
  assert.equal(limiter.checkLoginLock("teacher@example.com"), 10);
});

test("successful authentication can clear a tracked identifier", () => {
  const { limiter } = makeLimiter();
  limiter.recordFailedLogin("student@example.com");
  limiter.recordFailedLogin("student@example.com");
  limiter.clearFailedLogins(" STUDENT@example.com ");
  assert.equal(limiter.checkLoginLock("student@example.com"), 0);
  assert.equal(limiter.getTrackedKeyCount(), 0);
});

test("failure counts expire after the rolling attempt window", () => {
  const { limiter, advance } = makeLimiter({ maxAttempts: 2, attemptWindowMs: 1_000, lockoutMs: 5_000 });
  limiter.recordFailedLogin("user@example.com");
  advance(1_001);
  limiter.recordFailedLogin("user@example.com");
  assert.equal(limiter.checkLoginLock("user@example.com"), 0);
});

test("lockout expires and the record is cleaned up", () => {
  const { limiter, advance } = makeLimiter({ maxAttempts: 1, lockoutMs: 2_000 });
  limiter.recordFailedLogin("user@example.com");
  assert.equal(limiter.checkLoginLock("user@example.com"), 1);
  advance(2_000);
  assert.equal(limiter.checkLoginLock("user@example.com"), 0);
  assert.equal(limiter.getTrackedKeyCount(), 0);
});

test("capacity remains bounded without evicting another identifier's failure history", () => {
  const { limiter } = makeLimiter({ maxAttempts: 2, maxTrackedKeys: 2, lockoutMs: 60_000 });
  limiter.recordFailedLogin("first@example.com");
  limiter.recordFailedLogin("second@example.com");
  assert.equal(limiter.checkLoginLock("new@example.com"), 1);
  assert.equal(limiter.recordFailedLogin("new@example.com"), false);
  assert.equal(limiter.getTrackedKeyCount(), 2);

  limiter.recordFailedLogin("first@example.com");
  assert.equal(limiter.checkLoginLock("first@example.com"), 1);
  assert.equal(limiter.getTrackedKeyCount(), 2);
});

test("empty identifiers are ignored safely", () => {
  const { limiter } = makeLimiter();
  assert.equal(limiter.checkLoginLock("  "), 0);
  assert.equal(limiter.recordFailedLogin(""), false);
  limiter.clearFailedLogins("  ");
  assert.equal(limiter.getTrackedKeyCount(), 0);
});
