import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

// 1. PHONE NUMBER NORMALIZATION TESTS
function normalizePhoneNumber(rawPhone) {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/[^\d+]/g, "").trim();
  if (cleaned.startsWith("00")) cleaned = cleaned.slice(2);
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    cleaned = "2" + cleaned;
  }
  return cleaned;
}

test("normalizePhoneNumber: converts domestic Egyptian mobile numbers to E.164", () => {
  assert.equal(normalizePhoneNumber("01012345678"), "201012345678");
  assert.equal(normalizePhoneNumber("01198765432"), "201198765432");
  assert.equal(normalizePhoneNumber("01234567890"), "201234567890");
  assert.equal(normalizePhoneNumber("01555555555"), "201555555555");
});

test("normalizePhoneNumber: cleans international prefixes, spaces and dashes", () => {
  assert.equal(normalizePhoneNumber("+20 101 234 5678"), "201012345678");
  assert.equal(normalizePhoneNumber("0020-101-234-5678"), "201012345678");
  assert.equal(normalizePhoneNumber("+966 50 123 4567"), "966501234567");
});

test("normalizePhoneNumber: handles empty and malformed input safely", () => {
  assert.equal(normalizePhoneNumber(""), "");
  assert.equal(normalizePhoneNumber(null), "");
  assert.equal(normalizePhoneNumber(undefined), "");
  assert.equal(normalizePhoneNumber("   "), "");
});

// 2. CRYPTOGRAPHIC SIGNED REPORT TOKEN TESTS
const TEST_SIGNING_SECRET = "test_signing_secret_for_parent_reports";

function createSignedReportToken(payload) {
  const data = {
    ...payload,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000,
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const base64Data = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto.createHmac("sha256", TEST_SIGNING_SECRET).update(base64Data).digest("base64url");
  return `${base64Data}.${signature}`;
}

function verifySignedReportToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", TEST_SIGNING_SECRET).update(base64Data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf8"));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

test("createSignedReportToken & verifySignedReportToken: roundtrip succeeds with valid signature", () => {
  const token = createSignedReportToken({ studentId: "usr_student_1", period: "weekly" });
  assert.ok(typeof token === "string");
  assert.ok(token.includes("."));

  const verified = verifySignedReportToken(token);
  assert.ok(verified !== null);
  assert.equal(verified.studentId, "usr_student_1");
  assert.equal(verified.period, "weekly");
});

test("verifySignedReportToken: rejects tampered token immediately", () => {
  const token = createSignedReportToken({ studentId: "usr_student_1", period: "weekly" });
  const [data, sig] = token.split(".");
  // Tamper with data payload
  const tamperedData = Buffer.from(JSON.stringify({ studentId: "usr_student_ATTACKER", period: "weekly" })).toString("base64url");
  const tamperedToken = `${tamperedData}.${sig}`;

  const verified = verifySignedReportToken(tamperedToken);
  assert.equal(verified, null);
});

test("verifySignedReportToken: rejects expired tokens", () => {
  const expiredData = {
    studentId: "usr_student_1",
    period: "monthly",
    exp: Date.now() - 1000, // already expired
  };
  const base64Data = Buffer.from(JSON.stringify(expiredData)).toString("base64url");
  const signature = crypto.createHmac("sha256", TEST_SIGNING_SECRET).update(base64Data).digest("base64url");
  const expiredToken = `${base64Data}.${signature}`;

  const verified = verifySignedReportToken(expiredToken);
  assert.equal(verified, null);
});

// 3. TEMPLATE PLACEHOLDER INTERPOLATION TESTS
function fillTemplatePlaceholders(text, variables) {
  let filled = text;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    filled = filled.replace(regex, String(val ?? ""));
  }
  return filled;
}

test("fillTemplatePlaceholders: correctly replaces all tags", () => {
  const template = "مرحباً ولي أمر {{student_name}}، نود إعلامك بأن النتيجة هي {{score}}/{{total}} ({{percentage}}%).";
  const result = fillTemplatePlaceholders(template, {
    student_name: "عمر محمود",
    score: 48,
    total: 50,
    percentage: 96,
  });

  assert.equal(result, "مرحباً ولي أمر عمر محمود، نود إعلامك بأن النتيجة هي 48/50 (96%).");
});

// 4. TELEGRAM PAIRING CODE GENERATOR TESTS
function generateTelegramPairingCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LINK-${token}`;
}

test("generateTelegramPairingCode: creates 11-char unambiguous code prefixed with LINK-", () => {
  const code = generateTelegramPairingCode();
  assert.match(code, /^LINK-[2-9A-Z]{6}$/);
  assert.equal(code.length, 11);
});
