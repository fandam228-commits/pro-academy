/** Authorization rules for homework and submission records.
 * Database relationships must be resolved by the caller before invoking these rules.
 */
export function canManageHomework({
  role,
  requesterId,
  homeworkTeacherId,
  homeworkCourseId,
  courseTeacherId,
}) {
  if (!role || !requesterId) return false;
  if (role === "admin") return true;
  if (role !== "teacher" || !homeworkTeacherId || requesterId !== homeworkTeacherId) return false;

  // Legacy course-linked homework can have stale teacher ownership metadata.
  // Require the current course owner to match; only grade-only homework may omit a course.
  if (homeworkCourseId === null) return true;
  if (typeof homeworkCourseId !== "string" || homeworkCourseId.trim() === "") return false;
  return Boolean(courseTeacherId) && requesterId === courseTeacherId;
}

export function canViewHomeworkSubmissionFile({
  role,
  requesterId,
  submissionStudentId,
  homeworkTeacherId,
  homeworkCourseId,
  courseTeacherId,
}) {
  if (!role || !requesterId) return false;
  if (role === "admin") return true;
  if (role === "teacher") {
    if (!homeworkTeacherId || requesterId !== homeworkTeacherId) return false;

    // Course-linked legacy rows can contain inconsistent teacher IDs. Require
    // the current course owner to match too; only grade-only homework may omit it.
    if (homeworkCourseId === null) return true;
    if (typeof homeworkCourseId !== "string" || homeworkCourseId.trim() === "") return false;
    return Boolean(courseTeacherId) && requesterId === courseTeacherId;
  }
  if (role === "student") {
    return Boolean(submissionStudentId) && requesterId === submissionStudentId;
  }
  return false;
}

/** A graded submission is immutable; ungraded or legacy-null statuses may be replaced. */
export function canReplaceHomeworkSubmission({ status }) {
  return status !== "graded";
}

export function canSubmitHomework({ role, studentGrade, homeworkGrade }) {
  if (role !== "student") return false;
  const requestedGrade = typeof homeworkGrade === "string" ? homeworkGrade.trim() : "";
  const actualGrade = typeof studentGrade === "string" ? studentGrade.trim() : "";
  // A known grade-specific assignment must fail closed when the student's grade is missing.
  if (requestedGrade && actualGrade !== requestedGrade) return false;
  return true;
}

/**
 * Course-linked homework is visible/submittable only to a student with a current
 * active/completed enrollment in that course. Grade-only homework (no courseId)
 * remains governed by the caller's grade check.
 */
export function canAccessHomeworkCourse({ role, homeworkCourseId, enrolledCourseIds }) {
  if (role !== "student") return false;
  if (homeworkCourseId === null || homeworkCourseId === undefined) return true;
  if (typeof homeworkCourseId !== "string" || homeworkCourseId.trim() === "") return false;
  if (!Array.isArray(enrolledCourseIds) ||
      !enrolledCourseIds.every((id) => typeof id === "string" && id.trim() !== "")) {
    return false;
  }
  return enrolledCourseIds.includes(homeworkCourseId);
}

/**
 * Collapse missing and unauthorized submission-file lookups into the same
 * externally visible outcome to avoid leaking whether another user's record exists.
 */
export function getHomeworkFileAccessDecision({
  submissionFound,
  homeworkFound,
  role,
  requesterId,
  submissionStudentId,
  homeworkTeacherId,
  homeworkCourseId,
  courseTeacherId,
}) {
  if (submissionFound !== true || homeworkFound !== true) return "not-found";
  return canViewHomeworkSubmissionFile({
    role,
    requesterId,
    submissionStudentId,
    homeworkTeacherId,
    homeworkCourseId,
    courseTeacherId,
  }) ? "allowed" : "not-found";
}


/**
 * Check whether an authenticated admin or teacher may attach homework to a course.
 * The caller must verify the course exists and pass its teacherId from the database.
 */
export function canAssignHomeworkToCourse({ role, requesterId, courseTeacherId }) {
  if (!requesterId || !courseTeacherId) return false;
  if (role === "admin") return true;
  if (role === "teacher") return requesterId === courseTeacherId;
  return false;
}
