import { db } from "@/db";
import { trainingQuestions } from "@/db/schema";
import { eq, and, sql, ilike, desc, asc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const isPublishedParam = searchParams.get("published");
    const search = searchParams.get("search");
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const includeAnswers = searchParams.get("includeAnswers") === "true";

    const auth = await getAuthContext(req);
    const currentUser = auth?.user;
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "teacher";

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(trainingQuestions.validationStatus, status));
    }

    if (topic && topic !== "all") {
      conditions.push(eq(trainingQuestions.topic, topic));
    }

    if (difficulty && difficulty !== "all") {
      conditions.push(eq(trainingQuestions.difficulty, difficulty));
    }

    if (isPublishedParam !== null && isPublishedParam !== undefined && isPublishedParam !== "") {
      const boolVal = isPublishedParam === "true";
      conditions.push(eq(trainingQuestions.isPublished, boolVal));
    } else if (!isAdmin) {
      // By default, students can ONLY see published questions
      conditions.push(eq(trainingQuestions.isPublished, true));
    }

    if (search && search.trim()) {
      conditions.push(ilike(trainingQuestions.questionText, `%${search.trim()}%`));
    }

    let query = db.select().from(trainingQuestions).$dynamic();
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const items = await query
      .orderBy(asc(trainingQuestions.originalOrder))
      .limit(limit)
      .offset(offset);

    // Count total matching
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(trainingQuestions)
      .$dynamic();

    const countRes = conditions.length > 0
      ? await countQuery.where(and(...conditions))
      : await countQuery;

    const total = Number(countRes[0]?.count || 0);

    // Sanitize answers if student
    const sanitized = items.map((q) => {
      if (!isAdmin && !includeAnswers) {
        const { correctAnswer, explanation, ...safe } = q;
        return safe;
      }
      return q;
    });

    return NextResponse.json({
      success: true,
      questions: sanitized,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error("GET /api/training-center/questions error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch training questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    const currentUser = auth?.user;
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "teacher";

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Teacher role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "approve") {
      const { questionId, correctAnswer, explanation, notes } = body;
      if (!questionId) {
        return NextResponse.json({ success: false, error: "Question ID required" }, { status: 400 });
      }

      await db
        .update(trainingQuestions)
        .set({
          validationStatus: "ready_for_publication",
          isPublished: true,
          correctAnswer: correctAnswer || undefined,
          explanation: explanation || undefined,
          notes: notes || undefined,
          verifiedBy: currentUser?.name || "Mr. Habib El Rahman",
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(trainingQuestions.id, questionId));

      return NextResponse.json({ success: true, message: "Question approved and published." });
    }

    if (action === "update") {
      const {
        questionId,
        questionText,
        options,
        correctAnswer,
        explanation,
        topic,
        difficulty,
        validationStatus,
        isPublished,
        notes,
      } = body;

      if (!questionId) {
        return NextResponse.json({ success: false, error: "Question ID required" }, { status: 400 });
      }

      const updates: any = {
        updatedAt: new Date(),
      };

      if (questionText !== undefined) updates.questionText = questionText;
      if (options !== undefined) {
        updates.options = options;
        updates.optionsCount = Array.isArray(options) ? options.length : 0;
      }
      if (correctAnswer !== undefined) updates.correctAnswer = correctAnswer;
      if (explanation !== undefined) updates.explanation = explanation;
      if (topic !== undefined) updates.topic = topic;
      if (difficulty !== undefined) updates.difficulty = difficulty;
      if (validationStatus !== undefined) updates.validationStatus = validationStatus;
      if (isPublished !== undefined) updates.isPublished = Boolean(isPublished);
      if (notes !== undefined) updates.notes = notes;

      updates.verifiedBy = currentUser?.name || "Teacher Reviewer";
      updates.verifiedAt = new Date();

      await db.update(trainingQuestions).set(updates).where(eq(trainingQuestions.id, questionId));

      return NextResponse.json({ success: true, message: "Question updated successfully." });
    }

    if (action === "batch_publish") {
      const { questionIds, isPublished = true } = body;
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return NextResponse.json({ success: false, error: "No question IDs provided" }, { status: 400 });
      }

      await db
        .update(trainingQuestions)
        .set({
          isPublished: Boolean(isPublished),
          validationStatus: isPublished ? "ready_for_publication" : "unverified_answer",
          verifiedBy: currentUser?.name || "Admin Batch",
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(trainingQuestions.id, questionIds));

      return NextResponse.json({
        success: true,
        message: `Successfully updated publication status for ${questionIds.length} questions.`,
      });
    }

    if (action === "delete") {
      const { questionId } = body;
      if (!questionId) {
        return NextResponse.json({ success: false, error: "Question ID required" }, { status: 400 });
      }

      await db.delete(trainingQuestions).where(eq(trainingQuestions.id, questionId));
      return NextResponse.json({ success: true, message: "Question deleted successfully." });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/training-center/questions error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process question action" },
      { status: 500 }
    );
  }
}
