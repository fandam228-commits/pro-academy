export interface StudentReportAuthorizationInput {
  role: string;
  requesterId: string;
  studentId: string;
  linkedParentStudentIds?: unknown;
  teacherStudentIds?: unknown;
}

export interface TeacherEnrollmentScopeRow {
  studentId: string;
  courseId: string;
  status: string | null;
  teacherId: string;
}

export function canAccessStudentReport(input: StudentReportAuthorizationInput): boolean;
export function getTeacherStudentIds(enrollments: unknown, teacherId: string): string[];
export function getTeacherCourseIdsForStudent(enrollments: unknown, teacherId: string, studentId: string): string[];
export function isTeacherOwnedHomework(item: unknown, teacherId: string, allowedCourseIds: unknown): boolean;
export function isTeacherCourseRecord(item: unknown, allowedCourseIds: unknown): boolean;
