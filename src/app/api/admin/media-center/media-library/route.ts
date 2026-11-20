/**
 * PRO MEDIA COMMAND CENTER (PMC) — Media Library API
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { db } from "@/db";
import { pmcMediaAssets } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(req: Request) {
  await ensureDbSetup();

  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    let assets: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        assets = await db
          .select()
          .from(pmcMediaAssets)
          .orderBy(desc(pmcMediaAssets.createdAt))
          .limit(50);
      } catch (err) {
        console.warn("Error selecting media assets:", err);
      }
    }

    // Default assets sample if empty
    if (assets.length === 0) {
      assets = [
        {
          id: "asset_sample_intro_916",
          fileName: "habib_academy_vertical_intro.mp4",
          fileUrl: "/demo-video-916.mp4",
          fileType: "video",
          dimensions: "9:16",
          durationSeconds: 38,
          sizeBytes: 14200000,
          createdAt: new Date().toISOString(),
        },
        {
          id: "asset_sample_thumb_inversion",
          fileName: "thumb_inversion_masterclass.png",
          fileUrl: "/habib-hero.gif",
          fileType: "thumbnail",
          dimensions: "16:9",
          durationSeconds: 0,
          sizeBytes: 840000,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      assets,
    });
  } catch (error: any) {
    console.error("PMC Media Library GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Media Library", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();

  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const { fileName, fileUrl, fileType, dimensions, durationSeconds, sizeBytes } = await req.json();

    if (!fileName || !fileUrl) {
      return NextResponse.json({ error: "Missing fileName or fileUrl." }, { status: 400 });
    }

    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (process.env.DATABASE_URL) {
      await db.insert(pmcMediaAssets).values({
        id: assetId,
        fileName,
        fileUrl,
        fileType: fileType || "video",
        dimensions: dimensions || "9:16",
        durationSeconds: durationSeconds || 0,
        sizeBytes: sizeBytes || 0,
      });
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        fileName,
        fileUrl,
        fileType,
        dimensions,
      },
    });
  } catch (error: any) {
    console.error("PMC Media Library POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error registering media asset", details: error?.message },
      { status: 500 }
    );
  }
}
