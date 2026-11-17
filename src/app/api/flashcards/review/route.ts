import { NextResponse } from "next/server";
import { db } from "@/db";
import { userVocabProgress } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { awardXP } from "@/lib/gamification-service";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const { cardId, action, userId } = body;
    const effectiveUserId = userId || ctx?.user?.id || "guest_student";

    if (!cardId || !action) {
      return NextResponse.json({ error: "cardId and action are required" }, { status: 400 });
    }

    const now = new Date();
    let nextReviewAt = new Date();
    let masteryLevel = 1;
    let xpAwarded = 0;

    if (action === "hard") {
      // 10 minutes
      nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);
      masteryLevel = 1;
    } else if (action === "good") {
      // 2 days
      nextReviewAt.setDate(nextReviewAt.getDate() + 2);
      masteryLevel = 2;
    } else if (action === "mastered") {
      // 7 days and award +5 XP
      nextReviewAt.setDate(nextReviewAt.getDate() + 7);
      masteryLevel = 3;

      if (effectiveUserId) {
        try {
          await awardXP({
            userId: effectiveUserId,
            actionType: "flashcard_mastered",
            referenceId: `flashcard_${cardId}`,
            customXp: 5,
          });
          xpAwarded = 5;
        } catch (e) {
          console.warn("Could not award flashcard XP:", e);
        }
      }
    }

    if (process.env.DATABASE_URL) {
      try {
        const recordId = `uvp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db
          .insert(userVocabProgress)
          .values({
            id: recordId,
            userId: effectiveUserId,
            cardId: cardId,
            masteryLevel,
            nextReviewAt,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [userVocabProgress.userId, userVocabProgress.cardId],
            set: {
              masteryLevel,
              nextReviewAt,
              updatedAt: now,
            },
          });
      } catch (err) {
        console.warn("DB userVocabProgress upsert error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      cardId,
      action,
      masteryLevel,
      nextReviewAt: nextReviewAt.toISOString(),
      xpAwarded,
      message:
        action === "mastered"
          ? "رائع! أتقنت الكلمة بالكامل وربحت +5 XP 🎉"
          : action === "good"
          ? "ممتاز! تمت جدولة المراجعة بعد يومين 📚"
          : "لا بأس! سنكرر الكلمة قريباً لتثبيتها في الذاكرة 🔄",
    });
  } catch (err: any) {
    console.error("POST /api/flashcards/review error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
