import { db } from "@/db";
import {
  trainingQuestions,
  trainingExamSessions,
  trainingStudentAttempts,
  trainingRevisionQueue,
  users,
} from "@/db/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { createExamAttemptSession, gradeExamAttempt } from "@/lib/smart-shuffle-engine";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const auth = await getAuthContext(req);
    const currentUser = auth?.user;

    const studentId = currentUser?.id || searchParams.get("studentId");
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const sessionRes = await db
        .select()
        .from(trainingExamSessions)
        .where(eq(trainingExamSessions.id, sessionId))
        .limit(1);

      if (sessionRes.length === 0) {
        return NextResponse.json({ success: false, error: "Exam session not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, session: sessionRes[0] });
    }

    if (!studentId) {
      return NextResponse.json({ success: true, exams: [] });
    }

    const exams = await db
      .select()
      .from(trainingExamSessions)
      .where(eq(trainingExamSessions.studentId, studentId))
      .orderBy(desc(trainingExamSessions.startedAt))
      .limit(20);

    return NextResponse.json({ success: true, exams });
  } catch (error: any) {
    console.error("GET /api/training-center/exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load exams" },
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

    const studentId = currentUser?.id || body.studentId || "usr_guest";

    if (action === "start") {
      const {
        title = "امتحان التدريب والتقييم الإلكتروني",
        topic,
        difficulty,
        questionCount = 20,
        durationMinutes = 20,
      } = body;

      const qCount = Math.min(50, Math.max(5, parseInt(String(questionCount), 10) || 20));
      const duration = Math.min(120, Math.max(5, parseInt(String(durationMinutes), 10) || 20));

      const conditions = [
        eq(trainingQuestions.isPublished, true),
        eq(trainingQuestions.validationStatus, "complete_verified"),
      ];
      if (topic && topic !== "all") {
        conditions.push(eq(trainingQuestions.topic, topic));
      }
      if (difficulty && difficulty !== "all") {
        conditions.push(eq(trainingQuestions.difficulty, difficulty));
      }

      const availableQuestions = await db
        .select({
          id: trainingQuestions.id,
          questionNumber: trainingQuestions.questionNumber,
          originalOrder: trainingQuestions.originalOrder,
          questionText: trainingQuestions.questionText,
          options: trainingQuestions.options,
          correctAnswer: trainingQuestions.correctAnswer,
          explanation: trainingQuestions.explanation,
          topic: trainingQuestions.topic,
          difficulty: trainingQuestions.difficulty,
        })
        .from(trainingQuestions)
        .where(and(...conditions))
        .orderBy(sql`RANDOM()`)
        .limit(qCount);

      if (availableQuestions.length === 0) {
        return NextResponse.json(
          { success: false, error: "No published questions available for selected filters." },
          { status: 400 }
        );
      }

      const attemptSession = createExamAttemptSession(availableQuestions);
      const sessionId = `tes_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const qIds = attemptSession.clientQuestions.map((q: any) => q.id);

      await db.insert(trainingExamSessions).values({
        id: sessionId,
        studentId,
        title,
        questionCount: attemptSession.clientQuestions.length,
        durationMinutes: duration,
        status: "in_progress",
        questionIds: qIds,
        studentAnswers: {},
        detailedResults: attemptSession.secrets,
        startedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        sessionId,
        title,
        durationMinutes: duration,
        totalQuestions: attemptSession.clientQuestions.length,
        questions: attemptSession.clientQuestions,
      });
    }

    if (action === "submit") {
      const { sessionId, studentAnswers = {} } = body;

      if (!sessionId) {
        return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 });
      }

      const sessionRes = await db
        .select()
        .from(trainingExamSessions)
        .where(eq(trainingExamSessions.id, sessionId))
        .limit(1);

      if (sessionRes.length === 0) {
        return NextResponse.json({ success: false, error: "Exam session not found" }, { status: 404 });
      }

      const session = sessionRes[0];
      const qIds: string[] = Array.isArray(session.questionIds) ? (session.questionIds as string[]) : [];

      if (qIds.length === 0) {
        return NextResponse.json({ success: false, error: "Session has no questions" }, { status: 400 });
      }

      let correctCount = 0;
      let detailedResults: any[] = [];
      const storedSecrets = session.detailedResults;
      const isSmartShuffleSession =
        storedSecrets &&
        typeof storedSecrets === "object" &&
        !Array.isArray(storedSecrets) &&
        Object.keys(storedSecrets).length > 0;

      if (isSmartShuffleSession) {
        const graded = gradeExamAttempt(storedSecrets as any, studentAnswers);
        correctCount = graded.score;
        detailedResults = graded.detailedResults;

        if (session.studentId && session.studentId !== "usr_guest") {
          for (const item of graded.detailedResults) {
            const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await db.insert(trainingStudentAttempts).values({
              id: attemptId,
              studentId: session.studentId,
              questionId: item.questionId,
              selectedAnswer: item.studentAnswer,
              isCorrect: item.isCorrect,
              attemptType: "exam",
              examSessionId: sessionId,
            });

            if (!item.isCorrect) {
              const existingMistake = await db
                .select()
                .from(trainingRevisionQueue)
                .where(
                  and(
                    eq(trainingRevisionQueue.studentId, session.studentId),
                    eq(trainingRevisionQueue.questionId, item.questionId)
                  )
                )
                .limit(1);

              if (existingMistake.length > 0) {
                await db
                  .update(trainingRevisionQueue)
                  .set({
                    mistakeCount: sql`${trainingRevisionQueue.mistakeCount} + 1`,
                    lastMistakeAt: new Date(),
                    resolved: false,
                  })
                  .where(eq(trainingRevisionQueue.id, existingMistake[0].id));
              } else {
                await db.insert(trainingRevisionQueue).values({
                  id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  studentId: session.studentId,
                  questionId: item.questionId,
                  mistakeCount: 1,
                  lastMistakeAt: new Date(),
                  resolved: false,
                });
              }
            }
          }
        }
      } else {
        // Fetch official questions and answers for legacy sessions
        const trueQuestions = await db
          .select()
          .from(trainingQuestions)
          .where(inArray(trainingQuestions.id, qIds));

        const qMap = new Map<string, any>();
        for (const q of trueQuestions) {
          qMap.set(q.id, q);
        }

        for (const qId of qIds) {
          const q = qMap.get(qId);
          if (!q) continue;

          const givenAnswer = studentAnswers[qId] ? String(studentAnswers[qId]).trim().toLowerCase() : null;
          const correctAnswer = String(q.correctAnswer || "").trim().toLowerCase();

          let isCorrect = givenAnswer !== null && givenAnswer === correctAnswer;
          if (!isCorrect && givenAnswer !== null && Array.isArray(q.options)) {
            const matchedOpt = (q.options as any[]).find(
              (o) => String(o.label).toLowerCase() === correctAnswer
            );
            if (matchedOpt && String(matchedOpt.text).trim().toLowerCase() === givenAnswer) {
              isCorrect = true;
            }
          }

          if (isCorrect) {
            correctCount += 1;
          }

          detailedResults.push({
            questionId: q.id,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            options: q.options,
            studentAnswer: givenAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: q.explanation || `Grammar rule: ${q.topic}`,
            topic: q.topic,
            difficulty: q.difficulty,
          });

          // Log attempt and update revision queue
          if (session.studentId && session.studentId !== "usr_guest") {
            const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await db.insert(trainingStudentAttempts).values({
              id: attemptId,
              studentId: session.studentId,
              questionId: q.id,
              selectedAnswer: givenAnswer,
              isCorrect,
              attemptType: "exam",
              examSessionId: sessionId,
            });

            if (!isCorrect) {
              const existingMistake = await db
                .select()
                .from(trainingRevisionQueue)
                .where(
                  and(
                    eq(trainingRevisionQueue.studentId, session.studentId),
                    eq(trainingRevisionQueue.questionId, q.id)
                  )
                )
                .limit(1);

              if (existingMistake.length > 0) {
                await db
                  .update(trainingRevisionQueue)
                  .set({
                    mistakeCount: sql`${trainingRevisionQueue.mistakeCount} + 1`,
                    lastMistakeAt: new Date(),
                    resolved: false,
                  })
                  .where(eq(trainingRevisionQueue.id, existingMistake[0].id));
              } else {
                await db.insert(trainingRevisionQueue).values({
                  id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  studentId: session.studentId,
                  questionId: q.id,
                  mistakeCount: 1,
                  lastMistakeAt: new Date(),
                  resolved: false,
                });
              }
            }
          }
        }
      }

      const totalScore = qIds.length;
      const score = correctCount;
      const percentage = totalScore > 0 ? Number(((score / totalScore) * 100).toFixed(2)) : 0;
      const passed = percentage >= 60;

      // Update session record
      await db
        .update(trainingExamSessions)
        .set({
          status: "completed",
          score,
          totalScore,
          percentage: String(percentage),
          passed,
          studentAnswers,
          detailedResults,
          submittedAt: new Date(),
        })
        .where(eq(trainingExamSessions.id, sessionId));

      // Award points to student
      if (session.studentId && session.studentId !== "usr_guest") {
        const pointsEarned = correctCount * 10 + (passed ? 50 : 0);
        await db
          .update(users)
          .set({
            points: sql`${users.points} + ${pointsEarned}`,
          })
          .where(eq(users.id, session.studentId));
      }

      return NextResponse.json({
        success: true,
        sessionId,
        score,
        totalScore,
        percentage,
        passed,
        detailedResults,
      });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/training-center/exams error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process exam" },
      { status: 500 }
    );
  }
}
