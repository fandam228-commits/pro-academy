import { db } from "@/db";
import {
  parentProfiles,
  parentStudentLinks,
  parentNotificationPreferences,
  telegramAccounts,
  notificationTemplates,
  notificationQueue,
  notificationLogs,
  attendanceNotificationEvents,
  users,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendWhatsAppMessage, formatPhoneDisplay } from "./whatsapp-cloud-api";
import { sendTelegramMessage } from "./telegram-bot-api";
import { createSignedReportToken } from "./smart-reports";

export interface AttendanceDispatchParams {
  attendanceRecordId: string;
  studentId: string;
  studentName?: string;
  sessionTitle: string;
  sessionDate: string; // YYYY-MM-DD
  status: "present" | "absent" | "late" | "departure";
  minutesLate?: number;
  markedBy?: string;
}

export interface ExamDispatchParams {
  studentId: string;
  examTitle: string;
  score: number;
  total: number;
  percentage: number;
  feedback?: string;
  teacherId?: string;
}

export interface SmartReportDispatchParams {
  studentId: string;
  period: "weekly" | "monthly";
  senderUserId?: string;
}

export interface TeacherNoteDispatchParams {
  studentId: string;
  parentId?: string;
  noteText: string;
  teacherId?: string;
}

export interface BulkBroadcastParams {
  recipientParentIds: string[];
  channel: "whatsapp" | "telegram" | "all";
  messageText: string;
  templateCode?: string;
  senderUserId?: string;
}

/**
 * Replace placeholders in template text (e.g. {{student_name}})
 */
function fillTemplatePlaceholders(text: string, variables: Record<string, string | number>): string {
  let filled = text;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    filled = filled.replace(regex, String(val ?? ""));
  }
  return filled;
}

/**
 * Dispatches an automated attendance notification to all verified parents of the student
 */
