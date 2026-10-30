export interface HomeworkManagementAccessInput {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  homeworkTeacherId?: string | null;
}
export function canManageHomework(input: HomeworkManagementAccessInput): boolean;

export interface HomeworkSubmissionFileAccessInput {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  submissionStudentId?: string | null;
  homeworkTeacherId?: string | null;
}
export function canViewHomeworkSubmissionFile(input: HomeworkSubmissionFileAccessInput): boolean;

export interface HomeworkSubmissionReplaceInput {
  status?: string | null;
}
export function canReplaceHomeworkSubmission(input: HomeworkSubmissionReplaceInput): boolean;

export interface HomeworkSubmissionInput {
  role: string | null | undefined;
  studentGrade?: string | null;
  homeworkGrade?: string | null;
}
export function canSubmitHomework(input: HomeworkSubmissionInput): boolean;

export interface HomeworkFileAccessDecisionInput extends HomeworkSubmissionFileAccessInput {
  submissionFound: boolean;
  homeworkFound: boolean;
}
export function getHomeworkFileAccessDecision(input: HomeworkFileAccessDecisionInput): "allowed" | "not-found";
