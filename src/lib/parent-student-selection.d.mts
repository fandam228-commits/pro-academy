export type ParentStudentSelection =
  | { status: "allowed"; studentId: string }
  | { status: "invalid-links" | "no-linked-student" | "invalid-student-id" | "not-linked" | "selection-required"; studentId: null };

export function resolveParentStudentSelection(input: {
  requestedStudentId?: string | null;
  linkedStudentIds: unknown;
}): ParentStudentSelection;
