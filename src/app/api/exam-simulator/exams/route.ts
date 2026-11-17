import { NextResponse } from "next/server";
import { db } from "@/db";
import { mockExams } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { SEED_MOCK_EXAM } from "@/data/pro-suite-seeds";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("grade_level") || "3rd_sec";

    let exams: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select()
          .from(mockExams)
          .where(gradeLevel === "all" ? undefined : eq(mockExams.gradeLevel, gradeLevel));

        if (rows && rows.length > 0) {
          exams = rows.map((r) => ({
            id: r.id,
            title: r.title,
            gradeLevel: r.gradeLevel,
            durationMinutes: r.durationMinutes,
            sections: r.sectionsJson,
            isPublished: r.isPublished,
          }));
        }
      } catch (e) {
        console.warn("DB mockExams query error:", e);
      }
    }

    if (exams.length === 0) {
      exams = [SEED_MOCK_EXAM];
    }

    return NextResponse.json({
      success: true,
      exams,
    });
  } catch (err: any) {
    console.error("GET /api/exam-simulator/exams error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
