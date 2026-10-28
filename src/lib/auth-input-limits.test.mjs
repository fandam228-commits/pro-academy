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
      stage: "S".repeat(AUTH_INPUT_LIMITS.stage),
      grade: "G".repeat(AUTH_INPUT_LIMITS.grade),
      phone: "1".repeat(AUTH_INPUT_LIMITS.phone),
      parentPhone: "2".repeat(AUTH_INPUT_LIMITS.parentPhone),
      referralCode: "R".repeat(AUTH_INPUT_LIMITS.referralCode),
    }),
    true
  );
});

test("registration input rejects oversized required and optional fields", () => {
  const base = { name: "Student", email: "student@example.com", password: "password123" };
  assert.equal(isWithinRegistrationInputLimits({ ...base, name: "N".repeat(AUTH_INPUT_LIMITS.name + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, email: "e".repeat(AUTH_INPUT_LIMITS.email + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, password: "p".repeat(AUTH_INPUT_LIMITS.password + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, stage: "S".repeat(AUTH_INPUT_LIMITS.stage + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, grade: "G".repeat(AUTH_INPUT_LIMITS.grade + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, phone: "1".repeat(AUTH_INPUT_LIMITS.phone + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, parentPhone: "2".repeat(AUTH_INPUT_LIMITS.parentPhone + 1) }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, referralCode: "R".repeat(AUTH_INPUT_LIMITS.referralCode + 1) }), false);
});

test("registration input rejects empty passwords, malformed fields, and non-string profile values", () => {
  const base = { name: "Student", email: "student@example.com", password: "password123" };
  assert.equal(isWithinRegistrationInputLimits({ ...base, password: "" }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, name: {} }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, stage: {} }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, grade: 3 }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, phone: [] }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, parentPhone: 123 }), false);
  assert.equal(isWithinRegistrationInputLimits({ ...base, referralCode: {} }), false);
  assert.equal(isWithinRegistrationInputLimits(), false);
  assert.equal(isWithinRegistrationInputLimits(null), false);
  assert.equal(isWithinRegistrationInputLimits([]), false);
});
