import { NextResponse } from "next/server";
import { db } from "@/db";
import { translationExercises } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { eq, and } from "drizzle-orm";
import { INTERACTIVE_TRANSLATION_SEEDS } from "@/data/interactive-translation-seed";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get("grade_level");
    const direction = searchParams.get("direction");
    const exerciseType = searchParams.get("exercise_type");

    let exercises: any[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const conditions: any[] = [];
        if (gradeLevel && gradeLevel !== "all") {
          conditions.push(eq(translationExercises.gradeLevel, gradeLevel));
        }
        if (direction && direction !== "all") {
          conditions.push(eq(translationExercises.direction, direction));
        }
        if (exerciseType && exerciseType !== "all") {
          conditions.push(eq(translationExercises.exerciseType, exerciseType));
        }

        exercises = await db
          .select()
          .from(translationExercises)
          .where(conditions.length > 0 ? and(...conditions) : undefined);
      } catch (dbErr) {
        console.warn("DB query failed in admin translation GET, using fallback:", dbErr);
      }
    }

    if (exercises.length === 0) {
      exercises = INTERACTIVE_TRANSLATION_SEEDS.filter((ex) => {
        if (gradeLevel && gradeLevel !== "all" && ex.gradeLevel !== gradeLevel) return false;
        if (direction && direction !== "all" && ex.direction !== direction) return false;
        if (exerciseType && exerciseType !== "all" && ex.exerciseType !== exerciseType) return false;
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      count: exercises.length,
      exercises,
    });
  } catch (err: any) {
    console.error("GET /api/admin/translation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const {
      gradeLevel = "3rd_sec",
      direction = "en_to_ar",
      exerciseType = "written",
      difficulty = "standard",
      sourceText,
      modelAnswer,
      alternativeAnswers = [],
      keyVocabulary = [],
      mcqOptions = null,
      grammarTip = "",
    } = body;

    if (!sourceText || !modelAnswer) {
      return NextResponse.json(
        { error: "sourceText and modelAnswer are required" },
        { status: 400 }
      );
    }

    const id = `tex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord = {
      id,
      gradeLevel,
      direction,
      exerciseType,
      difficulty,
      sourceText: String(sourceText).trim(),
      modelAnswer: String(modelAnswer).trim(),
      alternativeAnswers: Array.isArray(alternativeAnswers) ? alternativeAnswers : [],
      keyVocabulary: Array.isArray(keyVocabulary) ? keyVocabulary : [],
      mcqOptions: mcqOptions ? mcqOptions : null,
      grammarTip: grammarTip ? String(grammarTip).trim() : null,
    };

    if (process.env.DATABASE_URL) {
      await db.insert(translationExercises).values(newRecord as any);
    }

    return NextResponse.json({
      success: true,
      exercise: newRecord,
    });
  } catch (err: any) {
    console.error("POST /api/admin/translation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Exercise ID is required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await db.delete(translationExercises).where(eq(translationExercises.id, id));
    }

    return NextResponse.json({
      success: true,
      id,
      message: "Exercise deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/translation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
