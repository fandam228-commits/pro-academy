/**
 * PRO MEDIA COMMAND CENTER (PMC) — Unified OAuth Callback & Initiation Handler
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Supports:
 * - /api/admin/media-center/oauth/facebook
 * - /api/admin/media-center/oauth/youtube
 * - /api/admin/media-center/oauth/tiktok
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { db } from "@/db";
import { pmcSocialAccounts, pmcAuditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import crypto from "crypto";

import {
  buildFacebookAuthUrl,
  exchangeFacebookCodeForPageToken,
} from "@/lib/media-center/connectors/facebook";

import {
  buildYouTubeAuthUrl,
  exchangeYouTubeCodeForTokens,
} from "@/lib/media-center/connectors/youtube";

import {
  buildTikTokAuthUrl,
  exchangeTikTokCodeForTokens,
} from "@/lib/media-center/connectors/tiktok";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  await ensureDbSetup();

  const { platform } = await params;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const init = url.searchParams.get("init");

  if (!["facebook", "youtube", "tiktok"].includes(platform)) {
    return NextResponse.json({ error: "Unsupported social platform." }, { status: 400 });
  }

  // 1. INITIATION FLOW: Build Redirect URL
  if (init === "true") {
    const auth = await requirePMCAuth(req, "super_admin");
    if (auth.denied) return auth.denied;

    const csrfState = crypto.randomBytes(16).toString("hex");

    let redirectTarget = "";
    if (platform === "facebook") redirectTarget = buildFacebookAuthUrl(csrfState);
    else if (platform === "youtube") redirectTarget = buildYouTubeAuthUrl(csrfState);
    else if (platform === "tiktok") redirectTarget = buildTikTokAuthUrl(csrfState);

    return NextResponse.redirect(redirectTarget);
  }

  // 2. ERROR HANDLING FROM PLATFORM
  if (error) {
    const desc = url.searchParams.get("error_description") || error;
    console.warn(`OAuth Authorization Error from ${platform}:`, desc);
    const returnUrl = new URL("/admin/media-center", req.url);
    returnUrl.searchParams.set("oauth_error", encodeURIComponent(desc));
    return NextResponse.redirect(returnUrl);
  }

  // 3. CALLBACK CODE EXCHANGE FLOW
  if (code) {
    try {
      let accountData: any = {};

      if (platform === "facebook") {
        const fbRes = await exchangeFacebookCodeForPageToken(code);
        accountData = {
          id: "acc_facebook_pro_academy",
          platform: "facebook",
          accountId: fbRes.pageId,
          accountName: fbRes.pageName,
          pageId: fbRes.pageId,
          encryptedAccessToken: fbRes.encryptedPageToken,
          isConnected: true,
          tokenExpiresAt: fbRes.expiresIn ? new Date(Date.now() + fbRes.expiresIn * 1000) : null,
          lastTestedAt: new Date(),
          scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
        };
      } else if (platform === "youtube") {
        const ytRes = await exchangeYouTubeCodeForTokens(code);
        accountData = {
          id: "acc_youtube_habib",
          platform: "youtube",
          accountId: ytRes.channelId,
          accountName: ytRes.channelTitle,
          channelId: ytRes.channelId,
          encryptedAccessToken: ytRes.encryptedAccessToken,
          encryptedRefreshToken: ytRes.encryptedRefreshToken,
          isConnected: true,
          tokenExpiresAt: ytRes.expiresIn ? new Date(Date.now() + ytRes.expiresIn * 1000) : null,
          lastTestedAt: new Date(),
          scopes: ["youtube.upload", "youtube.readonly"],
        };
      } else if (platform === "tiktok") {
        const ttRes = await exchangeTikTokCodeForTokens(code);
        accountData = {
          id: "acc_tiktok_habib",
          platform: "tiktok",
          accountId: ttRes.openId,
          accountName: ttRes.creatorHandle,
          encryptedAccessToken: ttRes.encryptedAccessToken,
          encryptedRefreshToken: ttRes.encryptedRefreshToken,
          isConnected: true,
          tokenExpiresAt: new Date(Date.now() + ttRes.expiresIn * 1000),
          lastTestedAt: new Date(),
          scopes: ["user.info.basic", "video.publish", "video.upload"],
        };
      }

      // Persist in pmc_social_accounts
      if (process.env.DATABASE_URL) {
        const existing = await db
          .select()
          .from(pmcSocialAccounts)
          .where(eq(pmcSocialAccounts.platform, platform));

        if (existing.length > 0) {
          await db
            .update(pmcSocialAccounts)
            .set({
              ...accountData,
              updatedAt: new Date(),
            })
            .where(eq(pmcSocialAccounts.platform, platform));
        } else {
          await db.insert(pmcSocialAccounts).values(accountData);
        }

        // Record in audit log
        await db.insert(pmcAuditLogs).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          actorId: "usr_admin_habib",
          actorName: "Mr. Habib El Rahman",
          action: "OAUTH_CONNECT_SUCCESS",
          entityType: "social_account",
          entityId: platform,
          details: { platform, accountName: accountData.accountName },
        });
      }

      const successUrl = new URL("/admin/media-center", req.url);
      successUrl.searchParams.set("oauth_success", platform);
      return NextResponse.redirect(successUrl);
    } catch (err: any) {
      console.error(`OAuth Processing Error (${platform}):`, err);
      const failUrl = new URL("/admin/media-center", req.url);
      failUrl.searchParams.set("oauth_error", encodeURIComponent(err.message));
      return NextResponse.redirect(failUrl);
    }
  }

  return NextResponse.json({ error: "Missing authorization code or initiation command." }, { status: 400 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  await ensureDbSetup();

  const auth = await requirePMCAuth(req, "super_admin");
  if (auth.denied) return auth.denied;

  const { platform } = await params;
  const { action } = await req.json();

  if (action === "disconnect") {
    if (process.env.DATABASE_URL) {
      await db
        .update(pmcSocialAccounts)
        .set({
          isConnected: false,
          encryptedAccessToken: null,
          encryptedRefreshToken: null,
          updatedAt: new Date(),
        })
        .where(eq(pmcSocialAccounts.platform, platform));

      await db.insert(pmcAuditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actorId: auth.user!.id,
        actorName: auth.user!.name,
        action: "OAUTH_DISCONNECT",
        entityType: "social_account",
        entityId: platform,
        details: { platform },
      });
    }

    return NextResponse.json({ success: true, message: `Disconnected ${platform} successfully.` });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
