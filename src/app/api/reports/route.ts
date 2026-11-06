import { db } from "@/db";
import { users, parentLinks, attendanceRecords, homeworkSubmissions, homework, quizSubmissions, quizzes, enrollments, courses } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getParentAnalyticsSelectionData, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";

const verifiedByUser = alias(users, "reports_verified_by_user");
const parentAccount = alias(users, "reports_parent_account");

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return {
    start: startOfWeek.toISOString().split("T")[0],
    end: endOfWeek.toISOString().split("T")[0],
    startDate: startOfWeek,
    endDate: endOfWeek,
  };
}

export async function GET(req: Request) {
  // Authenticate and authorize the role before database setup work.
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = ctx.user.role as string;
  if (!["admin", "teacher", "parent", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  let studentId = searchParams.get("studentId");
  let teacherCourseIds: string[] | null = null;

  try {
    if (role === "parent") {
      // Include verified and unverified current links in one query. Unverified
      // links never authorize access, but they still make a multi-child account
      // ambiguous and therefore require an explicit studentId.
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
          eq(parentAccount.role, "parent"),
          eq(users.role, "student"),
        ));
      const { allLinkedStudentIds, verifiedStudentIds } = getParentAnalyticsSelectionData(parentLinkRows);
      if (!studentId && verifiedStudentIds.length === 0) {
        return NextResponse.json({ error: "No verified linked student" }, { status: 404 });
      }
      if (!studentId && allLinkedStudentIds.length > 1) {
        return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
      }
      const resolution = resolveParentAnalyticsStudentId(studentId, verifiedStudentIds);
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
      studentId = resolution.studentId;    } else if (role === "student") {
      // Students may read only their own report. Reject a forged target ID
      // explicitly instead of silently accepting a cross-student selector.
      if (studentId && studentId !== ctx.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      studentId = ctx.user.id;
    }

    if (!studentId) {
      return NextResponse.json({ error: "No student specified" }, { status: 400 });
    }

    if (role === "teacher") {
      const ownedEnrollments = await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .innerJoin(users, eq(enrollments.studentId, users.id))
        .where(and(
          eq(enrollments.studentId, studentId),
          eq(users.role, "student"),
          eq(courses.teacherId, ctx.user.id),
          inArray(enrollments.status, ["active", "completed"]),
        ));
      teacherCourseIds = [...new Set(ownedEnrollments.map((row) => row.courseId))];
      if (teacherCourseIds.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const stList = await db
      .select({
        id: users.id,
        name: users.name,
        grade: users.grade,
        level: users.level,
        streak: users.streak,
        points: users.points,
      })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, "student")));
    if (stList.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    const student = stList[0];

    const week = getWeekRange();

    // 1. Attendance this week
    // Attendance rows have no course ownership key; omit them from teacher reports rather than leaking cross-course data.
    const allAttendance = role === "teacher" ? [] : await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
    const weekAttendance = allAttendance.filter((a) => a.sessionDate >= week.start && a.sessionDate <= week.end);
    const totalAttendance = allAttendance.length;
    const weekPresent = weekAttendance.filter((a) => a.status === "present").length;
    const weekLate = weekAttendance.filter((a) => a.status === "late").length;
    const weekAbsent = weekAttendance.filter((a) => a.status === "absent").length;
    const overallRate = role === "teacher" ? null : totalAttendance > 0
      ? Math.round(((allAttendance.filter((a) => a.status === "present").length + allAttendance.filter((a) => a.status === "late").length * 0.7) / totalAttendance) * 100)
      : 100;

    // 2. Homework this week
    const visibleHomeworkIds = role === "teacher"
      ? (await db.select({ id: homework.id })
          .from(homework)
          .innerJoin(courses, eq(homework.courseId, courses.id))
          .where(and(
            eq(homework.teacherId, ctx.user.id),
            eq(courses.teacherId, ctx.user.id),
            inArray(homework.courseId, teacherCourseIds ?? []),
          ))).map((row) => row.id)
      : null;
    const allHwSubs = role === "teacher"
      ? visibleHomeworkIds!.length === 0
        ? []
        : await db
            .select({
              submittedAt: homeworkSubmissions.submittedAt,
              score: homeworkSubmissions.score,
              status: homeworkSubmissions.status,
            })
            .from(homeworkSubmissions)
            .innerJoin(homework, eq(homeworkSubmissions.homeworkId, homework.id))
            .innerJoin(courses, eq(homework.courseId, courses.id))
            .innerJoin(enrollments, and(
              eq(enrollments.studentId, homeworkSubmissions.studentId),
              eq(enrollments.courseId, homework.courseId),
            ))
            .where(and(
              eq(homeworkSubmissions.studentId, studentId),
              eq(homework.teacherId, ctx.user.id),
              eq(courses.teacherId, ctx.user.id),
              inArray(enrollments.status, ["active", "completed"]),
              inArray(homeworkSubmissions.homeworkId, visibleHomeworkIds!),
            ))
      : await db
          .select({
            submittedAt: homeworkSubmissions.submittedAt,
            score: homeworkSubmissions.score,
            status: homeworkSubmissions.status,
          })
          .from(homeworkSubmissions)
          .where(eq(homeworkSubmissions.studentId, studentId));
    const weekHwSubs = allHwSubs.filter((s) => new Date(s.submittedAt) >= week.startDate && new Date(s.submittedAt) <= week.endDate);
    const gradedHw = weekHwSubs.filter((s) => s.status === "graded");
    const avgHwScore = gradedHw.length > 0
      ? Math.round(gradedHw.reduce((sum, s) => sum + (s.score || 0), 0) / gradedHw.length)
      : null;

    // 3. Quiz/Exam submissions this week
    const visibleQuizIds = role === "teacher"
      ? (await db.select({ id: quizzes.id })
          .from(quizzes)
          .innerJoin(courses, eq(quizzes.courseId, courses.id))
          .where(and(
            eq(courses.teacherId, ctx.user.id),
            inArray(quizzes.courseId, teacherCourseIds ?? []),
          ))).map((row) => row.id)
      : null;
    const allQuizSubs = role === "teacher"
      ? visibleQuizIds!.length === 0
        ? []
        : await db
            .select({
              submittedAt: quizSubmissions.submittedAt,
              percentage: quizSubmissions.percentage,
            })
            .from(quizSubmissions)
            .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
            .innerJoin(courses, eq(quizzes.courseId, courses.id))
            .innerJoin(enrollments, and(
              eq(enrollments.studentId, quizSubmissions.studentId),
              eq(enrollments.courseId, quizzes.courseId),
            ))
            .where(and(
              eq(quizSubmissions.studentId, studentId),
              eq(courses.teacherId, ctx.user.id),
              inArray(enrollments.status, ["active", "completed"]),
              inArray(quizSubmissions.quizId, visibleQuizIds!),
            ))
      : await db
          .select({
            submittedAt: quizSubmissions.submittedAt,
            percentage: quizSubmissions.percentage,
          })
          .from(quizSubmissions)
          .where(eq(quizSubmissions.studentId, studentId));
    const weekQuizSubs = allQuizSubs.filter((s) => new Date(s.submittedAt) >= week.startDate && new Date(s.submittedAt) <= week.endDate);
    const avgQuizScore = weekQuizSubs.length > 0
      ? Math.round(weekQuizSubs.reduce((sum, s) => sum + s.percentage, 0) / weekQuizSubs.length)
      : null;

    // 4. Overall stats
    const allEnrollments = role === "teacher"
      ? await db
          .select({ courseId: enrollments.courseId })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .where(and(
            eq(enrollments.studentId, studentId),
            eq(courses.teacherId, ctx.user.id),
            inArray(enrollments.courseId, teacherCourseIds ?? []),
            inArray(enrollments.status, ["active", "completed"]),
          ))
      : await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
    const allCourses = role === "teacher"
      ? (teacherCourseIds?.length
          ? await db.select().from(courses).where(and(
              eq(courses.teacherId, ctx.user.id),
              inArray(courses.id, teacherCourseIds),
            ))
          : [])
      : await db.select().from(courses);
    const enrolledCourses = allCourses.filter((course) => allEnrollments.some((enrollment) => enrollment.courseId === course.id));

    // 5. Streak & Points
    // Global gamification values are not course-scoped, so do not expose them to teachers.
    const streak = role === "teacher" ? null : (student.streak || 0);
    const points = role === "teacher" ? null : (student.points || 0);
    const level = role === "teacher" ? null : (student.level || "Intermediate");

    // 6. Strengths & Weaknesses (simulated analysis based on data)
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (overallRate !== null && overallRate >= 90) strengths.push("التزام عالي بالحضور والمواظبة");
    else if (overallRate !== null && overallRate < 75) weaknesses.push("نسبة الحضور منخفضة — يحتاج متابعة");

    // Teacher reports deliberately omit global streak data; do not compare null with a number.
    if (streak !== null) {
      if (streak >= 7) strengths.push(`تتابع دراسي ممتاز: ${streak} يوم متواصل`);
      else weaknesses.push("التتابع الدراسي ضعيف — يحتاج تحفيز يومي");
    }

    if (avgQuizScore !== null && avgQuizScore >= 80) strengths.push(`أداء امتحانات متميز: ${avgQuizScore}%`);
    else if (avgQuizScore !== null && avgQuizScore < 60) weaknesses.push(`متوسط الامتحانات ضعيف: ${avgQuizScore}% — يحتاج مراجعة مكثفة`);

    if (weekHwSubs.length > 0) strengths.push(`أنجز ${weekHwSubs.length} واجب هذا الأسبوع`);
    else weaknesses.push("لم يسلم أي واجب هذا الأسبوع");

    if (strengths.length === 0) strengths.push("بداية جيدة — يحتاج مزيد من المشاركة الفعالة");
    if (weaknesses.length === 0) weaknesses.push("لا نقاط ضعف ملحوظة — استمر! 🎉");

    const report = {
      student: { id: student.id, name: student.name, grade: student.grade, level, streak, points },
      period: { start: week.start, end: week.end, label: `${week.start} → ${week.end}` },
      attendance: {
        weekSessions: weekAttendance.length,
        weekPresent,
        weekLate,
        weekAbsent,
        overallRate,
        totalSessions: totalAttendance,
      },
      homework: {
        weekSubmissions: weekHwSubs.length,
        weekGraded: gradedHw.length,
        avgScore: avgHwScore,
      },
      quizzes: {
        weekAttempts: weekQuizSubs.length,
        avgPercentage: avgQuizScore,
      },
      courses: {
        enrolledCount: enrolledCourses.length,
        courseNames: enrolledCourses.map((c) => c.title),
      },
      analysis: { strengths, weaknesses },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, report });
  } catch {
    console.error("Reports GET failed; details withheld.");
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
