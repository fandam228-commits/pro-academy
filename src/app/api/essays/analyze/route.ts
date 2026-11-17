import { NextResponse } from "next/server";
import { db } from "@/db";
import { essayTopics, userEssays } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { awardXP } from "@/lib/gamification-service";
import { SEED_ESSAY_TOPICS } from "@/data/pro-suite-seeds";
import { eq } from "drizzle-orm";

const BASIC_WORDS_MAP: Record<string, string[]> = {
  very: ["extremely", "exceptionally", "profoundly", "remarkably"],
  good: ["beneficial", "advantageous", "exemplary", "constructive"],
  bad: ["detrimental", "adverse", "harmful", "deplorable"],
  nice: ["appealing", "pleasant", "commendable", "delightful"],
  thing: ["aspect", "factor", "phenomenon", "element"],
  get: ["obtain", "acquire", "attain", "secure"],
  make: ["generate", "establish", "formulate", "construct"],
  big: ["monumental", "substantial", "significant", "immense"],
  important: ["crucial", "indispensable", "imperative", "paramount"],
};

const TRANSITION_CONNECTORS = [
  "furthermore",
  "moreover",
  "in addition",
  "consequently",
  "on the other hand",
  "therefore",
  "first and foremost",
  "in conclusion",
  "however",
  "nevertheless",
  "as a result",
  "for instance",
];

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const { topicId, content, userId } = body;
    const effectiveUserId = userId || ctx?.user?.id || "guest_student";

    const textContent = String(content || "").trim();
    if (!textContent) {
      return NextResponse.json(
        { error: "يرجى كتابة نص المقال أو الفقرة قبل بدء التحليل الذكي" },
        { status: 400 }
      );
    }

    // 1. Fetch Topic
    let topic: any = null;
    if (process.env.DATABASE_URL && topicId) {
      try {
        const rows = await db
          .select()
          .from(essayTopics)
          .where(eq(essayTopics.id, topicId))
          .limit(1);
        if (rows.length > 0) topic = rows[0];
      } catch (e) {
        console.warn("DB essayTopic fetch error:", e);
      }
    }

    if (!topic) {
      topic = SEED_ESSAY_TOPICS.find((t) => t.id === topicId) || SEED_ESSAY_TOPICS[0];
    }

    const minWords = topic?.minWords || 180;

    // 2. Word Count & Statistics
    const words = textContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wordCountMet = wordCount >= minWords;

    // 3. Repeated Basic Words Detection
    const lowerTokens = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
    const wordFrequencies: Record<string, number> = {};
    for (const tok of lowerTokens) {
      if (tok) wordFrequencies[tok] = (wordFrequencies[tok] || 0) + 1;
    }

    const overusedBasicWords: Array<{ word: string; count: number; suggestions: string[] }> = [];
    for (const [bw, suggestions] of Object.entries(BASIC_WORDS_MAP)) {
      const count = wordFrequencies[bw] || 0;
      if (count >= 2) {
        overusedBasicWords.push({ word: bw, count, suggestions });
      }
    }

    // 4. Transitions & Academic Connectors Detection
    const lowerContent = textContent.toLowerCase();
    const usedTransitions: string[] = [];
    for (const conn of TRANSITION_CONNECTORS) {
      if (lowerContent.includes(conn)) {
        usedTransitions.push(conn);
      }
    }

    // 5. Structure & Capitalization Checks
    const sentences = textContent.split(/[.?!]+/).filter((s) => s.trim().length > 0);
    let capitalizedSentencesCount = 0;
    for (const s of sentences) {
      const trimmed = s.trim();
      if (trimmed.length > 0 && /^[A-Z]/.test(trimmed)) {
        capitalizedSentencesCount++;
      }
    }
    const capitalizationRate = sentences.length > 0 ? (capitalizedSentencesCount / sentences.length) * 100 : 100;

    // 6. Quality Score Calculation (0 - 100)
    let score = 30; // Base effort score
    if (wordCount >= minWords) score += 35;
    else score += Math.floor((wordCount / minWords) * 30);

    if (usedTransitions.length >= 3) score += 20;
    else if (usedTransitions.length >= 1) score += 10;

    if (overusedBasicWords.length === 0) score += 10;
    else if (overusedBasicWords.length <= 2) score += 5;

    if (capitalizationRate >= 80) score += 5;

    score = Math.min(Math.max(score, 10), 100);

    const isHighQuality = score >= 65 && wordCount >= minWords;

    // 7. Award Gamification XP
    let xpAwarded = 0;
    if (isHighQuality && effectiveUserId) {
      try {
        await awardXP({
          userId: effectiveUserId,
          actionType: "essay_submitted",
          referenceId: `essay_${topic?.id || Date.now()}`,
          customXp: 30,
        });
        xpAwarded = 30;
      } catch (xpErr) {
        console.warn("Could not award essay XP:", xpErr);
      }
    }

    // 8. Save to user_essays if DB available
    const essayRecordId = `ess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (process.env.DATABASE_URL) {
      try {
        await db
          .insert(userEssays)
          .values({
            id: essayRecordId,
            userId: effectiveUserId,
            topicId: topic?.id || "e1",
            content: textContent,
            wordCount,
            qualityScore: score,
            feedbackJson: {
              usedTransitions,
              overusedBasicWords,
              capitalizationRate,
              wordCountMet,
            } as any,
          })
          .onConflictDoNothing();
      } catch (saveErr) {
        console.warn("Could not save essay record to DB:", saveErr);
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        wordCount,
        minWords,
        wordCountMet,
        qualityScore: score,
        isHighQuality,
        xpAwarded,
        usedTransitions,
        overusedBasicWords,
        capitalizationRate: Math.round(capitalizationRate),
        modelEssay: topic?.modelEssay,
        feedbackAr: isHighQuality
          ? "مقال أكاديمي متقن ومطابق لمعايير تصحيح الثانوية العامة! أحسنت في توظيف الروابط والمفردات 🌟"
          : "محاولة جيدة! يُنصح باستبدال الكلمات المكررة بمفردات أكثر دقة واستخدام أدوات الربط المعروضة أدناه 🎯",
      },
    });
  } catch (err: any) {
    console.error("POST /api/essays/analyze error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
