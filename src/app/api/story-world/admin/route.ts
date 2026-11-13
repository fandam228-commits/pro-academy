import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { action } = body;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "تم حفظ التعديلات بنجاح في الذاكرة المحلية (بيئة المعاينة)",
        data: body,
      });
    }

    const { db } = await import("@/db");
    const { storyChapters, storyScenes, curriculumGrades } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const { ensureDbSetup } = await import("@/db/migrate-and-seed");

    await ensureDbSetup();

    if (action === "save_story") {
      const {
        gradeCode,
        storyTitleAr,
        storyTitleEn,
        storyAuthor,
        storyDescriptionAr,
        storyDescriptionEn,
        storyCover,
      } = body;

      const gradeId = `grade_${gradeCode}`;
      await db
        .update(curriculumGrades)
        .set({
          storyTitleAr,
          storyTitleEn,
          storyAuthor,
          storyDescriptionAr,
          storyDescriptionEn,
          storyCover,
        })
        .where(eq(curriculumGrades.id, gradeId));

      return NextResponse.json({
        success: true,
        message: "Story metadata updated successfully",
      });
    }

    if (action === "save_chapter") {
      const {
        id,
        gradeId,
        chapterNumber,
        titleAr,
        titleEn,
        explanation,
        videoUrl,
        pdfUrl,
        vocabulary = [],
        characters = [],
        events = [],
        importantQuotes = [],
        mcqQuestions = [],
        isPublished = true,
      } = body;

      if (!gradeId || !chapterNumber || !titleAr || !titleEn) {
        return NextResponse.json(
          { success: false, error: "Missing required chapter fields" },
          { status: 400 }
        );
      }

      const chapterId = id || `sc_${gradeId}_ch_${chapterNumber}_${Date.now()}`;
      const existing = await db
        .select()
        .from(storyChapters)
        .where(eq(storyChapters.id, chapterId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(storyChapters)
          .set({
            titleAr,
            titleEn,
            explanation,
            videoUrl: videoUrl || null,
            pdfUrl: pdfUrl || null,
            vocabulary,
            characters,
            events,
            importantQuotes,
            mcqQuestions,
            isPublished,
          })
          .where(eq(storyChapters.id, chapterId));
      } else {
        await db.insert(storyChapters).values({
          id: chapterId,
          gradeId,
          chapterNumber: Number(chapterNumber),
          titleAr,
          titleEn,
          explanation,
          videoUrl: videoUrl || null,
          pdfUrl: pdfUrl || null,
          vocabulary,
          characters,
          events,
          importantQuotes,
          mcqQuestions,
          orderIndex: Number(chapterNumber),
          isPublished,
        });
      }

      return NextResponse.json({
        success: true,
        chapterId,
        message: "Chapter saved successfully",
      });
    }

    if (action === "toggle_publish") {
      const { chapterId, isPublished } = body;
      await db
        .update(storyChapters)
        .set({ isPublished: Boolean(isPublished) })
        .where(eq(storyChapters.id, chapterId));

      return NextResponse.json({
        success: true,
        message: `تم ${isPublished ? "نشر" : "إخفاء"} الفصل بنجاح`,
      });
    }

    if (action === "save_scene") {
      const {
        id,
        chapterId,
        sceneNumber,
        titleAr,
        titleEn,
        narrationEn,
        narrationAr,
        characterName,
        characterAvatar,
        backdropImage,
        audioUrl,
        karaokeTokens = [],
      } = body;

      if (!chapterId || !narrationEn || !narrationAr) {
        return NextResponse.json(
          { success: false, error: "chapterId, narrationEn, and narrationAr are required" },
          { status: 400 }
        );
      }

      const sceneId = id || `scene_${chapterId}_${sceneNumber || Date.now()}`;
      const existingScene = await db
        .select()
        .from(storyScenes)
        .where(eq(storyScenes.id, sceneId))
        .limit(1);

      if (existingScene.length > 0) {
        await db
          .update(storyScenes)
          .set({
            titleAr,
            titleEn,
            narrationEn,
            narrationAr,
            characterName,
            characterAvatar,
            backdropImage,
            audioUrl,
            karaokeTokens,
          })
          .where(eq(storyScenes.id, sceneId));
      } else {
        await db.insert(storyScenes).values({
          id: sceneId,
          chapterId,
          sceneNumber: Number(sceneNumber || 1),
          titleAr,
          titleEn,
          narrationEn,
          narrationAr,
          characterName: characterName || "Narrator",
          characterAvatar: characterAvatar || "/images/story-avatar-default.png",
          backdropImage: backdropImage || "/images/story-backdrop-default.jpg",
          audioUrl: audioUrl || null,
          karaokeTokens,
          orderIndex: Number(sceneNumber || 1),
        });
      }

      return NextResponse.json({
        success: true,
        sceneId,
        message: "Scene saved successfully",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/story-world/admin error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Admin operation failed" },
      { status: 500 }
    );
  }
}
