const ACTIVE_ENROLLMENT_STATUSES = new Set(["active", "completed"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function canAccessStudentReport({
  role,
  requesterId,
  studentId,
  linkedParentStudentIds,
  teacherStudentIds,
}) {
  if (!isNonEmptyString(role) || !isNonEmptyString(requesterId) || !isNonEmptyString(studentId)) {
    return false;
  }

  if (role === "admin") return true;
  if (role === "student") return requesterId === studentId;

  if (role === "parent") {
    return isStringArray(linkedParentStudentIds) && linkedParentStudentIds.includes(studentId);
  }

  if (role === "teacher") {
    return isStringArray(teacherStudentIds) && teacherStudentIds.includes(studentId);
  }

  return false;
}

function isEligibleTeacherEnrollment(enrollment, teacherId) {
  return (
    enrollment !== null &&
    typeof enrollment === "object" &&
    enrollment.teacherId === teacherId &&
    isNonEmptyString(enrollment.studentId) &&
    isNonEmptyString(enrollment.courseId) &&
    ACTIVE_ENROLLMENT_STATUSES.has(enrollment.status)
  );
}

export function getTeacherStudentIds(enrollments, teacherId) {
  if (!Array.isArray(enrollments) || !isNonEmptyString(teacherId)) return [];

  return [...new Set(
    enrollments
      .filter((enrollment) => isEligibleTeacherEnrollment(enrollment, teacherId))
      .map((enrollment) => enrollment.studentId)
  )];
}

export function getTeacherCourseIdsForStudent(enrollments, teacherId, studentId) {
  if (!Array.isArray(enrollments) || !isNonEmptyString(teacherId) || !isNonEmptyString(studentId)) {
    return [];
  }

  return [...new Set(
    enrollments
      .filter((enrollment) =>
        isEligibleTeacherEnrollment(enrollment, teacherId) && enrollment.studentId === studentId
      )
      .map((enrollment) => enrollment.courseId)
  )];
}

export function isTeacherOwnedHomework(item, teacherId, allowedCourseIds) {
  return (
    item !== null &&
    typeof item === "object" &&
    isNonEmptyString(teacherId) &&
    item.teacherId === teacherId &&
    isNonEmptyString(item.courseId) &&
    isStringArray(allowedCourseIds) &&
    allowedCourseIds.includes(item.courseId)
  );
}

export function isTeacherCourseRecord(item, allowedCourseIds) {
  return (
    item !== null &&
    typeof item === "object" &&
    isNonEmptyString(item.courseId) &&
    isStringArray(allowedCourseIds) &&
    allowedCourseIds.includes(item.courseId)
  );
}
