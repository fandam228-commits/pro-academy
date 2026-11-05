import { db } from "@/db";
import { examAttempts, generatedExams, parentLinks, users } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getVerifiedParentAnalyticsStudentIds, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";

const parentAccountUser = alias(users, "student_performance_parent_account");
const linkedStudentUser = alias(users, "student_performance_linked_student");
const verifiedByUser = alias(users, "student_performance_verified_by_user");

export async function GET(req: Request) {
  // Authenticate and reject unsupported roles before schema setup or any report query.
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = ctx.user.role as string;
  if (!["admin", "teacher", "parent", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Generated exams and attempts have no reliable course ownership key. Do not expose
  // this unscoped history to teachers; course-scoped Analytics is the safe teacher path.
  if (role === "teacher") {
    return NextResponse.json({ error: "Course-scoped performance history is unavailable for this report" }, { status: 403 });
  }

  await ensureDbSetup();

  const { searchParams } = new URL(req.url);
  const requestedStudentId = searchParams.get("studentId");

  try {
    // A stale session role must not survive a role change in the current user record.
    const actorRows = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, ctx.user.id));
    if (!actorRows[0] || actorRows[0].role !== role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let studentId: string | null = requestedStudentId;

    if (role === "student") {
      if (requestedStudentId !== null && requestedStudentId !== ctx.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      studentId = ctx.user.id;
    } else if (role === "parent") {
      const links = await db
        .select({
          studentId: parentLinks.studentId,
          verifiedAt: parentLinks.verifiedAt,
          verifiedBy: parentLinks.verifiedBy,
        })
        .from(parentLinks)
        .innerJoin(parentAccountUser, eq(parentLinks.parentId, parentAccountUser.id))
        .innerJoin(linkedStudentUser, eq(parentLinks.studentId, linkedStudentUser.id))
        .innerJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
        .where(and(
          eq(parentLinks.parentId, ctx.user.id),
          eq(parentAccountUser.role, "parent"),
          eq(linkedStudentUser.role, "student"),
          eq(verifiedByUser.role, "admin"),
          isNotNull(parentLinks.verifiedAt),
          isNotNull(parentLinks.verifiedBy),
        ));

      const linkedStudentIds = getVerifiedParentAnalyticsStudentIds(links);
      const resolution = resolveParentAnalyticsStudentId(requestedStudentId, linkedStudentIds);
      if (!resolution.ok) {
        if (resolution.reason === "no-linked-student") {
          return NextResponse.json({ error: "No verified linked student" }, { status: 404 });
        }
        if (resolution.reason === "student-id-required") {
          return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
        }
        if (resolution.reason === "invalid-student-id") {
          return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
        }
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      studentId = resolution.studentId;
    }

    if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

    // Only a current student account can be the target of a performance report.
    const targetRows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, "student")));
    if (!targetRows[0]) return NextResponse.json({ error: "Student not found" }, { status: 404 });

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
