import { db } from "@/db";
import {
  storyChapters,
  storyStudentBadges,
  users,
} from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { createExamAttemptSession, gradeExamAttempt } from "@/lib/smart-shuffle-engine";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const gradeId = searchParams.get("gradeId");

    let questions: any[] = [];

    if (chapterId) {
      const chRows = await db
        .select()
        .from(storyChapters)
        .where(eq(storyChapters.id, chapterId))
        .limit(1);

      if (chRows.length > 0 && Array.isArray(chRows[0].mcqQuestions)) {
        questions = (chRows[0].mcqQuestions as any[]).map((q, idx) => ({
          id: `sq_${chRows[0].id}_${idx + 1}`,
          questionNumber: idx + 1,
          questionText: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "Story comprehension analysis",
          topic: chRows[0].titleEn,
          difficulty: "Medium",
        }));
      }
    } else if (gradeId) {
      const allGradeChapters = await db
        .select()
        .from(storyChapters)
        .where(eq(storyChapters.gradeId, gradeId));

      for (const ch of allGradeChapters) {
        if (Array.isArray(ch.mcqQuestions)) {
          (ch.mcqQuestions as any[]).forEach((q, idx) => {
            questions.push({
              id: `sq_${ch.id}_${idx + 1}`,
              questionNumber: questions.length + 1,
              questionText: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || `Comprehension rule for ${ch.titleEn}`,
              topic: ch.titleEn,
              difficulty: "Medium",
            });
          });
        }
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No story exam questions available for this selection.",
      }, { status: 400 });
    }

    const session = createExamAttemptSession(questions);

    return NextResponse.json({
      success: true,
      totalQuestions: session.clientQuestions.length,
      questions: session.clientQuestions,
      // For standalone client evaluation without session DB overhead
      secretsToken: Buffer.from(JSON.stringify(session.secrets)).toString("base64"),
    });
  } catch (error: any) {
    console.error("GET /api/story-world/exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate story exam" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;
    const { secretsToken, studentAnswers = {}, isFinalExam = false } = await req.json();

    if (!secretsToken) {
      return NextResponse.json(
        { success: false, error: "Missing exam secrets token" },
        { status: 400 }
      );
    }

    const rawSecrets = JSON.parse(Buffer.from(secretsToken, "base64").toString("utf-8"));
    const graded = gradeExamAttempt(rawSecrets, studentAnswers);

    let badgeEarned = false;
    if (studentId) {
      const points = graded.score * 10 + (graded.passed ? 30 : 0);
      if (points > 0) {
        await db
          .update(users)
          .set({ points: sql`${users.points} + ${points}` })
          .where(eq(users.id, studentId));
      }

      // Check Story Champion badge (score >= 85% on final exam)
      if (isFinalExam && graded.percentage >= 85) {
        const existingBadge = await db
          .select()
          .from(storyStudentBadges)
          .where(
            and(
              eq(storyStudentBadges.studentId, studentId),
              eq(storyStudentBadges.badgeCode, "story_champion")
            )
          )
          .limit(1);

        if (existingBadge.length === 0) {
          await db.insert(storyStudentBadges).values({
            id: `badge_sc_${Date.now()}`,
            studentId,
            badgeCode: "story_champion",
            badgeNameAr: "بطل القصة الاستثنائي",
            badgeNameEn: "Story Champion",
            badgeIcon: "👑",
            earnedAt: new Date(),
          });
          badgeEarned = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      score: graded.score,
      totalScore: graded.totalScore,
      percentage: graded.percentage,
      passed: graded.passed,
      detailedResults: graded.detailedResults,
      badgeEarned,
    });
  } catch (error: any) {
    console.error("POST /api/story-world/exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Exam grading failed" },
      { status: 500 }
    );
  }
}
