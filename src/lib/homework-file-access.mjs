/**
 * Authorization and storage policy for homework submission file reads.
 * Database ownership must be resolved by the caller before invoking these rules.
 */
export function getHomeworkFileAccessDecision({
  submissionFound,
  homeworkFound,
  role,
  requesterId,
  submissionStudentId,
  homeworkTeacherId,
  homeworkCourseId,
  courseTeacherId,
}) {
  if (submissionFound !== true || homeworkFound !== true || !role || !requesterId) {
    return "not-found";
  }

  if (role === "admin") return "allowed";

  if (role === "student") {
    return submissionStudentId && requesterId === submissionStudentId ? "allowed" : "not-found";
  }

  if (role !== "teacher" || !homeworkTeacherId || requesterId !== homeworkTeacherId) {
    return "not-found";
  }

  // Grade-only homework has no course owner to resolve. Course-linked homework
  // must match both the homework teacher and the course's current database owner.
  if (homeworkCourseId === null) return "allowed";
  if (typeof homeworkCourseId !== "string" || homeworkCourseId.trim() === "") {
    return "not-found";
  }

  return courseTeacherId && requesterId === courseTeacherId ? "allowed" : "not-found";
}

export function getHomeworkPrivateBlobToken(env = process.env) {
  const token = env.HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export function isLegacyPublicHomeworkBlobUrl(value) {
  if (typeof value !== "string") return false;
  const normalized = value.toLowerCase();
  return normalized.startsWith("http://") || normalized.startsWith("https://");
}

/** Accept only pathnames in the homework namespace; never fetch arbitrary URLs. */
export function isPrivateHomeworkBlobPath(value) {
  if (typeof value !== "string" || !value.startsWith("homework/")) return false;
  if (value.includes(String.fromCharCode(92)) || value.includes("?") || value.includes("#") || value.includes("%")) return false;
  const segments = value.split("/");
  return segments.every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

export function getHomeworkFileStorageDecision({ storagePath, privateBlobToken }) {
  if (typeof storagePath !== "string" || storagePath.length === 0) return "no-file";
  if (isLegacyPublicHomeworkBlobUrl(storagePath)) return "legacy-public-url";
  if (!isPrivateHomeworkBlobPath(storagePath)) return "invalid-private-path";
  if (typeof privateBlobToken !== "string" || privateBlobToken.trim() === "") {
    return "private-storage-not-configured";
  }
  return "stream-private";
}
