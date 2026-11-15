import { db } from "@/db";
import { googleIntegrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import {
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleConfig,
  getValidAccessToken,
} from "@/lib/google-meet";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // 1. Google OAuth Callback with error
    if (error) {
      return NextResponse.redirect(
        new URL(`/?tab=admin&google_error=${encodeURIComponent(error)}`, req.url)
      );
    }

    // 2. Google OAuth Callback with authorization code
    if (code) {
      const config = getGoogleConfig();
      const redirectUri = `${url.origin}/api/google/oauth`;

      const tokenData = await exchangeCodeForTokens(code, redirectUri);
      const email = tokenData.email || "fandam228@gmail.com";
      const expiryDate = new Date(Date.now() + tokenData.expiresIn * 1000);

      const existing = await db
        .select()
        .from(googleIntegrations)
        .where(eq(googleIntegrations.accountEmail, email))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(googleIntegrations)
          .set({
            accessToken: tokenData.accessToken,
            ...(tokenData.refreshToken ? { refreshToken: tokenData.refreshToken } : {}),
            tokenExpiry: expiryDate,
            isConnected: true,
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(googleIntegrations.id, existing[0].id));
      } else {
        await db.insert(googleIntegrations).values({
          id: `g_int_${Date.now()}`,
          accountEmail: email,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          tokenExpiry: expiryDate,
          isConnected: true,
          lastSyncAt: new Date(),
        });
      }

      // Redirect back to Admin Hub with success flag
      return NextResponse.redirect(new URL("/?tab=admin&google_connected=true", req.url));
    }

    // 3. Initiate OAuth: return authorization URL
    const config = getGoogleConfig();
    if (!config.clientId) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        error: "Google Client ID غير مهيأ بعد في متغيرات البيئة GOOGLE_CLIENT_ID.",
        guide: {
          account: "fandam228@gmail.com",
          redirectUri: `${url.origin}/api/google/oauth`,
        },
      });
    }

    const redirectUri = `${url.origin}/api/google/oauth`;
    const authUrl = buildGoogleAuthUrl(redirectUri);

    const activeToken = await getValidAccessToken();

    return NextResponse.json({
      success: true,
      isConfigured: true,
      isConnected: Boolean(activeToken),
      accountEmail: "fandam228@gmail.com",
      authUrl,
      redirectUri,
    });
  } catch (error: any) {
    console.error("Google OAuth API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Google OAuth error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { action } = body;

    if (action === "disconnect") {
      await db
        .update(googleIntegrations)
        .set({
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          isConnected: false,
          updatedAt: new Date(),
        })
        .where(eq(googleIntegrations.accountEmail, "fandam228@gmail.com"));

      return NextResponse.json({ success: true, message: "تم فصل حساب Google بنجاح" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
