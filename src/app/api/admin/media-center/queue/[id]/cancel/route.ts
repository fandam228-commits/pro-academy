/**
 * PRO MEDIA COMMAND CENTER (PMC) — Cancel Queue Job API Route
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { cancelQueuedJob } from "@/lib/media-center/publishing-queue";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePMCAuth(req, "super_admin");
  if (auth.denied) return auth.denied;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Cancelled by instructor";

    const cancelled = cancelQueuedJob(id, reason);
    if (!cancelled) {
      return NextResponse.json({ error: "Job not found or could not be cancelled." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Job cancelled successfully.",
      jobId: id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to cancel job." }, { status: 400 });
  }
}
