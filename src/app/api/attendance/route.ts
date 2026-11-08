import { db } from "@/db";
import { attendanceRecords, users, parentLinks, enrollments, courses } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
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

      if (marks.some((mark) => !mark || typeof mark.studentId !== "string" || !mark.studentId) ||
          new Set(marks.map((mark) => mark.studentId)).size !== marks.length) {
        return NextResponse.json({ error: "Each attendance mark must contain a unique studentId" }, { status: 400 });
      }

      // Resolve and lock every matching record before writing anything. A teacher
      // may update only records they originally marked; otherwise a bulk request
      // could overwrite another teacher's attendance for a shared student/session.
      // Preflight inside one transaction also prevents partial writes when a later
      // mark conflicts with another teacher's record.
      const result = await db.transaction(async (tx) => {
        // Row locks cannot protect a key that does not exist yet. Serialize each
        // student/session/date key with a transaction-scoped advisory lock so two
        // teachers cannot both observe an empty slot and insert duplicate records.
        // Sort keys before locking to keep overlapping bulk requests in a stable order.
        const lockKeys = [...new Set(
          marks.map((mark) => JSON.stringify([mark.studentId, sessionTitle, sessionDate])),
        )].sort();
        for (const lockKey of lockKeys) {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);
        }

        // Revalidate the teacher account and every student's current owned-course
        // enrollment inside the write transaction. Lock the actor, student, enrollment,
        // and course rows until commit so a role demotion, enrollment revocation, or
        // course transfer cannot race between authorization and attendance writes.
        if (ctx.user.role === "teacher") {
          const currentTeacher = await tx
            .select({ id: users.id })
            .from(users)
            .where(and(eq(users.id, ctx.user.id), eq(users.role, "teacher")))
            .for("share");
          if (currentTeacher.length === 0) {
            return { denied: true as const, conflict: false as const, saved: 0 };
          }

          const currentEnrollmentRows = marks.length === 0
            ? []
            : await tx
                .select({ studentId: enrollments.studentId })
                .from(enrollments)
                .innerJoin(courses, eq(enrollments.courseId, courses.id))
                .innerJoin(users, eq(enrollments.studentId, users.id))
                .where(and(
                  inArray(enrollments.studentId, marks.map((mark) => mark.studentId)),
                  eq(courses.teacherId, ctx.user.id),
                  eq(users.role, "student"),
                  inArray(enrollments.status, ["active", "completed"]),
                ))
                .for("share");
          const currentAllowedStudentIds = new Set(currentEnrollmentRows.map((row) => row.studentId));
          if (marks.some((mark) => !currentAllowedStudentIds.has(mark.studentId))) {
            return { denied: true as const, conflict: false as const, saved: 0 };
          }
        }

        const existingByStudent = new Map<string, typeof attendanceRecords.$inferSelect | null>();

        for (const mark of marks) {
          const existing = await tx
            .select()
            .from(attendanceRecords)
            .where(and(
              eq(attendanceRecords.studentId, mark.studentId),
              eq(attendanceRecords.sessionTitle, sessionTitle),
              eq(attendanceRecords.sessionDate, sessionDate),
            ))
            .for("update");

          if (existing.length > 1 ||
              (ctx.user.role === "teacher" && existing.length === 1 && existing[0].markedBy !== ctx.user.id)) {
            return { denied: false as const, conflict: true as const, saved: 0 };
          }
          existingByStudent.set(mark.studentId, existing[0] ?? null);
        }

        let saved = 0;
        for (const mark of marks) {
          const existing = existingByStudent.get(mark.studentId);
          if (existing) {
            await tx
              .update(attendanceRecords)
              .set({ status: mark.status, markedBy: ctx.user.id })
              .where(eq(attendanceRecords.id, existing.id));
          } else {
            await tx.insert(attendanceRecords).values({
              id: `att_${Date.now()}_${mark.studentId}_${Math.random().toString(36).substring(2, 5)}`,
              studentId: mark.studentId,
              studentName: mark.studentName || "Student",
              sessionTitle,
              sessionDate,
              status: mark.status || "present",
              grade: mark.grade || "",
              markedBy: ctx.user.id,
            });
          }
          saved++;
        }

        return { denied: false as const, conflict: false as const, saved };
      });

      if (result.denied) {
        return NextResponse.json(
          { error: "Attendance includes a student outside your currently owned courses or eligible enrollment" },
          { status: 403 },
        );
      }
      if (result.conflict) {
        return NextResponse.json(
          { error: "Attendance record is owned by another teacher or has ambiguous duplicates" },
          { status: 409 },
        );
      }

      return NextResponse.json({ success: true, saved: result.saved });
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
