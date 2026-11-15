import { db } from "@/db";
import { liveSessions, attendanceRecords, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const { id } = await params;

    // Check session exists
    const sessionRows = await db.select().from(liveSessions).where(eq(liveSessions.id, id)).limit(1);
    if (sessionRows.length === 0) {
      return NextResponse.json({ success: false, error: "الحصة غير موجودة" }, { status: 404 });
    }

    const session = sessionRows[0];

    // Determine current user
    const authCtx = await getAuthContext(req);
    let studentId = authCtx?.user?.id;
    let studentName = authCtx?.user?.name;
    let grade = authCtx?.user?.grade || session.grade;

    // Fallback if not logged in via cookie, check body
    if (!studentId) {
      try {
        const body = await req.json();
        if (body.studentId) studentId = body.studentId;
        if (body.studentName) studentName = body.studentName;
        if (body.grade) grade = body.grade;
      } catch {}
    }

    const now = new Date();
    const sessionDateStr = session.startTime.toISOString().split("T")[0]; // YYYY-MM-DD

    // Attendance status: within 15 mins of start = 'present', otherwise 'late'
    const diffMinutes = (now.getTime() - new Date(session.startTime).getTime()) / (60 * 1000);
    const attendanceStatus = diffMinutes > 15 ? "late" : "present";

    let attendanceRecorded = false;

    if (studentId && studentName) {
      // Check if student already recorded attendance for this session
      const existingRecord = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.studentId, studentId),
            eq(attendanceRecords.sessionTitle, session.title),
            eq(attendanceRecords.sessionDate, sessionDateStr)
          )
        )
        .limit(1);

      if (existingRecord.length === 0) {
        const recordId = `att_meet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db.insert(attendanceRecords).values({
          id: recordId,
          studentId,
          studentName,
          sessionTitle: session.title,
          sessionDate: sessionDateStr,
          status: attendanceStatus,
          grade,
          markedBy: "google_meet_join",
        });

        // Award student 15 points for attending live session
        await db
          .update(users)
          .set({ points: (authCtx?.user?.points || 100) + 15 })
          .where(eq(users.id, studentId));

        attendanceRecorded = true;
      } else {
        attendanceRecorded = true;
      }
    }

    return NextResponse.json({
      success: true,
      meetUrl: session.meetUrl,
      sessionTitle: session.title,
      attendanceRecorded,
      attendanceStatus,
      pointsAwarded: attendanceRecorded ? 15 : 0,
      message: "تم تسجيل حضورك بنجاح! جاري تحويلك إلى قاعة Google Meet...",
    });
  } catch (error: any) {
    console.error("Live Session Join Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "فشل تسجيل الدخول للحصة" },
      { status: 500 }
    );
  }
}
