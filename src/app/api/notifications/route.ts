import { db } from "@/db";
import { notifications, pushSubscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";
import { getVapidKeys, sendPushToUser, notifyUser } from "@/lib/push";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await db.select().from(notifications);
    const mine = all
      .filter((n) => n.userId === ctx.user.id || !n.userId)
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1))
      .slice(0, 60);
    const unreadCount = mine.filter((n) => !n.isRead).length;
    const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, ctx.user.id));

    return NextResponse.json({
      notifications: mine,
      unreadCount,
      pushEnabled: subs.length > 0,
      vapidPublicKey: getVapidKeys().publicKey,
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "subscribe") {
      const { subscription } = body;
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
      }

      const existing = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, subscription.endpoint));
      if (existing.length === 0) {
        await db.insert(pushSubscriptions).values({
          id: `push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: ctx.user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: (req.headers.get("user-agent") || "").slice(0, 200),
        });
      } else if (existing[0].userId !== ctx.user.id) {
        await db.update(pushSubscriptions).set({ userId: ctx.user.id }).where(eq(pushSubscriptions.id, existing[0].id));
      }

      await sendPushToUser(ctx.user.id, {
        title: "🔔 تم تفعيل الإشعارات",
        body: "هتوصلك تنبيهات الحصص المباشرة والواجبات والنتائج فوراً على جهازك.",
        url: "/",
      });
      return NextResponse.json({ success: true });
    }

    if (action === "unsubscribe") {
      if (body.endpoint) {
        const own = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.endpoint, body.endpoint));
        if (own.length && own[0].userId === ctx.user.id) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, own[0].id));
        }
      } else {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, ctx.user.id));
      }
      return NextResponse.json({ success: true });
    }

    if (action === "mark_read") {
      const notificationId = String(body.notificationId || "");
      if (!notificationId) return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
      const rows = await db.select().from(notifications).where(eq(notifications.id, notificationId));
      if (!rows.length || (rows[0].userId && rows[0].userId !== ctx.user.id)) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      const mine = await db.select().from(notifications);
      for (const n of mine) {
        if ((n.userId === ctx.user.id || !n.userId) && !n.isRead) {
          await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, n.id));
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === "test_push") {
      const sent = await sendPushToUser(ctx.user.id, {
        title: "🎓 Professional Academy",
        body: "تجربة ناجحة! إشعاراتك شغالة على هذا الجهاز ✓",
        url: "/",
      });
      return NextResponse.json({ success: true, sent });
    }

    if (action === "broadcast") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      const { title, message, targetGrade } = body;
      if (!title || !message) return NextResponse.json({ error: "Title and message required" }, { status: 400 });

      const allUsers = await db.select().from(users);
      const targets = allUsers.filter((u) => u.role === "student" && (!targetGrade || targetGrade === "All" || u.grade === targetGrade));
      for (const t of targets) await notifyUser(t.id, title, message, "announcement");
      return NextResponse.json({ success: true, recipients: targets.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
