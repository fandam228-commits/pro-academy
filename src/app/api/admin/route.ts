import { db } from "@/db";
import { users, courses, payments, activationCodes, quizSubmissions, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, hashPassword } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;
  try {
    const allUsers = await db.select().from(users);
    const allCourses = await db.select().from(courses);
    const allPayments = await db.select().from(payments);
    const allSubmissions = await db.select().from(quizSubmissions);
    const allCodes = await db.select().from(activationCodes);

    const students = allUsers.filter((u) => u.role === "student");
    const teachers = allUsers.filter((u) => u.role === "teacher");

    const totalRevenue = allPayments
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

    const analytics = {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalCourses: allCourses.length,
      totalRevenue,
      totalSubmissions: allSubmissions.length,
      activeToday: null,
      deviceStats: [],
      monthlyRevenue: [],
    };

    return NextResponse.json({
      analytics,
      users: allUsers.map(({ password, ...rest }) => rest), // never expose password hashes
      courses: allCourses,
      codes: allCodes,
    });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ error: "Failed to fetch admin dashboard" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { action, userData, userId, codeBatch } = body;

    // 1. Add / Edit / Delete Users
    if (action === "create_user") {
      const name = typeof userData?.name === "string" ? userData.name.trim() : "";
      const email = typeof userData?.email === "string" ? userData.email.trim().toLowerCase() : "";
      const allowedRoles = ["student", "teacher", "parent", "admin"];
      const role = allowedRoles.includes(userData?.role) ? userData.role : "student";

      if (!name || !email) {
        return NextResponse.json({ success: false, error: "الاسم والبريد الإلكتروني مطلوبان" }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
      }

      const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return NextResponse.json({ success: false, error: "البريد الإلكتروني مسجل بالفعل. استخدم بريدًا آخر." }, { status: 409 });
      }

      const newId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const newUser = {
        id: newId,
        name,
        email,
        password: hashPassword(userData.password || "12345678"),
        role,
        stage: typeof userData?.stage === "string" ? userData.stage : "Secondary",
        grade: typeof userData?.grade === "string" ? userData.grade : "Third Secondary (Baccalaureate)",
        phone: typeof userData?.phone === "string" ? userData.phone.trim() : "",
        parentPhone: typeof userData?.parentPhone === "string" ? userData.parentPhone.trim() : "",
        streak: 1,
        points: 100,
        level: "Intermediate",
        preferredLang: "ar",
      };
      const { password: _pw, ...publicUser } = newUser;
      await db.insert(users).values(newUser);
      return NextResponse.json({ success: true, user: publicUser });
    }

    if (action === "delete_user") {
      await db.delete(users).where(eq(users.id, userId));
      return NextResponse.json({ success: true });
    }

    // 2. Generate Activation Codes
    if (action === "generate_codes") {
      const { courseId, count, prefix } = codeBatch;
      const generated: string[] = [];
      const numCount = parseInt(count) || 5;

      for (let i = 0; i < numCount; i++) {
        const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const codeStr = `${prefix || "HABIB"}-${randStr}`;
        await db.insert(activationCodes).values({
          id: `ac_${Date.now()}_${i}`,
          code: codeStr,
          courseId,
          isUsed: false,
        });
        generated.push(codeStr);
      }

      return NextResponse.json({ success: true, codes: generated });
    }

    // 3. System Announcement
    if (action === "send_announcement") {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}`,
        userId: undefined, // Broadcast
        title: body.title || "📢 Platform Announcement",
        message: body.message,
        type: "announcement",
      });
      return NextResponse.json({ success: true });
    }

    // 4. Backup Export
    if (action === "export_backup") {
      const u = await db.select().from(users);
      const c = await db.select().from(courses);
      const q = await db.select().from(quizSubmissions);
      const p = await db.select().from(payments);

      const backupJSON = JSON.stringify({
        exportDate: new Date().toISOString(),
        usersCount: u.length,
        coursesCount: c.length,
        data: {
          users: u.map(({ password, ...rest }) => rest), // passwords never included in backups
          courses: c,
          quizSubmissions: q,
          payments: p,
        },
      });

      return NextResponse.json({ success: true, backupJSON });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ error: "Admin operation failed" }, { status: 500 });
  }
}
