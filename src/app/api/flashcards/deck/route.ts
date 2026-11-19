import { NextResponse } from "next/server";
import { db } from "@/db";
import { vocabCards, userVocabProgress } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { MASTER_FLASHCARDS_CATALOG, UnifiedFlashcard } from "@/data/flashcards-master-catalog.ts";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);

    // Normalize grade param: '3rd_sec' -> 'sec_3', 'sec_1', 'sec_2', etc.
    let gradeLevel = searchParams.get("grade_level") || "all";
    if (gradeLevel === "3rd_sec") gradeLevel = "sec_3";
    if (gradeLevel === "2nd_sec") gradeLevel = "sec_2";
    if (gradeLevel === "1st_sec") gradeLevel = "sec_1";

    const unitName = searchParams.get("unit_name");
    const category = searchParams.get("category") || "all"; // 'core', 'synonyms', 'prepositions', 'all'
    const filterMode = searchParams.get("filter_mode") || "all_cards"; // 'due_only' | 'all_cards'
    const targetUserId = searchParams.get("user_id") || ctx?.user?.id || "guest_student";

    // 1. Fetch DB User Progress Map if DB is connected
    const userProgressMap = new Map<string, { masteryLevel: number; nextReviewAt: string }>();

    if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select({
            cardId: userVocabProgress.cardId,
            masteryLevel: userVocabProgress.masteryLevel,
            nextReviewAt: userVocabProgress.nextReviewAt,
          })
          .from(userVocabProgress)
          .where(eq(userVocabProgress.userId, targetUserId));

        rows.forEach((r) => {
          userProgressMap.set(r.cardId, {
            masteryLevel: r.masteryLevel,
            nextReviewAt: r.nextReviewAt ? r.nextReviewAt.toISOString() : new Date().toISOString(),
          });
        });
      } catch (e) {
        console.warn("DB userVocabProgress fetch error in deck:", e);
      }
    }

    // 2. Filter Master Catalog
    let pool = MASTER_FLASHCARDS_CATALOG;

    if (gradeLevel && gradeLevel !== "all") {
      pool = pool.filter((c) => c.gradeLevel === gradeLevel || c.gradeLevel === "all");
    }

    if (category && category !== "all") {
      pool = pool.filter((c) => c.category === category);
    }

    if (unitName && unitName !== "all") {
      pool = pool.filter((c) => c.unitName.toLowerCase().includes(unitName.toLowerCase()));
    }

    const now = new Date();

    // 3. Enrich Cards with User Progress & Due Status
    const enrichedCards = pool.map((c) => {
      const progress = userProgressMap.get(c.id);
      const masteryLevel = progress ? progress.masteryLevel : 0;
      const nextReviewAt = progress ? progress.nextReviewAt : null;
      const isDue = !nextReviewAt || new Date(nextReviewAt) <= now;

      return {
        id: c.id,
        word: c.word,
        gradeLevel: c.gradeLevel,
        gradeLabelAr: c.gradeLabelAr,
        unitName: c.unitName,
        partOfSpeech: c.partOfSpeech,
        meaningAr: c.meaningAr,
        definitionEn: c.definitionEn,
        exampleEn: c.exampleEn,
        synonyms: c.synonyms,
        antonyms: c.antonyms,
        collocations: c.collocations,
        category: c.category,
        masteryLevel,
        nextReviewAt,
        isDue,
      };
    });

    const dueCards = enrichedCards.filter((c) => c.isDue);
    const masteredCount = enrichedCards.filter((c) => c.masteryLevel >= 3).length;

    // Return due cards if requested, else all cards
    const finalCards = filterMode === "due_only" && dueCards.length > 0 ? dueCards : enrichedCards;

    return NextResponse.json({
      success: true,
      gradeLevel,
      category,
      totalInDeck: enrichedCards.length,
      dueCount: dueCards.length,
      masteredCount,
      cards: finalCards,
    });
  } catch (err: any) {
    console.error("GET /api/flashcards/deck error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
