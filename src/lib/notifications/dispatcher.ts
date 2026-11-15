import { db } from "@/db";
import { notifications, parentLinks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppAttendanceNotification, WhatsAppDeliveryResult } from "./whatsapp";
import { sendTelegramAttendanceNotification, TelegramDeliveryResult } from "./telegram";

export interface AttendanceNotificationEvent {
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late" | "excused";
  sessionTitle: string;
  sessionDate: string; // YYYY-MM-DD
  parentPhone?: string | null;
  telegramChatId?: string | null;
}

export interface DispatchSummary {
  eventId: string;
  studentId: string;
  studentName: string;
  status: string;
  duplicatePrevented: boolean;
  channels: {
    inApp: { success: boolean; id?: string };
    whatsapp: WhatsAppDeliveryResult | { success: boolean; status: string };
    telegram: TelegramDeliveryResult | { success: boolean; status: string };
  };
  timestamp: string;
}

// In-Memory Deduplication Set (Prevents Duplicate Notifications per Student per Session Date)
const sentNotificationKeys = new Set<string>();

// Delivery Audit Log (Kept in memory for tracking during session)
const deliveryAuditLogs: DispatchSummary[] = [];

export async function dispatchAttendanceNotification(
  event: AttendanceNotificationEvent
): Promise<DispatchSummary> {
  const { studentId, studentName, status, sessionTitle, sessionDate, parentPhone, telegramChatId } = event;
  const nowIso = new Date().toISOString();
  const timeFormatted = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  // 1. DUPLICATE NOTIFICATION PREVENTION
  // Key format: notif_<studentId>_<sessionDate>_<sessionTitle>_<status>
  const dedupKey = `notif_${studentId}_${sessionDate}_${sessionTitle}_${status}`;
  if (sentNotificationKeys.has(dedupKey)) {
    const duplicateSummary: DispatchSummary = {
      eventId: dedupKey,
      studentId,
      studentName,
      status,
      duplicatePrevented: true,
      channels: {
        inApp: { success: false },
        whatsapp: { success: false, status: "skipped_duplicate" },
        telegram: { success: false, status: "skipped_duplicate" },
      },
      timestamp: nowIso,
    };
    return duplicateSummary;
  }
  sentNotificationKeys.add(dedupKey);

  const summary: DispatchSummary = {
    eventId: dedupKey,
    studentId,
    studentName,
    status,
    duplicatePrevented: false,
    channels: {
      inApp: { success: false },
      whatsapp: { success: false, status: "skipped_no_phone" },
      telegram: { success: false, status: "skipped_no_chat_id" },
    },
    timestamp: nowIso,
  };

  try {
    // 2. IN-APP NOTIFICATION FOR LINKED PARENT ACCOUNTS
    const links = await db.select().from(parentLinks).where(eq(parentLinks.studentId, studentId));
    for (const link of links) {
      const statusAr =
        status === "present"
          ? "حضر إلى السنتر"
          : status === "late"
          ? "تأخر عن موعد الحصة"
          : status === "excused"
          ? "غياب بعذر"
          : "تغيب عن الحصة";

      const notifId = `notif_${Date.now()}_${link.parentId}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(notifications).values({
        id: notifId,
        userId: link.parentId,
        title: `متابعة حضور: ${studentName}`,
        message: `تم تسجيل الطالب (${studentName}) بحالة: ${statusAr} في حصة "${sessionTitle}" بتاريخ ${sessionDate}.`,
        type: "announcement",
        isRead: false,
        createdAt: new Date(),
      });
      summary.channels.inApp = { success: true, id: notifId };
    }

    // 3. WHATSAPP BUSINESS CLOUD API DISPATCH
    if (parentPhone && parentPhone.trim() !== "") {
      const waResult = await sendWhatsAppAttendanceNotification({
        parentPhone,
        studentName,
        status,
        sessionTitle,
        timestamp: `${sessionDate} ${timeFormatted}`,
      });
      summary.channels.whatsapp = waResult;
    }

    // 4. TELEGRAM BOT API DISPATCH
    const tgResult = await sendTelegramAttendanceNotification({
      parentChatId: telegramChatId || undefined,
      studentName,
      status,
      sessionTitle,
      timestamp: `${sessionDate} ${timeFormatted}`,
    });
    summary.channels.telegram = tgResult;
  } catch (err) {
    console.error("Attendance notification dispatch error:", err);
  }

  // Record audit log
  deliveryAuditLogs.push(summary);
  if (deliveryAuditLogs.length > 500) deliveryAuditLogs.shift();

  return summary;
}

export function getNotificationDeliveryLogs(): DispatchSummary[] {
  return [...deliveryAuditLogs];
}
