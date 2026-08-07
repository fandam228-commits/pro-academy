import { db } from "@/db";
import { liveChat } from "@/db/schema";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET() {
  await ensureDbSetup();
  try {
    const messages = await db.select().from(liveChat);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const { senderId, senderName, senderRole, message, channel } = await req.json();

    const newMessage = {
      id: `chat_${Date.now()}`,
      senderId: senderId || "usr_student_1",
      senderName: senderName || "Student",
      senderRole: senderRole || "student",
      message: message.trim(),
      channel: channel || "general",
    };

    await db.insert(liveChat).values(newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
