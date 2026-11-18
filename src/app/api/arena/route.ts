import { NextResponse } from "next/server";
import { db } from "@/db";
import { arenaMatches, arenaLeaderboard } from "@/db/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { standardizeQuestionOptions, rebalanceQuestionSet } from "@/lib/mcq-balancer";
import QUESTION_BANK_2027_MASTER from "@/data/question-bank-2027-master.json";
import EXTRACTED_TRAINING_QUESTIONS from "@/data/training-center-extracted-questions.json";

// In-memory active room cache for instant sub-millisecond round synchronization
const memoryRooms = new Map<string, any>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ARN-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Selects 10 curated balanced questions for the battle
function pickArenaQuestions(grade?: string, count: number = 10): any[] {
  let candidates: any[] = [];

  // 1. Try matching grade from Master 2027
  if (grade && grade !== "all") {
    candidates = (QUESTION_BANK_2027_MASTER as any[]).filter(
      (q) => (q.grade || "").toLowerCase().includes(grade.toLowerCase()) && q.questionType === "mcq"
    );
  }

  // 2. If candidates < count, add more from 2027 master
  if (candidates.length < count) {
    const more2027 = (QUESTION_BANK_2027_MASTER as any[]).filter(
      (q) => q.questionType === "mcq" && !candidates.some((c) => c.id === q.id)
    );
    candidates.push(...more2027);
  }

  // 3. If still < count, add from verified training center
  if (candidates.length < count) {
    const verifiedTraining = (EXTRACTED_TRAINING_QUESTIONS as any[]).filter(
      (q) => q.isPublished && q.validationStatus === "complete_verified" && Array.isArray(q.options) && q.options.length === 4
    );
    const shuffledTraining = [...verifiedTraining].sort(() => Math.random() - 0.5);
    candidates.push(...shuffledTraining.slice(0, count - candidates.length));
  }

  // 4. Standardize and shuffle
  const selected = candidates.slice(0, count).map((q) => standardizeQuestionOptions(q));
  const { rebalancedQuestions } = rebalanceQuestionSet(selected, { shuffleDistractors: true });
  return rebalancedQuestions.length >= count ? rebalancedQuestions.slice(0, count) : selected;
}

// Bot rival personas
const BOT_NAMES = [
  "عبقري الأكاديمية (AI)",
  "تلميذ مستر حبيب (AI)",
  "صقر الإنجليزي (AI)",
  "بطل الثانوية (AI)",
];

