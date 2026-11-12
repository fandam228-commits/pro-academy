import { db } from "@/db";
import {
  trainingStudentAttempts,
  trainingExamSessions,
  trainingRevisionQueue,
  trainingBookmarks,
  trainingQuestions,
  users,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const auth = await getAuthContext(req);
    const currentUser = auth?.user;

    const studentId = currentUser?.id || searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({
        success: true,
        stats: {
          totalPracticed: 0,
          totalCorrect: 0,
          overallAccuracy: 0,
          totalExams: 0,
          passedExams: 0,
          avgExamScore: 0,
          unresolvedMistakes: 0,
          totalBookmarks: 0,
          topicStats: [],
          weakTopics: [],
          strongTopics: [],
          points: 150,
          level: "Intermediate",
        },
      });
    }

    // 1. Practice & Exam Attempts Aggregate
    const attemptsResult = await db
      .select({
        total: sql<number>`count(*)`,
        correct: sql<number>`count(case when ${trainingStudentAttempts.isCorrect} = true then 1 end)`,
      })
      .from(trainingStudentAttempts)
      .where(eq(trainingStudentAttempts.studentId, studentId));

    const totalPracticed = Number(attemptsResult[0]?.total || 0);
    const totalCorrect = Number(attemptsResult[0]?.correct || 0);
    const overallAccuracy = totalPracticed > 0 ? Math.round((totalCorrect / totalPracticed) * 100) : 0;

    // 2. Exam Sessions Aggregate
    const examsResult = await db
      .select({
        totalExams: sql<number>`count(*)`,
        passedExams: sql<number>`count(case when ${trainingExamSessions.passed} = true then 1 end)`,
        avgPercentage: sql<number>`coalesce(avg(case when ${trainingExamSessions.status} = 'completed' then cast(${trainingExamSessions.percentage} as decimal) end), 0)`,
      })
      .from(trainingExamSessions)
      .where(eq(trainingExamSessions.studentId, studentId));

    const totalExams = Number(examsResult[0]?.totalExams || 0);
    const passedExams = Number(examsResult[0]?.passedExams || 0);
    const avgExamScore = Math.round(Number(examsResult[0]?.avgPercentage || 0));

    // 3. Unresolved Mistakes
    const mistakesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingRevisionQueue)
      .where(
        sql`${trainingRevisionQueue.studentId} = ${studentId} AND ${trainingRevisionQueue.resolved} = false`
      );
    const unresolvedMistakes = Number(mistakesResult[0]?.count || 0);

    // 4. Total Bookmarks
    const bookmarksResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingBookmarks)
      .where(eq(trainingBookmarks.studentId, studentId));
    const totalBookmarks = Number(bookmarksResult[0]?.count || 0);

    // 5. Topic Breakdown
    const topicBreakdownResult = await db.execute(sql`
      SELECT 
        q.topic as topic,
        count(a.id) as total_attempts,
        count(case when a.is_correct = true then 1 end) as correct_attempts
      FROM training_student_attempts a
      JOIN training_questions q ON a.question_id = q.id
      WHERE a.student_id = ${studentId}
      GROUP BY q.topic
      ORDER BY total_attempts DESC
    `);

    const topicStats: any[] = [];
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    const rows: any[] = (topicBreakdownResult as any).rows || [];
    for (const r of rows) {
      const topicName = r.topic || "Grammar";
      const tot = Number(r.total_attempts || 0);
      const corr = Number(r.correct_attempts || 0);
      const acc = tot > 0 ? Math.round((corr / tot) * 100) : 0;

      topicStats.push({
        topic: topicName,
        total: tot,
        correct: corr,
        accuracy: acc,
      });

      if (tot >= 3) {
        if (acc < 60) weakTopics.push(topicName);
        else if (acc >= 80) strongTopics.push(topicName);
      }
    }

    // 6. User points & streak
    const userResult = await db
      .select({
        points: users.points,
        streak: users.streak,
        level: users.level,
      })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

    return NextResponse.json({
      success: true,
      stats: {
        totalPracticed,
        totalCorrect,
        overallAccuracy,
        totalExams,
        passedExams,
        avgExamScore,
        unresolvedMistakes,
        totalBookmarks,
        topicStats,
        weakTopics,
        strongTopics,
        points: userResult[0]?.points || 150,
        streak: userResult[0]?.streak || 1,
        level: userResult[0]?.level || "Intermediate",
      },
    });
  } catch (error: any) {
    console.error("GET /api/training-center/progress error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load progress stats" },
      { status: 500 }
    );
  }
}
