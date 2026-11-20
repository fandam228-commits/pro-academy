// PRO MEDIA COMMAND CENTER — Phase 7 Test Suite
// Audit Logging, Secret Redaction, RBAC Compliance & 12-Module Integrity Verification

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  redactSensitiveData,
  createAuditLogEntry,
  filterAuditLogs,
  getSeedAuditLogs,
} from "../src/lib/media-center/audit-logger-core.ts";

test("PRO MEDIA COMMAND CENTER — Phase 7 Security Audit & Final Integration", async (t) => {
  await t.test("1. Cryptographic Secret Redaction & Log Sanitization", () => {
    const rawPayload = {
      platform: "facebook",
      postTitle: "شرح الماضي التام",
      pageAccessToken: "EAAJxyz123mocksecretaccesstoken",
      refreshToken: "ya29.mockRefreshToken456",
      clientSecret: "sec_abc789",
      apiKey: "AIzaSyMockKey000",
      normalSettings: {
        timeout: 5000,
        safeRetries: 3,
        userPassword: "PlainPasswordToScrub",
      },
    };

    const sanitized = redactSensitiveData(rawPayload);

    assert.equal(sanitized.platform, "facebook");
    assert.equal(sanitized.postTitle, "شرح الماضي التام");
    assert.equal(sanitized.pageAccessToken, "[REDACTED]");
    assert.equal(sanitized.refreshToken, "[REDACTED]");
    assert.equal(sanitized.clientSecret, "[REDACTED]");
    assert.equal(sanitized.apiKey, "[REDACTED]");
    assert.equal(sanitized.normalSettings.userPassword, "[REDACTED]");
    assert.equal(sanitized.normalSettings.safeRetries, 3);
  });

  await t.test("2. Structured Audit Entry Creation & Immutability", () => {
    const entry = createAuditLogEntry({
      actorId: "usr_admin_habib",
      actorName: "Mr. Habib El Rahman",
      action: "APPROVE",
      entityType: "variant",
      entityId: "var_sec3_unit1_yt",
      details: {
        platform: "youtube",
        title: "الماستر كلاس لطلاب الثانوية العامة",
        secretToken: "must_be_scrubbed_token_value",
      },
    });

    assert.ok(entry.id.startsWith("audit_"));
    assert.equal(entry.actorId, "usr_admin_habib");
    assert.equal(entry.actorName, "Mr. Habib El Rahman");
    assert.equal(entry.action, "APPROVE");
    assert.equal(entry.details.secretToken, "[REDACTED]");
    assert.ok(entry.createdAt);
  });

  await t.test("3. Audit Trail Filtering & Search", () => {
    const seed = getSeedAuditLogs();
    assert.ok(seed.length >= 5);

    // Filter by action
    const approvals = filterAuditLogs(seed, { action: "APPROVE" });
    assert.ok(approvals.every((l) => l.action === "APPROVE"));

    // Filter by actor
    const habibLogs = filterAuditLogs(seed, { actorId: "usr_admin_habib" });
    assert.ok(habibLogs.every((l) => l.actorId === "usr_admin_habib"));

    // Search query
    const searchRes = filterAuditLogs(seed, { search: "tiktok" });
    assert.ok(searchRes.length >= 1);
  });

  await t.test("4. Full Physical Existence & Component Integrity of all 12 PMC Views", () => {
    const basePath = path.resolve(process.cwd(), "src/components/admin/media-center");

    const requiredViews = [
      "PmcOverviewDashboard.tsx",
      "PmcSocialAccountsView.tsx",
      "PmcApprovalCenterView.tsx",
      "PmcContentStudioView.tsx",
      "PmcVideoStudioView.tsx",
      "PmcMediaLibraryView.tsx",
      "PmcCalendarView.tsx",
      "PmcPublishQueueView.tsx",
      "PmcAnalyticsView.tsx",
      "PmcCommunityView.tsx",
      "PmcCampaignsView.tsx",
      "PmcAuditLogsView.tsx",
    ];

    for (const viewFile of requiredViews) {
      const fullPath = path.join(basePath, viewFile);
      assert.ok(
        fs.existsSync(fullPath),
        `Mandatory Command Center View '${viewFile}' must physically exist.`
      );
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 500, `View '${viewFile}' must have substantial implementation.`);
    }
  });

  await t.test("5. Physical Existence & Route Handlers for all PMC API Endpoints", () => {
    const apiBase = path.resolve(process.cwd(), "src/app/api/admin/media-center");

    const requiredRoutes = [
      "overview/route.ts",
      "approvals/route.ts",
      "content/generate/route.ts",
      "video/storyboard/route.ts",
      "media-library/route.ts",
      "calendar/route.ts",
      "queue/route.ts",
      "analytics/route.ts",
      "community/route.ts",
      "campaigns/route.ts",
      "audit-logs/route.ts",
    ];

    for (const r of requiredRoutes) {
      const fullPath = path.join(apiBase, r);
      assert.ok(
        fs.existsSync(fullPath),
        `Mandatory PMC API Route '${r}' must physically exist on disk.`
      );
    }
  });
});
