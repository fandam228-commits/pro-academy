export type HomeworkFileAccessDecision = "allowed" | "not-found";
export function getHomeworkFileAccessDecision(input: {
  submissionFound: boolean;
  homeworkFound: boolean;
  role: string | null | undefined;
  requesterId: string | null | undefined;
  submissionStudentId?: string | null;
  homeworkTeacherId?: string | null;
  homeworkCourseId?: string | null;
  courseTeacherId?: string | null;
}): HomeworkFileAccessDecision;

export interface HomeworkBlobEnvironment {
  HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN?: string | null;
}
export function getHomeworkPrivateBlobToken(env?: HomeworkBlobEnvironment): string | null;
export function isLegacyPublicHomeworkBlobUrl(value: unknown): boolean;
export function isPrivateHomeworkBlobPath(value: unknown): boolean;

export type HomeworkFileStorageDecision =
  | "no-file"
  | "legacy-public-url"
  | "invalid-private-path"
  | "private-storage-not-configured"
  | "stream-private";
export function getHomeworkFileStorageDecision(input: {
  storagePath: unknown;
  privateBlobToken: string | null | undefined;
}): HomeworkFileStorageDecision;
