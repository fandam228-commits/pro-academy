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

const COMMON_SPELLING_FIXES: Record<string, string> = {
  alot: "a lot",
  definately: "definitely",
  seperate: "separate",
  untill: "until",
  recieved: "received",
  goverment: "government",
  enviroment: "environment",
  sucessful: "successful",
  tommorow: "tomorrow",
  neccessary: "necessary",
  wierd: "weird",
  truely: "truly",
};

const GRAMMAR_PATTERNS: Array<{ pattern: RegExp; issueAr: string; suggestion: string }> = [
  { pattern: /\bpeople is\b/i, issueAr: "خطأ توافق الفاعل الجمع مع الفعل (Subject-Verb Agreement)", suggestion: "people are" },
  { pattern: /\bchildren is\b/i, issueAr: "خطأ توافق الفاعل الجمع مع الفعل", suggestion: "children are" },
  { pattern: /\bhe have\b/i, issueAr: "خطأ تصريف فعل الملكية مع المفرد الغائب", suggestion: "he has" },
  { pattern: /\bshe have\b/i, issueAr: "خطأ تصريف فعل الملكية مع المفرد الغائب", suggestion: "she has" },
  { pattern: /\bit have\b/i, issueAr: "خطأ تصريف فعل الملكية مع غير العاقل المفرد", suggestion: "it has" },
  { pattern: /\bthey was\b/i, issueAr: "خطأ في زمن الماضي مع ضمير الجمع", suggestion: "they were" },
  { pattern: /\bwe was\b/i, issueAr: "خطأ في زمن الماضي مع ضمير المتكلم الجمع", suggestion: "we were" },
  { pattern: /\bevery students\b/i, issueAr: "كلمة every يتبعها اسم مفرد", suggestion: "every student" },
  { pattern: /\beach students\b/i, issueAr: "كلمة each يتبعها اسم مفرد", suggestion: "each student" },
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
    const rawSentences = textContent.split(/[.?!]+/).map((s) => s.trim()).filter(Boolean);
    let capitalizedSentencesCount = 0;
    for (const s of rawSentences) {
      if (s.length > 0 && /^[A-Z]/.test(s)) {
        capitalizedSentencesCount++;
      }
    }
    const capitalizationRate = rawSentences.length > 0 ? (capitalizedSentencesCount / rawSentences.length) * 100 : 100;

    // 6. Spelling & Grammatical Diagnostic Issue Detection
    const detectedIssues: Array<{ type: "spelling" | "grammar" | "punctuation"; mistake: string; correction: string; noteAr: string }> = [];

    // Spelling check
    for (const tok of lowerTokens) {
      if (COMMON_SPELLING_FIXES[tok]) {
        detectedIssues.push({
          type: "spelling",
          mistake: tok,
          correction: COMMON_SPELLING_FIXES[tok],
          noteAr: `تصويب إملائي لكلمة (${tok})`,
        });
      }
    }

    // Grammar check
    for (const gRule of GRAMMAR_PATTERNS) {
      const match = textContent.match(gRule.pattern);
      if (match) {
        detectedIssues.push({
          type: "grammar",
          mistake: match[0],
          correction: gRule.suggestion,
          noteAr: gRule.issueAr,
        });
      }
    }

    // Run-on check (> 45 words without pause)
    for (const s of rawSentences) {
      const sWordCount = s.split(/\s+/).filter(Boolean).length;
      if (sWordCount > 45 && !s.includes(",") && !s.includes(";")) {
        detectedIssues.push({
          type: "punctuation",
          mistake: s.substring(0, 35) + "...",
          correction: "قسّم الجملة إلى جملتين أقصر باستخدام أداة ربط أو فاصلة منقوطة",
          noteAr: "جملة طويلة جداً (Run-on sentence) تفتقر لعلامات الترقيم الداخلية",
        });
        break;
      }
    }

    // 7. Official 4-Pillar Ministerial Rubric Breakdown (out of 25 each, Total 100)
    // Pillar A: Content & Ideas (الأفكار والمضمون وترابطها بالموضوع) /25
    let contentScore = 10;
    if (wordCount >= minWords) contentScore = 23;
    else if (wordCount >= minWords * 0.75) contentScore = 18;
    else if (wordCount >= minWords * 0.5) contentScore = 14;
    else contentScore = Math.max(6, Math.round((wordCount / minWords) * 18));

    // Bonus for topic keywords / paragraphing
    if (rawSentences.length >= 6) contentScore = Math.min(25, contentScore + 2);

    // Pillar B: Grammar & Structure (القواعد وتركيب الجمل) /25
    let grammarScore = 22;
    const grammarDeductions = detectedIssues.filter((i) => i.type === "grammar").length * 3;
    grammarScore = Math.max(8, grammarScore - grammarDeductions);
    if (rawSentences.length >= 5 && grammarDeductions === 0) grammarScore = Math.min(25, grammarScore + 3);

    // Pillar C: Vocabulary Variety (تنوع المفردات الأكاديمية والبدائل) /25
    let vocabScore = 12;
    if (usedTransitions.length >= 4) vocabScore += 8;
    else if (usedTransitions.length >= 2) vocabScore += 5;
    else if (usedTransitions.length >= 1) vocabScore += 3;

    if (overusedBasicWords.length === 0) vocabScore += 5;
    else if (overusedBasicWords.length <= 2) vocabScore += 2;
    vocabScore = Math.min(Math.max(vocabScore, 8), 25);

    // Pillar D: Mechanics & Punctuation (علامات الترقيم والتنسيق والإملاء) /25
    let mechanicsScore = 15;
    if (capitalizationRate >= 85) mechanicsScore += 5;
    else if (capitalizationRate >= 60) mechanicsScore += 2;

    const spellingDeductions = detectedIssues.filter((i) => i.type === "spelling").length * 2;
    mechanicsScore = Math.max(6, Math.min(25, mechanicsScore - spellingDeductions));

    // Total Quality Score (0 - 100)
    const score = Math.min(Math.max(contentScore + grammarScore + vocabScore + mechanicsScore, 10), 100);
    const thanawyaAmmaMarks = Math.round((score / 100) * 6 * 10) / 10; // e.g. 5.4 / 6
    const prepStageMarks = Math.round((score / 100) * 4 * 10) / 10; // e.g. 3.6 / 4

    const isHighQuality = score >= 65 && wordCount >= minWords;

    // 8. Sentence Level-Up Transformations (ارتقِ بأسلوبك)
    const sentenceUpgrades: Array<{ original: string; upgraded: string; reasonAr: string }> = [];

    for (const sentence of rawSentences) {
      if (sentenceUpgrades.length >= 2) break;
      const sLower = sentence.toLowerCase();

      if (sLower.includes("is very important") || sLower.includes("are very important")) {
        const upgraded = sentence
          .replace(/is very important/i, "plays a pivotal and indispensable role")
          .replace(/are very important/i, "play a pivotal and indispensable role");
        sentenceUpgrades.push({
          original: sentence,
          upgraded,
          reasonAr: "استبدال التعبير المباشر (very important) بصياغة أكاديمية راقية تعزز درجتك في الثانوية العامة.",
        });
      } else if (sLower.includes("is very good") || sLower.includes("are very good")) {
        const upgraded = sentence
          .replace(/is very good/i, "proves exceptionally beneficial and constructive")
          .replace(/are very good/i, "prove exceptionally beneficial and constructive");
        sentenceUpgrades.push({
          original: sentence,
          upgraded,
          reasonAr: "استبدال الصفة البسيطة (very good) بمتلازمة وصفية أكاديمية (exceptionally beneficial).",
        });
      } else if (sLower.startsWith("i think that") || sLower.startsWith("in my opinion,")) {
        const upgraded = sentence.replace(/^(i think that|in my opinion,)/i, "It is widely acknowledged that");
        sentenceUpgrades.push({
          original: sentence,
          upgraded,
          reasonAr: "تحويل الجملة إلى المبني للمجهول الأكاديمي (Academic Impersonal Passive) المفضل في امتحانات الثانوية.",
        });
      }
    }

    // 9. Audio Coach Voice Feedback Scripts
    const audioScriptEn = `Hello! This is your writing coach from Professional Academy with Mr. Habib El Rahman. You achieved an overall score of ${score} out of 100, which predicts ${thanawyaAmmaMarks} out of 6 marks in the official Thanawya Amma exam. Your vocabulary variety scored ${vocabScore} out of 25. Remember to replace basic words with advanced collocations and maintain your academic transitions. Well done and keep leveling up!`;

    const audioScriptAr = `أهلاً بك في مختبر المقال مع مستر حبيب الرحمن. حقق مقالك تقديراً ممتازاً بمجموع ${score} من 100، وهو ما يوازي ${thanawyaAmmaMarks} من 6 درجات في امتحانات الثانوية العامة و${prepStageMarks} من 4 لصفوف النقل. استمع للتوجيهات وطبّق بدائل الكلمات المكررة للوصول للدرجة النهائية.`;

    // 10. Award Gamification XP
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

    // 11. Save to user_essays if DB available
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
              rubric: {
                contentAndIdeas: contentScore,
                grammarAndStructure: grammarScore,
                vocabularyVariety: vocabScore,
                mechanicsAndPunctuation: mechanicsScore,
              },
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
        thanawyaAmmaMarks,
        prepStageMarks,
        isHighQuality,
        xpAwarded,
        usedTransitions,
        overusedBasicWords,
        capitalizationRate: Math.round(capitalizationRate),
        rubric: {
          contentAndIdeas: contentScore,
          grammarAndStructure: grammarScore,
          vocabularyVariety: vocabScore,
          mechanicsAndPunctuation: mechanicsScore,
          totalScore: score,
        },
        detectedIssues,
        sentenceUpgrades,
        audioScriptEn,
        audioScriptAr,
        modelEssay: topic?.modelEssay,
        feedbackAr: isHighQuality
          ? `مقال أكاديمي متقن ومطابق لمعايير تصحيح الثانوية العامة! درجتك المتوقعة: (${thanawyaAmmaMarks}/6 درجات). أحسنت في توظيف الروابط والمفردات 🌟`
          : `محاولة جيدة! درجتك المتوقعة حالياً: (${thanawyaAmmaMarks}/6 درجات). راجع الأخطاء المرصودة واستبدل الكلمات المكررة للحصول على الدرجة النهائية 🎯`,
      },
    });
  } catch (err: any) {
    console.error("POST /api/essays/analyze error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
