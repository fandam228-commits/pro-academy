import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionBank } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { eq, and, sql, ilike } from "drizzle-orm";
import QUESTION_BANK_2027_MASTER from "@/data/question-bank-2027-master.json";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const domainCategory = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let questions: any[] = [];
    let totalCount = 0;

    if (process.env.DATABASE_URL) {
      try {
        const conditions: any[] = [];
        if (grade && grade !== "all") {
          conditions.push(eq(questionBank.grade, grade));
        }
        if (domainCategory && domainCategory !== "all") {
          conditions.push(eq(questionBank.domainCategory, domainCategory));
        }
        if (search && search.trim()) {
          const term = `%${search.trim().toLowerCase()}%`;
          conditions.push(
            sql`LOWER(${questionBank.questionText}) LIKE ${term} OR LOWER(${questionBank.topic}) LIKE ${term}`
          );
        }

        const countRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(questionBank)
          .where(conditions.length > 0 ? and(...conditions) : undefined);
        totalCount = Number(countRes[0]?.count) || 0;

        questions = await db
          .select()
          .from(questionBank)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(limit)
          .offset(offset);
      } catch (dbErr) {
        console.warn("DB query in admin questions GET failed, fallback to master data:", dbErr);
      }
    }

    if (questions.length === 0) {
      let filtered = (QUESTION_BANK_2027_MASTER as any[]) || [];
      if (grade && grade !== "all") {
        filtered = filtered.filter((q) => q.grade === grade);
      }
      if (domainCategory && domainCategory !== "all") {
        filtered = filtered.filter((q) => q.domainCategory === domainCategory);
      }
      if (search && search.trim()) {
        const st = search.trim().toLowerCase();
        filtered = filtered.filter(
          (q) =>
            (q.questionText || "").toLowerCase().includes(st) ||
            (q.topic || "").toLowerCase().includes(st)
        );
      }
      totalCount = filtered.length;
      questions = filtered.slice(offset, offset + limit);
    }

    return NextResponse.json({
      success: true,
      totalCount,
      limit,
      offset,
      questions,
    });
  } catch (err: any) {
    console.error("GET /api/admin/questions error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { action = "create_single", question, questions } = body;

    // 1. Bulk Insert
    if (action === "bulk_insert") {
      const qList = Array.isArray(questions) ? questions : [];
      if (qList.length === 0) {
        return NextResponse.json({ error: "Questions array is required for bulk insert" }, { status: 400 });
      }

      const insertedIds: string[] = [];
      for (const item of qList) {
        const id = item.id || `qb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const record = {
          id,
          questionText: String(item.questionText || "").trim(),
          domainCategory: item.domainCategory || "Grammar",
          questionType: item.questionType || "mcq",
          stage: item.stage || "Secondary",
          grade: item.grade || "Third Secondary (Baccalaureate)",
          topic: item.topic || "General Topic",
          unit: item.unit || "Unit 1",
          difficulty: item.difficulty || "Medium",
          options: Array.isArray(item.options) ? item.options : ["A", "B", "C", "D"],
          correctAnswer: String(item.correctAnswer || item.options?.[0] || "").trim(),
          explanation: item.explanation || "",
          points: item.points ? Number(item.points) : 10,
        };

        if (process.env.DATABASE_URL) {
          try {
            await db.insert(questionBank).values(record as any).onConflictDoNothing();
          } catch (e) {
            console.warn("Could not insert bulk question:", e);
          }
        }
        insertedIds.push(id);
      }

      return NextResponse.json({
        success: true,
        action: "bulk_insert",
        insertedCount: insertedIds.length,
        insertedIds,
      });
    }

    // 2. Single Question Insert
    if (!question || !question.questionText || !question.correctAnswer) {
      return NextResponse.json(
        { error: "questionText and correctAnswer are required" },
        { status: 400 }
      );
    }

    const newId = question.id || `qb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id: newId,
      questionText: String(question.questionText).trim(),
      domainCategory: question.domainCategory || "Grammar",
      questionType: question.questionType || "mcq",
      stage: question.stage || "Secondary",
      grade: question.grade || "Third Secondary (Baccalaureate)",
      topic: question.topic || "General Topic",
      unit: question.unit || "Unit 1",
      difficulty: question.difficulty || "Medium",
      options: Array.isArray(question.options) ? question.options : [],
      correctAnswer: String(question.correctAnswer).trim(),
      explanation: question.explanation || "",
      points: question.points ? Number(question.points) : 10,
    };

    if (process.env.DATABASE_URL) {
      await db.insert(questionBank).values(record as any);
    }

    return NextResponse.json({
      success: true,
      action: "create_single",
      question: record,
    });
  } catch (err: any) {
    console.error("POST /api/admin/questions error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await ensureDbSetup();
    const { denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const { id, ...updatedFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await db
        .update(questionBank)
        .set({
          ...updatedFields,
          options: updatedFields.options ? (updatedFields.options as any) : undefined,
        })
        .where(eq(questionBank.id, id));
    }

    return NextResponse.json({
      success: true,
      id,
      message: "Question updated successfully",
    });
  } catch (err: any) {
    console.error("PUT /api/admin/questions error:", err);
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
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await db.delete(questionBank).where(eq(questionBank.id, id));
    }

    return NextResponse.json({
      success: true,
      id,
      message: "Question deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/questions error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
