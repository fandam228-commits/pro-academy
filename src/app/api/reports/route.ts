import { db } from "@/db";
import {
  users,
  parentLinks,
  attendanceRecords,
  homeworkSubmissions,
  homework,
  quizSubmissions,
  quizzes,
  enrollments,
  courses,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import {
  canAccessStudentReport,
  getTeacherStudentIds,
  getTeacherCourseIdsForStudent,
  isTeacherOwnedHomework,
  isTeacherCourseRecord,
} from "@/lib/student-report-authorization.mjs";

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

    let studentId: string | null = requestedStudentId;
    let teacherCourseIds: string[] = [];
    let linkedParentStudentIds: string[] = [];
    let teacherStudentIds: string[] = [];

    if (role === "student") {
      if (requestedStudentId && requestedStudentId !== ctx.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      studentId = ctx.user.id;
    }

    if (role === "parent") {
      const links = await db.select().from(parentLinks).where(eq(parentLinks.parentId, ctx.user.id));
      linkedParentStudentIds = links.map((link) => link.studentId);

      if (!studentId) {
        if (linkedParentStudentIds.length === 0) {
          return NextResponse.json({ error: "No linked student" }, { status: 404 });
        }
        if (linkedParentStudentIds.length > 1) {
          return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
        }
        studentId = linkedParentStudentIds[0];
      }

      if (!canAccessStudentReport({
        role,
        requesterId: ctx.user.id,
        studentId,
        linkedParentStudentIds,
      })) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (role === "teacher") {
      if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

      const teacherEnrollments = await db
        .select({
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          status: enrollments.status,
          teacherId: courses.teacherId,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(courses.teacherId, ctx.user.id));

      teacherStudentIds = getTeacherStudentIds(teacherEnrollments, ctx.user.id);
      if (!canAccessStudentReport({
        role,
        requesterId: ctx.user.id,
        studentId,
        teacherStudentIds,
      })) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      teacherCourseIds = getTeacherCourseIdsForStudent(teacherEnrollments, ctx.user.id, studentId);
    }

    if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });

    const studentRows = await db.select().from(users).where(eq(users.id, studentId));
    const student = studentRows[0];
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const week = getWeekRange();

    // Attendance records have no course or owner key in the current schema.
    // Do not expose unscoped attendance to a teacher until the data model can
    // prove which teacher/course owns each record.
    const allAttendance = role === "teacher"
      ? []
      : await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
    const weekAttendance = allAttendance.filter((a) => a.sessionDate >= week.start && a.sessionDate <= week.end);
    const totalAttendance = allAttendance.length;
    const weekPresent = weekAttendance.filter((a) => a.status === "present").length;
    const weekLate = weekAttendance.filter((a) => a.status === "late").length;
    const weekAbsent = weekAttendance.filter((a) => a.status === "absent").length;
    const overallRate = totalAttendance > 0
      ? Math.round((
          allAttendance.filter((a) => a.status === "present").length +
          allAttendance.filter((a) => a.status === "late").length * 0.7 +
          allAttendance.filter((a) => a.status === "excused").length * 0.85
        ) / totalAttendance * 100)
      : null;

    const allHwSubs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.studentId, studentId));
    const allHomework = await db.select().from(homework);
    const visibleHomework = role === "teacher"
      ? allHomework.filter((item) => isTeacherOwnedHomework(item, ctx.user.id, teacherCourseIds))
      : allHomework;
    const visibleHomeworkIds = new Set(visibleHomework.map((item) => item.id));
    const scopedHwSubs = allHwSubs.filter((submission) => visibleHomeworkIds.has(submission.homeworkId));
    const weekHwSubs = scopedHwSubs.filter(
      (submission) => new Date(submission.submittedAt) >= week.startDate && new Date(submission.submittedAt) <= week.endDate
    );
    const gradedHw = weekHwSubs.filter((submission) => submission.status === "graded");
    const avgHwScore = gradedHw.length > 0
      ? Math.round(gradedHw.reduce((sum, submission) => sum + (submission.score || 0), 0) / gradedHw.length)
      : null;

    const allQuizSubs = await db.select().from(quizSubmissions).where(eq(quizSubmissions.studentId, studentId));
    let visibleQuizSubs = allQuizSubs;
    if (role === "teacher") {
      const allQuizzes = await db.select().from(quizzes);
      const visibleQuizIds = new Set(
        allQuizzes.filter((quiz) => isTeacherCourseRecord(quiz, teacherCourseIds)).map((quiz) => quiz.id)
      );
      visibleQuizSubs = allQuizSubs.filter((submission) => visibleQuizIds.has(submission.quizId));
    }
    const weekQuizSubs = visibleQuizSubs.filter(
      (submission) => new Date(submission.submittedAt) >= week.startDate && new Date(submission.submittedAt) <= week.endDate
    );
    const avgQuizScore = weekQuizSubs.length > 0
      ? Math.round(weekQuizSubs.reduce((sum, submission) => sum + submission.percentage, 0) / weekQuizSubs.length)
      : null;

    const allEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
    const visibleEnrollments = role === "teacher"
      ? allEnrollments.filter((enrollment) => teacherCourseIds.includes(enrollment.courseId))
      : allEnrollments;
    const allCourses = await db.select().from(courses);
    const enrolledCourses = allCourses.filter((course) =>
      visibleEnrollments.some((enrollment) => enrollment.courseId === course.id)
    );

    // Global gamification values are not course-scoped; do not expose them in a
    // teacher's course-scoped report.
    const streak = student.streak || 0;
    const points = student.points || 0;
    const level = student.level || "Intermediate";
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (overallRate !== null) {
      if (overallRate >= 90) strengths.push("التزام عالي بالحضور والمواظبة");
      else if (overallRate < 75) weaknesses.push("نسبة الحضور منخفضة — يحتاج متابعة");
    }

    if (role !== "teacher") {
      if (streak >= 7) strengths.push(`تتابع دراسي ممتاز: ${streak} يوم متواصل`);
      else weaknesses.push("التتابع الدراسي ضعيف — يحتاج تحفيز يومي");
    }

    if (avgQuizScore !== null && avgQuizScore >= 80) strengths.push(`أداء امتحانات متميز: ${avgQuizScore}%`);
    else if (avgQuizScore !== null && avgQuizScore < 60) weaknesses.push(`متوسط الامتحانات ضعيف: ${avgQuizScore}% — يحتاج مراجعة مكثفة`);

    if (visibleHomework.length > 0) {
      if (weekHwSubs.length > 0) strengths.push(`أنجز ${weekHwSubs.length} واجب هذا الأسبوع`);
      else weaknesses.push("لم يسلم أي واجب هذا الأسبوع");
    }

    if (strengths.length === 0) strengths.push("بداية جيدة — يحتاج مزيد من المشاركة الفعالة");
    if (weaknesses.length === 0) weaknesses.push("لا نقاط ضعف ملحوظة — استمر! 🎉");

    const report = {
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        level: role === "teacher" ? null : level,
        streak: role === "teacher" ? null : streak,
        points: role === "teacher" ? null : points,
      },
      period: { start: week.start, end: week.end, label: `${week.start} → ${week.end}` },
      attendance: {
        available: role !== "teacher",
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
        courseNames: enrolledCourses.map((course) => course.title),
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
