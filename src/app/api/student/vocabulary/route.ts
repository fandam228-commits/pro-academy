import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentSavedVocabulary, users } from "@/db/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

// =========================================================================
// GET: Fetch student's personal saved vocabulary (strictly isolated to user)
// =========================================================================
export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("search") || "").trim();
  const unitId = searchParams.get("unitId");
  const gradeId = searchParams.get("gradeId");

  try {
    const studentId = ctx.user.id;

    const conditions = [eq(studentSavedVocabulary.studentId, studentId)];

    if (unitId && unitId !== "all") {
      conditions.push(eq(studentSavedVocabulary.unitId, unitId));
    }
    if (gradeId && gradeId !== "all") {
      conditions.push(eq(studentSavedVocabulary.gradeId, gradeId));
    }
    if (search) {
      conditions.push(
        or(
          ilike(studentSavedVocabulary.word, `%${search}%`),
          ilike(studentSavedVocabulary.arabicMeaning, `%${search}%`),
          ilike(studentSavedVocabulary.exampleSentence, `%${search}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(studentSavedVocabulary)
      .where(and(...conditions))
      .orderBy(desc(studentSavedVocabulary.createdAt));

    return NextResponse.json({
      success: true,
      savedWords: rows,
      totalCount: rows.length,
    });
  } catch (error) {
    console.error("Fetch Saved Vocabulary Error:", error);
    return NextResponse.json({ error: "Failed to fetch saved vocabulary." }, { status: 500 });
  }
}

// =========================================================================
// POST: Save a new word to My Vocabulary (prevents duplicates per unit)
// =========================================================================
export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      word,
      arabicMeaning,
      partOfSpeech,
      ipaUk,
      ipaUs,
      exampleSentence,
      unitId,
      gradeId,
      notes,
    } = body;

    const trimmedWord = (word || "").trim();
    if (!trimmedWord) {
      return NextResponse.json({ error: "Word is required." }, { status: 400 });
    }

    const studentId = ctx.user.id;

    // Duplicate check: Prevent duplicate word for this student in the same unit
    const existing = await db
      .select()
      .from(studentSavedVocabulary)
      .where(
        and(
          eq(studentSavedVocabulary.studentId, studentId),
          ilike(studentSavedVocabulary.word, trimmedWord),
          unitId ? eq(studentSavedVocabulary.unitId, unitId) : eq(studentSavedVocabulary.word, trimmedWord)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "هذه الكلمة محفوظة بالفعل في قائمة مفرداتك لهذه الوحدة.",
          isDuplicate: true,
          existingWord: existing[0],
        },
        { status: 409 }
      );
    }

    const newId = `ssv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const [saved] = await db
      .insert(studentSavedVocabulary)
      .values({
        id: newId,
        studentId,
        word: trimmedWord,
        arabicMeaning: (arabicMeaning || "").trim() || null,
        partOfSpeech: (partOfSpeech || "").trim() || null,
        ipaUk: (ipaUk || "").trim() || null,
        ipaUs: (ipaUs || "").trim() || null,
        exampleSentence: (exampleSentence || "").trim() || null,
        unitId: unitId || null,
        gradeId: gradeId || null,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "تم حفظ الكلمة بنجاح في قائمة مفرداتك.",
      savedWord: saved,
    });
  } catch (error) {
    console.error("Save Word Error:", error);
    return NextResponse.json({ error: "Failed to save word." }, { status: 500 });
  }
}

// =========================================================================
// DELETE: Remove word from My Vocabulary (strictly owner only)
// =========================================================================
export async function DELETE(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Word ID is required." }, { status: 400 });
    }

    const studentId = ctx.user.id;

    // Verify ownership
    const found = await db
      .select()
      .from(studentSavedVocabulary)
      .where(and(eq(studentSavedVocabulary.id, id), eq(studentSavedVocabulary.studentId, studentId)));

    if (found.length === 0) {
      return NextResponse.json({ error: "Word not found or unauthorized." }, { status: 404 });
    }

    await db
      .delete(studentSavedVocabulary)
      .where(and(eq(studentSavedVocabulary.id, id), eq(studentSavedVocabulary.studentId, studentId)));

    return NextResponse.json({
      success: true,
      message: "تم حذف الكلمة من قائمتك بنجاح.",
    });
  } catch (error) {
    console.error("Delete Word Error:", error);
    return NextResponse.json({ error: "Failed to delete word." }, { status: 500 });
  }
}
