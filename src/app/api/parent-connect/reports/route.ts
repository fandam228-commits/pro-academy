import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import {
  generateStudentReport,
  verifySignedReportToken,
  createSignedReportToken,
} from "@/lib/smart-reports";
import { formatWhatsAppParentReport } from "@/lib/whatsapp-report-formatter";

export async function GET(req: Request) {
  await ensureDbSetup();

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const studentIdParam = searchParams.get("studentId");
    const period = (searchParams.get("period") || "weekly") as "weekly" | "monthly";
    const wantToken = searchParams.get("generate_token") === "true";

    // 1. Token-based access (from WhatsApp / Telegram / direct link)
    if (token) {
      const verified = verifySignedReportToken(token);
      if (!verified) {
        return NextResponse.json({ error: "رابط التقرير منتهي الصلاحية أو غير صالح" }, { status: 403 });
      }

      const report = await generateStudentReport(verified.studentId, verified.period, verified.parentId);
      if (!report) {
        return NextResponse.json({ error: "لم يتم العثور على بيانات الطالب" }, { status: 404 });
      }

      const origin = process.env.NEXT_PUBLIC_APP_URL || "https://pro-academy-sfl3.vercel.app";
      const shareableUrl = `${origin}/parent/report?token=${token}`;
      const whatsappSummary = formatWhatsAppParentReport({
        report,
        reportUrl: shareableUrl,
        parentPhone: report.parent?.phone,
      });

      return NextResponse.json({
        report,
        shareableToken: token,
        shareableUrl,
        whatsappSummary,
        mode: "token_verified",
      });
    }

    // 2. Authenticated user access (Admin, Teacher, Student, or Parent)
    const ctx = await getAuthContext(req);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = studentIdParam || (ctx.user.role === "student" ? ctx.user.id : null);
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const report = await generateStudentReport(studentId, period);
    if (!report) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const shareableToken = createSignedReportToken({ studentId, period });
    const origin = process.env.NEXT_PUBLIC_APP_URL || "https://pro-academy-sfl3.vercel.app";
    const shareableUrl = `${origin}/parent/report?token=${shareableToken}`;
    const whatsappSummary = formatWhatsAppParentReport({
      report,
      reportUrl: shareableUrl,
      parentPhone: report.parent?.phone,
    });

    return NextResponse.json({
      report,
      shareableToken,
      shareableUrl,
      whatsappSummary,
      mode: "authenticated",
    });
  } catch (error) {
    console.error("Parent Connect Reports GET error:", error);
    return NextResponse.json({ error: "فشل في استخراج التقرير" }, { status: 500 });
  }
}
