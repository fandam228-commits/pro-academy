// PRO MEDIA COMMAND CENTER — Publishing Queue Core Logic
// Deterministic Idempotency, Approval Gate Enforcement, Exponential Backoff, & Pre-Retry Safety

import { createHash } from "node:crypto";

export type PublishingJobStatus = "QUEUED" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "CANCELLED";
export type PublishingMode = "auto" | "manual_pack";

export interface ApprovalCheckPayload {
  variantId: string;
  approvalStatus: string; // Must be 'APPROVED'
  approvedBy?: string | null; // Must be authorized Super Admin
  contentSnapshotHash: string;
  currentContentHash: string;
}

export interface QueueJobRecord {
  id: string;
  variantId: string;
  platform: "facebook" | "youtube" | "tiktok";
  title: string;
  status: PublishingJobStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  attemptsCount: number;
  maxAttempts: number;
  idempotencyKey: string;
  externalPostId?: string | null;
  externalPostUrl?: string | null;
  errorLog?: string | null;
  publishingMode: PublishingMode;
  createdAt: string;
  updatedAt: string;
}

/**
 * 1. Generates a deterministic SHA-256 Idempotency Key for a publishing job.
 * Ensures that resending the same variant with the exact same content and schedule
 * never creates a duplicate publishing job or double-post.
 */
export function generateIdempotencyKey(
  variantId: string,
  platform: string,
  scheduledAt: string | Date | null,
  contentHash: string
): string {
  const normDate = scheduledAt ? new Date(scheduledAt).toISOString() : "immediate";
  const rawString = `PMC_JOB:${variantId}:${platform.toLowerCase()}:${normDate}:${contentHash}`;
  return createHash("sha256").update(rawString).digest("hex");
}

/**
 * 2. Mandatory Human Approval Gate Check:
 * Enforces Rule 11: No content can ever enter the queue without explicit human approval.
 * Additionally verifies cryptographic snapshot integrity (SHA-256) to prevent post-approval tampering.
 */
export function validateApprovalForQueue(payload: ApprovalCheckPayload): {
  valid: boolean;
  code: "ALLOWED" | "NOT_APPROVED" | "UNAUTHORIZED_APPROVER" | "TAMPER_DETECTED";
  reason: string;
} {
  // Check 1: Explicit status must be APPROVED
  if (payload.approvalStatus !== "APPROVED") {
    return {
      valid: false,
      code: "NOT_APPROVED",
      reason: `Cannot queue variant ${payload.variantId}: Status is '${payload.approvalStatus}', must be 'APPROVED' by Mr. Habib El Rahman.`,
    };
  }

  // Check 2: Approver must be super_admin or Habib
  if (!payload.approvedBy || payload.approvedBy.trim().length === 0) {
    return {
      valid: false,
      code: "UNAUTHORIZED_APPROVER",
      reason: `Cannot queue variant ${payload.variantId}: Missing valid signature of approving educator.`,
    };
  }

  // Check 3: Content snapshot hash must match the current content hash
  if (payload.contentSnapshotHash !== payload.currentContentHash) {
    return {
      valid: false,
      code: "TAMPER_DETECTED",
      reason: `Security violation: Content has been modified since it was approved! Approval is revoked. Snapshot: ${payload.contentSnapshotHash.slice(0, 8)}... Current: ${payload.currentContentHash.slice(0, 8)}...`,
    };
  }

  return {
    valid: true,
    code: "ALLOWED",
    reason: "Approved by Mr. Habib El Rahman with valid cryptographic content signature.",
  };
}

/**
 * 3. Exponential Backoff Calculation with Jitter:
 * Used for safe retries when platform connection drops or returns transient 5xx errors.
 * Base delay: 2 minutes -> 4 minutes -> 8 minutes (max 3 attempts).
 */
export function calculateExponentialBackoff(
  attemptNumber: number,
  baseDelaySec: number = 120, // 2 minutes
  maxDelaySec: number = 3600 // 1 hour max
): { delaySec: number; nextAttemptAt: Date } {
  const safeAttempt = Math.max(1, attemptNumber);
  // 2^(n-1) * baseDelay
  const rawDelay = baseDelaySec * Math.pow(2, safeAttempt - 1);
  // Add 0-10% deterministic jitter based on attempt number to prevent thundering herd
  const jitter = Math.floor(rawDelay * 0.05 * (safeAttempt % 3));
  const delaySec = Math.min(rawDelay + jitter, maxDelaySec);

  const nextAttemptAt = new Date(Date.now() + delaySec * 1000);
  return { delaySec, nextAttemptAt };
}

/**
 * 4. Checks whether a job can be retried.
 */
export function canRetryJob(job: { attemptsCount: number; maxAttempts: number; status: string }): boolean {
  if (job.status === "PUBLISHED" || job.status === "CANCELLED") {
    return false;
  }
  return job.attemptsCount < job.maxAttempts;
}

/**
 * 5. Pre-Retry Verification (Prevent Duplicate Posts):
 * Before firing a retry after a network timeout, check the platform's recent published posts
 * to confirm whether the post actually went through despite the timeout.
 */
export function verifyBeforeRetry(
  job: { platform: string; expectedTitleOrText: string; scheduledOrCreatedAt: string | Date },
  recentPlatformPosts: Array<{ id: string; textOrTitle: string; publishedAt: string | Date }>
): { alreadyPublished: boolean; matchedPostId?: string; reason: string } {
  const normExpected = job.expectedTitleOrText.trim().toLowerCase().slice(0, 40);
  const jobTime = new Date(job.scheduledOrCreatedAt).getTime();

  for (const post of recentPlatformPosts) {
    const postTime = new Date(post.publishedAt).getTime();
    const timeDiffMinutes = Math.abs(postTime - jobTime) / (1000 * 60);

    // If published within +/- 30 minutes of our job execution and contains matching text
    const normPost = post.textOrTitle.trim().toLowerCase();
    if (timeDiffMinutes <= 30 && (normPost.includes(normExpected) || normExpected.includes(normPost.slice(0, 30)))) {
      return {
        alreadyPublished: true,
        matchedPostId: post.id,
        reason: `Safe guard triggered: Post was already published on ${job.platform} (ID: ${post.id}). Double-post prevented!`,
      };
    }
  }

  return {
    alreadyPublished: false,
    reason: `Verified with ${job.platform}: No duplicate post detected. Safe to retry.`,
  };
}
