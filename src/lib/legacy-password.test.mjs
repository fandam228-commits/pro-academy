import test from "node:test";
import assert from "node:assert/strict";
import { isScryptPasswordHash, legacyPasswordMatches } from "./legacy-password.mjs";

test("matches exactly equal legacy plaintext passwords", () => {
  assert.equal(legacyPasswordMatches("correct horse", "correct horse"), true);
});

test("rejects different passwords that share the first 64 characters", () => {
  const prefix = "a".repeat(64);
  assert.equal(legacyPasswordMatches(prefix + "x", prefix + "y"), false);
  assert.equal(legacyPasswordMatches(prefix, prefix + "x"), false);
});

test("rejects length mismatches instead of padding or truncating", () => {
  assert.equal(legacyPasswordMatches("short", "short "), false);
  assert.equal(legacyPasswordMatches("short", "shorter"), false);
  assert.equal(legacyPasswordMatches("", " "), false);
});

test("compares complete UTF-8 values including Arabic text", () => {
  assert.equal(legacyPasswordMatches("كلمة مرور", "كلمة مرور"), true);
  assert.equal(legacyPasswordMatches("كلمة مرور", "كلمة مرور مختلفة"), false);
});

test("legacy plaintext passwords containing colons remain ordinary plaintext", () => {
  assert.equal(isScryptPasswordHash("teacher:2026"), false);
  assert.equal(legacyPasswordMatches("teacher:2026", "teacher:2026"), true);
});

test("only the exact scrypt salt:hash format is recognized as a hash", () => {
  assert.equal(isScryptPasswordHash("a".repeat(32) + ":" + "b".repeat(128)), true);
  assert.equal(isScryptPasswordHash("a".repeat(32) + ":" + "b".repeat(127)), false);
  assert.equal(isScryptPasswordHash("salt:hash"), false);
  assert.equal(isScryptPasswordHash(null), false);
});

test("rejects non-string inputs safely", () => {
  assert.equal(legacyPasswordMatches(null, "password"), false);
  assert.equal(legacyPasswordMatches("password", undefined), false);
});
