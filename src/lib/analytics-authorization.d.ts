export interface StudentAnalyticsAccessInput {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  studentId: string | null | undefined;
  linkedParentStudentIds?: string[];
  teacherStudentIds?: string[];
}
export function canAccessStudentAnalytics(input: StudentAnalyticsAccessInput): boolean;
