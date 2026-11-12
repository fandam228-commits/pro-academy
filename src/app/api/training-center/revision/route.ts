import { db } from "@/db";
import {
  trainingQuestions,
  trainingBookmarks,
  trainingRevisionQueue,
} from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const auth = await getAuthContext(req);
    const currentUser = auth?.user;

    const studentId = currentUser?.id || searchParams.get("studentId");
    const type = searchParams.get("type") || "mistakes"; // 'mistakes' | 'bookmarks'

    if (!studentId) {
      return NextResponse.json({ success: true, items: [] });
    }

    if (type === "bookmarks") {
      const bookmarks = await db
        .select()
        .from(trainingBookmarks)
        .where(eq(trainingBookmarks.studentId, studentId))
        .orderBy(desc(trainingBookmarks.createdAt));

      if (bookmarks.length === 0) {
        return NextResponse.json({ success: true, items: [] });
      }

      const qIds = bookmarks.map((b) => b.questionId);
      const questions = await db
        .select()
        .from(trainingQuestions)
        .where(inArray(trainingQuestions.id, qIds));

      const qMap = new Map(questions.map((q) => [q.id, q]));
      const items = bookmarks.map((b) => ({
        bookmarkId: b.id,
        notes: b.notes,
        createdAt: b.createdAt,
        question: qMap.get(b.questionId) || null,
      })).filter((i) => i.question !== null);

      return NextResponse.json({ success: true, items });
    }

    // Default: 'mistakes'
    const mistakes = await db
      .select()
      .from(trainingRevisionQueue)
      .where(
        and(
          eq(trainingRevisionQueue.studentId, studentId),
          eq(trainingRevisionQueue.resolved, false)
        )
      )
      .orderBy(desc(trainingRevisionQueue.lastMistakeAt));

    if (mistakes.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    const qIds = mistakes.map((m) => m.questionId);
    const questions = await db
      .select()
      .from(trainingQuestions)
      .where(inArray(trainingQuestions.id, qIds));

    const qMap = new Map(questions.map((q) => [q.id, q]));
    const items = mistakes.map((m) => ({
      mistakeId: m.id,
      mistakeCount: m.mistakeCount,
      lastMistakeAt: m.lastMistakeAt,
      question: qMap.get(m.questionId) || null,
    })).filter((i) => i.question !== null);

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("GET /api/training-center/revision error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load revision items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    const currentUser = auth?.user;
    const body = await req.json();
    const { action } = body;

    const studentId = currentUser?.id || body.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (action === "toggle_bookmark") {
      const { questionId, notes = "" } = body;
      if (!questionId) {
        return NextResponse.json({ success: false, error: "Question ID required" }, { status: 400 });
      }

      const existing = await db
        .select()
        .from(trainingBookmarks)
        .where(
          and(
            eq(trainingBookmarks.studentId, studentId),
            eq(trainingBookmarks.questionId, questionId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db.delete(trainingBookmarks).where(eq(trainingBookmarks.id, existing[0].id));
        return NextResponse.json({ success: true, isBookmarked: false, message: "Bookmark removed." });
      } else {
        const id = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(trainingBookmarks).values({
          id,
          studentId,
          questionId,
          notes,
        });
        return NextResponse.json({ success: true, isBookmarked: true, message: "Question saved to bookmarks." });
      }
    }

    if (action === "resolve_mistake") {
      const { questionId } = body;
      if (!questionId) {
        return NextResponse.json({ success: false, error: "Question ID required" }, { status: 400 });
      }

      await db
        .update(trainingRevisionQueue)
        .set({
          resolved: true,
          resolvedAt: new Date(),
        })
        .where(
          and(
            eq(trainingRevisionQueue.studentId, studentId),
            eq(trainingRevisionQueue.questionId, questionId)
          )
        );

      return NextResponse.json({ success: true, message: "Mistake marked as resolved." });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/training-center/revision error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process revision action" },
      { status: 500 }
    );
  }
}
