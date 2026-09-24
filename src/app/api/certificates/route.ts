import { db } from "@/db";
import { certificates, enrollments, courses, users, parentLinks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const studentId = searchParams.get("studentId");

  try {
    if (code) {
      const certs = await db.select().from(certificates).where(eq(certificates.certificateCode, code.trim()));
      if (certs.length === 0) {
        return NextResponse.json({ valid: false, message: "Certificate code not found or invalid." });
      }
      const cert = certs[0];
      return NextResponse.json({ valid: true, certificate: { certificateCode: cert.certificateCode, studentName: cert.studentName, courseTitle: cert.courseTitle, grade: cert.grade, qrCodeData: cert.qrCodeData } });
    }

    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (studentId) {
      if (ctx.user.role === "student" && studentId !== ctx.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (ctx.user.role === "parent") {
        const links = await db.select().from(parentLinks).where(and(eq(parentLinks.parentId, ctx.user.id), eq(parentLinks.studentId, studentId)));
        if (!links.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!["student","parent","teacher","admin"].includes(ctx.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const studentCerts = await db.select().from(certificates).where(eq(certificates.studentId, studentId));
      return NextResponse.json({ certificates: studentCerts });
    }

    if (ctx.user.role !== "admin" && ctx.user.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const allCerts = await db.select().from(certificates);
    return NextResponse.json({ certificates: allCerts });
  } catch (error) {
    console.error("Certificates GET error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;
  try {
    const { studentId, courseId } = await req.json();

    const stList = await db.select().from(users).where(eq(users.id, studentId));
    const crsList = await db.select().from(courses).where(eq(courses.id, courseId));

    if (stList.length === 0 || crsList.length === 0) {
      return NextResponse.json({ error: "Student or course not found" }, { status: 400 });
    }

    const student = stList[0];
    const course = crsList[0];

    const certCode = `PRO-HABIB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const qrData = `https://proacademy.habibelrahman.com/verify/${certCode}`;

    const newCert = {
      id: `cert_${Date.now()}`,
      studentId,
      studentName: student.name,
      courseId,
      courseTitle: course.title,
      grade: course.grade,
      certificateCode: certCode,
      qrCodeData: qrData,
    };

    await db.insert(certificates).values(newCert);

    return NextResponse.json({ success: true, certificate: newCert });
  } catch (error) {
    console.error("Certificates POST error:", error);
    return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 });
  }
}
