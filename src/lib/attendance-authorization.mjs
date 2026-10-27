const VALID_ATTENDANCE_STATUSES = new Set(["present", "late", "absent", "excused"]);

/**
 * Admins can manage any student. Teachers can manage only students enrolled
 * in at least one course they own. Relationship IDs must come from the DB.
 */
export function canManageAttendanceStudent({ role, studentId, teacherStudentIds = [] }) {
  if (!role || !studentId) return false;
  if (role === "admin") return true;
  if (role === "teacher") return teacherStudentIds.includes(studentId);
  return false;
}

export function canSelfCheckIn(role) {
  return role === "student";
}

export function isValidAttendanceStatus(status) {
  return VALID_ATTENDANCE_STATUSES.has(status);
}
