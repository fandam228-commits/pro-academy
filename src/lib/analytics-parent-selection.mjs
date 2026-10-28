export function resolveParentAnalyticsStudent(requestedStudentId, linkedStudentIds = []) {
  if (requestedStudentId) return { status: "selected", studentId: requestedStudentId };
  const uniqueIds = [...new Set(linkedStudentIds.filter(Boolean))];
  if (uniqueIds.length === 0) return { status: "missing" };
  if (uniqueIds.length > 1) return { status: "ambiguous" };
  return { status: "selected", studentId: uniqueIds[0] };
}
