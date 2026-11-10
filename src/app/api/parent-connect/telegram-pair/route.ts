import { db } from "@/db";
import { telegramAccounts, parentProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import {
  generateTelegramPairingCode,
  getTelegramPairingDeepLink,
  getTelegramBotUsername,
  isTelegramConfigured,
} from "@/lib/telegram-bot-api";

export async function POST(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher", "parent"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { parentId } = body;

    if (!parentId) {
      return NextResponse.json({ error: "parentId is required" }, { status: 400 });
    }

    const parentRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, parentId)).limit(1);
    if (parentRows.length === 0) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    const pairingCode = generateTelegramPairingCode();
    const pairingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const existingTg = await db.select().from(telegramAccounts).where(eq(telegramAccounts.parentId, parentId)).limit(1);

    if (existingTg.length > 0) {
      await db
        .update(telegramAccounts)
        .set({
          pairingCode,
          pairingExpiresAt,
        })
        .where(eq(telegramAccounts.id, existingTg[0].id));
    } else {
      await db.insert(telegramAccounts).values({
        id: `tg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        parentId,
        pairingCode,
        pairingExpiresAt,
        isVerified: false,
      });
    }

    const deepLink = getTelegramPairingDeepLink(pairingCode);

    return NextResponse.json({
      success: true,
      pairingCode,
      deepLink,
      botUsername: getTelegramBotUsername(),
      isLiveBot: isTelegramConfigured(),
      instructionsAr: `افتح تطبيق تيليجرام وابدأ المحادثة مع بوت الأكاديمية (@${getTelegramBotUsername()})، ثم اضغط على زر Start أو أرسل الكود: /link ${pairingCode}`,
    });
  } catch (error) {
    console.error("Telegram Pair POST error:", error);
    return NextResponse.json({ error: "فشل في توليد كود الربط" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher", "parent"]);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json({ error: "parentId required" }, { status: 400 });
    }

    const rows = await db.select().from(telegramAccounts).where(eq(telegramAccounts.parentId, parentId)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ paired: false });
    }

    const tg = rows[0];
    return NextResponse.json({
      paired: Boolean(tg.isVerified && tg.chatId),
      chatId: tg.chatId,
      username: tg.telegramUsername,
      pairingCode: tg.pairingCode,
      expiresAt: tg.pairingExpiresAt,
      isExpired: tg.pairingExpiresAt ? new Date(tg.pairingExpiresAt) < new Date() : false,
      isConfigured: isTelegramConfigured(),
    });
  } catch (error) {
    console.error("Telegram Pair GET error:", error);
    return NextResponse.json({ error: "Failed to check pairing status" }, { status: 500 });
  }
}
