export interface AnalyticsReportDataVisibility {
  includeStudentGamification: boolean;
  includeGeneratedExamAttempts: boolean;
  includeAttendance: boolean;
  includeGlobalQuestionBank: boolean;
}

export function getAnalyticsReportDataVisibility(scope: unknown): AnalyticsReportDataVisibility;

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
export function getVerifiedParentAnalyticsStudentIds(linkRows: unknown): string[];

export type ParentAnalyticsStudentResolution =
  | { ok: true; studentId: string }
  | {
      ok: false;
      reason:
        | "invalid-links"
        | "invalid-student-id"
        | "forbidden"
        | "no-linked-student"
        | "student-id-required";
    };

export function resolveParentAnalyticsStudentId(
  requestedStudentId: unknown,
  linkedParentStudentIds: unknown
): ParentAnalyticsStudentResolution;
