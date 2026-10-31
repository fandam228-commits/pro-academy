import { db } from "@/db";
import { users, parentLinks, attendanceRecords, homeworkSubmissions, homework, quizSubmissions, enrollments, courses } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getVerifiedParentAnalyticsStudentIds, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

const parentAccount = alias(users, "parent_reports_parent_account");
const linkedStudentAccount = alias(users, "parent_reports_student_account");
const verifierAccount = alias(users, "parent_reports_verifier_account");

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
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = ctx.user.role as string;
  if (!["admin", "teacher", "parent", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // This endpoint aggregates attendance and assessment data that is not all course-scoped.
  // Fail closed for teachers until every data source can be proven to belong to their courses.
  if (role === "teacher") {
    return NextResponse.json({ error: "Use course-scoped Analytics; generic reports are not available to teachers." }, { status: 403 });
  }
  await ensureDbSetup();

  const { searchParams } = new URL(req.url);
  let studentId = searchParams.get("studentId");

  try {
    // Parent: find linked student
    if (ctx.user.role === "parent") {
      // Only an admin-verified link to a current student may authorize a report.
      const links = await db
        .select({
          studentId: parentLinks.studentId,
          verifiedAt: parentLinks.verifiedAt,
          verifiedBy: parentLinks.verifiedBy,
        })
        .from(parentLinks)
        .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
        .innerJoin(linkedStudentAccount, eq(parentLinks.studentId, linkedStudentAccount.id))
        .innerJoin(verifierAccount, eq(parentLinks.verifiedBy, verifierAccount.id))
        .where(and(
          eq(parentLinks.parentId, ctx.user.id),
          eq(parentAccount.role, "parent"),
          eq(linkedStudentAccount.role, "student"),
          eq(verifierAccount.role, "admin"),
          isNotNull(parentLinks.verifiedAt),
          isNotNull(parentLinks.verifiedBy),
        ));
      const verifiedStudentIds = getVerifiedParentAnalyticsStudentIds(links);
      const resolution = resolveParentAnalyticsStudentId(studentId, verifiedStudentIds);
      if (!resolution.ok) {
        const status = resolution.reason === "no-linked-student" ? 404
          : resolution.reason === "student-id-required" || resolution.reason === "invalid-student-id" ? 400
          : 403;
        const error = resolution.reason === "no-linked-student" ? "No verified linked student"
          : resolution.reason === "student-id-required" ? "studentId is required when multiple verified students are linked"
          : resolution.reason === "invalid-student-id" ? "Invalid studentId"
          : "Forbidden";
        return NextResponse.json({ error }, { status });
      }
      studentId = resolution.studentId;
    } else if (ctx.user.role === "student") {
      studentId = ctx.user.id;
    }

    if (ctx.user.role !== "admin" && ctx.user.role !== "teacher" && ctx.user.role !== "parent" && ctx.user.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!studentId) {
      return NextResponse.json({ error: "No student specified" }, { status: 400 });
    }

    if (ctx.user.role === "parent") {
      const links = await db.select().from(parentLinks).where(eq(parentLinks.parentId, ctx.user.id));
      if (!links.some((l) => l.studentId === studentId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (ctx.user.role === "student" && studentId !== ctx.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const stList = await db.select().from(users).where(eq(users.id, studentId));
    if (stList.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    const student = stList[0];

    const week = getWeekRange();

    // 1. Attendance this week
    const allAttendance = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
    const weekAttendance = allAttendance.filter((a) => a.sessionDate >= week.start && a.sessionDate <= week.end);
    const totalAttendance = allAttendance.length;
    const weekPresent = weekAttendance.filter((a) => a.status === "present").length;
    const weekLate = weekAttendance.filter((a) => a.status === "late").length;
    const weekAbsent = weekAttendance.filter((a) => a.status === "absent").length;
    const overallRate = totalAttendance > 0
      ? Math.round(((allAttendance.filter((a) => a.status === "present").length + allAttendance.filter((a) => a.status === "late").length * 0.7) / totalAttendance) * 100)
      : 100;

    // 2. Homework this week
    const allHwSubs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.studentId, studentId));
    const weekHwSubs = allHwSubs.filter((s) => new Date(s.submittedAt) >= week.startDate && new Date(s.submittedAt) <= week.endDate);
    const gradedHw = weekHwSubs.filter((s) => s.status === "graded");
    const avgHwScore = gradedHw.length > 0
      ? Math.round(gradedHw.reduce((sum, s) => sum + (s.score || 0), 0) / gradedHw.length)
      : null;

    // 3. Quiz/Exam submissions this week
    const allQuizSubs = await db.select().from(quizSubmissions).where(eq(quizSubmissions.studentId, studentId));
    const weekQuizSubs = allQuizSubs.filter((s) => new Date(s.submittedAt) >= week.startDate && new Date(s.submittedAt) <= week.endDate);
    const avgQuizScore = weekQuizSubs.length > 0
      ? Math.round(weekQuizSubs.reduce((sum, s) => sum + s.percentage, 0) / weekQuizSubs.length)
      : null;

    // 4. Overall stats
    const allEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
    const allCourses = await db.select().from(courses);
    const enrolledCourses = allCourses.filter((c) => allEnrollments.some((e) => e.courseId === c.id));

    // 5. Streak & Points
    const streak = student.streak || 0;
    const points = student.points || 0;
    const level = student.level || "Intermediate";

    // 6. Strengths & Weaknesses (simulated analysis based on data)
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (overallRate >= 90) strengths.push("التزام عالي بالحضور والمواظبة");
    else if (overallRate < 75) weaknesses.push("نسبة الحضور منخفضة — يحتاج متابعة");

    if (streak >= 7) strengths.push(`تتابع دراسي ممتاز: ${streak} يوم متواصل`);
    else weaknesses.push("التتابع الدراسي ضعيف — يحتاج تحفيز يومي");

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
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
