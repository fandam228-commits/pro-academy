import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const auth = await getAuthContext(req);
    if (!auth?.user || !process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        progress: [],
        badges: [],
      });
    }

    const { db } = await import("@/db");
    const { storyStudentProgress, storyStudentBadges } = await import("@/db/schema");
    const { eq, desc } = await import("drizzle-orm");
    const { ensureDbSetup } = await import("@/db/migrate-and-seed");

    await ensureDbSetup();

    const studentId = auth.user.id;
    const progress = await db
      .select()
      .from(storyStudentProgress)
      .where(eq(storyStudentProgress.studentId, studentId));

    const badges = await db
      .select()
      .from(storyStudentBadges)
      .where(eq(storyStudentBadges.studentId, studentId))
      .orderBy(desc(storyStudentBadges.earnedAt));

    return NextResponse.json({
      success: true,
      progress,
      badges,
    });
  } catch (error: any) {
    console.error("GET /api/story-world/progress error:", error);
    return NextResponse.json({
      success: true,
      progress: [],
      badges: [],
    });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthContext(req);
    if (!auth?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = auth.user.id;
    const body = await req.json();
    const {
      gradeId,
      chapterId,
      lastPage,
      readingProgress,
      listeningProgress,
      isCompleted,
      savedWord,
    } = body;

    if (!gradeId || !chapterId) {
      return NextResponse.json(
        { success: false, error: "gradeId and chapterId are required" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: "Progress tracked in local session (preview environment)",
        newBadges: [],
      });
    }

    const { db } = await import("@/db");
    const { storyStudentProgress, storyStudentBadges, studentSavedVocabulary, users } = await import("@/db/schema");
    const { eq, and, sql } = await import("drizzle-orm");
    const { ensureDbSetup } = await import("@/db/migrate-and-seed");

    await ensureDbSetup();

    const existingRows = await db
      .select()
      .from(storyStudentProgress)
      .where(
        and(
          eq(storyStudentProgress.studentId, studentId),
          eq(storyStudentProgress.chapterId, chapterId)
        )
      )
      .limit(1);

    const newBadges: any[] = [];

    if (existingRows.length > 0) {
      const current = existingRows[0];
      const updatedVocab = Array.isArray(current.learnedVocab) ? [...(current.learnedVocab as any[])] : [];
      if (savedWord && !updatedVocab.some((w) => w.word === savedWord.word)) {
        updatedVocab.push(savedWord);
      }

      await db
        .update(storyStudentProgress)
        .set({
          lastPage: lastPage !== undefined ? Number(lastPage) : current.lastPage,
          readingProgress:
            readingProgress !== undefined
              ? Math.max(current.readingProgress, Number(readingProgress))
              : current.readingProgress,
          listeningProgress:
            listeningProgress !== undefined
              ? Math.max(current.listeningProgress, Number(listeningProgress))
              : current.listeningProgress,
          learnedVocab: updatedVocab,
          isCompleted: isCompleted !== undefined ? Boolean(isCompleted) : current.isCompleted,
          updatedAt: new Date(),
        })
        .where(eq(storyStudentProgress.id, current.id));
    } else {
      const progressId = `ssp_${studentId}_${chapterId}`;
      await db.insert(storyStudentProgress).values({
        id: progressId,
        studentId,
        gradeId,
        chapterId,
        lastPage: Number(lastPage || 1),
        readingProgress: Number(readingProgress || 0),
        listeningProgress: Number(listeningProgress || 0),
        learnedVocab: savedWord ? [savedWord] : [],
        isCompleted: Boolean(isCompleted),
        updatedAt: new Date(),
      });
    }

    if (savedWord) {
      const vocabId = `vocab_${studentId}_${encodeURIComponent(savedWord.word)}`;
      const existingVocab = await db
        .select()
        .from(studentSavedVocabulary)
        .where(eq(studentSavedVocabulary.id, vocabId))
        .limit(1);

      if (existingVocab.length === 0) {
        await db.insert(studentSavedVocabulary).values({
          id: vocabId,
          studentId,
          word: savedWord.word,
          arabicMeaning: savedWord.meaningAr,
          notes: `Story Chapter ${chapterId}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      newBadges,
    });
  } catch (error: any) {
    console.error("POST /api/story-world/progress error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save progress" },
      { status: 500 }
    );
  }
}
