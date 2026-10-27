/**
 * Resolve access to a single student's private learning data.
 * Callers must load relationship IDs from the database; never trust IDs supplied by the client.
 */
export function resolveStudentDataAccess({
  role,
  requesterId,
  requestedStudentId,
  linkedParentStudentIds = [],
  teacherStudentIds = [],
}) {
  if (!role || !requesterId) {
    return { allowed: false, studentId: requestedStudentId || null, reason: "forbidden" };
  }

  if (role === "student") {
    const studentId = requestedStudentId || requesterId;
    return studentId === requesterId
      ? { allowed: true, studentId, reason: null }
      : { allowed: false, studentId, reason: "forbidden" };
  }

  if (role === "parent") {
    const studentId = requestedStudentId || linkedParentStudentIds[0] || null;
    if (!studentId) return { allowed: false, studentId: null, reason: "no_linked_student" };
    return linkedParentStudentIds.includes(studentId)
      ? { allowed: true, studentId, reason: null }
      : { allowed: false, studentId, reason: "forbidden" };
  }

  if (role === "teacher") {
    if (!requestedStudentId) {
      return { allowed: false, studentId: null, reason: "student_required" };
    }
    return teacherStudentIds.includes(requestedStudentId)
      ? { allowed: true, studentId: requestedStudentId, reason: null }
      : { allowed: false, studentId: requestedStudentId, reason: "forbidden" };
  }

  if (role === "admin") {
    if (!requestedStudentId) {
      return { allowed: false, studentId: null, reason: "student_required" };
    }
    return { allowed: true, studentId: requestedStudentId, reason: null };
  }

  return { allowed: false, studentId: requestedStudentId || null, reason: "forbidden" };
}
