export function canManagePdfDocument(input: {
  role?: string | null;
  requesterId?: string | null;
  uploaderId?: string | null;
  courseId?: string | null;
  courseTeacherId?: string | null;
}): boolean;

export function canAssignPdfToCourse(input: {
  role?: string | null;
  requesterId?: string | null;
  courseId?: string | null;
  courseTeacherId?: string | null;
}): boolean;

export function isPrivateVercelBlobUrl(value: unknown): boolean;
