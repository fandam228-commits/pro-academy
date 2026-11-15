import { db } from "@/db";
import { notificationTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const templates = await db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.createdAt));
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates GET error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { code, bodyTextAr, metaTemplateName, isActive } = body;

    if (!code || !bodyTextAr?.trim()) {
      return NextResponse.json({ error: "Code and bodyTextAr are required" }, { status: 400 });
    }

    await db
      .update(notificationTemplates)
      .set({
        bodyTextAr: bodyTextAr.trim(),
        metaTemplateName: metaTemplateName || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .where(eq(notificationTemplates.code, code));

    return NextResponse.json({ success: true, message: "تم تحديث القالب بنجاح" });
  } catch (error) {
    console.error("Templates PUT error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}
