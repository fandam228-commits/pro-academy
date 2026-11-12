import { db } from "@/db";
import { liveSessions, users } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { createGoogleCalendarEvent, generateFallbackMeetUrl, getValidAccessToken } from "@/lib/google-meet";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");

    let query = db.select().from(liveSessions).$dynamic();

    const conditions = [];
    if (grade && grade !== "all" && grade !== "All Grades") {
      conditions.push(eq(liveSessions.grade, grade));
    }
    if (status && status !== "all") {
      conditions.push(eq(liveSessions.status, status));
    }
    if (stage) {
      conditions.push(eq(liveSessions.stage, stage));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const sessions = await query.orderBy(desc(liveSessions.startTime));

    // Also check if Google OAuth is currently connected
    const token = await getValidAccessToken();
    const isGoogleConnected = Boolean(token);

    return NextResponse.json({
      success: true,
      sessions,
      isGoogleConnected,
      connectedAccount: "fandam228@gmail.com",
    });
  } catch (error: any) {
    console.error("Live Sessions GET Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch live sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    const body = await req.json();
    const {
      title,
      description,
      stage = "Secondary",
      grade = "Third Secondary (Baccalaureate)",
      subject = "English",
      startTime,
      durationMinutes = 60,
      customMeetUrl,
      useGoogleCalendar = true,
    } = body;

    if (!title || !startTime) {
      return NextResponse.json(
        { success: false, error: "عنوان الحصة ووقت البدء مطلوبان" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + Number(durationMinutes) * 60 * 1000);

    let meetUrl = customMeetUrl ? customMeetUrl.trim() : "";
    let googleEventId: string | null = null;
    let calendarHtmlLink: string | null = null;

    // Try creating via Google Calendar API if connected and requested
    if (useGoogleCalendar && !customMeetUrl) {
      try {
        const calResult = await createGoogleCalendarEvent({
          title,
          description,
          startTime: start,
          endTime: end,
        });
        meetUrl = calResult.meetUrl;
        googleEventId = calResult.eventId;
        calendarHtmlLink = calResult.htmlLink;
      } catch (calError: any) {
        console.warn("Google Calendar API not active or failed, using formatted Meet link:", calError.message);
        // Fallback to manual/placeholder Meet URL
        meetUrl = generateFallbackMeetUrl();
      }
    } else if (!meetUrl) {
      meetUrl = generateFallbackMeetUrl();
    }

    const newId = `ls_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSession = {
      id: newId,
      title: title.trim(),
      description: description?.trim() || null,
      stage,
      grade,
      subject,
      teacherId: user.id || "usr_admin_1",
      teacherName: user.name || "Mr. Habib El Rahman",
      startTime: start,
      endTime: end,
      durationMinutes: Number(durationMinutes),
      meetUrl,
      googleEventId,
      calendarHtmlLink,
      status: "scheduled",
      recordingUrl: null,
      recordingNotes: null,
      maxAttendees: 100,
    };

    await db.insert(liveSessions).values(newSession);

    return NextResponse.json({
      success: true,
      session: newSession,
      message: "تم إنشاء الحصة ورابط Google Meet بنجاح",
    });
  } catch (error: any) {
    console.error("Live Sessions POST Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create live session" },
      { status: 500 }
    );
  }
}
