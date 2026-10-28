import { db } from "@/db";
import { homework, homeworkSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { canViewHomeworkSubmissionFile } from "@/lib/homework-authorization.mjs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const subs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, id));
    if (subs.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const sub = subs[0];
    const homeworkRows = await db
      .select({ teacherId: homework.teacherId })
      .from(homework)
      .where(eq(homework.id, sub.homeworkId));
    if (homeworkRows.length === 0) {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 });
    }

    const isAllowed = canViewHomeworkSubmissionFile({
      role: ctx.user.role,
      requesterId: ctx.user.id,
      submissionStudentId: sub.studentId,
      homeworkTeacherId: homeworkRows[0].teacherId,
    });
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!sub.storagePath) {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }

    // storagePath is now a Vercel Blob URL — redirect to it
    return NextResponse.redirect(sub.storagePath);
  } catch (error) {
    console.error("Homework file error:", error);
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}
