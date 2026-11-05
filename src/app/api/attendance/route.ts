import { db } from "@/db";
import { attendanceRecords, users, parentLinks, enrollments, courses } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { getParentAnalyticsSelectionData, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";

const verifiedByUser = alias(users, "attendance_verified_by_user");
const parentAccount = alias(users, "attendance_parent_account");

function computeRate(records: any[]) {
  if (records.length === 0) return 100;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  // present=1, late=0.7, excused=0.85, absent=0
  const score = (present + late * 0.7 + excused * 0.85) / records.length;
  return Math.round(score * 100);
}

export async function GET(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = ctx.user.role as string;
  if (!["teacher", "admin", "parent", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  try {
    // Teachers may only see the roster for students enrolled in their owned courses.
    // Attendance rows lack a course ID, so expose only rows they personally marked.
    if (role === "teacher" || role === "admin") {
      const allStudents = role === "admin"
        ? await db.select().from(users).where(eq(users.role, "student"))
        : [];
      const visibleStudents = role === "teacher"
        ? await (async () => {
            const rows = await db
              .select({ studentId: enrollments.studentId })
              .from(enrollments)
              .innerJoin(courses, eq(enrollments.courseId, courses.id))
              .innerJoin(users, eq(enrollments.studentId, users.id))
              .where(and(
                eq(courses.teacherId, ctx.user.id),
                eq(users.role, "student"),
                inArray(enrollments.status, ["active", "completed"]),
              ));
            const ids = [...new Set(rows.map((row) => row.studentId))];
            return ids.length
              ? await db.select().from(users).where(and(eq(users.role, "student"), inArray(users.id, ids)))
              : [];
          })()
        : allStudents;
      // Restrict the database read to the teacher's current owned-course roster.
      // Filtering only after loading every record marked by this teacher would still
      // bring out-of-scope student data into application memory.
      const visibleStudentIds = visibleStudents.map((student) => student.id);
      const allRecords = role === "teacher"
        ? visibleStudentIds.length === 0
          ? []
          : await db.select().from(attendanceRecords).where(and(
              eq(attendanceRecords.markedBy, ctx.user.id),
              inArray(attendanceRecords.studentId, visibleStudentIds),
            ))
        : await db.select().from(attendanceRecords);

      const roster = visibleStudents.map((st) => {
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

      const visibleRecords = role === "teacher"
        ? allRecords.filter((record) => visibleStudents.some((student) => student.id === record.studentId))
        : allRecords;
      const sessionTitles = [...new Set(visibleRecords.map((r) => r.sessionTitle))];
      const recentDates = [...new Set(visibleRecords.map((r) => r.sessionDate))].sort((a, b) => (a < b ? 1 : -1)).slice(0, 20);

      return NextResponse.json({ roster, sessionTitles, recentDates, role });
    }

    // Parent access requires a current student account and an admin-verified relationship.
    if (role === "parent") {
      const requestedStudent = searchParams.get("studentId");
      const links = await db
        .select({
          studentId: parentLinks.studentId,
          verifiedAt: parentLinks.verifiedAt,
          verifiedBy: parentLinks.verifiedBy,
          verifierRole: verifiedByUser.role,
        })
        .from(parentLinks)
        .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
        .innerJoin(users, eq(parentLinks.studentId, users.id))
        // Unverified links count for ambiguity, but cannot authorize attendance.
        .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
        .where(and(
          eq(parentLinks.parentId, ctx.user.id),
          eq(parentAccount.role, "parent"),
          eq(users.role, "student"),
        ));
      const {
        allLinkedStudentIds: linkedStudentIds,
        verifiedStudentIds,
      } = getParentAnalyticsSelectionData(links);
      const resolution = resolveParentAnalyticsStudentId(requestedStudent, linkedStudentIds);
      if (!resolution.ok) {
        if (resolution.reason === "no-linked-student") return NextResponse.json({ error: "No verified linked student" }, { status: 404 });
        if (resolution.reason === "student-id-required") return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
        if (resolution.reason === "invalid-student-id") return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!verifiedStudentIds.includes(resolution.studentId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const studentId = resolution.studentId;
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
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["teacher", "admin", "student"].includes(ctx.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { action } = body;

    // Reject action/role mismatches before database setup or migration side effects.
    // A student may use self check-in only; bulk marking is reserved for teachers/admins.
    if (action === "bulk_mark" && !["teacher", "admin"].includes(ctx.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (action === "check_in" && ctx.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (action !== "bulk_mark" && action !== "check_in") {
      return NextResponse.json({ error: "Unsupported attendance action" }, { status: 400 });
    }

    await ensureDbSetup();

    // ============ TEACHER: BULK MARK ROSTER FOR A SESSION ============
    if (action === "bulk_mark") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { sessionTitle, sessionDate, marks } = body;
      if (!sessionTitle || !sessionDate || !Array.isArray(marks)) {
        return NextResponse.json({ error: "sessionTitle, sessionDate & marks are required" }, { status: 400 });
      }

      if (ctx.user.role === "teacher") {
        const rows = await db
          .select({ studentId: enrollments.studentId })
          .from(enrollments)
          .innerJoin(courses, eq(enrollments.courseId, courses.id))
          .innerJoin(users, eq(enrollments.studentId, users.id))
          .where(and(
            eq(courses.teacherId, ctx.user.id),
            eq(users.role, "student"),
            inArray(enrollments.status, ["active", "completed"]),
          ));
        const allowedStudentIds = new Set(rows.map((row) => row.studentId));
        if (marks.some((mark) => typeof mark?.studentId !== "string" || !allowedStudentIds.has(mark.studentId))) {
          return NextResponse.json({ error: "Attendance includes a student outside your owned courses" }, { status: 403 });
        }
      }

      let saved = 0;
      for (const m of marks) {
        const existing = await db
          .select()
          .from(attendanceRecords)
          .where(
            and(
              eq(attendanceRecords.studentId, m.studentId),
              eq(attendanceRecords.sessionTitle, sessionTitle),
              eq(attendanceRecords.sessionDate, sessionDate)
            )
          );

        if (existing.length > 0) {
          await db
            .update(attendanceRecords)
            .set({ status: m.status, markedBy: ctx.user.id })
            .where(eq(attendanceRecords.id, existing[0].id));
        } else {
          await db.insert(attendanceRecords).values({
            id: `att_${Date.now()}_${m.studentId}_${Math.random().toString(36).substring(2, 5)}`,
            studentId: m.studentId,
            studentName: m.studentName || "Student",
            sessionTitle,
            sessionDate,
            status: m.status || "present",
            grade: m.grade || "",
            markedBy: ctx.user.id,
          });
        }
        saved++;
      }

      return NextResponse.json({ success: true, saved });
    }

    // ============ STUDENT: SELF CHECK-IN (today's live session) ============
    if (action === "check_in") {
      // Teachers and admins may bulk-mark authorized rosters, but must not use
      // the student self check-in action to create attendance for their own account.
      if (ctx.user.role !== "student") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
