import { NextResponse } from "next/server";
import { db } from "@/db";
import { essayTopics } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { SEED_ESSAY_TOPICS } from "@/data/pro-suite-seeds";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("grade_level") || "3rd_sec";

    let topics: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select()
          .from(essayTopics)
          .where(gradeLevel === "all" ? undefined : eq(essayTopics.gradeLevel, gradeLevel));

        if (rows && rows.length > 0) {
          topics = rows;
        }
      } catch (e) {
        console.warn("DB essayTopics query error:", e);
      }
    }

    if (topics.length === 0) {
      topics = SEED_ESSAY_TOPICS.filter((t) => gradeLevel === "all" || t.gradeLevel === gradeLevel);
    }

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (err: any) {
    console.error("GET /api/essays/topics error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
