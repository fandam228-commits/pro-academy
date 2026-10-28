/**
 * Extract the session token from an Authorization header or the pa_session cookie.
 * Malformed percent-encoding in an untrusted cookie must be treated as an absent
 * credential, not allowed to throw into API route handlers.
 */
export function extractSessionToken(authorizationHeader, cookieHeader) {
  const authorization = typeof authorizationHeader === "string" ? authorizationHeader : "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice(7).trim();
    return token || null;
  }

  const cookies = typeof cookieHeader === "string" ? cookieHeader : "";
  const match = cookies.match(/(?:^|;\s*)pa_session=([^;]+)/);
  if (!match) return null;

  try {
    const token = decodeURIComponent(match[1]);
    return token || null;
  } catch {
    return null;
  }
}
