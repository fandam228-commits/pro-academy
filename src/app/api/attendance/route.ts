import { db } from "@/db";
import { attendanceRecords, users, parentLinks, enrollments, courses } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { getParentAnalyticsSelectionData, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";
import { buildVerifiedParentLinkPredicate } from "@/lib/parent-report-authorization.mjs";

const verifiedByUser = alias(users, "attendance_verified_by_user");
const parentAccount = alias(users, "attendance_parent_account");
const attendanceStudentAccount = alias(users, "attendance_student_account");

function privateJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json(body, { ...init, headers });
}

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
      // Count every current student link for ambiguity, but authorize only admin-verified links.
      const links = await db
        .select({
          studentId: parentLinks.studentId,
          verifiedAt: parentLinks.verifiedAt,
          verifiedBy: parentLinks.verifiedBy,
          studentRole: users.role,
          verifierRole: verifiedByUser.role,
        })
        .from(parentLinks)
        .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
        .leftJoin(users, eq(parentLinks.studentId, users.id))
        .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
        .where(and(
          eq(parentLinks.parentId, ctx.user.id),
          eq(parentAccount.role, "parent"),
        ));
      const selectionData = getParentAnalyticsSelectionData(
        links.filter((link) => link.studentRole === "student"),
      );
      if (selectionData.verifiedStudentIds.length === 0) {
        return privateJson({ error: "No verified linked student" }, { status: 404 });
      }
      const resolution = resolveParentAnalyticsStudentId(
        requestedStudent,
        selectionData.allLinkedStudentIds,
      );
      if (!resolution.ok) {
        if (resolution.reason === "no-linked-student") return privateJson({ error: "No linked student" }, { status: 404 });
        if (resolution.reason === "student-id-required") return privateJson({ error: "studentId is required when multiple students are linked" }, { status: 400 });
        if (resolution.reason === "invalid-student-id") return privateJson({ error: "Invalid studentId" }, { status: 400 });
        return privateJson({ error: "Forbidden" }, { status: 403 });
      }
      const studentId = resolution.studentId;
      if (!selectionData.verifiedStudentIds.includes(studentId)) {
        return privateJson({ error: "Forbidden" }, { status: 403 });
      }
      // The parent dashboard needs only the visible attendance summary fields.
      // Never serialize student names, student IDs, marker IDs, or grade metadata per row.
      const records = await db
        .select({
          id: attendanceRecords.id,
          sessionTitle: attendanceRecords.sessionTitle,
          sessionDate: attendanceRecords.sessionDate,
          status: attendanceRecords.status,
        })
        .from(attendanceRecords)
        .where(eq(attendanceRecords.studentId, studentId));
      const sorted = records.sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));

      // A verified relationship can be revoked while attendance rows are being read.
      // Re-check the current parent, student, and Admin verifier before returning them.
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
            studentAccount: attendanceStudentAccount,
            verifiedByUser,
            parentId: ctx.user.id,
            studentId,
          }),
        ))
        .limit(1);
      if (parentAccessStillValid.length === 0) {
        return privateJson({ error: "Forbidden" }, { status: 403 });
      }

      return privateJson({
        role: "parent",
        studentId,
        records: sorted,
        rate: computeRate(records),
        total: records.length,
      });
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

      // Serialize writes by the logical attendance key. A row lock alone cannot
      // protect the "no row exists yet" case, so use a transaction-scoped advisory
      // lock before checking or creating each (student, session, date) record.
      const lockKeys = marks
        .map((mark) => JSON.stringify([mark.studentId, sessionTitle, sessionDate]))
        .sort();
      if (new Set(lockKeys).size !== lockKeys.length) {
        return NextResponse.json({ error: "Duplicate attendance entries are not allowed" }, { status: 400 });
      }

      const result = await db.transaction(async (tx) => {
        for (const lockKey of lockKeys) {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);
        }

        // Preflight every record before writing any of them. This prevents a
        // rejected bulk request from partially creating earlier marks.
        const existingByKey = new Map<string, { id: string; markedBy: string } | null>();
        for (const mark of marks) {
          const key = JSON.stringify([mark.studentId, sessionTitle, sessionDate]);
          const existing = await tx
            .select({
              id: attendanceRecords.id,
              markedBy: attendanceRecords.markedBy,
            })
            .from(attendanceRecords)
            .where(and(
              eq(attendanceRecords.studentId, mark.studentId),
              eq(attendanceRecords.sessionTitle, sessionTitle),
              eq(attendanceRecords.sessionDate, sessionDate),
            ));
          const current = existing[0] ?? null;

          if (ctx.user.role === "teacher" && current && current.markedBy !== ctx.user.id) {
            return { conflict: true, saved: 0 };
          }
          existingByKey.set(key, current);
        }

        for (const mark of marks) {
          const key = JSON.stringify([mark.studentId, sessionTitle, sessionDate]);
          const current = existingByKey.get(key);
          if (current) {
            await tx
              .update(attendanceRecords)
              .set({ status: mark.status, markedBy: ctx.user.id })
              .where(eq(attendanceRecords.id, current.id));
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
        }

        return { conflict: false, saved: marks.length };
      });

      if (result.conflict) {
        return NextResponse.json({ error: "Attendance record is owned by another teacher" }, { status: 409 });
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
