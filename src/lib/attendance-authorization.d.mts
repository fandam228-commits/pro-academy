export interface AttendanceStudentAccessInput {
  role: string | null | undefined;
  studentId: string | null | undefined;
  teacherStudentIds?: string[];
}

export function canManageAttendanceStudent(input: AttendanceStudentAccessInput): boolean;
export function canSelfCheckIn(role: string | null | undefined): boolean;
export function isValidAttendanceStatus(status: unknown): boolean;
