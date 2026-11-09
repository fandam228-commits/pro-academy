import { and, eq, sql } from "drizzle-orm";
import { canManageHomework } from "./homework-authorization.mjs";

function denied(status, error) {
  return { ok: false, status, error };
}

async function lockCurrentActor(tx, users, actorId, actorRole) {
  const rows = await tx
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, actorId))
    .for("share");
  const currentRole = rows[0]?.role;
  return currentRole === actorRole && (currentRole === "teacher" || currentRole === "admin");
}

async function lockHomeworkAndOwner(tx, tables, homeworkId, actorId, actorRole) {
  const rows = await tx
    .select({
      id: tables.homework.id,
      title: tables.homework.title,
      teacherId: tables.homework.teacherId,
      courseId: tables.homework.courseId,
      totalPoints: tables.homework.totalPoints,
    })
    .from(tables.homework)
    .where(eq(tables.homework.id, homeworkId))
    .for("share");
  const assignment = rows[0];
  if (!assignment) return { ok: false, status: 404, error: "Homework not found" };

  const courseRows = assignment.courseId
    ? await tx
        .select({ teacherId: tables.courses.teacherId })
        .from(tables.courses)
        .where(eq(tables.courses.id, assignment.courseId))
        .for("share")
    : [];
  const courseTeacherId = courseRows[0]?.teacherId ?? null;

  if (!canManageHomework({
    role: actorRole,
    requesterId: actorId,
    homeworkTeacherId: assignment.teacherId,
    homeworkCourseId: assignment.courseId,
    courseTeacherId,
  })) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, assignment };
}

/**
 * Grade a submission only while the actor's current role and the current
 * homework/course ownership remain locked and valid through the write.
 */
export async function gradeHomeworkSubmission({
  database,
  tables,
  actorId,
  actorRole,
  submissionId,
  score,
  feedback,
}) {
  return database.transaction(async (tx) => {
    if (!(await lockCurrentActor(tx, tables.users, actorId, actorRole))) {
      return denied(403, "Forbidden");
    }

    const submissionRows = await tx
      .select({
        id: tables.homeworkSubmissions.id,
        homeworkId: tables.homeworkSubmissions.homeworkId,
        studentId: tables.homeworkSubmissions.studentId,
      })
      .from(tables.homeworkSubmissions)
      .where(eq(tables.homeworkSubmissions.id, submissionId))
      .for("update");
    const submission = submissionRows[0];
    if (!submission) return denied(404, "Submission not found");

    const authorization = await lockHomeworkAndOwner(
      tx,
      tables,
      submission.homeworkId,
      actorId,
      actorRole,
    );
    if (!authorization.ok) return denied(authorization.status, authorization.error);

    const assignment = authorization.assignment;
    const maxPoints = assignment.totalPoints || 50;
    const parsedScore = Number.parseInt(String(score ?? ""), 10);
    const safeScore = Math.max(0, Math.min(Number.isFinite(parsedScore) ? parsedScore : 0, maxPoints));

    await tx
      .update(tables.homeworkSubmissions)
      .set({
        status: "graded",
        score: safeScore,
        feedback: feedback || "",
        gradedAt: new Date(),
      })
      .where(eq(tables.homeworkSubmissions.id, submissionId));

    await tx
      .update(tables.users)
      .set({ points: sql`${tables.users.points} + ${safeScore}` })
      .where(eq(tables.users.id, submission.studentId));

    return {
      ok: true,
      studentId: submission.studentId,
      homeworkTitle: assignment.title,
      score: safeScore,
      maxPoints,
    };
  });
}

/**
 * Delete homework only while the actor's current role and the current course
 * owner remain locked and valid through the deletion.
 */
export async function deleteHomeworkWithAuthorization({
  database,
  tables,
  actorId,
  actorRole,
  homeworkId,
}) {
  return database.transaction(async (tx) => {
    if (!(await lockCurrentActor(tx, tables.users, actorId, actorRole))) {
      return denied(403, "Forbidden");
    }

    const authorization = await lockHomeworkAndOwner(
      tx,
      tables,
      homeworkId,
      actorId,
      actorRole,
    );
    if (!authorization.ok) return denied(authorization.status, authorization.error);

    await tx
      .delete(tables.homework)
      .where(eq(tables.homework.id, homeworkId));
    return { ok: true };
  });
}
