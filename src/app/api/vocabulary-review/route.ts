import { db } from "@/db";
import { questionBank } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const REVIEW_BATCH_SIZE = 10;

async function ensureReviewTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS student_vocabulary_reviews (
      student_id TEXT NOT NULL,
      question_id TEXT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
      repetitions INTEGER NOT NULL DEFAULT 0,
      interval_days INTEGER NOT NULL DEFAULT 0,
      last_rating TEXT,
      last_reviewed_at TIMESTAMP,
      next_review_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, question_id)
    );
    CREATE INDEX IF NOT EXISTS idx_student_vocabulary_reviews_due
      ON student_vocabulary_reviews(student_id, next_review_at);
  `);
}

async function getStudent(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (ctx.user.role !== "student") {
    return { error: NextResponse.json({ error: "Students only" }, { status: 403 }) };
  }
  if (!ctx.user.stage || !ctx.user.grade) {
    return {
      error: NextResponse.json({ cards: [], requiresProfile: true, totalDue: 0 }),
    };
  }
  return { user: ctx.user };
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const student = await getStudent(req);
  if (student.error) return student.error;
  const user = student.user;

  try {
    await ensureReviewTable();
    const [bankRows, progressResult] = await Promise.all([
      db.select({
        id: questionBank.id,
        questionText: questionBank.questionText,
        questionType: questionBank.questionType,
        options: questionBank.options,
        topic: questionBank.topic,
        unit: questionBank.unit,
        lesson: questionBank.lesson,
        difficulty: questionBank.difficulty,
        timesUsed: questionBank.timesUsed,
        totalAttempts: questionBank.totalAttempts,
      })
        .from(questionBank)
        .where(and(
          eq(questionBank.domainCategory, "Vocabulary"),
          eq(questionBank.stage, user.stage),
          eq(questionBank.grade, user.grade),
        ))
        .limit(500),
      db.execute(sql`
        SELECT question_id AS "questionId", repetitions, interval_days AS "intervalDays",
               last_rating AS "lastRating", next_review_at AS "nextReviewAt"
        FROM student_vocabulary_reviews
        WHERE student_id = ${user.id}
      `),
    ]);

    const progress = new Map<string, any>(
      progressResult.rows.map((row: any) => [String(row.questionId), row])
    );
    const now = Date.now();
    const bankById = new Map(bankRows.map((question) => [question.id, question]));
    const dueIds = progressResult.rows
      .filter((row: any) => {
        const next = new Date(row.nextReviewAt).getTime();
        return bankById.has(String(row.questionId)) && Number.isFinite(next) && next <= now;
      })
      .sort((a: any, b: any) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
      .map((row: any) => String(row.questionId));

    const due: typeof bankRows = [];
    for (const id of dueIds) {
      const question = bankById.get(id);
      if (question) due.push(question);
    }
    const dueCount = due.length;
    const fresh = bankRows
      .filter((question) => !progress.has(question.id))
      .sort((a, b) => (a.timesUsed || 0) - (b.timesUsed || 0) || Math.random() - 0.5);
    const cards = [...due, ...fresh]
      .slice(0, REVIEW_BATCH_SIZE)
      .map(({ id, questionText, questionType, options, topic, unit, lesson, difficulty }) => ({
        id,
        questionText,
        questionType,
        options,
        topic,
        unit,
        lesson,
        difficulty,
        isDue: dueIds.includes(id),
      }));

    return NextResponse.json({ cards, totalDue: dueCount, batchSize: REVIEW_BATCH_SIZE });
  } catch (error) {
    console.error("Vocabulary review GET error:", error);
    return NextResponse.json({ error: "Failed to load vocabulary review" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const student = await getStudent(req);
  if (student.error) return student.error;
  const user = student.user;

  try {
    const body = await req.json();
    const questionId = String(body.questionId || "");
    const action = String(body.action || "");
    if (!questionId) return NextResponse.json({ error: "Question is required" }, { status: 400 });

    const matches = await db.select({
      id: questionBank.id,
      correctAnswer: questionBank.correctAnswer,
      explanation: questionBank.explanation,
    })
      .from(questionBank)
      .where(and(
        eq(questionBank.id, questionId),
        eq(questionBank.domainCategory, "Vocabulary"),
        eq(questionBank.stage, user.stage),
        eq(questionBank.grade, user.grade),
      ))
      .limit(1);
    const question = matches[0];
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    if (action === "reveal") {
      return NextResponse.json({ answer: question.correctAnswer, explanation: question.explanation || "" });
    }

    const rating = String(body.rating || "");
    if (action !== "rate" || !["again", "hard", "good", "easy"].includes(rating)) {
      return NextResponse.json({ error: "Choose a valid review rating" }, { status: 400 });
    }

    await ensureReviewTable();
    const previousResult = await db.execute(sql`
      SELECT repetitions, interval_days AS "intervalDays"
      FROM student_vocabulary_reviews
      WHERE student_id = ${user.id} AND question_id = ${questionId}
      LIMIT 1
    `);
    const previous = previousResult.rows[0] as { repetitions?: number; intervalDays?: number } | undefined;
    const previousRepetitions = Number(previous?.repetitions || 0);
    const previousInterval = Number(previous?.intervalDays || 0);
    let repetitions = previousRepetitions;
    let intervalDays = previousInterval;
    const schedule = rating === "easy" ? [3, 7, 14, 30, 60] : [1, 3, 7, 14, 30];

    if (rating === "again") {
      repetitions = 0;
      intervalDays = 0;
    } else {
      repetitions += 1;
      const scheduled = schedule[Math.min(repetitions - 1, schedule.length - 1)];
      if (rating === "hard") {
        intervalDays = Math.max(1, Math.round((previousInterval || 1) * 1.2));
      } else if (previousRepetitions < schedule.length) {
        intervalDays = scheduled;
      } else {
        intervalDays = Math.max(scheduled, Math.round((previousInterval || scheduled) * (rating === "easy" ? 2.5 : 2.2)));
      }
    }

    const nextReviewAt = new Date(Date.now() + (rating === "again" ? 10 * 60_000 : intervalDays * 24 * 60 * 60_000));
    await db.execute(sql`
      INSERT INTO student_vocabulary_reviews
        (student_id, question_id, repetitions, interval_days, last_rating, last_reviewed_at, next_review_at)
      VALUES
        (${user.id}, ${questionId}, ${repetitions}, ${intervalDays}, ${rating}, CURRENT_TIMESTAMP, ${nextReviewAt})
      ON CONFLICT (student_id, question_id)
      DO UPDATE SET
        repetitions = EXCLUDED.repetitions,
        interval_days = EXCLUDED.interval_days,
        last_rating = EXCLUDED.last_rating,
        last_reviewed_at = EXCLUDED.last_reviewed_at,
        next_review_at = EXCLUDED.next_review_at
    `);

    return NextResponse.json({ success: true, nextReviewAt, intervalDays, rating });
  } catch (error) {
    console.error("Vocabulary review POST error:", error);
    return NextResponse.json({ error: "Could not save vocabulary review" }, { status: 500 });
  }
}
