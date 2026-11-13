import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const auth = await getAuthContext(req);
    if (!auth?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to talk to story characters." },
        { status: 401 }
      );
    }

    const studentId = auth.user.id;
    const { gradeId, characterName, message, chapterId } = await req.json();

    if (!characterName || !message || !String(message).trim()) {
      return NextResponse.json(
        { success: false, error: "Character name and message are required." },
        { status: 400 }
      );
    }

    const cleanMsg = String(message).trim();

    // Educational In-Character Persona responses
    const charNameLower = characterName.toLowerCase();
    let reply = "";
    let languageTip = "";

    if (charNameLower.includes("santiago")) {
      reply = `Ah, young friend! The sea teaches patience. When you speak of "${cleanMsg.slice(0, 40)}", remember: a man can be destroyed, but not defeated. Keep your line straight and trust your strength.`;
      languageTip = `💡 Tip from Mr. Habib: Notice Santiago's use of compound sentences with coordinating conjunctions ('but', 'and'). Use them to connect your ideas smoothly!`;
    } else if (charNameLower.includes("fogg")) {
      reply = `Precision, my friend! Eight hundred and forty hours—neither a minute more nor less. Regarding your point: every obstacle can be calculated and overcome with discipline and timely composure.`;
      languageTip = `💡 Tip from Mr. Habib: Phileas Fogg values precision! When discussing schedules, remember that fixed future events often use the Present Simple (e.g. *The train leaves at 8:00 PM*).`;
    } else if (charNameLower.includes("dantès") || charNameLower.includes("monte cristo") || charNameLower.includes("dantes") || charNameLower.includes("edmond")) {
      reply = `All human wisdom is contained in these two words: 'Wait and hope.' Through the darkest trials, knowledge, patience, and unwavering justice shall always prevail. What question weighs on your mind regarding my journey?`;
      languageTip = `💡 Tip from Mr. Habib: Notice Edmond Dantès' use of imperative maxims ('Wait and hope'). It is an effective rhetorical technique in advanced English essays!`;
    } else if (charNameLower.includes("faria") || charNameLower.includes("abbé") || charNameLower.includes("abbe")) {
      reply = `My son, knowledge is the only treasure that no tyrant can steal. In Chateau d'If, books and wisdom became my wings. Study with diligence, and remember that justice must never become malice.`;
      languageTip = `💡 Tip from Mr. Habib: Abbé Faria emphasizes moral wisdom. Pay attention to noun clauses such as 'that no tyrant can steal' acting as adjective clauses!`;
    } else if (charNameLower.includes("challenger")) {
      reply = `Preposterous doubts! Science demands evidence, not timid speculation. The plateau exists, and only those with fortitude and an observant eye can comprehend its living wonders!`;
      languageTip = `💡 Tip from Mr. Habib: Professor Challenger speaks with strong academic adjectives ('preposterous', 'observant'). Enrich your Thanawya Amma essays by replacing basic words with precise academic vocabulary!`;
    } else {
      reply = `Greetings! In our story, every action carries meaning. Regarding your observation: literature invites us to think critically and learn from the journeys of others.`;
      languageTip = `💡 Tip from Mr. Habib: Great phrasing! Consistent daily practice with active recall is the secret to mastering fluent English conversation.`;
    }

    let badgeEarned = false;
    let earnedBadgeObj = null;

    if (process.env.DATABASE_URL) {
      try {
        const { db } = await import("@/db");
        const { storyCharacterChatSessions, storyStudentBadges } = await import("@/db/schema");
        const { eq, and } = await import("drizzle-orm");
        const { ensureDbSetup } = await import("@/db/migrate-and-seed");

        await ensureDbSetup();

        const sessionId = `sccs_${studentId}_${encodeURIComponent(characterName)}`;
        const existing = await db
          .select()
          .from(storyCharacterChatSessions)
          .where(eq(storyCharacterChatSessions.id, sessionId))
          .limit(1);

        const newHistory = existing.length > 0 && Array.isArray(existing[0].messages)
          ? [...(existing[0].messages as any[])]
          : [];

        newHistory.push(
          { role: "user", content: cleanMsg, timestamp: new Date().toISOString() },
          { role: "character", content: reply, languageTip, timestamp: new Date().toISOString() }
        );

        if (existing.length > 0) {
          await db
            .update(storyCharacterChatSessions)
            .set({
              messages: newHistory,
              updatedAt: new Date(),
            })
            .where(eq(storyCharacterChatSessions.id, sessionId));
        } else {
          await db.insert(storyCharacterChatSessions).values({
            id: sessionId,
            studentId,
            gradeId: gradeId || "grade_sec_1",
            characterName,
            messages: newHistory,
            updatedAt: new Date(),
          });
        }

        const allChatSessions = await db
          .select({ characterName: storyCharacterChatSessions.characterName })
          .from(storyCharacterChatSessions)
          .where(eq(storyCharacterChatSessions.studentId, studentId));

        const distinctChars = new Set(allChatSessions.map((s) => s.characterName));

        if (distinctChars.size >= 3) {
          const existingBadge = await db
            .select()
            .from(storyStudentBadges)
            .where(
              and(
                eq(storyStudentBadges.studentId, studentId),
                eq(storyStudentBadges.badgeCode, "character_expert")
              )
            )
            .limit(1);

          if (existingBadge.length === 0) {
            const badgeId = `sbadge_${studentId}_char_expert`;
            earnedBadgeObj = {
              id: badgeId,
              studentId,
              badgeCode: "character_expert",
              badgeNameAr: "خبير حوار الشخصيات",
              badgeNameEn: "Character Dialogue Master",
              badgeIcon: "🎭",
              earnedAt: new Date(),
            };
            await db.insert(storyStudentBadges).values(earnedBadgeObj);
            badgeEarned = true;
          }
        }
      } catch (dbErr) {
        console.warn("DB character chat persistence skipped:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      reply,
      languageTip,
      badgeEarned,
      newBadge: earnedBadgeObj,
    });
  } catch (error: any) {
    console.error("POST /api/story-world/character-chat error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to talk to character" },
      { status: 500 }
    );
  }
}
