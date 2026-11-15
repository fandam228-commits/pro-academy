import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dialogues } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAllDialogues, getDialoguesByGrade, getDialogueById, DialogueGrade, ALL_DIALOGUES } from "@/data/dialogue-center";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade") as DialogueGrade | null;
    const id = searchParams.get("id");
    const includeAnswers = searchParams.get("includeAnswers") === "true";

    // Single dialogue request
    if (id) {
      // Try database first if configured
      if (db) {
        try {
          const result = await db
            .select()
            .from(dialogues)
            .where(eq(dialogues.id, id))
            .limit(1);

          if (result.length > 0) {
            const item = result[0];
            return NextResponse.json({
              success: true,
              data: includeAnswers ? item : { ...item, approvedAnswers: {} },
              source: "database",
            });
          }
        } catch {
          // Fall back to in-memory JSON
        }
      }

      const item = getDialogueById(id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: "Dialogue not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: includeAnswers ? item : { ...item, approvedAnswers: {} },
        source: "static_seed",
      });
    }

    // List dialogues
    let list = grade ? getDialoguesByGrade(grade) : getAllDialogues();

    if (db) {
      try {
        const query = grade
          ? db.select().from(dialogues).where(eq(dialogues.grade, grade))
          : db.select().from(dialogues);
        const dbList = await query;
        if (dbList.length > 0) {
          list = dbList as any;
        }
      } catch {
        // Fall back to in-memory JSON
      }
    }

    const sanitizedList = list.map((item) =>
      includeAnswers ? item : { ...item, approvedAnswers: {} }
    );

    return NextResponse.json({
      success: true,
      count: sanitizedList.length,
      grade: grade || "all",
      data: sanitizedList,
    });
  } catch (error: any) {
    console.error("GET /api/dialogues error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch dialogues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, approvedAnswers, isPublished } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing dialogue ID" },
        { status: 400 }
      );
    }

    // Update in-memory item
    const staticItem = ALL_DIALOGUES.find((d) => d.id === id);
    if (staticItem) {
      if (approvedAnswers) staticItem.approvedAnswers = approvedAnswers;
      if (isPublished !== undefined) staticItem.published = isPublished;
    }

    // Update DB if connected
    if (db) {
      try {
        await db
          .update(dialogues)
          .set({
            ...(approvedAnswers ? { approvedAnswers } : {}),
            ...(isPublished !== undefined ? { isPublished } : {}),
            updatedAt: new Date(),
          })
          .where(eq(dialogues.id, id));
      } catch (dbErr) {
        console.warn("DB update failed, updated in-memory:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Dialogue updated successfully",
      data: staticItem,
    });
  } catch (error: any) {
    console.error("POST /api/dialogues error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update dialogue" },
      { status: 500 }
    );
  }
}
