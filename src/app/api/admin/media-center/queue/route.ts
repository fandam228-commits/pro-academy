/**
 * PRO MEDIA COMMAND CENTER (PMC) — Publishing Queue API Route
 * Professional Academy — Mr. Habib El Rahman
 * Handles listing queue jobs and enqueueing approved content.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import {
  getQueueStatusSnapshot,
  enqueueApprovedVariant,
  dispatchPublishingJob,
} from "@/lib/media-center/publishing-queue";

export async function GET(req: Request) {
  await ensureDbSetup();

  // Analysts, Editors, and Super Admin can view queue status
  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    const snapshot = getQueueStatusSnapshot();
    return NextResponse.json(snapshot);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch queue snapshot" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();

  // Enqueueing / Publishing requires Super Admin authorization (Mr. Habib El Rahman)
  const auth = await requirePMCAuth(req, "super_admin");
  if (auth.denied) return auth.denied;

  try {
    const body = await req.json();
    const {
      variantId,
      approvalStatus,
      approvedBy,
      contentSnapshotHash,
      currentContentHash,
      title,
      bodyText,
      platform,
      mediaUrl,
      scheduledAt,
      publishingMode,
      forceImmediate,
    } = body;

    if (!variantId || !platform || !title) {
      return NextResponse.json(
        { error: "Missing required fields: variantId, platform, title" },
        { status: 400 }
      );
    }

    // 1. Enqueue with strict Approval Gate validation
    const job = await enqueueApprovedVariant(
      {
        variantId,
        approvalStatus: approvalStatus || "APPROVED",
        approvedBy: approvedBy || auth.user?.name || "Mr. Habib El Rahman",
        contentSnapshotHash,
        currentContentHash,
      },
      {
        title,
        bodyText: bodyText || "",
        platform,
        mediaUrl,
      },
      {
        scheduledAt,
        publishingMode,
        forceImmediate: Boolean(forceImmediate),
      }
    );

    return NextResponse.json({
      success: true,
      message: forceImmediate ? "Job published successfully!" : "Job enqueued successfully into publishing queue.",
      job,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process queue request" }, { status: 400 });
  }
}
