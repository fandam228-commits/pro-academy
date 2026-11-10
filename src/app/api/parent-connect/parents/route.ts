import { db } from "@/db";
import {
  parentProfiles,
  parentStudentLinks,
  parentNotificationPreferences,
  telegramAccounts,
  notificationLogs,
  users,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { normalizePhoneNumber } from "@/lib/whatsapp-cloud-api";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const parentId = searchParams.get("id");

    const allProfiles = await db.select().from(parentProfiles).orderBy(desc(parentProfiles.createdAt));
    const allLinks = await db.select().from(parentStudentLinks);
    const allStudents = await db.select().from(users).where(eq(users.role, "student"));
    const allTg = await db.select().from(telegramAccounts);
    const allPrefs = await db.select().from(parentNotificationPreferences);

    // Map profiles with linked students & accounts
    let parents = allProfiles.map((p) => {
      const pLinks = allLinks.filter((l) => l.parentId === p.id);
      const linkedStudents = pLinks.map((l) => {
        const st = allStudents.find((s) => s.id === l.studentId);
        return {
          linkId: l.id,
          studentId: l.studentId,
          studentName: st?.name || "Student",
          studentGrade: st?.grade || "",
          studentStage: st?.stage || "",
          studentPhone: st?.phone || "",
          relationship: l.relationship,
          isPrimaryContact: l.isPrimaryContact,
          canReceiveAttendance: l.canReceiveAttendance,
          canReceiveGrades: l.canReceiveGrades,
          canReceiveReports: l.canReceiveReports,
        };
      });

      const tg = allTg.find((t) => t.parentId === p.id);
      const prefs = allPrefs.find((pr) => pr.parentId === p.id);

      return {
        ...p,
        students: linkedStudents,
        telegram: tg
          ? {
              isVerified: tg.isVerified,
              chatId: tg.chatId,
              username: tg.telegramUsername,
              pairingCode: tg.pairingCode,
              pairingExpiresAt: tg.pairingExpiresAt,
              notificationsMuted: tg.notificationsMuted,
            }
          : null,
        preferences: prefs || {
          notifyOnAbsent: true,
          notifyOnPresent: true,
          notifyOnLate: true,
          notifyOnDeparture: false,
          notifyOnExamResult: true,
          notifyOnHomework: true,
          notifyOnLowGradeWarning: true,
          notifyWeeklyReport: true,
          notifyMonthlyReport: true,
        },
      };
    });

    // Filter by search query if present
    if (query) {
      parents = parents.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.primaryPhone.includes(query) ||
          p.students.some((s) => s.studentName.toLowerCase().includes(query) || s.studentPhone.includes(query))
      );
    }

    if (parentId) {
      const single = parents.find((p) => p.id === parentId);
      return NextResponse.json({ parent: single || null });
    }

    return NextResponse.json({
      parents,
      total: parents.length,
      verifiedWhatsAppCount: parents.filter((p) => p.isPhoneVerified || p.primaryPhone).length,
      linkedTelegramCount: parents.filter((p) => p.telegram?.isVerified).length,
    });
  } catch (error) {
    console.error("Parent Connect GET error:", error);
    return NextResponse.json({ error: "Failed to fetch parents directory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const {
      fullName,
      primaryPhone,
      secondaryPhone,
      email,
      preferredChannel = "whatsapp",
      relationship = "Father",
      studentId,
      consentGiven = true,
      notes,
    } = body;

    if (!fullName?.trim() || !primaryPhone?.trim()) {
      return NextResponse.json({ error: "اسم ولي الأمر ورقم الهاتف الأساسي مطلوبان" }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(primaryPhone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json({ error: "رقم الهاتف غير صالح. يرجى إدخال رقم صحيح مع كود الدولة" }, { status: 400 });
    }

    // Check if parent profile with this phone exists
    const existing = await db.select().from(parentProfiles).where(eq(parentProfiles.primaryPhone, `+${normalizedPhone}`)).limit(1);

    let parentId = "";
    if (existing.length > 0) {
      parentId = existing[0].id;
      // Update details if provided
      await db
        .update(parentProfiles)
        .set({
          fullName: fullName.trim(),
          secondaryPhone: secondaryPhone?.trim() || null,
          email: email?.trim() || null,
          preferredChannel,
          notes: notes?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(parentProfiles.id, parentId));
    } else {
      parentId = `prt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await db.insert(parentProfiles).values({
        id: parentId,
        fullName: fullName.trim(),
        primaryPhone: `+${normalizedPhone}`,
        secondaryPhone: secondaryPhone?.trim() || null,
        email: email?.trim() || null,
        preferredChannel,
        isPhoneVerified: true, // auto-verified by school admin/teacher registration
        consentGiven: Boolean(consentGiven),
        notes: notes?.trim() || null,
      });

      // Default notification preferences
      await db.insert(parentNotificationPreferences).values({
        id: `pnp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        parentId,
      });
    }

    // Link student if provided
    if (studentId) {
      const existingLink = await db
        .select()
        .from(parentStudentLinks)
        .where(and(eq(parentStudentLinks.parentId, parentId), eq(parentStudentLinks.studentId, studentId)))
        .limit(1);

      if (existingLink.length === 0) {
        await db.insert(parentStudentLinks).values({
          id: `psl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          parentId,
          studentId,
          relationship: relationship || "Father",
          isPrimaryContact: true,
          canReceiveAttendance: true,
          canReceiveGrades: true,
          canReceiveReports: true,
        });

        // Also update student's parentPhone in users table for legacy compatibility
        await db
          .update(users)
          .set({ parentPhone: `+${normalizedPhone}` })
          .where(eq(users.id, studentId));
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ بيانات ولي الأمر وربطه بالطالب بنجاح",
      parentId,
    });
  } catch (error) {
    console.error("Parent Connect POST error:", error);
    return NextResponse.json({ error: "فشل في حفظ بيانات ولي الأمر" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { id, fullName, primaryPhone, secondaryPhone, email, preferredChannel, consentGiven, optedOut, notes, preferences } = body;

    if (!id) return NextResponse.json({ error: "Parent ID is required" }, { status: 400 });

    const updateFields: any = { updatedAt: new Date() };
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (primaryPhone !== undefined) {
      const norm = normalizePhoneNumber(primaryPhone);
      updateFields.primaryPhone = `+${norm}`;
    }
    if (secondaryPhone !== undefined) updateFields.secondaryPhone = secondaryPhone?.trim() || null;
    if (email !== undefined) updateFields.email = email?.trim() || null;
    if (preferredChannel !== undefined) updateFields.preferredChannel = preferredChannel;
    if (consentGiven !== undefined) updateFields.consentGiven = Boolean(consentGiven);
    if (optedOut !== undefined) {
      updateFields.optedOut = Boolean(optedOut);
      if (optedOut) updateFields.optedOutAt = new Date();
    }
    if (notes !== undefined) updateFields.notes = notes?.trim() || null;

    await db.update(parentProfiles).set(updateFields).where(eq(parentProfiles.id, id));

    // Update preferences if provided
    if (preferences && typeof preferences === "object") {
      const existingPref = await db.select().from(parentNotificationPreferences).where(eq(parentNotificationPreferences.parentId, id)).limit(1);
      const prefFields = {
        notifyOnAbsent: preferences.notifyOnAbsent ?? true,
        notifyOnPresent: preferences.notifyOnPresent ?? true,
        notifyOnLate: preferences.notifyOnLate ?? true,
        notifyOnDeparture: preferences.notifyOnDeparture ?? false,
        notifyOnExamResult: preferences.notifyOnExamResult ?? true,
        notifyOnHomework: preferences.notifyOnHomework ?? true,
        notifyOnLowGradeWarning: preferences.notifyOnLowGradeWarning ?? true,
        notifyWeeklyReport: preferences.notifyWeeklyReport ?? true,
        notifyMonthlyReport: preferences.notifyMonthlyReport ?? true,
        updatedAt: new Date(),
      };

      if (existingPref.length > 0) {
        await db.update(parentNotificationPreferences).set(prefFields).where(eq(parentNotificationPreferences.parentId, id));
      } else {
        await db.insert(parentNotificationPreferences).values({
          id: `pnp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          parentId: id,
          ...prefFields,
        });
      }
    }

    return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح" });
  } catch (error) {
    console.error("Parent Connect PUT error:", error);
    return NextResponse.json({ error: "فشل في تحديث بيانات ولي الأمر" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const linkId = searchParams.get("linkId");

    if (linkId) {
      await db.delete(parentStudentLinks).where(eq(parentStudentLinks.id, linkId));
      return NextResponse.json({ success: true, message: "تم إلغاء ربط الطالب بولي الأمر" });
    }

    if (parentId) {
      await db.delete(parentStudentLinks).where(eq(parentStudentLinks.parentId, parentId));
      await db.delete(parentNotificationPreferences).where(eq(parentNotificationPreferences.parentId, parentId));
      await db.delete(telegramAccounts).where(eq(telegramAccounts.parentId, parentId));
      await db.delete(parentProfiles).where(eq(parentProfiles.id, parentId));
      return NextResponse.json({ success: true, message: "تم حذف ملف ولي الأمر بالكامل" });
    }

    return NextResponse.json({ error: "Missing parentId or linkId" }, { status: 400 });
  } catch (error) {
    console.error("Parent Connect DELETE error:", error);
    return NextResponse.json({ error: "فشل في عملية الحذف" }, { status: 500 });
  }
}
