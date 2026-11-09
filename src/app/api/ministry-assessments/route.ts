import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  ministryAssessments,
  studentAssessmentDownloads,
  users,
} from "@/db/schema";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";

// =========================================================================
// GET: Fetch Ministry Assessments with smart filters & download stats
// =========================================================================
export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);

  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");
  const gradeCode = searchParams.get("gradeCode");
  const assessmentType = searchParams.get("type");
  const term = searchParams.get("term");
  const week = searchParams.get("week");
  const search = (searchParams.get("search") || "").trim();
  const historyOnly = searchParams.get("historyOnly") === "true";

  const ctx = await getAuthContext(req);
  const isStaff = ctx && (ctx.user?.role === "admin" || ctx.user?.role === "teacher");

  try {
    // If student requested their download history
    if (historyOnly && ctx?.user) {
      const historyRows = await db
        .select({
          downloadId: studentAssessmentDownloads.id,
          downloadedAt: studentAssessmentDownloads.downloadedAt,
          assessment: ministryAssessments,
        })
        .from(studentAssessmentDownloads)
        .innerJoin(
          ministryAssessments,
          eq(studentAssessmentDownloads.assessmentId, ministryAssessments.id)
        )
        .where(eq(studentAssessmentDownloads.studentId, ctx.user.id))
        .orderBy(desc(studentAssessmentDownloads.downloadedAt))
        .limit(50);

      return NextResponse.json({
        success: true,
        history: historyRows,
      });
    }

    const conditions: any[] = [];

    // Students only see published assessments
    if (!isStaff) {
      conditions.push(eq(ministryAssessments.isPublished, true));
    }

    if (stage && stage !== "all" && stage !== "All") {
      conditions.push(eq(ministryAssessments.stage, stage));
    }

    if (gradeCode && gradeCode !== "all" && gradeCode !== "All") {
      conditions.push(eq(ministryAssessments.gradeCode, gradeCode));
    } else if (grade && grade !== "all" && grade !== "All") {
      conditions.push(
        or(
          eq(ministryAssessments.grade, grade),
          eq(ministryAssessments.gradeCode, grade)
        )!
      );
    }

    if (assessmentType && assessmentType !== "all" && assessmentType !== "All") {
      conditions.push(eq(ministryAssessments.assessmentType, assessmentType));
    }

    if (term && term !== "all" && term !== "All") {
      conditions.push(eq(ministryAssessments.term, term));
    }

    if (week && week !== "all" && week !== "All") {
      const weekNum = parseInt(week);
      if (!isNaN(weekNum)) {
        conditions.push(eq(ministryAssessments.weekNumber, weekNum));
      }
    }

    if (search) {
      conditions.push(
        or(
          ilike(ministryAssessments.title, `%${search}%`),
          ilike(ministryAssessments.titleEn, `%${search}%`),
          ilike(ministryAssessments.grade, `%${search}%`),
          ilike(ministryAssessments.subject, `%${search}%`)
        )!
      );
    }

    const rows = await db
      .select()
      .from(ministryAssessments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(ministryAssessments.weekNumber), desc(ministryAssessments.createdAt));

    // Stats breakdown for dynamic badges
    const allAssessments = await db
      .select({
        type: ministryAssessments.assessmentType,
        count: sql<number>`count(*)`,
      })
      .from(ministryAssessments)
      .where(isStaff ? undefined : eq(ministryAssessments.isPublished, true))
      .groupBy(ministryAssessments.assessmentType);

    const countsByType: Record<string, number> = {};
    for (const item of allAssessments) {
      countsByType[item.type] = Number(item.count);
    }

    // Recently added (top 5)
    const recentlyAdded = await db
      .select()
      .from(ministryAssessments)
      .where(isStaff ? undefined : eq(ministryAssessments.isPublished, true))
      .orderBy(desc(ministryAssessments.createdAt))
      .limit(5);

    return NextResponse.json({
      success: true,
      assessments: rows,
      totalCount: rows.length,
      countsByType,
      recentlyAdded,
      officialPortals: {
        main: "https://studentbooks.moe.gov.eg/Performance_Assessments/",
        alternative: "https://moe.gov.eg/elearningenterypage/e-learning/",
      },
    });
  } catch (error) {
    console.error("Fetch Ministry Assessments Error:", error);
    return NextResponse.json({ error: "Failed to fetch assessments." }, { status: 500 });
  }
}

