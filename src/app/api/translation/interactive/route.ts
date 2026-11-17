import { NextResponse } from "next/server";
import { db } from "@/db";
import { translationExercises, userTranslationAttempts } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { evaluateSmartTranslation } from "@/lib/translation-evaluator";
import { INTERACTIVE_TRANSLATION_SEEDS } from "@/data/interactive-translation-seed";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("grade_level") || "3rd_sec";
    const direction = searchParams.get("direction"); // 'en_to_ar' | 'ar_to_en' | 'all'
    const exerciseType = searchParams.get("exercise_type"); // 'written' | 'mcq' | 'all'
    const difficulty = searchParams.get("difficulty");

    let exercises: any[] = [];

    try {
      await ensureDbSetup();
      if (process.env.DATABASE_URL) {
        const queryConditions: any[] = [];
        if (gradeLevel && gradeLevel !== "all") {
          queryConditions.push(eq(translationExercises.gradeLevel, gradeLevel));
        }
        if (direction && direction !== "all") {
          queryConditions.push(eq(translationExercises.direction, direction));
        }
        if (exerciseType && exerciseType !== "all") {
          queryConditions.push(eq(translationExercises.exerciseType, exerciseType));
        }
        if (difficulty && difficulty !== "all") {
          queryConditions.push(eq(translationExercises.difficulty, difficulty));
        }

        const dbRows = await db
          .select()
          .from(translationExercises)
          .where(queryConditions.length > 0 ? and(...queryConditions) : undefined);

        if (dbRows && dbRows.length > 0) {
          exercises = dbRows;
        }
      }
    } catch (dbErr) {
      console.warn("DB query failed in interactive translation, using fallback:", dbErr);
    }

    // Fallback to in-memory seeds if DB returned no results
    if (exercises.length === 0) {
      exercises = INTERACTIVE_TRANSLATION_SEEDS.filter((ex) => {
        if (gradeLevel && gradeLevel !== "all" && ex.gradeLevel !== gradeLevel) return false;
        if (direction && direction !== "all" && ex.direction !== direction) return false;
        if (exerciseType && exerciseType !== "all" && ex.exerciseType !== exerciseType) return false;
        if (difficulty && difficulty !== "all" && ex.difficulty !== difficulty) return false;
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      count: exercises.length,
      exercises,
    });
  } catch (err: any) {
    console.error("GET /api/translation/interactive error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json();

    const {
      action = "evaluate_written", // 'evaluate_written' | 'submit_mcq'
      exerciseId,
      studentInput,
      selectedOptionIndex,
      userId,
    } = body;

    const effectiveUserId = ctx?.user?.id || userId || "usr_guest_translation";

    if (!exerciseId) {
      return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
    }

    // 1. Fetch exercise from DB or fallback
    let exercise: any = null;
    try {
      if (process.env.DATABASE_URL) {
        const rows = await db
          .select()
          .from(translationExercises)
          .where(eq(translationExercises.id, exerciseId));
        if (rows.length > 0) {
          exercise = rows[0];
        }
      }
    } catch (e) {
      console.warn("Failed to fetch exercise from DB:", e);
    }

    if (!exercise) {
      exercise = INTERACTIVE_TRANSLATION_SEEDS.find((ex) => ex.id === exerciseId);
    }

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // 2. Handle Written Translation Evaluation
    if (action === "evaluate_written") {
      const evaluation = evaluateSmartTranslation({
        studentInput: String(studentInput || ""),
        modelAnswer: exercise.modelAnswer,
        alternativeAnswers: (exercise.alternativeAnswers as string[]) || [],
        keyVocabulary: (exercise.keyVocabulary as any) || [],
        direction: exercise.direction as "en_to_ar" | "ar_to_en",
        grammarTip: exercise.grammarTip || undefined,
      });

      // Save attempt if DB available
      try {
        if (process.env.DATABASE_URL) {
          const attemptId = `uta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await db.insert(userTranslationAttempts).values({
            id: attemptId,
            userId: effectiveUserId,
            exerciseId: exercise.id,
            userInput: String(studentInput || "").trim(),
            accuracyScore: evaluation.accuracyScore,
            matchedKeywords: evaluation.matchedKeywords as any,
            missedKeywords: evaluation.missedKeywords as any,
          });
        }
      } catch (attErr) {
        console.warn("Could not save user translation attempt:", attErr);
      }

      return NextResponse.json({
        success: true,
        action: "evaluate_written",
        exerciseId: exercise.id,
        evaluation,
      });
    }

    // 3. Handle MCQ Translation Submission
    if (action === "submit_mcq") {
      const mcqOptions = exercise.mcqOptions as {
        options: string[];
        correct_index: number;
        trap_explanations: Record<string, string>;
      };

      if (!mcqOptions || !Array.isArray(mcqOptions.options)) {
        return NextResponse.json({ error: "Exercise is not configured for MCQ" }, { status: 400 });
      }

      const selectedIdx = Number(selectedOptionIndex);
      const isCorrect = selectedIdx === mcqOptions.correct_index;
      const accuracyScore = isCorrect ? 100 : 0;
      const trapExplanation =
        mcqOptions.trap_explanations?.[String(selectedIdx)] ||
        (isCorrect
          ? "إجابة صحيحة ومطابقة تماماً لقواعد ومعايير الصياغة!"
          : "خيار غير سليم يفتقر للدقة في الزمن أو المفردات.");

      // Save attempt if DB available
      try {
        if (process.env.DATABASE_URL) {
          const attemptId = `uta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await db.insert(userTranslationAttempts).values({
            id: attemptId,
            userId: effectiveUserId,
            exerciseId: exercise.id,
            userInput: `MCQ Choice: ${selectedIdx} - ${mcqOptions.options[selectedIdx] || ""}`,
            accuracyScore,
            matchedKeywords: isCorrect ? (exercise.keyVocabulary as any) : [],
            missedKeywords: isCorrect ? [] : (exercise.keyVocabulary as any),
          });
        }
      } catch (attErr) {
        console.warn("Could not save MCQ attempt:", attErr);
      }

      return NextResponse.json({
        success: true,
        action: "submit_mcq",
        exerciseId: exercise.id,
        isCorrect,
        correctIndex: mcqOptions.correct_index,
        selectedOptionIndex: selectedIdx,
        trapExplanation,
        grammarTip: exercise.grammarTip,
        isEligibleForXP: isCorrect,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/translation/interactive error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
