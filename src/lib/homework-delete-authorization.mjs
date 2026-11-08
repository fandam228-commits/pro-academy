import { eq } from "drizzle-orm";
import { canManageHomework } from "./homework-authorization.mjs";

/**
 * Lock the current requester, homework row, and (when linked) course row before
 * authorizing deletion. The caller must perform the DELETE in the same
 * transaction so role demotions and ownership transfers cannot race the check.
 */
export async function lockHomeworkDeletionAuthorization(
  tx,
  { homeworkId, requesterId, sessionRole },
  { users, homework, courses },
) {
  if (!tx || typeof tx.select !== "function") {
    throw new TypeError("A database transaction is required for homework deletion authorization.");
  }
  if (
    typeof homeworkId !== "string" || homeworkId.trim() === "" ||
    typeof requesterId !== "string" || requesterId.trim() === "" ||
    typeof sessionRole !== "string" || sessionRole.trim() === ""
  ) {
    return { allowed: false, reason: "invalid-input" };
  }

  const accountRows = await tx
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, requesterId))
    .for("share");
  const account = accountRows[0];
  if (!account) return { allowed: false, reason: "account-not-found" };
  if (account.role !== sessionRole) return { allowed: false, reason: "role-changed" };
  if (account.role !== "teacher" && account.role !== "admin") {
    return { allowed: false, reason: "unsupported-role" };
  }

  const homeworkRows = await tx
    .select({
      id: homework.id,
      teacherId: homework.teacherId,
      courseId: homework.courseId,
    })
    .from(homework)
    .where(eq(homework.id, homeworkId))
    .for("share");
  const assignment = homeworkRows[0];
  if (!assignment) return { allowed: false, reason: "homework-not-found" };

  let courseTeacherId = null;
  if (assignment.courseId !== null) {
    if (typeof assignment.courseId !== "string" || assignment.courseId.trim() === "") {
      return { allowed: false, reason: "forbidden" };
    }
    const courseRows = await tx
      .select({ id: courses.id, teacherId: courses.teacherId })
      .from(courses)
      .where(eq(courses.id, assignment.courseId))
      .for("share");
    courseTeacherId = courseRows[0]?.teacherId ?? null;
  }

  if (!canManageHomework({
    role: account.role,
    requesterId,
    homeworkTeacherId: assignment.teacherId,
    homeworkCourseId: assignment.courseId,
    courseTeacherId,
  })) {
    return { allowed: false, reason: "forbidden" };
  }

  return { allowed: true, homeworkId: assignment.id };
}
