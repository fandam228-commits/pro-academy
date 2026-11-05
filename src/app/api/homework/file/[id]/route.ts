import { db } from "@/db";
import { courses, homework, homeworkSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getHomeworkFileAccessDecision } from "@/lib/homework-authorization.mjs";
import { get } from "@vercel/blob";
import {
  getHomeworkPrivateBlobToken,
  getHomeworkFileStorageDecision,
} from "@/lib/homework-storage.mjs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate before running setup/migration work. Unauthenticated requests
  // must not be able to trigger database setup as a side effect.
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDbSetup();
  try {
    const { id } = await params;

    // Resolve the submission, its homework, and the course's current owner in
    // one SQL statement. A separate homework/course lookup could authorize
    // against a stale relationship after a concurrent course reassignment.
    const [fileAccessRow] = await db
      .select({
        submission: {
          studentId: homeworkSubmissions.studentId,
          storagePath: homeworkSubmissions.storagePath,
          fileName: homeworkSubmissions.fileName,
        },
        homeworkTeacherId: homework.teacherId,
        homeworkCourseId: homework.courseId,
        courseTeacherId: courses.teacherId,
      })
      .from(homeworkSubmissions)
      .innerJoin(homework, eq(homeworkSubmissions.homeworkId, homework.id))
      .leftJoin(courses, eq(homework.courseId, courses.id))
      .where(eq(homeworkSubmissions.id, id));

    const sub = fileAccessRow?.submission;
    const accessDecision = getHomeworkFileAccessDecision({
      submissionFound: Boolean(fileAccessRow),
      homeworkFound: Boolean(fileAccessRow),
      role: ctx.user.role,
      requesterId: ctx.user.id,
      submissionStudentId: sub?.studentId,
      homeworkTeacherId: fileAccessRow?.homeworkTeacherId,
      homeworkCourseId: fileAccessRow?.homeworkCourseId,
      courseTeacherId: fileAccessRow?.courseTeacherId,
    });
    if (!fileAccessRow || !sub || accessDecision !== "allowed") {
      // Use the same status and body for missing records and unauthorized callers.
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const privateBlobToken = getHomeworkPrivateBlobToken();
    const storageDecision = getHomeworkFileStorageDecision({
      storagePath: sub.storagePath,
      privateBlobToken,
    });

    if (storageDecision === "no-file") {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }
    // Legacy public Blob URLs are not redirected: the URL itself bypasses this route's authorization.
    if (storageDecision === "legacy-public-url") {
      return NextResponse.json(
        { error: "This submission uses legacy public storage and must be migrated before secure access can be restored." },
        { status: 410 }
      );
    }
    if (storageDecision === "invalid-private-path") {
      return NextResponse.json({ error: "Invalid private file reference" }, { status: 404 });
    }
    if (storageDecision === "private-storage-not-configured" || !privateBlobToken) {
      return NextResponse.json({ error: "Private homework file storage is not configured." }, { status: 503 });
    }

    const blob = await get(sub.storagePath as string, { access: "private", token: privateBlobToken });
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
