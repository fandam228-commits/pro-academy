import { db } from "@/db";
import {
  storyCharacterChatSessions,
  storyStudentBadges,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
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
    } else if (charNameLower.includes("dantès") || charNameLower.includes("monte cristo") || charNameLower.includes("dantes")) {
      reply = `All human wisdom is contained in these two words: 'Wait and hope.' Through the darkest trials, knowledge, patience, and unwavering justice shall always prevail.`;
      languageTip = `💡 Tip from Mr. Habib: Notice the imperative mood ('Wait and hope'). It is effective for delivering memorable, authoritative maxims.`;
    } else if (charNameLower.includes("challenger")) {
      reply = `Preposterous doubts! Science demands evidence, not timid speculation. The plateau exists, and only those with fortitude and an observant eye can comprehend its living wonders!`;
      languageTip = `💡 Tip from Mr. Habib: Professor Challenger speaks with strong academic adjectives ('preposterous', 'observant'). Enrich your Thanawya Amma essays by replacing basic words with precise academic vocabulary!`;
    } else {
      reply = `Greetings! In our story, every action carries meaning. Regarding your observation: literature invites us to think critically and learn from the journeys of others.`;
      languageTip = `💡 Tip from Mr. Habib: Great phrasing! Consistent daily practice with active recall is the secret to mastering fluent English conversation.`;
    }

    // Persist session messages
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

    // Check for Character Expert Badge (talked to 3 distinct characters)
    const allChatSessions = await db
      .select({ characterName: storyCharacterChatSessions.characterName })
      .from(storyCharacterChatSessions)
      .where(eq(storyCharacterChatSessions.studentId, studentId));

    const distinctChars = new Set(allChatSessions.map((s) => s.characterName));
    let badgeEarned = false;

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
        await db.insert(storyStudentBadges).values({
          id: `badge_ce_${Date.now()}`,
          studentId,
          badgeCode: "character_expert",
          badgeNameAr: "خبير الشخصيات الأدبية",
          badgeNameEn: "Character Expert",
          badgeIcon: "🎭",
          earnedAt: new Date(),
        });
        badgeEarned = true;
      }
    }

    return NextResponse.json({
      success: true,
      characterName,
      reply,
      languageTip,
      badgeEarned,
      history: newHistory,
    });
  } catch (error: any) {
    console.error("POST /api/story-world/character-chat error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Character chat unavailable" },
      { status: 500 }
    );
  }
}
