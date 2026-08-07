import { db } from "@/db";
import { users, affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    // LEADERBOARD: top learners by points (sanitized — no emails/passwords)
    const allUsers = await db.select().from(users);
    const leaderboard = allUsers
      .filter((u) => u.role === "student")
      .map((u) => ({
        id: u.id,
        name: u.name,
        grade: u.grade,
        points: u.points || 0,
        streak: u.streak || 0,
        level: u.level || "Intermediate",
      }))
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 20)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    // AFFILIATE DATA for the requesting user
    let affiliate = null;
    if (userId) {
      const rows = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
      if (rows.length > 0) {
        affiliate = rows[0];
      } else {
        // Generate a personalized referral code on the fly
        const me = allUsers.find((u) => u.id === userId);
        const base = (me?.name || "STUDENT").replace(/[^A-Za-z]/g, "").substring(0, 6).toUpperCase() || "STUDENT";
        affiliate = {
          id: `aff_fallback_${userId}`,
          userId,
          code: `${base}${new Date().getFullYear()}`,
          totalReferrals: 0,
          earnings: "0.00",
        };
      }
    }

    return NextResponse.json({ leaderboard, affiliate });
  } catch (error) {
    console.error("Extras GET error:", error);
    return NextResponse.json({ error: "Failed to load gamification data" }, { status: 500 });
  }
}
