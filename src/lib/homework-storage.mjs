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

/** Accept only pathnames in the homework namespace; never fetch arbitrary URLs. */
export function isPrivateHomeworkBlobPath(value) {
  if (typeof value !== "string" || !value.startsWith("homework/")) return false;
  if (value.includes("\\") || value.includes("?") || value.includes("#") || value.includes("%")) return false;
  const segments = value.split("/");
  return segments.every((segment) => segment !== "" && segment !== "." && segment !== "..");
}