const BOT_AVATARS = ["🤖", "⚡", "🦅", "🏆", "🔥"];

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "leaderboard";
    const roomCode = searchParams.get("roomCode");

    // 1. GET SPECIFIC ROOM STATE
    if (action === "get_room" && roomCode) {
      const code = roomCode.toUpperCase().trim();
      if (memoryRooms.has(code)) {
        return NextResponse.json({ success: true, match: memoryRooms.get(code) });
      }

      const rows = await db
        .select()
        .from(arenaMatches)
        .where(eq(arenaMatches.roomCode, code))
        .limit(1);

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "غرفة المبارزة غير موجودة" }, { status: 404 });
      }

      memoryRooms.set(code, rows[0]);
      return NextResponse.json({ success: true, match: rows[0] });
    }

    // 2. GET LEADERBOARD (HALL OF LEGENDS)
    const grade = searchParams.get("grade");
    let query = db.select().from(arenaLeaderboard).$dynamic();
    if (grade && grade !== "all") {
      query = query.where(eq(arenaLeaderboard.grade, grade));
    }

    let topPlayers = await query.orderBy(desc(arenaLeaderboard.trophies)).limit(20);

    // If table has few rows, provide prestigious benchmark champions
    if (topPlayers.length === 0) {
      topPlayers = [
        {
          id: "leg_01",
          studentId: "usr_omar",
          studentName: "عمر محمود السيد",
          avatar: "👑",
          grade: "Third Secondary (Baccalaureate)",
          trophies: 1250,
          wins: 48,
          losses: 4,
          draws: 1,
          currentStreak: 12,
          bestStreak: 15,
          totalMatches: 53,
          titleRank: "أسطورة الأكاديمية",
          lastMatchAt: new Date(),
        },
        {
          id: "leg_02",
          studentId: "usr_nour",
          studentName: "نور الدين سامح",
          avatar: "⚡",
          grade: "Third Secondary (Baccalaureate)",
          trophies: 980,
          wins: 39,
          losses: 7,
          draws: 2,
          currentStreak: 6,
          bestStreak: 9,
          totalMatches: 48,
          titleRank: "ماستر الإنجليزي",
          lastMatchAt: new Date(),
        },
        {
          id: "leg_03",
          studentId: "usr_mariam",
          studentName: "مريم أحمد يوسف",
          avatar: "🌟",
          grade: "Second Secondary",
          trophies: 820,
          wins: 31,
          losses: 6,
          draws: 0,
          currentStreak: 5,
          bestStreak: 8,
          totalMatches: 37,
          titleRank: "ماستر الإنجليزي",
          lastMatchAt: new Date(),
        },
        {
          id: "leg_04",
          studentId: "usr_ziad",
          studentName: "زياد طارق حسن",
          avatar: "🦅",
          grade: "First Secondary",
          trophies: 650,
          wins: 24,
          losses: 8,
          draws: 1,
          currentStreak: 3,
          bestStreak: 6,
          totalMatches: 33,
          titleRank: "مقاتل الأكاديمية",
          lastMatchAt: new Date(),
        },
        {
          id: "leg_05",
          studentId: "usr_salma",
          studentName: "سلمى حسام الدين",
          avatar: "🔥",
          grade: "Third Prep",
          trophies: 510,
          wins: 19,
          losses: 5,
          draws: 0,
          currentStreak: 4,
          bestStreak: 5,
          totalMatches: 24,
          titleRank: "صاعد واعد",
          lastMatchAt: new Date(),
        },
      ] as any;
    }

    return NextResponse.json({
      success: true,
      leaderboard: topPlayers,
    });
  } catch (error: any) {
    console.error("GET /api/arena error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const auth = await getAuthContext(req);
    const body = await req.json();
    const { action } = body;

    const currentUserId = auth?.user?.id || body.playerId || `guest_${Date.now().toString(36)}`;
    const currentUserName = auth?.user?.name || body.playerName || "طالب الأكاديمية";
    const currentUserAvatar = auth?.user?.avatar || body.playerAvatar || "⚔️";
    const grade = body.grade || auth?.user?.grade || "Third Secondary (Baccalaureate)";
    const stage = body.stage || auth?.user?.stage || "Secondary";

    // ==========================================
    // ACTION 1: CREATE A CHALLENGE ROOM (Share with Friend)
    // ==========================================
    if (action === "create_room") {
      const roomCode = generateRoomCode();
      const matchId = `arn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const questions = pickArenaQuestions(grade, 10);

      const newMatch: any = {
        id: matchId,
        roomCode,
        stage,
        grade,
        status: "waiting", // waiting for friend to join
        player1Id: currentUserId,
        player1Name: currentUserName,
        player1Avatar: currentUserAvatar,
        player1Hp: 100,
        player1Score: 0,
        player1Streak: 0,
        player2Id: null,
        player2Name: null,
        player2Avatar: "🛡️",
        player2Hp: 100,
        player2Score: 0,
        player2Streak: 0,
        isVsBot: false,
        botPersonality: "smart",
        currentQuestionIndex: 0,
        totalQuestions: questions.length,
        questions,
        roundEvents: [],
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(arenaMatches).values(newMatch);
      memoryRooms.set(roomCode, newMatch);

      return NextResponse.json({
        success: true,
        match: newMatch,
        roomCode,
        shareUrl: `/arena?room=${roomCode}`,
      });
    }

    // ==========================================
    // ACTION 2: JOIN A CUSTOM CHALLENGE ROOM
    // ==========================================
    if (action === "join_room") {
      const roomCode = String(body.roomCode || "").toUpperCase().trim();
      let match = memoryRooms.get(roomCode);

      if (!match) {
        const rows = await db
          .select()
          .from(arenaMatches)
          .where(eq(arenaMatches.roomCode, roomCode))
          .limit(1);

        if (rows.length === 0) {
          return NextResponse.json({ success: false, error: "كود الغرفة غير صحيح أو منتهي الصلاحية" }, { status: 404 });
        }
        match = rows[0];
      }

      if (match.status !== "waiting") {
        return NextResponse.json({ success: false, error: "المبارزة في هذه الغرفة بدأت بالفعل أو انتهت" }, { status: 400 });
      }

      if (match.player1Id === currentUserId) {
        return NextResponse.json({ success: true, match, message: "أنت منشئ هذه الغرفة بالفعل" });
      }

      // Assign Player 2 and activate match!
      match.player2Id = currentUserId;
      match.player2Name = currentUserName;
      match.player2Avatar = currentUserAvatar;
      match.status = "active";
      match.updatedAt = new Date();

      await db
        .update(arenaMatches)
        .set({
          player2Id: match.player2Id,
          player2Name: match.player2Name,
          player2Avatar: match.player2Avatar,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(arenaMatches.roomCode, roomCode));

      memoryRooms.set(roomCode, match);

      return NextResponse.json({
        success: true,
        match,
      });
    }

    // ==========================================
    // ACTION 3: QUICK MATCH (Immediate 1v1 or AI Rival)
    // ==========================================
    if (action === "quick_match") {
      // 1. Look for an open waiting room from another human in the same grade
      const waitingHumanRoom = Array.from(memoryRooms.values()).find(
        (m) => m.status === "waiting" && m.player1Id !== currentUserId && (!grade || m.grade === grade)
      );

      if (waitingHumanRoom) {
        waitingHumanRoom.player2Id = currentUserId;
        waitingHumanRoom.player2Name = currentUserName;
        waitingHumanRoom.player2Avatar = currentUserAvatar;
        waitingHumanRoom.status = "active";
        waitingHumanRoom.updatedAt = new Date();

        await db
          .update(arenaMatches)
          .set({
            player2Id: currentUserId,
            player2Name: currentUserName,
            player2Avatar: currentUserAvatar,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(arenaMatches.roomCode, waitingHumanRoom.roomCode));

        return NextResponse.json({
          success: true,
          match: waitingHumanRoom,
          isVsBot: false,
        });
      }

      // 2. Otherwise spawn instant match vs AI Rival so player never waits!
      const roomCode = generateRoomCode();
      const matchId = `arn_bot_${Date.now()}`;
      const questions = pickArenaQuestions(grade, 10);
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const botAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

      const botMatch: any = {
        id: matchId,
        roomCode,
        stage,
        grade,
        status: "active", // Starts immediately!
        player1Id: currentUserId,
        player1Name: currentUserName,
        player1Avatar: currentUserAvatar,
        player1Hp: 100,
        player1Score: 0,
        player1Streak: 0,
        player2Id: "bot_rival_ai",
        player2Name: botName,
        player2Avatar: botAvatar,
        player2Hp: 100,
        player2Score: 0,
        player2Streak: 0,
        isVsBot: true,
        botPersonality: "smart",
        currentQuestionIndex: 0,
        totalQuestions: questions.length,
        questions,
        roundEvents: [],
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(arenaMatches).values(botMatch);
      memoryRooms.set(roomCode, botMatch);

      return NextResponse.json({
        success: true,
        match: botMatch,
        isVsBot: true,
      });
    }

    // ==========================================
    // ACTION 4: SUBMIT TURN / ANSWER A QUESTION
    // ==========================================
    if (action === "submit_answer") {
      const { roomCode, questionIndex, selectedAnswer, timeTakenSeconds = 6 } = body;
      const code = String(roomCode || "").toUpperCase().trim();
      let match = memoryRooms.get(code);

      if (!match) {
        const rows = await db
          .select()
          .from(arenaMatches)
          .where(eq(arenaMatches.roomCode, code))
          .limit(1);
        if (rows.length === 0) {
          return NextResponse.json({ success: false, error: "المبارزة غير موجودة" }, { status: 404 });
        }
        match = rows[0];
      }

      const isP1 = match.player1Id === currentUserId;
      const currentQ = match.questions[questionIndex];

      if (!currentQ) {
        return NextResponse.json({ success: false, error: "السؤال غير صالح" }, { status: 400 });
      }

      // Verify answer correctness
      const rawCorrect = String(currentQ.correctAnswer || "").trim().toLowerCase();
      const studentAns = String(selectedAnswer || "").trim().toLowerCase();

      // Check if letter match (e.g. 'a') or text match
      let isCorrect = false;
      if (studentAns === rawCorrect) {
        isCorrect = true;
      } else if (Array.isArray(currentQ.options)) {
        const optIdx = currentQ.options.findIndex((o: any) => {
          const t = typeof o === "object" ? (o.text || o.label) : String(o);
          return String(t).trim().toLowerCase() === studentAns;
        });
        if (optIdx !== -1) {
          const optAtIdx = currentQ.options[optIdx];
          const optText = typeof optAtIdx === "object" ? optAtIdx.text : optAtIdx;
          if (String(optText).trim().toLowerCase() === rawCorrect) {
            isCorrect = true;
          }
        }
      }

      // Calculate Damage & Points
      // Base damage: 20 HP. Speed bonus damage: up to 10 HP. Streak combo: +5 HP.
      const speedBonus = Math.max(0, Math.round((12 - timeTakenSeconds) * 2));
      const damageDealt = isCorrect ? 20 + speedBonus : 0;
      const selfDamage = isCorrect ? 0 : 25; // Wrong answer penalty

      if (isP1) {
        if (isCorrect) {
          match.player1Streak = (match.player1Streak || 0) + 1;
          const comboBonus = match.player1Streak >= 2 ? 25 : 0;
          match.player1Score += 100 + speedBonus * 5 + comboBonus;
          match.player2Hp = Math.max(0, match.player2Hp - damageDealt);
        } else {
          match.player1Streak = 0;
          match.player1Hp = Math.max(0, match.player1Hp - selfDamage);
        }
      } else {
        if (isCorrect) {
          match.player2Streak = (match.player2Streak || 0) + 1;
          const comboBonus = match.player2Streak >= 2 ? 25 : 0;
          match.player2Score += 100 + speedBonus * 5 + comboBonus;
          match.player1Hp = Math.max(0, match.player1Hp - damageDealt);
        } else {
          match.player2Streak = 0;
          match.player2Hp = Math.max(0, match.player2Hp - selfDamage);
        }
      }

      // If Playing Against AI Bot: Simulate Bot Response on same question
      let botResult: any = null;
      if (match.isVsBot && isP1) {
        // AI Bot has 80% accuracy, response time 3 to 7s
        const botCorrect = Math.random() < 0.8;
        const botTime = 3 + Math.floor(Math.random() * 5);
        const botSpeedBonus = Math.max(0, Math.round((12 - botTime) * 2));
        const botDamage = botCorrect ? 20 + botSpeedBonus : 0;
        const botPenalty = botCorrect ? 0 : 25;

        if (botCorrect) {
          match.player2Streak = (match.player2Streak || 0) + 1;
          match.player2Score += 100 + botSpeedBonus * 5;
          match.player1Hp = Math.max(0, match.player1Hp - botDamage);
        } else {
          match.player2Streak = 0;
          match.player2Hp = Math.max(0, match.player2Hp - botPenalty);
        }

        botResult = {
          isCorrect: botCorrect,
          damageDealt: botDamage,
          timeTaken: botTime,
        };
      }

      // Check Match End Condition
      const isKnockout = match.player1Hp <= 0 || match.player2Hp <= 0;
      const isLastQuestion = questionIndex >= match.totalQuestions - 1;

      if (isKnockout || isLastQuestion) {
        match.status = "finished";
        if (match.player1Hp > match.player2Hp) {
          match.winnerId = match.player1Id;
        } else if (match.player2Hp > match.player1Hp) {
          match.winnerId = match.player2Id;
        } else {
          match.winnerId = match.player1Score >= match.player2Score ? match.player1Id : match.player2Id;
        }

        // Update Leaderboard Trophies
        if (currentUserId && !currentUserId.startsWith("guest_") && currentUserId !== "bot_rival_ai") {
          const isWinner = match.winnerId === currentUserId;
          const trophyDelta = isWinner ? 25 : -10;

          try {
            const existingLead = await db
              .select()
              .from(arenaLeaderboard)
              .where(eq(arenaLeaderboard.studentId, currentUserId))
              .limit(1);

            if (existingLead.length > 0) {
              const cur = existingLead[0];
              const newTrophies = Math.max(0, cur.trophies + trophyDelta);
              const newWins = cur.wins + (isWinner ? 1 : 0);
              const newLosses = cur.losses + (isWinner ? 0 : 1);
              const newStreak = isWinner ? cur.currentStreak + 1 : 0;
              const bestStreak = Math.max(cur.bestStreak, newStreak);

              let rank = "صاعد واعد";
              if (newTrophies >= 1000) rank = "أسطورة الأكاديمية";
              else if (newTrophies >= 600) rank = "ماستر الإنجليزي";
              else if (newTrophies >= 300) rank = "مقاتل الأكاديمية";

              await db
                .update(arenaLeaderboard)
                .set({
                  trophies: newTrophies,
                  wins: newWins,
                  losses: newLosses,
                  currentStreak: newStreak,
                  bestStreak,
                  totalMatches: cur.totalMatches + 1,
                  titleRank: rank,
                  lastMatchAt: new Date(),
                })
                .where(eq(arenaLeaderboard.studentId, currentUserId));
            } else {
              await db.insert(arenaLeaderboard).values({
                id: `lead_${Date.now()}`,
                studentId: currentUserId,
                studentName: currentUserName,
                avatar: currentUserAvatar,
                grade,
                trophies: Math.max(0, 100 + trophyDelta),
                wins: isWinner ? 1 : 0,
                losses: isWinner ? 0 : 1,
                draws: 0,
                currentStreak: isWinner ? 1 : 0,
                bestStreak: isWinner ? 1 : 0,
                totalMatches: 1,
                titleRank: "صاعد واعد",
              });
            }
          } catch (leadErr) {
            console.error("Error updating leaderboard:", leadErr);
          }
        }
      } else {
        match.currentQuestionIndex = questionIndex + 1;
      }

      match.updatedAt = new Date();
      memoryRooms.set(code, match);

      // Async DB write
      db.update(arenaMatches)
        .set({
          player1Hp: match.player1Hp,
          player1Score: match.player1Score,
          player1Streak: match.player1Streak,
          player2Hp: match.player2Hp,
          player2Score: match.player2Score,
          player2Streak: match.player2Streak,
          currentQuestionIndex: match.currentQuestionIndex,
          status: match.status,
          winnerId: match.winnerId,
          updatedAt: new Date(),
        })
        .where(eq(arenaMatches.roomCode, code))
        .catch(() => {});

      return NextResponse.json({
        success: true,
        match,
        isCorrect,
        damageDealt,
        selfDamage,
        botResult,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
      });
    }

    return NextResponse.json({ success: false, error: "Action not recognized" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/arena error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
