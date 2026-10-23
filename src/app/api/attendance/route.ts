import { db } from "@/db";
import { attendanceRecords, users, parentLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

function computeRate(records: any[]): number | null {
  if (records.length === 0) return null;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  // present=1, late=0.7, excused=0.85, absent=0
  const score = (present + late * 0.7 + excused * 0.85) / records.length;
  return Math.round(score * 100);
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
    // ============ TEACHER / ADMIN: full roster + stats ============
    if (role === "teacher" || role === "admin") {
      const allStudents = await db.select().from(users).where(eq(users.role, "student"));
      const allRecords = await db.select().from(attendanceRecords);

      // Per-student summary
      const roster = allStudents.map((st) => {
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
      const recentDates = [...new Set(allRecords.map((r) => r.sessionDate))].sort((a, b) => (a < b ? 1 : -1)).slice(0, 20);

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

    // ============ TEACHER: BULK MARK ROSTER FOR A SESSION ============
    if (action === "bulk_mark") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { sessionTitle, sessionDate, marks } = body;
      if (!sessionTitle || !sessionDate || !Array.isArray(marks)) {
        return NextResponse.json({ error: "sessionTitle, sessionDate & marks are required" }, { status: 400 });
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
