import { db } from "@/db";
import {
  attendanceRecords,
  users,
  parentLinks,
  parentStudentLinks,
  centerGroups,
  centerGroupStudents,
  centerSessions,
  attendanceAuditLogs,
  centerFeeInvoices,
  centerCollections,
} from "@/db/schema";
import { eq, and, sql, or, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { dispatchAttendanceNotification as dispatchAlwaledNotification, getNotificationDeliveryLogs } from "@/lib/notifications/dispatcher";
import { dispatchAttendanceNotification as dispatchParentConnectNotification, dispatchFeeReceiptNotification } from "@/lib/parent-connect-dispatcher";

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
      // 1. Load Active Center Groups (Scoped for Teacher)
      const rawGroups = await db.select().from(centerGroups).where(eq(centerGroups.isActive, true));
      const allGroups = role === "teacher" ? rawGroups.filter((g) => g.teacherId === ctx.user.id) : rawGroups;
      const allowedGroupIds = new Set(allGroups.map((g) => g.id));

      // 2. Load Group Memberships from centerGroupStudents & users
      const groupMemberships = await db.select().from(centerGroupStudents);
      const studentGroupMap = new Map<string, Set<string>>();
      for (const m of groupMemberships) {
        if (m.status === "active") {
          if (!studentGroupMap.has(m.studentId)) studentGroupMap.set(m.studentId, new Set());
          studentGroupMap.get(m.studentId)!.add(m.groupId);
        }
      }

      // 3. Load Students
      const allStudents = await db.select().from(users).where(eq(users.role, "student"));

      // Filter students by grade/group and scope to teacher's groups
      const filteredStudents = allStudents.filter((st) => {
        const studentGroups = studentGroupMap.get(st.id) || new Set(st.groupId ? [st.groupId] : []);
        if (role === "teacher") {
          const hasTeacherGroup = [...studentGroups].some((gid) => allowedGroupIds.has(gid));
          if (!hasTeacherGroup) return false;
        }

        if (gradeFilter && gradeFilter !== "all" && st.grade !== gradeFilter) return false;
        if (groupFilter && groupFilter !== "all" && !studentGroups.has(groupFilter)) return false;
        return true;
      });

      // 4. Load Attendance Records & Center Collections / Invoices
      const allRecords = await db.select().from(attendanceRecords);
      const allInvoices = await db.select().from(centerFeeInvoices).where(eq(centerFeeInvoices.billingMonth, currentMonth));
      const allCollections = await db
        .select()
        .from(centerCollections)
        .where(and(eq(centerCollections.billingMonth, currentMonth), eq(centerCollections.status, "active")));

      // Session Titles & Recent Dates for dropdowns
      const sessionTitles = [...new Set(allRecords.map((r) => r.sessionTitle).filter(Boolean))];
      const recentDates = [...new Set(allRecords.map((r) => r.sessionDate))].sort((a, b) => (a < b ? 1 : -1)).slice(0, 30);

      // Sessions List
      const activeSessions = await db.select().from(centerSessions).orderBy(desc(centerSessions.sessionDate));
      const scopedSessions = activeSessions.filter((s) => allowedGroupIds.has(s.groupId));

      // --- VIEW: SESSIONS LIST ---
      if (view === "sessions") {
        return NextResponse.json({
          success: true,
          sessions: scopedSessions.map((s) => ({
            ...s,
            groupName: allGroups.find((g) => g.id === s.groupId)?.name || "المجموعة",
          })),
        });
      }

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
          const groupStudentIds = new Set(
            allStudents
              .filter((s) => (studentGroupMap.get(s.id)?.has(grp.id) ?? false) || s.groupId === grp.id)
              .map((s) => s.id)
          );
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

        // Fee details for this student in current month (from center collections / invoices)
        const stInvoice = allInvoices.find((inv) => inv.studentId === st.id);
        const stCollections = allCollections.filter((c) => c.studentId === st.id);
        const totalPaidThisMonthCents = stCollections.reduce((sum, c) => sum + Math.round(Number(c.amount) * 100), 0);
        const totalPaidThisMonth = totalPaidThisMonthCents / 100;

        const effectiveMonthlyFee = stInvoice ? Number(stInvoice.baseFee) : grp ? Number(grp.monthlyFee || 0) : 0;
        const effectiveNetDue = stInvoice ? Number(stInvoice.netDue) : effectiveMonthlyFee;
        const remaining = Math.max(0, effectiveNetDue - totalPaidThisMonth);
        const feeStatus = totalPaidThisMonth >= effectiveNetDue && effectiveNetDue > 0 ? "paid" : totalPaidThisMonth > 0 ? "partial" : "unpaid";

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
          monthlyFee: effectiveMonthlyFee,
          totalPaidThisMonth,
          remainingAmount: remaining,
          feeStatus,
          lastPayment: stCollections[stCollections.length - 1] || null,
        };
      });

      // Total collected fees this month (Center Collections Only)
      const totalRevenueMonth = allCollections.reduce((sum, c) => sum + Number(c.amount || 0), 0);

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
      
      const modernLinks = await db
        .select({ studentId: parentStudentLinks.studentId })
        .from(parentStudentLinks)
        .where(eq(parentStudentLinks.parentId, ctx.user.id));

      const legacyLinks = await db
        .select({ studentId: parentLinks.studentId })
        .from(parentLinks)
        .where(eq(parentLinks.parentId, ctx.user.id));

      const linkedIds = [...new Set([...modernLinks.map((l) => l.studentId), ...legacyLinks.map((l) => l.studentId)])];

      if (linkedIds.length === 0) {
        return NextResponse.json({ error: "No linked student" }, { status: 404 });
      }

      if (!studentId || !linkedIds.includes(studentId)) {
        studentId = linkedIds[0];
      }

      const records = await db
        .select()
        .from(attendanceRecords)
        .where(eq(attendanceRecords.studentId, studentId))
        .orderBy(desc(attendanceRecords.sessionDate));

      const student = await db.select().from(users).where(eq(users.id, studentId));
      
      const allLinkedStudents = await db
        .select({ id: users.id, name: users.name, grade: users.grade, stage: users.stage, studentCode: users.studentCode })
        .from(users);

      const linkedChildren = allLinkedStudents.filter((s) => linkedIds.includes(s.id));

      return NextResponse.json({
        student: student[0] || null,
        linkedChildren,
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

      const stCollections = await db
        .select()
        .from(centerCollections)
        .where(
          and(
            eq(centerCollections.studentId, ctx.user.id),
            eq(centerCollections.status, "active")
          )
        );

      const stInvoices = await db
        .select()
        .from(centerFeeInvoices)
        .where(
          and(
            eq(centerFeeInvoices.studentId, ctx.user.id),
            eq(centerFeeInvoices.billingMonth, currentMonth)
          )
        );

      const currentMonthCollections = stCollections.filter((c) => c.billingMonth === currentMonth);
      const totalPaidThisMonthCents = currentMonthCollections.reduce((sum, c) => sum + Math.round(Number(c.amount) * 100), 0);
      const totalPaidThisMonth = totalPaidThisMonthCents / 100;

      const baseFeeNum = stInvoices.length > 0 ? Number(stInvoices[0].baseFee) : 0;
      const netDueNum = stInvoices.length > 0 ? Number(stInvoices[0].netDue) : baseFeeNum;
      const remaining = Math.max(0, netDueNum - totalPaidThisMonth);
      const feeStatus = totalPaidThisMonth >= netDueNum && netDueNum > 0 ? "paid" : totalPaidThisMonth > 0 ? "partial" : "unpaid";

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
          monthlyFee: baseFeeNum,
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

      // 1. Locate student by secure QR code or integer studentCode ONLY (prevents guessing via phone/username)
      let matchedStudent: any = null;

      // Try by QR code
      const byQr = await db.select().from(users).where(eq(users.qrCode, scanCode)).limit(1);
      if (byQr.length > 0) {
        matchedStudent = byQr[0];
      } else {
        // Try by integer studentCode
        const asInt = parseInt(scanCode, 10);
        if (!isNaN(asInt) && String(asInt) === scanCode) {
          const byCode = await db.select().from(users).where(eq(users.studentCode, asInt)).limit(1);
          if (byCode.length > 0) matchedStudent = byCode[0];
        }
      }

      if (!matchedStudent || matchedStudent.role !== "student") {
        return NextResponse.json(
          { success: false, error: "رمز QR أو كود الطالب غير صالح أو غير مسجل بالنظام" },
          { status: 404 }
        );
      }

      // Group scoping & membership verification
      const targetGroupId = body.groupId || matchedStudent.groupId;
      if (body.groupId) {
        // Teacher permission guard: cannot scan for another teacher's group
        if (ctx.user.role === "teacher") {
          const targetGrp = await db.select().from(centerGroups).where(eq(centerGroups.id, body.groupId)).limit(1);
          if (targetGrp.length === 0 || targetGrp[0].teacherId !== ctx.user.id) {
            return NextResponse.json({ success: false, error: "غير مصرح لك بتسجيل حضور مجموعة مدرس آخر" }, { status: 403 });
          }
        }

        // Verify student is actually enrolled in this group
        const groupEnrollments = await db
          .select()
          .from(centerGroupStudents)
          .where(
            and(
              eq(centerGroupStudents.groupId, body.groupId),
              eq(centerGroupStudents.studentId, matchedStudent.id),
              eq(centerGroupStudents.status, "active")
            )
          );

        if (groupEnrollments.length === 0 && matchedStudent.groupId !== body.groupId) {
          return NextResponse.json(
            { success: false, error: `الطالب (${matchedStudent.name}) غير مقيد في هذه المجموعة` },
            { status: 400 }
          );
        }
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
      const scanMethod = body.scanMethod || "qr";
      const recordId = `att_${Date.now()}_${matchedStudent.id}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(attendanceRecords).values({
        id: recordId,
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        sessionTitle: targetTitle,
        sessionDate: targetDate,
        status: "present",
        grade: matchedStudent.grade || "",
        groupId: targetGroupId || null,
        sessionId: body.sessionId || null,
        scanMethod,
        arrivalTime: new Date(),
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
        const prevStatus = existing[0].status;
        if (prevStatus !== status) {
          await db.insert(attendanceAuditLogs).values({
            id: `aal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            attendanceRecordId: recordId,
            studentId,
            previousStatus: prevStatus,
            newStatus: status,
            changedBy: ctx.user.name || ctx.user.id,
            reason: body.reason || "تعديل يدوي من كشف الحضور",
          });
        }
        await db
          .update(attendanceRecords)
          .set({
            status,
            markedBy: ctx.user.name || ctx.user.id,
            updatedBy: ctx.user.name || ctx.user.id,
            updatedAt: new Date(),
            notes: body.notes || existing[0].notes,
          })
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
          sessionId: body.sessionId || null,
          scanMethod: "manual",
          markedBy: ctx.user.name || ctx.user.id,
          arrivalTime: status === "present" || status === "late" ? new Date() : null,
          notes: body.notes || null,
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

      const { studentId, amount, method = "cash", notes = "سداد اشتراك شهري بالسنتر", groupId } = body;
      if (!studentId || !amount) {
        return NextResponse.json({ error: "studentId والمبلغ مطلوبان" }, { status: 400 });
      }

      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "قيمة المبلغ غير صحيحة" }, { status: 400 });
      }

      const stList = await db.select().from(users).where(eq(users.id, studentId));
      if (stList.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });
      const student = stList[0];

      const currentMonth = new Date().toISOString().slice(0, 7);
      const targetGroupId = groupId || student.groupId;

      // Group fee lookup
      let groupName = "عام";
      let baseFeeNum = 0;
      if (targetGroupId) {
        const grpRows = await db.select().from(centerGroups).where(eq(centerGroups.id, targetGroupId)).limit(1);
        if (grpRows.length > 0) {
          groupName = grpRows[0].name;
          baseFeeNum = Number(grpRows[0].monthlyFee || 0);
        }
      }

      const yyyymm = currentMonth.replace("-", "");
      const receiptNumber = `PA-REC-${yyyymm}-${String(Date.now()).slice(-4)}`;

      // Locate or create center_fee_invoices
      let invoiceId = "";
      if (targetGroupId) {
        const invRows = await db
          .select()
          .from(centerFeeInvoices)
          .where(
            and(
              eq(centerFeeInvoices.studentId, student.id),
              eq(centerFeeInvoices.groupId, targetGroupId),
              eq(centerFeeInvoices.billingMonth, currentMonth)
            )
          )
          .limit(1);

        if (invRows.length > 0) {
          invoiceId = invRows[0].id;
          const currentPaid = Number(invRows[0].paidAmount);
          const netDue = Number(invRows[0].netDue);
          const newPaid = currentPaid + numAmount;
          const remaining = Math.max(0, netDue - newPaid);
          const invStatus = newPaid >= netDue && netDue > 0 ? "paid" : newPaid > 0 ? "partial" : "unpaid";

          await db
            .update(centerFeeInvoices)
            .set({
              paidAmount: newPaid.toFixed(2),
              remainingAmount: remaining.toFixed(2),
              status: invStatus,
            })
            .where(eq(centerFeeInvoices.id, invoiceId));
        } else {
          invoiceId = `cfi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const remaining = Math.max(0, baseFeeNum - numAmount);
          const invStatus = numAmount >= baseFeeNum && baseFeeNum > 0 ? "paid" : numAmount > 0 ? "partial" : "unpaid";

          await db.insert(centerFeeInvoices).values({
            id: invoiceId,
            studentId: student.id,
            groupId: targetGroupId,
            billingMonth: currentMonth,
            baseFee: baseFeeNum.toFixed(2),
            discountAmount: "0.00",
            netDue: baseFeeNum.toFixed(2),
            paidAmount: numAmount.toFixed(2),
            remainingAmount: remaining.toFixed(2),
            status: invStatus,
          });
        }
      }

      // Insert collection record
      const collectionId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(centerCollections).values({
        id: collectionId,
        receiptNumber,
        invoiceId: invoiceId || null,
        studentId: student.id,
        groupId: targetGroupId || "general",
        billingMonth: currentMonth,
        amount: numAmount.toFixed(2),
        paymentMethod: method === "cash_center" ? "cash" : method,
        status: "active",
        collectedBy: ctx.user.name || ctx.user.id,
        notes,
      });

      // Dispatch Parent Notification
      dispatchFeeReceiptNotification({
        collectionId,
        receiptNumber,
        studentId: student.id,
        studentName: student.name,
        groupName,
        billingMonth: currentMonth,
        amount: numAmount.toFixed(2),
        paymentMethod: method,
        remainingAmount: Math.max(0, baseFeeNum - numAmount).toFixed(2),
        collectedBy: ctx.user.name || ctx.user.id,
      }).catch((e) => console.error("Fee receipt notification error:", e));

      return NextResponse.json({
        success: true,
        receiptNumber,
        payment: {
          id: collectionId,
          receiptNumber,
          studentId: student.id,
          studentName: student.name,
          amount: numAmount.toFixed(2),
          method,
          status: "active",
        },
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

      // Check teacher scope
      if (ctx.user.role === "teacher" && groupId) {
        const grp = await db.select().from(centerGroups).where(eq(centerGroups.id, groupId)).limit(1);
        if (grp.length === 0 || grp[0].teacherId !== ctx.user.id) {
          return NextResponse.json({ error: "غير مصرح لك بتسجيل حضور مجموعة مدرس آخر" }, { status: 403 });
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

        let attRecordId = "";
        if (existing.length > 0) {
          attRecordId = existing[0].id;
          const prevStatus = existing[0].status;
          if (prevStatus !== m.status) {
            await db.insert(attendanceAuditLogs).values({
              id: `aal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              attendanceRecordId: attRecordId,
              studentId: m.studentId,
              previousStatus: prevStatus,
              newStatus: m.status,
              changedBy: ctx.user.name || ctx.user.id,
              reason: "تعديل عبر الرصد الجماعي",
            });
          }
          await db
            .update(attendanceRecords)
            .set({
              status: m.status,
              markedBy: ctx.user.name || ctx.user.id,
              updatedBy: ctx.user.name || ctx.user.id,
              updatedAt: new Date(),
            })
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

    // ============ STUDENT: SELF CHECK-IN (Strict Security Guard) ============
    if (action === "check_in") {
      const today = new Date().toISOString().split("T")[0];
      const { sessionId, sessionTitle } = body;

      // Verify active session with self check-in enabled
      let targetSession: any = null;
      if (sessionId) {
        const sesRows = await db.select().from(centerSessions).where(eq(centerSessions.id, sessionId)).limit(1);
        targetSession = sesRows[0];
      } else if (sessionTitle) {
        const sesRows = await db
          .select()
          .from(centerSessions)
          .where(and(eq(centerSessions.title, sessionTitle), eq(centerSessions.sessionDate, today)))
          .limit(1);
        targetSession = sesRows[0];
      }

      // Guard: strictly block self check-in if session is not active or self-checkin is disabled
      if (!targetSession || targetSession.status !== "active" || !targetSession.isSelfCheckInAllowed) {
        return NextResponse.json(
          { error: "تسجيل الحضور الذاتي غير متاح لهذه الحصة أو الحصة مغلقة حالياً بالسنتر" },
          { status: 403 }
        );
      }

      const title = targetSession.title;

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
        groupId: targetSession.groupId || null,
        sessionId: targetSession.id,
        scanMethod: "student_self_checkin",
        arrivalTime: new Date(),
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

    // ============ SESSION MANAGEMENT: CREATE & UPDATE SESSIONS ============
    if (action === "create_session") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const { groupId, title, sessionDate, startTime, endTime, room, isSelfCheckInAllowed } = body;
      if (!groupId || !title || !sessionDate) {
        return NextResponse.json({ error: "groupId, title & sessionDate are required" }, { status: 400 });
      }

      const sessionId = `ses_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await db.insert(centerSessions).values({
        id: sessionId,
        groupId,
        title: title.trim(),
        sessionDate,
        startTime: startTime || null,
        endTime: endTime || null,
        room: room || null,
        teacherId: ctx.user.role === "teacher" ? ctx.user.id : body.teacherId || null,
        status: "active",
        isSelfCheckInAllowed: Boolean(isSelfCheckInAllowed),
      });

      return NextResponse.json({ success: true, sessionId, message: "تم إنشاء الحصة بنجاح" });
    }

    if (action === "update_session") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const { sessionId, status, isSelfCheckInAllowed } = body;
      if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 });

      await db
        .update(centerSessions)
        .set({
          status: status || undefined,
          isSelfCheckInAllowed: isSelfCheckInAllowed !== undefined ? Boolean(isSelfCheckInAllowed) : undefined,
        })
        .where(eq(centerSessions.id, sessionId));

      return NextResponse.json({ success: true, message: "تم تحديث إعدادات الحصة" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Attendance POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err?.message }, { status: 500 });
  }
}
