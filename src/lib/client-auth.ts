"use client";

/**
 * Client auth compatibility helpers.
 *
 * Sessions are now stored in an HttpOnly cookie, so JavaScript must never
 * read, persist, or send the session token through localStorage.
 */
export function getStoredToken(): null {
  return null;
}

export function setStoredToken(_token: string): void {
  // Intentionally a no-op: session token is managed by the HttpOnly cookie.
}

export function clearStoredToken(): void {
  // Kept for backwards compatibility with older callers.
}

export function authHeaders(): Record<string, string> {
  // The browser automatically sends the HttpOnly session cookie for same-origin
  // requests. Returning an empty object prevents accidental token leakage.
  return {};
}
