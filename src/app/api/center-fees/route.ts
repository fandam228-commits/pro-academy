import { db } from "@/db";
import {
  centerGroups,
  centerGroupStudents,
  centerFeeInvoices,
  centerCollections,
  centerFinancialAdjustments,
  users,
  parentStudentLinks,
  parentLinks,
} from "@/db/schema";
import { eq, and, sql, or, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { dispatchFeeReceiptNotification, dispatchFeeReminder, dispatchOverdueFeeWarning } from "@/lib/parent-connect-dispatcher";

// Generate sequential receipt number: PA-REC-YYYYMM-XXXX
async function getNextReceiptNumber(billingMonth: string): Promise<string> {
  const yyyymm = (billingMonth || new Date().toISOString().slice(0, 7)).replace("-", "");
  const prefix = `PA-REC-${yyyymm}-`;

  const existing = await db
    .select({ receiptNumber: centerCollections.receiptNumber })
    .from(centerCollections)
    .where(sql`${centerCollections.receiptNumber} LIKE ${prefix + "%"}`);

  let maxSeq = 0;
  for (const row of existing) {
    const parts = row.receiptNumber.split("-");
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "overview";
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const groupId = searchParams.get("groupId");
  const studentId = searchParams.get("studentId");
  const receiptNumber = searchParams.get("receiptNumber");
  const role = ctx.user.role;

  try {
    // -------------------------------------------------------------
    // STUDENT ACCESS: Only own fee status & receipts
    // -------------------------------------------------------------
    if (role === "student") {
      const myInvoices = await db
        .select()
        .from(centerFeeInvoices)
        .where(eq(centerFeeInvoices.studentId, ctx.user.id))
        .orderBy(desc(centerFeeInvoices.billingMonth));

      const myCollections = await db
        .select()
        .from(centerCollections)
        .where(and(eq(centerCollections.studentId, ctx.user.id), eq(centerCollections.status, "active")))
        .orderBy(desc(centerCollections.collectedAt));

      const groups = await db.select().from(centerGroups);
      const groupMap = new Map(groups.map((g) => [g.id, g.name]));

      const totalBilled = myInvoices.reduce((sum, inv) => sum + Math.round(Number(inv.netDue) * 100), 0);
      const totalPaid = myCollections.reduce((sum, col) => sum + Math.round(Number(col.amount) * 100), 0);
      const remainingBalance = Math.max(0, totalBilled - totalPaid);

      return NextResponse.json({
        success: true,
        summary: {
          totalBilled: (totalBilled / 100).toFixed(2),
          totalPaid: (totalPaid / 100).toFixed(2),
          remainingBalance: (remainingBalance / 100).toFixed(2),
          currentMonth: month,
        },
        invoices: myInvoices.map((inv) => ({
          ...inv,
          groupName: groupMap.get(inv.groupId) || "المجموعة",
        })),
        collections: myCollections.map((col) => ({
          ...col,
          groupName: groupMap.get(col.groupId) || "المجموعة",
        })),
      });
    }

    // -------------------------------------------------------------
    // PARENT ACCESS: Only linked children
    // -------------------------------------------------------------
    if (role === "parent") {
      // Find linked students
      const modernLinks = await db
        .select({ studentId: parentStudentLinks.studentId })
        .from(parentStudentLinks)
        .where(eq(parentStudentLinks.parentId, ctx.user.id));

      const legacyLinks = await db
        .select({ studentId: parentLinks.studentId })
        .from(parentLinks)
        .where(eq(parentLinks.parentId, ctx.user.id));

      const linkedStudentIds = [...new Set([...modernLinks.map((l) => l.studentId), ...legacyLinks.map((l) => l.studentId)])];

      if (linkedStudentIds.length === 0) {
        return NextResponse.json({ success: true, children: [], invoices: [], collections: [] });
      }

      const targetStudentId = studentId && linkedStudentIds.includes(studentId) ? studentId : linkedStudentIds[0];

      const childUser = await db.select().from(users).where(eq(users.id, targetStudentId)).limit(1);
      const childInvoices = await db
        .select()
        .from(centerFeeInvoices)
        .where(eq(centerFeeInvoices.studentId, targetStudentId))
        .orderBy(desc(centerFeeInvoices.billingMonth));

      const childCollections = await db
        .select()
        .from(centerCollections)
        .where(and(eq(centerCollections.studentId, targetStudentId), eq(centerCollections.status, "active")))
        .orderBy(desc(centerCollections.collectedAt));

      const groups = await db.select().from(centerGroups);
      const groupMap = new Map(groups.map((g) => [g.id, g.name]));

      const totalBilled = childInvoices.reduce((sum, inv) => sum + Math.round(Number(inv.netDue) * 100), 0);
      const totalPaid = childCollections.reduce((sum, col) => sum + Math.round(Number(col.amount) * 100), 0);

      return NextResponse.json({
        success: true,
        child: childUser[0] || null,
        linkedStudentIds,
        summary: {
          totalBilled: (totalBilled / 100).toFixed(2),
          totalPaid: (totalPaid / 100).toFixed(2),
          remainingBalance: Math.max(0, (totalBilled - totalPaid) / 100).toFixed(2),
        },
        invoices: childInvoices.map((inv) => ({ ...inv, groupName: groupMap.get(inv.groupId) || "المجموعة" })),
        collections: childCollections.map((col) => ({ ...col, groupName: groupMap.get(col.groupId) || "المجموعة" })),
      });
    }

    // -------------------------------------------------------------
    // TEACHER & ADMIN ACCESS
    // -------------------------------------------------------------
    if (role !== "admin" && role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let accessibleGroupIds: string[] = [];
    const allGroups = await db.select().from(centerGroups);

    if (role === "teacher") {
      // Teacher sees ONLY groups assigned to them
      accessibleGroupIds = allGroups.filter((g) => g.teacherId === ctx.user.id).map((g) => g.id);
    } else {
      // Admin sees all groups
      accessibleGroupIds = allGroups.map((g) => g.id);
    }

    const groupMap = new Map(allGroups.map((g) => [g.id, g]));

    // VIEW: SINGLE RECEIPT LOOKUP
    if (view === "receipt" && receiptNumber) {
      const colRows = await db
        .select()
        .from(centerCollections)
        .where(eq(centerCollections.receiptNumber, receiptNumber))
        .limit(1);

      if (colRows.length === 0) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }

      const receipt = colRows[0];
      if (role === "teacher" && !accessibleGroupIds.includes(receipt.groupId)) {
        return NextResponse.json({ error: "Access denied to this group receipt" }, { status: 403 });
      }

      const student = await db.select().from(users).where(eq(users.id, receipt.studentId)).limit(1);
      const group = groupMap.get(receipt.groupId);

      return NextResponse.json({
        success: true,
        receipt,
        student: student[0] || null,
        group: group || null,
      });
    }

    // VIEW: STUDENT FEE SUMMARY
    if (view === "student_summary" && studentId) {
      const studentRows = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
      if (studentRows.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      const student = studentRows[0];
      const invoices = await db
        .select()
        .from(centerFeeInvoices)
        .where(eq(centerFeeInvoices.studentId, studentId))
        .orderBy(desc(centerFeeInvoices.billingMonth));

      const collections = await db
        .select()
        .from(centerCollections)
        .where(eq(centerCollections.studentId, studentId))
        .orderBy(desc(centerCollections.collectedAt));

      const totalBilled = invoices.reduce((sum, inv) => sum + Math.round(Number(inv.netDue) * 100), 0);
      const totalPaid = collections
        .filter((c) => c.status === "active")
        .reduce((sum, col) => sum + Math.round(Number(col.amount) * 100), 0);

      return NextResponse.json({
        success: true,
        student,
        summary: {
          totalBilled: (totalBilled / 100).toFixed(2),
          totalPaid: (totalPaid / 100).toFixed(2),
          remainingBalance: Math.max(0, (totalBilled - totalPaid) / 100).toFixed(2),
        },
        invoices: invoices.map((inv) => ({ ...inv, groupName: groupMap.get(inv.groupId)?.name || "المجموعة" })),
        collections: collections.map((col) => ({ ...col, groupName: groupMap.get(col.groupId)?.name || "المجموعة" })),
      });
    }

    // VIEW: COLLECTIONS LIST
    if (view === "collections") {
      let query = db.select().from(centerCollections);
      const allCols = await query.orderBy(desc(centerCollections.collectedAt));

      const filteredCols = allCols.filter((col) => {
        if (!accessibleGroupIds.includes(col.groupId)) return false;
        if (groupId && groupId !== "all" && col.groupId !== groupId) return false;
        if (month && month !== "all" && col.billingMonth !== month) return false;
        if (studentId && col.studentId !== studentId) return false;
        return true;
      });

      const studentRows = await db.select({ id: users.id, name: users.name, studentCode: users.studentCode, phone: users.phone }).from(users);
      const studentMap = new Map(studentRows.map((s) => [s.id, s]));

      return NextResponse.json({
        success: true,
        collections: filteredCols.map((col) => {
          const st = studentMap.get(col.studentId);
          return {
            ...col,
            studentName: st?.name || "طالب",
            studentCode: st?.studentCode,
            groupName: groupMap.get(col.groupId)?.name || "المجموعة",
          };
        }),
      });
    }

    // VIEW: INVOICES LIST
    if (view === "invoices") {
      const allInvs = await db.select().from(centerFeeInvoices).orderBy(desc(centerFeeInvoices.billingMonth));
      const filteredInvs = allInvs.filter((inv) => {
        if (!accessibleGroupIds.includes(inv.groupId)) return false;
        if (groupId && groupId !== "all" && inv.groupId !== groupId) return false;
        if (month && month !== "all" && inv.billingMonth !== month) return false;
        if (studentId && inv.studentId !== studentId) return false;
        return true;
      });

      const studentRows = await db.select({ id: users.id, name: users.name, studentCode: users.studentCode }).from(users);
      const studentMap = new Map(studentRows.map((s) => [s.id, s]));

      return NextResponse.json({
        success: true,
        invoices: filteredInvs.map((inv) => {
          const st = studentMap.get(inv.studentId);
          return {
            ...inv,
            studentName: st?.name || "طالب",
            studentCode: st?.studentCode,
            groupName: groupMap.get(inv.groupId)?.name || "المجموعة",
          };
        }),
      });
    }

    // DEFAULT VIEW: OVERVIEW (Financial KPIs)
    const monthInvoices = await db
      .select()
      .from(centerFeeInvoices)
      .where(eq(centerFeeInvoices.billingMonth, month));

    const monthCollections = await db
      .select()
      .from(centerCollections)
      .where(and(eq(centerCollections.billingMonth, month), eq(centerCollections.status, "active")));

    const scopedInvoices = monthInvoices.filter((inv) => accessibleGroupIds.includes(inv.groupId));
    const scopedCollections = monthCollections.filter((col) => accessibleGroupIds.includes(col.groupId));

    const totalBilledCents = scopedInvoices.reduce((sum, inv) => sum + Math.round(Number(inv.netDue) * 100), 0);
    const totalCollectedCents = scopedCollections.reduce((sum, col) => sum + Math.round(Number(col.amount) * 100), 0);
    const totalOverdueCents = Math.max(0, totalBilledCents - totalCollectedCents);

    const todayDate = new Date().toISOString().split("T")[0];
    const todayCollectionsCents = scopedCollections
      .filter((c) => c.collectedAt && new Date(c.collectedAt).toISOString().split("T")[0] === todayDate)
      .reduce((sum, c) => sum + Math.round(Number(c.amount) * 100), 0);

    return NextResponse.json({
      success: true,
      month,
      accessibleGroups: allGroups.filter((g) => accessibleGroupIds.includes(g.id)),
      kpis: {
        totalBilled: (totalBilledCents / 100).toFixed(2),
        totalCollected: (totalCollectedCents / 100).toFixed(2),
        totalOverdue: (totalOverdueCents / 100).toFixed(2),
        todayCollected: (todayCollectionsCents / 100).toFixed(2),
        collectionRate: totalBilledCents > 0 ? Math.round((totalCollectedCents / totalBilledCents) * 100) : 100,
        invoiceCount: scopedInvoices.length,
        collectionCount: scopedCollections.length,
      },
    });
  } catch (error: any) {
    console.error("Center Fees GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
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

    // -------------------------------------------------------------
    // ACTION: COLLECT FEE ON THE SPOT
    // -------------------------------------------------------------
    if (action === "collect_fee") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const { studentId, groupId, billingMonth, amount, paymentMethod = "cash", transactionReference, notes } = body;

      if (!studentId || !groupId || !amount) {
        return NextResponse.json({ error: "studentId, groupId والمبلغ حقول إلزامية" }, { status: 400 });
      }

      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "قيمة المبلغ غير صحيحة" }, { status: 400 });
      }

      // Verify Student
      const studentRows = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
      if (studentRows.length === 0) return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
      const student = studentRows[0];

      // Verify Group
      const groupRows = await db.select().from(centerGroups).where(eq(centerGroups.id, groupId)).limit(1);
      if (groupRows.length === 0) return NextResponse.json({ error: "المجموعة غير موجودة" }, { status: 404 });
      const group = groupRows[0];

      // Scope check for teachers
      if (ctx.user.role === "teacher" && group.teacherId !== ctx.user.id) {
        return NextResponse.json({ error: "غير مصرح لك بتحصيل رسوم لمجموعة مدرس آخر" }, { status: 403 });
      }

      const currentMonth = billingMonth || new Date().toISOString().slice(0, 7);
      const receiptNumber = await getNextReceiptNumber(currentMonth);

      // 1. Locate or create invoice for this student, group, and month
      const existingInvoices = await db
        .select()
        .from(centerFeeInvoices)
        .where(
          and(
            eq(centerFeeInvoices.studentId, studentId),
            eq(centerFeeInvoices.groupId, groupId),
            eq(centerFeeInvoices.billingMonth, currentMonth)
          )
        )
        .limit(1);

      let invoiceId = "";
      let baseFeeNum = Number(group.monthlyFee || 0);
      let netDueNum = baseFeeNum;
      let alreadyPaidNum = 0;

      if (existingInvoices.length > 0) {
        const inv = existingInvoices[0];
        invoiceId = inv.id;
        baseFeeNum = Number(inv.baseFee);
        netDueNum = Number(inv.netDue);
        alreadyPaidNum = Number(inv.paidAmount);
      } else {
        // Create new invoice
        invoiceId = `cfi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await db.insert(centerFeeInvoices).values({
          id: invoiceId,
          studentId,
          groupId,
          billingMonth: currentMonth,
          baseFee: baseFeeNum.toFixed(2),
          discountAmount: "0.00",
          netDue: netDueNum.toFixed(2),
          paidAmount: "0.00",
          remainingAmount: netDueNum.toFixed(2),
          status: "unpaid",
        });
      }

      // Calculate updated balances in cents
      const newPaidCents = Math.round(alreadyPaidNum * 100) + Math.round(numAmount * 100);
      const netDueCents = Math.round(netDueNum * 100);
      const remainingCents = Math.max(0, netDueCents - newPaidCents);

      let invoiceStatus = "unpaid";
      if (newPaidCents >= netDueCents && netDueCents > 0) invoiceStatus = "paid";
      else if (newPaidCents > 0) invoiceStatus = "partial";

      // 2. Insert Collection Record
      const collectionId = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await db.insert(centerCollections).values({
        id: collectionId,
        receiptNumber,
        invoiceId,
        studentId,
        groupId,
        billingMonth: currentMonth,
        amount: numAmount.toFixed(2),
        paymentMethod,
        transactionReference: transactionReference || null,
        status: "active",
        collectedBy: ctx.user.name || ctx.user.id,
        notes: notes || null,
      });

      // 3. Update Invoice
      await db
        .update(centerFeeInvoices)
        .set({
          paidAmount: (newPaidCents / 100).toFixed(2),
          remainingAmount: (remainingCents / 100).toFixed(2),
          status: invoiceStatus,
        })
        .where(eq(centerFeeInvoices.id, invoiceId));

      // 4. Dispatch Parent Notification
      dispatchFeeReceiptNotification({
        collectionId,
        receiptNumber,
        studentId,
        studentName: student.name,
        groupName: group.name,
        billingMonth: currentMonth,
        amount: numAmount.toFixed(2),
        paymentMethod,
        remainingAmount: (remainingCents / 100).toFixed(2),
        collectedBy: ctx.user.name || ctx.user.id,
      }).catch((e) => console.error("Fee receipt notification dispatch error:", e));

      return NextResponse.json({
        success: true,
        message: "تم تسجيل التحصيل وإصدار الإيصال بنجاح",
        receipt: {
          id: collectionId,
          receiptNumber,
          studentName: student.name,
          studentCode: student.studentCode,
          groupName: group.name,
          billingMonth: currentMonth,
          amount: numAmount.toFixed(2),
          paymentMethod,
          remainingAmount: (remainingCents / 100).toFixed(2),
          collectedAt: new Date().toISOString(),
          collectedBy: ctx.user.name || ctx.user.id,
        },
      });
    }

    // -------------------------------------------------------------
    // ACTION: GRANT DISCOUNT OR FEE WAIVER (ADMIN ONLY)
    // -------------------------------------------------------------
    if (action === "grant_discount" || action === "waive_fee") {
      const { denied } = await requireRoles(req, ["admin"]);
      if (denied) return denied;

      const { studentId, groupId, billingMonth, discountAmount, reason } = body;
      if (!studentId || !groupId || !billingMonth || discountAmount === undefined) {
        return NextResponse.json({ error: "بيانات الخصم غير مكتملة" }, { status: 400 });
      }

      const discNum = Math.max(0, Number(discountAmount));
      const group = await db.select().from(centerGroups).where(eq(centerGroups.id, groupId)).limit(1);
      if (group.length === 0) return NextResponse.json({ error: "المجموعة غير موجودة" }, { status: 404 });

      // Find or create invoice
      const invRows = await db
        .select()
        .from(centerFeeInvoices)
        .where(
          and(
            eq(centerFeeInvoices.studentId, studentId),
            eq(centerFeeInvoices.groupId, groupId),
            eq(centerFeeInvoices.billingMonth, billingMonth)
          )
        )
        .limit(1);

      let invoiceId = "";
      let baseFee = Number(group[0].monthlyFee || 0);
      let paid = 0;

      if (invRows.length > 0) {
        invoiceId = invRows[0].id;
        baseFee = Number(invRows[0].baseFee);
        paid = Number(invRows[0].paidAmount);
      } else {
        invoiceId = `cfi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await db.insert(centerFeeInvoices).values({
          id: invoiceId,
          studentId,
          groupId,
          billingMonth,
          baseFee: baseFee.toFixed(2),
          discountAmount: "0.00",
          netDue: baseFee.toFixed(2),
          paidAmount: "0.00",
          remainingAmount: baseFee.toFixed(2),
          status: "unpaid",
        });
      }

      const netDue = Math.max(0, baseFee - discNum);
      const remaining = Math.max(0, netDue - paid);
      let status = "unpaid";
      if (paid >= netDue && netDue > 0) status = "paid";
      else if (paid > 0) status = "partial";
      else if (netDue === 0 && discNum > 0) status = "waived";

      await db
        .update(centerFeeInvoices)
        .set({
          discountAmount: discNum.toFixed(2),
          discountApprovedBy: ctx.user.name || ctx.user.id,
          netDue: netDue.toFixed(2),
          remainingAmount: remaining.toFixed(2),
          status,
          notes: reason ? `خصم معتمد: ${reason}` : undefined,
        })
        .where(eq(centerFeeInvoices.id, invoiceId));

      await db.insert(centerFinancialAdjustments).values({
        id: `cfa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        invoiceId,
        adjustmentType: action === "waive_fee" ? "waiver" : "discount",
        amount: discNum.toFixed(2),
        reason: reason || "اعتماد خصم من الإدارة",
        authorizedBy: ctx.user.name || ctx.user.id,
      });

      return NextResponse.json({ success: true, message: "تم اعتماد الخصم وتسجيله في سجل التعديلات المالية" });
    }

    // -------------------------------------------------------------
    // ACTION: VOID A COLLECTION (REVERSAL / NO HARD DELETE)
    // -------------------------------------------------------------
    if (action === "void_collection") {
      const { denied } = await requireRoles(req, ["admin"]);
      if (denied) return denied;

      const { collectionId, receiptNumber, reason } = body;
      if (!reason) return NextResponse.json({ error: "سبب الإلغاء مطلوب" }, { status: 400 });

      let colRow = null;
      if (collectionId) {
        const rows = await db.select().from(centerCollections).where(eq(centerCollections.id, collectionId)).limit(1);
        colRow = rows[0];
      } else if (receiptNumber) {
        const rows = await db.select().from(centerCollections).where(eq(centerCollections.receiptNumber, receiptNumber)).limit(1);
        colRow = rows[0];
      }

      if (!colRow) return NextResponse.json({ error: "الإيصال غير موجود" }, { status: 404 });
      if (colRow.status === "voided") return NextResponse.json({ error: "تم إلغاء هذا الإيصال مسبقاً" }, { status: 400 });

      // Void collection
      await db
        .update(centerCollections)
        .set({ status: "voided", notes: `${colRow.notes ? colRow.notes + " | " : ""}تم الإلغاء: ${reason}` })
        .where(eq(centerCollections.id, colRow.id));

      // Recalculate invoice if linked
      if (colRow.invoiceId) {
        const invRows = await db.select().from(centerFeeInvoices).where(eq(centerFeeInvoices.id, colRow.invoiceId)).limit(1);
        if (invRows.length > 0) {
          const inv = invRows[0];
          const activeCols = await db
            .select()
            .from(centerCollections)
            .where(and(eq(centerCollections.invoiceId, inv.id), eq(centerCollections.status, "active")));

          const newPaidCents = activeCols.reduce((sum, c) => sum + Math.round(Number(c.amount) * 100), 0);
          const netDueCents = Math.round(Number(inv.netDue) * 100);
          const remainingCents = Math.max(0, netDueCents - newPaidCents);

          let status = "unpaid";
          if (newPaidCents >= netDueCents && netDueCents > 0) status = "paid";
          else if (newPaidCents > 0) status = "partial";

          await db
            .update(centerFeeInvoices)
            .set({
              paidAmount: (newPaidCents / 100).toFixed(2),
              remainingAmount: (remainingCents / 100).toFixed(2),
              status,
            })
            .where(eq(centerFeeInvoices.id, inv.id));
        }
      }

      // Log adjustment
      await db.insert(centerFinancialAdjustments).values({
        id: `cfa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        collectionId: colRow.id,
        invoiceId: colRow.invoiceId || null,
        adjustmentType: "void_collection",
        amount: colRow.amount,
        reason,
        authorizedBy: ctx.user.name || ctx.user.id,
      });

      return NextResponse.json({ success: true, message: "تم إلغاء الإيصال وتحديث الرصيد وسجل المراجعة" });
    }

    // -------------------------------------------------------------
    // ACTION: GENERATE MONTHLY INVOICES FOR ALL ACTIVE GROUP STUDENTS
    // -------------------------------------------------------------
    if (action === "generate_invoices") {
      const { denied } = await requireRoles(req, ["admin"]);
      if (denied) return denied;

      const targetMonth = body.billingMonth || new Date().toISOString().slice(0, 7);
      const targetGroupId = body.groupId;

      let groupQuery = db.select().from(centerGroups).where(eq(centerGroups.isActive, true));
      const groups = await groupQuery;
      const relevantGroups = targetGroupId && targetGroupId !== "all" ? groups.filter((g) => g.id === targetGroupId) : groups;

      let createdCount = 0;

      for (const grp of relevantGroups) {
        const baseFee = Number(grp.monthlyFee || 0);

        // Get group students from centerGroupStudents, or fallback to users with groupId
        const groupMembers = await db
          .select()
          .from(centerGroupStudents)
          .where(and(eq(centerGroupStudents.groupId, grp.id), eq(centerGroupStudents.status, "active")));

        let studentIds: string[] = groupMembers.map((m) => m.studentId);

        if (studentIds.length === 0) {
          const directStudents = await db
            .select({ id: users.id })
            .from(users)
            .where(and(eq(users.role, "student"), eq(users.groupId, grp.id)));
          studentIds = directStudents.map((s) => s.id);
        }

        for (const sid of studentIds) {
          const memberMeta = groupMembers.find((m) => m.studentId === sid);
          const customFee = memberMeta?.customMonthlyFee ? Number(memberMeta.customMonthlyFee) : baseFee;
          const discount = memberMeta?.discountAmount ? Number(memberMeta.discountAmount) : 0;
          const netDue = Math.max(0, customFee - discount);

          // Check if invoice already exists
          const exists = await db
            .select({ id: centerFeeInvoices.id })
            .from(centerFeeInvoices)
            .where(
              and(
                eq(centerFeeInvoices.studentId, sid),
                eq(centerFeeInvoices.groupId, grp.id),
                eq(centerFeeInvoices.billingMonth, targetMonth)
              )
            )
            .limit(1);

          if (exists.length === 0) {
            await db.insert(centerFeeInvoices).values({
              id: `cfi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              studentId: sid,
              groupId: grp.id,
              billingMonth: targetMonth,
              baseFee: customFee.toFixed(2),
              discountAmount: discount.toFixed(2),
              notes: memberMeta?.discountReason ? `خصم: ${memberMeta.discountReason}` : null,
              netDue: netDue.toFixed(2),
              paidAmount: "0.00",
              remainingAmount: netDue.toFixed(2),
              status: netDue === 0 ? "waived" : "unpaid",
            });
            createdCount++;
          }
        }
      }

      return NextResponse.json({ success: true, message: `تم إنشاء ${createdCount} مطالبة جديدة لشهر ${targetMonth}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Center Fees POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}
