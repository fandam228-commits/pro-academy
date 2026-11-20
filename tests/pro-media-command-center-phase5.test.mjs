// PRO MEDIA COMMAND CENTER — Phase 5 Test Suite
// Publishing Queue Engine, Approval Gate Enforcement, Idempotency, Exponential Backoff, & Content Calendar

import test from "node:test";
import assert from "node:assert/strict";

import {
  generateIdempotencyKey,
  validateApprovalForQueue,
  calculateExponentialBackoff,
  canRetryJob,
  verifyBeforeRetry,
} from "../src/lib/media-center/publishing-queue-core.ts";

import {
  generateCalendarGrid,
  filterCalendarItems,
  rescheduleCalendarItem,
  duplicateContentForNewSlot,
  getCurriculumInitialSchedule,
} from "../src/lib/media-center/calendar-engine.ts";

test("PRO MEDIA COMMAND CENTER — Phase 5 Publishing Queue & Calendar Suite", async (t) => {
  await t.test("1. Approval Gate Enforcement (Rule 11: Human-in-the-Loop)", () => {
    const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const tamperedHash = "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4";

    // Scenario A: Unapproved draft cannot enter queue
    const unapproved = validateApprovalForQueue({
      variantId: "var_test_01",
      approvalStatus: "PENDING",
      approvedBy: null,
      contentSnapshotHash: validHash,
      currentContentHash: validHash,
    });
    assert.equal(unapproved.valid, false);
    assert.equal(unapproved.code, "NOT_APPROVED");

    // Scenario B: Missing approver signature
    const missingApprover = validateApprovalForQueue({
      variantId: "var_test_02",
      approvalStatus: "APPROVED",
      approvedBy: "",
      contentSnapshotHash: validHash,
      currentContentHash: validHash,
    });
    assert.equal(missingApprover.valid, false);
    assert.equal(missingApprover.code, "UNAUTHORIZED_APPROVER");

    // Scenario C: Post-approval content tampering detected
    const tampered = validateApprovalForQueue({
      variantId: "var_test_03",
      approvalStatus: "APPROVED",
      approvedBy: "usr_admin_habib",
      contentSnapshotHash: validHash,
      currentContentHash: tamperedHash,
    });
    assert.equal(tampered.valid, false);
    assert.equal(tampered.code, "TAMPER_DETECTED");

    // Scenario D: Valid approval with matching cryptographic snapshot
    const approved = validateApprovalForQueue({
      variantId: "var_test_04",
      approvalStatus: "APPROVED",
      approvedBy: "usr_admin_habib",
      contentSnapshotHash: validHash,
      currentContentHash: validHash,
    });
    assert.equal(approved.valid, true);
    assert.equal(approved.code, "ALLOWED");
  });

  await t.test("2. Deterministic Idempotency Key Generation", () => {
    const hash = "c2e5b72e5...content_hash";
    const date = "2026-11-25T18:00:00.000Z";

    const key1 = generateIdempotencyKey("var_100", "facebook", date, hash);
    const key2 = generateIdempotencyKey("var_100", "facebook", date, hash);
    const keyDiffPlatform = generateIdempotencyKey("var_100", "youtube", date, hash);
    const keyDiffDate = generateIdempotencyKey("var_100", "facebook", "2026-11-26T18:00:00.000Z", hash);

    assert.equal(typeof key1, "string");
    assert.equal(key1.length, 64); // SHA-256 hex string
    assert.equal(key1, key2, "Same inputs must produce identical deterministic key");
    assert.notEqual(key1, keyDiffPlatform, "Different platform must produce different key");
    assert.notEqual(key1, keyDiffDate, "Different schedule date must produce different key");
  });

  await t.test("3. Exponential Backoff Calculation & Retry Constraints", () => {
    // Attempt 1: base delay ~120s
    const b1 = calculateExponentialBackoff(1, 120);
    assert.ok(b1.delaySec >= 120 && b1.delaySec <= 150);

    // Attempt 2: delay ~240s
    const b2 = calculateExponentialBackoff(2, 120);
    assert.ok(b2.delaySec >= 240 && b2.delaySec <= 300);

    // Attempt 3: delay ~480s
    const b3 = calculateExponentialBackoff(3, 120);
    assert.ok(b3.delaySec >= 480 && b3.delaySec <= 600);

    // Cap at max delay
    const capped = calculateExponentialBackoff(10, 120, 1000);
    assert.ok(capped.delaySec <= 1000);

    // Retry eligibility rules
    assert.equal(canRetryJob({ attemptsCount: 1, maxAttempts: 3, status: "FAILED" }), true);
    assert.equal(canRetryJob({ attemptsCount: 3, maxAttempts: 3, status: "FAILED" }), false);
    assert.equal(canRetryJob({ attemptsCount: 1, maxAttempts: 3, status: "PUBLISHED" }), false);
    assert.equal(canRetryJob({ attemptsCount: 1, maxAttempts: 3, status: "CANCELLED" }), false);
  });

  await t.test("4. Pre-Retry Verification (Prevent Duplicate Social Posts)", () => {
    const job = {
      platform: "facebook",
      expectedTitleOrText: "كشف أسرار الماضي التام والماضي البسيط",
      scheduledOrCreatedAt: new Date().toISOString(),
    };

    // Case 1: Post already exists on the platform within 10 minutes
    const recentPostsWithDuplicate = [
      {
        id: "fb_post_999888",
        textOrTitle: "كشف أسرار الماضي التام والماضي البسيط — تريكات الامتحان مع مستر حبيب",
        publishedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ];

    const duplicateCheck = verifyBeforeRetry(job, recentPostsWithDuplicate);
    assert.equal(duplicateCheck.alreadyPublished, true);
    assert.equal(duplicateCheck.matchedPostId, "fb_post_999888");

    // Case 2: Platform has no such post
    const cleanPlatform = [
      {
        id: "fb_post_111222",
        textOrTitle: "إعلان مواعيد امتحانات الشهر لطلاب أولى ثانوي",
        publishedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
    ];

    const safeCheck = verifyBeforeRetry(job, cleanPlatform);
    assert.equal(safeCheck.alreadyPublished, false);
    assert.equal(safeCheck.matchedPostId, undefined);
  });

  await t.test("5. Content Calendar Monthly Grid & Filter Engine", () => {
    const sampleItems = getCurriculumInitialSchedule();
    assert.ok(sampleItems.length >= 5);

    // Generate grid for November 2026
    const grid = generateCalendarGrid(2026, 11, sampleItems);
    assert.equal(grid.year, 2026);
    assert.equal(grid.month, 11);
    assert.equal(grid.monthNameAr, "نوفمبر");
    // Standard calendar grid must be multiples of 7 (35 or 42 cells)
    assert.ok(grid.days.length === 35 || grid.days.length === 42);

    // Filter by platform
    const fbOnly = filterCalendarItems(sampleItems, { platform: "facebook" });
    assert.ok(fbOnly.every((i) => i.platform === "facebook"));

    // Filter by grade
    const sec3Only = filterCalendarItems(sampleItems, { grade: "Third Secondary (Thanawya Amma)" });
    assert.ok(sec3Only.every((i) => i.grade === "Third Secondary (Thanawya Amma)"));

    // Filter by status
    const approvedOnly = filterCalendarItems(sampleItems, { status: "approved" });
    assert.ok(approvedOnly.every((i) => i.approvalStatus === "APPROVED"));
  });

  await t.test("6. Calendar Rescheduling & Content Duplication with Approval Reset", () => {
    const sampleItems = getCurriculumInitialSchedule();
    const approvedItem = sampleItems.find((i) => i.approvalStatus === "APPROVED");
    assert.ok(approvedItem);

    // A. Reschedule date
    const res = rescheduleCalendarItem(approvedItem, "2026-11-28");
    assert.equal(res.success, true);
    assert.equal(res.item.scheduledDate, "2026-11-28");
    assert.equal(res.item.approvalStatus, "APPROVED", "Rescheduling alone keeps approval");

    // B. Duplicate content for reuse
    const cloned = duplicateContentForNewSlot(approvedItem, "2026-12-05", "Second Secondary");
    assert.notEqual(cloned.id, approvedItem.id);
    assert.equal(cloned.scheduledDate, "2026-12-05");
    assert.equal(cloned.grade, "Second Secondary");
    assert.equal(cloned.status, "draft");
    assert.equal(
      cloned.approvalStatus,
      "PENDING",
      "Duplicated content MUST reset to PENDING for educator re-approval"
    );
  });
});
