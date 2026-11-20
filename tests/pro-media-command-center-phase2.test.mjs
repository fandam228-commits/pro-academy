/**
 * PRO MEDIA COMMAND CENTER (PMC) — Phase 2 Automated Tests
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Verifies:
 * 1. Database Schema Definitions & Table Isolation
 * 2. AES-256-GCM Token Encryption & Integrity Verification
 * 3. Role-Based Access Control (RBAC) & Super Admin Gate
 * 4. Approval Workflow State Machine & Tamper Detection
 * 5. Publishing Gatekeeper & Idempotency Key Generation
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import modules under test
import {
  encryptToken,
  decryptToken,
  computeContentHash,
  generateIdempotencyKey,
} from "../src/lib/media-center/crypto.ts";

import {
  resolvePMCRole,
  hasRequiredPMCRole,
} from "../src/lib/media-center/auth-core.ts";

import {
  canTransition,
  createApproval,
  rejectApproval,
  verifyApprovalIntegrity,
  gatekeeperPublishing,
} from "../src/lib/media-center/approval-workflow.ts";

import * as pmcSchema from "../src/db/pmc-schema.ts";

describe("PRO MEDIA COMMAND CENTER — Phase 2 Verification Suite", () => {
  describe("1. Database Schema & Tables Isolation", () => {
    it("exports all 11 isolated pmc_* tables", () => {
      const expectedTables = [
        "pmcSocialAccounts",
        "pmcContentProjects",
        "pmcContentVariants",
        "pmcMediaAssets",
        "pmcApprovalRequests",
        "pmcPublishingJobs",
        "pmcAnalyticsSnapshots",
        "pmcCommunityInteractions",
        "pmcMarketingCampaigns",
        "pmcAuditLogs",
        "pmcNotifications",
      ];

      for (const table of expectedTables) {
        assert.ok(pmcSchema[table], `Table '${table}' must be exported from pmc-schema`);
      }
    });

    it("verifies pmc_social_accounts table column structure", () => {
      const table = pmcSchema.pmcSocialAccounts;
      assert.ok(table.id, "id column must exist");
      assert.ok(table.platform, "platform column must exist");
      assert.ok(table.encryptedAccessToken, "encryptedAccessToken column must exist");
      assert.ok(table.encryptedRefreshToken, "encryptedRefreshToken column must exist");
      assert.ok(table.isConnected, "isConnected column must exist");
    });

    it("verifies pmc_content_variants table status and hash columns", () => {
      const table = pmcSchema.pmcContentVariants;
      assert.ok(table.id, "id column must exist");
      assert.ok(table.projectId, "projectId column must exist");
      assert.ok(table.status, "status column must exist");
      assert.ok(table.contentHash, "contentHash column must exist");
    });
  });

  describe("2. AES-256-GCM Token Encryption & Cryptographic Hashing", () => {
    it("encrypts and decrypts OAuth access token cleanly", () => {
      const sampleToken = "EAABwzLIX45wBAO8942klnsdflkj348912384kjhsdkfjhsdf";
      const encrypted = encryptToken(sampleToken);

      assert.notEqual(encrypted, sampleToken);
      assert.equal(encrypted.split(":").length, 3, "Format must be iv:authTag:ciphertext");

      const decrypted = decryptToken(encrypted);
      assert.equal(decrypted, sampleToken, "Decrypted token must exactly match original");
    });

    it("fails closed when encrypted token ciphertext is tampered with", () => {
      const sampleToken = "ya29.a0AfH6SMB_secret_google_youtube_token";
      const encrypted = encryptToken(sampleToken);
      const parts = encrypted.split(":");

      // Corrupt the ciphertext
      const tamperedParts = [parts[0], parts[1], parts[2].slice(0, -2) + "ff"];
      const tampered = tamperedParts.join(":");

      assert.throws(() => {
        decryptToken(tampered);
      }, /Unsupported state or unable to authenticate data|Invalid encrypted token/);
    });

    it("computes deterministic SHA-256 content hashes", () => {
      const content1 = {
        hook: "سؤال ثانوية عامة 2024",
        script: "Used to vs Would",
        caption: "شرح مستر حبيب",
        platform: "facebook",
      };

      const content2 = {
        hook: "سؤال ثانوية عامة 2024",
        script: "Used to vs Would",
        caption: "شرح مستر حبيب",
        platform: "facebook",
      };

      const hash1 = computeContentHash(content1);
      const hash2 = computeContentHash(content2);

      assert.equal(hash1.length, 64);
      assert.equal(hash1, hash2, "Identical content must yield identical hashes");

      // Minor change should alter hash
      const hash3 = computeContentHash({ ...content1, hook: "سؤال ثانوية عامة 2024!" });
      assert.notEqual(hash1, hash3, "Altered content must change hash");
    });

    it("generates deterministic idempotency keys", () => {
      const key1 = generateIdempotencyKey("var_123", "facebook", "hash_abc");
      const key2 = generateIdempotencyKey("var_123", "facebook", "hash_abc");
      const key3 = generateIdempotencyKey("var_123", "tiktok", "hash_abc");

      assert.equal(key1, key2, "Same parameters must yield identical idempotency key");
      assert.notEqual(key1, key3, "Different platforms must yield distinct keys");
    });
  });

  describe("3. Role-Based Access Control (RBAC) & Hierarchy", () => {
    it("grants super_admin privileges to Mr. Habib El Rahman", () => {
      const habibUser = {
        id: "usr_admin_habib",
        role: "admin",
        email: "habib.admin@proacademy.com",
      };

      const role = resolvePMCRole(habibUser);
      assert.equal(role, "super_admin");
    });

    it("grants editor privileges to teachers", () => {
      const teacherUser = {
        id: "usr_teacher_sarah",
        role: "teacher",
        email: "sarah.teacher@proacademy.com",
      };

      const role = resolvePMCRole(teacherUser);
      assert.equal(role, "editor");
    });

    it("denies access completely to students and parents", () => {
      const studentUser = {
        id: "usr_student_omar",
        role: "student",
        email: "omar.student@gmail.com",
      };

      const parentUser = {
        id: "usr_parent_ahmed",
        role: "parent",
        email: "parent@gmail.com",
      };

      assert.equal(resolvePMCRole(studentUser), null);
      assert.equal(resolvePMCRole(parentUser), null);
    });
  });

  describe("4. Approval Workflow State Machine & Tamper Detection", () => {
    it("enforces valid state transitions and rejects illegal jumps", () => {
      assert.ok(canTransition("DRAFT", "READY_FOR_REVIEW"));
      assert.ok(canTransition("READY_FOR_REVIEW", "APPROVED"));
      assert.ok(canTransition("APPROVED", "PUBLISHING"));
      assert.ok(canTransition("PUBLISHING", "PUBLISHED"));

      // Illegal jumps: cannot publish directly from DRAFT or READY_FOR_REVIEW
      assert.equal(canTransition("DRAFT", "PUBLISHING"), false);
      assert.equal(canTransition("READY_FOR_REVIEW", "PUBLISHING"), false);
      assert.equal(canTransition("PUBLISHED", "DRAFT"), false);
    });

    it("allows Super Admin to approve content with cryptographic snapshot hash", () => {
      const content = {
        hook: "سؤال قواعد Unit 1",
        caption: "الإجابة الصحيحة وشرح السبب",
        platform: "facebook",
      };

      const { approval, updatedStatus } = createApproval({
        variantId: "var_test_1",
        platform: "facebook",
        actorId: "usr_admin_habib",
        isSuperAdmin: true,
        content,
      });

      assert.equal(updatedStatus, "APPROVED");
      assert.equal(approval.status, "APPROVED");
      assert.equal(approval.approvedBy, "usr_admin_habib");
      assert.equal(approval.contentSnapshotHash, computeContentHash(content));
    });

    it("blocks non-super admin from approving content", () => {
      const content = { platform: "facebook", caption: "Test" };
      assert.throws(() => {
        createApproval({
          variantId: "var_test_1",
          platform: "facebook",
          actorId: "usr_teacher_sarah",
          isSuperAdmin: false,
          content,
        });
      }, /Only Super Admin/);
    });

    it("allows Super Admin to reject content and request revision with reason", () => {
      const content = { platform: "tiktok", hook: "Weak hook" };
      const { approval, updatedStatus } = rejectApproval({
        variantId: "var_test_2",
        platform: "tiktok",
        actorId: "usr_admin_habib",
        isSuperAdmin: true,
        reason: "الـ Hook غير مناسب لطلاب الثانوية، يرجى كتابة سؤال محدد من كتاب الوزارة.",
        content,
      });

      assert.equal(updatedStatus, "REVISION_REQUESTED");
      assert.equal(approval.status, "REVISION_REQUESTED");
      assert.ok(approval.rejectionReason.includes("كتاب الوزارة"));
    });

    it("detects content tampering: editing content after approval revokes approval", () => {
      const originalContent = {
        hook: "قاعدة Had + V3",
        caption: "الشرح المعتمد",
        platform: "facebook",
      };

      const { approval } = createApproval({
        variantId: "var_test_3",
        platform: "facebook",
        actorId: "usr_admin_habib",
        isSuperAdmin: true,
        content: originalContent,
      });

      // 1. Untouched content passes integrity check
      const check1 = verifyApprovalIntegrity(originalContent, approval);
      assert.equal(check1.isValid, true);

      // 2. Tampered content fails integrity check automatically
      const modifiedContent = {
        ...originalContent,
        caption: "تم تعديل الشرح بعد اعتماد مستر حبيب بدون إذنه!",
      };

      const check2 = verifyApprovalIntegrity(modifiedContent, approval);
      assert.equal(check2.isValid, false);
      assert.ok(check2.reason?.includes("automatically revoked"));
    });
  });

  describe("5. Publishing Gatekeeper & Zero-Accidental-Publishing Enforcement", () => {
    it("gatekeeper strictly blocks publishing unapproved content", () => {
      const content = { platform: "facebook", caption: "Draft text" };
      const result = gatekeeperPublishing({
        variantId: "var_draft",
        platform: "facebook",
        currentStatus: "DRAFT",
        currentContent: content,
      });

      assert.equal(result.canPublish, false);
      assert.ok(result.reason?.includes("must be 'APPROVED'"));
    });

    it("gatekeeper permits publishing only when status is APPROVED and integrity is valid", () => {
      const content = {
        hook: "Thanawya Amma Grammar Tip",
        caption: "Valid approved copy",
        platform: "facebook",
      };

      const { approval } = createApproval({
        variantId: "var_ready",
        platform: "facebook",
        actorId: "usr_admin_habib",
        isSuperAdmin: true,
        content,
      });

      const result = gatekeeperPublishing({
        variantId: "var_ready",
        platform: "facebook",
        currentStatus: "APPROVED",
        currentContent: content,
        lastApproval: approval,
      });

      assert.equal(result.canPublish, true);
      assert.ok(result.idempotencyKey, "Must generate valid idempotency key");
    });
  });
});
