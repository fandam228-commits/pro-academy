/**
 * PRO MEDIA COMMAND CENTER (PMC) — Queue Job Retry API Route
 * Professional Academy — Mr. Habib El Rahman
 * Safely retries a failed publishing job after pre-retry verification.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { retryFailedJob } from "@/lib/media-center/publishing-queue";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePMCAuth(req, "super_admin");
  if (auth.denied) return auth.denied;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const simulatedRecentPosts = body.recentPosts || [];

    const result = await retryFailedJob(id, simulatedRecentPosts);

    return NextResponse.json({
      success: true,
      message: result.preventedDuplicate
        ? "Pre-retry check detected that this post was already published on the platform. Duplicate prevented!"
        : "Job retry dispatched successfully.",
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Retry failed." }, { status: 400 });
  }
}
