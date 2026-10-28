import { db } from "@/db";
import { users, affiliates, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import {
  hashPassword,
  verifyPassword,
  isLegacyPlaintext,
  createSession,
  destroySession,
  extractToken,
  getAuthContext,
  sessionCookie,
  clearSessionCookie,
  checkLoginLock,
  recordFailedLogin,
  clearFailedLogins,
} from "@/lib/security";
import { isWithinLoginInputLimits, isWithinRegistrationInputLimits } from "@/lib/auth-input-limits.mjs";

function sanitizeUser(u: any) {
  if (!u) return u;
  const { password, ...rest } = u;
  return rest;
}

async function performLogin(loginId: string, password: string, userAgent?: string) {
  // Admin username alias: habibadmin -> the seeded admin account. Other users continue to use email.
  const normalizedLogin = loginId.trim().toLowerCase();
  const lockKey = normalizedLogin === "habibadmin" ? "habibadmin" : normalizedLogin;
  const lockMinutes = checkLoginLock(lockKey);
  if (lockMinutes > 0) {
    return {
      errorResponse: NextResponse.json(
        { error: `Account temporarily locked due to repeated failed attempts. Try again in ${lockMinutes} minute(s).` },
        { status: 429 }
      ),
    };
  }

  let foundUsers = await db.select().from(users).where(eq(users.email, normalizedLogin));
  if (foundUsers.length === 0) {
    foundUsers = await db.select().from(users).where(eq(users.username, normalizedLogin));
  }
  if (foundUsers.length === 0 && normalizedLogin === "habibadmin") {
    foundUsers = await db.select().from(users).where(eq(users.email, "habib.admin@proacademy.com"));
  }
  if (foundUsers.length === 0) {
    recordFailedLogin(lockKey);
    return {
      errorResponse: NextResponse.json({ error: "No account found with this username or email." }, { status: 400 }),
    };
  }

  const user = foundUsers[0];
  const valid = verifyPassword(password, user.password);
  if (!valid) {
    recordFailedLogin(lockKey);
    return {
      errorResponse: NextResponse.json({ error: "Invalid password. Please try again." }, { status: 400 }),
    };
  }

  // Upgrade legacy plaintext passwords to salted hashes transparently
  if (isLegacyPlaintext(user.password)) {
    await db.update(users).set({ password: hashPassword(password) }).where(eq(users.id, user.id));
  }

  clearFailedLogins(lockKey);
  const { token, expiresAt } = await createSession(user.id, user.role, userAgent);
  return { user: sanitizeUser(user), token, expiresAt };
}

export async function GET(req: Request) {
  await ensureDbSetup();
  try {
    const ctx = await getAuthContext(req);
    if (!ctx) {
      return NextResponse.json({ error: "Session expired or not logged in." }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: sanitizeUser(ctx.user) });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Session check failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON request body." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    const { email, username, password, name, role, stage, grade, phone, parentPhone } = body;
    const rawAction = typeof body?.action === "string" ? body.action.trim().toLowerCase() : "";
    // Accept common sign-in aliases and older clients that send credentials without an action.
    const action = ["login", "signin", "sign_in", "sign-in", "authenticate"].includes(rawAction)
      ? "login"
      : rawAction || ((!rawAction && (email || username) && password) ? "login" : "");
    const userAgent = req.headers.get("user-agent") || "";

    // ============ LOGIN ============
    if (action === "login") {
      const loginId = username || email;
      if (!loginId || !password) {
        return NextResponse.json({ error: "Username/email and password are required." }, { status: 400 });
      }
      if (!isWithinLoginInputLimits(loginId, password)) {
        return NextResponse.json({ error: "Username/email or password is invalid or exceeds the allowed length." }, { status: 400 });
      }
      const result = await performLogin(loginId, password, userAgent);
      if (result.errorResponse) return result.errorResponse;
      const response = NextResponse.json({ success: true, user: result.user, expiresAt: result.expiresAt });
      response.headers.set("Set-Cookie", sessionCookie(result.token, result.expiresAt));
      return response;
    }

    // ============ REGISTER ============
    if (action === "register") {
      if (!name || !email || !password) {
        return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
      }
      if (!isWithinRegistrationInputLimits({ name, email, password, stage, grade, phone, parentPhone, referralCode: body.referralCode })) {
        return NextResponse.json({ error: "Registration fields are invalid or exceed the allowed length." }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
      }
      if (!["student", "parent"].includes(role)) {
        return NextResponse.json({ error: "You can only register as a Student or Parent account." }, { status: 400 });
      }

      const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
      if (existing.length > 0) {
        return NextResponse.json({ error: "This email is already registered. Please log in instead." }, { status: 400 });
      }

      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newUser = {
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        password: hashPassword(password), // hashed with scrypt + random salt
        role: role || "student",
        stage: stage || "Secondary",
        grade: grade || "Third Secondary (Baccalaureate)",
        phone: phone || "",
        parentPhone: parentPhone || "",
        streak: 1,
        points: 100,
        level: "Intermediate",
        preferredLang: "ar",
      };

      await db.insert(users).values(newUser);

      // Handle referral code if provided
      const referralCode = body.referralCode?.trim();
      if (referralCode) {
        const affRows = await db.select().from(affiliates).where(eq(affiliates.code, referralCode));
        if (affRows.length > 0) {
          const aff = affRows[0];
          // Credit referrer: +50 EGP earnings + increment count
          await db
            .update(affiliates)
            .set({
              totalReferrals: (aff.totalReferrals || 0) + 1,
              earnings: String(parseFloat(aff.earnings || "0") + 50),
            })
            .where(eq(affiliates.id, aff.id));

          // Grant the new user bonus 25 points
          await db
            .update(users)
            .set({ points: 125 })
            .where(eq(users.id, newUserId));

          // Notify referrer
          await db.insert(notifications).values({
            id: `notif_ref_${Date.now()}`,
            userId: aff.userId,
            title: "🎁 إحالة ناجحة!",
            message: `${name} انضم باستخدام كودك! حصلت على 50 جنيه رصيد مكافأة.`,
            type: "payment",
          });

          // Notify new user
          await db.insert(notifications).values({
            id: `notif_ref_w_${Date.now()}`,
            userId: newUserId,
            title: "🎉 مرحباً بك! حصلت على مكافأة إحالة",
            message: "تم منحك 25 نقطة إضافية لأنك انضممت بكود دعوة صديق!",
            type: "info",
          });
        }
      }

      const { token, expiresAt } = await createSession(newUserId, newUser.role, userAgent);

      const response = NextResponse.json({ success: true, user: sanitizeUser(newUser), expiresAt });
      response.headers.set("Set-Cookie", sessionCookie(token, expiresAt));
      return response;
    }

    // ============ LOGOUT ============
    if (action === "logout") {
      const token = extractToken(req);
      if (token) {
        await destroySession(token);
      }
      const response = NextResponse.json({ success: true });
      response.headers.set("Set-Cookie", clearSessionCookie());
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
