import { db } from "@/db";
import { examAttempts, generatedExams } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requestedStudentId = searchParams.get("studentId");
  if (ctx.user.role === "student" && requestedStudentId && requestedStudentId !== ctx.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const studentId = ctx.user.role === "student" ? ctx.user.id : requestedStudentId;
  if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

  try {
    const attempts = await db.select().from(examAttempts)
      .where(eq(examAttempts.studentId, studentId))
      .orderBy(desc(examAttempts.submittedAt))
      .limit(30);

    const exams = await db.select().from(generatedExams).where(eq(generatedExams.studentId, studentId));
    const examMap = new Map(exams.map((e) => [e.id, e]));

    const history = attempts.map((attempt) => {
      const exam = examMap.get(attempt.examId);
      const questions = (exam?.questionsData as any[]) || [];
      const feedback = (attempt.detailedFeedback as Record<string, any>) || {};
      const groups: Record<string, { total: number; correct: number }> = {};
      const topics: Record<string, { total: number; correct: number; label: string }> = {};

      for (const q of questions) {
        const domain = q.domainCategory || "General";
        const topic = q.grammarTopic || q.topic || domain;
        if (!groups[domain]) groups[domain] = { total: 0, correct: 0 };
        groups[domain].total++;
        if (feedback[q.id]?.isCorrect) groups[domain].correct++;

        if (!topics[topic]) topics[topic] = { total: 0, correct: 0, label: topic };
        topics[topic].total++;
        if (feedback[q.id]?.isCorrect) topics[topic].correct++;
      }

      return {
        id: attempt.id,
        examId: attempt.examId,
        title: exam?.title || "Smart Review",
        grade: exam?.grade || "",
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        passed: attempt.passed,
        breakdown: Object.entries(groups).map(([domain, value]) => ({
          domain,
          total: value.total,
          correct: value.correct,
          percentage: Math.round((value.correct / Math.max(1, value.total)) * 100),
        })),
        topics: Object.values(topics).map((value) => ({
          topic: value.label,
          total: value.total,
          correct: value.correct,
          percentage: Math.round((value.correct / Math.max(1, value.total)) * 100),
        })),
      };
    });

    const topicAgg: Record<string, { attempts: number; correct: number; total: number }> = {};
    for (const item of history) {
      for (const topic of item.topics) {
        if (!topicAgg[topic.topic]) topicAgg[topic.topic] = { attempts: 0, correct: 0, total: 0 };
        topicAgg[topic.topic].attempts++;
        topicAgg[topic.topic].correct += topic.correct;
        topicAgg[topic.topic].total += topic.total;
      }
    }

    const weakPoints = Object.entries(topicAgg)
      .map(([topic, v]) => ({ topic, percentage: Math.round((v.correct / Math.max(1, v.total)) * 100), attempts: v.attempts, total: v.total }))
      .filter((x) => x.total > 0)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 6);

    const average = history.length
      ? Math.round(history.reduce((sum, x) => sum + x.percentage, 0) / history.length)
      : 0;

    return NextResponse.json({ success: true, history, weakPoints, average, totalExams: history.length });
  } catch (error) {
    console.error("Student performance error:", error);
    return NextResponse.json({ error: "Failed to load student performance" }, { status: 500 });
  }
}
