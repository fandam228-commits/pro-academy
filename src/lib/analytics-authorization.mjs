/**
 * Authorization policy for a single student's analytics report.
 * Data relationships must be loaded from the database by the caller.
 */
export function canAccessStudentAnalytics({
  role,
  requesterId,
  studentId,
  linkedParentStudentIds = [],
  teacherStudentIds = [],
}) {
  if (!role || !requesterId || !studentId) return false;
  if (role === "admin") return true;
  if (role === "student") return requesterId === studentId;
  if (role === "parent") return linkedParentStudentIds.includes(studentId);
  if (role === "teacher") return teacherStudentIds.includes(studentId);
  return false;
}
