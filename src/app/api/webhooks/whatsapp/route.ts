import { db } from "@/db";
import { notificationLogs, notificationQueue } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(req: Request) {
  // Meta Webhook Verification Handshake
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "habib_academy_meta_verify_token_2026";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge || "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  await ensureDbSetup();

  try {
    const body = await req.json();

    // Process Meta WhatsApp status updates
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const statuses = change?.value?.statuses || [];
        for (const st of statuses) {
          const wamid = st?.id;
          const status = st?.status; // 'sent' | 'delivered' | 'read' | 'failed'

          if (wamid && status) {
            // Update notification_logs
            await db
              .update(notificationLogs)
              .set({
                status: status === "read" ? "read" : status === "delivered" ? "delivered" : status,
                rawResponse: st,
              })
              .where(eq(notificationLogs.externalMessageId, wamid));

            // Also update queue if found
            const matchingLogs = await db
              .select({ queueId: notificationLogs.queueId })
              .from(notificationLogs)
              .where(eq(notificationLogs.externalMessageId, wamid))
              .limit(1);

            if (matchingLogs[0]?.queueId) {
              await db
                .update(notificationQueue)
                .set({ status })
                .where(eq(notificationQueue.id, matchingLogs[0].queueId));
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "EVENT_RECEIVED" });
  } catch (error) {
    console.error("WhatsApp Webhook error:", error);
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}
