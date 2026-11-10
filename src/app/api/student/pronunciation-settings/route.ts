import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentPronunciationSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

const DEFAULT_SETTINGS = {
  enabled: true,
  accent: "uk" as const,
  speed: "normal" as const,
  hoverEnabled: true,
  touchEnabled: true,
};

// =========================================================================
// GET: Fetch student's personal pronunciation settings
// =========================================================================
export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);

  // Return default settings for unauthenticated previews/guests
  if (!ctx || !ctx.user) {
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      isDefault: true,
    });
  }

  try {
    const studentId = ctx.user.id;
    const rows = await db
      .select()
      .from(studentPronunciationSettings)
      .where(eq(studentPronunciationSettings.studentId, studentId));

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        settings: {
          ...DEFAULT_SETTINGS,
          studentId,
        },
        isDefault: true,
      });
    }

    return NextResponse.json({
      success: true,
      settings: rows[0],
      isDefault: false,
    });
  } catch (error) {
    console.error("Fetch Pronunciation Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

// =========================================================================
// POST / PUT: Update student's personal pronunciation settings
// =========================================================================
export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const studentId = ctx.user.id;

    const enabled = typeof body.enabled === "boolean" ? body.enabled : true;
    const accent = body.accent === "us" ? "us" : "uk";
    const speed = body.speed === "slow" ? "slow" : "normal";
    const hoverEnabled = typeof body.hoverEnabled === "boolean" ? body.hoverEnabled : true;
    const touchEnabled = typeof body.touchEnabled === "boolean" ? body.touchEnabled : true;

    const existing = await db
      .select()
      .from(studentPronunciationSettings)
      .where(eq(studentPronunciationSettings.studentId, studentId));

    if (existing.length === 0) {
      const [inserted] = await db
        .insert(studentPronunciationSettings)
        .values({
          id: studentId,
          studentId,
          enabled,
          accent,
          speed,
          hoverEnabled,
          touchEnabled,
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "تم حفظ إعدادات النطق بنجاح.",
        settings: inserted,
      });
    } else {
      const [updated] = await db
        .update(studentPronunciationSettings)
        .set({
          enabled,
          accent,
          speed,
          hoverEnabled,
          touchEnabled,
          updatedAt: new Date(),
        })
        .where(eq(studentPronunciationSettings.studentId, studentId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "تم تحديث إعدادات النطق بنجاح.",
        settings: updated,
      });
    }
  } catch (error) {
    console.error("Update Pronunciation Settings Error:", error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
