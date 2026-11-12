import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  curriculumAnalysisJobs,
  analyzedCurriculumQuestions,
  analyzedCurriculumQuizzes,
  questionBank,
  quizzes,
  questions as examQuestions,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !["admin", "teacher"].includes(ctx.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const jobRows = await db
      .select()
      .from(curriculumAnalysisJobs)
      .where(eq(curriculumAnalysisJobs.id, id));

    if (jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    const job = jobRows[0];

    // 1. Fetch only APPROVED questions that haven't been published yet
    const approvedQuestions = await db
      .select()
      .from(analyzedCurriculumQuestions)
      .where(
        and(
          eq(analyzedCurriculumQuestions.jobId, id),
          eq(analyzedCurriculumQuestions.approvalStatus, "approved"),
          eq(analyzedCurriculumQuestions.isPublished, false)
        )
      );

    if (approvedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No pending approved questions to publish. Please approve questions first." },
        { status: 400 }
      );
    }

    // 2. Publish questions into live `question_bank`
    let publishedCount = 0;
    const chunkSize = 40;

    for (let i = 0; i < approvedQuestions.length; i += chunkSize) {
      const chunk = approvedQuestions.slice(i, i + chunkSize);

      for (const q of chunk) {
        const liveId = `qb_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        await db.insert(questionBank).values({
          id: liveId,
          domainCategory: q.sectionType as any,
          questionText: q.questionText,
          questionType: "mcq",
          stage: job.stage,
          grade: job.gradeCode === "sec_3" ? "Third Secondary (Baccalaureate)" : "Secondary",
          curriculum: "Ministry",
          term: job.term,
          source: q.sourceReference || `Curriculum Analysis: ${job.fileName}`,
          tags: [job.gradeCode, `Unit ${q.unitNumber}`, q.sectionType, q.sourceType],
          unit: `Unit ${q.unitNumber}`,
          lesson: q.lessonTitle,
          section: q.sectionType,
          difficulty: q.difficulty,
          topic: `${q.unitTitle} - ${q.lessonTitle}`,
          options: q.options as any,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.difficulty === "Hard" ? 15 : q.difficulty === "Medium" ? 10 : 5,
        });

        // Mark as published in staging table
        await db
          .update(analyzedCurriculumQuestions)
          .set({ isPublished: true, publishedQuestionId: liveId })
          .where(eq(analyzedCurriculumQuestions.id, q.id));

        publishedCount++;
      }
    }

    // 3. Publish approved quizzes
    const approvedQuizzes = await db
      .select()
      .from(analyzedCurriculumQuizzes)
      .where(
        and(
          eq(analyzedCurriculumQuizzes.jobId, id),
          eq(analyzedCurriculumQuizzes.approvalStatus, "approved"),
          eq(analyzedCurriculumQuizzes.isPublished, false)
        )
      );

    let publishedQuizzesCount = 0;
    for (const qz of approvedQuizzes) {
      const liveQuizId = `qz_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await db.insert(quizzes).values({
        id: liveQuizId,
        title: qz.titleAr,
        stage: job.stage,
        type: qz.quizType === "lesson_quiz" ? "quiz" : "exam",
        durationMinutes: qz.durationMinutes,
        passPercentage: qz.passPercentage,
        totalPoints: qz.totalPoints,
      });

      // Insert quiz questions linked to this quiz
      const qIds = (qz.questionIds as string[]) || [];
      const questionsForThisQuiz = approvedQuestions.filter((q) => qIds.includes(q.id));

      for (let idx = 0; idx < questionsForThisQuiz.length; idx++) {
        const qItem = questionsForThisQuiz[idx];
        await db.insert(examQuestions).values({
          id: `eq_${liveQuizId}_${idx + 1}`,
          quizId: liveQuizId,
          type: "mcq",
          questionText: qItem.questionText,
          options: qItem.options as any,
          correctAnswer: qItem.correctAnswer,
          explanation: qItem.explanation,
          points: 10,
        });
      }

      await db
        .update(analyzedCurriculumQuizzes)
        .set({ isPublished: true, publishedQuizId: liveQuizId })
        .where(eq(analyzedCurriculumQuizzes.id, qz.id));

      publishedQuizzesCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully published ${publishedCount} questions and ${publishedQuizzesCount} interactive quizzes to live platform!`,
      publishedQuestionsCount: publishedCount,
      publishedQuizzesCount,
    });
  } catch (error: any) {
    console.error("Publish questions error:", error);
    return NextResponse.json({ error: error.message || "Failed to publish questions" }, { status: 500 });
  }
}
