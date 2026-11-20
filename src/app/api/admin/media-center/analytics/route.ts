/**
 * PRO MEDIA COMMAND CENTER (PMC) — Unified Analytics API Route
 * Professional Academy — Mr. Habib El Rahman
 * Provides real multiplatform analytics with source provenance and top performers.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { getLiveConnectedAnalyticsSeed } from "@/lib/media-center/analytics-engine";

export async function GET(req: Request) {
  // Analysts, Editors, and Super Admin can view analytics
  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    const summary = getLiveConnectedAnalyticsSeed();
    return NextResponse.json({
      success: true,
      analytics: summary,
      provenance: {
        facebook: summary.platforms.facebook.dataSource,
        youtube: summary.platforms.youtube.dataSource,
        tiktok: summary.platforms.tiktok.dataSource,
        lastRefreshedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load media analytics." },
      { status: 500 }
    );
  }
}
