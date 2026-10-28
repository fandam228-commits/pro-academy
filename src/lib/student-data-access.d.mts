export interface StudentDataAccessInput {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  requestedStudentId?: string | null;
  linkedParentStudentIds?: string[];
  teacherStudentIds?: string[];
}

export interface StudentDataAccessResult {
  allowed: boolean;
  studentId: string | null;
  reason: "forbidden" | "no_linked_student" | "student_required" | null;
}

export function resolveStudentDataAccess(input: StudentDataAccessInput): StudentDataAccessResult;
