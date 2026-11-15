import test from "node:test";
import assert from "node:assert/strict";

// Core WhatsApp Notification Logic (Meta Graph API v21.0 payload validator)
function formatWhatsAppPayload({ parentPhone, studentName, status, sessionTitle, timestamp }) {
  const cleanPhone = parentPhone.replace(/\D/g, "");
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

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: { preview_url: false, body: bodyText },
  };
}

// Core Telegram Bot Message Validator
function formatTelegramMessage({ studentName, status, sessionTitle, timestamp }) {
  const emoji = status === "present" ? "✅" : status === "late" ? "⏳" : status === "excused" ? "📄" : "❌";
  const statusTextAr =
    status === "present"
      ? "حاضر (تم تسجيل الوصول بالسنتر)"
      : status === "late"
      ? "متأخر عن الموعد"
      : status === "excused"
      ? "غياب بعذر"
      : "غائب (لم يحضر الحصة)";

  return (
    `${emoji} *سنتر الوليد — تقرير الحضور اليومي*\n\n` +
    `👤 *الطالب:* ${studentName}\n` +
    `📌 *الحالة:* ${statusTextAr}\n` +
    `📚 *الحصة:* ${sessionTitle}\n` +
    `🕒 *الوقت:* ${timestamp}\n\n` +
    `_Professional Academy Learning Gateway_`
  );
}

// Deduplication Engine
class NotificationDeduplicationEngine {
  constructor() {
    this.keys = new Set();
  }

  isDuplicate(studentId, sessionDate, sessionTitle, status) {
    const key = `notif_${studentId}_${sessionDate}_${sessionTitle}_${status}`;
    if (this.keys.has(key)) return true;
    this.keys.add(key);
    return false;
  }
}

test("WhatsApp Business Cloud API payload is formatted properly according to Meta v21.0 specs", () => {
  const payload = formatWhatsAppPayload({
    parentPhone: "+20 100 123 4567",
    studentName: "أحمد محمد علي",
    status: "present",
    sessionTitle: "حصة الأحد 2 م - أولى ثانوي",
    timestamp: "2026-11-15 14:00",
  });

  assert.equal(payload.messaging_product, "whatsapp");
  assert.equal(payload.to, "201001234567");
  assert.ok(payload.text.body.includes("أحمد محمد علي"));
  assert.ok(payload.text.body.includes("وصل إلى سنتر الوليد وبدأ الحضور"));
});

test("Telegram Bot notification correctly formats Markdown with student status", () => {
  const msg = formatTelegramMessage({
    studentName: "سارة محمود",
    status: "absent",
    sessionTitle: "حصة الثالث الإعدادي",
    timestamp: "2026-11-15 15:30",
  });

  assert.ok(msg.includes("❌"));
  assert.ok(msg.includes("*الطالب:* سارة محمود"));
  assert.ok(msg.includes("غائب (لم يحضر الحصة)"));
});

test("Duplicate notification prevention blocks repeated notifications for the same student on the same date", () => {
  const engine = new NotificationDeduplicationEngine();

  const isDup1 = engine.isDuplicate("usr_waled_10", "2026-11-15", "حصة الأحد 2", "present");
  assert.equal(isDup1, false, "First trigger should not be duplicate");

  const isDup2 = engine.isDuplicate("usr_waled_10", "2026-11-15", "حصة الأحد 2", "present");
  assert.equal(isDup2, true, "Second trigger with same student and date must be blocked as duplicate");

  // Different date or different student should not be blocked
  const isDup3 = engine.isDuplicate("usr_waled_10", "2026-11-16", "حصة الأحد 2", "present");
  assert.equal(isDup3, false, "Different date must be allowed");

  const isDup4 = engine.isDuplicate("usr_waled_11", "2026-11-15", "حصة الأحد 2", "present");
  assert.equal(isDup4, false, "Different student must be allowed");
});
