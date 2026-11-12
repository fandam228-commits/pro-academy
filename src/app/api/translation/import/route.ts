import { NextResponse } from "next/server";
import { db } from "@/db";
import { translationQuestions, translationLessons } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { eq } from "drizzle-orm";

interface RawImportRow {
  questionType: string;
  questionText: string;
  instructions?: string;
  options?: string; // e.g. "Option A | Option B | Option C | Option D"
  correctAnswer: string;
  alternativeAnswers?: string; // separated by ; or |
  explanation?: string;
  marks?: number | string;
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
  source?: string;
  lessonId: string;
  moduleId: string;
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { questions, defaultLessonId, defaultModuleId } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions provided in import payload." }, { status: 400 });
    }

    const inserted: any[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    // Fetch existing questions to check duplicates by questionText
    const existing = await db.select({ id: translationQuestions.id, text: translationQuestions.questionText }).from(translationQuestions);
    const existingTexts = new Set(existing.map((e) => e.text.trim().toLowerCase()));

    for (let i = 0; i < questions.length; i++) {
      const row: RawImportRow = questions[i];
      const lineNum = i + 1;

      if (!row.questionText || !row.correctAnswer) {
        errors.push(`Row ${lineNum}: Missing questionText or correctAnswer.`);
        continue;
      }

      const cleanText = row.questionText.trim();
      if (existingTexts.has(cleanText.toLowerCase())) {
        duplicates.push(`Row ${lineNum}: Question already exists in bank ("${cleanText.slice(0, 40)}...")`);
        continue;
      }

      const lessonId = row.lessonId || defaultLessonId;
      const moduleId = row.moduleId || defaultModuleId;

      if (!lessonId || !moduleId) {
        errors.push(`Row ${lineNum}: Missing lessonId or moduleId.`);
        continue;
      }

      // Parse options if provided
      let parsedOptions: any = [];
      if (typeof row.options === "string") {
        parsedOptions = row.options.split(/[|,]/).map((o) => o.trim()).filter(Boolean);
      } else if (Array.isArray(row.options)) {
        parsedOptions = row.options;
      }

      // Parse alternative answers
      let parsedAlternatives: string[] = [];
      if (typeof row.alternativeAnswers === "string") {
        parsedAlternatives = row.alternativeAnswers.split(/[;|]/).map((a) => a.trim()).filter(Boolean);
      } else if (Array.isArray(row.alternativeAnswers)) {
        parsedAlternatives = row.alternativeAnswers;
      }

      const qId = `tq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`;

      const newQ = {
        id: qId,
        lessonId,
        moduleId,
        questionType: row.questionType || "ar_to_en_text",
        questionText: cleanText,
        instructions: row.instructions || "Translate accurately",
        options: parsedOptions,
        correctAnswer: row.correctAnswer.trim(),
        alternativeAnswers: parsedAlternatives,
        explanation: row.explanation || "Model translation explanation.",
        marks: Number(row.marks) || 2,
        difficulty: (["Easy", "Medium", "Hard"].includes(row.difficulty as string) ? row.difficulty : "Medium") as any,
        topic: row.topic || "General Translation",
        source: row.source || "Bulk Import",
        isPublished: true,
      };

      await db.insert(translationQuestions).values(newQ);
      existingTexts.add(cleanText.toLowerCase());
      inserted.push(newQ);
    }

    return NextResponse.json({
      success: true,
      totalReceived: questions.length,
      importedCount: inserted.length,
      duplicateCount: duplicates.length,
      errorCount: errors.length,
      duplicates,
      errors,
    });
  } catch (error: any) {
    console.error("Translation Import Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to import translation questions" }, { status: 500 });
  }
}
