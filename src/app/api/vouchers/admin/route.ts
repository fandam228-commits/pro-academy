import { NextResponse } from "next/server";
import { db } from "@/db";
import { accessVouchers } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { SEED_ACCESS_VOUCHERS } from "@/data/pro-suite-seeds";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    await ensureDbSetup();

    let vouchers: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        vouchers = await db
          .select()
          .from(accessVouchers)
          .orderBy(desc(accessVouchers.createdAt))
          .limit(200);
      } catch (e) {
        console.warn("DB voucher query error:", e);
      }
    }

    if (vouchers.length === 0) {
      vouchers = [...SEED_ACCESS_VOUCHERS];
    }

    const total = vouchers.length;
    const usedCount = vouchers.filter((v) => v.isUsed).length;
    const availableCount = total - usedCount;

    return NextResponse.json({
      success: true,
      stats: { total, usedCount, availableCount },
      vouchers,
    });
  } catch (err: any) {
    console.error("Admin vouchers GET error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    await ensureDbSetup();
    const body = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(parseInt(body.count, 10) || 10, 1), 100);
    const gradeLevel = body.gradeLevel || "3rd_sec";
    const accessScope = body.accessScope || "full_month";
    const durationDays = parseInt(body.durationDays, 10) || 30;
    const batchLabel = body.batchLabel || `دفعة ${new Date().toLocaleDateString("ar-EG")}`;
    const targetUnitId = body.targetUnitId || null;

    const newVouchers: any[] = [];
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    for (let i = 0; i < count; i++) {
      let randomPart = "";
      for (let j = 0; j < 4; j++) {
        randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      let suffix = "";
      for (let j = 0; j < 2; j++) {
        suffix += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const code = `PRO-${randomPart}-${suffix}`;
      const id = `v_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;

      newVouchers.push({
        id,
        code,
        gradeLevel,
        accessScope,
        targetUnitId,
        durationDays,
        isUsed: false,
        batchLabel,
        createdAt: new Date(),
      });
    }

    if (process.env.DATABASE_URL) {
      try {
        for (const v of newVouchers) {
          await db
            .insert(accessVouchers)
            .values({
              id: v.id,
              code: v.code,
              gradeLevel: v.gradeLevel,
              accessScope: v.accessScope,
              targetUnitId: v.targetUnitId,
              durationDays: v.durationDays,
              isUsed: false,
              batchLabel: v.batchLabel,
            })
            .onConflictDoNothing();
        }
      } catch (dbErr) {
        console.warn("Could not batch insert vouchers into DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم توليد ${newVouchers.length} كارت بنجاح!`,
      vouchers: newVouchers,
    });
  } catch (err: any) {
    console.error("Admin vouchers POST error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
