import { NextResponse } from "next/server";
import { ALL_CURRICULUM_STORIES, GRADE_DEFINITIONS } from "@/data/story-world";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;

    let dbGrades: any[] = [];
    let dbChapters: any[] = [];
    let progressRecords: any[] = [];
    let badges: any[] = [];

    // Attempt to read from PostgreSQL if database is configured
    if (process.env.DATABASE_URL) {
      try {
        const { db } = await import("@/db");
        const { curriculumGrades, storyChapters, storyStudentProgress, storyStudentBadges } = await import("@/db/schema");
        const { eq, asc, desc } = await import("drizzle-orm");
        const { ensureDbSetup } = await import("@/db/migrate-and-seed");

        await ensureDbSetup();

        dbGrades = await db
          .select()
          .from(curriculumGrades)
          .orderBy(asc(curriculumGrades.orderIndex));

        dbChapters = await db
          .select()
          .from(storyChapters)
          .where(eq(storyChapters.isPublished, true))
          .orderBy(asc(storyChapters.orderIndex));

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
      } catch (dbErr) {
        console.warn("Database query skipped or failed, using static curriculum story bank:", dbErr);
      }
    }

    const progressMap = new Map<string, any>();
    for (const p of progressRecords) {
      progressMap.set(p.chapterId, p);
    }

    // Build hierarchical stories by grade
    const storiesByGrade = GRADE_DEFINITIONS.map((gDef) => {
      // Find matching curriculum stories for this grade
      const matchingCurriculumStories = ALL_CURRICULUM_STORIES.filter(
        (s) => s.gradeCode === gDef.code
      );

      // Default story info from extracted stories
      const primaryStory = matchingCurriculumStories[0];

      const gradeObj = {
        id: `grade_${gDef.code}`,
        code: gDef.code,
        titleAr: gDef.labelAr,
        titleEn: gDef.labelEn,
        stage: gDef.stage,
        storyTitleAr: primaryStory?.titleAr || "القصة المقررة",
        storyTitleEn: primaryStory?.titleEn || "Curriculum Story",
        storyAuthor: primaryStory?.author || "وزارة التربية والتعليم",
        storyDescriptionAr: primaryStory?.descriptionAr || "",
        storyDescriptionEn: primaryStory?.descriptionEn || "",
        storyCover: primaryStory?.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
        orderIndex: gDef.orderIndex,
        curriculumStories: matchingCurriculumStories,
      };

      // Aggregate all chapters for this grade
      const allChaptersForGrade: any[] = [];
      for (const st of matchingCurriculumStories) {
        for (const ch of st.chapters) {
          const p = progressMap.get(ch.id);
          allChaptersForGrade.push({
            id: ch.id,
            gradeId: gradeObj.id,
            gradeCode: gDef.code,
            storyId: st.id,
            storyTitleEn: st.titleEn,
            storyTitleAr: st.titleAr,
            term: ch.term || st.term,
            chapterNumber: ch.chapterNumber,
            titleAr: ch.titleAr,
            titleEn: ch.titleEn,
            explanation: ch.summaryEn || ch.summaryAr,
            summaryEn: ch.summaryEn,
            summaryAr: ch.summaryAr,
            orderIndex: ch.chapterNumber,
            isPublished: true,
            vocabularyCount: ch.vocabulary?.length || 0,
            pointsCount: ch.chapterInPoints?.length || 0,
            textParagraphsCount: ch.theText?.length || 0,
            questionsCount: ch.questionsAndAnswers?.length || 0,
            importantQuestionsCount: ch.importantQuestions?.length || 0,
            homeworkQuestionsCount: ch.homeworkQuestions?.length || 0,
            lastPage: p?.lastPage || 1,
            readingProgress: p?.readingProgress || 0,
            listeningProgress: p?.listeningProgress || 0,
            isCompleted: p?.isCompleted || false,
          });
        }
      }

      const totalChapters = allChaptersForGrade.length;
      const completedCount = allChaptersForGrade.filter((c) => c.isCompleted).length;
      const overallProgress =
        totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

      return {
        grade: gradeObj,
        chapters: allChaptersForGrade,
        totalChapters,
        completedCount,
        overallProgress,
      };
    });

    return NextResponse.json({
      success: true,
      stories: storiesByGrade,
      allCurriculumStories: ALL_CURRICULUM_STORIES,
      grades: GRADE_DEFINITIONS,
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
