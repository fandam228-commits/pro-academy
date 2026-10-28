import { timingSafeEqual } from "node:crypto";

const SCRYPT_HASH_PATTERN = /^[a-f0-9]{32}:[a-f0-9]{128}$/i;

/** Recognize only the exact salt:hash shape emitted by hashPassword. */
export function isScryptPasswordHash(stored) {
  return typeof stored === "string" && SCRYPT_HASH_PATTERN.test(stored);
}

/**
 * Compare legacy plaintext credentials without truncation or padding.
 * Length mismatch is rejected before timingSafeEqual, which requires equal-length buffers.
 */
export function legacyPasswordMatches(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const provided = Buffer.from(password, "utf8");
  const expected = Buffer.from(stored, "utf8");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
