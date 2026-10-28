import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_INPUT_LIMITS,
  isWithinLoginInputLimits,
  isWithinRegistrationInputLimits,
} from "./auth-input-limits.mjs";

test("login input accepts ordinary credentials and the documented maximum boundary", () => {
  assert.equal(isWithinLoginInputLimits("student@example.com", "correct horse battery staple"), true);
  assert.equal(
    isWithinLoginInputLimits("x".repeat(AUTH_INPUT_LIMITS.loginId), "p".repeat(AUTH_INPUT_LIMITS.password)),
    true
  );
});

test("login input rejects oversized identifiers and passwords before authentication work", () => {
  assert.equal(isWithinLoginInputLimits("x".repeat(AUTH_INPUT_LIMITS.loginId + 1), "password"), false);
  assert.equal(isWithinLoginInputLimits("student@example.com", "p".repeat(AUTH_INPUT_LIMITS.password + 1)), false);
});

test("login input rejects empty, whitespace-only, and non-string values", () => {
  assert.equal(isWithinLoginInputLimits("", "password"), false);
  assert.equal(isWithinLoginInputLimits("   ", "password"), false);
  assert.equal(isWithinLoginInputLimits("student@example.com", ""), false);
  assert.equal(isWithinLoginInputLimits(123, "password"), false);
  assert.equal(isWithinLoginInputLimits("student@example.com", { value: "password" }), false);
});

test("registration input accepts values at the configured maximum lengths", () => {
  assert.equal(
    isWithinRegistrationInputLimits({
      name: "N".repeat(AUTH_INPUT_LIMITS.name),
      email: "e".repeat(AUTH_INPUT_LIMITS.email - "@x.co".length) + "@x.co",
      password: "p".repeat(AUTH_INPUT_LIMITS.password),
    }),
    true
  );
});

test("registration input rejects oversized fields and non-string values", () => {
  assert.equal(
    isWithinRegistrationInputLimits({
      name: "N".repeat(AUTH_INPUT_LIMITS.name + 1),
      email: "student@example.com",
      password: "password123",
    }),
    false
  );
  assert.equal(
    isWithinRegistrationInputLimits({
      name: "Student",
      email: "e".repeat(AUTH_INPUT_LIMITS.email + 1),
      password: "password123",
    }),
    false
  );
  assert.equal(
    isWithinRegistrationInputLimits({
      name: "Student",
      email: "student@example.com",
      password: "p".repeat(AUTH_INPUT_LIMITS.password + 1),
    }),
    false
  );
  assert.equal(
    isWithinRegistrationInputLimits({ name: {}, email: "student@example.com", password: "password123" }),
    false
  );
  assert.equal(isWithinRegistrationInputLimits(), false);
});
