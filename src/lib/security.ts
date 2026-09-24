import crypto from "crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

// ===================== PASSWORD HASHING (scrypt + random salt) =====================

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Supports both new hashed format ("salt:hash") and legacy plaintext (auto-upgrade path)
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  if (stored.includes(":")) {
    const [salt, storedHash] = stored.split(":");
    const computed = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, "hex");
    if (computed.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computed, storedBuf);
  }
  // Legacy plaintext comparison (will be upgraded to hash on successful login)
  return crypto.timingSafeEqual(
    Buffer.from(password.padEnd(64).slice(0, 64)),
    Buffer.from(stored.padEnd(64).slice(0, 64))
  );
}

export function isLegacyPlaintext(stored: string): boolean {
  return !stored.includes(":");
}

// ===================== SESSION TOKENS =====================

export function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string, role: string, userAgent?: string) {
  const token = generateToken();
  const id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Periodic cleanup of expired sessions
  try {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  } catch {}

  await db.insert(sessions).values({
    id,
    token,
    userId,
    role,
    userAgent: (userAgent || "").slice(0, 200),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });

  return { token, expiresAt: new Date(Date.now() + SESSION_TTL_MS) };
}

export async function destroySession(token: string) {
  try {
    await db.delete(sessions).where(eq(sessions.token, token));
  } catch {}
}

const SESSION_COOKIE = "pa_session";

export function extractToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookie(token: string, expiresAt: Date): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))}${secure}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export interface AuthContext {
  user: any;
  session: any;
}

export async function getAuthContext(req: Request): Promise<AuthContext | null> {
  const token = extractToken(req);
  if (!token) return null;

  const found = await db.select().from(sessions).where(eq(sessions.token, token));
  if (found.length === 0) return null;

  const session = found[0];
  if (new Date(session.expiresAt) < new Date()) {
    await destroySession(token);
    return null;
  }

  const userRows = await db.select().from(users).where(eq(users.id, session.userId));
  if (userRows.length === 0) return null;

  return { user: userRows[0], session };
}

// Returns { user, denied } — if denied is non-null, route must return it immediately.
export async function requireRoles(
  req: Request,
  roles?: string[]
): Promise<{ user: any | null; denied: NextResponse | null }> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return {
      user: null,
      denied: NextResponse.json({ error: "Unauthorized. A valid login session is required." }, { status: 401 }),
    };
  }
  if (roles && roles.length > 0 && !roles.includes(ctx.user.role)) {
    return {
      user: null,
      denied: NextResponse.json({ error: "Forbidden. You do not have permission for this action." }, { status: 403 }),
    };
  }
  return { user: ctx.user, denied: null };
}

// ===================== LOGIN BRUTE-FORCE PROTECTION =====================

interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

export function checkLoginLock(email: string): number {
  const rec = loginAttempts.get(email.toLowerCase());
  if (!rec) return 0;
  if (rec.lockedUntil > Date.now()) {
    return Math.ceil((rec.lockedUntil - Date.now()) / 60000); // minutes remaining
  }
  return 0;
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase();
  const rec = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS;
    rec.count = 0;
  }
  loginAttempts.set(key, rec);
}

export function clearFailedLogins(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}
