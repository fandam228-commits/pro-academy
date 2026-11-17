import { NextResponse } from "next/server";
import { db } from "@/db";
import { vocabCards, userVocabProgress } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { SEED_VOCAB_CARDS } from "@/data/pro-suite-seeds";
import { eq, and, lte, or, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("grade_level") || "3rd_sec";
    const unitName = searchParams.get("unit_name");
    const targetUserId = searchParams.get("user_id") || ctx?.user?.id || "guest_student";

    let cards: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const queryConditions: any[] = [];
        if (gradeLevel && gradeLevel !== "all") {
          queryConditions.push(eq(vocabCards.gradeLevel, gradeLevel));
        }
        if (unitName && unitName !== "all") {
          queryConditions.push(eq(vocabCards.unitName, unitName));
        }

        const rows = await db
          .select({
            id: vocabCards.id,
            gradeLevel: vocabCards.gradeLevel,
            unitName: vocabCards.unitName,
            word: vocabCards.word,
            partOfSpeech: vocabCards.partOfSpeech,
            meaningAr: vocabCards.meaningAr,
            exampleEn: vocabCards.exampleEn,
            synonyms: vocabCards.synonyms,
            masteryLevel: userVocabProgress.masteryLevel,
            nextReviewAt: userVocabProgress.nextReviewAt,
          })
          .from(vocabCards)
          .leftJoin(
            userVocabProgress,
            and(
              eq(userVocabProgress.cardId, vocabCards.id),
              eq(userVocabProgress.userId, targetUserId)
            )
          )
          .where(queryConditions.length > 0 ? and(...queryConditions) : undefined);

        if (rows && rows.length > 0) {
          cards = rows;
        }
      } catch (e) {
        console.warn("DB vocabCards query error:", e);
      }
    }

    if (cards.length === 0) {
      cards = SEED_VOCAB_CARDS.filter(
        (c) =>
          (gradeLevel === "all" || c.gradeLevel === gradeLevel) &&
          (!unitName || unitName === "all" || c.unitName === unitName)
      ).map((c) => ({
        ...c,
        masteryLevel: 0,
        nextReviewAt: new Date().toISOString(),
      }));
    }

    // Filter due cards: nextReviewAt <= now or not yet reviewed
    const now = new Date();
    const dueCards = cards.filter((c) => {
      if (!c.nextReviewAt) return true;
      return new Date(c.nextReviewAt) <= now;
    });

    return NextResponse.json({
      success: true,
      totalInDeck: cards.length,
      dueCount: dueCards.length,
      cards: dueCards.length > 0 ? dueCards : cards, // If all up to date, provide deck for refresher
    });
  } catch (err: any) {
    console.error("GET /api/flashcards/deck error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
