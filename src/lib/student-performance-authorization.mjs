/**
 * Resolve access to one student's generated-exam performance history.
 * Relationship booleans must come from exact database checks performed by the API route.
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function denied(reason = "forbidden") {
  return { allowed: false, reason };
}

export function resolveStudentPerformanceAccess({
  role,
  requesterId,
  requestedStudentId,
  parentLinked = false,
  teacherEnrolled = false,
} = {}) {
  if (!isNonEmptyString(role) || !isNonEmptyString(requesterId)) {
    return denied("invalid_identity");
  }

  if (role === "student") {
    if (requestedStudentId == null || requestedStudentId === "") {
      return { allowed: true, studentId: requesterId };
    }
    if (!isNonEmptyString(requestedStudentId) || requestedStudentId !== requesterId) {
      return denied();
    }
    return { allowed: true, studentId: requesterId };
  }

  if (!["admin", "teacher", "parent"].includes(role)) {
    return denied();
  }

  if (!isNonEmptyString(requestedStudentId)) {
    return denied("student_required");
  }

  if (role === "admin") {
    return { allowed: true, studentId: requestedStudentId };
  }
  if (role === "parent" && parentLinked === true) {
    return { allowed: true, studentId: requestedStudentId };
  }
  if (role === "teacher" && teacherEnrolled === true) {
    return { allowed: true, studentId: requestedStudentId };
  }

  return denied();
}
