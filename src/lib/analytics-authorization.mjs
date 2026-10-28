import { resolveStudentDataAccess } from "./student-data-access.mjs";

/**
 * Authorization policy for a single student's analytics report.
 * Relationship IDs must be loaded from the database by the caller.
 */
export function canAccessStudentAnalytics({
  role,
  requesterId,
  studentId,
  linkedParentStudentIds = [],
  teacherStudentIds = [],
}) {
  if (!studentId) return false;
  return resolveStudentDataAccess({
    role,
    requesterId,
    requestedStudentId: studentId,
    linkedParentStudentIds,
    teacherStudentIds,
  }).allowed;
}
