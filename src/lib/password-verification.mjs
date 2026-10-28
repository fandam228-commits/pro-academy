import { scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_HASH_PATTERN = /^([a-f0-9]{32}):([a-f0-9]{128})$/;

export function isScryptPasswordHash(stored) {
  return typeof stored === "string" && SCRYPT_HASH_PATTERN.test(stored);
}

/**
 * Verify both current scrypt hashes and legacy plaintext records.
 * Legacy comparisons must be exact: truncating both values to a fixed length
 * would allow any password sharing the first 64 characters to authenticate.
 */
export function verifyStoredPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string" || stored.length === 0) {
    return false;
  }

  const hashMatch = SCRYPT_HASH_PATTERN.exec(stored);
  if (hashMatch) {
    const [, salt, storedHash] = hashMatch;
    const computed = scryptSync(password, salt, 64);
    const expected = Buffer.from(storedHash, "hex");
    return timingSafeEqual(computed, expected);
  }

  const suppliedBytes = Buffer.from(password, "utf8");
  const storedBytes = Buffer.from(stored, "utf8");
  if (suppliedBytes.length !== storedBytes.length) return false;
  return timingSafeEqual(suppliedBytes, storedBytes);
}

export function isLegacyPlaintextPassword(stored) {
  return typeof stored === "string" && stored.length > 0 && !isScryptPasswordHash(stored);
}
