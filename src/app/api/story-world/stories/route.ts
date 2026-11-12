import { db } from "@/db";
import {
  curriculumGrades,
  storyChapters,
  storyStudentProgress,
  storyStudentBadges,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;

    const grades = await db
      .select({
        id: curriculumGrades.id,
        code: curriculumGrades.code,
        titleAr: curriculumGrades.titleAr,
        titleEn: curriculumGrades.titleEn,
        stage: curriculumGrades.stage,
        storyTitleAr: curriculumGrades.storyTitleAr,
        storyTitleEn: curriculumGrades.storyTitleEn,
        storyAuthor: curriculumGrades.storyAuthor,
        storyDescriptionAr: curriculumGrades.storyDescriptionAr,
        storyDescriptionEn: curriculumGrades.storyDescriptionEn,
        storyCover: curriculumGrades.storyCover,
        orderIndex: curriculumGrades.orderIndex,
      })
      .from(curriculumGrades)
      .orderBy(asc(curriculumGrades.orderIndex));

    const chapters = await db
      .select({
        id: storyChapters.id,
        gradeId: storyChapters.gradeId,
        chapterNumber: storyChapters.chapterNumber,
        titleAr: storyChapters.titleAr,
        titleEn: storyChapters.titleEn,
        explanation: storyChapters.explanation,
        orderIndex: storyChapters.orderIndex,
        isPublished: storyChapters.isPublished,
      })
      .from(storyChapters)
      .where(eq(storyChapters.isPublished, true))
      .orderBy(asc(storyChapters.orderIndex));

    let progressRecords: any[] = [];
    let badges: any[] = [];

    if (studentId) {
      progressRecords = await db
        .select()
        .from(storyStudentProgress)
        .where(eq(storyStudentProgress.studentId, studentId));

      badges = await db
        .select()
        .from(storyStudentBadges)
        .where(eq(storyStudentBadges.studentId, studentId))
        .orderBy(desc(storyStudentBadges.earnedAt));
    }

    const progressMap = new Map<string, any>();
    for (const p of progressRecords) {
      progressMap.set(p.chapterId, p);
    }

    const storiesByGrade = grades.map((g) => {
      const gradeChapters = chapters
        .filter((c) => c.gradeId === g.id)
        .map((c) => {
          const p = progressMap.get(c.id);
          return {
            ...c,
            lastPage: p?.lastPage || 1,
            readingProgress: p?.readingProgress || 0,
            listeningProgress: p?.listeningProgress || 0,
            isCompleted: p?.isCompleted || false,
          };
        });

      const totalChapters = gradeChapters.length;
      const completedCount = gradeChapters.filter((c) => c.isCompleted).length;
      const overallProgress =
        totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

      return {
        grade: g,
        chapters: gradeChapters,
        totalChapters,
        completedCount,
        overallProgress,
      };
    });

    return NextResponse.json({
      success: true,
      stories: storiesByGrade,
      badges,
    });
  } catch (error: any) {
    console.error("GET /api/story-world/stories error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load stories" },
      { status: 500 }
    );
  }
}
