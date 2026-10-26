import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { CEFR_DESCRIPTORS, CEFR_LEVELS, PLACEMENT_QUESTION_BANK, type CefrLevel, type PlacementSkill } from "@/data/placement-questions";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

async function ensurePlacementAssessmentTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS placement_assessments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      overall_level TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_items INTEGER NOT NULL,
      band_results JSONB NOT NULL,
      skill_results JSONB NOT NULL,
      completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_placement_assessments_student_date
      ON placement_assessments(student_id, completed_at DESC);
  `);
}

async function getStudent(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (ctx.user.role !== "student") {
    return { error: NextResponse.json({ error: "Students only" }, { status: 403 }) };
  }
  return { user: ctx.user };
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const student = await getStudent(req);
  if (student.error) return student.error;

  if (new URL(req.url).searchParams.get("history") === "1") {
    await ensurePlacementAssessmentTable();
    const history = await db.execute(sql`
      SELECT overall_level AS level, score, total_items AS total, completed_at AS "completedAt"
      FROM placement_assessments
      WHERE student_id = ${student.user.id}
      ORDER BY completed_at DESC
      LIMIT 6
    `);
    return NextResponse.json({ history: history.rows }, { headers: { "Cache-Control": "no-store" } });
  }

  const questions = [...PLACEMENT_QUESTION_BANK];
  for (let i = questions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return NextResponse.json({
    version: "cefr-placement-v1",
    estimatedMinutes: 30,
    questionCount: questions.length,
    questions: questions.map(({ id, skill, prompt, options, passage }) => ({ id, skill, prompt, options, passage })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const student = await getStudent(req);
  if (student.error) return student.error;

  try {
    const body = await req.json();
    const answers = body?.answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return NextResponse.json({ error: "All test answers are required." }, { status: 400 });
    }

    const expectedIds = new Set(PLACEMENT_QUESTION_BANK.map((question) => question.id));
    const submittedIds = Object.keys(answers);
    if (submittedIds.length !== expectedIds.size || submittedIds.some((id) => !expectedIds.has(id))) {
      return NextResponse.json({ error: `Answer all ${expectedIds.size} questions before submitting.` }, { status: 400 });
    }

    const bandResults = CEFR_LEVELS.map((level) => ({ level, correct: 0, total: 0, percent: 0 }));
    const skillTotals: Record<PlacementSkill, { correct: number; total: number }> = {
      language: { correct: 0, total: 0 },
      functional: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
    };
    const normalizedAnswers: Record<string, string> = {};

    for (const question of PLACEMENT_QUESTION_BANK) {
      const submittedAnswer = answers[question.id];
      const legacyIndex = typeof submittedAnswer === "number" ? submittedAnswer : Number.NaN;
      const selectedAnswer = typeof submittedAnswer === "string" && question.options.includes(submittedAnswer)
        ? submittedAnswer
        : Number.isInteger(legacyIndex) && legacyIndex >= 0 && legacyIndex < question.options.length
          ? question.options[legacyIndex]
          : null;
      if (!selectedAnswer) {
        return NextResponse.json({ error: "One or more answers are invalid." }, { status: 400 });
      }
      normalizedAnswers[question.id] = selectedAnswer;

      const band = bandResults[CEFR_LEVELS.indexOf(question.level)];
      band.total += 1;
      skillTotals[question.skill].total += 1;
      if (selectedAnswer === question.options[question.correctIndex]) {
        band.correct += 1;
        skillTotals[question.skill].correct += 1;
      }
    }

    for (const band of bandResults) {
      band.percent = Math.round((band.correct / band.total) * 100);
    }

    // A band is reached only when it has a clear majority and all lower bands show a basic foundation.
    // Eight items per band make the placement more robust than a single-question-per-level ladder.
    let levelIndex = 0;
    for (let i = 0; i < bandResults.length; i += 1) {
      const lowerBandsHaveFoundation = bandResults.slice(0, i).every((band) => band.correct >= 4);
      if (bandResults[i].correct >= 5 && lowerBandsHaveFoundation) levelIndex = i;
      else break;
    }

    const level = CEFR_LEVELS[levelIndex] as CefrLevel;
    const score = PLACEMENT_QUESTION_BANK.reduce(
      (sum, question) => sum + (normalizedAnswers[question.id] === question.options[question.correctIndex] ? 1 : 0),
      0
    );
    const skillResults = Object.entries(skillTotals).map(([skill, result]) => ({
      skill,
      correct: result.correct,
      total: result.total,
      percent: Math.round((result.correct / Math.max(1, result.total)) * 100),
    }));
    const currentBand = bandResults[levelIndex];
    const nextBand = bandResults[levelIndex + 1];
    const nearBoundary = currentBand.correct === 5 || currentBand.correct === 6 || (nextBand ? nextBand.correct >= 4 : false);
    const foundationSupport = level === "A1" && bandResults[0].correct < 5;
    const result = {
      level,
      score,
      total: PLACEMENT_QUESTION_BANK.length,
      bandResults,
      skillResults,
      descriptor: CEFR_DESCRIPTORS[level],
      interpretation: nearBoundary ? "approximate" : "clearer-pattern",
      foundationSupport,
      note: "This is an in-platform placement estimate, not an official CEFR certificate. It assesses language knowledge, reading and functional English; it does not directly assess speaking or writing.",
      missedQuestions: PLACEMENT_QUESTION_BANK.flatMap((question) => {
        const selectedAnswer = normalizedAnswers[question.id];
        return selectedAnswer === question.options[question.correctIndex] ? [] : [{
          id: question.id,
          level: question.level,
          skill: question.skill,
          prompt: question.prompt,
          selectedAnswer,
          correctAnswer: question.options[question.correctIndex],
          explanation: question.explanation,
        }];
      }),
    };

    await ensurePlacementAssessmentTable();
    const assessmentId = `place_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        INSERT INTO placement_assessments
          (id, student_id, overall_level, score, total_items, band_results, skill_results)
        VALUES
          (${assessmentId}, ${student.user.id}, ${level}, ${score}, ${PLACEMENT_QUESTION_BANK.length},
           ${JSON.stringify(bandResults)}::jsonb, ${JSON.stringify(skillResults)}::jsonb)
      `);
      await tx.update(users).set({ level }).where(eq(users.id, student.user.id));
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Placement test submission error:", error);
    return NextResponse.json({ error: "Could not save placement result." }, { status: 500 });
  }
}
