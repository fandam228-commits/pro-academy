import { get } from "@vercel/blob";
import { db } from "@/db";
import { pdfDocuments, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";
import { isPrivateVercelBlobUrl } from "@/lib/pdf-authorization.mjs";

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

    if (user!.role === "student" && doc.isProtected && doc.courseId) {
      const access = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.studentId, user!.id), eq(enrollments.courseId, doc.courseId), eq(enrollments.status, "active")));

      if (access.length === 0) {
        return NextResponse.json({ error: "You are not enrolled in this course." }, { status: 403 });
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
    let blobStream: ReadableStream<Uint8Array> | null = null;
    if (doc.fileData) {
      fileBuffer = Buffer.from(doc.fileData, "base64");
    } else if (doc.storagePath?.startsWith("https://")) {
      // Protected PDFs must live in a private Blob store. A public Blob URL
      // would bypass the authorization checks in this route.
      if (!isPrivateVercelBlobUrl(doc.storagePath)) {
        return NextResponse.json(
          { error: "Protected PDFs require private Vercel Blob storage." },
          { status: 409 },
        );
      }
      try {
        const blob = await get(doc.storagePath, { access: "private" });
        if (!blob || blob.statusCode !== 200 || !blob.stream) {
          return NextResponse.json({ error: "Stored PDF is missing from private Blob storage" }, { status: 404 });
        }
        blobStream = blob.stream;
      } catch {
        return NextResponse.json({ error: "Unable to retrieve PDF from private Blob storage" }, { status: 502 });
      }
    } else if (doc.storagePath) {
      try {
        fileBuffer = await fs.promises.readFile(doc.storagePath);
      } catch {
        return NextResponse.json({ error: "Stored file is missing on server" }, { status: 404 });
      }
    }

    if (!fileBuffer && !blobStream) {
      return NextResponse.json({ error: "No file attached to this document" }, { status: 404 });
    }

    if (isDownload && doc.allowDownload) {
      await db.update(pdfDocuments).set({ downloads: (doc.downloads || 0) + 1 }).where(eq(pdfDocuments.id, id));
    } else {
      await db.update(pdfDocuments).set({ views: (doc.views || 0) + 1 }).where(eq(pdfDocuments.id, id));
    }

    const disposition = isDownload && doc.allowDownload ? "attachment" : "inline";
    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${doc.fileName.replace(/[\\\r\n"]/g, "_")}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    };
    if (fileBuffer) headers["Content-Length"] = String(fileBuffer.length);
    return new NextResponse(blobStream ?? new Uint8Array(fileBuffer!), { headers });
  } catch (error) {
    console.error("PDF stream error:", error);
    return NextResponse.json({ error: "Failed to stream PDF" }, { status: 500 });
  }
}
