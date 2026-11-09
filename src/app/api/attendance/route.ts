import { db } from "@/db";
import { attendanceRecords, users, parentLinks, payments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { dispatchAttendanceNotification } from "@/lib/parent-connect-dispatcher";

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
  const date = searchParams.get("date");
  const role = ctx.user.role as string;
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  try {
    // ============ TEACHER / ADMIN: full roster + stats + fees ============
    if (role === "teacher" || role === "admin") {
      const allStudents = await db.select().from(users).where(eq(users.role, "student"));
      const allRecords = await db.select().from(attendanceRecords);
      const allPayments = await db.select().from(payments);

      const monthlyFee = 250;

      // Per-student summary
      const roster = allStudents.map((st) => {
        const recs = allRecords.filter((r) => r.studentId === st.id);
        const todayRec = date ? recs.find((r) => r.sessionDate === date) : null;

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
          studentName: st.name,
          email: st.email,
          phone: st.phone || "",
          parentPhone: st.parentPhone || "",
          grade: st.grade || "",
          stage: st.stage || "",
          avatar: st.avatar || "",
          studentCode: `PA-${st.id.slice(-6).toUpperCase()}`,
          totalSessions: recs.length,
          presentCount: recs.filter((r) => r.status === "present").length,
          lateCount: recs.filter((r) => r.status === "late").length,
          absentCount: recs.filter((r) => r.status === "absent").length,
          excusedCount: recs.filter((r) => r.status === "excused").length,
          rate: computeRate(recs),
          statusOnDate: todayRec?.status || null,
          monthlyFee,
          totalPaidThisMonth,
          remainingAmount: remaining,
          feeStatus,
          lastPayment: stPayments[stPayments.length - 1] || null,
        };
      });

      const sessionTitles = [...new Set(allRecords.map((r) => r.sessionTitle))];
      const recentDates = [...new Set(allRecords.map((r) => r.sessionDate))].sort((a, b) => (a < b ? 1 : -1)).slice(0, 20);

      // Total collected fees this month
      const totalRevenueMonth = allPayments
        .filter((p) => (p.status === "approved" || p.status === "paid") && p.createdAt && new Date(p.createdAt).toISOString().slice(0, 7) === currentMonth)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      return NextResponse.json({ roster, sessionTitles, recentDates, role, currentMonth, totalRevenueMonth });
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

    // ============ STUDENT: own records + ID card details + fees ============
    const records = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentId, ctx.user.id));
    const sorted = records.sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1));

    const stPayments = await db
      .select()
      .from(payments)
      .where(and(eq(payments.studentId, ctx.user.id), eq(payments.status, "approved")))
      .orderBy(desc(payments.createdAt));

    const monthlyFee = 250;
    const currentMonthPayments = stPayments.filter(
      (p) => p.createdAt && new Date(p.createdAt).toISOString().slice(0, 7) === currentMonth
    );
    const totalPaidThisMonth = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const remainingAmount = Math.max(0, monthlyFee - totalPaidThisMonth);
    const feeStatus = totalPaidThisMonth >= monthlyFee ? "paid" : totalPaidThisMonth > 0 ? "partial" : "unpaid";

    return NextResponse.json({
      role: "student",
      studentId: ctx.user.id,
      studentCode: `PA-${ctx.user.id.slice(-6).toUpperCase()}`,
      records: sorted,
      rate: computeRate(records),
      total: records.length,
      presentCount: records.filter((r) => r.status === "present").length,
      lateCount: records.filter((r) => r.status === "late").length,
      absentCount: records.filter((r) => r.status === "absent").length,
      feeInfo: {
        monthlyFee,
        totalPaidThisMonth,
        remainingAmount,
        feeStatus,
        currentMonth,
        payments: stPayments.slice(0, 5),
      },
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

    // ============ TEACHER / ADMIN: LIVE QR CODE SCAN FROM MOBILE ============
    if (action === "qr_scan") {
      const { denied } = await requireRoles(req, ["teacher", "admin"]);
      if (denied) return denied;

      const {
        qrCodeData,
        sessionTitle = "الحصة الأسبوعية مع مستر حبيب",
        sessionDate = new Date().toISOString().split("T")[0],
      } = body;

      if (!qrCodeData) {
        return NextResponse.json({ error: "بيانات كود الـ QR مطلوبة" }, { status: 400 });
      }

      // Extract student identifier
      // Format can be: "PA:usr_student_1" or "usr_student_1" or JSON or student phone
      let studentIdentifier = String(qrCodeData).trim();
      if (studentIdentifier.startsWith("PA:")) {
        studentIdentifier = studentIdentifier.replace("PA:", "").trim();
      } else if (studentIdentifier.startsWith("{")) {
        try {
          const parsed = JSON.parse(studentIdentifier);
          studentIdentifier = parsed.sid || parsed.id || parsed.studentId || studentIdentifier;
        } catch {}
      }

      // Look up student by id or phone or username
      const allStudents = await db.select().from(users).where(eq(users.role, "student"));
      const student = allStudents.find(
        (s) =>
          s.id === studentIdentifier ||
          s.phone === studentIdentifier ||
          s.username === studentIdentifier ||
          s.id.toLowerCase().endsWith(studentIdentifier.toLowerCase()) ||
          s.name.toLowerCase() === studentIdentifier.toLowerCase()
      );

      if (!student) {
        return NextResponse.json(
          { error: "لم يتم العثور على طالب مسجل بهذا الكود في المنصة", studentIdentifier },
          { status: 404 }
        );
      }

      // Record attendance
      const existing = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.studentId, student.id),
            eq(attendanceRecords.sessionTitle, sessionTitle),
            eq(attendanceRecords.sessionDate, sessionDate)
          )
        );

      let record;
      let alreadyMarked = false;
      const scanTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

      if (existing.length > 0) {
        alreadyMarked = true;
        record = existing[0];
        if (record.status !== "present") {
          await db
            .update(attendanceRecords)
            .set({ status: "present", markedBy: ctx.user.id })
            .where(eq(attendanceRecords.id, record.id));
          record.status = "present";
        }
      } else {
        record = {
          id: `att_${Date.now()}_${student.id}`,
          studentId: student.id,
          studentName: student.name,
          sessionTitle,
          sessionDate,
          status: "present",
          grade: student.grade || "",
          markedBy: ctx.user.id,
        };
        await db.insert(attendanceRecords).values(record);
      }

      // Dispatch parent notification (WhatsApp / Telegram) with anti-duplication
      dispatchAttendanceNotification({
        attendanceRecordId: record.id,
        studentId: student.id,
        studentName: student.name,
        sessionTitle,
        sessionDate,
        status: "present",
        markedBy: ctx.user.id,
      }).catch((err) => console.error("Parent attendance notify error:", err));

      // Calculate Payment Status
      const allPayments = await db.select().from(payments).where(eq(payments.studentId, student.id));
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyFee = 250;
      const monthPayments = allPayments.filter(
        (p) =>
          (p.status === "approved" || p.status === "paid") &&
          p.createdAt &&
          new Date(p.createdAt).toISOString().slice(0, 7) === currentMonth
      );
      const totalPaid = monthPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      const remainingAmount = Math.max(0, monthlyFee - totalPaid);
      const feeStatus = totalPaid >= monthlyFee ? "paid" : totalPaid > 0 ? "partial" : "unpaid";

      return NextResponse.json({
        success: true,
        alreadyMarked,
        scanTime,
        record,
        student: {
          id: student.id,
          name: student.name,
          phone: student.phone || "",
          parentPhone: student.parentPhone || "",
          grade: student.grade || "",
          avatar: student.avatar || "",
          studentCode: `PA-${student.id.slice(-6).toUpperCase()}`,
        },
        paymentStatus: {
          monthlyFee,
          totalPaid,
          remainingAmount,
          feeStatus,
          currentMonth,
        },
      });
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

        let attRecordId = "";
        if (existing.length > 0) {
          attRecordId = existing[0].id;
          await db
            .update(attendanceRecords)
            .set({ status: m.status, markedBy: ctx.user.id })
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
            markedBy: ctx.user.id,
          });
        }

        // Notify parent automatically based on marked status (absent / present / late)
        dispatchAttendanceNotification({
          attendanceRecordId: attRecordId,
          studentId: m.studentId,
          studentName: m.studentName || "Student",
          sessionTitle,
          sessionDate,
          status: m.status || "present",
          markedBy: ctx.user.id,
        }).catch((err) => console.error("Roster notify parent error:", err));

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
