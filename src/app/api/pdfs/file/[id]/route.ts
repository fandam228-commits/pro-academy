import { db } from "@/db";
import { pdfDocuments, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { canStudentAccessPdf } from "@/lib/pdf-authorization.mjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbSetup();
  try {
    const { user, denied } = await requireRoles(req, ["admin", "teacher", "student"]);
    if (denied) return denied;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";

    const docs = await db.select().from(pdfDocuments).where(eq(pdfDocuments.id, id));
    if (docs.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = docs[0];

    if (user!.role === "student") {
      const active = doc.courseId
        ? await db
            .select({ courseId: enrollments.courseId })
            .from(enrollments)
            .where(and(eq(enrollments.studentId, user!.id), eq(enrollments.courseId, doc.courseId), eq(enrollments.status, "active")))
        : [];
      const allowed = canStudentAccessPdf({
        studentGrade: user!.grade,
        documentGrade: doc.grade,
        documentCourseId: doc.courseId,
        isProtected: doc.isProtected,
        activeCourseIds: active.map((enrollment) => enrollment.courseId),
      });
      if (!allowed) {
        return NextResponse.json({ error: "You do not have access to this document." }, { status: 403 });
      }
    }

    if (isDownload && !doc.allowDownload && user!.role !== "admin") {
      return NextResponse.json({ error: "Downloads are disabled for this document." }, { status: 403 });
    }

    if (doc.externalUrl) {
      if (isDownload && doc.allowDownload) {
        await db.update(pdfDocuments).set({ downloads: (doc.downloads || 0) + 1 }).where(eq(pdfDocuments.id, id));
      } else {
        await db.update(pdfDocuments).set({ views: (doc.views || 0) + 1 }).where(eq(pdfDocuments.id, id));
      }
      return NextResponse.redirect(doc.externalUrl);
    }

    let fileBuffer: Buffer | null = null;
    if (doc.fileData) {
      fileBuffer = Buffer.from(doc.fileData, "base64");
    } else if (doc.storagePath) {
      try {
        fileBuffer = await fs.promises.readFile(doc.storagePath);
      } catch {
        return NextResponse.json({ error: "Stored file is missing on server" }, { status: 404 });
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: "No file attached to this document" }, { status: 404 });
    }

    if (isDownload && doc.allowDownload) {
      await db.update(pdfDocuments).set({ downloads: (doc.downloads || 0) + 1 }).where(eq(pdfDocuments.id, id));
    } else {
      await db.update(pdfDocuments).set({ views: (doc.views || 0) + 1 }).where(eq(pdfDocuments.id, id));
    }

    const disposition = isDownload && doc.allowDownload ? "attachment" : "inline";
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${doc.fileName.replace(/[\\\r\n"]/g, "_")}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("PDF stream error:", error);
    return NextResponse.json({ error: "Failed to stream PDF" }, { status: 500 });
  }
}
