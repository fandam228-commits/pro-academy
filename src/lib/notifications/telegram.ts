/**
 * Telegram Bot API Integration
 * Supports Instant Parent Attendance & Absence Alerts
 */

export interface TelegramNotificationParams {
  parentChatId?: string;
  studentName: string;
  status: "present" | "absent" | "late" | "excused";
  sessionTitle: string;
  timestamp: string;
}

export interface TelegramDeliveryResult {
  success: boolean;
  mode: "live" | "mock";
  messageId: string;
  status: "sent" | "mock_delivered" | "failed";
  chatId: string;
  error?: string;
}

export async function sendTelegramAttendanceNotification(
  params: TelegramNotificationParams
): Promise<TelegramDeliveryResult> {
  const { parentChatId, studentName, status, sessionTitle, timestamp } = params;

  const isTestMode = process.env.NODE_ENV !== "production" || process.env.TELEGRAM_TEST_MODE !== "false";
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = parentChatId || process.env.TELEGRAM_DEFAULT_CHANNEL_ID || "mock_chat_id";

  // Safe Mock Delivery (Enforced when in test mode or without production bot token)
  if (isTestMode || !botToken) {
    const mockId = `tg_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      mode: "mock",
      messageId: mockId,
      status: "mock_delivered",
      chatId: targetChatId,
    };
  }

  // Live Telegram Bot API Dispatch
  try {
    const emoji = status === "present" ? "✅" : status === "late" ? "⏳" : status === "excused" ? "📄" : "❌";
    const statusTextAr =
      status === "present"
        ? "حاضر (تم تسجيل الوصول بالسنتر)"
        : status === "late"
        ? "متأخر عن الموعد"
        : status === "excused"
        ? "غياب بعذر"
        : "غائب (لم يحضر الحصة)";

    const messageText =
      `${emoji} *سنتر الوليد — تقرير الحضور اليومي*\n\n` +
      `👤 *الطالب:* ${studentName}\n` +
      `📌 *الحالة:* ${statusTextAr}\n` +
      `📚 *الحصة:* ${sessionTitle}\n` +
      `🕒 *الوقت:* ${timestamp}\n\n` +
      `_Professional Academy Learning Gateway_`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: messageText,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        success: false,
        mode: "live",
        messageId: "",
        status: "failed",
        chatId: targetChatId,
        error: data.description || "Telegram API request failed",
      };
    }

    return {
      success: true,
      mode: "live",
      messageId: String(data.result?.message_id || Date.now()),
      status: "sent",
      chatId: targetChatId,
    };
  } catch (err: any) {
    return {
      success: false,
      mode: "live",
      messageId: "",
      status: "failed",
      chatId: targetChatId,
      error: err.message || "Network error",
    };
  }
}
