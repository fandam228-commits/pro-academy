/**
 * Resolve an explicitly requested child against a parent's linked student IDs.
 * Duplicate legacy link rows are collapsed so ambiguity means multiple distinct children.
 */
export function resolveParentStudentSelection({ requestedStudentId, linkedStudentIds }) {
  if (!Array.isArray(linkedStudentIds) ||
      !linkedStudentIds.every((id) => typeof id === "string" && id.trim() !== "")) {
    return { status: "invalid-links", studentId: null };
  }

  const uniqueLinkedIds = [...new Set(linkedStudentIds)];
  if (uniqueLinkedIds.length === 0) {
    return { status: "no-linked-student", studentId: null };
  }

  if (requestedStudentId !== null && requestedStudentId !== undefined) {
    if (typeof requestedStudentId !== "string" || requestedStudentId.trim() === "") {
      return { status: "invalid-student-id", studentId: null };
    }
    if (!uniqueLinkedIds.includes(requestedStudentId)) {
      return { status: "not-linked", studentId: null };
    }
    return { status: "allowed", studentId: requestedStudentId };
  }

  if (uniqueLinkedIds.length > 1) {
    return { status: "selection-required", studentId: null };
  }
  return { status: "allowed", studentId: uniqueLinkedIds[0] };
}
