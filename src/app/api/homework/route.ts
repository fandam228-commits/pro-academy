import { db } from "@/db";
import { homework, homeworkSubmissions, users, notifications, courses, enrollments } from "@/db/schema";
import { eq, and, inArray, isNull, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { notifyUser } from "@/lib/push";
import { del, put } from "@vercel/blob";
import { getHomeworkPrivateBlobToken } from "@/lib/homework-storage.mjs";
import { randomUUID } from "node:crypto";
import { canManageHomework, canSubmitHomework, canAccessHomeworkCourse, canAssignHomeworkToCourse, canReplaceHomeworkSubmission } from "@/lib/homework-authorization.mjs";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

function withoutStoragePath(record: object) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== "storagePath"));
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const homeworkId = searchParams.get("homeworkId");
  const role = ctx.user.role as string;

  try {
    // Teachers may only read homework and submissions they own; admins may read all.
    if (role === "teacher" || role === "admin") {
      if (homeworkId) {
        const hwRows = await db.select().from(homework).where(eq(homework.id, homeworkId));
        if (hwRows.length === 0) {
          return NextResponse.json({ error: "Homework not found" }, { status: 404 });
        }
        const hw = hwRows[0];
        if (!canManageHomework({ role, requesterId: ctx.user.id, homeworkTeacherId: hw.teacherId })) {
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
        : await db.select().from(homework).where(eq(homework.teacherId, ctx.user.id));
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
    let list = await db.select().from(homework);
    list = list.filter((assignment) =>
      (!myGrade || assignment.grade === myGrade || !assignment.grade) &&
      canAccessHomeworkCourse({
        role,
        homeworkCourseId: assignment.courseId,
        enrolledCourseIds,
      })
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
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized. Login required." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  // ============ STUDENT SUBMIT ANSWER (multipart, optional file) ============
  if (contentType.includes("multipart/form-data")) {
    if (!canSubmitHomework({ role: ctx.user.role })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      const form = await req.formData();
      const homeworkId = String(form.get("homeworkId") || "");
      const answerText = String(form.get("answerText") || "");
      const file = form.get("file") as File | null;

      if (!homeworkId) {
        return NextResponse.json({ error: "Missing homeworkId" }, { status: 400 });
      }

      const hw = await db.select().from(homework).where(eq(homework.id, homeworkId));
      if (hw.length === 0) {
        return NextResponse.json({ error: "Homework not found" }, { status: 404 });
      }
      if (!canSubmitHomework({ role: ctx.user.role, studentGrade: ctx.user.grade, homeworkGrade: hw[0].grade })) {
        return NextResponse.json({ error: "You cannot submit homework assigned to another grade." }, { status: 403 });
      }

      // A matching grade is not enough for course-specific assignments. Resolve
      // enrollment from the database and fail closed for non-enrolled students.
      const homeworkCourseId = hw[0].courseId;
      const submissionEnrollmentRows = homeworkCourseId
        ? await db
            .select({ courseId: enrollments.courseId })
            .from(enrollments)
            .innerJoin(courses, eq(enrollments.courseId, courses.id))
            .where(and(
              eq(enrollments.studentId, ctx.user.id),
              eq(enrollments.courseId, homeworkCourseId),
              inArray(enrollments.status, ["active", "completed"]),
            ))
        : [];
      const submissionEnrolledCourseIds = [...new Set(submissionEnrollmentRows.map((row) => row.courseId))];
      if (!canAccessHomeworkCourse({
        role: ctx.user.role as string,
        homeworkCourseId,
        enrolledCourseIds: submissionEnrolledCourseIds,
      })) {
        return NextResponse.json({ error: "You must be enrolled in this course to submit this homework." }, { status: 403 });
      }

      // One submission per student — replace an existing ungraded one
      const existing = await db
        .select()
        .from(homeworkSubmissions)
        .where(
          and(eq(homeworkSubmissions.homeworkId, homeworkId), eq(homeworkSubmissions.studentId, ctx.user.id))
        );

      // Reject graded replacements before uploading a private file. The later SQL predicate
      // is still required because a teacher may grade the submission after this preflight read.
      if (existing.length > 0 && !canReplaceHomeworkSubmission({ status: existing[0].status })) {
        return NextResponse.json({ error: "This submission is already graded and can't be replaced." }, { status: 400 });
      }

      let fileName: string | null = null;
      let storagePath: string | null = null;
      let uploadToken: string | null = null;

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
            { status: 503 }
          );
        }
        uploadToken = privateBlobToken;
        const blob = await put(`homework/${subId}_${safeName}`, file, {
          access: "private",
          token: privateBlobToken,
          addRandomSuffix: true,
        });
        fileName = file.name;
        storagePath = blob.pathname; // Store only the private Blob pathname, never a public URL.
      }

      if (existing.length > 0) {
        // The SQL predicate is the final atomic guard if grading wins after the preflight read.
        const updated = await db
          .update(homeworkSubmissions)
          .set({
            answerText,
            fileName: fileName ?? existing[0].fileName,
            storagePath: storagePath ?? existing[0].storagePath,
            submittedAt: new Date(),
          })
          .where(and(
            eq(homeworkSubmissions.id, existing[0].id),
            or(isNull(homeworkSubmissions.status), ne(homeworkSubmissions.status, "graded")),
          ))
          .returning({ id: homeworkSubmissions.id });

        if (updated.length === 0) {
          // The upload is private but unreferenced; remove only this new object if the
          // submission became graded between the preflight read and the guarded update.
          if (storagePath && uploadToken) {
            try {
              await del(storagePath, { token: uploadToken });
            } catch (cleanupError) {
              console.error("Failed to remove unreferenced homework upload:", cleanupError);
            }
          }
          return NextResponse.json({ error: "This submission is already graded and can't be replaced." }, { status: 400 });
        }
        return NextResponse.json({ success: true, updated: true });
      }

      const sub = {
        id: `hws_${randomUUID()}`,
        homeworkId,
        studentId: ctx.user.id,
        studentName: ctx.user.name,
        answerText,
        fileName,
        storagePath,
        status: "submitted",
      };
      try {
        await db.insert(homeworkSubmissions).values(sub);
      } catch (insertError) {
        // The private upload succeeded but the database insert failed; avoid leaving an orphaned Blob.
        if (storagePath && uploadToken) {
          try {
            await del(storagePath, { token: uploadToken });
          } catch (cleanupError) {
            console.error("Failed to remove homework upload after insert failure:", cleanupError);
          }
        }
        throw insertError;
      }

      // Notify teacher (in-app + device push)
      await notifyUser(
        hw[0].teacherId,
        "📥 تسليم واجب جديد",
        `${ctx.user.name} سلّم واجب: ${hw[0].title}`,
        "info",
        "/?tab=homework"
      );

      return NextResponse.json({ success: true, submission: withoutStoragePath(sub) });
    } catch (error) {
      console.error("Homework submit error:", error);
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }
  }

  // ============ JSON ACTIONS: create / grade / delete ============
  try {
    const body = await req.json();
    const { action } = body;

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
      if (ctx.user.role === "teacher" && hw[0].teacherId !== ctx.user.id) {
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
        const own = await db.select({ id: homework.id }).from(homework).where(and(eq(homework.id, body.homeworkId), eq(homework.teacherId, ctx.user.id)));
        if (own.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
