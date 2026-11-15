import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  curriculumAnalysisJobs,
  analyzedCurriculumQuestions,
  analyzedCurriculumQuizzes,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !["admin", "teacher"].includes(ctx.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const sourceType = searchParams.get("sourceType"); // 'original_extracted' | 'ai_generated'
  const unitNumber = searchParams.get("unitNumber");
  const difficulty = searchParams.get("difficulty");
  const approvalStatus = searchParams.get("approvalStatus");

  try {
    const jobRows = await db
      .select()
      .from(curriculumAnalysisJobs)
      .where(eq(curriculumAnalysisJobs.id, id));

    if (jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobRows[0];

    // Fetch questions
    let allQuestions = await db
      .select()
      .from(analyzedCurriculumQuestions)
      .where(eq(analyzedCurriculumQuestions.jobId, id));

    if (sourceType) {
      allQuestions = allQuestions.filter((q) => q.sourceType === sourceType);
    }
    if (unitNumber) {
      const uNum = parseInt(unitNumber, 10);
      allQuestions = allQuestions.filter((q) => q.unitNumber === uNum);
    }
    if (difficulty) {
      allQuestions = allQuestions.filter((q) => q.difficulty === difficulty);
    }
    if (approvalStatus) {
      allQuestions = allQuestions.filter((q) => q.approvalStatus === approvalStatus);
    }

    // Fetch quizzes
    const quizzes = await db
      .select()
      .from(analyzedCurriculumQuizzes)
      .where(eq(analyzedCurriculumQuizzes.jobId, id));

    return NextResponse.json({
      success: true,
      job,
      questions: allQuestions,
      quizzes,
      totalQuestions: allQuestions.length,
      approvedCount: allQuestions.filter((q) => q.approvalStatus === "approved").length,
      pendingCount: allQuestions.filter((q) => q.approvalStatus === "pending").length,
      rejectedCount: allQuestions.filter((q) => q.approvalStatus === "rejected").length,
    });
  } catch (error: any) {
    console.error("Job details GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to load job details" }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await req.json();
    const { action, questionId, questionIds, updates } = body;

    if (action === "approve_all") {
      await db
        .update(analyzedCurriculumQuestions)
        .set({ approvalStatus: "approved" })
        .where(eq(analyzedCurriculumQuestions.jobId, id));

      await db
        .update(analyzedCurriculumQuizzes)
        .set({ approvalStatus: "approved" })
        .where(eq(analyzedCurriculumQuizzes.jobId, id));

      return NextResponse.json({ success: true, message: "All questions and quizzes approved" });
    }

    if (action === "reject_all") {
      await db
        .update(analyzedCurriculumQuestions)
        .set({ approvalStatus: "rejected" })
        .where(eq(analyzedCurriculumQuestions.jobId, id));

      return NextResponse.json({ success: true, message: "All questions rejected" });
    }

    if (action === "batch_update" && Array.isArray(questionIds) && questionIds.length > 0) {
      const targetStatus = body.status || "approved";
      for (const qId of questionIds) {
        await db
          .update(analyzedCurriculumQuestions)
          .set({ approvalStatus: targetStatus })
          .where(
            and(
              eq(analyzedCurriculumQuestions.id, qId),
              eq(analyzedCurriculumQuestions.jobId, id)
            )
          );
      }
      return NextResponse.json({ success: true, updatedCount: questionIds.length });
    }

    if (questionId && updates) {
      await db
        .update(analyzedCurriculumQuestions)
        .set({
          ...(updates.questionText ? { questionText: updates.questionText } : {}),
          ...(updates.correctAnswer ? { correctAnswer: updates.correctAnswer } : {}),
          ...(updates.explanation ? { explanation: updates.explanation } : {}),
          ...(updates.difficulty ? { difficulty: updates.difficulty } : {}),
          ...(updates.approvalStatus ? { approvalStatus: updates.approvalStatus } : {}),
          ...(updates.options ? { options: updates.options } : {}),
        })
        .where(
          and(
            eq(analyzedCurriculumQuestions.id, questionId),
            eq(analyzedCurriculumQuestions.jobId, id)
          )
        );

      return NextResponse.json({ success: true, message: "Question updated successfully" });
    }

    return NextResponse.json({ error: "Invalid PATCH action" }, { status: 400 });
  } catch (error: any) {
    console.error("Job PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update questions" }, { status: 500 });
  }
}

export async function DELETE(
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
    await db.delete(curriculumAnalysisJobs).where(eq(curriculumAnalysisJobs.id, id));
    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete job" }, { status: 500 });
  }
}
