import { and, eq, inArray } from "drizzle-orm";
import { canSubmitHomework } from "./homework-authorization.mjs";

/**
 * Revalidate a student's current role, grade, assignment, and enrollment while
 * holding shared row locks. The caller must perform the submission write in the
 * same transaction so demotion/revocation cannot race authorization.
 */
export async function lockHomeworkSubmissionAuthorization(
  tx,
  { homeworkId, studentId, sessionRole },
  { users, homework, courses, enrollments },
) {
  if (!tx || typeof tx.select !== "function") {
    throw new TypeError("A database transaction is required for homework submission authorization.");
  }
  if (
    typeof homeworkId !== "string" || homeworkId.trim() === "" ||
    typeof studentId !== "string" || studentId.trim() === "" ||
    typeof sessionRole !== "string" || sessionRole.trim() === ""
  ) {
    return { allowed: false, reason: "invalid-input" };
  }
  if (sessionRole !== "student") {
    return { allowed: false, reason: "unsupported-role" };
  }

  const accountRows = await tx
    .select({ id: users.id, role: users.role, grade: users.grade })
    .from(users)
    .where(eq(users.id, studentId))
    .for("share");
  const account = accountRows[0];
  if (!account) return { allowed: false, reason: "account-not-found" };
  if (account.role !== sessionRole || account.role !== "student") {
    return { allowed: false, reason: "role-changed" };
  }

  const homeworkRows = await tx
    .select({
      id: homework.id,
      title: homework.title,
      teacherId: homework.teacherId,
      grade: homework.grade,
      courseId: homework.courseId,
    })
    .from(homework)
    .where(eq(homework.id, homeworkId))
    .for("share");
  const assignment = homeworkRows[0];
  if (!assignment) return { allowed: false, reason: "homework-not-found" };

  if (!canSubmitHomework({
    role: account.role,
    studentGrade: account.grade,
    homeworkGrade: assignment.grade,
  })) {
    return { allowed: false, reason: "grade-mismatch" };
  }

  if (assignment.courseId !== null) {
    if (typeof assignment.courseId !== "string" || assignment.courseId.trim() === "") {
      return { allowed: false, reason: "invalid-course" };
    }
    const courseRows = await tx
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, assignment.courseId))
      .for("share");
    if (courseRows.length === 0) return { allowed: false, reason: "course-not-found" };

    const enrollmentRows = await tx
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.courseId, assignment.courseId),
        inArray(enrollments.status, ["active", "completed"]),
      ))
      .for("share");
    if (enrollmentRows.length === 0) return { allowed: false, reason: "not-enrolled" };
  }

  return {
    allowed: true,
    homeworkId: assignment.id,
    homeworkTitle: assignment.title,
    homeworkTeacherId: assignment.teacherId,
    courseId: assignment.courseId,
  };
}
