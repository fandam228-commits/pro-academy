import { NextResponse } from "next/server";
import { db } from "@/db";
import { mockExams } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { MASTER_MOCK_EXAMS_REGISTRY, MockExamDefinition } from "@/data/exam-simulator-catalog.ts";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    let gradeLevel = searchParams.get("grade_level") || "all";
    if (gradeLevel === "3rd_sec") gradeLevel = "3rd_sec";
    if (gradeLevel === "1st_sec") gradeLevel = "1st_sec";
    if (gradeLevel === "3rd_prep") gradeLevel = "3rd_prep";

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
      if (gradeLevel === "all") {
        exams = MASTER_MOCK_EXAMS_REGISTRY;
      } else {
        const filtered = MASTER_MOCK_EXAMS_REGISTRY.filter((e) => e.gradeLevel === gradeLevel);
        exams = filtered.length > 0 ? filtered : MASTER_MOCK_EXAMS_REGISTRY;
      }
    }

    return NextResponse.json({
      success: true,
      gradeLevel,
      exams,
    });
  } catch (err: any) {
    console.error("GET /api/exam-simulator/exams error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
