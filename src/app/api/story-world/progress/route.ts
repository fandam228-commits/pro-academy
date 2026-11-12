import { db } from "@/db";
import {
  storyStudentProgress,
  storyStudentBadges,
  studentSavedVocabulary,
  users,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    if (!auth?.user) {
      return NextResponse.json({
        success: true,
        progress: [],
        badges: [],
      });
    }

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
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
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
      const recordId = `ssp_${studentId}_${chapterId}`;
      await db.insert(storyStudentProgress).values({
        id: recordId,
        studentId,
        gradeId,
        chapterId,
        lastPage: lastPage !== undefined ? Number(lastPage) : 1,
        readingProgress: readingProgress !== undefined ? Number(readingProgress) : 0,
        listeningProgress: listeningProgress !== undefined ? Number(listeningProgress) : 0,
        learnedVocab: savedWord ? [savedWord] : [],
        isCompleted: Boolean(isCompleted),
        updatedAt: new Date(),
      });
    }

    // Also add to global student vocabulary notebook if savedWord was passed
    if (savedWord && savedWord.word) {
      try {
        const existWord = await db
          .select()
          .from(studentSavedVocabulary)
          .where(
            and(
              eq(studentSavedVocabulary.studentId, studentId),
              eq(studentSavedVocabulary.word, savedWord.word)
            )
          )
          .limit(1);

        if (existWord.length === 0) {
          await db.insert(studentSavedVocabulary).values({
            id: `ssv_story_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            studentId,
            gradeId,
            unitId: chapterId,
            word: savedWord.word,
            arabicMeaning: savedWord.meaningAr || "",
            exampleSentence: savedWord.example || "",
            notes: "Saved from Story World interactive reader",
          });
        }
      } catch (err) {
        console.warn("Could not insert word into studentSavedVocabulary:", err);
      }
    }

    // Badge Check 1: Story Explorer (began/read first chapter)
    const explorerBadge = await db
      .select()
      .from(storyStudentBadges)
      .where(
        and(
          eq(storyStudentBadges.studentId, studentId),
          eq(storyStudentBadges.badgeCode, "story_explorer")
        )
      )
      .limit(1);

    if (explorerBadge.length === 0) {
      const b = {
        id: `badge_se_${Date.now()}`,
        studentId,
        badgeCode: "story_explorer",
        badgeNameAr: "مستكشف القصص",
        badgeNameEn: "Story Explorer",
        badgeIcon: "🗺️",
        earnedAt: new Date(),
      };
      await db.insert(storyStudentBadges).values(b);
      newBadges.push(b);
    }

    // Badge Check 2: Master Reader (read 5+ chapters)
    const allProgress = await db
      .select()
      .from(storyStudentProgress)
      .where(
        and(
          eq(storyStudentProgress.studentId, studentId),
          eq(storyStudentProgress.isCompleted, true)
        )
      );

    if (allProgress.length >= 5) {
      const masterBadge = await db
        .select()
        .from(storyStudentBadges)
        .where(
          and(
            eq(storyStudentBadges.studentId, studentId),
            eq(storyStudentBadges.badgeCode, "master_reader")
          )
        )
        .limit(1);

      if (masterBadge.length === 0) {
        const b = {
          id: `badge_mr_${Date.now()}`,
          studentId,
          badgeCode: "master_reader",
          badgeNameAr: "القارئ المتميز",
          badgeNameEn: "Master Reader",
          badgeIcon: "📚",
          earnedAt: new Date(),
        };
        await db.insert(storyStudentBadges).values(b);
        newBadges.push(b);
      }
    }

    // Badge Check 3: Listening Hero (listeningProgress === 100)
    if (listeningProgress >= 100) {
      const listenBadge = await db
        .select()
        .from(storyStudentBadges)
        .where(
          and(
            eq(storyStudentBadges.studentId, studentId),
            eq(storyStudentBadges.badgeCode, "listening_hero")
          )
        )
        .limit(1);

      if (listenBadge.length === 0) {
        const b = {
          id: `badge_lh_${Date.now()}`,
          studentId,
          badgeCode: "listening_hero",
          badgeNameAr: "بطل الاستماع الأدبي",
          badgeNameEn: "Listening Hero",
          badgeIcon: "🎧",
          earnedAt: new Date(),
        };
        await db.insert(storyStudentBadges).values(b);
        newBadges.push(b);
      }
    }

    return NextResponse.json({
      success: true,
      newBadges,
    });
  } catch (error: any) {
    console.error("POST /api/story-world/progress error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}