export async function dispatchAttendanceNotification(params: AttendanceDispatchParams) {
  const { attendanceRecordId, studentId, sessionTitle, sessionDate, status, minutesLate } = params;

  // 1. Get student name if not provided
  let studentName = params.studentName;
  if (!studentName) {
    const stRows = await db.select({ name: users.name }).from(users).where(eq(users.id, studentId)).limit(1);
    studentName = stRows[0]?.name || "الطالب";
  }

  // 2. Find linked parents with attendance notification rights
  const links = await db
    .select()
    .from(parentStudentLinks)
    .where(and(eq(parentStudentLinks.studentId, studentId), eq(parentStudentLinks.canReceiveAttendance, true)));

  if (links.length === 0) return { dispatched: 0, reason: "No linked parents found" };

  // 3. Find template
  let templateCode = "att_present";
  if (status === "absent") templateCode = "att_absent";
  else if (status === "late") templateCode = "att_late";

  const tmplRows = await db.select().from(notificationTemplates).where(eq(notificationTemplates.code, templateCode)).limit(1);
  const template = tmplRows[0];

  const nowTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  let dispatchedCount = 0;

  for (const link of links) {
    const parentRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, link.parentId)).limit(1);
    if (parentRows.length === 0) continue;
    const parent = parentRows[0];

    // Check consent & opt-out
    if (!parent.consentGiven || parent.optedOut) continue;

    // Check parent preferences
    const prefRows = await db.select().from(parentNotificationPreferences).where(eq(parentNotificationPreferences.parentId, parent.id)).limit(1);
    const prefs = prefRows[0];
    if (prefs) {
      if (status === "absent" && !prefs.notifyOnAbsent) continue;
      if (status === "present" && !prefs.notifyOnPresent) continue;
      if (status === "late" && !prefs.notifyOnLate) continue;
    }

    // Anti-Duplication Check
    const existingEvents = await db
      .select()
      .from(attendanceNotificationEvents)
      .where(
        and(
          eq(attendanceNotificationEvents.attendanceRecordId, attendanceRecordId),
          eq(attendanceNotificationEvents.parentId, parent.id),
          eq(attendanceNotificationEvents.statusMarked, status)
        )
      )
      .limit(1);

    if (existingEvents.length > 0) {
      continue; // Skip duplicate notification
    }

    // Render message body
    const vars = {
      student_name: studentName,
      session_title: sessionTitle,
      date: sessionDate,
      time: nowTime,
      minutes: minutesLate || 15,
    };

    const messageText = template
      ? fillTemplatePlaceholders(template.bodyTextAr, vars)
      : `إشعار حضور منصة مستر حبيب الرحمن: تم تسجيل ${studentName} (${status}) بحصة ${sessionTitle} بتاريخ ${sessionDate}`;

    const idempotencyKey = `att_${attendanceRecordId}_${parent.id}_${status}`;
    const channelsToSend: ("whatsapp" | "telegram")[] = [];

    if (parent.preferredChannel === "whatsapp" || parent.preferredChannel === "both") {
      channelsToSend.push("whatsapp");
    }
    if (parent.preferredChannel === "telegram" || parent.preferredChannel === "both") {
      channelsToSend.push("telegram");
    }
    if (channelsToSend.length === 0) {
      channelsToSend.push("whatsapp"); // default fallback
    }

    // Dispatch per channel
    for (const channel of channelsToSend) {
      let recipient = parent.primaryPhone;
      let tgChatId: string | null = null;

      if (channel === "telegram") {
        const tgAccounts = await db
          .select()
          .from(telegramAccounts)
          .where(and(eq(telegramAccounts.parentId, parent.id), eq(telegramAccounts.isVerified, true)))
          .limit(1);
        if (tgAccounts.length === 0 || !tgAccounts[0].chatId) {
          // If Telegram requested but not paired yet, fallback or skip
          continue;
        }
        tgChatId = tgAccounts[0].chatId;
        recipient = tgChatId;
      }

      // Enqueue in notification_queue
      const queueId = `nq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await db.insert(notificationQueue).values({
        id: queueId,
        parentId: parent.id,
        studentId,
        channel,
        templateCode,
        recipient,
        payload: { text: messageText, variables: vars },
        status: "processing",
        idempotencyKey: `${idempotencyKey}_${channel}`,
      });

      // Send via respective API
      let sendResult: { success: boolean; isMock?: boolean; messageId?: string; error?: string } = {
        success: false,
      };
      if (channel === "whatsapp") {
        sendResult = await sendWhatsAppMessage({
          to: recipient,
          type: "text",
          bodyText: messageText,
        });
      } else {
        sendResult = await sendTelegramMessage({
          chatId: recipient,
          text: messageText,
        });
      }

      const logId = `nl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await db.insert(notificationLogs).values({
        id: logId,
        queueId,
        parentId: parent.id,
        studentId,
        channel,
        recipient,
        messageType: `attendance_${status}`,
        contentSummary: messageText.slice(0, 200),
        status: sendResult.success ? "sent" : "failed",
        externalMessageId: sendResult.messageId,
        errorMessage: sendResult.error,
        sentByUserId: params.markedBy || "system",
      });

      await db
        .update(notificationQueue)
        .set({
          status: sendResult.success ? "sent" : "failed",
          sentAt: sendResult.success ? new Date() : undefined,
          lastError: sendResult.error,
        })
        .where(eq(notificationQueue.id, queueId));

      dispatchedCount++;
    }

    // Record event to prevent duplicate notifications
    await db.insert(attendanceNotificationEvents).values({
      id: `ane_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      attendanceRecordId,
      studentId,
      parentId: parent.id,
      sessionDate,
      statusMarked: status,
    });
  }

  return { dispatched: dispatchedCount, status };
}

/**
 * Dispatches an automated exam / quiz result notification
 */
export async function dispatchExamResultNotification(params: ExamDispatchParams) {
  const { studentId, examTitle, score, total, percentage, feedback, teacherId } = params;

  const stRows = await db.select({ name: users.name }).from(users).where(eq(users.id, studentId)).limit(1);
  const studentName = stRows[0]?.name || "الطالب";

  const links = await db
    .select()
    .from(parentStudentLinks)
    .where(and(eq(parentStudentLinks.studentId, studentId), eq(parentStudentLinks.canReceiveGrades, true)));

  if (links.length === 0) return { dispatched: 0 };

  const tmplRows = await db.select().from(notificationTemplates).where(eq(notificationTemplates.code, "exam_result")).limit(1);
  const template = tmplRows[0];

  let gradeLabel = "ممتاز 🌟";
  if (percentage < 60) gradeLabel = "يحتاج مراجعة واهتمام ⚠️";
  else if (percentage < 75) gradeLabel = "جيد 👍";
  else if (percentage < 90) gradeLabel = "جيد جداً 👏";

  const vars = {
    student_name: studentName,
    exam_title: examTitle,
    score,
    total,
    percentage,
    grade_label: gradeLabel,
    feedback: feedback || "الاستمرار في حل تمارين القواعد والمذاكرة المنتظمة.",
  };

  const messageText = template
    ? fillTemplatePlaceholders(template.bodyTextAr, vars)
    : `منصة مستر حبيب الرحمن: نتيجة امتحان ${studentName} في ${examTitle}: ${score}/${total} (${percentage}%)`;

  let dispatchedCount = 0;

  for (const link of links) {
    const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, link.parentId)).limit(1);
    if (pRows.length === 0) continue;
    const parent = pRows[0];
    if (!parent.consentGiven || parent.optedOut) continue;

    // Check low-grade warning opt-in
    if (percentage < 60) {
      const prefRows = await db.select().from(parentNotificationPreferences).where(eq(parentNotificationPreferences.parentId, parent.id)).limit(1);
      if (prefRows[0] && !prefRows[0].notifyOnLowGradeWarning) continue;
    }

    const queueId = `nq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const recipient = parent.primaryPhone;

    await db.insert(notificationQueue).values({
      id: queueId,
      parentId: parent.id,
      studentId,
      channel: parent.preferredChannel === "telegram" ? "telegram" : "whatsapp",
      templateCode: "exam_result",
      recipient,
      payload: { text: messageText, variables: vars },
      status: "processing",
    });

    const sendResult = await sendWhatsAppMessage({
      to: recipient,
      bodyText: messageText,
    });

    await db.insert(notificationLogs).values({
      id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      queueId,
      parentId: parent.id,
      studentId,
      channel: "whatsapp",
      recipient,
      messageType: "exam_result",
      contentSummary: messageText.slice(0, 200),
      status: sendResult.success ? "sent" : "failed",
      externalMessageId: sendResult.messageId,
      errorMessage: sendResult.error,
      sentByUserId: teacherId || "system",
    });

    dispatchedCount++;
  }

  return { dispatched: dispatchedCount };
}

