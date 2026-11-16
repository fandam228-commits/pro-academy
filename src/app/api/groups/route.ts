import { db } from "@/db";
import { centerGroups, centerGroupStudents, users, attendanceRecords } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const rawGroups = await db.select().from(centerGroups);
    const groups =
      ctx.user.role === "teacher"
        ? rawGroups.filter((g) => g.teacherId === ctx.user.id)
        : rawGroups;

    const people = await db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        grade: users.grade,
        stage: users.stage,
        phone: users.phone,
        parentPhone: users.parentPhone,
        studentCode: users.studentCode,
        qrCode: users.qrCode,
        groupId: users.groupId,
      })
      .from(users);

    const memberships = await db.select().from(centerGroupStudents);

    return NextResponse.json({
      success: true,
      groups,
      teachers: people.filter((person) => person.role === "teacher"),
      students: people.filter((person) => person.role === "student"),
      memberships,
    });
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json({ success: false, error: "تعذر تحميل المجموعات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const action = body.action || "create_group";

    // 1. UPDATE EXISTING GROUP
    if (action === "update_group") {
      const { groupId } = body;
      if (!groupId) {
        return NextResponse.json({ success: false, error: "معرف المجموعة مطلوب" }, { status: 400 });
      }

      const updates: any = {};
      if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
      if (typeof body.schedule === "string") updates.schedule = body.schedule.trim();
      if (typeof body.room === "string") updates.room = body.room.trim();
      if (typeof body.grade === "string") updates.grade = body.grade;
      if (typeof body.stage === "string") updates.stage = body.stage;
      if (body.monthlyFee !== undefined) {
        const fee = Number(body.monthlyFee);
        if (Number.isFinite(fee) && fee >= 0) updates.monthlyFee = fee.toFixed(2);
      }
      if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);

      if (body.teacherId) {
        const [teacher] = await db
          .select({ id: users.id, name: users.name, role: users.role })
          .from(users)
          .where(eq(users.id, body.teacherId))
          .limit(1);
        if (teacher && teacher.role === "teacher") {
          updates.teacherId = teacher.id;
          updates.teacherName = teacher.name;
        }
      }

      const [updated] = await db
        .update(centerGroups)
        .set(updates)
        .where(eq(centerGroups.id, groupId))
        .returning();

      return NextResponse.json({ success: true, group: updated });
    }

    // 2. ENROLL STUDENT IN GROUP (Multi-group link)
    if (action === "enroll_student") {
      const { studentId, groupId, customMonthlyFee, discountAmount, discountReason, notes } = body;
      if (!studentId || !groupId) {
        return NextResponse.json({ success: false, error: "كود الطالب والمجموعة مطلوبان" }, { status: 400 });
      }

      // Check existing active link
      const existing = await db
        .select()
        .from(centerGroupStudents)
        .where(and(eq(centerGroupStudents.studentId, studentId), eq(centerGroupStudents.groupId, groupId)))
        .limit(1);

      if (existing.length > 0 && existing[0].status === "active") {
        return NextResponse.json({ success: false, error: "الطالب مسجل بالفعل في هذه المجموعة وهو نشط حالياً" }, { status: 400 });
      }

      const membershipId = "cgs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      const feeNum = customMonthlyFee !== undefined && customMonthlyFee !== null ? Number(customMonthlyFee) : null;
      const discountNum = discountAmount !== undefined ? Number(discountAmount) : 0;

      const [inserted] = await db
        .insert(centerGroupStudents)
        .values({
          id: membershipId,
          groupId,
          studentId,
          status: "active",
          customMonthlyFee: feeNum !== null && Number.isFinite(feeNum) ? feeNum.toFixed(2) : null,
          discountAmount: Number.isFinite(discountNum) ? discountNum.toFixed(2) : "0.00",
          discountReason: discountReason || null,
          notes: notes || null,
        })
        .returning();

      // Update student primary groupId if not set
      const [currentStudent] = await db.select({ id: users.id, groupId: users.groupId }).from(users).where(eq(users.id, studentId)).limit(1);
      if (currentStudent && !currentStudent.groupId) {
        await db.update(users).set({ groupId }).where(eq(users.id, studentId));
      }

      return NextResponse.json({ success: true, membership: inserted }, { status: 201 });
    }

    // 3. TRANSFER STUDENT BETWEEN GROUPS
    if (action === "transfer_student") {
      const { studentId, fromGroupId, toGroupId, reason } = body;
      if (!studentId || !toGroupId) {
        return NextResponse.json({ success: false, error: "معرف الطالب والمجموعة الجديدة مطلوبان" }, { status: 400 });
      }

      // 1. Mark previous active membership as transferred
      if (fromGroupId) {
        await db
          .update(centerGroupStudents)
          .set({
            status: "transferred",
            transferredToGroupId: toGroupId,
            notes: reason ? `Transferred: ${reason}` : "Transferred to new group",
          })
          .where(
            and(
              eq(centerGroupStudents.studentId, studentId),
              eq(centerGroupStudents.groupId, fromGroupId),
              eq(centerGroupStudents.status, "active")
            )
          );
      }

      // 2. Insert new active membership
      const newMembershipId = "cgs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      const [newMembership] = await db
        .insert(centerGroupStudents)
        .values({
          id: newMembershipId,
          groupId: toGroupId,
          studentId,
          status: "active",
          notes: reason ? `Transfer reason: ${reason}` : "Transferred by admin",
        })
        .returning();

      // 3. Update primary groupId in users table
      await db.update(users).set({ groupId: toGroupId }).where(eq(users.id, studentId));

      return NextResponse.json({
        success: true,
        message: "تم نقل الطالب للمجموعة الجديدة بنجاح مع الاحتفاظ بكامل سجلات الحضور السابقة في مجموعته القديمة",
        membership: newMembership,
      });
    }

    // 4. PAUSE STUDENT MEMBERSHIP
    if (action === "pause_student") {
      const { studentId, groupId, notes } = body;
      if (!studentId || !groupId) {
        return NextResponse.json({ success: false, error: "معرف الطالب والمجموعة مطلوبان" }, { status: 400 });
      }

      await db
        .update(centerGroupStudents)
        .set({
          status: "paused",
          pausedAt: new Date(),
          notes: notes ? `Paused: ${notes}` : "Paused by admin",
        })
        .where(
          and(
            eq(centerGroupStudents.studentId, studentId),
            eq(centerGroupStudents.groupId, groupId)
          )
        );

      return NextResponse.json({ success: true, message: "تم إيقاف اشتراك الطالب في المجموعة مؤقتاً دون حذف أي سجلات" });
    }

    // 5. RESUME STUDENT MEMBERSHIP
    if (action === "resume_student") {
      const { studentId, groupId } = body;
      if (!studentId || !groupId) {
        return NextResponse.json({ success: false, error: "معرف الطالب والمجموعة مطلوبان" }, { status: 400 });
      }

      await db
        .update(centerGroupStudents)
        .set({
          status: "active",
          pausedAt: null,
        })
        .where(
          and(
            eq(centerGroupStudents.studentId, studentId),
            eq(centerGroupStudents.groupId, groupId)
          )
        );

      return NextResponse.json({ success: true, message: "تم استئناف اشتراك الطالب في المجموعة بنجاح" });
    }

    // 6. CREATE GROUP (Default)
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
    const [group] = await db
      .insert(centerGroups)
      .values({
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
      })
      .returning();

    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json({ success: false, error: "تعذر معالجة طلب المجموعات" }, { status: 500 });
  }
}
