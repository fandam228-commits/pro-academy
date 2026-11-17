import { NextResponse } from "next/server";
import { db } from "@/db";
import { novelChapters, studentLiteratureProgress } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { NOVEL_CHAPTERS_SEED } from "@/data/literature-novel-seeds";
import { awardXP } from "@/lib/gamification-service";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("grade_level") || "3rd_sec";
    const novelTitle = searchParams.get("novel_title");
    const chapterNumber = searchParams.get("chapter_number");

    let chapters: any[] = [];
    let userProgress: any = null;

    try {
      await ensureDbSetup();
      const ctx = await getAuthContext(req);

      if (process.env.DATABASE_URL) {
        const conditions: any[] = [];
        if (gradeLevel && gradeLevel !== "all") {
          conditions.push(eq(novelChapters.gradeLevel, gradeLevel));
        }
        if (novelTitle && novelTitle !== "all") {
          conditions.push(eq(novelChapters.novelTitle, novelTitle));
        }
        if (chapterNumber) {
          conditions.push(eq(novelChapters.chapterNumber, parseInt(chapterNumber, 10)));
        }

        const rows = await db
          .select()
          .from(novelChapters)
          .where(conditions.length > 0 ? and(...conditions) : undefined);

        if (rows && rows.length > 0) {
          chapters = rows;
        }

        // Fetch user progress if authenticated
        if (ctx?.user?.id) {
          const progRows = await db
            .select()
            .from(studentLiteratureProgress)
            .where(eq(studentLiteratureProgress.userId, ctx.user.id));
          userProgress = progRows;
        }
      }
    } catch (dbErr) {
      console.warn("DB query failed in literature chapters GET, using fallback:", dbErr);
    }

    if (chapters.length === 0) {
      chapters = NOVEL_CHAPTERS_SEED.filter((ch) => {
        if (gradeLevel && gradeLevel !== "all" && ch.grade_level !== gradeLevel) return false;
        if (novelTitle && novelTitle !== "all" && ch.novel_title !== novelTitle) return false;
        if (chapterNumber && ch.chapter_number !== parseInt(chapterNumber, 10)) return false;
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      count: chapters.length,
      chapters,
      userProgress,
    });
  } catch (err: any) {
    console.error("GET /api/literature/chapters error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const body = await req.json();

    const {
      action = "submit_critical_thinking", // 'submit_critical_thinking' | 'save_progress'
      chapterId,
      questionId,
      studentAnswer = "",
      isRead,
      audioCompleted,
      userId,
    } = body;

    const effectiveUserId = ctx?.user?.id || userId || "usr_guest_literature";

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
    }

    // 1. Fetch Chapter
    let chapter: any = null;
    if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select()
          .from(novelChapters)
          .where(eq(novelChapters.id, chapterId));
        if (rows.length > 0) {
          chapter = rows[0];
        }
      } catch (e) {
        console.warn("Could not query novel chapter:", e);
      }
    }

    if (!chapter) {
      chapter = NOVEL_CHAPTERS_SEED.find((c) => c.id === chapterId);
    }

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // 2. Handle Critical Thinking Evaluation
    if (action === "submit_critical_thinking") {
      const questions = (chapter.criticalThinkingQs || chapter.critical_thinking_qs || []) as any[];
      const targetQ = questions.find((q) => q.id === questionId) || questions[0];

      if (!targetQ) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      const rawAnswer = String(studentAnswer).trim();
      const wordCount = rawAnswer.split(/\s+/).filter(Boolean).length;

      // Smart semantic keyword evaluation
      const keyPoints = (targetQ.key_points || []) as string[];
      let matchedPointsCount = 0;
      const lowerAnswer = rawAnswer.toLowerCase();

      for (const pt of keyPoints) {
        const ptTokens = pt.toLowerCase().split(/\s+/);
        if (ptTokens.some((tok) => tok.length > 3 && lowerAnswer.includes(tok))) {
          matchedPointsCount++;
        }
      }

      const isThoughtful = wordCount >= 6 || matchedPointsCount >= 1;
      const score = isThoughtful ? 100 : 40;

      // Award Gamification XP if answer is thoughtful
      if (isThoughtful && effectiveUserId) {
        try {
          await awardXP({
            userId: effectiveUserId,
            actionType: "story_lesson",
            referenceId: `lit_${chapter.id}_${questionId}`,
            customXp: 20,
          });
        } catch (xpErr) {
          console.warn("Could not award XP in literature route:", xpErr);
        }
      }

      // Save to student progress if DB is available
      if (process.env.DATABASE_URL) {
        try {
          const progressId = `slp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await db
            .insert(studentLiteratureProgress)
            .values({
              id: progressId,
              userId: effectiveUserId,
              chapterId: chapter.id,
              isRead: true,
              criticalThinkingAnswers: { [questionId]: rawAnswer } as any,
              xpAwarded: isThoughtful ? 20 : 0,
            })
            .onConflictDoUpdate({
              target: [studentLiteratureProgress.userId, studentLiteratureProgress.chapterId],
              set: {
                isRead: true,
                criticalThinkingAnswers: sql`jsonb_set(coalesce(critical_thinking_answers, '{}'::jsonb), ${sql.raw(`'{${questionId}}'`)}, ${JSON.stringify(rawAnswer)}::jsonb)`,
                updatedAt: sql`NOW()`,
              },
            });
        } catch (progErr) {
          console.warn("Could not upsert student literature progress:", progErr);
        }
      }

      return NextResponse.json({
        success: true,
        action: "submit_critical_thinking",
        questionId,
        score,
        isApproved: isThoughtful,
        modelAnswerEn: targetQ.model_answer_en,
        explanationAr: targetQ.explanation_ar,
        keyPoints: targetQ.key_points,
        xpAwarded: isThoughtful ? 20 : 0,
        feedback: isThoughtful
          ? "تحليل متميز وإجابة شاملة مطابقة لمعايير أسئلة التفكير النقدي بالثانوية العامة! 🌟"
          : "محاولة جيدة، ولكن يفضل التوسع في الإجابة وتضمين النقاط المحورية الاسترشادية المدونة أدناه. 🎯",
      });
    }

    // 3. Handle Mark as Read / Audio Complete
    if (action === "save_progress") {
      if (process.env.DATABASE_URL) {
        try {
          const progressId = `slp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await db
            .insert(studentLiteratureProgress)
            .values({
              id: progressId,
              userId: effectiveUserId,
              chapterId: chapter.id,
              isRead: Boolean(isRead),
              audioCompleted: Boolean(audioCompleted),
            })
            .onConflictDoUpdate({
              target: [studentLiteratureProgress.userId, studentLiteratureProgress.chapterId],
              set: {
                isRead: isRead !== undefined ? isRead : sql`is_read`,
                audioCompleted: audioCompleted !== undefined ? audioCompleted : sql`audio_completed`,
                updatedAt: sql`NOW()`,
              },
            });
        } catch (e) {
          console.warn("Could not save literature reading progress:", e);
        }
      }

      return NextResponse.json({
        success: true,
        action: "save_progress",
        chapterId: chapter.id,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/literature/chapters error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
