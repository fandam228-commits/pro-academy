const ELIGIBLE_STATUSES = new Set(["active", "completed"]);

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
