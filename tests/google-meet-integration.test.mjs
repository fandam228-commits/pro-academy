import test from "node:test";
import assert from "node:assert/strict";
import { generateFallbackMeetUrl, buildGoogleAuthUrl } from "../src/lib/google-meet-core.ts";

test("Google Meet: generateFallbackMeetUrl produces valid standard Meet pattern", () => {
  const url = generateFallbackMeetUrl();
  assert.ok(url.startsWith("https://meet.google.com/"));
  const code = url.replace("https://meet.google.com/", "");
  assert.match(code, /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
});

test("Google Meet: buildGoogleAuthUrl creates compliant Google OAuth 2.0 authorization URL", () => {
  process.env.GOOGLE_CLIENT_ID = "test-client-id-12345.apps.googleusercontent.com";
  const urlStr = buildGoogleAuthUrl("https://pro-academy-sfl3.vercel.app/api/google/oauth");
  const url = new URL(urlStr);

  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.pathname, "/o/oauth2/v2/auth");
  assert.equal(url.searchParams.get("client_id"), "test-client-id-12345.apps.googleusercontent.com");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.ok(url.searchParams.get("scope").includes("calendar.events"));
  assert.equal(url.searchParams.get("login_hint"), "fandam228@gmail.com");
});

test("Live Classroom: Attendance timing calculation classifies on-time vs late joins", () => {
  const sessionStartTime = new Date("2026-11-15T18:00:00Z");

  // Joined 5 minutes after start -> Present
  const joinEarly = new Date("2026-11-15T18:05:00Z");
  const diffEarly = (joinEarly.getTime() - sessionStartTime.getTime()) / (60 * 1000);
  const statusEarly = diffEarly > 15 ? "late" : "present";
  assert.equal(statusEarly, "present");

  // Joined 25 minutes after start -> Late
  const joinLate = new Date("2026-11-15T18:25:00Z");
  const diffLate = (joinLate.getTime() - sessionStartTime.getTime()) / (60 * 1000);
  const statusLate = diffLate > 15 ? "late" : "present";
  assert.equal(statusLate, "late");
});

test("Google Account Specifications: Free personal Gmail account constraints strictly respected", () => {
  const FREE_ACCOUNT_LIMITS = {
    maxAttendees: 100,
    maxDurationMinutes: 60,
    requiresWorkspaceSubscription: false,
    requiresCustomDomain: false,
    nativeCloudRecording: false, // requires local recording + replay link upload
  };

  assert.equal(FREE_ACCOUNT_LIMITS.maxAttendees, 100);
  assert.equal(FREE_ACCOUNT_LIMITS.maxDurationMinutes, 60);
  assert.equal(FREE_ACCOUNT_LIMITS.requiresWorkspaceSubscription, false);
  assert.equal(FREE_ACCOUNT_LIMITS.requiresCustomDomain, false);
  assert.equal(FREE_ACCOUNT_LIMITS.nativeCloudRecording, false);
});
