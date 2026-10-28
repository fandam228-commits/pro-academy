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
