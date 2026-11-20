/**
 * PRO MEDIA COMMAND CENTER (PMC) — Phase 3 Automated Tests
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Verifies:
 * 1. Facebook Meta Graph API v19+ Connector (OAuth URL, Token Exchange, Publishing, Insights)
 * 2. YouTube Data API v3 Connector (Google OAuth Offline Access, Resumable Upload, Processing Status, Stats)
 * 3. TikTok Content Posting API v2 Connector (OAuth URL, Creator Info, Direct Post, Manual Publish Pack)
 * 4. OAuth Security & Sandbox Mock Resilience
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildFacebookAuthUrl,
  exchangeFacebookCodeForPageToken,
  publishToFacebookPage,
  fetchFacebookPostInsights,
} from "../src/lib/media-center/connectors/facebook.ts";

import {
  buildYouTubeAuthUrl,
  exchangeYouTubeCodeForTokens,
  uploadVideoToYouTube,
  checkYouTubeProcessingStatus,
  fetchYouTubeVideoStats,
} from "../src/lib/media-center/connectors/youtube.ts";

import {
  buildTikTokAuthUrl,
  exchangeTikTokCodeForTokens,
  fetchTikTokCreatorInfo,
  publishToTikTok,
  generateTikTokManualPublishPack,
} from "../src/lib/media-center/connectors/tiktok.ts";

import { decryptToken } from "../src/lib/media-center/crypto.ts";

describe("PRO MEDIA COMMAND CENTER — Phase 3 Social Integrations Suite", () => {
  describe("1. Facebook Meta Graph API v19+ Connector", () => {
    it("builds compliant Meta Graph OAuth authorization dialog URL", () => {
      const state = "csrf_test_state_123";
      const url = buildFacebookAuthUrl(state, {
        appId: "test_meta_app_999",
        redirectUri: "https://pro-academy-sfl3.vercel.app/api/admin/media-center/oauth/facebook",
      });

      assert.ok(url.startsWith("https://www.facebook.com/v19.0/dialog/oauth"));
      assert.ok(url.includes("client_id=test_meta_app_999"));
      assert.ok(url.includes("state=csrf_test_state_123"));
      assert.ok(url.includes("pages_manage_posts"));
      assert.ok(url.includes("pages_read_engagement"));
    });

    it("exchanges mock/sandbox authorization code for encrypted Page Access Token", async () => {
      const result = await exchangeFacebookCodeForPageToken("mock_auth_code_habib");
      assert.ok(result.pageId, "Must return Page ID");
      assert.ok(result.pageName.includes("Habib") || result.pageName.includes("Professional"));
      assert.ok(result.encryptedPageToken, "Must return encrypted token");

      // Verify token can be decrypted cleanly
      const decrypted = decryptToken(result.encryptedPageToken);
      assert.ok(decrypted.includes("mock_fb_page_access_token"));
    });

    it("publishes educational post to Facebook Page in sandbox mode", async () => {
      const encryptedToken = "mock_token";
      const postPayload = {
        message: "💡 سؤال ثانوية عامة مهم في قاعدة Past Simple مع مستر حبيب الرحمن!",
        link: "https://pro-academy-sfl3.vercel.app/dashboard/challenge",
      };

      const result = await publishToFacebookPage(encryptedToken, "108239485739201", postPayload, true);
      assert.equal(result.success, true);
      assert.ok(result.postId);
      assert.ok(result.postUrl?.includes("108239485739201"));
    });

    it("fetches realistic post insights (reach, impressions, reactions)", async () => {
      const insights = await fetchFacebookPostInsights("mock_token", "post_123", true);
      assert.ok(insights.views > 0);
      assert.ok(insights.reactions > 0);
      assert.ok(insights.comments > 0);
      assert.ok(insights.shares > 0);
    });
  });

  describe("2. YouTube Data API v3 Connector", () => {
    it("builds Google OAuth 2.0 URL with offline access and required scopes", () => {
      const state = "google_state_456";
      const url = buildYouTubeAuthUrl(state, {
        clientId: "test_google_client_id.apps.googleusercontent.com",
        redirectUri: "https://pro-academy-sfl3.vercel.app/api/admin/media-center/oauth/youtube",
      });

      assert.ok(url.startsWith("https://accounts.google.com/o/oauth2/v2/auth"));
      assert.ok(url.includes("access_type=offline"), "Must request offline access for refresh token");
      assert.ok(url.includes("prompt=consent"), "Must prompt consent to guarantee refresh token");
      assert.ok(url.includes("youtube.upload"), "Must include youtube.upload scope");
    });

    it("exchanges mock code for access and permanent refresh tokens", async () => {
      const result = await exchangeYouTubeCodeForTokens("mock_google_code");
      assert.ok(result.channelId);
      assert.ok(result.channelTitle.includes("Habib"));
      assert.ok(result.encryptedAccessToken);
      assert.ok(result.encryptedRefreshToken);

      const decryptedAccess = decryptToken(result.encryptedAccessToken);
      const decryptedRefresh = decryptToken(result.encryptedRefreshToken);
      assert.ok(decryptedAccess.includes("mock_youtube_access"));
      assert.ok(decryptedRefresh.includes("mock_youtube_refresh"));
    });

    it("prepares video upload metadata and initiates session", async () => {
      const metadata = {
        title: "شرح قاعدة Inversion في 10 دقائق | ثانوية عامة 2027",
        description: "شرح وافي من مستر حبيب الرحمن لحل أسئلة الامتحان الوزاري.",
        tags: ["ثانوية عامة", "شرح انجليزي", "مستر حبيب"],
        privacyStatus: "public",
        categoryId: "27", // Education
      };

      const result = await uploadVideoToYouTube("mock_token", metadata, true);
      assert.equal(result.success, true);
      assert.ok(result.videoId);
      assert.ok(result.videoUrl?.includes("youtube.com/watch"));
      assert.equal(result.processingStatus, "succeeded");
    });

    it("polls video processing status accurately", async () => {
      const statusRes = await checkYouTubeProcessingStatus("mock_token", "yt_habib_123", true);
      assert.equal(statusRes.status, "succeeded");
    });

    it("fetches video performance statistics", async () => {
      const stats = await fetchYouTubeVideoStats("mock_token", "yt_habib_123", true);
      assert.ok(stats.views > 0);
      assert.ok(stats.likes > 0);
      assert.ok(stats.comments > 0);
    });
  });

  describe("3. TikTok Content Posting API v2 Connector", () => {
    it("builds TikTok Login Kit authorization URL", () => {
      const state = "tiktok_state_789";
      const url = buildTikTokAuthUrl(state, {
        clientKey: "test_tiktok_key",
        redirectUri: "https://pro-academy-sfl3.vercel.app/api/admin/media-center/oauth/tiktok",
      });

      assert.ok(url.startsWith("https://www.tiktok.com/v2/auth/authorize/"));
      assert.ok(url.includes("client_key=test_tiktok_key"));
      assert.ok(url.includes("video.publish"));
      assert.ok(url.includes("video.upload"));
    });

    it("exchanges mock authorization code for TikTok tokens", async () => {
      const result = await exchangeTikTokCodeForTokens("mock_tiktok_code");
      assert.ok(result.openId);
      assert.ok(result.creatorHandle.includes("habib"));
      assert.ok(result.encryptedAccessToken);
    });

    it("queries TikTok Creator Information and privacy settings", async () => {
      const creatorInfo = await fetchTikTokCreatorInfo("mock_token", true);
      assert.equal(creatorInfo.creatorNickname, "Mr. Habib El Rahman");
      assert.ok(creatorInfo.privacyLevels.includes("PUBLIC_TO_EVERYONE"));
      assert.equal(creatorInfo.commentDisabled, false);
      assert.equal(creatorInfo.maxVideoPostDurationSec, 600);
    });

    it("publishes via Direct Post API mode", async () => {
      const payload = {
        videoFileUrl: "https://pro-academy-sfl3.vercel.app/sample.mp4",
        title: "كابشن سريع",
        caption: "تركات امتحان الثانوية العامة مع مستر حبيب",
        hashtags: ["#ثانوية_عامة", "#مستر_حبيب_الرحمن"],
      };

      const result = await publishToTikTok("mock_token", payload, true);
      assert.equal(result.success, true);
      assert.ok(result.publishId);
      assert.equal(result.mode, "direct_api");
    });

    it("generates 1-Click Manual Publish Pack as a zero-fail fallback", () => {
      const payload = {
        videoFileUrl: "https://pro-academy-sfl3.vercel.app/reel-unit1.mp4",
        title: "Reel Unit 1",
        caption: "احذر هذا الفخ في امتحان الثانوية العامة!",
        hashtags: ["#ثانوية_عامة_2027", "#مستر_حبيب"],
      };

      const pack = generateTikTokManualPublishPack(payload);
      assert.equal(pack.videoUrl, payload.videoFileUrl);
      assert.ok(pack.formattedCaption.includes("احذر هذا الفخ"));
      assert.ok(pack.formattedCaption.includes("#ثانوية_عامة_2027"));
      assert.ok(pack.instructions.length >= 4);
    });
  });
});
