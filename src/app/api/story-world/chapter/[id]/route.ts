import { db } from "@/db";
import {
  storyChapters,
  storyScenes,
  storyStudentProgress,
  curriculumGrades,
} from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const { id: chapterId } = await params;
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;

    const chapterRows = await db
      .select()
      .from(storyChapters)
      .where(eq(storyChapters.id, chapterId))
      .limit(1);

    if (chapterRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    const chapter = chapterRows[0];

    const gradeRows = await db
      .select()
      .from(curriculumGrades)
      .where(eq(curriculumGrades.id, chapter.gradeId))
      .limit(1);

    const grade = gradeRows[0] || null;

    let scenes = await db
      .select()
      .from(storyScenes)
      .where(eq(storyScenes.chapterId, chapterId))
      .orderBy(asc(storyScenes.orderIndex));

    // Provide default educational scenes if none are created yet
    if (scenes.length === 0) {
      const defaultScenes = [
        {
          id: `sc_scene_intro_${chapter.id}`,
          chapterId: chapter.id,
          sceneNumber: 1,
          titleAr: "المشهد الافتتاحي: استهلال الفصل وتحديد البيئة المكانية والزمانية",
          titleEn: "Opening Scene: Setting and Narrative Exposition",
          narrationEn: `In this chapter, the educational narrative explores key character decisions and thematic challenges as outlined in Mr. Habib's curriculum guide.`,
          narrationAr: chapter.explanation || "استعراض أحداث الفصل الدراسي والمواقف التعليمية والتربوية المستفادة.",
          characterName: Array.isArray(chapter.characters) && (chapter.characters as any[])[0]?.name ? (chapter.characters as any[])[0].name : "Narrator",
          characterAvatar: "/images/story-avatar-default.png",
          backdropImage: grade?.storyCover || "/images/story-backdrop-default.jpg",
          karaokeTokens: [
            { text: "In this chapter, the narrative develops key character moments.", startMs: 0, endMs: 3500 },
            { text: "Pay close attention to key collocations and thematic expressions.", startMs: 3500, endMs: 7000 },
          ],
          orderIndex: 1,
        },
        {
          id: `sc_scene_climax_${chapter.id}`,
          chapterId: chapter.id,
          sceneNumber: 2,
          titleAr: "المشهد الرئيسي: تصاعد الأحداث والمواجهة الدرامية",
          titleEn: "Climactic Scene: Core Conflict and Resolution",
          narrationEn: `As events unfold, the characters encounter pivotal choices testing their resolve, reflecting core literary themes.`,
          narrationAr: "تتصاعد الأحداث وتظهر ملامح الصراع الرئيسي بين الشخصيات والتحديات التي تواجهها.",
          characterName: Array.isArray(chapter.characters) && (chapter.characters as any[])[1]?.name ? (chapter.characters as any[])[1].name : "Main Character",
          characterAvatar: "/images/story-avatar-default.png",
          backdropImage: grade?.storyCover || "/images/story-backdrop-default.jpg",
          karaokeTokens: [
            { text: "The narrative tension reaches a crucial turning point.", startMs: 0, endMs: 3500 },
            { text: "Reflect on how these actions impact the overall story arc.", startMs: 3500, endMs: 7000 },
          ],
          orderIndex: 2,
        },
      ];
      scenes = defaultScenes as any[];
    }

    // Load student bookmark if logged in
    let studentProgress = null;
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

    return NextResponse.json({
      success: true,
      chapter,
      grade,
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
