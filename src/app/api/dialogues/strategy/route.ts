import { NextResponse } from "next/server";
import { getRevisionStrategy } from "@/data/dialogue-center";

export async function GET() {
  try {
    const strategy = getRevisionStrategy();
    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error: any) {
    console.error("GET /api/dialogues/strategy error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load revision strategy" },
      { status: 500 }
    );
  }
}
