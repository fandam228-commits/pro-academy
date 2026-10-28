import { canStudentAccessPdf } from "./pdf-authorization.mjs";

/**
 * Controls which PDF metadata may appear in the library list.
 * Course-linked records require a verified course relationship for the
 * requesting role; unknown roles fail closed.
 */
export function canListPdfDocument({
  role,
  requesterId,
  uploaderId,
  documentCourseId,
  courseTeacherId,
  studentGrade,
  documentGrade,
  isProtected,
  activeCourseIds = [],
  linkedStudentGrades = [],
}) {
  if (role === "admin") return true;

  if (role === "teacher") {
    if (!requesterId) return false;
    if (documentCourseId) return courseTeacherId === requesterId;
    return uploaderId === requesterId;
  }

  if (role === "student") {
    return canStudentAccessPdf({
      studentGrade,
      documentGrade,
      documentCourseId,
      isProtected,
      activeCourseIds,
    });
  }

  if (role === "parent") {
    if (documentCourseId) return activeCourseIds.includes(documentCourseId);
    if (isProtected) {
      return Boolean(
        documentGrade &&
          linkedStudentGrades.some((grade) => grade === documentGrade)
      );
    }
    // Course-less unprotected materials are intentionally shared library items.
    return true;
  }

  return false;
}

/**
 * Whitelist-safe metadata for the library response. Never expose internal
 * filesystem paths, direct external destinations, file contents, or uploader IDs.
 */
export function toPublicPdfMetadata(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    return null;
  }

  const {
    fileData: _fileData,
    storagePath: _storagePath,
    externalUrl: _externalUrl,
    uploaderId: _uploaderId,
    ...metadata
  } = document;

  return metadata;
}
