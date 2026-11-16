import { db } from "@/db";
import { centerExpenses, centerExpenseCategories, centerCollections } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

async function getNextExpenseNumber(expenseDate: string): Promise<string> {
  const yyyymm = (expenseDate || new Date().toISOString().slice(0, 7)).slice(0, 7).replace("-", "");
  const prefix = `EXP-${yyyymm}-`;

  const existing = await db
    .select({ expenseNumber: centerExpenses.expenseNumber })
    .from(centerExpenses)
    .where(sql`${centerExpenses.expenseNumber} LIKE ${prefix + "%"}`);

  let maxSeq = 0;
  for (const row of existing) {
    const parts = row.expenseNumber.split("-");
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

  // Operating expenses are strictly restricted to ADMIN role
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "ledger";
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const categoryId = searchParams.get("categoryId");

  try {
    const categories = await db.select().from(centerExpenseCategories).where(eq(centerExpenseCategories.isActive, true));
    const catMap = new Map(categories.map((c) => [c.id, c]));

    // VIEW: CATEGORIES
    if (view === "categories") {
      return NextResponse.json({ success: true, categories });
    }

    // VIEW: PNL & NET OPERATING RESULT
    if (view === "pnl") {
      // 1. Center Collections for this month (Tuition only, active only)
      const collections = await db
        .select()
        .from(centerCollections)
        .where(and(eq(centerCollections.billingMonth, month), eq(centerCollections.status, "active")));

      const totalCollectionsCents = collections.reduce((sum, c) => sum + Math.round(Number(c.amount) * 100), 0);

      // 2. Center Expenses for this month (Active only)
      const allExpenses = await db.select().from(centerExpenses).where(eq(centerExpenses.status, "active"));
      const monthExpenses = allExpenses.filter((e) => e.expenseDate.startsWith(month));

      const totalExpensesCents = monthExpenses.reduce((sum, e) => sum + Math.round(Number(e.amount) * 100), 0);
      const netResultCents = totalCollectionsCents - totalExpensesCents;

      // Breakdown by category
      const categoryBreakdown = categories.map((cat) => {
        const catExpenses = monthExpenses.filter((e) => e.categoryId === cat.id);
        const catCents = catExpenses.reduce((sum, e) => sum + Math.round(Number(e.amount) * 100), 0);
        return {
          id: cat.id,
          code: cat.code,
          name: cat.name,
          totalAmount: (catCents / 100).toFixed(2),
          percentageOfExpenses: totalExpensesCents > 0 ? Math.round((catCents / totalExpensesCents) * 100) : 0,
          count: catExpenses.length,
        };
      });

      return NextResponse.json({
        success: true,
        month,
        summary: {
          totalCenterCollections: (totalCollectionsCents / 100).toFixed(2),
          totalCenterExpenses: (totalExpensesCents / 100).toFixed(2),
          netOperationalResult: (netResultCents / 100).toFixed(2),
          isPositive: netResultCents >= 0,
          accountingNote: "صافي نتيجة التشغيل للفترة = إيرادات اشتراكات السنتر - المصروفات التشغيلية المباشرة (لا يعتبر ربحاً محاسبياً نهائياً)",
        },
        categoryBreakdown,
      });
    }

    // VIEW: LEDGER (Default)
    const allExpenses = await db.select().from(centerExpenses).orderBy(desc(centerExpenses.expenseDate));

    const filtered = allExpenses.filter((e) => {
      if (month && month !== "all" && !e.expenseDate.startsWith(month)) return false;
      if (categoryId && categoryId !== "all" && e.categoryId !== categoryId) return false;
      return true;
    });

    const totalActiveCents = filtered
      .filter((e) => e.status === "active")
      .reduce((sum, e) => sum + Math.round(Number(e.amount) * 100), 0);

    return NextResponse.json({
      success: true,
      month,
      totalActiveAmount: (totalActiveCents / 100).toFixed(2),
      categories,
      expenses: filtered.map((e) => ({
        ...e,
        categoryName: catMap.get(e.categoryId)?.name || "مصروف عام",
        categoryCode: catMap.get(e.categoryId)?.code || "other",
      })),
    });
  } catch (error: any) {
    console.error("Center Expenses GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Operating expenses modification strictly restricted to ADMIN role
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action } = body;

    // -------------------------------------------------------------
    // ACTION: RECORD EXPENSE
    // -------------------------------------------------------------
    if (action === "create_expense") {
      const { title, categoryId, amount, expenseDate, paymentMethod = "cash", recipientVendor, receiptUrl, notes } = body;

      if (!title || !categoryId || !amount) {
        return NextResponse.json({ error: "العنوان، التصنيف، والمبلغ حقول مطلوبة" }, { status: 400 });
      }

      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "قيمة المصروف يجب أن تكون رقمًا موجبًا" }, { status: 400 });
      }

      const targetDate = expenseDate || new Date().toISOString().split("T")[0];
      const expenseNumber = await getNextExpenseNumber(targetDate);
      const expenseId = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      await db.insert(centerExpenses).values({
        id: expenseId,
        expenseNumber,
        categoryId,
        title: title.trim(),
        amount: numAmount.toFixed(2),
        expenseDate: targetDate,
        paymentMethod,
        recipientVendor: recipientVendor || null,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
        recordedBy: ctx.user.name || ctx.user.id,
        status: "active",
      });

      return NextResponse.json({
        success: true,
        message: "تم تسجيل المصروف بنجاح",
        expense: {
          id: expenseId,
          expenseNumber,
          title,
          amount: numAmount.toFixed(2),
          expenseDate: targetDate,
          paymentMethod,
          recordedBy: ctx.user.name || ctx.user.id,
        },
      });
    }

    // -------------------------------------------------------------
    // ACTION: VOID EXPENSE (Reversal - Never hard delete)
    // -------------------------------------------------------------
    if (action === "void_expense") {
      const { expenseId, reason } = body;
      if (!expenseId || !reason) {
        return NextResponse.json({ error: "معرف المصروف وسبب الإلغاء مطلوبان" }, { status: 400 });
      }

      const exp = await db.select().from(centerExpenses).where(eq(centerExpenses.id, expenseId)).limit(1);
      if (exp.length === 0) return NextResponse.json({ error: "المصروف غير موجود" }, { status: 404 });

      await db
        .update(centerExpenses)
        .set({
          status: "voided",
          notes: `${exp[0].notes ? exp[0].notes + " | " : ""}تم إلغاء المصروف: ${reason} (بواسطة ${ctx.user.name})`,
        })
        .where(eq(centerExpenses.id, expenseId));

      return NextResponse.json({ success: true, message: "تم إلغاء قيد المصروف بنجاح" });
    }

    // -------------------------------------------------------------
    // ACTION: CREATE CATEGORY
    // -------------------------------------------------------------
    if (action === "create_category") {
      const { name, code, description } = body;
      if (!name || !code) return NextResponse.json({ error: "اسم وكود التصنيف مطلوبان" }, { status: 400 });

      const catId = `cat_${code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      await db.insert(centerExpenseCategories).values({
        id: catId,
        name: name.trim(),
        code: code.trim().toLowerCase(),
        description: description || null,
        isActive: true,
      });

      return NextResponse.json({ success: true, message: "تم إضافة التصنيف الجديد" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Center Expenses POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}
