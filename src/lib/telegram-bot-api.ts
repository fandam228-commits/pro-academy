/**
 * Official Telegram Bot API Integration
 * Client for sending notifications, secure deep-link pairing,
 * webhook processing, and safe Sandbox Test Mode fallback.
 */

export interface TelegramSendResult {
  success: boolean;
  isMock: boolean;
  messageId?: string;
  error?: string;
  raw?: any;
}

export interface TelegramSendOptions {
  chatId: string; // Recipient numeric chat ID
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disableWebPagePreview?: boolean;
}

export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return Boolean(
    token &&
    token.trim() !== "" &&
    token !== "mock_telegram_token" &&
    !token.includes("BOT_TOKEN")
  );
}

export function getTelegramBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME || "HabibAcademyBot";
}

/**
 * Generate a secure, unique pairing code (e.g. LINK-7X9K2W)
 */
export function generateTelegramPairingCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LINK-${token}`;
}

/**
 * Get direct deep-link to start conversation with the academy Telegram bot
 */
export function getTelegramPairingDeepLink(pairingCode: string): string {
  const botUsername = getTelegramBotUsername().replace(/^@/, "");
  return `https://t.me/${botUsername}?start=${pairingCode}`;
}

/**
 * Send message via Telegram Bot API
 */
export async function sendTelegramMessage(options: TelegramSendOptions): Promise<TelegramSendResult> {
  if (!options.chatId) {
    return { success: false, isMock: false, error: "Missing Telegram chatId." };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Sandbox Test Mode Fallback
  if (!isTelegramConfigured()) {
    const mockId = `tg_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      isMock: true,
      messageId: mockId,
      raw: {
        ok: true,
        result: {
          message_id: mockId,
          chat: { id: options.chatId },
          text: options.text,
          date: Math.floor(Date.now() / 1000),
          status: "accepted (sandbox mock)",
        },
      },
    };
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;

  const requestBody = {
    chat_id: options.chatId,
    text: options.text,
    parse_mode: options.parseMode || "HTML",
    disable_web_page_preview: options.disableWebPagePreview ?? false,
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      const errorMsg = data?.description || `Telegram API error HTTP ${res.status}`;
      return {
        success: false,
        isMock: false,
        error: errorMsg,
        raw: data,
      };
    }

    const messageId = String(data?.result?.message_id || "");
    return {
      success: true,
      isMock: false,
      messageId,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      isMock: false,
      error: err?.message || "Network error connecting to Telegram Bot API",
    };
  }
}
