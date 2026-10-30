const ELIGIBLE_STATUSES = new Set(["active", "completed"]);

/**
 * Teacher analytics must not expose report sources that lack a trustworthy
 * course/teacher relationship. Keep this policy centralized and testable so
 * a future report-builder refactor cannot accidentally re-enable global data.
 */
export function getAnalyticsReportDataVisibility(scope) {
  const teacherScoped = scope !== null && scope !== undefined;
  return {
    includeStudentGamification: !teacherScoped,
    includeGeneratedExamAttempts: !teacherScoped,
    includeAttendance: !teacherScoped,
    includeGlobalQuestionBank: !teacherScoped,
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
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
 * Return only links with an explicit admin verification timestamp and actor.
 * Database reads should also filter these columns; this helper is a second fail-closed guard.
 */
export function getVerifiedParentAnalyticsStudentIds(linkRows) {
  if (!Array.isArray(linkRows)) return [];

  const verifiedIds = linkRows
    .filter((row) => {
      if (!row || typeof row !== "object" || !isNonEmptyString(row.studentId)) return false;
      if (!isNonEmptyString(row.verifiedBy)) return false;
      const timestamp = row.verifiedAt instanceof Date
        ? row.verifiedAt.getTime()
        : typeof row.verifiedAt === "string"
          ? Date.parse(row.verifiedAt)
          : Number.NaN;
      return Number.isFinite(timestamp);
    })
    .map((row) => row.studentId);

  return [...new Set(verifiedIds)];
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
