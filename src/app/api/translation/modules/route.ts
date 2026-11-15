import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  translationModules,
  translationLessons,
  translationQuestions,
  translationStudentProgress,
  translationExams,
} from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";
import { eq, asc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade") || "First Secondary";
    const term = searchParams.get("term") || "First Term";
    const moduleId = searchParams.get("moduleId");

    // Fetch modules
    let modulesQuery = db
      .select()
      .from(translationModules)
      .where(eq(translationModules.grade, grade))
      .orderBy(asc(translationModules.orderIndex));

    const modules = await modulesQuery;

    // Fetch all lessons for these modules
    const lessons = await db
      .select()
      .from(translationLessons)
      .orderBy(asc(translationLessons.orderIndex));

    // Fetch all questions
    const questions = await db.select().from(translationQuestions);

    // Fetch exams
    const exams = await db.select().from(translationExams);

    // Fetch student progress if logged in
    let studentProgressMap: Record<string, any> = {};
    if (ctx?.user?.id) {
      const prog = await db
        .select()
        .from(translationStudentProgress)
        .where(eq(translationStudentProgress.studentId, ctx.user.id));
      for (const p of prog) {
        studentProgressMap[p.lessonId] = p;
      }
    }

    // Structure the nested data
    const structuredModules = modules.map((m) => {
      const moduleLessons = lessons
        .filter((l) => l.moduleId === m.id)
        .map((l) => {
          const lessonQuestions = questions.filter((q) => q.lessonId === l.id);
          const progress = studentProgressMap[l.id] || null;

          return {
            ...l,
            questionsCount: lessonQuestions.length,
            questions: lessonQuestions,
            progress,
          };
        });

      const moduleExams = exams.filter((e) => e.moduleId === m.id);

      return {
        ...m,
        lessons: moduleLessons,
        exams: moduleExams,
      };
    });

    return NextResponse.json({
      success: true,
      modules: structuredModules,
      userRole: ctx?.user?.role || "guest",
    });
  } catch (error: any) {
    console.error("Translation Modules GET Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch translation modules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { action } = body;

    // Admin/Teacher: Create or update a lesson
    if (action === "save_lesson") {
      const {
        id,
        moduleId,
        orderIndex,
        titleAr,
        titleEn,
        summaryAr,
        summaryEn,
        videoUrl,
        videoDuration,
        pdfUrl,
        rules,
        vocabulary,
        solvedExamples,
        commonMistakes,
        isPublished,
      } = body.lesson;

      const lessonId = id || `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const existing = await db
        .select()
        .from(translationLessons)
        .where(eq(translationLessons.id, lessonId));

      if (existing.length > 0) {
        await db
          .update(translationLessons)
          .set({
            orderIndex: orderIndex || 1,
            titleAr,
            titleEn,
            summaryAr,
            summaryEn,
            videoUrl,
            videoDuration: videoDuration || "15 mins",
            pdfUrl,
            rules: rules || [],
            vocabulary: vocabulary || [],
            solvedExamples: solvedExamples || [],
            commonMistakes: commonMistakes || [],
            isPublished: isPublished !== false,
          })
          .where(eq(translationLessons.id, lessonId));
      } else {
        await db.insert(translationLessons).values({
          id: lessonId,
          moduleId,
          orderIndex: orderIndex || 1,
          titleAr,
          titleEn,
          summaryAr,
          summaryEn,
          videoUrl,
          videoDuration: videoDuration || "15 mins",
          pdfUrl,
          rules: rules || [],
          vocabulary: vocabulary || [],
          solvedExamples: solvedExamples || [],
          commonMistakes: commonMistakes || [],
          isPublished: isPublished !== false,
        });
      }

      return NextResponse.json({ success: true, lessonId });
    }

    // Admin/Teacher: Create or update a question
    if (action === "save_question") {
      const {
        id,
        lessonId,
        moduleId,
        questionType,
        questionText,
        instructions,
        options,
        correctAnswer,
        alternativeAnswers,
        explanation,
        marks,
        difficulty,
        topic,
        source,
        audioUrl,
        isPublished,
      } = body.question;

      const questionId = id || `tq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const existing = await db
        .select()
        .from(translationQuestions)
        .where(eq(translationQuestions.id, questionId));

      if (existing.length > 0) {
        await db
          .update(translationQuestions)
          .set({
            questionType,
            questionText,
            instructions: instructions || "Translate accurately",
            options: options || [],
            correctAnswer,
            alternativeAnswers: alternativeAnswers || [],
            explanation: explanation || "",
            marks: marks || 1,
            difficulty: difficulty || "Medium",
            topic: topic || "",
            source: source || "Professional Academy",
            audioUrl: audioUrl || null,
            isPublished: isPublished !== false,
          })
          .where(eq(translationQuestions.id, questionId));
      } else {
        await db.insert(translationQuestions).values({
          id: questionId,
          lessonId,
          moduleId,
          questionType,
          questionText,
          instructions: instructions || "Translate accurately",
          options: options || [],
          correctAnswer,
          alternativeAnswers: alternativeAnswers || [],
          explanation: explanation || "",
          marks: marks || 1,
          difficulty: difficulty || "Medium",
          topic: topic || "",
          source: source || "Professional Academy",
          audioUrl: audioUrl || null,
          isPublished: isPublished !== false,
        });
      }

      return NextResponse.json({ success: true, questionId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Translation Modules POST Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to save translation content" }, { status: 500 });
  }
}
