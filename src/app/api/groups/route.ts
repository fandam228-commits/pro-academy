import { db } from "@/db";
import { centerGroups, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;
  try {
    const groups = await db.select().from(centerGroups);
    const people = await db.select({ id: users.id, name: users.name, role: users.role, grade: users.grade }).from(users);
    return NextResponse.json({
      success: true,
      groups,
      teachers: people.filter((person) => person.role === "teacher"),
      students: people.filter((person) => person.role === "student"),
    });
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json({ success: false, error: "تعذر تحميل المجموعات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const fee = Number(body.monthlyFee ?? 0);
    if (!name) return NextResponse.json({ success: false, error: "اسم المجموعة مطلوب" }, { status: 400 });
    if (!Number.isFinite(fee) || fee < 0) return NextResponse.json({ success: false, error: "قيمة الاشتراك غير صحيحة" }, { status: 400 });

    const teacherId = typeof body.teacherId === "string" && body.teacherId ? body.teacherId : null;
    let teacherName: string | null = null;
    if (teacherId) {
      const [teacher] = await db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(eq(users.id, teacherId)).limit(1);
      if (!teacher || teacher.role !== "teacher") return NextResponse.json({ success: false, error: "المدرس المحدد غير موجود" }, { status: 400 });
      teacherName = teacher.name;
    }

    const id = "grp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const [group] = await db.insert(centerGroups).values({
      id,
      name,
      stage: typeof body.stage === "string" ? body.stage : "Secondary",
      grade: typeof body.grade === "string" ? body.grade : "Third Secondary (Baccalaureate)",
      teacherId,
      teacherName,
      schedule: typeof body.schedule === "string" ? body.schedule.trim() : null,
      room: typeof body.room === "string" ? body.room.trim() : null,
      monthlyFee: fee.toFixed(2),
      isActive: true,
    }).returning();
    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json({ success: false, error: "تعذر إنشاء المجموعة" }, { status: 500 });
  }
}