/**
 * Dispatches a smart weekly or monthly report with a cryptographically signed link
 */
export async function dispatchSmartReportNotification(params: SmartReportDispatchParams) {
  const { studentId, period, senderUserId } = params;

  const stRows = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
  if (stRows.length === 0) return { dispatched: 0 };
  const student = stRows[0];

  const links = await db
    .select()
    .from(parentStudentLinks)
    .where(and(eq(parentStudentLinks.studentId, studentId), eq(parentStudentLinks.canReceiveReports, true)));

  if (links.length === 0) return { dispatched: 0 };

  const templateCode = period === "weekly" ? "weekly_report" : "monthly_report";
  const tmplRows = await db.select().from(notificationTemplates).where(eq(notificationTemplates.code, templateCode)).limit(1);
  const template = tmplRows[0];

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let dispatchedCount = 0;

  for (const link of links) {
    const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, link.parentId)).limit(1);
    if (pRows.length === 0) continue;
    const parent = pRows[0];
    if (!parent.consentGiven || parent.optedOut) continue;

    const token = createSignedReportToken({ studentId, parentId: parent.id, period });
    const reportUrl = `${origin}/parent/report?token=${token}`;

    const vars = {
      student_name: student.name,
      attendance_rate: 96,
      homework_count: 5,
      avg_score: 88,
      month: new Date().toLocaleDateString("ar-EG", { month: "long" }),
      exams_taken: 4,
      progress_status: "متفوق ومتقدم",
      report_url: reportUrl,
    };

    const messageText = template
      ? fillTemplatePlaceholders(template.bodyTextAr, vars)
      : `منصة مستر حبيب الرحمن: تقرير ${student.name} متاح الآن عبر الرابط:\n${reportUrl}`;

    const sendResult = await sendWhatsAppMessage({
      to: parent.primaryPhone,
      bodyText: messageText,
    });

    await db.insert(notificationLogs).values({
      id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      parentId: parent.id,
      studentId,
      channel: "whatsapp",
      recipient: parent.primaryPhone,
      messageType: `${period}_report`,
      contentSummary: messageText.slice(0, 200),
      status: sendResult.success ? "sent" : "failed",
      externalMessageId: sendResult.messageId,
      errorMessage: sendResult.error,
      sentByUserId: senderUserId || "system",
    });

    dispatchedCount++;
  }

  return { dispatched: dispatchedCount };
}

