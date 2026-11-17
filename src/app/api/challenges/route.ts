import { NextResponse } from "next/server";
import { db } from "@/db";
import { peerChallenges } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export interface ChallengeRecord {
  id: string;
  inviteCode: string;
  gradeLevel: string;
  creatorId: string;
  creatorName: string;
  creatorScore: number;
  creatorTimeSeconds: number;
  questionIds: any[];
  challengerId?: string | null;
  challengerName?: string | null;
  challengerScore?: number | null;
  challengerTimeSeconds?: number | null;
  status: "open" | "completed";
  createdAt: Date | string;
}

// In-memory fallback store when running without DATABASE_URL (CI, build, or offline test runs)
const globalChallengesStore = globalThis as typeof globalThis & {
  __paChallengesMemoryStore?: Map<string, ChallengeRecord>;
};

if (!globalChallengesStore.__paChallengesMemoryStore) {
  globalChallengesStore.__paChallengesMemoryStore = new Map<string, ChallengeRecord>();
}
export const challengesMemoryStore = globalChallengesStore.__paChallengesMemoryStore;

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable without ambiguous 0/O, 1/I
  let code = "CH-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {
    // Soft fallback if DB setup fails
  }

  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const queryUserId = searchParams.get("userId");
    const currentUserId = ctx?.user?.id || queryUserId || "usr_student_1";

    const hasDatabase = Boolean(process.env.DATABASE_URL);

    // 1. LOOKUP BY INVITE CODE
    if (code) {
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
          console.warn("Challenges GET by code DB error, checking memory:", dbErr);
        }
      }

      if (!challenge) {
        challenge = challengesMemoryStore.get(code) || null;
      }

      if (!challenge) {
        return NextResponse.json({ error: "التحدي غير موجود أو انتهت صلاحيته" }, { status: 404 });
      }

      // Cheating Prevention:
      // If the challenge is OPEN and the requester is NOT the creator,
      // hide the creator's score and strip correct answers from the questions snapshot!
      const isCreator = challenge.creatorId === currentUserId;
      if (challenge.status === "open" && !isCreator) {
        const sanitizedQuestions = Array.isArray(challenge.questionIds)
          ? challenge.questionIds.map((q: any) => ({
              id: q.id,
              number: q.number,
              questionText: q.questionText,
              options: q.options,
              topic: q.topic,
              // Intentionally omit correctAnswer & explanation
            }))
          : [];

        return NextResponse.json({
          challenge: {
            id: challenge.id,
            inviteCode: challenge.inviteCode,
            gradeLevel: challenge.gradeLevel,
            creatorName: challenge.creatorName,
            status: challenge.status,
            createdAt: challenge.createdAt,
            questions: sanitizedQuestions,
            isCreator: false,
          },
        });
      }

      // Completed or Creator view: return full record
      return NextResponse.json({
        challenge: {
          ...challenge,
          questions: challenge.questionIds,
          isCreator,
        },
      });
    }

    // 2. LIST USER'S CHALLENGES (Recent challenges where user is creator or challenger)
    let userChallenges: ChallengeRecord[] = [];

    if (hasDatabase) {
      try {
        const rows = await db
          .select()
          .from(peerChallenges)
          .where(
            or(
              eq(peerChallenges.creatorId, currentUserId),
              eq(peerChallenges.challengerId, currentUserId)
            )
          )
          .orderBy(desc(peerChallenges.createdAt))
          .limit(30);

        userChallenges = rows as ChallengeRecord[];
      } catch (dbErr) {
        console.warn("Challenges GET list DB error, checking memory:", dbErr);
      }
    }

    if (userChallenges.length === 0 && challengesMemoryStore.size > 0) {
      userChallenges = Array.from(challengesMemoryStore.values())
        .filter((c) => c.creatorId === currentUserId || c.challengerId === currentUserId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30);
    }

    return NextResponse.json({
      challenges: userChallenges,
      userId: currentUserId,
    });
  } catch (error: any) {
    console.error("Challenges GET error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();

    const {
      gradeLevel = "3rd_sec",
      creatorName = "طالب متميز",
      creatorScore = 0,
      creatorTimeSeconds = 0,
      questions = [],
      userId: bodyUserId,
    } = body;

    const creatorId = ctx?.user?.id || bodyUserId || "usr_student_1";

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Questions list is required to start challenge" }, { status: 400 });
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    const hasDatabase = Boolean(process.env.DATABASE_URL);

    const challengeId = `ch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newRecord: ChallengeRecord = {
      id: challengeId,
      inviteCode,
      gradeLevel: String(gradeLevel),
      creatorId,
      creatorName: String(creatorName || "طالب متميز"),
      creatorScore: Number(creatorScore) || 0,
      creatorTimeSeconds: Number(creatorTimeSeconds) || 0,
      questionIds: questions,
      challengerId: null,
      challengerName: null,
      challengerScore: null,
      challengerTimeSeconds: null,
      status: "open",
      createdAt: new Date(),
    };

    if (hasDatabase) {
      try {
        await db.insert(peerChallenges).values({
          id: newRecord.id,
          inviteCode: newRecord.inviteCode,
          gradeLevel: newRecord.gradeLevel,
          creatorId: newRecord.creatorId,
          creatorName: newRecord.creatorName,
          creatorScore: newRecord.creatorScore,
          creatorTimeSeconds: newRecord.creatorTimeSeconds,
          questionIds: newRecord.questionIds,
          status: "open",
          createdAt: new Date(),
        });
      } catch (dbErr) {
        console.warn("DB insert peerChallenges failed, storing in memory:", dbErr);
        challengesMemoryStore.set(inviteCode, newRecord);
      }
    } else {
      challengesMemoryStore.set(inviteCode, newRecord);
    }

    // Also cache in memory for rapid lookup
    challengesMemoryStore.set(inviteCode, newRecord);

    return NextResponse.json({
      success: true,
      challenge: {
        id: newRecord.id,
        inviteCode: newRecord.inviteCode,
        gradeLevel: newRecord.gradeLevel,
        creatorName: newRecord.creatorName,
        creatorScore: newRecord.creatorScore,
        creatorTimeSeconds: newRecord.creatorTimeSeconds,
        status: newRecord.status,
        createdAt: newRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Challenges POST error:", error);
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
