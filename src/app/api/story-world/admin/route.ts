import { db } from "@/db";
import {
  storyChapters,
  storyScenes,
  curriculumGrades,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { action } = body;

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
          isPublished: true,
        });
      }

      return NextResponse.json({
        success: true,
        chapterId,
        message: "Chapter saved successfully",
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
