export type StudentPerformanceAccessInput = {
  role?: unknown;
  requesterId?: unknown;
  requestedStudentId?: unknown;
  parentLinked?: unknown;
  teacherEnrolled?: unknown;
};

export type StudentPerformanceAccessResult =
  | { allowed: true; studentId: string }
  | { allowed: false; reason: "invalid_identity" | "student_required" | "forbidden" };

export function resolveStudentPerformanceAccess(
  input?: StudentPerformanceAccessInput
): StudentPerformanceAccessResult;
