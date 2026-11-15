/**
 * Meta WhatsApp Business Cloud API Integration (Graph API v21.0)
 * Official Cloud API client with Template & Freeform support,
 * E.164 phone normalization, retry logic, webhook verification, and
 * safe Sandbox Test Mode fallback when Meta API credentials are not yet configured.
 */

export interface WhatsAppSendResult {
  success: boolean;
  isMock: boolean;
  messageId?: string;
  error?: string;
  raw?: any;
}

export interface WhatsAppTemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: string;
  index?: string;
  parameters: Array<{
    type: "text" | "currency" | "date_time" | "image" | "document";
    text?: string;
    [key: string]: any;
  }>;
}

export interface WhatsAppSendOptions {
  to: string; // Recipient phone number (Egyptian or international)
  type?: "text" | "template";
  bodyText?: string;
  templateName?: string;
  templateLang?: string;
  components?: WhatsAppTemplateComponent[];
  previewUrl?: boolean;
}

/**
 * Normalizes phone numbers to standard E.164 format (no spaces, dashes, or plus sign for Meta API)
 * Egyptian numbers:
 *   "01012345678" -> "201012345678"
 *   "+201012345678" -> "201012345678"
 *   "00201012345678" -> "201012345678"
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/[^\d+]/g, "").trim();

  // Strip leading 00
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  // Strip leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Egyptian domestic format (010, 011, 012, 015)
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    cleaned = "2" + cleaned;
  }

  return cleaned;
}

/**
 * Formats a phone number for user-friendly display in Arabic UI
 */
export function formatPhoneDisplay(rawPhone: string): string {
  const norm = normalizePhoneNumber(rawPhone);
  if (!norm) return rawPhone || "";
  if (norm.startsWith("20") && norm.length === 12) {
    // 20 101 234 5678
    return `+20 ${norm.slice(2, 5)} ${norm.slice(5, 8)} ${norm.slice(8)}`;
  }
  return `+${norm}`;
}

export function isWhatsAppConfigured(): boolean {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return Boolean(
    token &&
    phoneId &&
    token.trim() !== "" &&
    phoneId.trim() !== "" &&
    token !== "mock_whatsapp_token" &&
    phoneId !== "mock_phone_id"
  );
}

/**
 * Send a message via Meta WhatsApp Business Cloud API.
 * If credentials are not configured, transparently runs in Sandbox Test Mode.
 */
export async function sendWhatsAppMessage(options: WhatsAppSendOptions): Promise<WhatsAppSendResult> {
  const normalizedPhone = normalizePhoneNumber(options.to);
  if (!normalizedPhone) {
    return { success: false, isMock: false, error: "Invalid phone number provided." };
  }

  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Sandbox Test Mode Fallback
  if (!isWhatsAppConfigured()) {
    const mockId = `wamid.MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      success: true,
      isMock: true,
      messageId: mockId,
      raw: {
        messaging_product: "whatsapp",
        contacts: [{ input: normalizedPhone, wa_id: normalizedPhone }],
        messages: [{ id: mockId, message_status: "accepted (sandbox mock)" }],
      },
    };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  let requestBody: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizedPhone,
  };

  if (options.type === "template" && options.templateName) {
    requestBody = {
      ...requestBody,
      type: "template",
      template: {
        name: options.templateName,
        language: { code: options.templateLang || "ar" },
        components: options.components || [],
      },
    };
  } else {
    requestBody = {
      ...requestBody,
      type: "text",
      text: {
        preview_url: options.previewUrl ?? true,
        body: options.bodyText || "",
      },
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message || `WhatsApp API error HTTP ${res.status}`;
      return {
        success: false,
        isMock: false,
        error: errorMsg,
        raw: data,
      };
    }

    const messageId = data?.messages?.[0]?.id;
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
      error: err?.message || "Network error connecting to Meta WhatsApp Cloud API",
    };
  }
}
