import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  translationQuestions,
  translationSubmissions,
  translationStudentProgress,
  users,
} from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { evaluateQuestion } from "@/lib/translation-evaluator";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json();

    const {
      questionId,
      lessonId,
      moduleId,
      studentAnswer,
      mode = "practice", // 'practice' | 'exam'
    } = body;

    if (!questionId || studentAnswer === undefined) {
      return NextResponse.json({ error: "questionId and studentAnswer are required" }, { status: 400 });
    }

    // 1. Fetch Question
    const questionRows = await db
      .select()
      .from(translationQuestions)
      .where(eq(translationQuestions.id, questionId));

    if (questionRows.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const q = questionRows[0];

    // 2. Perform Smart Translation Evaluation
    const evalResult = evaluateQuestion(
      q.questionType,
      studentAnswer,
      q.correctAnswer,
      (q.alternativeAnswers as string[]) || [],
      q.options,
      q.marks || 1
    );

    // 3. Save Submission if User is Authenticated
    let submissionId = `tsub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const studentId = ctx?.user?.id || `usr_guest_${Date.now()}`;

    if (ctx?.user?.id) {
      await db.insert(translationSubmissions).values({
        id: submissionId,
        studentId: ctx.user.id,
        questionId: q.id,
        lessonId: lessonId || q.lessonId,
        mode,
        studentAnswer: String(studentAnswer || "").trim(),
        score: Math.round(evalResult.score),
        maxMarks: q.marks || 1,
        rubricBreakdown: evalResult.rubric as any,
        evaluationFeedback: evalResult.feedback,
        suggestedCorrection: evalResult.suggestedCorrection,
        modelAnswerUsed: evalResult.modelAnswerUsed,
        status: evalResult.status,
      });

      // Update student lesson progress
      const targetLessonId = lessonId || q.lessonId;
      const targetModuleId = moduleId || q.moduleId;

      const existingProg = await db
        .select()
        .from(translationStudentProgress)
        .where(
          and(
            eq(translationStudentProgress.studentId, ctx.user.id),
            eq(translationStudentProgress.lessonId, targetLessonId)
          )
        );

      if (existingProg.length > 0) {
        const p = existingProg[0];
        const newScore = mode === "exam"
          ? Math.max(p.examScore, evalResult.percentage)
          : Math.max(p.practiceScore, evalResult.percentage);

        await db
          .update(translationStudentProgress)
          .set({
            practiceScore: mode === "practice" ? newScore : p.practiceScore,
            examScore: mode === "exam" ? newScore : p.examScore,
            totalQuestionsAnswered: p.totalQuestionsAnswered + 1,
            completed: p.completed || evalResult.isCorrect,
            lastPracticedAt: new Date(),
          })
          .where(eq(translationStudentProgress.id, p.id));
      } else {
        await db.insert(translationStudentProgress).values({
          id: `tsp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          studentId: ctx.user.id,
          lessonId: targetLessonId,
          moduleId: targetModuleId,
          completed: evalResult.isCorrect,
          practiceScore: mode === "practice" ? evalResult.percentage : 0,
          examScore: mode === "exam" ? evalResult.percentage : 0,
          totalQuestionsAnswered: 1,
        });
      }

      // Bonus points for correct answers
      if (evalResult.isCorrect) {
        try {
          await db
            .update(users)
            .set({ points: (ctx.user.points || 0) + 10 })
            .where(eq(users.id, ctx.user.id));
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      submissionId,
      evaluation: evalResult,
      explanation: q.explanation,
    });
  } catch (error: any) {
    console.error("Translation Evaluate POST Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to evaluate translation" }, { status: 500 });
  }
}
