import { db } from "@/db";
import { users, parentLinks, attendanceRecords, homeworkSubmissions, homework, quizSubmissions, quizzes, enrollments, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { resolveStudentDataAccess } from "@/lib/student-data-access.mjs";
import { calculateOverallAttendanceRate } from "@/lib/report-metrics.mjs";
import { scopeTeacherWeeklyReportData } from "@/lib/teacher-report-scope.mjs";

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
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const requestedStudentId = searchParams.get("studentId");
  const role = ctx.user.role as string;

  try {
    if (!["admin", "teacher", "parent", "student"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let linkedParentStudentIds: string[] = [];
    let teacherStudentIds: string[] = [];
    let teacherCourseIds: string[] = [];

    if (role === "parent") {
      const links = await db
        .select({ studentId: parentLinks.studentId })
        .from(parentLinks)
        .where(eq(parentLinks.parentId, ctx.user.id));
      linkedParentStudentIds = links.map((link) => link.studentId);
    }

    if (role === "teacher") {
      const teacherEnrollments = await db
        .select({ studentId: enrollments.studentId, courseId: enrollments.courseId })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(courses.teacherId, ctx.user.id));
      teacherStudentIds = [...new Set(teacherEnrollments.map((row) => row.studentId))];
      teacherCourseIds = [...new Set(teacherEnrollments.map((row) => row.courseId))];
    }

    const access = resolveStudentDataAccess({
      role,
      requesterId: ctx.user.id,
      requestedStudentId,
      linkedParentStudentIds,
      teacherStudentIds,
    });

    if (!access.allowed) {
      if (access.reason === "no_linked_student") {
        return NextResponse.json({ error: "No linked student" }, { status: 404 });
      }
      if (access.reason === "student_required") {
        return NextResponse.json({ error: "studentId is required" }, { status: 400 });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = access.studentId;
    if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

    const stList = await db.select().from(users).where(eq(users.id, studentId));
    if (stList.length === 0 || stList[0].role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const student = stList[0];

    const week = getWeekRange();

    // 1. Attendance this week
    let allAttendance = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
    let allHwSubs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.studentId, studentId));
    let allQuizSubs = await db.select().from(quizSubmissions).where(eq(quizSubmissions.studentId, studentId));
    let allEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
    const allCourses = await db.select().from(courses);
    let enrolledCourses = allCourses.filter((c) => allEnrollments.some((e) => e.courseId === c.id));

    if (role === "teacher") {
      // Attendance records have no courseId, so only rows explicitly marked by
      // this teacher can be attributed safely. Generated exams are not part of
      // this weekly report; course-scoped quiz results are filtered below.
      const [allHomeworkRows, allQuizRows] = await Promise.all([
        db.select().from(homework),
        db.select().from(quizzes),
      ]);
      const scoped = scopeTeacherWeeklyReportData({
        teacherId: ctx.user.id,
        teacherCourseIds,
        attendanceRecords: allAttendance,
        homeworkRows: allHomeworkRows,
        homeworkSubmissions: allHwSubs,
        quizzes: allQuizRows,
        quizSubmissions: allQuizSubs,
        enrollments: allEnrollments,
        courses: allCourses,
      });
      allAttendance = scoped.attendanceRecords;
      allHwSubs = scoped.homeworkSubmissions;
      allQuizSubs = scoped.quizSubmissions;
      allEnrollments = scoped.enrollments;
      enrolledCourses = scoped.enrolledCourses;
    }

    const weekAttendance = allAttendance.filter((a) => a.sessionDate >= week.start && a.sessionDate <= week.end);
    const totalAttendance = allAttendance.length;
    const weekPresent = weekAttendance.filter((a) => a.status === "present").length;
    const weekLate = weekAttendance.filter((a) => a.status === "late").length;
    const weekAbsent = weekAttendance.filter((a) => a.status === "absent").length;
    const overallRate = calculateOverallAttendanceRate(allAttendance);

    // 2. Homework this week
    const weekHwSubs = allHwSubs.filter((s) => new Date(s.submittedAt) >= week.startDate && new Date(s.submittedAt) <= week.endDate);
    const gradedHw = weekHwSubs.filter((s) => s.status === "graded");
    const avgHwScore = gradedHw.length > 0
      ? Math.round(gradedHw.reduce((sum, s) => sum + (s.score || 0), 0) / gradedHw.length)
      : null;

    // 3. Quiz/Exam submissions this week
    const weekQuizSubs = allQuizSubs.filter((s) => new Date(s.submittedAt) >= week.startDate && new Date(s.submittedAt) <= week.endDate);
    const avgQuizScore = weekQuizSubs.length > 0
      ? Math.round(weekQuizSubs.reduce((sum, s) => sum + s.percentage, 0) / weekQuizSubs.length)
      : null;

    // 5. Streak & Points
    const streak = student.streak || 0;
    const points = student.points || 0;
    const level = student.level || "Intermediate";

    // 6. Strengths & Weaknesses (simulated analysis based on data)
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (overallRate !== null && overallRate >= 90) strengths.push("التزام عالي بالحضور والمواظبة");
    else if (overallRate !== null && overallRate < 75) weaknesses.push("نسبة الحضور منخفضة — يحتاج متابعة");

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
