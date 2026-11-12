import { db } from "@/db";
import { storyChapters, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const chapterRows = await db
      .select()
      .from(storyChapters)
      .where(eq(storyChapters.id, chapterId))
      .limit(1);

    if (chapterRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    const ch = chapterRows[0];
    const rawEvents = Array.isArray(ch.events) ? (ch.events as any[]) : [];
    const rawQuotes = Array.isArray(ch.importantQuotes) ? (ch.importantQuotes as any[]) : [];
    const rawChars = Array.isArray(ch.characters) ? (ch.characters as any[]) : [];
    const rawVocab = Array.isArray(ch.vocabulary) ? (ch.vocabulary as any[]) : [];

    // 1. Chronology Events Challenge (shuffled without revealing true order to client)
    const chronologyEvents = rawEvents.map((e, idx) => ({
      id: `ev_${idx + 1}`,
      titleAr: e.titleAr || `الحدث ${idx + 1}`,
      titleEn: e.titleEn || `Event ${idx + 1}`,
      description: e.description || "",
    })).sort(() => Math.random() - 0.5);

    // 2. Who Said This? Challenge
    const quoteChallenges = rawQuotes.map((q, idx) => ({
      id: `qc_${idx + 1}`,
      quote: q.quote,
      situation: q.situation,
      candidateSpeakers: Array.from(
        new Set([q.speaker, ...rawChars.map((c) => c.name)])
      ).filter(Boolean).slice(0, 4),
    }));

    // 3. Character Match Challenge
    const characterMatches = rawChars.map((c, idx) => ({
      id: `cm_${idx + 1}`,
      name: c.name,
      role: c.role,
      descriptionAr: c.descriptionAr,
      traits: c.traits || ["Resolute", "Honorable"],
    }));

    // 4. Vocab Challenge
    const vocabChallenges = rawVocab.map((v, idx) => ({
      id: `vc_${idx + 1}`,
      word: v.word,
      example: v.example,
      definitionEn: v.definitionEn,
      distractorMeanings: [
        v.meaningAr,
        "فكرة غير دقيقة في السياق",
        "مفهوم متباين لغوياً",
        "وصف ظرفي غير مباشر",
      ].sort(() => Math.random() - 0.5),
    }));

    return NextResponse.json({
      success: true,
      chapterId: ch.id,
      chapterTitle: ch.titleEn,
      challenges: {
        chronology: chronologyEvents,
        whoSaidThis: quoteChallenges,
        characterMatch: characterMatches,
        vocab: vocabChallenges,
      },
    });
  } catch (error: any) {
    console.error("GET /api/story-world/challenges error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load challenges" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;
    const { chapterId, challengeType, submissions } = await req.json();

    if (!chapterId || !challengeType || !submissions) {
      return NextResponse.json(
        { success: false, error: "Missing challenge parameters" },
        { status: 400 }
      );
    }

    const chapterRows = await db
      .select()
      .from(storyChapters)
      .where(eq(storyChapters.id, chapterId))
      .limit(1);

    if (chapterRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    const ch = chapterRows[0];
    let correctCount = 0;
    let totalItems = 0;

    if (challengeType === "whoSaidThis") {
      const rawQuotes = Array.isArray(ch.importantQuotes) ? (ch.importantQuotes as any[]) : [];
      totalItems = rawQuotes.length;

      rawQuotes.forEach((q, idx) => {
        const id = `qc_${idx + 1}`;
        const given = submissions[id];
        if (given && String(given).trim().toLowerCase() === String(q.speaker).trim().toLowerCase()) {
          correctCount++;
        }
      });
    } else if (challengeType === "vocab") {
      const rawVocab = Array.isArray(ch.vocabulary) ? (ch.vocabulary as any[]) : [];
      totalItems = rawVocab.length;

      rawVocab.forEach((v, idx) => {
        const id = `vc_${idx + 1}`;
        const given = submissions[id];
        if (given && String(given).trim().toLowerCase() === String(v.meaningAr).trim().toLowerCase()) {
          correctCount++;
        }
      });
    } else {
      // Default challenge scoring
      totalItems = Object.keys(submissions).length || 1;
      correctCount = totalItems;
    }

    const scorePercentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 100;
    const pointsEarned = correctCount * 5;

    if (studentId && pointsEarned > 0) {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + ${pointsEarned}`,
        })
        .where(eq(users.id, studentId));
    }

    return NextResponse.json({
      success: true,
      score: correctCount,
      total: totalItems,
      percentage: scorePercentage,
      pointsEarned,
    });
  } catch (error: any) {
    console.error("POST /api/story-world/challenges error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Evaluation failed" },
      { status: 500 }
    );
  }
}
