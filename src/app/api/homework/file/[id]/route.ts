import { db } from "@/db";
import { homework, homeworkSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getHomeworkFileAccessDecision } from "@/lib/homework-authorization.mjs";
import { get } from "@vercel/blob";
import {
  getHomeworkPrivateBlobToken,
  isLegacyPublicHomeworkBlobUrl,
  isPrivateHomeworkBlobPath,
} from "@/lib/homework-storage.mjs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const subs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, id));
    const sub = subs[0];
    const homeworkRows = sub
      ? await db
          .select({ teacherId: homework.teacherId })
          .from(homework)
          .where(eq(homework.id, sub.homeworkId))
      : [];
    const homeworkRow = homeworkRows[0];

    const accessDecision = getHomeworkFileAccessDecision({
      submissionFound: Boolean(sub),
      homeworkFound: Boolean(homeworkRow),
      role: ctx.user.role,
      requesterId: ctx.user.id,
      submissionStudentId: sub?.studentId,
      homeworkTeacherId: homeworkRow?.teacherId,
    });
    if (!sub || !homeworkRow || accessDecision !== "allowed") {
      // Use the same status and body for missing records and unauthorized callers.
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (!sub.storagePath) {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }

    // Legacy public Blob URLs are not redirected: the URL itself bypasses this route's authorization.
    if (isLegacyPublicHomeworkBlobUrl(sub.storagePath)) {
      return NextResponse.json(
        { error: "This submission uses legacy public storage and must be migrated before secure access can be restored." },
        { status: 410 }
      );
    }
    if (!isPrivateHomeworkBlobPath(sub.storagePath)) {
      return NextResponse.json({ error: "Invalid private file reference" }, { status: 404 });
    }

    const privateBlobToken = getHomeworkPrivateBlobToken();
    if (!privateBlobToken) {
      return NextResponse.json({ error: "Private homework file storage is not configured." }, { status: 503 });
    }

    const blob = await get(sub.storagePath, { access: "private", token: privateBlobToken });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const safeFileName = (sub.fileName || "homework-submission").replace(/[^a-zA-Z0-9._-]/g, "_");
    return new Response(blob.stream, {
      headers: {
        "Content-Type": blob.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Homework file error:", error);
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}
