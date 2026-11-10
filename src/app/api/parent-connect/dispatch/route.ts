import { db } from "@/db";
import {
  notificationLogs,
  notificationQueue,
  parentProfiles,
  users,
} from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { isWhatsAppConfigured, sendWhatsAppMessage } from "@/lib/whatsapp-cloud-api";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram-bot-api";
import {
  dispatchManualTeacherNote,
  dispatchBulkBroadcast,
  dispatchExamResultNotification,
  dispatchSmartReportNotification,
} from "@/lib/parent-connect-dispatcher";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");

    let logs = await db
      .select()
      .from(notificationLogs)
      .orderBy(desc(notificationLogs.createdAt))
      .limit(limit);

    if (channel) {
      logs = logs.filter((l) => l.channel === channel);
    }
    if (status) {
      logs = logs.filter((l) => l.status === status);
    }

    // Attach student & parent names for rich UI presentation
    const allParents = await db.select({ id: parentProfiles.id, name: parentProfiles.fullName, phone: parentProfiles.primaryPhone }).from(parentProfiles);
    const allStudents = await db.select({ id: users.id, name: users.name, grade: users.grade }).from(users).where(eq(users.role, "student"));

    const enrichedLogs = logs.map((l) => {
      const p = allParents.find((par) => par.id === l.parentId);
      const st = allStudents.find((s) => s.id === l.studentId);
      return {
        ...l,
        parentName: p?.name || "ولي أمر",
        parentPhone: p?.phone || l.recipient,
        studentName: st?.name || "طالب",
        studentGrade: st?.grade || "",
      };
    });

    const totalSent = logs.filter((l) => l.status === "sent" || l.status === "delivered").length;
    const totalFailed = logs.filter((l) => l.status === "failed").length;

    return NextResponse.json({
      logs: enrichedLogs,
      stats: {
        total: logs.length,
        sent: totalSent,
        failed: totalFailed,
        successRate: logs.length > 0 ? Math.round((totalSent / logs.length) * 100) : 100,
        isWhatsAppLive: isWhatsAppConfigured(),
        isTelegramLive: isTelegramConfigured(),
      },
    });
  } catch (error) {
    console.error("Parent Connect Dispatch GET error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Direct message from teacher or admin to a parent
    if (action === "send_direct_message") {
      const { studentId, parentId, messageText, channel = "whatsapp" } = body;
      if (!messageText?.trim()) {
        return NextResponse.json({ error: "نص الرسالة مطلوب" }, { status: 400 });
      }

      const res = await dispatchManualTeacherNote({
        studentId,
        parentId,
        noteText: messageText.trim(),
        teacherId: user!.id,
      });

      return NextResponse.json(res);
    }

    // 2. Bulk Broadcast to multiple parents
    if (action === "send_bulk_broadcast") {
      const { recipientParentIds, channel = "all", messageText } = body;
      if (!Array.isArray(recipientParentIds) || recipientParentIds.length === 0) {
        return NextResponse.json({ error: "يرجى تحديد ولي أمر واحد على الأقل" }, { status: 400 });
      }
      if (!messageText?.trim()) {
        return NextResponse.json({ error: "نص الرسالة مطلوب" }, { status: 400 });
      }

      const res = await dispatchBulkBroadcast({
        recipientParentIds,
        channel,
        messageText: messageText.trim(),
        senderUserId: user!.id,
      });

      return NextResponse.json({ success: true, ...res });
    }

    // 3. Dispatch exam result notification
    if (action === "send_exam_result") {
      const { studentId, examTitle, score, total, percentage, feedback } = body;
      const res = await dispatchExamResultNotification({
        studentId,
        examTitle,
        score: Number(score),
        total: Number(total),
        percentage: Number(percentage),
        feedback,
        teacherId: user!.id,
      });

      return NextResponse.json({ success: true, ...res });
    }

    // 4. Dispatch smart weekly or monthly report
    if (action === "send_smart_report") {
      const { studentId, period = "weekly" } = body;
      const res = await dispatchSmartReportNotification({
        studentId,
        period,
        senderUserId: user!.id,
      });

      return NextResponse.json({ success: true, ...res });
    }

    // 5. Retry a failed notification log entry
    if (action === "retry_failed") {
      const { logId } = body;
      const logRows = await db.select().from(notificationLogs).where(eq(notificationLogs.id, logId)).limit(1);
      if (logRows.length === 0) return NextResponse.json({ error: "Log not found" }, { status: 404 });
      const item = logRows[0];

      let retryRes: { success: boolean; messageId?: string; error?: string } = { success: false };
      if (item.channel === "whatsapp") {
        retryRes = await sendWhatsAppMessage({
          to: item.recipient,
          bodyText: item.contentSummary,
        });
      } else {
        retryRes = await sendTelegramMessage({
          chatId: item.recipient,
          text: item.contentSummary,
        });
      }

      await db
        .update(notificationLogs)
        .set({
          status: retryRes.success ? "sent" : "failed",
          externalMessageId: retryRes.messageId,
          errorMessage: retryRes.error || null,
        })
        .where(eq(notificationLogs.id, logId));

      return NextResponse.json({ success: retryRes.success, error: retryRes.error });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Parent Connect Dispatch POST error:", error);
    return NextResponse.json({ error: "فشل في معالجة طلب الإرسال" }, { status: 500 });
  }
}
