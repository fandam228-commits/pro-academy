import { db } from "@/db";
import { homework, homeworkSubmissions, users, notifications, courses, enrollments } from "@/db/schema";
import { eq, and, inArray, isNull, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { notifyUser } from "@/lib/push";
import { del, put } from "@vercel/blob";
import { getHomeworkPrivateBlobToken, isPrivateHomeworkBlobPath } from "@/lib/homework-storage.mjs";
import { randomUUID } from "node:crypto";
import { canManageHomework, canAssignHomeworkToCourse, canReplaceHomeworkSubmission } from "@/lib/homework-authorization.mjs";
import { lockHomeworkSubmissionAuthorization } from "@/lib/homework-submission-authorization.mjs";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

async function getHomeworkCourseTeacherId(courseId: string | null | undefined): Promise<string | null> {
  if (courseId === null || courseId === undefined || typeof courseId !== "string" || courseId.trim() === "") {
    return null;
  }
  const rows = await db
    .select({ teacherId: courses.teacherId })
    .from(courses)
    .where(eq(courses.id, courseId));
  return rows[0]?.teacherId ?? null;
}

function withoutStoragePath(record: object) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== "storagePath"));
}

async function removeUnreferencedPrivateHomeworkUpload(storagePath: string | null, token: string | null) {
  if (!storagePath || !token) return;
  try {
    await del(storagePath, { token });
  } catch {
    // Provider errors may include object URLs or request metadata; do not log them.
    console.error("Private homework Blob cleanup failed; manual reconciliation may be required.");
  }
}

