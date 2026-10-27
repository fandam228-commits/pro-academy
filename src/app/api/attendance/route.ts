import { db } from "@/db";
import { attendanceRecords, users, parentLinks, enrollments, courses } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import {
  canManageAttendanceStudent,
  canSelfCheckIn,
  isValidAttendanceStatus,
} from "@/lib/attendance-authorization.mjs";

function computeRate(records: any[]) {
  if (records.length === 0) return 100;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  // present=1, late=0.7, excused=0.85, absent=0
  const score = (present + late * 0.7 + excused * 0.85) / records.length;
  return Math.round(score * 100);
}

async function getTeacherStudentIds(teacherId: string) {
  const teacherEnrollments = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(courses.teacherId, teacherId));
  return [...new Set(teacherEnrollments.map((row) => row.studentId))];
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const role = ctx.user.role as string;

  try {
    if (!["admin", "teacher", "parent", "student"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ============ TEACHER / ADMIN: scoped roster + stats ============
    if (role === "teacher" || role === "admin") {
      const teacherStudentIds = role === "teacher" ? await getTeacherStudentIds(ctx.user.id) : [];
      const allStudents = await db.select().from(users).where(eq(users.role, "student"));
      const rosterStudents = allStudents.filter((student) =>
        canManageAttendanceStudent({ role, studentId: student.id, teacherStudentIds })
      );
      const rosterStudentIds = rosterStudents.map((student) => student.id);
      const allRecords = rosterStudentIds.length
        ? await db.select().from(attendanceRecords).where(inArray(attendanceRecords.studentId, rosterStudentIds))
        : [];

      // Per-student summary. Teachers only receive rows for their own enrolled students.
      const roster = rosterStudents.map((st) => {
        const recs = allRecords.filter((r) => r.studentId === st.id);
        const todayRec = date ? recs.find((r) => r.sessionDate === date) : null;
        return {
          studentId: st.id,
          studentName: st.name,
          grade: st.grade,
          totalSessions: recs.length,
          presentCount: recs.filter((r) => r.status === "present").length,
          lateCount: recs.filter((r) => r.status === "late").length,
          absentCount: recs.filter((r) => r.status === "absent").length,
          excusedCount: recs.filter((r) => r.status === "excused").length,
          rate: computeRate(recs),
          statusOnDate: todayRec?.status || null,
        };
      });

      const sessionTitles = [...new Set(allRecords.map((r) => r.sessionTitle))];
      const recentDates = [...new Set(allRecords.map((r) => r.sessionDate))]
        .sort((a, b) => (a < b ? 1 : -1))
        .slice(0, 20);

      return NextResponse.json({ roster, sessionTitles, recentDates, role });
    }

    // ============ PARENT: linked student's records ============
    if (role === "parent") {
      let studentId = searchParams.get("studentId");
      if (!studentId) {
        const links = await db.select().from(parentLinks).where(eq(parentLinks.parentId, ctx.user.id));
        studentId = links[0]?.studentId || null;
      }
      if (!studentId) return NextResponse.json({ error: "No linked student" }, { status: 404 });
      const links = await db.select().from(parentLinks).where(and(eq(parentLinks.parentId, ctx.user.id), eq(parentLinks.studentId, studentId)));
      if (!links.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const records = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, studentId));
      const sorted = records.sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));
      return NextResponse.json({ role: "parent", studentId, records: sorted, rate: computeRate(records), total: records.length });
    }

    // ============ STUDENT: own records ============
    const records = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, ctx.user.id));
    const sorted = records.sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));
    return NextResponse.json({
      role: "student",
      studentId: ctx.user.id,
      records: sorted,
      rate: computeRate(records),
      total: records.length,
      presentCount: records.filter((r) => r.status === "present").length,
      lateCount: records.filter((r) => r.status === "late").length,
      absentCount: records.filter((r) => r.status === "absent").length,
    });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to load attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // ============ TEACHER / ADMIN: BULK MARK ROSTER FOR A SESSION ============
    if (action === "bulk_mark") {
      const { user, denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { sessionTitle, sessionDate, marks } = body;
      if (!sessionTitle || !sessionDate || !Array.isArray(marks)) {
        return NextResponse.json({ error: "sessionTitle, sessionDate & marks are required" }, { status: 400 });
      }
      if (!marks.every((mark: any) => mark && typeof mark.studentId === "string" && mark.studentId.trim())) {
        return NextResponse.json({ error: "Every attendance mark must include a studentId." }, { status: 400 });
      }

      const normalizedMarks = marks.map((mark: any) => ({
        ...mark,
        studentId: mark.studentId.trim(),
        status: mark.status || "present",
      }));
      if (!normalizedMarks.every((mark: any) => isValidAttendanceStatus(mark.status))) {
        return NextResponse.json({ error: "Invalid attendance status." }, { status: 400 });
      }

      const targetIds = [...new Set(normalizedMarks.map((mark: any) => mark.studentId))];
      const targetStudents = targetIds.length
        ? await db
            .select({ id: users.id, name: users.name, grade: users.grade, role: users.role })
            .from(users)
            .where(inArray(users.id, targetIds))
        : [];
      if (targetStudents.length !== targetIds.length || targetStudents.some((student) => student.role !== "student")) {
        return NextResponse.json({ error: "One or more attendance targets are not students." }, { status: 400 });
      }

      const teacherStudentIds = user!.role === "teacher" ? await getTeacherStudentIds(user!.id) : [];
      if (
        targetIds.some(
          (studentId) =>
            !canManageAttendanceStudent({ role: user!.role, studentId, teacherStudentIds })
        )
      ) {
        return NextResponse.json({ error: "You may only mark attendance for students in your courses." }, { status: 403 });
      }

      const studentsById = new Map(targetStudents.map((student) => [student.id, student]));
      let saved = 0;
      for (const mark of normalizedMarks) {
        const student = studentsById.get(mark.studentId)!;
        const existing = await db
          .select()
          .from(attendanceRecords)
          .where(
            and(
              eq(attendanceRecords.studentId, mark.studentId),
              eq(attendanceRecords.sessionTitle, sessionTitle),
              eq(attendanceRecords.sessionDate, sessionDate)
            )
          );

        if (existing.length > 0) {
          await db
            .update(attendanceRecords)
            .set({ status: mark.status, markedBy: ctx.user.id })
            .where(eq(attendanceRecords.id, existing[0].id));
        } else {
          await db.insert(attendanceRecords).values({
            id: `att_${Date.now()}_${mark.studentId}_${Math.random().toString(36).substring(2, 5)}`,
            studentId: mark.studentId,
            studentName: student.name || "Student",
            sessionTitle,
            sessionDate,
            status: mark.status,
            grade: student.grade || "",
            markedBy: ctx.user.id,
          });
        }
        saved++;
      }

      return NextResponse.json({ success: true, saved });
    }

    // ============ STUDENT: SELF CHECK-IN (today's live session) ============
    if (action === "check_in") {
      if (!canSelfCheckIn(ctx.user.role)) {
        return NextResponse.json({ error: "Only student accounts can check in." }, { status: 403 });
      }

      const today = new Date().toISOString().split("T")[0];
      const title = body.sessionTitle || "حصة مباشرة مع مستر حبيب";

      const existing = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.studentId, ctx.user.id),
            eq(attendanceRecords.sessionTitle, title),
            eq(attendanceRecords.sessionDate, today)
          )
        );

      if (existing.length > 0) {
        return NextResponse.json({ success: true, already: true, record: existing[0] });
      }

      const record = {
        id: `att_${Date.now()}_${ctx.user.id}`,
        studentId: ctx.user.id,
        studentName: ctx.user.name,
        sessionTitle: title,
        sessionDate: today,
        status: "present",
        grade: ctx.user.grade || "",
        markedBy: "self",
      };
      await db.insert(attendanceRecords).values(record);
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
