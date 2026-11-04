export type ParentAnalyticsStudentSelection =
  | { status: "missing" }
  | { status: "ambiguous" }
  | { status: "selected"; studentId: string };

export function resolveParentAnalyticsStudent(
  requestedStudentId: string | null | undefined,
  linkedStudentIds?: Array<string | null | undefined>
): ParentAnalyticsStudentSelection;

/**
 * Restrict parent-link IDs to accounts confirmed by the caller's current
 * role-filtered student-account lookup. This helper does not verify link
 * approval; the API must enforce verified-link metadata separately.
 */
export function filterParentLinkedStudentIds(
  linkedStudentIds?: Array<string | null | undefined>,
  studentAccountIds?: Array<string | null | undefined>
): string[];
