/** Authorization helpers for PDF document management and private Blob storage. */
export function canManagePdfDocument({ role, requesterId, uploaderId, courseId, courseTeacherId }) {
  if (!role || !requesterId) return false;
  if (role === "admin") return true;
  if (role !== "teacher") return false;
  if (courseId) return Boolean(courseTeacherId && courseTeacherId === requesterId);
  return Boolean(uploaderId && uploaderId === requesterId);
}

export function canAssignPdfToCourse({ role, requesterId, courseId, courseTeacherId }) {
  if (!role || !requesterId) return false;
  if (role === "admin") return true;
  if (role !== "teacher") return false;
  if (!courseId) return true;
  return Boolean(courseTeacherId && courseTeacherId === requesterId);
}

export function isPrivateVercelBlobUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.hostname.endsWith(".private.blob.vercel-storage.com") &&
      url.pathname.length > 1 &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
