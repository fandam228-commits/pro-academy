export function canAccessHomeworkRecord(input: {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  homeworkTeacherId: string | null | undefined;
}): boolean;

export function canAssignHomeworkToCourse(input: {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  courseTeacherId: string | null | undefined;
}): boolean;
