import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  curriculumAnalysisJobs,
  analyzedCurriculumQuestions,
  analyzedCurriculumQuizzes,
  users,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import {
  executeCurriculumAnalysisPipeline,
  CurriculumAnalysisSummary,
  AnalysisCheckpoint,
} from "@/lib/curriculum-analyzer-engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !["admin", "teacher"].includes(ctx.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized. Teacher or Admin access required." },
      { status: 401 }
    );
  }

  try {
    const jobs = await db
      .select()
      .from(curriculumAnalysisJobs)
      .orderBy(desc(curriculumAnalysisJobs.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Curriculum Analyzer GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !["admin", "teacher"].includes(ctx.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized. Teacher or Admin access required." },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let fileName = "curriculum-memo.txt";
    let fileType = "txt";
    let bufferOrText: Buffer | string = "";
    let gradeCode = "sec_3";
    let stage = "Secondary";
    let term = "First";
    let questionsPerLesson = 20;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      bufferOrText = Buffer.from(arrayBuffer);

      if (fileName.endsWith(".pdf")) fileType = "pdf";
      else if (fileName.endsWith(".docx")) fileType = "docx";
      else fileType = "txt";

      if (formData.has("gradeCode")) gradeCode = String(formData.get("gradeCode"));
      if (formData.has("stage")) stage = String(formData.get("stage"));
      if (formData.has("term")) term = String(formData.get("term"));
      if (formData.has("questionsPerLesson")) {
        questionsPerLesson = parseInt(String(formData.get("questionsPerLesson")), 10) || 20;
      }
    } else {
      // JSON body
      const body = await req.json();
      fileName = body.fileName || "curriculum_booklet.txt";
      fileType = body.fileType || (fileName.endsWith(".pdf") ? "pdf" : fileName.endsWith(".docx") ? "docx" : "txt");
      gradeCode = body.gradeCode || "sec_3";
      stage = body.stage || "Secondary";
      term = body.term || "First";
      questionsPerLesson = body.questionsPerLesson || 20;

      if (body.fileData) {
        // Base64 encoded or string
        if (body.fileData.startsWith("data:") || body.isBase64) {
          const base64Data = body.fileData.replace(/^data:[^;]+;base64,/, "");
          bufferOrText = Buffer.from(base64Data, "base64");
        } else {
          bufferOrText = body.fileData;
        }
      } else if (body.content) {
        bufferOrText = body.content;
      } else {
        return NextResponse.json(
          { error: "Missing document content or fileData" },
          { status: 400 }
        );
      }
    }

    const jobId = `job_ana_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create Job record in database
    await db.insert(curriculumAnalysisJobs).values({
      id: jobId,
      teacherId: ctx.user.id,
      fileName,
      fileType,
      fileSize: typeof bufferOrText === "string" ? bufferOrText.length : bufferOrText.length,
      gradeCode,
      stage,
      term,
      status: "extracting_text",
      currentStep: "Analyzing Document Structure & Questions",
      progressPercent: 10,
      questionsPerLesson,
      checkpointData: {},
      summaryReport: {},
    });

    // 2. Execute Full Analysis Pipeline
    const pipelineResult = await executeCurriculumAnalysisPipeline({
      jobId,
      bufferOrText,
      fileType,
      fileName,
      questionsPerLesson,
    });

    const cp = pipelineResult.checkpoint;
    const summary = pipelineResult.summary;

    // 3. Batch insert extracted and generated questions (marked as pending approval)
    const allQuestions = [...(cp.originalQuestions || []), ...(cp.generatedQuestions || [])];
    if (allQuestions.length > 0) {
      // Chunk inserts in batches of 50 to avoid PostgreSQL parameter overflow
      const chunkSize = 50;
      for (let i = 0; i < allQuestions.length; i += chunkSize) {
        const chunk = allQuestions.slice(i, i + chunkSize);
        await db.insert(analyzedCurriculumQuestions).values(
          chunk.map((q) => ({
            id: q.id,
            jobId,
            sourceType: q.sourceType,
            pageNumber: q.pageNumber,
            unitNumber: q.unitNumber,
            unitTitle: q.unitTitle,
            lessonTitle: q.lessonTitle,
            sectionType: q.sectionType,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            sourceReference: q.sourceReference,
            approvalStatus: "pending",
            isPublished: false,
          }))
        );
      }
    }

    // 4. Batch insert assembled quizzes (marked as pending approval)
    const allQuizzes = cp.quizzes || [];
    if (allQuizzes.length > 0) {
      await db.insert(analyzedCurriculumQuizzes).values(
        allQuizzes.map((qz) => ({
          id: qz.id,
          jobId,
          quizType: qz.quizType,
          titleAr: qz.titleAr,
          titleEn: qz.titleEn,
          unitNumber: qz.unitNumber,
          unitsCovered: qz.unitsCovered,
          lessonTitle: qz.lessonTitle,
          questionIds: qz.questionIds,
          durationMinutes: qz.durationMinutes,
          passPercentage: qz.passPercentage,
          totalPoints: qz.totalPoints,
          approvalStatus: "pending",
          isPublished: false,
        }))
      );
    }

    // 5. Update Job status to completed with Summary Report & Checkpoint
    await db
      .update(curriculumAnalysisJobs)
      .set({
        status: "completed",
        currentStep: "Analysis Completed Successfully",
        progressPercent: 100,
        checkpointData: {
          unitsCount: (cp.units || []).length,
          units: cp.units,
          warnings: cp.warnings,
        },
        summaryReport: summary,
        updatedAt: new Date(),
      })
      .where(eq(curriculumAnalysisJobs.id, jobId));

    return NextResponse.json({
      success: true,
      jobId,
      status: "completed",
      summary,
      units: cp.units,
      totalOriginalQuestions: summary.totalOriginalQuestions,
      totalAiQuestions: summary.totalAiQuestions,
      totalQuizzes: summary.totalQuizzes,
    });
  } catch (error: any) {
    console.error("Curriculum Analyzer POST execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze curriculum document" },
      { status: 500 }
    );
  }
}
