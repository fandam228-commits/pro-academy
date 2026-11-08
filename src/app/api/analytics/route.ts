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
import { and, eq, exists, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { canAccessStudentAnalytics } from "@/lib/analytics-authorization.mjs";
import { attendanceRate, calculatePerformanceIndex, homeworkCompletion } from "@/lib/analytics-metrics.mjs";
import {
  getTeacherAnalyticsStudentIds,
  getTeacherAnalyticsCourseIds,
  isHomeworkGradeVisibleToStudent,
  resolveParentAnalyticsStudentId,
  getParentAnalyticsSelectionData,
} from "@/lib/analytics-report-scope.mjs";
import { buildVerifiedParentLinkPredicate } from "@/lib/parent-report-authorization.mjs";

const verifiedByUser = alias(users, "verified_by_user");
const parentAccount = alias(users, "parent_account");
const analyticsVerifiedStudent = alias(users, "analytics_verified_student");
const analyticsTeacherAccount = alias(users, "analytics_teacher_account");
const analyticsTeacherStudent = alias(users, "analytics_teacher_student");

async function getCurrentTeacherCourseScopes(teacherId: string, studentIds: string[]) {
  const uniqueStudentIds = [...new Set(studentIds)];
  const scopes = new Map<string, string[]>();
  for (const studentId of uniqueStudentIds) scopes.set(studentId, []);

  if (uniqueStudentIds.length === 0) return scopes;

  // Use inner joins so only rows backed by a current teacher account, current
  // course owner, eligible enrollment, and current student account can enter
  // the final response scope. All predicates are evaluated in one SQL snapshot.
  const rows = await db
    .select({
      studentId: analyticsTeacherStudent.id,
      courseId: courses.id,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(analyticsTeacherStudent, and(
      eq(enrollments.studentId, analyticsTeacherStudent.id),
      eq(analyticsTeacherStudent.role, "student"),
    ))
    .innerJoin(analyticsTeacherAccount, and(
      eq(courses.teacherId, analyticsTeacherAccount.id),
      eq(analyticsTeacherAccount.id, teacherId),
      eq(analyticsTeacherAccount.role, "teacher"),
    ))
    .where(and(
      inArray(enrollments.studentId, uniqueStudentIds),
      inArray(enrollments.status, ["active", "completed"]),
    ));

  for (const row of rows) {
    const courseIds = scopes.get(row.studentId);
    if (courseIds && !courseIds.includes(row.courseId)) courseIds.push(row.courseId);
  }
  return scopes;
}
function retainsCurrentTeacherCourseScope(expectedCourseIds: string[], currentCourseIds: string[]) {
  return expectedCourseIds.length > 0 &&
    expectedCourseIds.every((courseId) => currentCourseIds.includes(courseId));
}

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
    ? scope.allowedCourseIds.length === 0
      ? []
      : await db
          .select({
            id: users.id,
            name: users.name,
            grade: users.grade,
          })
          .from(users)
          .innerJoin(enrollments, eq(enrollments.studentId, users.id))
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(and(
            eq(users.id, studentId),
            eq(users.role, "student"),
            eq(courses.teacherId, scope.teacherId),
            inArray(enrollments.courseId, scope.allowedCourseIds),
            inArray(enrollments.status, ["active", "completed"]),
          ))
          .limit(1)
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
        .where(and(eq(users.id, studentId), eq(users.role, "student")));
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
          .innerJoin(courses, eq(quizzes.courseId, courses.id))
          .where(and(
            eq(quizSubmissions.studentId, studentId),
            eq(courses.teacherId, scope.teacherId),
            inArray(quizzes.courseId, scope.allowedCourseIds),
            // Recheck the target account's current role for every data read; the
            // earlier roster/profile lookup can become stale during a request.
            exists(db
              .select({ id: users.id })
              .from(users)
              .where(and(
                eq(users.id, quizSubmissions.studentId),
                eq(users.role, "student"),
              ))),
            exists(db
              .select({ id: enrollments.id })
              .from(enrollments)
              .where(and(
                eq(enrollments.studentId, quizSubmissions.studentId),
                eq(enrollments.courseId, quizzes.courseId),
                inArray(enrollments.status, ["active", "completed"]),
              ))),
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
          .innerJoin(courses, eq(homework.courseId, courses.id))
          .where(and(
            eq(homework.teacherId, scope.teacherId),
            eq(courses.teacherId, scope.teacherId),
            inArray(homework.courseId, scope.allowedCourseIds),
            exists(db
              .select({ id: users.id })
              .from(users)
              .where(and(
                eq(users.id, studentId),
                eq(users.role, "student"),
              ))),
            exists(db
              .select({ id: enrollments.id })
              .from(enrollments)
              .where(and(
                eq(enrollments.studentId, studentId),
                eq(enrollments.courseId, homework.courseId),
                inArray(enrollments.status, ["active", "completed"]),
              ))),
          ))
    : await db.select({
        id: homework.id,
        courseId: homework.courseId,
        grade: homework.grade,
        totalPoints: homework.totalPoints,
      }).from(homework);

  const visibleHomeworkIds = new Set(visibleHomework
    .filter((item) => isHomeworkGradeVisibleToStudent(item.grade, student?.grade))
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
          .innerJoin(homework, eq(homeworkSubmissions.homeworkId, homework.id))
          .innerJoin(courses, eq(homework.courseId, courses.id))
          .where(and(
            eq(homeworkSubmissions.studentId, studentId),
            eq(homework.teacherId, scope.teacherId),
            eq(courses.teacherId, scope.teacherId),
            inArray(homeworkSubmissions.homeworkId, [...visibleHomeworkIds]),
            exists(db
              .select({ id: users.id })
              .from(users)
              .where(and(
                eq(users.id, homeworkSubmissions.studentId),
                eq(users.role, "student"),
              ))),
            exists(db
              .select({ id: enrollments.id })
              .from(enrollments)
              .where(and(
                eq(enrollments.studentId, homeworkSubmissions.studentId),
                eq(enrollments.courseId, homework.courseId),
                inArray(enrollments.status, ["active", "completed"]),
              ))),
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
          .select({ courseId: enrollments.courseId })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(and(
            eq(enrollments.studentId, studentId),
            eq(courses.teacherId, scope.teacherId),
            inArray(enrollments.courseId, scope.allowedCourseIds),
            inArray(enrollments.status, ["active", "completed"]),
            exists(db
              .select({ id: users.id })
              .from(users)
              .where(and(
                eq(users.id, studentId),
                eq(users.role, "student"),
              ))),
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
    (h) => isHomeworkGradeVisibleToStudent(h.grade, student?.grade) && (!h.courseId || enrolledCourseIds.has(h.courseId))
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
  // Authenticate and validate the role before database setup or migration work.
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = ctx.user.role as string;
  if (!["admin", "teacher", "parent", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const requestedStudent = searchParams.get("studentId");

  try {
    // ---------- ADMIN: unrestricted analytics ----------
    if (role === "admin") {
      if (requestedStudent) {
        const report = await buildStudentReport(requestedStudent);
        if (!report.student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        return NextResponse.json({ scope: "student", ...report });
      }

      const students = await db.select({ id: users.id }).from(users).where(eq(users.role, "student"));
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
          inArray(enrollments.status, ["active", "completed"]),
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

        // Revalidate the teacher role, student role, course ownership, and eligible
        // enrollment after all report reads. A scope revoked while queries are running
        // must never authorize a response built from the earlier allowlist.
        const currentTeacherScopes = await getCurrentTeacherCourseScopes(ctx.user.id, [requestedStudent]);
        const currentCourseIds = currentTeacherScopes?.get(requestedStudent) ?? [];
        if (!retainsCurrentTeacherCourseScope(allowedCourseIds, currentCourseIds)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (!report.student || report.student.id === undefined) return NextResponse.json({ error: "Student not found" }, { status: 404 });
        return NextResponse.json({ scope: "student", ...report });
      }

      // Filter the roster in SQL; do not load every student account into application memory.
      // Revalidate current course ownership and enrollment status at roster-read time;
      // the earlier allowlist is only a preliminary gate and may become stale.
      const visibleStudentRows = teacherStudentIds.length === 0
        ? []
        : await db
            .select({ id: users.id, name: users.name, grade: users.grade })
            .from(users)
            .innerJoin(enrollments, eq(enrollments.studentId, users.id))
            .innerJoin(courses, eq(enrollments.courseId, courses.id))
            .where(and(
              eq(users.role, "student"),
              inArray(users.id, teacherStudentIds),
              eq(courses.teacherId, ctx.user.id),
              inArray(enrollments.status, ["active", "completed"]),
            ));
      const visibleStudents = [...new Map(visibleStudentRows.map((student) => [student.id, student])).values()];
      const reports = await Promise.all(visibleStudents.map((student) => buildStudentReport(student.id, {
        teacherId: ctx.user.id,
        allowedCourseIds: getTeacherAnalyticsCourseIds(teacherEnrollmentRows, ctx.user.id, student.id),
      })));

      // Class aggregates are sensitive too: fail the whole response if any student
      // loses an eligible enrollment, course ownership, or current student role while
      // reports are being assembled, or if the requester is no longer a teacher.
      const currentTeacherScopes = await getCurrentTeacherCourseScopes(
        ctx.user.id,
        visibleStudents.map((student) => student.id),
      );
      if (
        visibleStudents.some((student) => !retainsCurrentTeacherCourseScope(
          getTeacherAnalyticsCourseIds(teacherEnrollmentRows, ctx.user.id, student.id),
          currentTeacherScopes.get(student.id) ?? [],
        ))
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

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
      // Read all current student links and verifier roles in one statement. The
      // ambiguity set and verified authorization set therefore share one database
      // snapshot; separate reads could race with a newly inserted legacy link.
      const parentLinkRows = await db
        .select({
          studentId: parentLinks.studentId,
          verifiedAt: parentLinks.verifiedAt,
          verifiedBy: parentLinks.verifiedBy,
          verifierRole: verifiedByUser.role,
        })
        .from(parentLinks)
        .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
        .innerJoin(users, eq(parentLinks.studentId, users.id))
        .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
        .where(and(
          eq(parentLinks.parentId, ctx.user.id),
          // Revalidate the parent and student accounts in the database; stale
          // session roles or malformed legacy relationships must fail closed.
          eq(parentAccount.role, "parent"),
          eq(users.role, "student"),
        ));
      const {
        allLinkedStudentIds,
        verifiedStudentIds: linkedParentStudentIds,
      } = getParentAnalyticsSelectionData(parentLinkRows);
      if (!requestedStudent && linkedParentStudentIds.length === 0) {
        return NextResponse.json({ error: "No linked student" }, { status: 404 });
      }
      if (!requestedStudent && linkedParentStudentIds.length > 0 && allLinkedStudentIds.length > 1) {
        return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
      }
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

      // A parent link may be revoked or an account role changed while the report
      // queries are running. Revalidate the complete relationship immediately
      // before returning any student data; the shared predicate is also covered
      // by the PostgreSQL weekly-report authorization integration suite.
      const parentAccessStillValid = await db
        .select({ id: users.id })
        .from(users)
        .where(and(
          eq(users.id, studentId),
          eq(users.role, "student"),
          buildVerifiedParentLinkPredicate({
            db,
            parentLinks,
            parentAccount,
            studentAccount: analyticsVerifiedStudent,
            verifiedByUser,
            parentId: ctx.user.id,
            studentId,
          }),
        ))
        .limit(1);
      if (parentAccessStillValid.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

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