/**
 * Dispatches a manual teacher note directly to a student's parent
 */
export async function dispatchManualTeacherNote(params: TeacherNoteDispatchParams) {
  const { studentId, parentId, noteText, teacherId } = params;

  let targetParentId = parentId;
  if (!targetParentId) {
    const links = await db.select().from(parentStudentLinks).where(eq(parentStudentLinks.studentId, studentId)).limit(1);
    if (links.length > 0) targetParentId = links[0].parentId;
  }
  if (!targetParentId) return { success: false, error: "No parent found for student" };

  const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, targetParentId)).limit(1);
  if (pRows.length === 0) return { success: false, error: "Parent profile not found" };
  const parent = pRows[0];

  const stRows = await db.select({ name: users.name }).from(users).where(eq(users.id, studentId)).limit(1);
  const studentName = stRows[0]?.name || "الطالب";

  const tmplRows = await db.select().from(notificationTemplates).where(eq(notificationTemplates.code, "custom_teacher_note")).limit(1);
  const template = tmplRows[0];

  const messageText = template
    ? fillTemplatePlaceholders(template.bodyTextAr, { student_name: studentName, note_content: noteText })
    : `💬 رسالة خاصة من مستر حبيب الرحمن بشأن الطالب/ة ${studentName}:\n\n${noteText}`;

  const sendResult = await sendWhatsAppMessage({
    to: parent.primaryPhone,
    bodyText: messageText,
  });

  await db.insert(notificationLogs).values({
    id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    parentId: parent.id,
    studentId,
    channel: "whatsapp",
    recipient: parent.primaryPhone,
    messageType: "manual_teacher_note",
    contentSummary: messageText.slice(0, 200),
    status: sendResult.success ? "sent" : "failed",
    externalMessageId: sendResult.messageId,
    errorMessage: sendResult.error,
    sentByUserId: teacherId || "teacher",
  });

  return { success: sendResult.success, isMock: sendResult.isMock, messageId: sendResult.messageId, error: sendResult.error };
}

/**
 * Dispatches a bulk broadcast announcement to multiple parents
 */
export async function dispatchBulkBroadcast(params: BulkBroadcastParams) {
  const { recipientParentIds, channel, messageText, senderUserId } = params;

  let sent = 0;
  let failed = 0;

  for (const pid of recipientParentIds) {
    const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, pid)).limit(1);
    if (pRows.length === 0) continue;
    const parent = pRows[0];
    if (parent.optedOut || !parent.consentGiven) continue;

    const queueId = `nq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const ch = channel === "all" ? (parent.preferredChannel === "telegram" ? "telegram" : "whatsapp") : channel;

    let targetRecipient = parent.primaryPhone;
    if (ch === "telegram") {
      const tgAccounts = await db
        .select()
        .from(telegramAccounts)
        .where(and(eq(telegramAccounts.parentId, parent.id), eq(telegramAccounts.isVerified, true)))
        .limit(1);
      if (tgAccounts.length > 0 && tgAccounts[0].chatId) {
        targetRecipient = tgAccounts[0].chatId;
      } else {
        continue;
      }
    }

    const sendResult =
      ch === "telegram"
        ? await sendTelegramMessage({ chatId: targetRecipient, text: messageText })
        : await sendWhatsAppMessage({ to: targetRecipient, bodyText: messageText });

    await db.insert(notificationLogs).values({
      id: `nl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      queueId,
      parentId: parent.id,
      channel: ch,
      recipient: targetRecipient,
      messageType: "bulk_broadcast",
      contentSummary: messageText.slice(0, 200),
      status: sendResult.success ? "sent" : "failed",
      externalMessageId: sendResult.messageId,
      errorMessage: sendResult.error,
      sentByUserId: senderUserId || "admin",
    });

    if (sendResult.success) sent++;
    else failed++;
  }

  return { sent, failed, total: recipientParentIds.length };
}