// =========================================================================
// POST: Record downloads & Teacher Management (Create / Edit / Delete)
// =========================================================================
export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);

  try {
    const body = await req.json();
    const action = body?.action;

    // 1. ACTION: RECORD DOWNLOAD (Available to students & users)
    if (action === "record_download") {
      const assessmentId = body.assessmentId;
      if (!assessmentId) {
        return NextResponse.json({ error: "assessmentId is required." }, { status: 400 });
      }

      // Increment download counter
      await db
        .update(ministryAssessments)
        .set({
          downloadCount: sql`${ministryAssessments.downloadCount} + 1`,
        })
        .where(eq(ministryAssessments.id, assessmentId));

      // If student is logged in, log to personal download history
      if (ctx?.user) {
        const downloadId = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(studentAssessmentDownloads).values({
          id: downloadId,
          studentId: ctx.user.id,
          assessmentId,
          downloadedAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        message: "Download recorded successfully.",
      });
    }

    // TEACHER / ADMIN ACTIONS ONLY
    const roleAuth = requireRoles(["teacher", "admin"])(ctx);
    if (roleAuth) return roleAuth;

    // 2. ACTION: CREATE ASSESSMENT
    if (action === "create_assessment") {
      const {
        title,
        titleEn,
        stage,
        grade,
        gradeCode,
        term,
        subject,
        assessmentType,
        weekNumber,
        fileUrl,
        fileSize,
        officialSourceUrl,
        alternativeSourceUrl,
      } = body;

      if (!title || !stage || !grade || !gradeCode || !assessmentType) {
        return NextResponse.json({ error: "Missing required assessment fields." }, { status: 400 });
      }

      const id = `ma_${gradeCode}_w${weekNumber || 1}_${assessmentType}_${Date.now().toString(36)}`;

      const [newRow] = await db
        .insert(ministryAssessments)
        .values({
          id,
          title: title.trim(),
          titleEn: (titleEn || "").trim() || null,
          stage,
          grade,
          gradeCode,
          term: term || "First",
          subject: subject || "English",
          assessmentType,
          weekNumber: Number(weekNumber) || 1,
          fileUrl: (fileUrl || "").trim() || null,
          fileSize: fileSize || "1.8 MB",
          officialSourceUrl: officialSourceUrl || "https://studentbooks.moe.gov.eg/Performance_Assessments/",
          alternativeSourceUrl: alternativeSourceUrl || "https://moe.gov.eg/elearningenterypage/e-learning/",
          verifiedDate: new Date(),
          isPublished: true,
          createdBy: ctx?.user?.id || "teacher",
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "تمت إضافة تقييم الوزارة بنجاح للمكتبة الرسمية.",
        assessment: newRow,
      });
    }

    // 3. ACTION: UPDATE ASSESSMENT
    if (action === "update_assessment") {
      const { id, title, titleEn, stage, grade, gradeCode, term, subject, assessmentType, weekNumber, fileUrl, fileSize, isPublished, officialSourceUrl } = body;
      if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

      const [updated] = await db
        .update(ministryAssessments)
        .set({
          title: title ? title.trim() : undefined,
          titleEn: titleEn !== undefined ? (titleEn || "").trim() : undefined,
          stage: stage || undefined,
          grade: grade || undefined,
          gradeCode: gradeCode || undefined,
          term: term || undefined,
          subject: subject || undefined,
          assessmentType: assessmentType || undefined,
          weekNumber: weekNumber !== undefined ? Number(weekNumber) : undefined,
          fileUrl: fileUrl !== undefined ? fileUrl : undefined,
          fileSize: fileSize || undefined,
          isPublished: isPublished !== undefined ? isPublished : undefined,
          officialSourceUrl: officialSourceUrl || undefined,
          verifiedDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ministryAssessments.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "تم تحديث بيانات التقييم بنجاح.",
        assessment: updated,
      });
    }

    // 4. ACTION: TOGGLE PUBLISH STATUS
    if (action === "toggle_publish") {
      const { id, isPublished } = body;
      if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

      await db
        .update(ministryAssessments)
        .set({
          isPublished: !!isPublished,
          updatedAt: new Date(),
        })
        .where(eq(ministryAssessments.id, id));

      return NextResponse.json({
        success: true,
        message: isPublished ? "تم نشر الملف للطلاب." : "تم إخفاء الملف عن الطلاب.",
      });
    }

    // 5. ACTION: DELETE ASSESSMENT
    if (action === "delete_assessment") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

      await db.delete(ministryAssessments).where(eq(ministryAssessments.id, id));

      return NextResponse.json({
        success: true,
        message: "تم حذف التقييم من المكتبة بنجاح.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Ministry Assessments Action Error:", error);
    return NextResponse.json({ error: "Action processing failed." }, { status: 500 });
  }
}
