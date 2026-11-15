/**
 * Google Meet & Google Calendar Integration Service (DB Enabled)
 * Professional Academy — Mr. Habib El Rahman
 */

import { db } from "@/db";
import { googleIntegrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  GOOGLE_TOKEN_ENDPOINT,
  GOOGLE_CALENDAR_API,
  getGoogleConfig,
} from "./google-meet-core";

export * from "./google-meet-core";

/**
 * Exchange authorization code for access & refresh tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  customRedirectUri?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  email?: string;
}> {
  const config = getGoogleConfig();
  const redirectUri = customRedirectUri || config.redirectUri;

  if (!config.clientId || !config.clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required.");
  }

  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri || "",
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();

  let email = "fandam228@gmail.com";
  try {
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (userinfoRes.ok) {
      const info = await userinfoRes.json();
      if (info.email) email = info.email;
    }
  } catch {}

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    email,
  };
}

/**
 * Refresh an expired access token using the stored refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const config = getGoogleConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth credentials missing for token refresh.");
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to refresh Google access token: ${errorText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Get active Google Access Token for fandam228@gmail.com
 */
export async function getValidAccessToken(): Promise<string | null> {
  const records = await db
    .select()
    .from(googleIntegrations)
    .where(eq(googleIntegrations.accountEmail, "fandam228@gmail.com"))
    .limit(1);

  if (records.length === 0 || !records[0].accessToken) {
    return null;
  }

  const integration = records[0];
  const now = new Date();

  if (integration.tokenExpiry && new Date(integration.tokenExpiry).getTime() - 5 * 60 * 1000 > now.getTime()) {
    return integration.accessToken;
  }

  if (integration.refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken(integration.refreshToken);
      const newExpiry = new Date(Date.now() + 3600 * 1000);

      await db
        .update(googleIntegrations)
        .set({
          accessToken: newAccessToken,
          tokenExpiry: newExpiry,
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(googleIntegrations.id, integration.id));

      return newAccessToken;
    } catch (err) {
      console.error("Error refreshing token:", err);
      return null;
    }
  }

  return null;
}

/**
 * Create a live class event on Google Calendar with Google Meet video conference
 */
export async function createGoogleCalendarEvent(options: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
}): Promise<{
  eventId: string;
  meetUrl: string;
  htmlLink: string;
}> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("No connected Google account found or token expired. Please connect fandam228@gmail.com.");
  }

  const requestId = `meet_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const eventPayload = {
    summary: options.title,
    description: options.description || "حصة لغة إنجليزية مباشرة — أكاديمية المستر (Mr. Habib El Rahman)",
    start: {
      dateTime: options.startTime.toISOString(),
      timeZone: "Africa/Cairo",
    },
    end: {
      dateTime: options.endTime.toISOString(),
      timeZone: "Africa/Cairo",
    },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
  };

  const url = `${GOOGLE_CALENDAR_API}?conferenceDataVersion=1`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const meetUri =
    data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri ||
    data.hangoutLink ||
    "";

  return {
    eventId: data.id,
    meetUrl: meetUri,
    htmlLink: data.htmlLink || "",
  };
}
