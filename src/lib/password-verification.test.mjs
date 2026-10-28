import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import {
  isLegacyPlaintextPassword,
  verifyStoredPassword,
} from "./password-verification.mjs";

test("legacy plaintext passwords compare the complete value, not a 64-character prefix", () => {
  const prefix = "p".repeat(64);
  const stored = prefix + "-legacy-tail";

  assert.equal(verifyStoredPassword(prefix, stored), false);
  assert.equal(verifyStoredPassword(prefix + "-wrong-tail", stored), false);
  assert.equal(verifyStoredPassword(stored, stored), true);
});

test("legacy plaintext passwords of more than 64 characters still support exact login", () => {
  const stored = "correct-horse-battery-staple-".repeat(4);
  assert.ok(stored.length > 64);
  assert.equal(verifyStoredPassword(stored, stored), true);
  assert.equal(verifyStoredPassword(stored.slice(0, 64), stored), false);
});

test("legacy plaintext comparison handles Unicode and colon-containing passwords exactly", () => {
  assert.equal(verifyStoredPassword("päss🔐word", "päss🔐word"), true);
  assert.equal(verifyStoredPassword("päss🔐word", "päss🔒word"), false);
  assert.equal(verifyStoredPassword("old:legacy:password", "old:legacy:password"), true);
  assert.equal(isLegacyPlaintextPassword("old:legacy:password"), true);
});

test("well-formed scrypt hashes verify normally and are not classified as legacy plaintext", () => {
  const password = "new-hashed-password";
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  const stored = `${salt}:${hash}`;

  assert.equal(verifyStoredPassword(password, stored), true);
  assert.equal(verifyStoredPassword("incorrect-password", stored), false);
  assert.equal(isLegacyPlaintextPassword(stored), false);
});

test("empty and non-string stored credentials fail closed", () => {
  assert.equal(verifyStoredPassword("", ""), false);
  assert.equal(verifyStoredPassword("password", ""), false);
  assert.equal(verifyStoredPassword("password", null), false);
  assert.equal(verifyStoredPassword(null, "password"), false);
  assert.equal(isLegacyPlaintextPassword(null), false);
});
