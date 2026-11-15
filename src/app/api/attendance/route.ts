import { db } from "@/db";
import { attendanceRecords, users, parentLinks, centerGroups } from "@/db/schema";
import { eq, and, sql, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

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
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const gradeFilter = searchParams.get("grade");
  const groupFilter = searchParams.get("groupId");
  const sessionFilter = searchParams.get("sessionTitle");
  const monthFilter = searchParams.get("month"); // e.g. "2026-11"
  const view = searchParams.get("view") || "roster"; // 'roster', 'history', 'reports'
  const role = ctx.user.role as string;

  try {
    // ============ TEACHER / ADMIN: Enhanced Roster, History & Reports ============
    if (role === "teacher" || role === "admin") {
      // 1. Load All Groups
      const allGroups = await db.select().from(centerGroups).where(eq(centerGroups.isActive, true));

      // 2. Load Students
      let studentQuery = db.select().from(users).where(eq(users.role, "student"));
      const allStudents = await studentQuery;

      // Filter students by grade/group if specified
      const filteredStudents = allStudents.filter((st) => {
        if (gradeFilter && gradeFilter !== "all" && st.grade !== gradeFilter) return false;
        if (groupFilter && groupFilter !== "all" && st.groupId !== groupFilter) return false;
        return true;
      });

      // 3. Load Attendance Records
      const allRecords = await db.select().from(attendanceRecords);

      // Session Titles & Recent Dates for dropdowns
      const sessionTitles = [...new Set(allRecords.map((r) => r.sessionTitle).filter(Boolean))];
      const recentDates = [...new Set(allRecords.map((r) => r.sessionDate))].sort((a, b) => (a < b ? 1 : -1)).slice(0, 30);

      // --- VIEW: REPORTS & MONTHLY SUMMARY ---
      if (view === "reports") {
        const targetMonth = monthFilter || date.substring(0, 7);
        const monthRecords = allRecords.filter((r) => r.sessionDate.startsWith(targetMonth));

        const studentReports = filteredStudents.map((st) => {
          const recs = monthRecords.filter((r) => r.studentId === st.id);
          const grp = allGroups.find((g) => g.id === st.groupId);
          return {
            studentId: st.id,
            studentCode: st.studentCode,
            studentName: st.name,
            grade: st.grade,
            groupName: grp ? grp.name : st.groupId || "عام",
            totalSessions: recs.length,
            presentCount: recs.filter((r) => r.status === "present").length,
            lateCount: recs.filter((r) => r.status === "late").length,
            absentCount: recs.filter((r) => r.status === "absent").length,
            excusedCount: recs.filter((r) => r.status === "excused").length,
            rate: computeRate(recs),
          };
        });

        // Group aggregation
        const groupReports = allGroups.map((grp) => {
          const groupStudentIds = new Set(allStudents.filter((s) => s.groupId === grp.id).map((s) => s.id));
          const recs = monthRecords.filter((r) => groupStudentIds.has(r.studentId));
          return {
            groupId: grp.id,
            groupName: grp.name,
            schedule: grp.schedule,
            grade: grp.grade,
            totalStudents: groupStudentIds.size,
            totalMarks: recs.length,
            presentCount: recs.filter((r) => r.status === "present").length,
            absentCount: recs.filter((r) => r.status === "absent").length,
            rate: computeRate(recs),
          };
        });

        return NextResponse.json({
          view: "reports",
          month: targetMonth,
          studentReports,
          groupReports,
          allGroups,
        });
      }

      // --- VIEW: HISTORY ---
      if (view === "history") {
        let historyRecords = allRecords;
        if (date && date !== "all") {
          historyRecords = historyRecords.filter((r) => r.sessionDate === date);
        }
        if (sessionFilter && sessionFilter !== "all") {
          historyRecords = historyRecords.filter((r) => r.sessionTitle === sessionFilter);
        }
        if (gradeFilter && gradeFilter !== "all") {
          historyRecords = historyRecords.filter((r) => r.grade === gradeFilter);
        }

        const sorted = historyRecords.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 200);
        return NextResponse.json({
          view: "history",
          records: sorted,
          sessionTitles,
          recentDates,
          allGroups,
        });
      }

      // --- VIEW: ROSTER & ACTIVE SCANNING (Default) ---
      const roster = filteredStudents.map((st) => {
        const recs = allRecords.filter((r) => r.studentId === st.id);
        const dateRec = recs.find(
          (r) => r.sessionDate === date && (!sessionFilter || sessionFilter === "all" || r.sessionTitle === sessionFilter)
        );
        const grp = allGroups.find((g) => g.id === st.groupId);

        return {
          studentId: st.id,
          studentCode: st.studentCode,
          studentName: st.name,
          grade: st.grade,
          groupId: st.groupId,
          groupName: grp ? grp.name : st.groupId || "عام",
          schedule: grp ? grp.schedule : "",
          qrCode: st.qrCode,
          phone: st.phone,
          parentPhone: st.parentPhone,
          totalSessions: recs.length,
          presentCount: recs.filter((r) => r.status === "present").length,
          lateCount: recs.filter((r) => r.status === "late").length,
          absentCount: recs.filter((r) => r.status === "absent").length,
          excusedCount: recs.filter((r) => r.status === "excused").length,
          rate: computeRate(recs),
          statusOnDate: dateRec?.status || null,
          markedAt: dateRec?.createdAt || null,
        };
      });

      return NextResponse.json({
        roster,
        allGroups,
        sessionTitles,
        recentDates,
        currentDate: date,
        role,
      });
    }

    // ============ PARENT: linked student's records ===========
    if (role === "parent") {
      let studentId = searchParams.get("studentId");
      if (!studentId) {
        const links = await db.select().from(parentLinks).where(eq(parentLinks.parentId, ctx.user.id));
        if (links.length === 0) return NextResponse.json({ error: "No linked student" }, { status: 404 });
        studentId = links[0]?.studentId || null;
      }
      if (!studentId) return NextResponse.json({ error: "No linked student" }, { status: 404 });
      const links = await db
        .select()
        .from(parentLinks)
        .where(and(eq(parentLinks.parentId, ctx.user.id), eq(parentLinks.studentId, studentId)));
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

    // ============ STAFF: SCAN QR OR BARCODE ============
    if (action === "scan") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { scanCode, sessionTitle, sessionDate, groupId } = body;
      if (!scanCode) {
        return NextResponse.json({ error: "Scan code is required" }, { status: 400 });
      }

      const targetDate = sessionDate || new Date().toISOString().split("T")[0];
      const targetTitle = sessionTitle || "حصة سنتر الوليد الأسبوعية";

      // 1. Locate student by qrCode, studentCode, id, or username
      const cleanScan = scanCode.trim();
      let matchedStudent: any = null;

      // Try by QR code
      const byQr = await db.select().from(users).where(eq(users.qrCode, cleanScan)).limit(1);
      if (byQr.length > 0) {
        matchedStudent = byQr[0];
      } else {
        // Try by integer studentCode
        const asInt = parseInt(cleanScan, 10);
        if (!isNaN(asInt)) {
          const byCode = await db.select().from(users).where(eq(users.studentCode, asInt)).limit(1);
          if (byCode.length > 0) matchedStudent = byCode[0];
        }
      }

      if (!matchedStudent) {
        // Try by id or username
        const byId = await db
          .select()
          .from(users)
          .where(or(eq(users.id, cleanScan), eq(users.username, cleanScan)))
          .limit(1);
        if (byId.length > 0) matchedStudent = byId[0];
      }

      if (!matchedStudent || matchedStudent.role !== "student") {
        return NextResponse.json(
          { success: false, error: "كود غير صالح أو لم يتم العثور على الطالب" },
          { status: 404 }
        );
      }

      // 2. Duplicate Attendance Prevention
      const existingAttendance = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.studentId, matchedStudent.id),
            eq(attendanceRecords.sessionDate, targetDate),
            eq(attendanceRecords.sessionTitle, targetTitle)
          )
        );

      if (existingAttendance.length > 0) {
        return NextResponse.json({
          success: false,
          alreadyMarked: true,
          message: `الطالب مسجل حضور بالفعل اليوم (${matchedStudent.name})`,
          student: {
            id: matchedStudent.id,
            name: matchedStudent.name,
            grade: matchedStudent.grade,
            studentCode: matchedStudent.studentCode,
          },
          record: existingAttendance[0],
        });
      }

      // 3. Insert Attendance Record
      const newRecord = {
        id: `att_${Date.now()}_${matchedStudent.id}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        sessionTitle: targetTitle,
        sessionDate: targetDate,
        status: "present",
        grade: matchedStudent.grade || "",
        groupId: groupId || matchedStudent.groupId || null,
        scanMethod: cleanScan.startsWith("wld_qr_") ? "qr" : "barcode",
        markedBy: ctx.user.name || ctx.user.id,
        createdAt: new Date(),
      };

      await db.insert(attendanceRecords).values(newRecord);

      return NextResponse.json({
        success: true,
        message: `تم تسجيل حضور الطالب بنجاح: ${matchedStudent.name}`,
        student: {
          id: matchedStudent.id,
          name: matchedStudent.name,
          grade: matchedStudent.grade,
          studentCode: matchedStudent.studentCode,
        },
        record: newRecord,
      });
    }

    // ============ STAFF: MANUAL SINGLE STATUS MARK ============
    if (action === "manual_mark") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { studentId, studentName, sessionTitle, sessionDate, status, grade, groupId } = body;
      if (!studentId || !sessionTitle || !sessionDate || !status) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const existing = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.studentId, studentId),
            eq(attendanceRecords.sessionTitle, sessionTitle),
            eq(attendanceRecords.sessionDate, sessionDate)
          )
        );

      if (existing.length > 0) {
        await db
          .update(attendanceRecords)
          .set({ status, markedBy: ctx.user.name || ctx.user.id })
          .where(eq(attendanceRecords.id, existing[0].id));
      } else {
        await db.insert(attendanceRecords).values({
          id: `att_${Date.now()}_${studentId}_${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          studentName: studentName || "Student",
          sessionTitle,
          sessionDate,
          status,
          grade: grade || "",
          groupId: groupId || null,
          scanMethod: "manual",
          markedBy: ctx.user.name || ctx.user.id,
        });
      }

      return NextResponse.json({ success: true, status });
    }

    // ============ TEACHER: BULK MARK ROSTER FOR A SESSION ============
    if (action === "bulk_mark") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { sessionTitle, sessionDate, groupId, marks } = body;
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
            .set({ status: m.status, markedBy: ctx.user.name || ctx.user.id })
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
            groupId: groupId || null,
            scanMethod: "manual",
            markedBy: ctx.user.name || ctx.user.id,
          });
        }
        saved++;
      }

      return NextResponse.json({ success: true, saved });
    }

    // ============ STUDENT: SELF CHECK-IN ============
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
