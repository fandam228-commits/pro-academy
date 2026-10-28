import { timingSafeEqual } from "node:crypto";

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
