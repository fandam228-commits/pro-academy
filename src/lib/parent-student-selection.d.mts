export type ParentStudentSelectionResult =
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

export function resolveParentStudentSelection(
  requestedStudentId: string | null | undefined,
  linkedStudentIds: unknown,
): ParentStudentSelectionResult;
