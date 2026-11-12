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

export interface FallbackUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: "admin" | "teacher" | "student" | "parent";
  avatar?: string;
  phone?: string;
  parentPhone?: string;
  stage?: string;
  grade?: string;
  streak: number;
  points: number;
  level: string;
  preferredLang: string;
}

export const PREVIEW_FALLBACK_USERS: Record<string, FallbackUser> = {
  habibadmin: {
    id: "usr_admin_habib",
    name: "Mr. Habib El Rahman",
    email: "habib.admin@proacademy.com",
    username: "habibadmin",
    password: hashPassword("admin123password"),
    role: "admin",
    avatar: "/habib-hero.gif",
    phone: "01000000000",
    parentPhone: "",
    stage: "Secondary",
    grade: "Third Secondary (Baccalaureate)",
    streak: 15,
    points: 1500,
    level: "Expert",
    preferredLang: "ar",
  },
  "habib.admin@proacademy.com": {
    id: "usr_admin_habib",
    name: "Mr. Habib El Rahman",
    email: "habib.admin@proacademy.com",
    username: "habibadmin",
    password: hashPassword("admin123password"),
    role: "admin",
    avatar: "/habib-hero.gif",
    phone: "01000000000",
    parentPhone: "",
    stage: "Secondary",
    grade: "Third Secondary (Baccalaureate)",
    streak: 15,
    points: 1500,
    level: "Expert",
    preferredLang: "ar",
  },
  "sarah.teacher@proacademy.com": {
    id: "usr_teacher_sarah",
    name: "Ms. Sarah Ahmed (Grammar Specialist)",
    email: "sarah.teacher@proacademy.com",
    username: "sarah.teacher",
    password: hashPassword("teacher123password"),
    role: "teacher",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "01100000000",
    parentPhone: "",
    stage: "Secondary",
    grade: "Third Secondary (Baccalaureate)",
    streak: 10,
    points: 950,
    level: "Advanced",
    preferredLang: "ar",
  },
  "omar.student@gmail.com": {
    id: "usr_student_omar",
    name: "Omar Mahmoud Al-Sayed",
    email: "omar.student@gmail.com",
    username: "omar.student",
    password: hashPassword("student123password"),
    role: "student",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    phone: "01200000000",
    parentPhone: "01000000001",
    stage: "Secondary",
    grade: "Third Secondary (Baccalaureate)",
    streak: 5,
    points: 420,
    level: "Intermediate",
    preferredLang: "ar",
  },
  "student@proacademy.com": {
    id: "usr_student_demo",
    name: "طالب تجريبي (Demo Student)",
    email: "student@proacademy.com",
    username: "student",
    password: hashPassword("12345678"),
    role: "student",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    phone: "01200000000",
    parentPhone: "",
    stage: "Secondary",
    grade: "Third Secondary (Baccalaureate)",
    streak: 3,
    points: 250,
    level: "Beginner",
    preferredLang: "ar",
  },
};

const globalAuth = globalThis as typeof globalThis & {
  __paMemorySessions?: Map<string, { id: string; token: string; userId: string; role: string; userAgent: string; expiresAt: Date }>;
  __paDynamicUsers?: Map<string, FallbackUser>;
};

if (!globalAuth.__paMemorySessions) {
  globalAuth.__paMemorySessions = new Map();
}
if (!globalAuth.__paDynamicUsers) {
  globalAuth.__paDynamicUsers = new Map();
}

export function findFallbackUser(identifier: string): FallbackUser | null {
  const norm = identifier.trim().toLowerCase();
  if (PREVIEW_FALLBACK_USERS[norm]) return PREVIEW_FALLBACK_USERS[norm];
  if (globalAuth.__paDynamicUsers?.has(norm)) return globalAuth.__paDynamicUsers.get(norm)!;
  for (const u of Object.values(PREVIEW_FALLBACK_USERS)) {
    if (u.email.toLowerCase() === norm || u.username?.toLowerCase() === norm || u.id === norm) return u;
  }
  if (globalAuth.__paDynamicUsers) {
    for (const u of globalAuth.__paDynamicUsers.values()) {
      if (u.email.toLowerCase() === norm || u.username?.toLowerCase() === norm || u.id === norm) return u;
    }
  }
  return null;
}

export function saveFallbackUser(user: FallbackUser): void {
  globalAuth.__paDynamicUsers?.set(user.email.toLowerCase(), user);
  if (user.username) {
    globalAuth.__paDynamicUsers?.set(user.username.toLowerCase(), user);
  }
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string, role: string, userAgent?: string) {
  const token = generateToken();
  const id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  // Always register in memory session cache (for immediate lookup & preview resilience)
  globalAuth.__paMemorySessions?.set(token, {
    id,
    token,
    userId,
    role,
    userAgent: (userAgent || "").slice(0, 200),
    expiresAt,
  });

  if (process.env.DATABASE_URL) {
    try {
      await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
      if (role === "student") {
        await db.delete(sessions).where(eq(sessions.userId, userId));
      }
      await db.insert(sessions).values({
        id,
        token,
        userId,
        role,
        userAgent: (userAgent || "").slice(0, 200),
        expiresAt,
      });
    } catch (e) {
      console.warn("Session DB write fallback to memory session:", e);
    }
  }

  return { token, expiresAt };
}

export async function destroySession(token: string) {
  globalAuth.__paMemorySessions?.delete(token);
  if (process.env.DATABASE_URL) {
    try {
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch {}
  }
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

  // 1. Fast path: check memory sessions first
  const memSession = globalAuth.__paMemorySessions?.get(token);
  if (memSession) {
    if (new Date(memSession.expiresAt) < new Date()) {
      globalAuth.__paMemorySessions?.delete(token);
      return null;
    }
    const fallbackUser = findFallbackUser(memSession.userId);
    if (fallbackUser) {
      return { user: fallbackUser, session: memSession };
    }
  }

  // 2. Persistent path: check DB if configured
  if (process.env.DATABASE_URL) {
    try {
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
    } catch (e) {
      console.warn("getAuthContext DB fallback:", e);
      return null;
    }
  }

  return null;
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
