export function resolveParentAnalyticsStudent(requestedStudentId, linkedStudentIds = []) {
  // Fail closed if the caller supplies malformed relationship data.
  if (
    !Array.isArray(linkedStudentIds) ||
    !linkedStudentIds.every((id) => typeof id === "string" && id.trim().length > 0)
  ) {
    return { status: "missing" };
  }

  const uniqueIds = [...new Set(linkedStudentIds)];

  // An explicit studentId is a selection, not authorization. It must be one of
  // the IDs already resolved from this parent's authorized links.
  if (requestedStudentId !== null && requestedStudentId !== undefined) {
    if (
      typeof requestedStudentId !== "string" ||
      requestedStudentId.trim().length === 0 ||
      !uniqueIds.includes(requestedStudentId)
    ) {
      return { status: "missing" };
    }
    return { status: "selected", studentId: requestedStudentId };
  }

  if (uniqueIds.length === 0) return { status: "missing" };
  if (uniqueIds.length > 1) return { status: "ambiguous" };
  return { status: "selected", studentId: uniqueIds[0] };
}


/**
 * Keep parent report selection limited to linked IDs that resolve to actual
 * student accounts. The caller supplies IDs returned by a role-filtered users
 * query; this helper never treats a parent-link row alone as proof that its
 * target is a student.
 */
export function filterParentLinkedStudentIds(linkedStudentIds = [], studentAccountIds = []) {
  if (!Array.isArray(linkedStudentIds) || !Array.isArray(studentAccountIds)) return [];

  const validStudentIds = new Set(
    studentAccountIds.filter((id) => typeof id === "string" && id.trim().length > 0),
  );

  return [...new Set(
    linkedStudentIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0 && validStudentIds.has(id),
    ),
  )];
}
