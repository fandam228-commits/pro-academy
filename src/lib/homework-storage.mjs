/**
 * Private Blob storage helpers for student homework submissions.
 * Do not fall back to public storage when configuration is missing.
 */
export function getHomeworkPrivateBlobToken(env = process.env) {
  const token = env.HOMEWORK_PRIVATE_BLOB_READ_WRITE_TOKEN;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export function isLegacyPublicHomeworkBlobUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

/**
 * Accept only canonical, generated pathnames in the private homework namespace.
 * Encoded separators/traversal and non-generated characters are rejected so
 * the storage SDK never receives an ambiguous path supplied by a database row.
 */
export function isPrivateHomeworkBlobPath(value) {
  if (typeof value !== "string" || value.length > 1024 || !value.startsWith("homework/")) return false;
  if (/[\\?#%\u0000-\u001f\u007f]/.test(value)) return false;

  const segments = value.split("/");
  if (segments.length < 2 || segments[0] !== "homework") return false;

  return segments.slice(1).every(
    (segment) =>
      segment.length > 0 &&
      segment !== "." &&
      segment !== ".." &&
      /^[A-Za-z0-9._-]+$/.test(segment)
  );
}
