import { and, eq, inArray } from "drizzle-orm";
import { canAccessHomeworkCourse, canSubmitHomework } from "./homework-authorization.mjs";

/**
 * Revalidate a student's current role, grade, assignment, and enrollment inside
 * the submission transaction. FOR SHARE locks keep those authorization facts
 * stable until the submission insert/replacement commits or rolls back.
 *
 * The caller must already hold the per-student/homework advisory transaction lock.
 */
export async function lockCurrentHomeworkSubmissionAccess(
  tx,
  { homeworkId, studentId },
  { users, homework, enrollments },
) {
  if (!tx || typeof tx.select !== "function") {
    throw new TypeError("A database transaction is required for current submission authorization.");
  }
  if (
    typeof homeworkId !== "string" || homeworkId.trim() === "" ||
    typeof studentId !== "string" || studentId.trim() === ""
  ) {
    throw new TypeError("A homework ID and authenticated student ID are required.");
  }

  const assignmentRows = await tx
    .select({
      id: homework.id,
      title: homework.title,
      grade: homework.grade,
      courseId: homework.courseId,
      teacherId: homework.teacherId,
    })
    .from(homework)
    .where(eq(homework.id, homeworkId))
    .for("share");
  const assignment = assignmentRows[0];
  if (!assignment) return { allowed: false, reason: "homework-not-found" };

  const studentRows = await tx
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      grade: users.grade,
    })
    .from(users)
    .where(eq(users.id, studentId))
    .for("share");
  const student = studentRows[0];
  if (!student || student.role !== "student") {
    return { allowed: false, reason: "student-not-authorized" };
  }

  if (!canSubmitHomework({
    role: student.role,
    studentGrade: student.grade,
    homeworkGrade: assignment.grade,
  })) {
    return { allowed: false, reason: "grade-mismatch" };
  }

  const enrollmentRows = assignment.courseId
    ? await tx
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, assignment.courseId),
          inArray(enrollments.status, ["active", "completed"]),
        ))
        .for("share")
    : [];

  const enrolledCourseIds = [...new Set(enrollmentRows.map((row) => row.courseId))];
  if (!canAccessHomeworkCourse({
    role: student.role,
    homeworkCourseId: assignment.courseId,
    enrolledCourseIds,
  })) {
    return { allowed: false, reason: "not-enrolled" };
  }

  return { allowed: true, homework: assignment, student };
}
