const ELIGIBLE_STATUSES = new Set(["active", "completed"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Analytics reports must only be built for an actual student account.
 * This prevents malformed enrollment or parent-link rows from turning another
 * role's user ID into a student-performance lookup.
 */
export function isAnalyticsStudentAccount(user) {
  return Boolean(
    user &&
    typeof user === "object" &&
    !Array.isArray(user) &&
    user.role === "student" &&
    isNonEmptyString(user.id)
  );
}

export function getTeacherAnalyticsStudentIds(enrollmentRows, teacherId) {
  if (!Array.isArray(enrollmentRows) || !isNonEmptyString(teacherId)) return [];

  return [...new Set(enrollmentRows
    .filter((row) =>
      row &&
      row.teacherId === teacherId &&
      isNonEmptyString(row.studentId) &&
      isNonEmptyString(row.courseId) &&
      ELIGIBLE_STATUSES.has(row.status)
    )
    .map((row) => row.studentId))];
}

export function getTeacherAnalyticsCourseIds(enrollmentRows, teacherId, studentId) {
  if (!Array.isArray(enrollmentRows) || !isNonEmptyString(teacherId) || !isNonEmptyString(studentId)) {
    return [];
  }

  return [...new Set(enrollmentRows
    .filter((row) =>
      row &&
      row.teacherId === teacherId &&
      row.studentId === studentId &&
      isNonEmptyString(row.courseId) &&
      ELIGIBLE_STATUSES.has(row.status)
    )
    .map((row) => row.courseId))];
}

export function isTeacherScopedHomework(item, teacherId, allowedCourseIds) {
  return Boolean(
    item &&
    typeof item === "object" &&
    isNonEmptyString(teacherId) &&
    item.teacherId === teacherId &&
    isNonEmptyString(item.courseId) &&
    Array.isArray(allowedCourseIds) &&
    allowedCourseIds.every((id) => typeof id === "string") &&
    allowedCourseIds.includes(item.courseId)
  );
}

export function isCourseScopedQuiz(quiz, allowedCourseIds) {
  return Boolean(
    quiz &&
    typeof quiz === "object" &&
    isNonEmptyString(quiz.courseId) &&
    Array.isArray(allowedCourseIds) &&
    allowedCourseIds.every((id) => typeof id === "string") &&
    allowedCourseIds.includes(quiz.courseId)
  );
}

/**
 * Resolve the student a parent may view without silently choosing among children.
 * The caller must supply parent-link IDs read from the database.
 */
export function resolveParentAnalyticsStudentId(requestedStudentId, linkedParentStudentIds) {
  if (
    !Array.isArray(linkedParentStudentIds) ||
    !linkedParentStudentIds.every((id) => isNonEmptyString(id))
  ) {
    return { ok: false, reason: "invalid-links" };
  }

  const uniqueLinkedIds = [...new Set(linkedParentStudentIds)];

  if (requestedStudentId !== null && requestedStudentId !== undefined) {
    if (!isNonEmptyString(requestedStudentId)) {
      return { ok: false, reason: "invalid-student-id" };
    }
    if (!uniqueLinkedIds.includes(requestedStudentId)) {
      return { ok: false, reason: "forbidden" };
    }
    return { ok: true, studentId: requestedStudentId };
  }

  if (uniqueLinkedIds.length === 0) {
    return { ok: false, reason: "no-linked-student" };
  }
  if (uniqueLinkedIds.length > 1) {
    return { ok: false, reason: "student-id-required" };
  }
  return { ok: true, studentId: uniqueLinkedIds[0] };
}
