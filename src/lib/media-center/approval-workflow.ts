/**
 * PRO MEDIA COMMAND CENTER (PMC) — Approval Workflow & State Machine
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Enforces:
 * 1. Mandatory Human Approval by Super Admin (Mr. Habib El Rahman) before any publishing.
 * 2. Independent per-platform approvals (Approving Facebook != Approving TikTok).
 * 3. Automatic approval revocation if content is edited after approval (Tamper Detection).
 * 4. Idempotency protection against duplicate publish jobs.
 */

import { computeContentHash, generateIdempotencyKey } from "./crypto.ts";

export type ContentStatus =
  | "DRAFT"
  | "GENERATING"
  | "READY_FOR_REVIEW"
  | "REVISION_REQUESTED"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export interface ContentPayload {
  hook?: string | null;
  script?: string | null;
  caption?: string | null;
  description?: string | null;
  platform: string;
  mediaAssetId?: string | null;
}

export interface ApprovalRecord {
  id: string;
  variantId: string;
  platform: string;
  requestedBy: string;
  approvedBy?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
  rejectionReason?: string | null;
  contentSnapshotHash: string;
  approvedAt?: Date | null;
}

export interface ValidationResult {
  canPublish: boolean;
  reason?: string;
  idempotencyKey?: string;
}

/**
 * Validates whether a state transition is permitted.
 */
export function canTransition(current: ContentStatus, next: ContentStatus): boolean {
  const allowedTransitions: Record<ContentStatus, ContentStatus[]> = {
    DRAFT: ["GENERATING", "READY_FOR_REVIEW", "CANCELLED"],
    GENERATING: ["DRAFT", "READY_FOR_REVIEW", "FAILED"],
    READY_FOR_REVIEW: ["APPROVED", "REVISION_REQUESTED", "DRAFT", "CANCELLED"],
    REVISION_REQUESTED: ["DRAFT", "READY_FOR_REVIEW", "CANCELLED"],
    APPROVED: ["SCHEDULED", "PUBLISHING", "REVISION_REQUESTED", "DRAFT", "CANCELLED"],
    SCHEDULED: ["PUBLISHING", "CANCELLED", "APPROVED"],
    PUBLISHING: ["PUBLISHED", "FAILED"],
    PUBLISHED: [], // Terminal success
    FAILED: ["READY_FOR_REVIEW", "APPROVED", "PUBLISHING", "CANCELLED"], // Allows safe retry
    CANCELLED: ["DRAFT"],
  };

  return allowedTransitions[current]?.includes(next) ?? false;
}

/**
 * Executes content approval by Super Admin.
 * Calculates cryptographic snapshot hash to lock the content version.
 */
export function createApproval(params: {
  variantId: string;
  platform: string;
  actorId: string;
  isSuperAdmin: boolean;
  content: ContentPayload;
}): { approval: ApprovalRecord; updatedStatus: ContentStatus } {
  if (!params.isSuperAdmin) {
    throw new Error("Forbidden: Only Super Admin (Mr. Habib El Rahman) can approve content.");
  }

  const contentSnapshotHash = computeContentHash(params.content);
  const approval: ApprovalRecord = {
    id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    variantId: params.variantId,
    platform: params.platform,
    requestedBy: params.actorId,
    approvedBy: params.actorId,
    status: "APPROVED",
    contentSnapshotHash,
    approvedAt: new Date(),
  };

  return { approval, updatedStatus: "APPROVED" };
}

/**
 * Rejects content or requests revision with feedback.
 */
export function rejectApproval(params: {
  variantId: string;
  platform: string;
  actorId: string;
  isSuperAdmin: boolean;
  reason: string;
  content: ContentPayload;
}): { approval: ApprovalRecord; updatedStatus: ContentStatus } {
  if (!params.isSuperAdmin) {
    throw new Error("Forbidden: Only Super Admin can reject content.");
  }

  const contentSnapshotHash = computeContentHash(params.content);
  const approval: ApprovalRecord = {
    id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    variantId: params.variantId,
    platform: params.platform,
    requestedBy: params.actorId,
    approvedBy: params.actorId,
    status: "REVISION_REQUESTED",
    rejectionReason: params.reason,
    contentSnapshotHash,
    approvedAt: null,
  };

  return { approval, updatedStatus: "REVISION_REQUESTED" };
}

/**
 * Verifies that approved content has not been tampered with or modified.
 * If modified, automatically revokes approval.
 */
export function verifyApprovalIntegrity(
  currentContent: ContentPayload,
  lastApproval?: ApprovalRecord | null
): { isValid: boolean; reason?: string } {
  if (!lastApproval || lastApproval.status !== "APPROVED") {
    return { isValid: false, reason: "No active approval found for this content." };
  }

  const currentHash = computeContentHash(currentContent);
  if (currentHash !== lastApproval.contentSnapshotHash) {
    return {
      isValid: false,
      reason: "Content was edited after approval. Previous approval has been automatically revoked.",
    };
  }

  return { isValid: true };
}

/**
 * Strict gate before publishing: Enforces approval, integrity, and computes idempotency key.
 */
export function gatekeeperPublishing(params: {
  variantId: string;
  platform: string;
  currentStatus: ContentStatus;
  currentContent: ContentPayload;
  lastApproval?: ApprovalRecord | null;
}): ValidationResult {
  if (params.currentStatus !== "APPROVED" && params.currentStatus !== "SCHEDULED") {
    return {
      canPublish: false,
      reason: `Publishing blocked: Content status is '${params.currentStatus}', but must be 'APPROVED'.`,
    };
  }

  const integrity = verifyApprovalIntegrity(params.currentContent, params.lastApproval);
  if (!integrity.isValid) {
    return {
      canPublish: false,
      reason: integrity.reason,
    };
  }

  const currentHash = computeContentHash(params.currentContent);
  const idempotencyKey = generateIdempotencyKey(params.variantId, params.platform, currentHash);

  return {
    canPublish: true,
    idempotencyKey,
  };
}
