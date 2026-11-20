/**
 * PRO MEDIA COMMAND CENTER (PMC) — Approvals API Route
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { db } from "@/db";
import {
  pmcContentVariants,
  pmcApprovalRequests,
  pmcAuditLogs,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import {
  createApproval,
  rejectApproval,
  verifyApprovalIntegrity,
} from "@/lib/media-center/approval-workflow";

export async function GET(req: Request) {
  await ensureDbSetup();

  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    let pendingVariants: any[] = [];
    let recentApprovals: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        pendingVariants = await db
          .select()
          .from(pmcContentVariants)
          .where(eq(pmcContentVariants.status, "READY_FOR_REVIEW"))
          .orderBy(desc(pmcContentVariants.createdAt))
          .limit(20);

        recentApprovals = await db
          .select()
          .from(pmcApprovalRequests)
          .orderBy(desc(pmcApprovalRequests.createdAt))
          .limit(20);
      } catch (err) {
        console.warn("Error fetching approvals data:", err);
      }
    }

    return NextResponse.json({
      success: true,
      pendingCount: pendingVariants.length,
      pending: pendingVariants,
      recentApprovals,
    });
  } catch (error: any) {
    console.error("PMC Approvals GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Approvals API", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();

  // Approval or Rejection strictly requires Super Admin (Mr. Habib El Rahman)
  const auth = await requirePMCAuth(req, "super_admin");
  if (auth.denied) return auth.denied;

  try {
    const { action, variantId, reason, content } = await req.json();

    if (!variantId || !action) {
      return NextResponse.json({ error: "Missing variantId or action." }, { status: 400 });
    }

    if (!["approve", "reject", "request_revision"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    // In a real scenario, fetch variant from DB or use provided payload
    let targetVariant: any = null;
    if (process.env.DATABASE_URL) {
      const found = await db
        .select()
        .from(pmcContentVariants)
        .where(eq(pmcContentVariants.id, variantId));
      if (found.length > 0) targetVariant = found[0];
    }

    const contentPayload = {
      hook: content?.hook ?? targetVariant?.hook,
      script: content?.script ?? targetVariant?.script,
      caption: content?.caption ?? targetVariant?.caption,
      description: content?.description ?? targetVariant?.description,
      platform: content?.platform ?? targetVariant?.platform ?? "facebook",
      mediaAssetId: content?.mediaAssetId ?? targetVariant?.mediaAssetId,
    };

    if (action === "approve") {
      const { approval, updatedStatus } = createApproval({
        variantId,
        platform: contentPayload.platform,
        actorId: auth.user!.id,
        isSuperAdmin: auth.user!.isSuperAdmin,
        content: contentPayload,
      });

      if (process.env.DATABASE_URL) {
        await db.insert(pmcApprovalRequests).values({
          id: approval.id,
          variantId,
          platform: approval.platform,
          requestedBy: approval.requestedBy,
          approvedBy: approval.approvedBy,
          status: "APPROVED",
          contentSnapshotHash: approval.contentSnapshotHash,
          approvedAt: approval.approvedAt,
        });

        await db
          .update(pmcContentVariants)
          .set({
            status: updatedStatus,
            contentHash: approval.contentSnapshotHash,
            updatedAt: new Date(),
          })
          .where(eq(pmcContentVariants.id, variantId));

        await db.insert(pmcAuditLogs).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          actorId: auth.user!.id,
          actorName: auth.user!.name,
          action: "CONTENT_APPROVED",
          entityType: "variant",
          entityId: variantId,
          details: { hash: approval.contentSnapshotHash, platform: approval.platform },
        });
      }

      return NextResponse.json({
        success: true,
        action: "approved",
        variantId,
        approvalId: approval.id,
        newStatus: updatedStatus,
        contentHash: approval.contentSnapshotHash,
        approvedAt: approval.approvedAt,
      });
    }

    if (action === "reject" || action === "request_revision") {
      const { approval, updatedStatus } = rejectApproval({
        variantId,
        platform: contentPayload.platform,
        actorId: auth.user!.id,
        isSuperAdmin: auth.user!.isSuperAdmin,
        reason: reason || "Needs revision by instructor.",
        content: contentPayload,
      });

      if (process.env.DATABASE_URL) {
        await db.insert(pmcApprovalRequests).values({
          id: approval.id,
          variantId,
          platform: approval.platform,
          requestedBy: approval.requestedBy,
          approvedBy: approval.approvedBy,
          status: "REVISION_REQUESTED",
          rejectionReason: approval.rejectionReason,
          contentSnapshotHash: approval.contentSnapshotHash,
        });

        await db
          .update(pmcContentVariants)
          .set({
            status: updatedStatus,
            updatedAt: new Date(),
          })
          .where(eq(pmcContentVariants.id, variantId));

        await db.insert(pmcAuditLogs).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          actorId: auth.user!.id,
          actorName: auth.user!.name,
          action: "CONTENT_REJECTED",
          entityType: "variant",
          entityId: variantId,
          details: { reason: approval.rejectionReason, platform: approval.platform },
        });
      }

      return NextResponse.json({
        success: true,
        action: "rejected",
        variantId,
        approvalId: approval.id,
        newStatus: updatedStatus,
        reason: approval.rejectionReason,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("PMC Approvals POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Approvals Mutation", details: error?.message },
      { status: 500 }
    );
  }
}
