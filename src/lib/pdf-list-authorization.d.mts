export interface PdfListAuthorizationInput {
  role: string;
  requesterId?: string | null;
  uploaderId?: string | null;
  documentId?: string | null;
  documentCourseId?: string | null;
  courseTeacherId?: string | null;
  studentGrade?: string | null;
  documentGrade?: string | null;
  isProtected?: boolean | null;
  activeCourseIds?: string[];
  linkedStudentGrades?: Array<string | null | undefined>;
}
export function canListPdfDocument(input: PdfListAuthorizationInput): boolean;
export function toPublicPdfMetadata<T extends Record<string, unknown>>(
  document: T
): Omit<T, "fileData" | "storagePath" | "externalUrl" | "uploaderId"> | null;
