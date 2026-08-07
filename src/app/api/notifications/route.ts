import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, or, isNull, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get user's personal notifications + broadcast (userId is null)
    const all = await db.select().from(notifications);
    const mine = all
      .filter((n) => !n.userId || n.userId === ctx.user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = mine.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: mine.slice(0, 50),
      unreadCount,
      total: mine.length,
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action, notificationId, notificationIds } = await req.json();

    // Mark single as read
    if (action === "mark_read" && notificationId) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
      return NextResponse.json({ success: true });
    }

    // Mark all as read
    if (action === "mark_all_read") {
      const all = await db.select().from(notifications);
      const mine = all.filter((n) => !n.userId || n.userId === ctx.user.id);
      for (const n of mine) {
        if (!n.isRead) {
          await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, n.id));
        }
      }
      return NextResponse.json({ success: true });
    }

    // Delete single
    if (action === "delete" && notificationId) {
      await db.delete(notifications).where(eq(notifications.id, notificationId));
      return NextResponse.json({ success: true });
    }

    // Clear all for this user
    if (action === "clear_all") {
      const all = await db.select().from(notifications);
      const mine = all.filter((n) => n.userId === ctx.user.id);
      for (const n of mine) {
        await db.delete(notifications).where(eq(notifications.id, n.id));
      }
      return NextResponse.json({ success: true });
    }

    // Admin: send push-style broadcast
    if (action === "send_broadcast") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      const { title, message, type } = await req.json().catch(() => ({ title: "", message: "", type: "announcement" }));
      // Also store individual copies for each student (so unread counter works)
      const students = await db.select().from(users).where(eq(users.role, "student"));
      const broadcastId = `notif_bc_${Date.now()}`;
      // Broadcast (null userId)
      await db.insert(notifications).values({
        id: broadcastId,
        userId: undefined,
        title: title || "📢 إشعار عام",
        message: message || "",
        type: type || "announcement",
        isRead: false,
      });
      return NextResponse.json({ success: true, sent: students.length + 1 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
