export type ParentAnalyticsStudentSelection =
  | { status: "missing" }
  | { status: "ambiguous" }
  | { status: "selected"; studentId: string };

export function resolveParentAnalyticsStudent(
  requestedStudentId: string | null | undefined,
  linkedStudentIds?: Array<string | null | undefined>
): ParentAnalyticsStudentSelection;
