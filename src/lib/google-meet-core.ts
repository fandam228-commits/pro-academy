/**
 * Google Meet & Google Calendar Core Utilities
 * Professional Academy — Mr. Habib El Rahman
 */

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export const GOOGLE_MEET_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export interface GoogleMeetConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export function getGoogleConfig(): GoogleMeetConfig {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/google/oauth`
        : "https://pro-academy-sfl3.vercel.app/api/google/oauth"),
  };
}

/**
 * Generate Google OAuth 2.0 authorization URL
 */
export function buildGoogleAuthUrl(customRedirectUri?: string): string {
  const config = getGoogleConfig();
  const redirectUri = customRedirectUri || config.redirectUri;

  if (!config.clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in environment variables.");
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri || "",
    response_type: "code",
    scope: GOOGLE_MEET_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: "google_meet_auth_flow",
    login_hint: "fandam228@gmail.com",
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Fallback Meet URL generator when API is in offline/manual mode
 */
export function generateFallbackMeetUrl(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${part(3)}-${part(4)}-${part(3)}`;
}
