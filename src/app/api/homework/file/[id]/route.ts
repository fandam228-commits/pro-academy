import { db } from "@/db";
import { courses, homework, homeworkSubmissions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { get } from "@vercel/blob";
import {
  getHomeworkFileAccessDecision,
  getHomeworkFileStorageDecision,
  getHomeworkPrivateBlobToken,
} from "@/lib/homework-file-access.mjs";

type HomeworkFileContext = {
  requesterRole: string | null;
  submission: (typeof homeworkSubmissions.$inferSelect) | null;
  homeworkRow: {
    teacherId: string;
    courseId: string | null;
    courseTeacherId: string | null;
  } | null;
};

async function loadHomeworkFileContext(submissionId: string, requesterId: string): Promise<HomeworkFileContext> {
  const requesterRows = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, requesterId));
  const submissions = await db
    .select()
    .from(homeworkSubmissions)
    .where(eq(homeworkSubmissions.id, submissionId));
  const submission = submissions[0] ?? null;
  const homeworkRows = submission
    ? await db
        .select({
          teacherId: homework.teacherId,
          courseId: homework.courseId,
          courseTeacherId: courses.teacherId,
        })
        .from(homework)
        .leftJoin(courses, eq(homework.courseId, courses.id))
        .where(eq(homework.id, submission.homeworkId))
    : [];

  return {
    requesterRole: requesterRows[0]?.role ?? null,
    submission,
    homeworkRow: homeworkRows[0] ?? null,
  };
}

function isAuthorizedFileContext(context: HomeworkFileContext, sessionRole: string, requesterId: string) {
  if (!context.submission || !context.homeworkRow || context.requesterRole !== sessionRole) return false;
  return getHomeworkFileAccessDecision({
    submissionFound: true,
    homeworkFound: true,
    role: context.requesterRole,
    requesterId,
    submissionStudentId: context.submission.studentId,
    homeworkTeacherId: context.homeworkRow.teacherId,
    homeworkCourseId: context.homeworkRow.courseId,
    courseTeacherId: context.homeworkRow.courseTeacherId,
  }) === "allowed";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["teacher", "admin", "student"].includes(ctx.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Authentication and supported-role checks must happen before setup or private reads.
  await ensureDbSetup();

  try {
    const { id } = await params;
    const initial = await loadHomeworkFileContext(id, ctx.user.id);
    if (!isAuthorizedFileContext(initial, ctx.user.role, ctx.user.id)) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const sub = initial.submission!;
    const privateBlobToken = getHomeworkPrivateBlobToken();
    const storageDecision = getHomeworkFileStorageDecision({
      storagePath: sub.storagePath,
      privateBlobToken,
    });

    if (storageDecision === "no-file") {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }
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

    const blob = await get(sub.storagePath as string, { access: "private", token: privateBlobToken });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Re-check the live account role, submission ownership, homework owner, and
    // current course owner after the provider lookup and before returning the stream.
    const latest = await loadHomeworkFileContext(id, ctx.user.id);
    if (
      !isAuthorizedFileContext(latest, ctx.user.role, ctx.user.id) ||
      latest.submission!.homeworkId !== sub.homeworkId ||
      latest.submission!.studentId !== sub.studentId ||
      latest.submission!.storagePath !== sub.storagePath
    ) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
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
    console.error("Homework file GET failed; details withheld.");
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}
