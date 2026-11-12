import crypto from "crypto";

// ===================== PASSWORD HASHING (scrypt + random salt) =====================

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.includes(":")) {
    const [salt, storedHash] = stored.split(":");
    const computed = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, "hex");
    if (computed.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computed, storedBuf);
  }
  return crypto.timingSafeEqual(
    Buffer.from(password.padEnd(64).slice(0, 64)),
    Buffer.from(stored.padEnd(64).slice(0, 64))
  );
}

export function isLegacyPlaintext(stored) {
  return !stored || !stored.includes(":");
}

// ===================== LOGIN BRUTE-FORCE PROTECTION =====================

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

export function checkLoginLock(email) {
  const rec = loginAttempts.get(email.toLowerCase());
  if (!rec) return 0;
  if (rec.lockedUntil > Date.now()) {
    return Math.ceil((rec.lockedUntil - Date.now()) / 60000);
  }
  return 0;
}

export function recordFailedLogin(email) {
  const key = email.toLowerCase();
  const rec = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS;
    rec.count = 0;
  }
  loginAttempts.set(key, rec);
}

export function clearFailedLogins(email) {
  loginAttempts.delete(email.toLowerCase());
}

// ===================== TOKENS & COOKIES =====================

export const SESSION_COOKIE = "pa_session";

export function extractTokenFromHeaders(authHeader, cookieHeader) {
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
  return null;
}
