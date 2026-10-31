import { db } from "@/db";
import {
  users,
  examAttempts,
  generatedExams,
  quizSubmissions,
  quizzes,
  homework,
  homeworkSubmissions,
  attendanceRecords,
  questionBank,
  enrollments,
  courses,
  parentLinks,
} from "@/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { canAccessStudentAnalytics } from "@/lib/analytics-authorization.mjs";
import { attendanceRate, calculatePerformanceIndex, homeworkCompletion } from "@/lib/analytics-metrics.mjs";
import {
  getTeacherAnalyticsStudentIds,
  getTeacherAnalyticsCourseIds,
  resolveParentAnalyticsStudentId,
  getVerifiedParentAnalyticsStudentIds,
} from "@/lib/analytics-report-scope.mjs";

const verifiedByUser = alias(users, "verified_by_user");

type TeacherReportScope = {
  teacherId: string;
  allowedCourseIds: string[];
};

type AnalyticsStudentProfile = {
  id: string;
  name: string;
  grade: string | null;
  points?: number | null;
  streak?: number | null;
  level?: string | null;
};

/** Builds a learning profile; teacher calls receive only explicitly course-scoped data. */
async function buildStudentReport(studentId: string, scope?: TeacherReportScope) {
  // Reports only need the profile fields below. Never hydrate the full user row here:
  // it contains unrelated account data (for example contact/authentication fields).
  // Teacher reports additionally require a current student role in the same query.
  const userRows: AnalyticsStudentProfile[] = scope
    ? await db
        .select({
          id: users.id,
          name: users.name,
          grade: users.grade,
        })
        .from(users)
        .where(and(eq(users.id, studentId), eq(users.role, "student")))
    : await db
        .select({
          id: users.id,
          name: users.name,
          grade: users.grade,
          points: users.points,
          streak: users.streak,
          level: users.level,
        })
        .from(users)
        .where(eq(users.id, studentId));
  const student = userRows[0];

  // Generated exams/attempts have no reliable course foreign key. Exclude them
  // from teacher reports rather than exposing performance from other courses.
  const attempts = scope
    ? []
    : (await db.select().from(examAttempts).where(eq(examAttempts.studentId, studentId))).sort(
        (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );

  // For teacher reports, constrain database reads to the authorized course IDs.
  // Avoid loading unrelated teachers' quiz/homework records and filtering afterward.
  const quizSubs = (scope
    ? scope.allowedCourseIds.length === 0
      ? []
      : await db
          .select({
            percentage: quizSubmissions.percentage,
            submittedAt: quizSubmissions.submittedAt,
          })
          .from(quizSubmissions)
          .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
          .where(and(
            eq(quizSubmissions.studentId, studentId),
            inArray(quizzes.courseId, scope.allowedCourseIds),
          ))
    : await db
        .select({
          percentage: quizSubmissions.percentage,
          submittedAt: quizSubmissions.submittedAt,
        })
        .from(quizSubmissions)
        .where(eq(quizSubmissions.studentId, studentId)))
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  const visibleHomework = scope
    ? scope.allowedCourseIds.length === 0
      ? []
      : await db
          .select({
            id: homework.id,
            courseId: homework.courseId,
            grade: homework.grade,
            totalPoints: homework.totalPoints,
          })
          .from(homework)
          .where(and(
            eq(homework.teacherId, scope.teacherId),
            inArray(homework.courseId, scope.allowedCourseIds),
          ))
    : await db.select({
        id: homework.id,
        courseId: homework.courseId,
        grade: homework.grade,
        totalPoints: homework.totalPoints,
      }).from(homework);

  const visibleHomeworkIds = new Set(visibleHomework
    .filter((item) => !student?.grade || item.grade === student.grade)
    .map((item) => item.id));
  const hwSubs = scope
    ? visibleHomeworkIds.size === 0
      ? []
      : await db
          .select({
            homeworkId: homeworkSubmissions.homeworkId,
            score: homeworkSubmissions.score,
            status: homeworkSubmissions.status,
          })
          .from(homeworkSubmissions)
          .where(and(
            eq(homeworkSubmissions.studentId, studentId),
            inArray(homeworkSubmissions.homeworkId, [...visibleHomeworkIds]),
          ))
    : await db
        .select({
          homeworkId: homeworkSubmissions.homeworkId,
          score: homeworkSubmissions.score,
          status: homeworkSubmissions.status,
        })
        .from(homeworkSubmissions)
        .where(eq(homeworkSubmissions.studentId, studentId));

  // Attendance records currently have no course/teacher ownership key, so a
  // teacher report must not include attendance that cannot be scoped safely.
  const attendance = scope
    ? []
    : await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
  const bank = scope ? [] : await db.select().from(questionBank);

  const myEnrollments = scope
    ? scope.allowedCourseIds.length === 0
      ? []
      : await db
          .select()
          .from(enrollments)
          .where(and(
            eq(enrollments.studentId, studentId),
            inArray(enrollments.courseId, scope.allowedCourseIds),
          ))
    : await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));

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

  const enrolledCourseIds = new Set(myEnrollments.map((enrollment) => enrollment.courseId));
  const relevantHw = visibleHomework.filter(
    (h) => (!student?.grade || h.grade === student.grade) && (!h.courseId || enrolledCourseIds.has(h.courseId))
  );
  const relevantHomeworkIds = new Set(relevantHw.map((h) => h.id));
  const relevantHwSubs = hwSubs.filter((submission) => relevantHomeworkIds.has(submission.homeworkId));
  const gradedHw = relevantHwSubs.filter((h) => h.status === "graded");
  const hwAvg = gradedHw.length
    ? Math.round(
        (gradedHw.reduce((sum, h) => {
          const parent = relevantHw.find((x) => x.id === h.homeworkId);
          return sum + ((h.score || 0) / (parent?.totalPoints || 50)) * 100;
        }, 0) /
          gradedHw.length)
      )
    : 0;

  const hwCompletion = homeworkCompletion(relevantHw.map((h) => h.id), relevantHwSubs);

  const attRate = attendanceRate(attendance);

  // Trend: last 3 vs previous 3 assessments
  const recent = allScores.slice(-3);
  const older = allScores.slice(-6, -3);
  const recentAvg = recent.length ? recent.reduce((s, v) => s + v, 0) / recent.length : 0;
  const olderAvg = older.length ? older.reduce((s, v) => s + v, 0) / older.length : recentAvg;
  const trend = Math.round(recentAvg - olderAvg);

  // Overall performance index (weighted)
  const performanceIndex = calculatePerformanceIndex({ avgScore, hwAvg, attRate, hwCompletion });

  // ---------- AI-STYLE RECOMMENDATIONS ----------
  const recommendations: string[] = [];
  if (weaknesses.length > 0) {
    recommendations.push(
      `ركّز على مراجعة: ${weaknesses.map((w) => w.topic).join("، ")} — ولّد امتحاناً مخصصاً من بنك الأسئلة على هذه المواضيع.`
    );
  }
  if (attRate !== null && attRate < 85) recommendations.push("نسبة الحضور أقل من المستهدف — الانتظام في الحصص المباشرة يرفع الدرجات بنسبة ملحوظة.");
  if (hwCompletion < 80) recommendations.push("هناك واجبات لم تُسلَّم — إنجاز الواجبات يثبت القواعد في الذاكرة طويلة المدى.");
  if (trend < 0) recommendations.push("الأداء في آخر اختبارات أقل من السابق — راجع الشروحات المرفقة مع كل سؤال خاطئ.");
  if (trend > 5) recommendations.push("أداؤك في تحسّن مستمر 📈 — حافظ على نفس معدل المذاكرة اليومي!");
  if (strengths.length > 0) recommendations.push(`نقاط قوتك الواضحة: ${strengths.map((s) => s.topic).join("، ")} — استثمرها في حل أسئلة أصعب.`);
  if (recommendations.length === 0) recommendations.push("ابدأ بحل امتحان من بنك الأسئلة الذكي ليتم بناء تحليل دقيق لمستواك.");

  return {
    student: student ? {
      id: student.id,
      name: student.name,
      grade: student.grade,
      points: scope ? null : student.points,
      streak: scope ? null : student.streak,
      level: scope ? null : student.level,
    } : null,
    kpis: {
      avgScore,
      hwAvg,
      hwCompletion,
      attRate,
      performanceIndex,
      trend,
      totalExams: attempts.length + quizSubs.length,
      totalHomework: relevantHwSubs.length,
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
  const reportedAttendance = classRows
    .map((row) => row.attRate)
    .filter((rate): rate is number => rate !== null);
  const classAtt = reportedAttendance.length
    ? Math.round(reportedAttendance.reduce((sum, rate) => sum + rate, 0) / reportedAttendance.length)
    : null;

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
      const teacherEnrollmentRows = await db
        .select({
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          status: enrollments.status,
          teacherId: courses.teacherId,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        // Enforce the target account's current role in SQL as well as the enrollment scope.
        // A malformed legacy enrollment must never authorize a report for a teacher/admin account.
        .innerJoin(users, eq(enrollments.studentId, users.id))
        .where(and(
          eq(courses.teacherId, ctx.user.id),
          eq(users.role, "student"),
        ));
      const teacherStudentIds = getTeacherAnalyticsStudentIds(teacherEnrollmentRows, ctx.user.id);

      if (requestedStudent) {
        const allowed = canAccessStudentAnalytics({
          role,
          requesterId: ctx.user.id,
          studentId: requestedStudent,
          teacherStudentIds,
        });
        if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const allowedCourseIds = getTeacherAnalyticsCourseIds(teacherEnrollmentRows, ctx.user.id, requestedStudent);
        const report = await buildStudentReport(requestedStudent, {
          teacherId: ctx.user.id,
          allowedCourseIds,
        });
        if (!report.student || report.student.id === undefined) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        return NextResponse.json({ scope: "student", ...report });
      }

      // Filter the roster in SQL; do not load every student account into application memory.
      const visibleStudents = teacherStudentIds.length === 0
        ? []
        : await db
            .select({ id: users.id, name: users.name, grade: users.grade })
            .from(users)
            .where(and(eq(users.role, "student"), inArray(users.id, teacherStudentIds)));
      const reports = await Promise.all(visibleStudents.map((student) => buildStudentReport(student.id, {
        teacherId: ctx.user.id,
        allowedCourseIds: getTeacherAnalyticsCourseIds(teacherEnrollmentRows, ctx.user.id, student.id),
      })));

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

      // Aggregate only the course-scoped topic data returned by each report.
      const topicAgg: Record<string, { correct: number; total: number }> = {};
      for (const report of reports) {
        for (const topic of report.topicMastery) {
          if (!topicAgg[topic.topic]) topicAgg[topic.topic] = { correct: 0, total: 0 };
          topicAgg[topic.topic].correct += topic.correct;
          topicAgg[topic.topic].total += topic.total;
        }
      }
      const classTopics = Object.entries(topicAgg)
        .map(([topic, stats]) => ({ topic, mastery: Math.round((stats.correct / (stats.total || 1)) * 100), total: stats.total }))
        .sort((a, b) => a.mastery - b.mastery);

      const classAvg = classRows.length
        ? Math.round(classRows.reduce((sum, row) => sum + row.avgScore, 0) / classRows.length)
        : 0;
      const reportedAttendance = classRows
        .map((row) => row.attRate)
        .filter((rate): rate is number => rate !== null);
      const classAtt = reportedAttendance.length
        ? Math.round(reportedAttendance.reduce((sum, rate) => sum + rate, 0) / reportedAttendance.length)
        : null;

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

    // ---------- PARENT: linked student report ----------
    if (role === "parent") {
      // Only admin-verified links may authorize parent-facing student reports.
      // Existing legacy links without verification metadata fail closed.
      const links = await db
        .select({
          studentId: parentLinks.studentId,
          studentRole: users.role,
          verifiedAt: parentLinks.verifiedAt,
          verifiedBy: parentLinks.verifiedBy,
          verifiedByRole: verifiedByUser.role,
        })
        .from(parentLinks)
        .innerJoin(users, eq(parentLinks.studentId, users.id))
        .innerJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
        .where(and(
          eq(parentLinks.parentId, ctx.user.id),
          eq(users.role, "student"),
          eq(verifiedByUser.role, "admin"),
          isNotNull(parentLinks.verifiedAt),
          isNotNull(parentLinks.verifiedBy),
        ));
      const linkedParentStudentIds = getVerifiedParentAnalyticsStudentIds(links);
      const resolution = resolveParentAnalyticsStudentId(requestedStudent, linkedParentStudentIds);

      if (!resolution.ok) {
        if (resolution.reason === "no-linked-student") {
          return NextResponse.json({ error: "No linked student" }, { status: 404 });
        }
        if (resolution.reason === "student-id-required") {
          return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
        }
        if (resolution.reason === "invalid-links") {
          return NextResponse.json({ error: "Unable to verify linked student" }, { status: 403 });
        }
        if (resolution.reason === "invalid-student-id") {
          return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
        }
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const studentId = resolution.studentId;
      // Keep the role policy as a second authorization check after selection.
      const allowed = canAccessStudentAnalytics({
        role,
        requesterId: ctx.user.id,
        studentId,
        linkedParentStudentIds,
      });
      if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const report = await buildStudentReport(studentId);
      if (!report.student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
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
