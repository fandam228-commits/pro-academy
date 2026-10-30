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
