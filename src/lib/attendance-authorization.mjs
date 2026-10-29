const ELIGIBLE_STATUSES = new Set(["active", "completed"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Return only students with an active/completed enrollment in a course owned
 * by the authenticated teacher. Callers must source rows from a courses join.
 */
export function getTeacherAttendanceStudentIds(enrollmentRows, teacherId) {
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
