import { db } from "@/db";
import { liveChat } from "@/db/schema";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { message, channel } = await req.json();

    // Prevent user impersonation: always use authenticated user identity
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const newMessage = {
      id: `chat_${Date.now()}`,
      senderId: ctx.user.id,
      senderName: ctx.user.name,
      senderRole: ctx.user.role,
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
