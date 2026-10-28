/**
 * Authorization policy for a single student's analytics report.
 * Relationship IDs must be loaded from the database by the caller.
 *
 * Fail closed on malformed IDs or relationship collections. In particular,
 * never call String.prototype.includes on an unvalidated relationship value:
 * a string can match a partial student ID.
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function containsExactId(ids, studentId) {
  return Array.isArray(ids) && ids.some((id) => typeof id === "string" && id === studentId);
}

export function canAccessStudentAnalytics({
  role,
  requesterId,
  studentId,
  linkedParentStudentIds = [],
  teacherStudentIds = [],
} = {}) {
  if (!isNonEmptyString(role) || !isNonEmptyString(requesterId) || !isNonEmptyString(studentId)) {
    return false;
  }

  if (role === "admin") return true;
  if (role === "student") return requesterId === studentId;
  if (role === "parent") return containsExactId(linkedParentStudentIds, studentId);
  if (role === "teacher") return containsExactId(teacherStudentIds, studentId);
  return false;
}
