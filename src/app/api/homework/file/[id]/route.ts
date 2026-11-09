import { db } from "@/db";
import { courses, homework, homeworkSubmissions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import {
  getHomeworkFileAccessDecision,
  isSameHomeworkFileAccessContext,
} from "@/lib/homework-authorization.mjs";
import { get } from "@vercel/blob";
import {
  getHomeworkPrivateBlobToken,
  getHomeworkFileStorageDecision,
} from "@/lib/homework-storage.mjs";

type HomeworkFileContext = {
  requesterRole: string | null;
  submissionId: string | null;
  homeworkId: string | null;
  studentId: string | null;
  storagePath: string | null;
  fileName: string | null;
  homeworkTeacherId: string | null;
  homeworkCourseId: string | null;
  courseTeacherId: string | null;
};

/**
 * Read the requester, submission, assignment, and current course owner in one
 * SQL statement so one authorization decision never combines different
 * database snapshots.
 */
async function loadHomeworkFileContext(
  submissionId: string,
  requesterId: string,
): Promise<HomeworkFileContext | null> {
  const rows = await db
    .select({
      requesterRole: users.role,
      submissionId: homeworkSubmissions.id,
      homeworkId: homeworkSubmissions.homeworkId,
      studentId: homeworkSubmissions.studentId,
      storagePath: homeworkSubmissions.storagePath,
      fileName: homeworkSubmissions.fileName,
      homeworkTeacherId: homework.teacherId,
      homeworkCourseId: homework.courseId,
      courseTeacherId: courses.teacherId,
    })
    .from(users)
    .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.id, submissionId))
    .leftJoin(homework, eq(homework.id, homeworkSubmissions.homeworkId))
    .leftJoin(courses, eq(courses.id, homework.courseId))
    .where(eq(users.id, requesterId))
    .limit(1);

  return rows[0] ?? null;
}

function isAuthorizedFileContext(
  context: HomeworkFileContext | null,
  sessionRole: string,
  requesterId: string,
): context is HomeworkFileContext {
  if (
    !context ||
    context.requesterRole !== sessionRole ||
    !context.submissionId ||
    !context.homeworkId
  ) {
    return false;
  }

  return getHomeworkFileAccessDecision({
    submissionFound: true,
    homeworkFound: true,
    role: context.requesterRole,
    requesterId,
    submissionStudentId: context.studentId,
    homeworkTeacherId: context.homeworkTeacherId,
    homeworkCourseId: context.homeworkCourseId,
    courseTeacherId: context.courseTeacherId,
  }) === "allowed";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate and reject unsupported roles before running setup/migration work.
  // Unauthenticated or unrelated roles must not trigger database setup as a side effect.
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = ctx.user.role as string;
  if (!["teacher", "admin", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  try {
    const { id } = await params;
    const initial = await loadHomeworkFileContext(id, ctx.user.id);
    if (!isAuthorizedFileContext(initial, role, ctx.user.id)) {
      // Use the same status and body for missing and unauthorized records.
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const privateBlobToken = getHomeworkPrivateBlobToken();
    const storageDecision = getHomeworkFileStorageDecision({
      storagePath: initial.storagePath,
      privateBlobToken,
    });

    if (storageDecision === "no-file") {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }
    // Legacy public Blob URLs are not redirected: the URL itself bypasses this route's authorization.
    if (storageDecision === "legacy-public-url") {
      return NextResponse.json(
        { error: "This submission uses legacy public storage and must be migrated before secure access can be restored." },
        { status: 410 },
      );
    }
    if (storageDecision === "invalid-private-path") {
      return NextResponse.json({ error: "Invalid private file reference" }, { status: 404 });
    }
    if (storageDecision === "private-storage-not-configured" || !privateBlobToken) {
      return NextResponse.json({ error: "Private homework file storage is not configured." }, { status: 503 });
    }

    const blob = await get(initial.storagePath as string, { access: "private", token: privateBlobToken });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // The provider read can take time. Re-read the live account, submission,
    // homework owner, and course owner before returning any bytes. If the role,
    // relationship, or file changed during the provider call, discard the stream.
    const latest = await loadHomeworkFileContext(id, ctx.user.id);
    if (
      !isAuthorizedFileContext(latest, role, ctx.user.id) ||
      !isSameHomeworkFileAccessContext(initial, latest, role)
    ) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const safeFileName = (initial.fileName || "homework-submission").replace(/[^a-zA-Z0-9._-]/g, "_");
    return new Response(blob.stream, {
      headers: {
        "Content-Type": blob.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    // Provider errors may contain signed URLs, object paths, or credential details.
    console.error("Homework file GET failed; details withheld.");
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}
