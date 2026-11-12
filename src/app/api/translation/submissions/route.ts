import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  translationSubmissions,
  translationQuestions,
  translationLessons,
  users,
} from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // 'needs_review' | 'all'
    const studentId = searchParams.get("studentId");

    let query = db
      .select({
        id: translationSubmissions.id,
        studentId: translationSubmissions.studentId,
        studentName: users.name,
        studentEmail: users.email,
        questionId: translationSubmissions.questionId,
        questionText: translationQuestions.questionText,
        questionType: translationQuestions.questionType,
        correctAnswer: translationQuestions.correctAnswer,
        lessonId: translationSubmissions.lessonId,
        lessonTitleAr: translationLessons.titleAr,
        lessonTitleEn: translationLessons.titleEn,
        mode: translationSubmissions.mode,
        studentAnswer: translationSubmissions.studentAnswer,
        score: translationSubmissions.score,
        maxMarks: translationSubmissions.maxMarks,
        rubricBreakdown: translationSubmissions.rubricBreakdown,
        evaluationFeedback: translationSubmissions.evaluationFeedback,
        suggestedCorrection: translationSubmissions.suggestedCorrection,
        status: translationSubmissions.status,
        teacherComment: translationSubmissions.teacherComment,
        reviewedAt: translationSubmissions.reviewedAt,
        createdAt: translationSubmissions.createdAt,
      })
      .from(translationSubmissions)
      .leftJoin(users, eq(translationSubmissions.studentId, users.id))
      .leftJoin(translationQuestions, eq(translationSubmissions.questionId, translationQuestions.id))
      .leftJoin(translationLessons, eq(translationSubmissions.lessonId, translationLessons.id))
      .orderBy(desc(translationSubmissions.createdAt));

    const rows = await query;

    const filtered = rows.filter((r) => {
      if (statusFilter && statusFilter !== "all" && r.status !== statusFilter) return false;
      if (studentId && r.studentId !== studentId) return false;
      return true;
    });

    const pendingCount = rows.filter((r) => r.status === "needs_review").length;

    return NextResponse.json({
      success: true,
      submissions: filtered,
      pendingReviewCount: pendingCount,
    });
  } catch (error: any) {
    console.error("Translation Submissions GET Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureDbSetup();
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { submissionId, newScore, teacherComment, status = "teacher_reviewed" } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(translationSubmissions)
      .where(eq(translationSubmissions.id, submissionId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await db
      .update(translationSubmissions)
      .set({
        score: typeof newScore === "number" ? Math.round(newScore) : existing[0].score,
        teacherComment: teacherComment !== undefined ? teacherComment : existing[0].teacherComment,
        status,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      })
      .where(eq(translationSubmissions.id, submissionId));

    return NextResponse.json({ success: true, submissionId });
  } catch (error: any) {
    console.error("Translation Submissions PATCH Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update submission" }, { status: 500 });
  }
}
