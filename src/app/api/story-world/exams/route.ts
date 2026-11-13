import { NextResponse } from "next/server";
import { getChapterById, ALL_CURRICULUM_STORIES } from "@/data/story-world";
import { getAuthContext } from "@/lib/security";
import { createExamAttemptSession, gradeExamAttempt } from "@/lib/smart-shuffle-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const gradeId = searchParams.get("gradeId");

    let questions: any[] = [];

    // Fallback static lookup first
    if (chapterId) {
      const lookup = getChapterById(chapterId);
      if (lookup) {
        const ch = lookup.chapter;
        if (Array.isArray(ch.mcqQuestions) && ch.mcqQuestions.length > 0) {
          questions = ch.mcqQuestions.map((q, idx) => ({
            id: `sq_${ch.id}_${idx + 1}`,
            questionNumber: idx + 1,
            questionText: q.question,
            options: q.options,
            correctAnswer: q.options[q.correctIndex] || q.options[0],
            explanation: q.explanationAr || "تحليل الإجابة الصحيحة من سياق القصة المقررة.",
            topic: ch.titleEn,
            difficulty: "Medium",
          }));
        }
      }
    }

    if (questions.length === 0 && process.env.DATABASE_URL) {
      try {
        const { db } = await import("@/db");
        const { storyChapters } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");

        if (chapterId) {
          const chRows = await db
            .select()
            .from(storyChapters)
            .where(eq(storyChapters.id, chapterId))
            .limit(1);

          if (chRows.length > 0 && Array.isArray(chRows[0].mcqQuestions)) {
            questions = (chRows[0].mcqQuestions as any[]).map((q, idx) => ({
              id: `sq_${chRows[0].id}_${idx + 1}`,
              questionNumber: idx + 1,
              questionText: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer || q.options?.[0],
              explanation: q.explanation || "Story comprehension analysis",
              topic: chRows[0].titleEn,
              difficulty: "Medium",
            }));
          }
        } else if (gradeId) {
          const allGradeChapters = await db
            .select()
            .from(storyChapters)
            .where(eq(storyChapters.gradeId, gradeId));

          for (const ch of allGradeChapters) {
            if (Array.isArray(ch.mcqQuestions)) {
              (ch.mcqQuestions as any[]).forEach((q, idx) => {
                questions.push({
                  id: `sq_${ch.id}_${idx + 1}`,
                  questionNumber: questions.length + 1,
                  questionText: q.question,
                  options: q.options,
                  correctAnswer: q.correctAnswer || q.options?.[0],
                  explanation: q.explanation || `Comprehension rule for ${ch.titleEn}`,
                  topic: ch.titleEn,
                  difficulty: "Medium",
                });
              });
            }
          }
        }
      } catch (dbErr) {
        console.warn("DB exam lookup error:", dbErr);
      }
    }

    // If still empty, supply questions from all curriculum stories
    if (questions.length === 0) {
      for (const st of ALL_CURRICULUM_STORIES) {
        for (const ch of st.chapters) {
          if (ch.mcqQuestions && ch.mcqQuestions.length > 0) {
            ch.mcqQuestions.forEach((q, idx) => {
              questions.push({
                id: `sq_${ch.id}_${idx + 1}`,
                questionNumber: questions.length + 1,
                questionText: q.question,
                options: q.options,
                correctAnswer: q.options[q.correctIndex] || q.options[0],
                explanation: q.explanationAr || "تحليل الإجابة النموذجية",
                topic: `${st.titleEn} - Ch ${ch.chapterNumber}`,
                difficulty: "Medium",
              });
            });
          }
        }
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No story exam questions available for this selection.",
      }, { status: 400 });
    }

    const session = createExamAttemptSession(questions);

    return NextResponse.json({
      success: true,
      totalQuestions: session.clientQuestions.length,
      questions: session.clientQuestions,
      secretsToken: Buffer.from(JSON.stringify(session.secrets)).toString("base64"),
    });
  } catch (error: any) {
    console.error("GET /api/story-world/exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate story exam" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthContext(req);
    const studentId = auth?.user?.id;
    const { secretsToken, studentAnswers = {}, isFinalExam = false } = await req.json();

    if (!secretsToken) {
      return NextResponse.json(
        { success: false, error: "Missing exam secrets token" },
        { status: 400 }
      );
    }

    const rawSecrets = JSON.parse(Buffer.from(secretsToken, "base64").toString("utf-8"));
    const graded = gradeExamAttempt(rawSecrets, studentAnswers);

    return NextResponse.json({
      success: true,
      ...graded,
      xpEarned: Math.round((graded.percentage || 0) * 1.5),
    });
  } catch (error: any) {
    console.error("POST /api/story-world/exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit exam" },
      { status: 500 }
    );
  }
}
