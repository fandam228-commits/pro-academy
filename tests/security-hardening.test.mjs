import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  hashPassword,
  verifyPassword,
  isLegacyPlaintext,
  checkLoginLock,
  recordFailedLogin,
  clearFailedLogins,
  extractTokenFromHeaders,
} from "../src/lib/security-core.mjs";

test("Security: AuthScreen has zero demo credentials or 1-Click Fill shortcuts", () => {
  const authScreenPath = path.resolve(process.cwd(), "src/components/AuthScreen.tsx");
  const content = fs.readFileSync(authScreenPath, "utf-8");

  assert.equal(
    content.includes("1-Click Fill"),
    false,
    "AuthScreen must not contain '1-Click Fill'"
  );
  assert.equal(
    content.includes("habibadmin"),
    false,
    "AuthScreen must not expose hardcoded 'habibadmin' in placeholders or buttons"
  );
  assert.equal(
    content.includes("sarah.teacher"),
    false,
    "AuthScreen must not expose demo teacher account 'sarah.teacher'"
  );
  assert.equal(
    content.includes("omar.student"),
    false,
    "AuthScreen must not expose demo student account 'omar.student'"
  );
});

test("Security: Password hashing uses salted scrypt and verifies correctly", () => {
  const plain = "StrongPassword@2027#";
  const hashed = hashPassword(plain);

  assert.notEqual(hashed, plain, "Password must not be stored in plaintext");
  assert.equal(isLegacyPlaintext(hashed), false, "Password must not be flagged as legacy plaintext");
  assert.equal(verifyPassword(plain, hashed), true, "Password must verify correctly against hash");
  assert.equal(verifyPassword("WrongPassword", hashed), false, "Wrong password must fail verification");
});

test("Security: Brute-force protection locks key after 5 consecutive failed attempts", () => {
  const testKey = `test_attacker_${Date.now()}`;
  clearFailedLogins(testKey);

  assert.equal(checkLoginLock(testKey), 0, "Initial state should not be locked");

  // Record 4 failed attempts
  for (let i = 0; i < 4; i++) {
    recordFailedLogin(testKey);
    assert.equal(checkLoginLock(testKey), 0, `Attempt ${i + 1} should not lock yet`);
  }

  // 5th failed attempt locks for 10 minutes
  recordFailedLogin(testKey);
  const lockMinutes = checkLoginLock(testKey);
  assert.equal(lockMinutes > 0, true, "5th failed attempt must trigger lock");
  assert.equal(lockMinutes <= 10, true, "Lock duration should be at most 10 minutes");

  // Clear resets lock
  clearFailedLogins(testKey);
  assert.equal(checkLoginLock(testKey), 0, "clearFailedLogins must immediately clear lock");
});

test("Security: Token extraction handles Authorization header and Cookie correctly", () => {
  assert.equal(
    extractTokenFromHeaders("Bearer token_abc_123", ""),
    "token_abc_123",
    "Should extract bearer token"
  );
  assert.equal(
    extractTokenFromHeaders("", "pa_session=token_xyz_456; other=val"),
    "token_xyz_456",
    "Should extract pa_session from cookies"
  );
  assert.equal(
    extractTokenFromHeaders("", "random_cookie=val"),
    null,
    "Should return null if no token is present"
  );
});
