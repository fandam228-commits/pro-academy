import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dialogueSubmissions, dialogueStudentProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getDialogueById, evaluateStudentAnswer } from "@/data/dialogue-center";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId = "guest_student",
      dialogueId,
      mode = "practice", // 'learn', 'practice', 'exam', 'challenge'
      answers = {}, // { "1": "text", ... }
      timeTakenSeconds = 0,
    } = body;

    if (!dialogueId) {
      return NextResponse.json(
        { success: false, error: "Missing dialogueId" },
        { status: 400 }
      );
    }

    const dialogue = getDialogueById(dialogueId);
    if (!dialogue) {
      return NextResponse.json(
        { success: false, error: "Dialogue not found" },
        { status: 404 }
      );
    }

    let totalScore = 0;
    const maxScore = 5;
    const evaluationResults: Record<
      string,
      {
        studentInput: string;
        isCorrect: boolean;
        score: number;
        approvedPrimary: string;
        approvedAlternatives: string[];
        matchedWith?: string;
        feedbackAr: string;
      }
    > = {};

    for (let gap = 1; gap <= 5; gap++) {
      const gapKey = String(gap);
      const studentInput = (answers[gapKey] || "").trim();
      const approved = dialogue.approvedAnswers[gapKey] || {
        primary: "Model answer",
        alternatives: [],
        isTeacherApproved: true,
      };

      const result = evaluateStudentAnswer(studentInput, approved);
      totalScore += result.score;

      evaluationResults[gapKey] = {
        studentInput,
        isCorrect: result.isCorrect,
        score: result.score,
        approvedPrimary: approved.primary,
        approvedAlternatives: approved.alternatives,
        matchedWith: result.matchedWith,
        feedbackAr: result.feedbackAr,
      };
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    const isPerfect = totalScore === maxScore;
    const basePoints = totalScore * 10;
    const pointsAwarded = mode === "challenge" ? basePoints * 2 : basePoints;

    // Record submission if DB is available
    if (db) {
      try {
        const submissionId = `dsub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(dialogueSubmissions).values({
          id: submissionId,
          studentId,
          dialogueId,
          mode,
          studentAnswers: answers,
          evaluationResults,
          score: totalScore,
          maxScore,
          percentage,
          timeTakenSeconds,
        });

        // Update progress
        const existingProgress = await db
          .select()
          .from(dialogueStudentProgress)
          .where(
            and(
              eq(dialogueStudentProgress.studentId, studentId),
              eq(dialogueStudentProgress.grade, dialogue.grade)
            )
          )
          .limit(1);

        if (existingProgress.length > 0) {
          const p = existingProgress[0];
          const completedSet = new Set(
            (p.completedDialogueIds as string[]) || []
          );
          completedSet.add(dialogueId);

          await db
            .update(dialogueStudentProgress)
            .set({
              completedDialogueIds: Array.from(completedSet),
              totalPracticeCount: p.totalPracticeCount + 1,
              perfectScoreCount: isPerfect
                ? p.perfectScoreCount + 1
                : p.perfectScoreCount,
              totalPointsEarned: p.totalPointsEarned + pointsAwarded,
              streak: p.streak + 1,
              lastPracticedAt: new Date(),
            })
            .where(eq(dialogueStudentProgress.id, p.id));
        } else {
          await db.insert(dialogueStudentProgress).values({
            id: `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            studentId,
            grade: dialogue.grade,
            completedDialogueIds: [dialogueId],
            totalPracticeCount: 1,
            perfectScoreCount: isPerfect ? 1 : 0,
            totalPointsEarned: pointsAwarded,
            streak: 1,
            lastPracticedAt: new Date(),
          });
        }
      } catch (dbErr) {
        console.warn("DB submission save skipped:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      dialogueId,
      mode,
      score: totalScore,
      maxScore,
      percentage,
      isPerfect,
      pointsAwarded,
      evaluationResults,
    });
  } catch (error: any) {
    console.error("POST /api/dialogues/submit error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Evaluation failed" },
      { status: 500 }
    );
  }
}
