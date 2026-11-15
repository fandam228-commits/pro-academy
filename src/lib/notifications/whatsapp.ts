/**
 * Official WhatsApp Business Cloud API Integration
 * Supports Meta Graph API v21.0 for Automated Student Attendance Notifications
 */

export interface WhatsAppNotificationParams {
  parentPhone: string;
  studentName: string;
  status: "present" | "absent" | "late" | "excused";
  sessionTitle: string;
  timestamp: string;
}

export interface WhatsAppDeliveryResult {
  success: boolean;
  mode: "live" | "mock";
  messageId: string;
  status: "sent" | "mock_delivered" | "failed";
  recipientPhone: string;
  error?: string;
}

export async function sendWhatsAppAttendanceNotification(
  params: WhatsAppNotificationParams
): Promise<WhatsAppDeliveryResult> {
  const { parentPhone, studentName, status, sessionTitle, timestamp } = params;

  const isTestMode = process.env.NODE_ENV !== "production" || process.env.WHATSAPP_TEST_MODE !== "false";
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Format recipient phone to international E.164 without leading plus for WhatsApp API
  const cleanPhone = parentPhone.replace(/\D/g, "");

  // Safe Mock Delivery (Enforced when in test mode or without production credentials)
  if (isTestMode || !apiToken || !phoneNumberId) {
    const mockId = `wamid_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      mode: "mock",
      messageId: mockId,
      status: "mock_delivered",
      recipientPhone: cleanPhone,
    };
  }

  // Live WhatsApp Business Cloud API Dispatch (Meta Graph API)
  try {
    const statusTextAr =
      status === "present"
        ? "وصل إلى سنتر الوليد وبدأ الحضور"
        : status === "late"
        ? "حضر متأخراً عن الموعد المحدد"
        : status === "excused"
        ? "تم تسجيل غياب بعذر مقبول"
        : "لم يسجل حضوره وتغيب عن الحصة";

    const bodyText =
      `*سنتر الوليد — إشعار متابعة الحضور والغياب*\n\n` +
      `ولي أمر الطالب(ة): *${studentName}*\n` +
      `الحالة: *${statusTextAr}*\n` +
      `الحصة: *${sessionTitle}*\n` +
      `التوقيت: ${timestamp}\n\n` +
      `نظام المتابعة الآلية — Professional Academy`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: { preview_url: false, body: bodyText },
    };

    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        mode: "live",
        messageId: "",
        status: "failed",
        recipientPhone: cleanPhone,
        error: data.error?.message || "WhatsApp API request failed",
      };
    }

    const messageId = data.messages?.[0]?.id || `wamid_${Date.now()}`;
    return {
      success: true,
      mode: "live",
      messageId,
      status: "sent",
      recipientPhone: cleanPhone,
    };
  } catch (err: any) {
    return {
      success: false,
      mode: "live",
      messageId: "",
      status: "failed",
      recipientPhone: cleanPhone,
      error: err.message || "Network error",
    };
  }
}
