import { db } from "@/db";
import { pdfDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbSetup();
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";

    const docs = await db.select().from(pdfDocuments).where(eq(pdfDocuments.id, id));
    if (docs.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = docs[0];

    // Update view/download counter
    if (isDownload && doc.allowDownload) {
      await db
        .update(pdfDocuments)
        .set({ downloads: (doc.downloads || 0) + 1 })
        .where(eq(pdfDocuments.id, id));
    } else {
      await db
        .update(pdfDocuments)
        .set({ views: (doc.views || 0) + 1 })
        .where(eq(pdfDocuments.id, id));
    }

    // Redirect to Vercel Blob URL or external URL
    const fileUrl = doc.externalUrl;
    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL" }, { status: 404 });
    }

    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error("PDF stream error:", error);
    return NextResponse.json({ error: "Failed to stream PDF" }, { status: 500 });
  }
}
