import { NextResponse } from "next/server";
import { db } from "@/db";
import { accessVouchers, userSubscriptions, users } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { SEED_ACCESS_VOUCHERS } from "@/data/pro-suite-seeds";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const rawCode = String(body.code || "").trim().toUpperCase();
    const targetUserId = body.userId || ctx?.user?.id || "guest_student";

    if (!rawCode) {
      return NextResponse.json(
        { error: "يرجى إدخال كود التفعيل المطبوع على الكارت" },
        { status: 400 }
      );
    }

    let voucher: any = null;

    if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select()
          .from(accessVouchers)
          .where(eq(accessVouchers.code, rawCode))
          .limit(1);

        if (rows.length > 0) {
          voucher = rows[0];
        }
      } catch (dbErr) {
        console.warn("DB voucher query error:", dbErr);
      }
    }

    // Fallback to in-memory seeds if not in DB or during cold-start
    if (!voucher) {
      voucher = SEED_ACCESS_VOUCHERS.find((v) => v.code === rawCode);
    }

    if (!voucher) {
      return NextResponse.json(
        { error: "كود التفعيل غير صحيح، يرجى التأكد من كتابة الرموز بشكل مطابق للكارت" },
        { status: 404 }
      );
    }

    if (voucher.isUsed) {
      return NextResponse.json(
        { error: "هذا الكارت تم استخدامه مسبقاً ولا يمكن تفعيله مرة أخرى" },
        { status: 409 }
      );
    }

    const durationDays = voucher.durationDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (process.env.DATABASE_URL) {
      try {
        // Mark voucher as used
        await db
          .update(accessVouchers)
          .set({
            isUsed: true,
            usedBy: targetUserId,
            usedAt: sql`NOW()`,
          })
          .where(eq(accessVouchers.id, voucher.id));

        // Create active subscription
        await db
          .insert(userSubscriptions)
          .values({
            id: subscriptionId,
            userId: targetUserId,
            voucherId: voucher.id,
            gradeLevel: voucher.gradeLevel || "3rd_sec",
            accessScope: voucher.accessScope || "full_month",
            expiresAt: expiresAt,
            isActive: true,
          })
          .onConflictDoNothing();
      } catch (updErr) {
        console.warn("Could not persist subscription to DB:", updErr);
      }
    }

    voucher.isUsed = true;

    return NextResponse.json({
      success: true,
      message: "تم تفعيل الاشتراك بنجاح! مرحباً بك في باقة Professional Academy الاحترافية 🌟",
      subscription: {
        id: subscriptionId,
        code: voucher.code,
        gradeLevel: voucher.gradeLevel,
        accessScope: voucher.accessScope,
        durationDays: durationDays,
        expiresAt: expiresAt.toISOString(),
        batchLabel: voucher.batchLabel,
      },
    });
  } catch (err: any) {
    console.error("Voucher activation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
