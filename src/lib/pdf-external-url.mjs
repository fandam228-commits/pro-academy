const MAX_EXTERNAL_URL_LENGTH = 2048;

/**
 * Normalize a user-supplied external PDF destination.
 * External PDF links are redirects, never server-side fetches; allow only
 * absolute HTTP(S) URLs and reject embedded credentials and control/space chars.
 */
export function normalizePublicPdfUrl(value) {
  if (typeof value !== "string") return null;

  const candidate = value.trim();
  if (!candidate || candidate.length > MAX_EXTERNAL_URL_LENGTH) return null;
  if (/[\u0000-\u0020\u007f]/u.test(candidate)) return null;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!parsed.hostname || parsed.username || parsed.password) return null;

  return parsed.toString();
}