export async function GET(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = ctx.user.role as string;
  if (!["teacher", "admin", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Authenticate and authorize supported roles before schema setup or seed work.
  await ensureDbSetup();

  const { searchParams } = new URL(req.url);
  const homeworkId = searchParams.get("homeworkId");

  try {
    // Teachers may only read homework and submissions they own; admins may read all.
    if (role === "teacher" || role === "admin") {
      if (homeworkId) {
        const hwRows = await db.select().from(homework).where(eq(homework.id, homeworkId));
        if (hwRows.length === 0) {
          return NextResponse.json({ error: "Homework not found" }, { status: 404 });
        }
        const hw = hwRows[0];
        const courseTeacherId = await getHomeworkCourseTeacherId(hw.courseId);
        if (!canManageHomework({
          role,
          requesterId: ctx.user.id,
          homeworkTeacherId: hw.teacherId,
          homeworkCourseId: hw.courseId,
          courseTeacherId,
        })) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const subs = await db
          .select()
          .from(homeworkSubmissions)
          .where(eq(homeworkSubmissions.homeworkId, homeworkId));
        return NextResponse.json({
          homework: hw,
          submissions: subs.map((submission) => withoutStoragePath(submission)),
        });
      }

      const allHw = role === "admin"
        ? await db.select().from(homework)
        : (await db
            .select({ assignment: homework })
            .from(homework)
            .leftJoin(courses, eq(homework.courseId, courses.id))
            .where(and(
              eq(homework.teacherId, ctx.user.id),
              or(isNull(homework.courseId), eq(courses.teacherId, ctx.user.id)),
            )))
            .map(({ assignment }) => assignment);
      const homeworkIds = allHw.map((assignment) => assignment.id);
      const allSubs = homeworkIds.length
        ? await db.select().from(homeworkSubmissions).where(inArray(homeworkSubmissions.homeworkId, homeworkIds))
        : [];
      const withCounts = allHw.map((h) => ({
        ...h,
        submissionsCount: allSubs.filter((s) => s.homeworkId === h.id).length,
        gradedCount: allSubs.filter((s) => s.homeworkId === h.id && s.status === "graded").length,
      }));
      return NextResponse.json({ homeworkList: withCounts, role });
    }

    if (role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Students see homework for their grade and their own submission status only.
    const myGrade = ctx.user.grade || "";
    const enrollmentRows = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(
        eq(enrollments.studentId, ctx.user.id),
        inArray(enrollments.status, ["active", "completed"]),
      ));
    const enrolledCourseIds = [...new Set(enrollmentRows.map((row) => row.courseId))];
    // Apply student visibility at the database layer rather than loading every
    // teacher's homework into memory and filtering afterward.
    const courseVisibility = enrolledCourseIds.length > 0
      ? or(isNull(homework.courseId), inArray(homework.courseId, enrolledCourseIds))
      : isNull(homework.courseId);
    const gradeVisibility = myGrade
      ? or(isNull(homework.grade), eq(homework.grade, ""), eq(homework.grade, myGrade))
      : undefined;
    const list = await db.select().from(homework).where(
      gradeVisibility ? and(courseVisibility, gradeVisibility) : courseVisibility
    );
    const mySubs = await db
      .select()
      .from(homeworkSubmissions)
      .where(eq(homeworkSubmissions.studentId, ctx.user.id));

    const withStatus = list.map((h) => {
      const mine = mySubs.find((s) => s.homeworkId === h.id) || null;
      return { ...h, mySubmission: mine ? withoutStoragePath(mine) : null };
    });

    return NextResponse.json({ homeworkList: withStatus, role: "student" });
  } catch (error) {
    console.error("Homework GET error:", error);
    return NextResponse.json({ error: "Failed to load homework" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized. Login required." }, { status: 401 });
  }
  const contentType = req.headers.get("content-type") || "";
  // Only students may submit multipart answers; only teachers/admins may use JSON actions.
  if (!contentType.includes("multipart/form-data") && !["admin", "teacher"].includes(ctx.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ============ STUDENT SUBMIT ANSWER (multipart, optional file) ============
  if (contentType.includes("multipart/form-data")) {
    if (ctx.user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await ensureDbSetup();

    let uploadedStoragePath: string | null = null;
    let uploadToken: string | null = null;

    try {
      const form = await req.formData();
      const homeworkId = String(form.get("homeworkId") || "");
      const answerText = String(form.get("answerText") || "");
      const file = form.get("file") as File | null;

      if (!homeworkId) {
        return NextResponse.json({ error: "Missing homeworkId" }, { status: 400 });
      }

      // Preflight against current database role, grade, homework, and enrollment.
      // The same checks are repeated under row locks in the write transaction below.
      const preflight = await db.transaction((tx) =>
        lockHomeworkSubmissionAuthorization(
          tx,
          { homeworkId, studentId: ctx.user.id, sessionRole: ctx.user.role },
          { users, homework, courses, enrollments },
        ),
      );
      if (!preflight.allowed) {
        const notFound = preflight.reason === "homework-not-found" || preflight.reason === "course-not-found";
        return NextResponse.json(
          { error: notFound ? "Homework not found" : "Forbidden" },
          { status: notFound ? 404 : 403 },
        );
      }

      // Avoid uploading a private object when the current submission is already graded.
      const existing = await db
        .select()
        .from(homeworkSubmissions)
        .where(
          and(eq(homeworkSubmissions.homeworkId, homeworkId), eq(homeworkSubmissions.studentId, ctx.user.id))
        );
      if (existing.length > 0 && !canReplaceHomeworkSubmission({ status: existing[0].status })) {
        return NextResponse.json({ error: "This submission is already graded and can't be replaced." }, { status: 400 });
      }

      let fileName: string | null = null;
      let storagePath: string | null = null;

      if (file && file.size > 0) {
        if (file.size > MAX_SIZE_BYTES) {
          return NextResponse.json({ error: "File exceeds 20MB limit." }, { status: 400 });
        }
        const subId = `hws_${randomUUID()}`;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        // Homework submissions contain student data: fail closed unless a private Blob store is configured.
        const privateBlobToken = getHomeworkPrivateBlobToken();
        if (!privateBlobToken) {
          return NextResponse.json(
            { error: "Private homework file storage is not configured. Text-only submissions remain available." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
        uploadToken = privateBlobToken;
        const blob = await put(`homework/${subId}_${safeName}`, file, {
          access: "private",
          token: privateBlobToken,
          addRandomSuffix: true,
        });
        fileName = file.name;
        storagePath = blob.pathname;
        uploadedStoragePath = storagePath;
      }

      // Revalidate the live account role, grade, assignment, and enrollment in the
      // same transaction as the submission write. FOR SHARE locks prevent role
      // demotion, enrollment revocation, or homework/course changes from racing it.
      const saveResult = await db.transaction(async (tx) => {
        const authorization = await lockHomeworkSubmissionAuthorization(
          tx,
          { homeworkId, studentId: ctx.user.id, sessionRole: ctx.user.role },
          { users, homework, courses, enrollments },
        );
        if (!authorization.allowed) {
          return { kind: "forbidden" as const, reason: authorization.reason };
        }

        // Serialize concurrent first submissions and replacements for this student/homework pair.
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${homeworkId}), hashtext(${ctx.user.id}))`);

        const currentRows = await tx
          .select()
          .from(homeworkSubmissions)
          .where(
            and(eq(homeworkSubmissions.homeworkId, homeworkId), eq(homeworkSubmissions.studentId, ctx.user.id))
          )
          .for("update");

        if (currentRows.length > 0 && !canReplaceHomeworkSubmission({ status: currentRows[0].status })) {
          return { kind: "graded" as const };
        }

        if (currentRows.length > 0) {
          const current = currentRows[0];
          const updated = await tx
            .update(homeworkSubmissions)
            .set({
              answerText,
              fileName: fileName ?? current.fileName,
              storagePath: storagePath ?? current.storagePath,
              submittedAt: new Date(),
            })
            .where(and(
              eq(homeworkSubmissions.id, current.id),
              or(isNull(homeworkSubmissions.status), ne(homeworkSubmissions.status, "graded")),
            ))
            .returning({ id: homeworkSubmissions.id });

          if (updated.length === 0) return { kind: "graded" as const };
          return {
            kind: "updated" as const,
            previousStoragePath: current.storagePath,
            homeworkTeacherId: authorization.homeworkTeacherId,
            homeworkTitle: authorization.homeworkTitle,
          };
        }

        const submission = {
          id: `hws_${randomUUID()}`,
          homeworkId,
          studentId: ctx.user.id,
          studentName: ctx.user.name,
          answerText,
          fileName,
          storagePath,
          status: "submitted",
        };
        await tx.insert(homeworkSubmissions).values(submission);
        return {
          kind: "created" as const,
          submission,
          homeworkTeacherId: authorization.homeworkTeacherId,
          homeworkTitle: authorization.homeworkTitle,
        };
      });

      if (saveResult.kind === "forbidden") {
        await removeUnreferencedPrivateHomeworkUpload(uploadedStoragePath, uploadToken);
        uploadedStoragePath = null;
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (saveResult.kind === "graded") {
        await removeUnreferencedPrivateHomeworkUpload(uploadedStoragePath, uploadToken);
        uploadedStoragePath = null;
        return NextResponse.json({ error: "This submission is already graded and can't be replaced." }, { status: 400 });
      }

      // The new path is now referenced by the committed row; never clean it up in
      // a later notification/error handler.
      uploadedStoragePath = null;

      if (saveResult.kind === "updated") {
        if (
          storagePath &&
          uploadToken &&
          saveResult.previousStoragePath &&
          saveResult.previousStoragePath !== storagePath &&
          isPrivateHomeworkBlobPath(saveResult.previousStoragePath)
        ) {
          await removeUnreferencedPrivateHomeworkUpload(saveResult.previousStoragePath, uploadToken);
        }
        return NextResponse.json({ success: true, updated: true });
      }

      await notifyUser(
        saveResult.homeworkTeacherId,
        "📥 تسليم واجب جديد",
        `${ctx.user.name} سلّم واجب: ${saveResult.homeworkTitle}`,
        "info",
        "/?tab=homework"
      );

      return NextResponse.json({ success: true, submission: withoutStoragePath(saveResult.submission) });
    } catch {
      await removeUnreferencedPrivateHomeworkUpload(uploadedStoragePath, uploadToken);
      console.error("Homework submission failed; details withheld.");
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }
  }

  // ============ JSON ACTIONS: create / grade / delete ============
  try {
    const body = await req.json();
    const { action } = body;
    if (!["create", "grade", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!["admin", "teacher"].includes(ctx.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Validate the action and role before schema setup or database mutation side effects.
    await ensureDbSetup();

    if (action === "create") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const hwData = body.homeworkData || {};
      if (!hwData.title || !hwData.dueDate) {
        return NextResponse.json({ error: "Title and due date are required." }, { status: 400 });
      }

      // A course-linked assignment must reference a real course. Teachers may
      // attach homework only to courses they own; admins retain cross-course access.
      const requestedCourseId = hwData.courseId;
      let courseId: string | null = null;
      if (requestedCourseId !== undefined && requestedCourseId !== null && requestedCourseId !== "") {
        if (typeof requestedCourseId !== "string" || requestedCourseId.trim() === "") {
          return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
        }
        courseId = requestedCourseId.trim();
        const courseRows = await db
          .select({ id: courses.id, teacherId: courses.teacherId })
          .from(courses)
          .where(eq(courses.id, courseId));
        const course = courseRows[0];
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }
        if (!canAssignHomeworkToCourse({
          role: ctx.user.role as string,
          requesterId: ctx.user.id,
          courseTeacherId: course.teacherId,
        })) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      const newHw = {
        id: `hw_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: hwData.title,
        description: hwData.description || "",
        teacherId: ctx.user.id,
        teacherName: ctx.user.name,
        stage: hwData.stage || "Secondary",
        grade: hwData.grade || "Third Secondary (Baccalaureate)",
        courseId,
        unit: hwData.unit || "Unit 1",
        dueDate: hwData.dueDate,
        totalPoints: parseInt(hwData.totalPoints) || 50,
      };
      await db.insert(homework).values(newHw);

      // Broadcast to students of the grade
      const students = await db.select().from(users).where(eq(users.role, "student"));
      for (const st of students) {
        if (st.grade === newHw.grade) {
          await notifyUser(
            st.id,
            "📝 واجب جديد من المدرس",
            `واجب "${newHw.title}" — موعد التسليم: ${newHw.dueDate}`,
            "quiz",
            "/?tab=homework"
          );
        }
      }

      return NextResponse.json({ success: true, homework: newHw });
    }

    if (action === "grade") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const { submissionId, score, feedback } = body;
      const subs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, submissionId));
      if (subs.length === 0) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const hw = await db.select().from(homework).where(eq(homework.id, subs[0].homeworkId));
      if (hw.length === 0) {
        return NextResponse.json({ error: "Homework not found" }, { status: 404 });
      }
      const courseTeacherId = await getHomeworkCourseTeacherId(hw[0].courseId);
      if (!canManageHomework({
        role: ctx.user.role as string,
        requesterId: ctx.user.id,
        homeworkTeacherId: hw[0].teacherId,
        homeworkCourseId: hw[0].courseId,
        courseTeacherId,
      })) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const maxPts = hw[0]?.totalPoints || 50;
      const safeScore = Math.max(0, Math.min(parseInt(score) || 0, maxPts));

      await db
        .update(homeworkSubmissions)
        .set({ status: "graded", score: safeScore, feedback: feedback || "", gradedAt: new Date() })
        .where(eq(homeworkSubmissions.id, submissionId));

      // Award partial points in platform gamification + notify student
      await db
        .update(users)
        .set({ points: sql_inc("points", safeScore) })
        .where(eq(users.id, subs[0].studentId))
        .catch(() => null);

      await notifyUser(
        subs[0].studentId,
        "✅ تم تصحيح واجبك",
        `درجتك في "${hw[0]?.title || "الواجب"}": ${safeScore}/${maxPts}${feedback ? ` — ملاحظة المدرس: ${feedback}` : ""}`,
        "quiz",
        "/?tab=homework"
      );

      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      if (ctx.user.role === "teacher") {
        const ownRows = await db.select().from(homework).where(eq(homework.id, body.homeworkId));
        const own = ownRows[0];
        const courseTeacherId = own ? await getHomeworkCourseTeacherId(own.courseId) : null;
        if (!own || !canManageHomework({
          role: ctx.user.role as string,
          requesterId: ctx.user.id,
          homeworkTeacherId: own.teacherId,
          homeworkCourseId: own.courseId,
          courseTeacherId,
        })) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
      await db.delete(homework).where(eq(homework.id, body.homeworkId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Homework POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// Points increment helper that tolerates missing drizzle sql import style
import { sql } from "drizzle-orm";
function sql_inc(column: string, amount: number) {
  return sql`${sql.raw(column)} + ${amount}` as any;
}
