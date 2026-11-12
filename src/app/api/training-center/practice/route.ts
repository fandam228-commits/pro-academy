import { db } from "@/db";
import {
  trainingQuestions,
  trainingStudentAttempts,
  trainingRevisionQueue,
  trainingBookmarks,
  users,
} from "@/db/schema";
import { eq, and, sql, notInArray, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);

    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const excludeIdsStr = searchParams.get("excludeIds");
    const excludeIds = excludeIdsStr ? excludeIdsStr.split(",").filter(Boolean) : [];

    const auth = await getAuthContext(req);
    const currentUser = auth?.user;
    const studentId = currentUser?.id || searchParams.get("studentId");

    const conditions = [
      eq(trainingQuestions.isPublished, true),
    ];

    if (topic && topic !== "all") {
      conditions.push(eq(trainingQuestions.topic, topic));
    }

    if (difficulty && difficulty !== "all") {
      conditions.push(eq(trainingQuestions.difficulty, difficulty));
    }

    if (excludeIds.length > 0) {
      conditions.push(notInArray(trainingQuestions.id, excludeIds));
    }

    // Pick random available question using SQL RANDOM()
    const questionResult = await db
      .select({
        id: trainingQuestions.id,
        questionNumber: trainingQuestions.questionNumber,
        originalOrder: trainingQuestions.originalOrder,
        questionText: trainingQuestions.questionText,
        options: trainingQuestions.options,
        category: trainingQuestions.category,
        topic: trainingQuestions.topic,
        difficulty: trainingQuestions.difficulty,
        sourceDocument: trainingQuestions.sourceDocument,
        sourcePage: trainingQuestions.sourcePage,
      })
      .from(trainingQuestions)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (questionResult.length === 0) {
      return NextResponse.json({
        success: true,
        question: null,
        message: "No more practice questions available for selected filters.",
      });
    }

    const question = questionResult[0];

    // Check if bookmarked by student
    let isBookmarked = false;
    if (studentId) {
      const bRes = await db
        .select({ id: trainingBookmarks.id })
        .from(trainingBookmarks)
        .where(
          and(
            eq(trainingBookmarks.studentId, studentId),
            eq(trainingBookmarks.questionId, question.id)
          )
        )
        .limit(1);
      isBookmarked = bRes.length > 0;
    }

    return NextResponse.json({
      success: true,
      question: {
        ...question,
        isBookmarked,
      },
    });
  } catch (error: any) {
    console.error("GET /api/training-center/practice error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load practice question" },
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

    const studentId = currentUser?.id || body.studentId;
    const { questionId, selectedAnswer, timeSpentSeconds = 0 } = body;

    if (!questionId || !selectedAnswer) {
      return NextResponse.json(
        { success: false, error: "Question ID and selected answer are required" },
        { status: 400 }
      );
    }

    // Fetch the true question from database
    const qRes = await db
      .select()
      .from(trainingQuestions)
      .where(eq(trainingQuestions.id, questionId))
      .limit(1);

    if (qRes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const q = qRes[0];
    const normalizedSelected = String(selectedAnswer).trim().toLowerCase();
    const normalizedCorrect = String(q.correctAnswer || "").trim().toLowerCase();

    // Check match: either matching label ('a', 'b', etc.) or exact option text
    let isCorrect = normalizedSelected === normalizedCorrect;
    if (!isCorrect && Array.isArray(q.options)) {
      const matchedOpt = (q.options as any[]).find(
        (o) => String(o.label).toLowerCase() === normalizedCorrect
      );
      if (matchedOpt && String(matchedOpt.text).trim().toLowerCase() === normalizedSelected) {
        isCorrect = true;
      }
    }

    // Update question counters
    await db
      .update(trainingQuestions)
      .set({
        timesPracticed: sql`${trainingQuestions.timesPracticed} + 1`,
        timesCorrect: isCorrect
          ? sql`${trainingQuestions.timesCorrect} + 1`
          : sql`${trainingQuestions.timesCorrect}`,
      })
      .where(eq(trainingQuestions.id, questionId));

    // Log attempt if student is authenticated
    if (studentId) {
      const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(trainingStudentAttempts).values({
        id: attemptId,
        studentId,
        questionId,
        selectedAnswer: String(selectedAnswer),
        isCorrect,
        attemptType: "practice",
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
      });

      // Update student points / streak
      if (isCorrect) {
        await db
          .update(users)
          .set({
            points: sql`${users.points} + 5`,
          })
          .where(eq(users.id, studentId));
      }

      // Handle Revision Queue (mistakes tracking)
      const existingMistake = await db
        .select()
        .from(trainingRevisionQueue)
        .where(
          and(
            eq(trainingRevisionQueue.studentId, studentId),
            eq(trainingRevisionQueue.questionId, questionId)
          )
        )
        .limit(1);

      if (!isCorrect) {
        if (existingMistake.length > 0) {
          await db
            .update(trainingRevisionQueue)
            .set({
              mistakeCount: sql`${trainingRevisionQueue.mistakeCount} + 1`,
              lastMistakeAt: new Date(),
              resolved: false,
              resolvedAt: null,
            })
            .where(eq(trainingRevisionQueue.id, existingMistake[0].id));
        } else {
          await db.insert(trainingRevisionQueue).values({
            id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            studentId,
            questionId,
            mistakeCount: 1,
            lastMistakeAt: new Date(),
            resolved: false,
          });
        }
      } else if (existingMistake.length > 0) {
        // Solved correctly after previous mistake!
        await db
          .update(trainingRevisionQueue)
          .set({
            resolved: true,
            resolvedAt: new Date(),
          })
          .where(eq(trainingRevisionQueue.id, existingMistake[0].id));
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || `Grammar rule: ${q.topic}`,
      topic: q.topic,
      difficulty: q.difficulty,
    });
  } catch (error: any) {
    console.error("POST /api/training-center/practice error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify answer" },
      { status: 500 }
    );
  }
}
