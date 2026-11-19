import { NextResponse } from "next/server";
import { db } from "@/db";
import { userVocabProgress } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { awardXP } from "@/lib/gamification-service";
import { calculateSM2, mapActionToRating, SM2Rating } from "@/lib/sm2-spaced-repetition";
import { eq, and } from "drizzle-orm";

// Memory fallback store for review history
interface MemoryReviewProgress {
  userId: string;
  cardId: string;
  masteryLevel: number;
  repetitionCount: number;
  easinessFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  updatedAt: string;
}

const globalReviewStore = globalThis as typeof globalThis & {
  __paVocabProgressMemoryStore?: Map<string, MemoryReviewProgress>;
};

if (!globalReviewStore.__paVocabProgressMemoryStore) {
  globalReviewStore.__paVocabProgressMemoryStore = new Map<string, MemoryReviewProgress>();
}
const memVocabProgress = globalReviewStore.__paVocabProgressMemoryStore;

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const { cardId, action, quality, userId } = body;
    const effectiveUserId = userId || ctx?.user?.id || "guest_student";

    if (!cardId || (!action && quality === undefined)) {
      return NextResponse.json({ error: "cardId and action or quality are required" }, { status: 400 });
    }

    // Determine SM-2 Rating (1 to 5)
    let rating: SM2Rating = 4;
    if (quality !== undefined && quality >= 1 && quality <= 5) {
      rating = quality as SM2Rating;
    } else if (action) {
      rating = mapActionToRating(action);
    }

    // Retrieve previous state if available
    const storeKey = `${effectiveUserId}_${cardId}`;
    let previousState = {
      repetitionCount: 0,
      easinessFactor: 2.5,
      intervalDays: 0,
    };

    if (memVocabProgress.has(storeKey)) {
      const prev = memVocabProgress.get(storeKey)!;
      previousState = {
        repetitionCount: prev.repetitionCount,
        easinessFactor: prev.easinessFactor,
        intervalDays: prev.intervalDays,
      };
    } else if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select()
          .from(userVocabProgress)
          .where(
            and(
              eq(userVocabProgress.userId, effectiveUserId),
              eq(userVocabProgress.cardId, cardId)
            )
          );

        if (rows.length > 0) {
          const row = rows[0];
          previousState = {
            repetitionCount: row.masteryLevel >= 3 ? 2 : row.masteryLevel,
            easinessFactor: 2.5,
            intervalDays: row.masteryLevel >= 3 ? 7 : 1,
          };
        }
      } catch (e) {
        console.warn("DB userVocabProgress select error:", e);
      }
    }

    // Calculate SM-2 intervals and next review date
    const sm2 = calculateSM2(previousState, rating);

    // Save in memory store
    memVocabProgress.set(storeKey, {
      userId: effectiveUserId,
      cardId,
      masteryLevel: sm2.masteryLevel,
      repetitionCount: sm2.repetitionCount,
      easinessFactor: sm2.easinessFactor,
      intervalDays: sm2.intervalDays,
      nextReviewAt: sm2.nextReviewAt.toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Save in database if available
    if (process.env.DATABASE_URL) {
      try {
        const recordId = `uvp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db
          .insert(userVocabProgress)
          .values({
            id: recordId,
            userId: effectiveUserId,
            cardId,
            masteryLevel: sm2.masteryLevel,
            nextReviewAt: sm2.nextReviewAt,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [userVocabProgress.userId, userVocabProgress.cardId],
            set: {
              masteryLevel: sm2.masteryLevel,
              nextReviewAt: sm2.nextReviewAt,
              updatedAt: new Date(),
            },
          });
      } catch (err) {
        console.warn("DB userVocabProgress upsert error:", err);
      }
    }

    // Award XP if mastered
    let xpAwarded = 0;
    if (sm2.xpAwarded > 0 && effectiveUserId) {
      try {
        await awardXP({
          userId: effectiveUserId,
          actionType: "flashcard_mastered",
          referenceId: `flashcard_${cardId}`,
          customXp: sm2.xpAwarded,
        });
        xpAwarded = sm2.xpAwarded;
      } catch (e) {
        console.warn("Could not award flashcard XP:", e);
      }
    }

    return NextResponse.json({
      success: true,
      cardId,
      action: sm2.actionKey,
      rating,
      masteryLevel: sm2.masteryLevel,
      intervalDays: sm2.intervalDays,
      repetitionCount: sm2.repetitionCount,
      easinessFactor: sm2.easinessFactor,
      nextReviewAt: sm2.nextReviewAt.toISOString(),
      xpAwarded,
      message: sm2.messageAr,
    });
  } catch (err: any) {
    console.error("POST /api/flashcards/review error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
