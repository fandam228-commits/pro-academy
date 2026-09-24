import { db } from "@/db";
import { quizzes, questions, quizSubmissions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get("id");
  const courseId = searchParams.get("courseId");
  const type = searchParams.get("type");
  const studentId = searchParams.get("studentId");

  try {
    if (quizId) {
      const qz = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
      if (qz.length === 0) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      const qList = await db.select().from(questions).where(eq(questions.quizId, quizId));
      // Never expose answer keys to students; grading remains server-side.
      const safeQuestionList =
        ctx.user.role === "admin" || ctx.user.role === "teacher"
          ? qList
          : qList.map(({ correctAnswer, ...q }) => q);
      
      let lastSubmission = null;
      if (studentId && studentId !== ctx.user.id && ctx.user.role !== "admin" && ctx.user.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (studentId) {
        const subs = await db
          .select()
          .from(quizSubmissions)
          .where(and(eq(quizSubmissions.quizId, quizId), eq(quizSubmissions.studentId, studentId)));
        if (subs.length > 0) {
          lastSubmission = subs[subs.length - 1];
        }
      }

      return NextResponse.json({
        quiz: qz[0],
        questions: safeQuestionList,
        lastSubmission,
      });
    }

    let allQuizzes = await db.select().from(quizzes);
    if (courseId) {
      allQuizzes = allQuizzes.filter((q) => q.courseId === courseId);
    }
    if (type) {
      allQuizzes = allQuizzes.filter((q) => q.type === type);
    }

    return NextResponse.json({ quizzes: allQuizzes });
  } catch (error) {
    console.error("Quizzes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { action, quizData, questionData, submissionData } = body;

    if (action === "create_quiz") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]); if (denied) return denied;
      const id = `qz_${Date.now()}`;
      const newQuiz = {
        id,
        title: quizData.title,
        courseId: quizData.courseId || null,
        unitId: quizData.unitId || null,
        stage: quizData.stage || "Secondary",
        type: quizData.type || "quiz",
        durationMinutes: quizData.durationMinutes || 30,
        passPercentage: quizData.passPercentage || 60,
        totalPoints: quizData.totalPoints || 100,
      };
      await db.insert(quizzes).values(newQuiz);

      // Insert questions if provided
      if (quizData.questions && Array.isArray(quizData.questions)) {
        for (const q of quizData.questions) {
          await db.insert(questions).values({
            id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            quizId: id,
            type: q.type || "mcq",
            questionText: q.questionText,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            points: q.points || 10,
          });
        }
      }

      return NextResponse.json({ success: true, quiz: newQuiz });
    }

    if (action === "submit") {
      const { quizId, studentId, userAnswers } = submissionData;
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher" && studentId !== ctx.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); // userAnswers: { [qId]: answerString }
      const qList = await db.select().from(questions).where(eq(questions.quizId, quizId));
      const qzList = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
      
      const qz = qzList[0];
      if (!qz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

      // Prevent students from farming points/streaks by submitting the same quiz repeatedly.
      if (ctx.user.role === "student") {
        const existing = await db
          .select()
          .from(quizSubmissions)
          .where(and(eq(quizSubmissions.quizId, quizId), eq(quizSubmissions.studentId, ctx.user.id)));
        if (existing.length > 0) {
          return NextResponse.json(
            { error: "Quiz already submitted", submission: existing[existing.length - 1] },
            { status: 409 }
          );
        }
      }

      let earnedScore = 0;
      let totalPossible = 0;
      const detailedFeedback: Record<string, any> = {};

      for (const q of qList) {
        const qPoints = q.points ?? 10;
        totalPossible += qPoints;
        const studentAns = (userAnswers[q.id] || "").trim();
        const isCorrect = studentAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
        
        if (isCorrect) {
          earnedScore += qPoints;
        }

        detailedFeedback[q.id] = {
          questionText: q.questionText,
          studentAnswer: studentAns,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        };
      }

      const percentage = Math.round((earnedScore / (totalPossible || 1)) * 100);
      const passed = percentage >= (qz?.passPercentage || 60);

      // Construct AI-style personalized feedback summary
      let summaryText = passed
        ? `Great performance! You scored ${percentage}%. You demonstrated strong command of grammar structure and vocabulary.`
        : `You scored ${percentage}%. Review the explanations below, focus on past tenses and vocabulary rules, and attempt the re-test.`;

      const subId = `sub_${Date.now()}`;
      const newSubmission = {
        id: subId,
        quizId,
        studentId,
        score: earnedScore,
        totalQuestions: qList.length,
        percentage,
        passed,
        answers: userAnswers,
        feedback: JSON.stringify({ summaryText, details: detailedFeedback }),
      };

      await db.insert(quizSubmissions).values(newSubmission);

      // Award points to student
      const stUsers = await db.select().from(users).where(eq(users.id, studentId));
      if (stUsers.length > 0) {
        const u = stUsers[0];
        await db
          .update(users)
          .set({ points: (u.points || 0) + earnedScore, streak: (u.streak || 0) + 1 })
          .where(eq(users.id, studentId));
      }

      return NextResponse.json({
        success: true,
        submission: newSubmission,
        score: earnedScore,
        percentage,
        passed,
        summaryText,
        details: detailedFeedback,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Quizzes POST error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
