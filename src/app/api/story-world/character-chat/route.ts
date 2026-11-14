import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/security";
import { interactWithCharacterAgent } from "@/lib/story-world/character-agents";

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

    // Process message through Dedicated Educational Character Agent
    const agentResult = await interactWithCharacterAgent({
      characterName,
      message: cleanMsg,
      chapterId,
      gradeId,
    });

    const reply = agentResult.reply;
    const languageTip = agentResult.languageTip;

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
      character: agentResult.character,
      contextCitations: agentResult.contextCitations,
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
