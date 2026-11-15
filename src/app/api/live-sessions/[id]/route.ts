import { db } from "@/db";
import { liveSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const { id } = await params;
    const records = await db.select().from(liveSessions).where(eq(liveSessions.id, id)).limit(1);

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: "الحصة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: records[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const { id } = await params;
    const body = await req.json();
    const { status, recordingUrl, recordingNotes, meetUrl, title, description } = body;

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updatePayload.status = status;
    if (recordingUrl !== undefined) updatePayload.recordingUrl = recordingUrl;
    if (recordingNotes !== undefined) updatePayload.recordingNotes = recordingNotes;
    if (meetUrl !== undefined) updatePayload.meetUrl = meetUrl;
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;

    await db.update(liveSessions).set(updatePayload).where(eq(liveSessions.id, id));

    return NextResponse.json({ success: true, message: "تم تحديث بيانات الحصة بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const { id } = await params;
    await db.delete(liveSessions).where(eq(liveSessions.id, id));

    return NextResponse.json({ success: true, message: "تم حذف الحصة بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
