/**
 * Access policy for reading a homework record and its submissions.
 * The caller must load the record's owner from the database before using this policy.
 */
export function canAccessHomeworkRecord({ role, requesterId, homeworkTeacherId }) {
  if (role === "admin") return Boolean(requesterId);
  if (role === "teacher") {
    return Boolean(requesterId && homeworkTeacherId && requesterId === homeworkTeacherId);
  }
  return false;
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
