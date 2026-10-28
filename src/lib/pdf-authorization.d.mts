export interface PdfManagementInput {
  role: string | null | undefined;
  requesterId: string | null | undefined;
  uploaderId?: string | null;
  documentId?: string | null;
  documentCourseId?: string | null;
  courseTeacherId?: string | null;
}
export function canManagePdfDocument(input: PdfManagementInput): boolean;
export function canAttachPdfToCourse(input: PdfManagementInput): boolean;

export interface StudentPdfAccessInput {
  studentGrade?: string | null;
  documentGrade?: string | null;
  documentCourseId?: string | null;
  isProtected?: boolean | null;
  activeCourseIds?: string[];
}
export function canStudentAccessPdf(input: StudentPdfAccessInput): boolean;
