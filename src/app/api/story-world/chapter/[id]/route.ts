import { NextResponse } from "next/server";
import { getChapterById } from "@/data/story-world";
import { getAuthContext } from "@/lib/security";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chapterId } = await params;
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;

    // 1. Check extracted static dataset first for complete 11-section educational content
    const lookup = getChapterById(chapterId);

    let chapterData: any = null;
    let storyData: any = null;
    let gradeData: any = null;
    let studentProgress: any = null;

    if (lookup) {
      chapterData = lookup.chapter;
      storyData = lookup.story;
      gradeData = {
        id: `grade_${storyData.gradeCode}`,
        code: storyData.gradeCode,
        titleAr: storyData.gradeLabelAr,
        titleEn: storyData.gradeLabelEn,
        storyTitleAr: storyData.titleAr,
        storyTitleEn: storyData.titleEn,
        storyAuthor: storyData.author,
        storyDescriptionAr: storyData.descriptionAr,
        storyDescriptionEn: storyData.descriptionEn,
        storyCover: storyData.coverImage,
      };
    }

    // 2. Query DB if configured and available
    if (process.env.DATABASE_URL) {
      try {
        const { db } = await import("@/db");
        const { storyChapters, storyStudentProgress, curriculumGrades } = await import("@/db/schema");
        const { eq, and } = await import("drizzle-orm");
        const { ensureDbSetup } = await import("@/db/migrate-and-seed");

        await ensureDbSetup();

        const dbChRows = await db
          .select()
          .from(storyChapters)
          .where(eq(storyChapters.id, chapterId))
          .limit(1);

        if (dbChRows.length > 0) {
          const dbCh = dbChRows[0];
          // Merge DB custom data if present
          if (!chapterData) {
            chapterData = dbCh;
          }

          if (dbCh.gradeId) {
            const gRows = await db
              .select()
              .from(curriculumGrades)
              .where(eq(curriculumGrades.id, dbCh.gradeId))
              .limit(1);
            if (gRows.length > 0 && !gradeData) {
              gradeData = gRows[0];
            }
          }
        }

        if (studentId) {
          const pRows = await db
            .select()
            .from(storyStudentProgress)
            .where(
              and(
                eq(storyStudentProgress.studentId, studentId),
                eq(storyStudentProgress.chapterId, chapterId)
              )
            )
            .limit(1);

          if (pRows.length > 0) {
            studentProgress = pRows[0];
          }
        }
      } catch (dbErr) {
        console.warn("Database chapter lookup error (using fallback):", dbErr);
      }
    }

    if (!chapterData) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Build educational cinema scenes dynamically from chapter points and narrative
    const points: any[] = chapterData.chapterInPoints || [];
    const textParas: any[] = chapterData.theText || [];
    const characters: any[] = storyData?.characters || [];

    const primaryChar = characters[0]?.nameEn || "Edmond Dantés";
    const mentorChar = characters[1]?.nameEn || characters[0]?.nameEn || "Abbé Faria";

    const scenes = [
      {
        id: `sc_scene_intro_${chapterData.id}`,
        chapterId: chapterData.id,
        sceneNumber: 1,
        titleAr: points[0]?.ar || `المشهد الافتتاحي: استهلال الفصل ${chapterData.chapterNumber}`,
        titleEn: points[0]?.en || `Opening Scene: Chapter ${chapterData.chapterNumber} Exposition`,
        narrationEn: textParas[0]?.paragraphEn || chapterData.summaryEn || "The educational journey begins with vital plot exposition and character motives.",
        narrationAr: textParas[0]?.paragraphAr || chapterData.summaryAr || "يبدأ الفصل باستعراض الموقف الدرامي والأبعاد التربوية واللغوية المقررة.",
        characterName: primaryChar,
        characterAvatar: storyData?.coverImage || "/images/story-avatar-default.png",
        backdropImage: storyData?.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
        karaokeTokens: (textParas[0]?.paragraphEn || chapterData.summaryEn || "Welcome to the story")
          .split(". ")
          .slice(0, 3)
          .map((sent: string, sIdx: number) => ({
            text: sent,
            startMs: sIdx * 3500,
            endMs: (sIdx + 1) * 3500,
          })),
        orderIndex: 1,
      },
      {
        id: `sc_scene_climax_${chapterData.id}`,
        chapterId: chapterData.id,
        sceneNumber: 2,
        titleAr: points[Math.min(1, points.length - 1)]?.ar || "المشهد الرئيسي: الصراع والتحول الدرامي",
        titleEn: points[Math.min(1, points.length - 1)]?.en || "Climactic Scene: Conflict and Resolution",
        narrationEn: textParas[Math.min(1, textParas.length - 1)]?.paragraphEn || chapterData.summaryEn || "A crucial dialogue unfolds testing the character's determination.",
        narrationAr: textParas[Math.min(1, textParas.length - 1)]?.paragraphAr || chapterData.summaryAr || "يتصاعد الصراع الدرامي ويواجه الأبطال تحديات مصيرية تكشف معادنهم.",
        characterName: mentorChar,
        characterAvatar: storyData?.coverImage || "/images/story-avatar-default.png",
        backdropImage: storyData?.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
        karaokeTokens: (textParas[Math.min(1, textParas.length - 1)]?.paragraphEn || chapterData.summaryEn || "Knowledge is power and virtue will prevail.")
          .split(". ")
          .slice(0, 3)
          .map((sent: string, sIdx: number) => ({
            text: sent,
            startMs: sIdx * 3500,
            endMs: (sIdx + 1) * 3500,
          })),
        orderIndex: 2,
      },
    ];

    return NextResponse.json({
      success: true,
      chapter: {
        ...chapterData,
        gradeCode: storyData?.gradeCode || "sec_3",
        storyTitleEn: storyData?.titleEn,
        storyTitleAr: storyData?.titleAr,
        author: storyData?.author,
        characters: storyData?.characters || [],
        themes: storyData?.themes || [],
        plotSummaryEn: storyData?.plotSummaryEn,
        plotSummaryAr: storyData?.plotSummaryAr,
        aboutAuthorEn: storyData?.aboutAuthorEn,
        aboutAuthorAr: storyData?.aboutAuthorAr,
      },
      story: storyData,
      grade: gradeData,
      scenes,
      studentProgress,
    });
  } catch (error: any) {
    console.error("GET /api/story-world/chapter/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load chapter" },
      { status: 500 }
    );
  }
}
