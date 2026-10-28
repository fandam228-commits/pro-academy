/**
 * Authorization rules for the PDF library.
 * The route loads ownership/enrollment relationships from the database.
 */
export function canManagePdfDocument({ role, requesterId, uploaderId }) {
  if (role === "admin") return true;
  return role === "teacher" && Boolean(requesterId) && requesterId === uploaderId;
}

export function canAttachPdfToCourse({ role, requesterId, courseTeacherId }) {
  if (role === "admin") return true;
  return role === "teacher" && Boolean(requesterId) && requesterId === courseTeacherId;
}

/**
 * Mirrors list and direct-file access rules for students.
 * Course-linked materials require active enrollment. Protected course-less
 * materials are scoped to the student's grade rather than being global.
 */
export function canStudentAccessPdf({
  studentGrade,
  documentGrade,
  documentCourseId,
  isProtected,
  activeCourseIds = [],
}) {
  if (documentCourseId) return activeCourseIds.includes(documentCourseId);
  if (isProtected) {
    return Boolean(studentGrade && documentGrade && studentGrade === documentGrade);
  }
  return true;
}
