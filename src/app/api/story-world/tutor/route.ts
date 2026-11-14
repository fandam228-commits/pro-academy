import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/security";
import { interactWithStoryAITutor, TutorMode } from "@/lib/story-world/ai-tutor";

export async function POST(req: Request) {
  try {
    const auth = await getAuthContext(req);
    if (!auth?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to interact with the Story AI Tutor." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      mode = "teacher",
      storyId,
      chapterId,
      message = "",
      characterName,
      questionId,
      studentAnswer
    } = body;

    const cleanMsg = String(message || studentAnswer || "").trim();
    if (!cleanMsg && mode !== "exam_prep") {
      return NextResponse.json(
        { success: false, error: "Message or question is required." },
        { status: 400 }
      );
    }

    const tutorResult = await interactWithStoryAITutor({
      mode: mode as TutorMode,
      storyId,
      chapterId,
      message: cleanMsg,
      characterName,
      questionId,
      studentAnswer: studentAnswer ? String(studentAnswer).trim() : undefined
    });

    return NextResponse.json(tutorResult);
  } catch (error: any) {
    console.error("POST /api/story-world/tutor error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process AI Tutor interaction." },
      { status: 500 }
    );
  }
}
