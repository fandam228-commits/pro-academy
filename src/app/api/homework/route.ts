import { db } from "@/db";
import { homework, homeworkSubmissions, users, notifications, courses, enrollments } from "@/db/schema";
import { eq, and, exists, inArray, isNull, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { notifyUser } from "@/lib/push";
import { del, put } from "@vercel/blob";
import { getHomeworkPrivateBlobToken } from "@/lib/homework-storage.mjs";
import { randomUUID } from "node:crypto";
import { canManageHomework, canSubmitHomework, canAccessHomeworkGrade, canAccessHomeworkCourse, canAssignHomeworkToCourse, canReplaceHomeworkSubmission } from "@/lib/homework-authorization.mjs";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

function withoutStoragePath(record: object) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== "storagePath"));
}

export async function GET(req: Request) {
  // Authenticate and reject unsupported roles before database setup/migration work.
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = ctx.user.role as string;
  if (!["teacher", "admin", "student"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const homeworkId = searchParams.get("homeworkId");

  try {
    // Teachers may only read homework and submissions they own; admins may read all.
    if (role === "teacher" || role === "admin") {
      if (homeworkId) {
        // Read the assignment, current course owner, and submissions in one SQL
        // statement. This avoids authorizing the assignment in one query and
        // exposing its submissions from a later query after ownership changes.
        const detailQuery = db
          .select({
            homework,
            courseTeacherId: courses.teacherId,
            submission: homeworkSubmissions,
          })
          .from(homework)
          .leftJoin(courses, eq(homework.courseId, courses.id))
          .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.homeworkId, homework.id));
        const detailRows = role === "admin"
          ? await detailQuery.where(eq(homework.id, homeworkId))
          : await detailQuery.where(and(
              eq(homework.id, homeworkId),
              eq(homework.teacherId, ctx.user.id),
              or(isNull(homework.courseId), eq(courses.teacherId, ctx.user.id)),
            ));
        if (detailRows.length === 0) {
          return NextResponse.json({ error: "Homework not found" }, { status: 404 });
        }
        const { homework: hw, courseTeacherId } = detailRows[0];
        if (!canManageHomework({
          role,
          requesterId: ctx.user.id,
          homeworkTeacherId: hw.teacherId,
          homeworkCourseId: hw.courseId,
          courseTeacherId,
        })) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const subs = detailRows.flatMap((row) => row.submission ? [row.submission] : []);
        return NextResponse.json({
          homework: hw,
          submissions: subs.map((submission) => withoutStoragePath(submission)),
        });
      }

      // Load assignment metadata and submission counts in one statement so a
      // teacher's course ownership is evaluated at the same database snapshot
      // as the submission rows used to build the response.
      const assignmentQuery = db
        .select({
          homework,
          courseTeacherId: courses.teacherId,
          submission: homeworkSubmissions,
        })
        .from(homework)
        .leftJoin(courses, eq(homework.courseId, courses.id))
        .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.homeworkId, homework.id));
      const assignmentRows = role === "admin"
        ? await assignmentQuery
        : await assignmentQuery.where(and(
            eq(homework.teacherId, ctx.user.id),
            or(isNull(homework.courseId), eq(courses.teacherId, ctx.user.id)),
          ));
      type AssignmentRow = (typeof assignmentRows)[number];
      const assignmentCounts = new Map<string, {
        homework: AssignmentRow["homework"];
        submissionsCount: number;
        gradedCount: number;
      }>();
      for (const row of assignmentRows) {
        if (!canManageHomework({
          role,
          requesterId: ctx.user.id,
          homeworkTeacherId: row.homework.teacherId,
          homeworkCourseId: row.homework.courseId,
          courseTeacherId: row.courseTeacherId,
        })) continue;

        const current = assignmentCounts.get(row.homework.id) || {
          homework: row.homework,
          submissionsCount: 0,
          gradedCount: 0,
        };
        if (row.submission) {
          current.submissionsCount += 1;
          if (row.submission.status === "graded") current.gradedCount += 1;
        }
        assignmentCounts.set(row.homework.id, current);
      }
      const homeworkList = [...assignmentCounts.values()].map((entry) => ({
        ...entry.homework,
        submissionsCount: entry.submissionsCount,
        gradedCount: entry.gradedCount,
      }));
      return NextResponse.json({ homeworkList, role });
    }

    if (role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Students see homework only when their current grade and course enrollment authorize it.
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
      canAccessHomeworkGrade({
        role,
        studentGrade: ctx.user.grade,
        homeworkGrade: assignment.grade,
      }) &&
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
  // Authenticate before setup/migration work so anonymous requests cannot trigger it.
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
    await ensureDbSetup();
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

    if (!["create", "grade", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!["admin", "teacher"].includes(ctx.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate the requested action and role before any database setup work.
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

      // Notify only students who can actually see this assignment.
      // Course-linked homework is restricted to current active/completed enrollees;
      // grade-only homework keeps the existing grade-wide notification behavior.
      const notificationRows = newHw.courseId
        ? await db
            .select({ id: users.id })
            .from(enrollments)
            .innerJoin(users, eq(enrollments.studentId, users.id))
            .where(and(
              eq(enrollments.courseId, newHw.courseId),
              eq(users.role, "student"),
              eq(users.grade, newHw.grade),
              inArray(enrollments.status, ["active", "completed"]),
            ))
        : await db
            .select({ id: users.id })
            .from(users)
            .where(and(eq(users.role, "student"), eq(users.grade, newHw.grade)));
      const notificationStudentIds = [...new Set(notificationRows.map((row) => row.id))];
      for (const studentId of notificationStudentIds) {
        await notifyUser(
          studentId,
          "📝 واجب جديد من المدرس",
          `واجب "${newHw.title}" — موعد التسليم: ${newHw.dueDate}`,
          "quiz",
          "/?tab=homework"
        );
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

      const hwRows = await db
        .select({ homework, courseTeacherId: courses.teacherId })
        .from(homework)
        .leftJoin(courses, eq(homework.courseId, courses.id))
        .where(eq(homework.id, subs[0].homeworkId));
      if (hwRows.length === 0) {
        return NextResponse.json({ error: "Homework not found" }, { status: 404 });
      }
      const { homework: hw, courseTeacherId } = hwRows[0];
      if (!canManageHomework({
        role: ctx.user.role,
        requesterId: ctx.user.id,
        homeworkTeacherId: hw.teacherId,
        homeworkCourseId: hw.courseId,
        courseTeacherId,
      })) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const maxPts = hw.totalPoints || 50;
      const safeScore = Math.max(0, Math.min(parseInt(score) || 0, maxPts));

      // Recheck current homework/course ownership in the UPDATE statement itself.
      // The preflight read above provides a useful response, but must not be the
      // final authorization proof if course ownership changes before this write.
      const gradeUpdateScope = ctx.user.role === "teacher"
        ? exists(db
            .select({ id: homework.id })
            .from(homework)
            .leftJoin(courses, eq(homework.courseId, courses.id))
            .where(and(
              eq(homework.id, homeworkSubmissions.homeworkId),
              eq(homework.teacherId, ctx.user.id),
              or(isNull(homework.courseId), eq(courses.teacherId, ctx.user.id)),
            )))
        : undefined;
      const updatedSubmissions = await db
        .update(homeworkSubmissions)
        .set({ status: "graded", score: safeScore, feedback: feedback || "", gradedAt: new Date() })
        .where(gradeUpdateScope
          ? and(eq(homeworkSubmissions.id, submissionId), gradeUpdateScope)
          : eq(homeworkSubmissions.id, submissionId))
        .returning({ id: homeworkSubmissions.id });

      if (updatedSubmissions.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Award partial points in platform gamification + notify student
      await db
        .update(users)
        .set({ points: sql_inc("points", safeScore) })
        .where(eq(users.id, subs[0].studentId))
        .catch(() => null);

      await notifyUser(
        subs[0].studentId,
        "✅ تم تصحيح واجبك",
        `درجتك في "${hw.title || "الواجب"}": ${safeScore}/${maxPts}${feedback ? ` — ملاحظة المدرس: ${feedback}` : ""}`,
        "quiz",
        "/?tab=homework"
      );

      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      if (ctx.user.role === "teacher") {
        const ownedRows = await db
          .select({ homework, courseTeacherId: courses.teacherId })
          .from(homework)
          .leftJoin(courses, eq(homework.courseId, courses.id))
          .where(eq(homework.id, body.homeworkId));
        const ownedHomework = ownedRows[0];
        if (!ownedHomework || !canManageHomework({
          role: ctx.user.role,
          requesterId: ctx.user.id,
          homeworkTeacherId: ownedHomework.homework.teacherId,
          homeworkCourseId: ownedHomework.homework.courseId,
          courseTeacherId: ownedHomework.courseTeacherId,
        })) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
      const deleteScope = ctx.user.role === "teacher"
        ? and(
            eq(homework.id, body.homeworkId),
            eq(homework.teacherId, ctx.user.id),
            or(
              isNull(homework.courseId),
              exists(db
                .select({ id: courses.id })
                .from(courses)
                .where(and(
                  eq(courses.id, homework.courseId),
                  eq(courses.teacherId, ctx.user.id),
                ))),
            ),
          )
        : eq(homework.id, body.homeworkId);
      const deletedRows = await db
        .delete(homework)
        .where(deleteScope)
        .returning({ id: homework.id });
      if (ctx.user.role === "teacher" && deletedRows.length === 0) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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
