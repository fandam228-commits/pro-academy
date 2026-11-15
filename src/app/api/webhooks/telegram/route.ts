import { db } from "@/db";
import { telegramAccounts, parentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { sendTelegramMessage } from "@/lib/telegram-bot-api";

export async function POST(req: Request) {
  await ensureDbSetup();

  try {
    const update = await req.json();
    const message = update?.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat?.id);
    const text = message.text.trim();
    const fromUsername = message.from?.username || "";
    const fromFirstName = message.from?.first_name || "";

    // 1. Check for /start with pairing parameter or /link command
    // e.g. "/start LINK-ABC123" or "/link LINK-ABC123"
    let pairingCodeMatch = text.match(/^\/start\s+(LINK-[A-Z0-9]+)$/i) || text.match(/^\/link\s+(LINK-[A-Z0-9]+)$/i);

    if (pairingCodeMatch) {
      const code = pairingCodeMatch[1].toUpperCase();

      const tgRows = await db
        .select()
        .from(telegramAccounts)
        .where(eq(telegramAccounts.pairingCode, code))
        .limit(1);

      if (tgRows.length === 0) {
        await sendTelegramMessage({
          chatId,
          text: "⚠️ <b>كود الربط غير صحيح أو لم يتم العثور عليه.</b>\nيرجى فتح لوحة التحكم بالأكاديمية وتوليد كود ربط جديد.",
        });
        return NextResponse.json({ ok: true });
      }

      const pending = tgRows[0];
      if (pending.pairingExpiresAt && new Date(pending.pairingExpiresAt) < new Date()) {
        await sendTelegramMessage({
          chatId,
          text: "⏳ <b>عذراً، كود الربط منتهي الصلاحية.</b>\nيرجى إنشاء كود جديد من المنصة.",
        });
        return NextResponse.json({ ok: true });
      }

      // Link account successfully
      await db
        .update(telegramAccounts)
        .set({
          chatId,
          telegramUsername: fromUsername || null,
          telegramFirstName: fromFirstName || null,
          isVerified: true,
          notificationsMuted: false,
          linkedAt: new Date(),
        })
        .where(eq(telegramAccounts.id, pending.id));

      const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, pending.parentId)).limit(1);
      const parentName = pRows[0]?.fullName || "ولي الأمر الفاضل";

      await sendTelegramMessage({
        chatId,
        text: `🎉 <b>أهلاً بك ${parentName}!</b>\n\nتم ربط حسابك في تيليجرام بنجاح مع <b>منصة مستر حبيب الرحمن للغة الإنجليزية — Professional Academy</b>.\n\nمن الآن فصاعداً ستصلك هنا تلقائياً:\n• إشعارات الحضور والغياب والتأخير في ثوانٍ.\n• نتائج امتحانات وكويزات الطالب فور رصدها.\n• روابط التقارير الأسبوعية والشهرية المعتمدة.\n\nلإيقاف الإشعارات مؤقتاً في أي وقت يمكنك إرسال الأمر: /stop`,
      });

      return NextResponse.json({ ok: true, status: "LINKED" });
    }

    // 2. /stop command to mute notifications
    if (text === "/stop") {
      await db
        .update(telegramAccounts)
        .set({ notificationsMuted: true })
        .where(eq(telegramAccounts.chatId, chatId));

      await sendTelegramMessage({
        chatId,
        text: "🔕 تم إيقاف استقبال الإشعارات مؤقتاً.\nلإعادة تفعيل الإشعارات مرة أخرى أرسل الأمر: /resume",
      });
      return NextResponse.json({ ok: true });
    }

    // 3. /resume command
    if (text === "/resume" || text === "/start") {
      await db
        .update(telegramAccounts)
        .set({ notificationsMuted: false })
        .where(eq(telegramAccounts.chatId, chatId));

      await sendTelegramMessage({
        chatId,
        text: "🔔 مرحباً بك في بوت منصة مستر حبيب الرحمن للغة الإنجليزية.\nإذا كنت تريد ربط حسابك كولي أمر، يرجى كتابة الأمر مصحوباً بكود الربط:\n<code>/link LINK-XXXXXX</code>",
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
