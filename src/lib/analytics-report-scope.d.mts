export interface TeacherAnalyticsEnrollmentRow {
  studentId: string;
  courseId: string;
  status: string | null;
  teacherId: string;
}

export function getTeacherAnalyticsStudentIds(enrollmentRows: unknown, teacherId: string): string[];
export function getTeacherAnalyticsCourseIds(enrollmentRows: unknown, teacherId: string, studentId: string): string[];
export function isTeacherScopedHomework(item: unknown, teacherId: string, allowedCourseIds: unknown): boolean;
export function isCourseScopedQuiz(quiz: unknown, allowedCourseIds: unknown): boolean;
