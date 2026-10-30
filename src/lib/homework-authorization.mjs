/** Authorization rules for homework and submission records.
 * Database relationships must be resolved by the caller before invoking these rules.
 */
export function canManageHomework({ role, requesterId, homeworkTeacherId }) {
  if (!role || !requesterId) return false;
  if (role === "admin") return true;
  return role === "teacher" && Boolean(homeworkTeacherId) && requesterId === homeworkTeacherId;
}

export function canViewHomeworkSubmissionFile({
  role,
  requesterId,
  submissionStudentId,
  homeworkTeacherId,
}) {
  if (!role || !requesterId) return false;
  if (role === "admin") return true;
  if (role === "teacher") {
    return Boolean(homeworkTeacherId) && requesterId === homeworkTeacherId;
  }
  if (role === "student") {
    return Boolean(submissionStudentId) && requesterId === submissionStudentId;
  }
  return false;
}

export function canSubmitHomework({ role, studentGrade, homeworkGrade }) {
  if (role !== "student") return false;
  if (studentGrade && homeworkGrade && studentGrade !== homeworkGrade) return false;
  return true;
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
}) {
  if (submissionFound !== true || homeworkFound !== true) return "not-found";
  return canViewHomeworkSubmissionFile({
    role,
    requesterId,
    submissionStudentId,
    homeworkTeacherId,
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
