/**
 * Authorization policy for a single student's analytics report.
 * Relationship IDs must be loaded from the database by the caller.
 * Invalid relationship containers fail closed rather than using substring
 * matching or coercion.
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasExactRelationshipId(ids, studentId) {
  return Array.isArray(ids) &&
    ids.every((id) => isNonEmptyString(id)) &&
    ids.includes(studentId);
}

export function canAccessStudentAnalytics(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;

  const {
    role,
    requesterId,
    studentId,
    linkedParentStudentIds = [],
    teacherStudentIds = [],
  } = input;

  if (
    !isNonEmptyString(role) ||
    !isNonEmptyString(requesterId) ||
    !isNonEmptyString(studentId)
  ) {
    return false;
  }

  if (role === "admin") return true;
  if (role === "student") return requesterId === studentId;
  if (role === "parent") return hasExactRelationshipId(linkedParentStudentIds, studentId);
  if (role === "teacher") return hasExactRelationshipId(teacherStudentIds, studentId);
  return false;
}
