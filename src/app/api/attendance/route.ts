import { db } from "@/db";
import { attendanceRecords, users, parentLinks, centerGroups, payments } from "@/db/schema";
import { eq, and, sql, or, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { dispatchAttendanceNotification as dispatchAlwaledNotification, getNotificationDeliveryLogs } from "@/lib/notifications/dispatcher";
import { dispatchAttendanceNotification as dispatchParentConnectNotification } from "@/lib/parent-connect-dispatcher";

function computeRate(records: any[]) {
  if (records.length === 0) return 100;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  // present=1, late=0.7, excused=0.85, absent=0
  const score = (present + late * 0.7 + excused * 0.85) / records.length;
  return Math.round(score * 100);
}

async function notifyParents(params: {
  attendanceRecordId?: string;
  studentId: string;
  studentName?: string;
  sessionTitle: string;
  sessionDate: string;
  status: "present" | "absent" | "late" | "excused";
  parentPhone?: string;
  markedBy?: string;
}) {
  try {
    await dispatchAlwaledNotification({
      studentId: params.studentId,
      studentName: params.studentName || "Student",
      status: params.status,
      sessionTitle: params.sessionTitle,
      sessionDate: params.sessionDate,
      parentPhone: params.parentPhone,
    }).catch((e) => console.error("Al Waled notification error:", e));

    if (params.attendanceRecordId && params.status !== "excused") {
      await dispatchParentConnectNotification({
        attendanceRecordId: params.attendanceRecordId,
        studentId: params.studentId,
        studentName: params.studentName,
        sessionTitle: params.sessionTitle,
        sessionDate: params.sessionDate,
        status: params.status as any,
        markedBy: params.markedBy,
      }).catch((e) => console.error("Parent connect notification error:", e));
    }
  } catch (err) {
    console.error("Parent notification dispatch failed:", err);
  }
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const gradeFilter = searchParams.get("grade");
  const groupFilter = searchParams.get("groupId");
  const sessionFilter = searchParams.get("sessionTitle");
  const monthFilter = searchParams.get("month"); // e.g. "2026-11"
  const view = searchParams.get("view") || "roster"; // 'roster', 'history', 'reports', 'notifications'
  const role = ctx.user.role as string;
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  try {
    // ============ TEACHER / ADMIN: Enhanced Roster, History, Reports, and Fees ============
    if (role === "teacher" || role === "admin") {
      // 1. Load All Active Center Groups
      const allGroups = await db.select().from(centerGroups).where(eq(centerGroups.isActive, true));

      // 2. Load Students
      const allStudents = await db.select().from(users).where(eq(users.role, "student"));

      // Filter students by grade/group if specified
      const filteredStudents = allStudents.filter((st) => {
        if (gradeFilter && gradeFilter !== "all" && st.grade !== gradeFilter) return false;
        if (groupFilter && groupFilter !== "all" && st.groupId !== groupFilter) return false;
        return true;
      });

      // 3. Load Attendance Records & Payments
      const allRecords = await db.select().from(attendanceRecords);
      const allPayments = await db.select().from(payments);

      const monthlyFee = 250;

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
          sessionTitles,
          recentDates,
        });
      }

      // --- VIEW: DETAILED ATTENDANCE HISTORY LOG ---
      if (view === "history") {
        const studentMap = new Map(allStudents.map((s) => [s.id, s]));
        const groupMap = new Map(allGroups.map((g) => [g.id, g.name]));

        let historyList = allRecords.map((r) => {
          const st = studentMap.get(r.studentId);
          return {
            id: r.id,
            studentId: r.studentId,
            studentCode: st?.studentCode,
            studentName: r.studentName || st?.name || "طالب",
            grade: r.grade || st?.grade,
            groupId: r.groupId || st?.groupId,
            groupName: groupMap.get(r.groupId || st?.groupId || "") || "عام",
            sessionTitle: r.sessionTitle,
            sessionDate: r.sessionDate,
            status: r.status,
            scanMethod: r.scanMethod || "manual",
            markedBy: r.markedBy,
            markedAt: r.createdAt,
          };
        });

        if (date && date !== "all") {
          historyList = historyList.filter((h) => h.sessionDate === date);
        }
        if (gradeFilter && gradeFilter !== "all") {
          historyList = historyList.filter((h) => h.grade === gradeFilter);
        }
        if (groupFilter && groupFilter !== "all") {
          historyList = historyList.filter((h) => h.groupId === groupFilter);
        }
        if (sessionFilter && sessionFilter !== "all") {
          historyList = historyList.filter((h) => h.sessionTitle === sessionFilter);
        }

        historyList.sort((a, b) => (new Date(b.markedAt || 0) > new Date(a.markedAt || 0) ? 1 : -1));

        return NextResponse.json({
          view: "history",
          history: historyList.slice(0, 200),
          totalCount: historyList.length,
          allGroups,
          sessionTitles,
          recentDates,
        });
      }

      // --- VIEW: NOTIFICATION DELIVERY LOGS ---
      if (view === "notifications") {
        return NextResponse.json({
          view: "notifications",
          logs: getNotificationDeliveryLogs(),
        });
      }

      // --- VIEW: ROSTER & ACTIVE SCANNING (Default) ---
      const roster = filteredStudents.map((st) => {
        const recs = allRecords.filter((r) => r.studentId === st.id);
        const dateRec = date
          ? recs.find(
              (r) => r.sessionDate === date && (!sessionFilter || sessionFilter === "all" || r.sessionTitle === sessionFilter)
            )
          : null;
        const grp = allGroups.find((g) => g.id === st.groupId);

        // Payments for this student in current month
        const stPayments = allPayments.filter(
          (p) => p.studentId === st.id && (p.status === "approved" || p.status === "paid")
        );
        const currentMonthPayments = stPayments.filter(
          (p) => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 7) === currentMonth
        );
        const totalPaidThisMonth = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const remaining = Math.max(0, monthlyFee - totalPaidThisMonth);
        const feeStatus = totalPaidThisMonth >= monthlyFee ? "paid" : totalPaidThisMonth > 0 ? "partial" : "unpaid";

        return {
          studentId: st.id,
          studentCode: st.studentCode || `PA-${st.id.slice(-6).toUpperCase()}`,
          studentName: st.name,
          email: st.email,
          phone: st.phone || "",
          parentPhone: st.parentPhone || "",
          grade: st.grade || "",
          stage: st.stage || "",
          groupId: st.groupId || null,
          groupName: grp ? grp.name : st.groupId || "عام",
          schedule: grp ? grp.schedule : "",
          qrCode: st.qrCode || `qr_${st.id}`,
          avatar: st.avatar || "",
          totalSessions: recs.length,
          presentCount: recs.filter((r) => r.status === "present").length,
          lateCount: recs.filter((r) => r.status === "late").length,
          absentCount: recs.filter((r) => r.status === "absent").length,
          excusedCount: recs.filter((r) => r.status === "excused").length,
          rate: computeRate(recs),
          statusOnDate: dateRec?.status || null,
          markedAt: dateRec?.createdAt || null,
          monthlyFee,
          totalPaidThisMonth,
          remainingAmount: remaining,
          feeStatus,
          lastPayment: stPayments[stPayments.length - 1] || null,
        };
      });

      // Total collected fees this month
      const totalRevenueMonth = allPayments
        .filter(
          (p) =>
            (p.status === "approved" || p.status === "paid") &&
            p.createdAt &&
            new Date(p.createdAt).toISOString().slice(0, 7) === currentMonth
        )
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      return NextResponse.json({
        roster,
        allGroups,
        sessionTitles,
        recentDates,
        currentDate: date,
        currentMonth,
        totalRevenueMonth,
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

      const records = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.studentId, studentId))
        .orderBy(desc(attendanceRecords.sessionDate));

      const student = await db.select().from(users).where(eq(users.id, studentId));
      return NextResponse.json({
        student: student[0] || null,
        records,
        rate: computeRate(records),
        role,
      });
    }

    // ============ STUDENT: own records + ID card details + fees ============
    if (role === "student") {
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.studentId, ctx.user.id))
        .orderBy(desc(attendanceRecords.sessionDate));

      const stPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.studentId, ctx.user.id),
            or(eq(payments.status, "approved"), eq(payments.status, "paid"))
          )
        );

      const monthlyFee = 250;
      const currentMonthPayments = stPayments.filter(
        (p) => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 7) === currentMonth
      );
      const totalPaidThisMonth = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const remaining = Math.max(0, monthlyFee - totalPaidThisMonth);
      const feeStatus = totalPaidThisMonth >= monthlyFee ? "paid" : totalPaidThisMonth > 0 ? "partial" : "unpaid";

      return NextResponse.json({
        student: {
          id: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          phone: ctx.user.phone,
          grade: ctx.user.grade,
          stage: ctx.user.stage,
          avatar: ctx.user.avatar,
          studentCode: (ctx.user as any).studentCode || `PA-${ctx.user.id.slice(-6).toUpperCase()}`,
        },
        records,
        rate: computeRate(records),
        feeDetails: {
          monthlyFee,
          totalPaidThisMonth,
          remainingAmount: remaining,
          feeStatus,
        },
        role,
      });
    }

    return NextResponse.json({ error: "Forbidden role" }, { status: 403 });
  } catch (err: any) {
    console.error("Attendance GET Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // ============ STAFF: SCAN QR OR BARCODE (Camera / Laser Barcode Wedge) ============
    if (action === "scan" || action === "qr_scan") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const rawScan = body.scanCode || body.qrCodeData;
      if (!rawScan) {
        return NextResponse.json({ error: "Scan code is required" }, { status: 400 });
      }

      let scanCode = String(rawScan).trim();
      if (scanCode.startsWith("PA:")) {
        scanCode = scanCode.replace("PA:", "").trim();
      } else if (scanCode.startsWith("{")) {
        try {
          const parsed = JSON.parse(scanCode);
          scanCode = parsed.sid || parsed.id || parsed.studentId || scanCode;
        } catch {}
      }

      const targetDate = body.sessionDate || new Date().toISOString().split("T")[0];
      const targetTitle = body.sessionTitle || "حصة سنتر الوليد الأسبوعية";

      // 1. Locate student by qrCode, studentCode, id, username, or phone
      let matchedStudent: any = null;

      // Try by QR code
      const byQr = await db.select().from(users).where(eq(users.qrCode, scanCode)).limit(1);
      if (byQr.length > 0) {
        matchedStudent = byQr[0];
      } else {
        // Try by integer studentCode
        const asInt = parseInt(scanCode, 10);
        if (!isNaN(asInt)) {
          const byCode = await db.select().from(users).where(eq(users.studentCode, asInt)).limit(1);
          if (byCode.length > 0) matchedStudent = byCode[0];
        }
      }

      if (!matchedStudent) {
        // Try by id, username, or phone
        const byOther = await db
          .select()
          .from(users)
          .where(
            or(
              eq(users.id, scanCode),
              eq(users.username, scanCode),
              eq(users.phone, scanCode)
            )
          )
          .limit(1);
        if (byOther.length > 0) matchedStudent = byOther[0];
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
            eq(attendanceRecords.sessionTitle, targetTitle),
            eq(attendanceRecords.sessionDate, targetDate)
          )
        );

      if (existingAttendance.length > 0) {
        const prev = existingAttendance[0];
        return NextResponse.json({
          success: false,
          isDuplicate: true,
          message: `الطالب مسجل حضور بالفعل اليوم (${prev.status === "present" ? "حاضر" : prev.status})`,
          student: {
            id: matchedStudent.id,
            name: matchedStudent.name,
            studentCode: matchedStudent.studentCode,
            grade: matchedStudent.grade,
          },
          record: prev,
        });
      }

      // 3. Insert Attendance Record
      const scanMethod = body.scanMethod || "barcode_scanner";
      const recordId = `att_${Date.now()}_${matchedStudent.id}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(attendanceRecords).values({
        id: recordId,
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        sessionTitle: targetTitle,
        sessionDate: targetDate,
        status: "present",
        grade: matchedStudent.grade || "",
        groupId: matchedStudent.groupId || body.groupId || null,
        scanMethod,
        markedBy: ctx.user.name || ctx.user.id,
      });

      // 4. Automated Parent Notification Dispatch (Phase 6: WhatsApp & Telegram)
      notifyParents({
        attendanceRecordId: recordId,
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        status: "present",
        sessionTitle: targetTitle,
        sessionDate: targetDate,
        parentPhone: matchedStudent.parentPhone,
        markedBy: ctx.user.name || ctx.user.id,
      });

      return NextResponse.json({
        success: true,
        isDuplicate: false,
        message: "تم تسجيل الحضور بنجاح",
        student: {
          id: matchedStudent.id,
          name: matchedStudent.name,
          studentCode: matchedStudent.studentCode,
          grade: matchedStudent.grade,
          groupId: matchedStudent.groupId,
          parentPhone: matchedStudent.parentPhone,
        },
        record: {
          id: recordId,
          sessionTitle: targetTitle,
          sessionDate: targetDate,
          status: "present",
          scanMethod,
        },
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

      let recordId = "";
      if (existing.length > 0) {
        recordId = existing[0].id;
        await db
          .update(attendanceRecords)
          .set({ status, markedBy: ctx.user.name || ctx.user.id })
          .where(eq(attendanceRecords.id, recordId));
      } else {
        recordId = `att_${Date.now()}_${studentId}_${Math.random().toString(36).substring(2, 6)}`;
        await db.insert(attendanceRecords).values({
          id: recordId,
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

      // Automated Parent Notification Dispatch
      notifyParents({
        attendanceRecordId: recordId,
        studentId,
        studentName: studentName || "Student",
        status: status as any,
        sessionTitle,
        sessionDate,
        parentPhone: body.parentPhone,
        markedBy: ctx.user.name || ctx.user.id,
      });

      return NextResponse.json({ success: true, status });
    }

    // ============ TEACHER / ADMIN: COLLECT TUITION / FEES ON THE SPOT ============
    if (action === "collect_fee") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const { studentId, amount, method = "cash_center", notes = "سداد اشتراك شهري بالسنتر" } = body;
      if (!studentId || !amount) {
        return NextResponse.json({ error: "studentId والمبلغ مطلوبان" }, { status: 400 });
      }

      const stList = await db.select().from(users).where(eq(users.id, studentId));
      if (stList.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
      const student = stList[0];

      const paymentRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: student.id,
        studentName: student.name,
        courseId: null,
        amount: Number(amount).toFixed(2),
        method,
        transactionId: `REC-${Date.now().toString().slice(-6)}`,
        status: "approved",
        senderNumber: student.phone || notes,
      };

      await db.insert(payments).values(paymentRecord);

      return NextResponse.json({
        success: true,
        payment: paymentRecord,
        receiptNumber: paymentRecord.transactionId,
        date: new Date().toISOString(),
      });
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

        let attRecordId = "";
        if (existing.length > 0) {
          attRecordId = existing[0].id;
          await db
            .update(attendanceRecords)
            .set({ status: m.status, markedBy: ctx.user.name || ctx.user.id })
            .where(eq(attendanceRecords.id, attRecordId));
        } else {
          attRecordId = `att_${Date.now()}_${m.studentId}_${Math.random().toString(36).substring(2, 5)}`;
          await db.insert(attendanceRecords).values({
            id: attRecordId,
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

        // Notify parent automatically
        notifyParents({
          attendanceRecordId: attRecordId,
          studentId: m.studentId,
          studentName: m.studentName || "Student",
          sessionTitle,
          sessionDate,
          status: m.status || "present",
          markedBy: ctx.user.name || ctx.user.id,
        });

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
        return NextResponse.json({ message: "تم تسجيل حضورك مسبقاً لهذه الحصة", alreadyRecorded: true });
      }

      const recId = `att_${Date.now()}_${ctx.user.id}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(attendanceRecords).values({
        id: recId,
        studentId: ctx.user.id,
        studentName: ctx.user.name || "Student",
        sessionTitle: title,
        sessionDate: today,
        status: "present",
        grade: ctx.user.grade || "",
        scanMethod: "student_self_checkin",
        markedBy: "student_self",
      });

      notifyParents({
        attendanceRecordId: recId,
        studentId: ctx.user.id,
        studentName: ctx.user.name || "Student",
        sessionTitle: title,
        sessionDate: today,
        status: "present",
        parentPhone: ctx.user.parentPhone,
        markedBy: "student_self",
      });

      return NextResponse.json({ success: true, message: "تم تسجيل الحضور بنجاح" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Attendance POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err?.message }, { status: 500 });
  }
}
