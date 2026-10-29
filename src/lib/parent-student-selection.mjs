function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Resolve a parent attendance target from IDs already verified by a database
 * join against current user records with role "student".
 */
export function resolveParentStudentSelection(requestedStudentId, linkedStudentIds) {
  if (
    !Array.isArray(linkedStudentIds) ||
    !linkedStudentIds.every((id) => isNonEmptyString(id))
  ) {
    return { ok: false, reason: "invalid-links" };
  }

  const uniqueStudentIds = [...new Set(linkedStudentIds)];

  if (requestedStudentId !== null && requestedStudentId !== undefined) {
    if (!isNonEmptyString(requestedStudentId)) {
      return { ok: false, reason: "invalid-student-id" };
    }
    if (!uniqueStudentIds.includes(requestedStudentId)) {
      return { ok: false, reason: "forbidden" };
    }
    return { ok: true, studentId: requestedStudentId };
  }

  if (uniqueStudentIds.length === 0) {
    return { ok: false, reason: "no-linked-student" };
  }
  if (uniqueStudentIds.length > 1) {
    return { ok: false, reason: "student-id-required" };
  }
  return { ok: true, studentId: uniqueStudentIds[0] };
}
