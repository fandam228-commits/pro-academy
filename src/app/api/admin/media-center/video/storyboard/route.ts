/**
 * PRO MEDIA COMMAND CENTER (PMC) — Video Storyboard Generator API
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { buildEducationalStoryboard } from "@/lib/media-center/video-studio";

export async function POST(req: Request) {
  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const { title, script, topicTitle, aspectRatio } = await req.json();

    const productionPack = buildEducationalStoryboard({
      title: title || "Educational Short Video",
      script: script || "",
      topicTitle: topicTitle || "Grammar Focus",
      aspectRatio: aspectRatio || "9:16",
    });

    return NextResponse.json({
      success: true,
      productionPack,
    });
  } catch (error: any) {
    console.error("PMC Storyboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Storyboard Generator", details: error?.message },
      { status: 500 }
    );
  }
}
