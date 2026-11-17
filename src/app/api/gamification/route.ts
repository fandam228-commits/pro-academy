import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentGamification, xpTransactions, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

// In-Memory Fallback Store for development, builds, and offline tests
interface MemoryGamification {
  userId: string;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  gradeLevel: string;
}

const globalGamificationStore = globalThis as typeof globalThis & {
  __paGamificationMemoryStore?: Map<string, MemoryGamification>;
  __paXpTransactionsMemoryStore?: Array<{
    id: string;
    userId: string;
    actionType: string;
    xpEarned: number;
    referenceId?: string;
    createdAt: Date;
  }>;
};

if (!globalGamificationStore.__paGamificationMemoryStore) {
  globalGamificationStore.__paGamificationMemoryStore = new Map<string, MemoryGamification>();
}
if (!globalGamificationStore.__paXpTransactionsMemoryStore) {
  globalGamificationStore.__paXpTransactionsMemoryStore = [];
}

const memGamification = globalGamificationStore.__paGamificationMemoryStore;
const memTransactions = globalGamificationStore.__paXpTransactionsMemoryStore;

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const userId = ctx?.user?.id || queryUserId || "usr_student_1";

    const hasDatabase = Boolean(process.env.DATABASE_URL);

    let profile: any = null;

    if (hasDatabase) {
      try {
        const rows = await db
          .select()
          .from(studentGamification)
          .where(eq(studentGamification.userId, userId));

        if (rows.length > 0) {
          profile = rows[0];
        } else {
          // Initialize if not present
          const userRows = await db.select().from(users).where(eq(users.id, userId));
          const u = userRows[0];
          const newProfile = {
            id: `sg_${userId}`,
            userId,
            totalXp: u?.points || 150,
            weeklyXp: 85,
            currentStreak: u?.streak || 1,
            longestStreak: Math.max(u?.streak || 1, 3),
            lastActivityDate: getTodayString(),
            gradeLevel: u?.grade || "Third Secondary (Baccalaureate)",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await db.insert(studentGamification).values(newProfile);
          profile = newProfile;
        }
      } catch (dbErr) {
        profile = getOrCreateMemoryProfile(userId);
      }
    } else {
      profile = getOrCreateMemoryProfile(userId);
    }

    return NextResponse.json({
      success: true,
      profile: {
        userId: profile.userId,
        totalXp: profile.totalXp,
        weeklyXp: profile.weeklyXp,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActivityDate: profile.lastActivityDate,
        gradeLevel: profile.gradeLevel,
      },
    });
  } catch (error: any) {
    console.error("Gamification GET error:", error);
    return NextResponse.json({ error: "Failed to fetch gamification profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { action, actionType, xp, referenceId, bonusXp, userId: bodyUserId } = body;
    const userId = ctx?.user?.id || bodyUserId || "usr_student_1";

    if (!action) {
      return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
    }

    const hasDatabase = Boolean(process.env.DATABASE_URL);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // ACTION: AWARD XP
    if (action === "award_xp") {
      const xpToAward = Math.max(0, parseInt(xp || "10", 10)) + Math.max(0, parseInt(bonusXp || "0", 10));
      const refId = referenceId ? String(referenceId) : undefined;
      const typeStr = actionType || "quiz_correct";

      if (hasDatabase) {
        try {
          // Check anti-farming duplicate if referenceId is provided
          if (refId) {
            const existingTx = await db
              .select()
              .from(xpTransactions)
              .where(
                and(
                  eq(xpTransactions.userId, userId),
                  eq(xpTransactions.actionType, typeStr),
                  eq(xpTransactions.referenceId, refId)
                )
              );
            if (existingTx.length > 0) {
              return NextResponse.json({
                success: true,
                duplicate: true,
                message: "XP already awarded for this activity",
              });
            }
          }

          // Record Transaction
          await db.insert(xpTransactions).values({
            id: `xpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId,
            actionType: typeStr,
            xpEarned: xpToAward,
            referenceId: refId || null,
            createdAt: new Date(),
          });

          // Update Profile & Streak
          const existingProfile = await db
            .select()
            .from(studentGamification)
            .where(eq(studentGamification.userId, userId));

          let newStreak = 1;
          let longest = 1;
          if (existingProfile.length > 0) {
            const p = existingProfile[0];
            const lastDate = p.lastActivityDate;
            if (lastDate === today) {
              newStreak = p.currentStreak;
            } else if (lastDate === yesterday) {
              newStreak = p.currentStreak + 1;
            } else {
              newStreak = 1;
            }
            longest = Math.max(p.longestStreak, newStreak);

            await db
              .update(studentGamification)
              .set({
                totalXp: sql`${studentGamification.totalXp} + ${xpToAward}`,
                weeklyXp: sql`${studentGamification.weeklyXp} + ${xpToAward}`,
                currentStreak: newStreak,
                longestStreak: longest,
                lastActivityDate: today,
                updatedAt: new Date(),
              })
              .where(eq(studentGamification.userId, userId));
          } else {
            await db.insert(studentGamification).values({
              id: `sg_${userId}`,
              userId,
              totalXp: xpToAward,
              weeklyXp: xpToAward,
              currentStreak: 1,
              longestStreak: 1,
              lastActivityDate: today,
              gradeLevel: "Third Secondary (Baccalaureate)",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          return NextResponse.json({
            success: true,
            xpAwarded: xpToAward,
            currentStreak: newStreak,
            actionType: typeStr,
          });
        } catch (dbErr) {
          console.warn("DB award XP failed, using memory fallback:", dbErr);
          return handleMemoryAward(userId, typeStr, xpToAward, refId, today, yesterday);
        }
      } else {
        return handleMemoryAward(userId, typeStr, xpToAward, refId, today, yesterday);
      }
    }

    // ACTION: UPDATE STREAK ONLY
    if (action === "update_streak") {
      if (hasDatabase) {
        try {
          const existingProfile = await db
            .select()
            .from(studentGamification)
            .where(eq(studentGamification.userId, userId));

          if (existingProfile.length > 0) {
            const p = existingProfile[0];
            const lastDate = p.lastActivityDate;
            let newStreak = p.currentStreak;
            if (lastDate === yesterday) {
              newStreak = p.currentStreak + 1;
            } else if (lastDate !== today) {
              newStreak = 1;
            }
            const longest = Math.max(p.longestStreak, newStreak);

            await db
              .update(studentGamification)
              .set({
                currentStreak: newStreak,
                longestStreak: longest,
                lastActivityDate: today,
                updatedAt: new Date(),
              })
              .where(eq(studentGamification.userId, userId));

            return NextResponse.json({ success: true, currentStreak: newStreak, longestStreak: longest });
          }
        } catch (e) {}
      }

      // Memory fallback
      const p = getOrCreateMemoryProfile(userId);
      let newStreak = p.currentStreak;
      if (p.lastActivityDate === yesterday) {
        newStreak = p.currentStreak + 1;
      } else if (p.lastActivityDate !== today) {
        newStreak = 1;
      }
      p.currentStreak = newStreak;
      p.longestStreak = Math.max(p.longestStreak, newStreak);
      p.lastActivityDate = today;

      return NextResponse.json({ success: true, currentStreak: newStreak, longestStreak: p.longestStreak });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Gamification POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// Memory Helpers
function getOrCreateMemoryProfile(userId: string): MemoryGamification {
  let p = memGamification.get(userId);
  if (!p) {
    p = {
      userId,
      totalXp: 480,
      weeklyXp: 160,
      currentStreak: 5,
      longestStreak: 8,
      lastActivityDate: getTodayString(),
      gradeLevel: "Third Secondary (Baccalaureate)",
    };
    memGamification.set(userId, p);
  }
  return p;
}

function handleMemoryAward(
  userId: string,
  actionType: string,
  xp: number,
  refId: string | undefined,
  today: string,
  yesterday: string
) {
  if (refId) {
    const exists = memTransactions.some(
      (t) => t.userId === userId && t.actionType === actionType && t.referenceId === refId
    );
    if (exists) {
      return NextResponse.json({ success: true, duplicate: true });
    }
  }

  memTransactions.push({
    id: `xpt_mem_${Date.now()}`,
    userId,
    actionType,
    xpEarned: xp,
    referenceId: refId,
    createdAt: new Date(),
  });

  const p = getOrCreateMemoryProfile(userId);
  p.totalXp += xp;
  p.weeklyXp += xp;

  if (p.lastActivityDate === yesterday) {
    p.currentStreak += 1;
  } else if (p.lastActivityDate !== today) {
    p.currentStreak = 1;
  }
  p.longestStreak = Math.max(p.longestStreak, p.currentStreak);
  p.lastActivityDate = today;

  return NextResponse.json({
    success: true,
    xpAwarded: xp,
    currentStreak: p.currentStreak,
    actionType,
  });
}
