/**
 * Authorization rules for the PDF library.
 * The route loads ownership/enrollment relationships from the database.
 */
export function canManagePdfDocument({
  role,
  requesterId,
  uploaderId,
  documentId,
  documentCourseId,
  courseTeacherId,
}) {
  if (role === "admin") return true;
  if (role !== "teacher" || !requesterId || requesterId !== uploaderId) return false;

  // Old PDF records accepted client-supplied uploaderId/courseId values.
  // Do not trust that legacy metadata to authorize teacher mutations.
  const createdByCurrentUploadFlow =
    typeof documentId === "string" && (documentId.startsWith("pdfu_") || documentId.startsWith("pdfext_"));
  if (!createdByCurrentUploadFlow) return false;

  // For course-linked files, require independently verified course ownership too.
  if (documentCourseId) return courseTeacherId === requesterId;
  return true;
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
