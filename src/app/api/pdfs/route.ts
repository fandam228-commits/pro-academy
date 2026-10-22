import { db } from "@/db";
import { pdfDocuments, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

// Direct-to-Blob uploads handle large files; this limit remains for legacy multipart uploads.
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB legacy fallback
const MAX_BLOB_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");
  const topic = searchParams.get("topic");
  const courseId = searchParams.get("courseId");

  try {
    // Never return the heavy base64 payload in the list endpoint
    const all = await db.select().from(pdfDocuments);
    let docs = all.map(({ fileData, ...rest }) => ({ ...rest, storagePath: rest.storagePath?.startsWith("https://") ? null : rest.storagePath }));
    if (ctx.user.role === "student") {
      const active = await db.select({ courseId: enrollments.courseId }).from(enrollments).where(and(eq(enrollments.studentId, ctx.user.id), eq(enrollments.status, "active")));
      const allowed = new Set(active.map((e) => e.courseId));
      docs = docs.filter((d) => !d.courseId || allowed.has(d.courseId));
    }

    if (search) {
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          (d.description || "").toLowerCase().includes(search) ||
          (d.topic || "").toLowerCase().includes(search)
      );
    }
    if (stage) docs = docs.filter((d) => d.stage === stage);
    if (grade) docs = docs.filter((d) => d.grade === grade);
    if (topic) docs = docs.filter((d) => d.topic === topic);
    if (courseId) docs = docs.filter((d) => d.courseId === courseId);

    const stats = {
      total: docs.length,
      totalViews: docs.reduce((s, d) => s + (d.views || 0), 0),
      totalDownloads: docs.reduce((s, d) => s + (d.downloads || 0), 0),
    };

    return NextResponse.json({ documents: docs, stats });
  } catch (error) {
    console.error("PDFs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch PDF library" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { denied } = await requireRoles(req, ["admin", "teacher"]);
  if (denied) return denied;

  const contentType = req.headers.get("content-type") || "";

  // -------- MULTIPART: FILE UPLOAD (stored in Postgres as base64) --------
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const file = form.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
      }

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
      }

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          {
            error:
              "الملف كبير جداً. الحد الأقصى على السيرفر 4 ميجابايت. صغّر الملف أو ارفعه على Google Drive وضع الرابط.",
          },
          { status: 400 }
        );
      }

      const title = String(form.get("title") || file.name.replace(/\.pdf$/i, ""));
      const description = String(form.get("description") || "");
      const uploaderId = String(form.get("uploaderId") || "usr_admin_1");
      const uploaderName = String(form.get("uploaderName") || "Mr. Habib El Rahman");
      const stage = String(form.get("stage") || "Secondary");
      const grade = String(form.get("grade") || "Third Secondary (Baccalaureate)");
      const unit = String(form.get("unit") || "Unit 1");
      const topic = String(form.get("topic") || "General Notes");
      const courseId = String(form.get("courseId") || "");
      const allowDownload = String(form.get("allowDownload") || "false") === "true";
      const watermarkEnabled = String(form.get("watermarkEnabled") || "true") === "true";

      const id = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      // Store file content in the database (works on Vercel serverless)
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");

      const newDoc = {
        id,
        title,
        description,
        uploaderId,
        uploaderName,
        stage,
        grade,
        unit,
        topic,
        courseId: courseId || null,
        fileName: safeName,
        storagePath: null,
        fileData: base64,
        externalUrl: null,
        fileSizeKb: Math.round(file.size / 1024),
        pageCount: 1,
        views: 0,
        downloads: 0,
        isProtected: true,
        watermarkEnabled,
        allowDownload,
      };

      await db.insert(pdfDocuments).values(newDoc);

      // Don't return the heavy base64 blob to the client
      const { fileData: _omit, ...publicDoc } = newDoc;
      return NextResponse.json({ success: true, document: publicDoc });
    } catch (error) {
      console.error("PDF upload error:", error);
      return NextResponse.json(
        { error: "PDF upload failed. Try a smaller file (under 4MB)." },
        { status: 500 }
      );
    }
  }

  // -------- JSON ACTIONS --------
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "delete") {
      const { documentId } = body;
      await db.delete(pdfDocuments).where(eq(pdfDocuments.id, documentId));
      return NextResponse.json({ success: true });
    }

    if (action === "update_meta") {
      const { documentId, meta } = body;
      await db
        .update(pdfDocuments)
        .set({
          title: meta.title,
          description: meta.description || null,
          unit: meta.unit || "Unit 1",
          topic: meta.topic || "General Notes",
          stage: meta.stage || "Secondary",
          grade: meta.grade || "Third Secondary (Baccalaureate)",
          allowDownload: !!meta.allowDownload,
          watermarkEnabled: meta.watermarkEnabled !== false,
        })
        .where(eq(pdfDocuments.id, documentId));
      return NextResponse.json({ success: true });
    }

    // Register a PDF uploaded directly from the browser to Vercel Blob.
    // The Blob URL is kept server-side in storagePath and is never returned by the library list API.
    if (action === "add_blob") {
      const { title, description, blobUrl, fileName, fileSize, stage, grade, unit, topic, courseId, allowDownload } = body;
      if (!title || !blobUrl || !fileName || !Number.isFinite(Number(fileSize))) {
        return NextResponse.json({ error: "Title, uploaded PDF URL, file name, and size are required." }, { status: 400 });
      }
      let parsedUrl: URL;
      try { parsedUrl = new URL(blobUrl); } catch { return NextResponse.json({ error: "Invalid uploaded file URL." }, { status: 400 }); }
      if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".blob.vercel-storage.com")) {
        return NextResponse.json({ error: "Only files uploaded to the configured Vercel Blob store are allowed." }, { status: 400 });
      }
      if (Number(fileSize) <= 0 || Number(fileSize) > MAX_BLOB_SIZE_BYTES) {
        return NextResponse.json({ error: "PDF must be 100MB or smaller." }, { status: 400 });
      }
      const id = `pdf_blob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newDoc = {
        id,
        title: String(title),
        description: String(description || ""),
        uploaderId: "usr_admin_1",
        uploaderName: "Mr. Habib El Rahman",
        stage: String(stage || "Secondary"),
        grade: String(grade || "Third Secondary (Baccalaureate)"),
        unit: String(unit || "General"),
        topic: String(topic || "Exam Papers"),
        courseId: String(courseId || "") || null,
        fileName: String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_"),
        storagePath: parsedUrl.toString(),
        fileData: null,
        externalUrl: null,
        fileSizeKb: Math.round(Number(fileSize) / 1024),
        pageCount: 1,
        views: 0,
        downloads: 0,
        isProtected: true,
        watermarkEnabled: true,
        allowDownload: !!allowDownload,
      };
      await db.insert(pdfDocuments).values(newDoc);
      const { storagePath: _omitStorageUrl, ...publicDoc } = newDoc;
      return NextResponse.json({ success: true, document: publicDoc });
    }

    // Allow linking an external PDF URL (Google Drive / any public link)
    if (action === "add_external") {
      const { title, description, externalUrl, stage, grade, unit, topic, allowDownload } = body;
      if (!title || !externalUrl) {
        return NextResponse.json({ error: "Title and external URL are required." }, { status: 400 });
      }
      const id = `pdf_ext_${Date.now()}`;
      const newDoc = {
        id,
        title,
        description: description || "",
        uploaderId: "usr_admin_1",
        uploaderName: "Mr. Habib El Rahman",
        stage: stage || "Secondary",
        grade: grade || "Third Secondary (Baccalaureate)",
        unit: unit || "Unit 1",
        topic: topic || "General Notes",
        courseId: null,
        fileName: `${title}.pdf`,
        storagePath: null,
        fileData: null,
        externalUrl,
        fileSizeKb: 0,
        pageCount: 1,
        views: 0,
        downloads: 0,
        isProtected: true,
        watermarkEnabled: true,
        allowDownload: !!allowDownload,
      };
      await db.insert(pdfDocuments).values(newDoc);
      return NextResponse.json({ success: true, document: newDoc });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PDFs POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
