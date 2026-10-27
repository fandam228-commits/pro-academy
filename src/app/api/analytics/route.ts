import { db } from "@/db";
import {
  users,
  examAttempts,
  generatedExams,
  quizSubmissions,
  homework,
  homeworkSubmissions,
  attendanceRecords,
  questionBank,
  enrollments,
  courses,
  parentLinks,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { canAccessStudentAnalytics } from "@/lib/analytics-authorization.mjs";

function attendanceRate(records: any[]) {
  if (records.length === 0) return 100;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  return Math.round(((present + late * 0.7 + excused * 0.85) / records.length) * 100);
}

/** Builds a full learning profile for one student. */
async function buildStudentReport(studentId: string) {
  const userRows = await db.select().from(users).where(eq(users.id, studentId));
  const student = userRows[0];

  const attempts = (await db.select().from(examAttempts).where(eq(examAttempts.studentId, studentId))).sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  const quizSubs = (await db.select().from(quizSubmissions).where(eq(quizSubmissions.studentId, studentId))).sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  const hwSubs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.studentId, studentId));
  const allHw = await db.select().from(homework);
  const attendance = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
  const bank = await db.select().from(questionBank);
  const myEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));

  // ---------- SCORE TIMELINE (exams + quizzes merged chronologically) ----------
  const timeline = [
    ...attempts.map((a) => ({
      label: new Date(a.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      percentage: a.percentage,
      type: "exam" as const,
      date: a.submittedAt,
    })),
    ...quizSubs.map((q) => ({
      label: new Date(q.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      percentage: q.percentage,
      type: "quiz" as const,
      date: q.submittedAt,
    })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12);

  // ---------- TOPIC MASTERY (from detailed exam feedback vs question bank) ----------
  const topicStats: Record<string, { correct: number; total: number; domain: string }> = {};

  for (const att of attempts) {
    const fb = (att.detailedFeedback || {}) as Record<string, any>;
    for (const [qid, detail] of Object.entries(fb)) {
      const q = bank.find((b) => b.id === qid);
      const topicKey = q?.grammarTopic || q?.topic || "General Practice";
      const domain = q?.domainCategory || "Grammar";
      if (!topicStats[topicKey]) topicStats[topicKey] = { correct: 0, total: 0, domain };
      topicStats[topicKey].total += 1;
      if ((detail as any)?.isCorrect) topicStats[topicKey].correct += 1;
    }
  }

  const topicMastery = Object.entries(topicStats)
    .map(([topic, s]) => ({
      topic,
      domain: s.domain,
      correct: s.correct,
      total: s.total,
      mastery: Math.round((s.correct / (s.total || 1)) * 100),
    }))
    .sort((a, b) => b.mastery - a.mastery);

  const strengths = topicMastery.filter((t) => t.mastery >= 75).slice(0, 5);
  const weaknesses = topicMastery.filter((t) => t.mastery < 60).slice(0, 5);

  // ---------- CORE KPIs ----------
  const allScores = [...attempts.map((a) => a.percentage), ...quizSubs.map((q) => q.percentage)];
  const avgScore = allScores.length ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;

  const gradedHw = hwSubs.filter((h) => h.status === "graded");
  const hwAvg = gradedHw.length
    ? Math.round(
        (gradedHw.reduce((sum, h) => {
          const parent = allHw.find((x) => x.id === h.homeworkId);
          return sum + ((h.score || 0) / (parent?.totalPoints || 50)) * 100;
        }, 0) /
          gradedHw.length)
      )
    : 0;

  const relevantHw = allHw.filter((h) => !student?.grade || h.grade === student.grade);
  const hwCompletion = relevantHw.length ? Math.round((hwSubs.length / relevantHw.length) * 100) : 0;

  const attRate = attendanceRate(attendance);

  // Trend: last 3 vs previous 3 assessments
  const recent = allScores.slice(-3);
  const older = allScores.slice(-6, -3);
  const recentAvg = recent.length ? recent.reduce((s, v) => s + v, 0) / recent.length : 0;
  const olderAvg = older.length ? older.reduce((s, v) => s + v, 0) / older.length : recentAvg;
  const trend = Math.round(recentAvg - olderAvg);

  // Overall performance index (weighted)
  const performanceIndex = Math.round(avgScore * 0.45 + hwAvg * 0.2 + attRate * 0.2 + Math.min(hwCompletion, 100) * 0.15);

  // ---------- AI-STYLE RECOMMENDATIONS ----------
  const recommendations: string[] = [];
  if (weaknesses.length > 0) {
    recommendations.push(
      `ركّز على مراجعة: ${weaknesses.map((w) => w.topic).join("، ")} — ولّد امتحاناً مخصصاً من بنك الأسئلة على هذه المواضيع.`
    );
  }
  if (attRate < 85) recommendations.push("نسبة الحضور أقل من المستهدف — الانتظام في الحصص المباشرة يرفع الدرجات بنسبة ملحوظة.");
  if (hwCompletion < 80) recommendations.push("هناك واجبات لم تُسلَّم — إنجاز الواجبات يثبت القواعد في الذاكرة طويلة المدى.");
  if (trend < 0) recommendations.push("الأداء في آخر اختبارات أقل من السابق — راجع الشروحات المرفقة مع كل سؤال خاطئ.");
  if (trend > 5) recommendations.push("أداؤك في تحسّن مستمر 📈 — حافظ على نفس معدل المذاكرة اليومي!");
  if (strengths.length > 0) recommendations.push(`نقاط قوتك الواضحة: ${strengths.map((s) => s.topic).join("، ")} — استثمرها في حل أسئلة أصعب.`);
  if (recommendations.length === 0) recommendations.push("ابدأ بحل امتحان من بنك الأسئلة الذكي ليتم بناء تحليل دقيق لمستواك.");

  return {
    student: student ? { id: student.id, name: student.name, grade: student.grade, points: student.points, streak: student.streak, level: student.level } : null,
    kpis: {
      avgScore,
      hwAvg,
      hwCompletion,
      attRate,
      performanceIndex,
      trend,
      totalExams: attempts.length + quizSubs.length,
      totalHomework: hwSubs.length,
      coursesEnrolled: myEnrollments.length,
      totalSessions: attendance.length,
    },
    timeline,
    topicMastery,
    strengths,
    weaknesses,
    recommendations,
  };
}

function buildClassAnalyticsResponse(reports: Awaited<ReturnType<typeof buildStudentReport>>[]) {
  const classRows = reports
    .map((r) => ({
      id: r.student?.id,
      name: r.student?.name,
      grade: r.student?.grade,
      avgScore: r.kpis.avgScore,
      attRate: r.kpis.attRate,
      hwCompletion: r.kpis.hwCompletion,
      performanceIndex: r.kpis.performanceIndex,
      trend: r.kpis.trend,
      weakestTopic: r.weaknesses[0]?.topic || null,
    }))
    .sort((a, b) => b.performanceIndex - a.performanceIndex);

  const topicAgg: Record<string, { correct: number; total: number }> = {};
  for (const report of reports) {
    for (const topic of report.topicMastery) {
      if (!topicAgg[topic.topic]) topicAgg[topic.topic] = { correct: 0, total: 0 };
      topicAgg[topic.topic].correct += topic.correct;
      topicAgg[topic.topic].total += topic.total;
    }
  }
  const classTopics = Object.entries(topicAgg)
    .map(([topic, stats]) => ({
      topic,
      mastery: Math.round((stats.correct / (stats.total || 1)) * 100),
      total: stats.total,
    }))
    .sort((a, b) => a.mastery - b.mastery);

  const classAvg = classRows.length
    ? Math.round(classRows.reduce((sum, row) => sum + row.avgScore, 0) / classRows.length)
    : 0;
  const classAtt = classRows.length
    ? Math.round(classRows.reduce((sum, row) => sum + row.attRate, 0) / classRows.length)
    : 0;

  return NextResponse.json({
    scope: "class",
    classKpis: {
      totalStudents: classRows.length,
      classAvg,
      classAtt,
      atRiskCount: classRows.filter((row) => row.performanceIndex < 60).length,
      topPerformer: classRows[0]?.name || "-",
    },
    students: classRows,
    classTopics,
  });
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requestedStudent = searchParams.get("studentId");
  const role = ctx.user.role as string;

  try {
    // ---------- ADMIN: unrestricted analytics ----------
    if (role === "admin") {
      if (requestedStudent) {
        const report = await buildStudentReport(requestedStudent);
        if (!report.student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        return NextResponse.json({ scope: "student", ...report });
      }

      const students = await db.select().from(users).where(eq(users.role, "student"));
      const reports = await Promise.all(students.map((s) => buildStudentReport(s.id)));

      return buildClassAnalyticsResponse(reports);
    }

    // ---------- TEACHER: only students enrolled in courses owned by this teacher ----------
    if (role === "teacher") {
      const teacherEnrollments = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(courses.teacherId, ctx.user.id));
      const teacherStudentIds = [...new Set(teacherEnrollments.map((row) => row.studentId))];

      if (requestedStudent) {
        const allowed = canAccessStudentAnalytics({
          role,
          requesterId: ctx.user.id,
          studentId: requestedStudent,
          teacherStudentIds,
        });
        if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const report = await buildStudentReport(requestedStudent);
        if (!report.student || report.student.id === undefined) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        return NextResponse.json({ scope: "student", ...report });
      }

      const students = await db.select().from(users).where(eq(users.role, "student"));
      const visibleStudents = students.filter((student) => teacherStudentIds.includes(student.id));
      const reports = await Promise.all(visibleStudents.map((s) => buildStudentReport(s.id)));

      const classRows = reports
        .map((r) => ({
          id: r.student?.id,
          name: r.student?.name,
          grade: r.student?.grade,
          avgScore: r.kpis.avgScore,
          attRate: r.kpis.attRate,
          hwCompletion: r.kpis.hwCompletion,
          performanceIndex: r.kpis.performanceIndex,
          trend: r.kpis.trend,
          weakestTopic: r.weaknesses[0]?.topic || null,
        }))
        .sort((a, b) => b.performanceIndex - a.performanceIndex);

      // Aggregate weakest topics across the whole class
      const topicAgg: Record<string, { correct: number; total: number }> = {};
      for (const r of reports) {
        for (const t of r.topicMastery) {
          if (!topicAgg[t.topic]) topicAgg[t.topic] = { correct: 0, total: 0 };
          topicAgg[t.topic].correct += t.correct;
          topicAgg[t.topic].total += t.total;
        }
      }
      const classTopics = Object.entries(topicAgg)
        .map(([topic, s]) => ({ topic, mastery: Math.round((s.correct / (s.total || 1)) * 100), total: s.total }))
        .sort((a, b) => a.mastery - b.mastery);

      const classAvg = classRows.length
        ? Math.round(classRows.reduce((s, r) => s + r.avgScore, 0) / classRows.length)
        : 0;
      const classAtt = classRows.length
        ? Math.round(classRows.reduce((s, r) => s + r.attRate, 0) / classRows.length)
        : 0;

      return NextResponse.json({
        scope: "class",
        classKpis: {
          totalStudents: classRows.length,
          classAvg,
          classAtt,
          atRiskCount: classRows.filter((r) => r.performanceIndex < 60).length,
          topPerformer: classRows[0]?.name || "-",
        },
        students: classRows,
        classTopics,
      });
    }

    // ---------- PARENT: linked student report ----------
    if (role === "parent") {
      let studentId = requestedStudent;
      if (!studentId) {
        const links = await db.select().from(parentLinks).where(eq(parentLinks.parentId, ctx.user.id));
        studentId = links[0]?.studentId || null;
      }
      if (!studentId) return NextResponse.json({ error: "No linked student" }, { status: 404 });
      const links = await db.select().from(parentLinks).where(eq(parentLinks.parentId, ctx.user.id));
      const allowed = canAccessStudentAnalytics({
        role,
        requesterId: ctx.user.id,
        studentId,
        linkedParentStudentIds: links.map((link) => link.studentId),
      });
      if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const report = await buildStudentReport(studentId);
      return NextResponse.json({ scope: "parent", ...report });
    }

    // ---------- STUDENT: own report only ----------
    if (!canAccessStudentAnalytics({ role, requesterId: ctx.user.id, studentId: requestedStudent || ctx.user.id })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const report = await buildStudentReport(ctx.user.id);
    return NextResponse.json({ scope: "student", ...report });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to build analytics" }, { status: 500 });
  }
}
