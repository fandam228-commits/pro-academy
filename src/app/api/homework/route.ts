import { db } from "@/db";
import { homework, homeworkSubmissions, users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import fs from "fs";
import path from "path";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const homeworkId = searchParams.get("homeworkId");
  const role = ctx.user.role as string;

  try {
    // Teacher/Admin sees assignments + all submissions
    if (role === "teacher" || role === "admin") {
      if (homeworkId) {
        const hw = await db.select().from(homework).where(eq(homework.id, homeworkId));
        const subs = await db
          .select()
          .from(homeworkSubmissions)
          .where(eq(homeworkSubmissions.homeworkId, homeworkId));
        return NextResponse.json({ homework: hw[0] || null, submissions: subs });
      }
      const allHw = await db.select().from(homework);
      const allSubs = await db.select().from(homeworkSubmissions);
      const withCounts = allHw.map((h) => ({
        ...h,
        submissionsCount: allSubs.filter((s) => s.homeworkId === h.id).length,
        gradedCount: allSubs.filter((s) => s.homeworkId === h.id && s.status === "graded").length,
      }));
      return NextResponse.json({ homeworkList: withCounts, role });
    }

    // Student sees homework for their grade + own submission status
    const myGrade = ctx.user.grade || "";
    let list = await db.select().from(homework);
    if (myGrade) {
      list = list.filter((h) => h.grade === myGrade || !h.grade);
    }
    const mySubs = await db
      .select()
      .from(homeworkSubmissions)
      .where(eq(homeworkSubmissions.studentId, ctx.user.id));

    const withStatus = list.map((h) => {
      const mine = mySubs.find((s) => s.homeworkId === h.id) || null;
      return { ...h, mySubmission: mine };
    });

    return NextResponse.json({ homeworkList: withStatus, role: "student" });
  } catch (error) {
    console.error("Homework GET error:", error);
    return NextResponse.json({ error: "Failed to load homework" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized. Login required." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";

  // ============ STUDENT SUBMIT ANSWER (multipart, optional file) ============
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const homeworkId = String(form.get("homeworkId") || "");
      const answerText = String(form.get("answerText") || "");
      const file = form.get("file") as File | null;

      if (!homeworkId) {
        return NextResponse.json({ error: "Missing homeworkId" }, { status: 400 });
      }

      const hw = await db.select().from(homework).where(eq(homework.id, homeworkId));
      if (hw.length === 0) {
        return NextResponse.json({ error: "Homework not found" }, { status: 404 });
      }

      // One submission per student — replace an existing ungraded one
      const existing = await db
        .select()
        .from(homeworkSubmissions)
        .where(
          and(eq(homeworkSubmissions.homeworkId, homeworkId), eq(homeworkSubmissions.studentId, ctx.user.id))
        );

      let fileName: string | null = null;
      let storagePath: string | null = null;

      if (file && file.size > 0) {
        if (file.size > MAX_SIZE_BYTES) {
          return NextResponse.json({ error: "File exceeds 20MB limit." }, { status: 400 });
        }
        const dir = path.join(process.cwd(), "storage", "homework");
        await fs.promises.mkdir(dir, { recursive: true });
        const subId = `hws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const dest = path.join(dir, `${subId}_${safeName}`);
        await fs.promises.writeFile(dest, Buffer.from(await file.arrayBuffer()));
        fileName = file.name;
        storagePath = dest;
      }

      if (existing.length > 0) {
        if (existing[0].status === "graded") {
          return NextResponse.json({ error: "This submission is already graded and can't be replaced." }, { status: 400 });
        }
        await db
          .update(homeworkSubmissions)
          .set({ answerText, fileName: fileName ?? existing[0].fileName, storagePath: storagePath ?? existing[0].storagePath, submittedAt: new Date() })
          .where(eq(homeworkSubmissions.id, existing[0].id));
        return NextResponse.json({ success: true, updated: true });
      }

      const sub = {
        id: `hws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        homeworkId,
        studentId: ctx.user.id,
        studentName: ctx.user.name,
        answerText,
        fileName,
        storagePath,
        status: "submitted",
      };
      await db.insert(homeworkSubmissions).values(sub);

      // Notify teacher
      await db.insert(notifications).values({
        id: `notif_${Date.now()}`,
        userId: hw[0].teacherId,
        title: "📥 تسليم واجب جديد",
        message: `${ctx.user.name} سلّم واجب: ${hw[0].title}`,
        type: "info",
      });

      return NextResponse.json({ success: true, submission: sub });
    } catch (error) {
      console.error("Homework submit error:", error);
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }
  }

  // ============ JSON ACTIONS: create / grade / delete ============
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const hwData = body.homeworkData || {};
      if (!hwData.title || !hwData.dueDate) {
        return NextResponse.json({ error: "Title and due date are required." }, { status: 400 });
      }

      const newHw = {
        id: `hw_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: hwData.title,
        description: hwData.description || "",
        teacherId: ctx.user.id,
        teacherName: ctx.user.name,
        stage: hwData.stage || "Secondary",
        grade: hwData.grade || "Third Secondary (Baccalaureate)",
        courseId: hwData.courseId || null,
        unit: hwData.unit || "Unit 1",
        dueDate: hwData.dueDate,
        totalPoints: parseInt(hwData.totalPoints) || 50,
      };
      await db.insert(homework).values(newHw);

      // Broadcast to students of the grade
      const students = await db.select().from(users).where(eq(users.role, "student"));
      for (const st of students) {
        if (st.grade === newHw.grade) {
          await db.insert(notifications).values({
            id: `notif_${Date.now()}_${st.id}`,
            userId: st.id,
            title: "📝 واجب جديد من المدرس",
            message: `واجب "${newHw.title}" — موعد التسليم: ${newHw.dueDate}`,
            type: "quiz",
          });
        }
      }

      return NextResponse.json({ success: true, homework: newHw });
    }

    if (action === "grade") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;

      const { submissionId, score, feedback } = body;
      const subs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, submissionId));
      if (subs.length === 0) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const hw = await db.select().from(homework).where(eq(homework.id, subs[0].homeworkId));
      const maxPts = hw[0]?.totalPoints || 50;
      const safeScore = Math.max(0, Math.min(parseInt(score) || 0, maxPts));

      await db
        .update(homeworkSubmissions)
        .set({ status: "graded", score: safeScore, feedback: feedback || "", gradedAt: new Date() })
        .where(eq(homeworkSubmissions.id, submissionId));

      // Award partial points in platform gamification + notify student
      await db
        .update(users)
        .set({ points: sql_inc("points", safeScore) })
        .where(eq(users.id, subs[0].studentId))
        .catch(() => null);

      await db.insert(notifications).values({
        id: `notif_${Date.now()}`,
        userId: subs[0].studentId,
        title: "✅ تم تصحيح واجبك",
        message: `درجتك في "${hw[0]?.title || "الواجب"}": ${safeScore}/${maxPts}${feedback ? ` — ملاحظة المدرس: ${feedback}` : ""}`,
        type: "quiz",
      });

      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      await db.delete(homework).where(eq(homework.id, body.homeworkId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Homework POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// Points increment helper that tolerates missing drizzle sql import style
import { sql } from "drizzle-orm";
function sql_inc(column: string, amount: number) {
  return sql`${sql.raw(column)} + ${amount}` as any;
}
