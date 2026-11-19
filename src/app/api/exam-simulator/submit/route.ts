import { NextResponse } from "next/server";
import { db } from "@/db";
import { mockExams, mockExamAttempts } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { awardXP } from "@/lib/gamification-service";
import { recordMistake } from "@/lib/mistakes-service";
import { SEED_MOCK_EXAM } from "@/data/pro-suite-seeds";
import { MASTER_MOCK_EXAMS_REGISTRY } from "@/data/exam-simulator-catalog.ts";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const { examId, answers, timeSpentSeconds, userId } = body;
    const effectiveUserId = userId || ctx?.user?.id || "guest_student";

    // 1. Fetch Exam
    let exam: any = null;
    if (process.env.DATABASE_URL && examId) {
      try {
        const rows = await db
          .select()
          .from(mockExams)
          .where(eq(mockExams.id, examId))
          .limit(1);
        if (rows.length > 0) {
          exam = {
            id: rows[0].id,
            title: rows[0].title,
            gradeLevel: rows[0].gradeLevel,
            sections: rows[0].sectionsJson,
          };
        }
      } catch (e) {
        console.warn("DB mockExam query error:", e);
      }
    }

    if (!exam) {
      exam = MASTER_MOCK_EXAMS_REGISTRY.find((e) => e.id === examId) || MASTER_MOCK_EXAMS_REGISTRY[0];
    }

    const studentAnswers: Record<string, string> = answers || {};
    const sections = exam.sections || {};

    let totalScore = 0;
    let maxScore = 0;
    const mistakeLogs: any[] = [];

    // Section 1: MCQ Evaluation
    let mcqScore = 0;
    let mcqMax = 0;
    const mcqList = (sections.mcq || []) as any[];
    for (const q of mcqList) {
      mcqMax += q.points || 1;
      const given = studentAnswers[q.id];
      const isCorrect = given && given.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        mcqScore += q.points || 1;
      } else if (given) {
        // Record mistake automatically
        mistakeLogs.push({ questionId: q.id, question: q.question, given, correct: q.correctAnswer });
        try {
          await recordMistake(
            {
              id: q.id,
              type: "mcq",
              questionText: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              stage: "Secondary",
              grade: exam.gradeLevel,
            },
            given,
            effectiveUserId
          );
        } catch (mErr) {
          console.warn("Auto-record mistake error:", mErr);
        }
      }
    }

    // Section 2: Passage Evaluation
    let passageScore = 0;
    let passageMax = 0;
    const passageQs = (sections.passage?.questions || []) as any[];
    for (const q of passageQs) {
      passageMax += q.points || 2;
      const given = studentAnswers[q.id];
      const isCorrect = given && given.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        passageScore += q.points || 2;
      } else if (given) {
        mistakeLogs.push({ questionId: q.id, question: q.question, given, correct: q.correctAnswer });
        try {
          await recordMistake(
            {
              id: q.id,
              type: "reading_comprehension",
              questionText: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              stage: "Secondary",
              grade: exam.gradeLevel,
            },
            given,
            effectiveUserId
          );
        } catch (mErr) {
          console.warn("Auto-record mistake error:", mErr);
        }
      }
    }

    // Section 3: Translation Evaluation
    let translationScore = 0;
    let translationMax = 0;
    const transQs = (sections.translation || []) as any[];
    for (const q of transQs) {
      translationMax += q.points || 2;
      const given = studentAnswers[q.id];
      const isCorrect = given && given.trim() === q.correctAnswer.trim();
      if (isCorrect) {
        translationScore += q.points || 2;
      } else if (given) {
        mistakeLogs.push({ questionId: q.id, question: q.sourceText, given, correct: q.correctAnswer });
      }
    }

    // Section 4: Novel Evaluation
    let novelScore = 0;
    let novelMax = 0;
    const novelQs = (sections.novel || []) as any[];
    for (const q of novelQs) {
      novelMax += q.points || 2;
      const given = studentAnswers[q.id] || "";
      if (given.trim().split(/\s+/).length >= 8) {
        novelScore += q.points || 2;
      } else if (given.trim().length > 0) {
        novelScore += 1;
      }
    }

    // Section 5: Essay Evaluation
    let essayScore = 0;
    let essayMax = 4;
    const essayGiven = studentAnswers["essay_answer"] || "";
    const essayWordCount = essayGiven.trim().split(/\s+/).filter(Boolean).length;
    if (essayWordCount >= 180) essayScore = 4;
    else if (essayWordCount >= 120) essayScore = 3;
    else if (essayWordCount >= 60) essayScore = 2;
    else if (essayWordCount > 0) essayScore = 1;

    totalScore = mcqScore + passageScore + translationScore + novelScore + essayScore;
    maxScore = mcqMax + passageMax + translationMax + novelMax + essayMax;

    // 2. Award +60 XP
    let xpAwarded = 0;
    if (effectiveUserId) {
      try {
        await awardXP({
          userId: effectiveUserId,
          actionType: "exam_completed",
          referenceId: `mock_${exam.id}`,
          customXp: 60,
        });
        xpAwarded = 60;
      } catch (e) {
        console.warn("Could not award mock exam XP:", e);
      }
    }

    const sectionBreakdown = {
      mcq: { score: mcqScore, max: mcqMax },
      passage: { score: passageScore, max: passageMax },
      translation: { score: translationScore, max: translationMax },
      novel: { score: novelScore, max: novelMax },
      essay: { score: essayScore, max: essayMax },
    };

    // 3. Save to exam_attempts if DB available
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (process.env.DATABASE_URL) {
      try {
        await db
          .insert(mockExamAttempts)
          .values({
            id: attemptId,
            userId: effectiveUserId,
            examId: exam.id,
            totalScore,
            maxScore,
            timeSpentSeconds: parseInt(timeSpentSeconds, 10) || 0,
            sectionBreakdown: sectionBreakdown as any,
          })
          .onConflictDoNothing();
      } catch (saveErr) {
        console.warn("Could not save exam attempt to DB:", saveErr);
      }
    }

    const percentage = Math.round((totalScore / maxScore) * 100);

    return NextResponse.json({
      success: true,
      attemptId,
      examTitle: exam.title,
      totalScore,
      maxScore,
      percentage,
      timeSpentSeconds: parseInt(timeSpentSeconds, 10) || 0,
      xpAwarded,
      sectionBreakdown,
      mistakesLoggedCount: mistakeLogs.length,
      parentShareText: `نتيجة امتحان المحاكاة الشامل لمستر حبيب الرحمن:\nالطالب أنجز الامتحان بدرجة ${totalScore}/${maxScore} (${percentage}%) بنجاح! 🌟\nتم تحويل ${mistakeLogs.length} خطأ إلى بنك الأخطاء الذكي للمراجعة.`,
    });
  } catch (err: any) {
    console.error("POST /api/exam-simulator/submit error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
