import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_INPUT_LIMITS,
  isWithinLoginInputLimits,
  isWithinRegistrationInputLimits,
  MAX_AUTH_BODY_BYTES,
  readBoundedJsonBody,
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

test("registration keeps optional profile fields optional for existing clients", () => {
  const base = { name: "Student", email: "student@example.com", password: "password123" };
  assert.equal(isWithinRegistrationInputLimits(base), true);
  assert.equal(
    isWithinRegistrationInputLimits({
      ...base,
      stage: null,
      grade: null,
      phone: null,
      parentPhone: null,
      referralCode: null,
    }),
    true
  );
});


test("bounded JSON reader accepts an ordinary object body", async () => {
  const request = new Request("https://example.test/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "login", username: "student", password: "secret" }),
  });
  const result = await readBoundedJsonBody(request);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value, { action: "login", username: "student", password: "secret" });
});

test("bounded JSON reader rejects a declared oversized body before reading it", async () => {
  const request = new Request("https://example.test/api/auth", {
    method: "POST",
    headers: { "content-length": String(MAX_AUTH_BODY_BYTES + 1) },
    body: "{}",
  });
  const result = await readBoundedJsonBody(request);
  assert.deepEqual(result, { ok: false, status: 413, error: "Request body is too large." });
});

test("bounded JSON reader counts streamed bytes even without a Content-Length header", async () => {
  const request = new Request("https://example.test/api/auth", {
    method: "POST",
    body: "x".repeat(33),
  });
  const result = await readBoundedJsonBody(request, 32);
  assert.deepEqual(result, { ok: false, status: 413, error: "Request body is too large." });
});

test("bounded JSON reader rejects malformed JSON, arrays, primitives, and bad length headers", async () => {
  const malformed = await readBoundedJsonBody(new Request("https://example.test", {
    method: "POST", body: "{",
  }));
  assert.equal(malformed.ok, false);
  if (!malformed.ok) assert.equal(malformed.status, 400);

  const arrayBody = await readBoundedJsonBody(new Request("https://example.test", {
    method: "POST", body: "[]",
  }));
  assert.deepEqual(arrayBody, { ok: false, status: 400, error: "Request body must be a JSON object." });

  const primitiveBody = await readBoundedJsonBody(new Request("https://example.test", {
    method: "POST", body: "null",
  }));
  assert.deepEqual(primitiveBody, { ok: false, status: 400, error: "Request body must be a JSON object." });

  const badLength = await readBoundedJsonBody(new Request("https://example.test", {
    method: "POST", headers: { "content-length": "many" }, body: "{}",
  }));
  assert.deepEqual(badLength, { ok: false, status: 400, error: "Invalid Content-Length header." });
});
