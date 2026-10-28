import { db } from "@/db";
import { pdfDocuments, enrollments, courses, parentLinks, users } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { canAttachPdfToCourse, canManagePdfDocument, canStudentAccessPdf } from "@/lib/pdf-authorization.mjs";
import { canListPdfDocument, toPublicPdfMetadata } from "@/lib/pdf-list-authorization.mjs";

// Vercel serverless body limit is ~4.5MB — keep uploads under that.
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

async function authorizePdfMutation(documentId: string, user: { id: string; role: string }) {
  const rows = await db
    .select({ id: pdfDocuments.id, uploaderId: pdfDocuments.uploaderId, courseId: pdfDocuments.courseId })
    .from(pdfDocuments)
    .where(eq(pdfDocuments.id, documentId));
  if (rows.length === 0) return { document: null, allowed: false };

  const document = rows[0];
  let courseTeacherId: string | null = null;
  if (document.courseId) {
    const courseRows = await db.select({ teacherId: courses.teacherId }).from(courses).where(eq(courses.id, document.courseId));
    courseTeacherId = courseRows[0]?.teacherId ?? null;
  }

  return {
    document,
    allowed: canManagePdfDocument({
      role: user.role,
      requesterId: user.id,
      uploaderId: document.uploaderId,
      documentId: document.id,
      documentCourseId: document.courseId,
      courseTeacherId,
    }),
  };
}

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
    // Select metadata only. Do not load file bytes or internal storage destinations
    // for a list response; the direct-file endpoint performs its own authorization.
    const all = await db.select({
      id: pdfDocuments.id,
      title: pdfDocuments.title,
      description: pdfDocuments.description,
      uploaderId: pdfDocuments.uploaderId,
      uploaderName: pdfDocuments.uploaderName,
      stage: pdfDocuments.stage,
      grade: pdfDocuments.grade,
      unit: pdfDocuments.unit,
      topic: pdfDocuments.topic,
      courseId: pdfDocuments.courseId,
      fileName: pdfDocuments.fileName,
      fileSizeKb: pdfDocuments.fileSizeKb,
      pageCount: pdfDocuments.pageCount,
      views: pdfDocuments.views,
      downloads: pdfDocuments.downloads,
      isProtected: pdfDocuments.isProtected,
      watermarkEnabled: pdfDocuments.watermarkEnabled,
      allowDownload: pdfDocuments.allowDownload,
      createdAt: pdfDocuments.createdAt,
    }).from(pdfDocuments);

    let activeCourseIds: string[] = [];
    let linkedStudentGrades: string[] = [];
    let ownedCourseIds = new Set<string>();

    if (ctx.user.role === "teacher") {
      const ownedCourses = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.teacherId, ctx.user.id));
      ownedCourseIds = new Set(ownedCourses.map((course) => course.id));
    }

    if (ctx.user.role === "student") {
      const active = await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(and(
          eq(enrollments.studentId, ctx.user.id),
          eq(enrollments.status, "active")
        ));
      activeCourseIds = [...new Set(active.map((enrollment) => enrollment.courseId))];
    }

    if (ctx.user.role === "parent") {
      const links = await db
        .select({ studentId: parentLinks.studentId })
        .from(parentLinks)
        .where(eq(parentLinks.parentId, ctx.user.id));
      const linkedStudentIds = [...new Set(links.map((link) => link.studentId))];

      if (linkedStudentIds.length > 0) {
        const [linkedUsers, linkedEnrollments] = await Promise.all([
          db.select({ grade: users.grade }).from(users).where(inArray(users.id, linkedStudentIds)),
          db.select({ courseId: enrollments.courseId })
            .from(enrollments)
            .where(and(
              inArray(enrollments.studentId, linkedStudentIds),
              eq(enrollments.status, "active")
            )),
        ]);
        linkedStudentGrades = [...new Set(
          linkedUsers
            .map((linkedUser) => linkedUser.grade)
            .filter((value): value is string => typeof value === "string" && value.length > 0)
        )];
        activeCourseIds = [...new Set(linkedEnrollments.map((enrollment) => enrollment.courseId))];
      }
    }

    const docs = all
      .filter((doc) => canListPdfDocument({
        role: ctx.user.role,
        requesterId: ctx.user.id,
        uploaderId: doc.uploaderId,
        documentCourseId: doc.courseId,
        courseTeacherId: doc.courseId && ownedCourseIds.has(doc.courseId) ? ctx.user.id : null,
        studentGrade: ctx.user.grade,
        documentGrade: doc.grade,
        // Treat missing protection metadata as protected (fail closed).
        isProtected: doc.isProtected !== false,
        activeCourseIds,
        linkedStudentGrades,
      }))
      .map((doc) => toPublicPdfMetadata(doc)!);

    if (search) {
      const filtered = docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(search) ||
          (doc.description || "").toLowerCase().includes(search) ||
          (doc.topic || "").toLowerCase().includes(search)
      );
      docs.splice(0, docs.length, ...filtered);
    }
    if (stage) {
      const filtered = docs.filter((doc) => doc.stage === stage);
      docs.splice(0, docs.length, ...filtered);
    }
    if (grade) {
      const filtered = docs.filter((doc) => doc.grade === grade);
      docs.splice(0, docs.length, ...filtered);
    }
    if (topic) {
      const filtered = docs.filter((doc) => doc.topic === topic);
      docs.splice(0, docs.length, ...filtered);
    }
    if (courseId) {
      const filtered = docs.filter((doc) => doc.courseId === courseId);
      docs.splice(0, docs.length, ...filtered);
    }

    const stats = {
      total: docs.length,
      totalViews: docs.reduce((sum, doc) => sum + (doc.views || 0), 0),
      totalDownloads: docs.reduce((sum, doc) => sum + (doc.downloads || 0), 0),
    };

    return NextResponse.json({ documents: docs, stats });
  } catch (error) {
    console.error("PDFs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch PDF library" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
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
      const uploaderId = user!.id;
      const uploaderName = user!.name;
      const stage = String(form.get("stage") || "Secondary");
      const grade = String(form.get("grade") || "Third Secondary (Baccalaureate)");
      const unit = String(form.get("unit") || "Unit 1");
      const topic = String(form.get("topic") || "General Notes");
      const courseId = String(form.get("courseId") || "").trim();
      if (courseId) {
        const linkedCourse = await db.select({ teacherId: courses.teacherId }).from(courses).where(eq(courses.id, courseId));
        if (linkedCourse.length === 0) return NextResponse.json({ error: "Course not found." }, { status: 404 });
        if (!canAttachPdfToCourse({ role: user!.role, requesterId: user!.id, courseTeacherId: linkedCourse[0].teacherId })) {
          return NextResponse.json({ error: "You may only attach PDFs to courses you own." }, { status: 403 });
        }
      }
      const allowDownload = String(form.get("allowDownload") || "false") === "true";
      const watermarkEnabled = String(form.get("watermarkEnabled") || "true") === "true";

      const id = `pdfu_${randomUUID()}`;
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
      if (!documentId) return NextResponse.json({ error: "Document ID is required." }, { status: 400 });
      const authorization = await authorizePdfMutation(documentId, user!);
      if (!authorization.document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
      if (!authorization.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      await db.delete(pdfDocuments).where(eq(pdfDocuments.id, documentId));
      return NextResponse.json({ success: true });
    }

    if (action === "update_meta") {
      const { documentId, meta } = body;
      if (!documentId || !meta || typeof meta !== "object") {
        return NextResponse.json({ error: "Document ID and metadata are required." }, { status: 400 });
      }
      const authorization = await authorizePdfMutation(documentId, user!);
      if (!authorization.document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
      if (!authorization.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      await db
        .update(pdfDocuments)
        .set({
          title: String(meta.title || "").trim(),
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

    // Allow linking an external PDF URL (Google Drive / any public link)
    if (action === "add_external") {
      const { title, description, externalUrl, stage, grade, unit, topic, allowDownload } = body;
      if (!title || !externalUrl) {
        return NextResponse.json({ error: "Title and external URL are required." }, { status: 400 });
      }
      const id = `pdfext_${randomUUID()}`;
      const newDoc = {
        id,
        title,
        description: description || "",
        uploaderId: user!.id,
        uploaderName: user!.name,
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
