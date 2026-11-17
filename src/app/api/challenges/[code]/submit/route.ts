import { NextResponse } from "next/server";
import { db } from "@/db";
import { peerChallenges, userMistakes, studentGamification, xpTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { challengesMemoryStore, ChallengeRecord } from "../../route";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const { code: rawCode } = await params;
    const code = rawCode ? rawCode.trim().toUpperCase() : "";

    if (!code) {
      return NextResponse.json({ error: "كود التحدي مطلوب" }, { status: 400 });
    }

    const ctx = await getAuthContext(req);
    const body = await req.json();

    const {
      challengerName = "بطل التحدي",
      challengerTimeSeconds = 0,
      answers = {},
      userId: bodyUserId,
    } = body;

    const challengerId = ctx?.user?.id || bodyUserId || `usr_challenger_${Date.now().toString(36)}`;
    const hasDatabase = Boolean(process.env.DATABASE_URL);

    // 1. Fetch Challenge Record
    let challenge: ChallengeRecord | null = null;

    if (hasDatabase) {
      try {
        const rows = await db
          .select()
          .from(peerChallenges)
          .where(eq(peerChallenges.inviteCode, code))
          .limit(1);

        if (rows.length > 0) {
          challenge = rows[0] as ChallengeRecord;
        }
      } catch (dbErr) {
        console.warn("Error fetching challenge from DB, checking memory:", dbErr);
      }
    }

    if (!challenge) {
      challenge = challengesMemoryStore.get(code) || null;
    }

    if (!challenge) {
      return NextResponse.json({ error: "التحدي غير موجود أو تم حذفه" }, { status: 404 });
    }

    if (challenge.status === "completed") {
      return NextResponse.json(
        {
          error: "تم استكمال هذا التحدي مسبقاً! يمكنك إنشاء تحدٍ جديد أو خوض تحدٍ آخر.",
          challenge,
        },
        { status: 400 }
      );
    }

    // 2. Evaluate Challenger's Answers against stored questions
    const questions = Array.isArray(challenge.questionIds) ? challenge.questionIds : [];
    let challengerScore = 0;
    const questionsWithFeedback: any[] = [];
    const mistakesToRecord: Array<{ question: any; wrongAnswer: string }> = [];

    questions.forEach((q: any, index: number) => {
      // Look up answer by q.id, or stringified index/number
      let selectedAnswer = "";
      if (Array.isArray(answers)) {
        const found = answers.find((a: any) => a.questionId === q.id || a.id === q.id);
        selectedAnswer = found?.selectedAnswer || found?.answer || "";
      } else if (typeof answers === "object" && answers !== null) {
        selectedAnswer = answers[q.id] || answers[q.number] || answers[index] || "";
      }

      const isCorrect =
        selectedAnswer &&
        q.correctAnswer &&
        String(selectedAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

      if (isCorrect) {
        challengerScore++;
      } else {
        mistakesToRecord.push({
          question: q,
          wrongAnswer: selectedAnswer || "لم تتم الإجابة",
        });
      }

      questionsWithFeedback.push({
        ...q,
        studentAnswer: selectedAnswer,
        isCorrect: Boolean(isCorrect),
      });
    });

    // 3. Auto-Record Mistakes to Smart Mistakes Bank
    for (const m of mistakesToRecord) {
      const qIdStr = String(m.question.id || `ch_q_${Date.now()}`);
      if (hasDatabase) {
        try {
          const newId = `um_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await db
            .insert(userMistakes)
            .values({
              id: newId,
              userId: challengerId,
              questionId: qIdStr,
              questionSnapshot: m.question,
              wrongAnswer: m.wrongAnswer,
              mistakeCount: 1,
              status: "unresolved",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [userMistakes.userId, userMistakes.questionId],
              set: {
                mistakeCount: sql`${userMistakes.mistakeCount} + 1`,
                wrongAnswer: m.wrongAnswer,
                status: "unresolved",
                updatedAt: new Date(),
                questionSnapshot: m.question,
              },
            });
        } catch (mErr) {
          console.warn("Failed to auto-record mistake to DB:", mErr);
        }
      }
    }

    // 4. Determine Winner with Score & Time-seconds Tie-Breaker
    const cTime = Number(challengerTimeSeconds) || 0;
    const crScore = Number(challenge.creatorScore) || 0;
    const crTime = Number(challenge.creatorTimeSeconds) || 0;

    let winner: "challenger" | "creator" | "tie" = "tie";
    if (challengerScore > crScore) {
      winner = "challenger";
    } else if (challengerScore < crScore) {
      winner = "creator";
    } else {
      // Tie on score: faster time wins (fewer seconds)
      if (cTime < crTime) {
        winner = "challenger";
      } else if (cTime > crTime) {
        winner = "creator";
      } else {
        winner = "tie";
      }
    }

    // 5. Calculate XP Points
    let challengerXp = 15;
    let creatorXp = 15;
    if (winner === "challenger") {
      challengerXp = 40;
      creatorXp = 15;
    } else if (winner === "creator") {
      creatorXp = 40;
      challengerXp = 15;
    } else {
      // Tie
      challengerXp = 25;
      creatorXp = 25;
    }

    const today = getTodayString();

    // Helper to safely award XP in DB
    const awardStudentXp = async (uId: string, xp: number, actionType: string) => {
      if (!hasDatabase) return;
      try {
        await db.insert(xpTransactions).values({
          id: `xpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: uId,
          actionType,
          xpEarned: xp,
          referenceId: `challenge_${code}`,
          createdAt: new Date(),
        });

        await db
          .insert(studentGamification)
          .values({
            id: `sg_${uId}`,
            userId: uId,
            totalXp: xp,
            weeklyXp: xp,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: today,
            gradeLevel: challenge?.gradeLevel || "3rd_sec",
          })
          .onConflictDoUpdate({
            target: studentGamification.userId,
            set: {
              totalXp: sql`${studentGamification.totalXp} + ${xp}`,
              weeklyXp: sql`${studentGamification.weeklyXp} + ${xp}`,
              lastActivityDate: today,
            },
          });
      } catch (gamErr) {
        console.warn(`Failed to award XP to user ${uId}:`, gamErr);
      }
    };

    await awardStudentXp(
      challengerId,
      challengerXp,
      winner === "challenger" ? "challenge_won" : "challenge_participated"
    );
    await awardStudentXp(
      challenge.creatorId,
      creatorXp,
      winner === "creator" ? "challenge_won" : "challenge_participated"
    );

    // 6. Update Challenge Record
    const updatedRecord: ChallengeRecord = {
      ...challenge,
      challengerId,
      challengerName: String(challengerName),
      challengerScore,
      challengerTimeSeconds: cTime,
      status: "completed",
    };

    if (hasDatabase) {
      try {
        await db
          .update(peerChallenges)
          .set({
            challengerId,
            challengerName: String(challengerName),
            challengerScore,
            challengerTimeSeconds: cTime,
            status: "completed",
          })
          .where(eq(peerChallenges.inviteCode, code));
      } catch (uErr) {
        console.warn("DB update peerChallenges failed, updating memory:", uErr);
      }
    }

    challengesMemoryStore.set(code, updatedRecord);

    const winnerName =
      winner === "challenger"
        ? updatedRecord.challengerName
        : winner === "creator"
        ? updatedRecord.creatorName
        : "تعادل رائع";

    return NextResponse.json({
      success: true,
      result: {
        winner,
        winnerName,
        creatorName: updatedRecord.creatorName,
        creatorScore: updatedRecord.creatorScore,
        creatorTimeSeconds: updatedRecord.creatorTimeSeconds,
        challengerName: updatedRecord.challengerName,
        challengerScore: updatedRecord.challengerScore,
        challengerTimeSeconds: updatedRecord.challengerTimeSeconds,
        challengerXp,
        creatorXp,
        status: "completed",
        questions: questionsWithFeedback,
      },
    });
  } catch (error: any) {
    console.error("Challenge submit error:", error);
    return NextResponse.json({ error: "Failed to submit challenge attempt" }, { status: 500 });
  }
}
