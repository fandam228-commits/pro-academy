import { db } from "@/db";
import { pdfDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
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

    // External linked documents → redirect
    if (doc.externalUrl) {
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
      return NextResponse.redirect(doc.externalUrl);
    }

    // Preferred: base64 content stored in Postgres (works on Vercel)
    let fileBuffer: Buffer | null = null;
    if (doc.fileData) {
      fileBuffer = Buffer.from(doc.fileData, "base64");
    } else if (doc.storagePath) {
      // Legacy local-disk fallback (local dev only)
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

    const disposition = isDownload && doc.allowDownload ? "attachment" : "inline";
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${doc.fileName}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("PDF stream error:", error);
    return NextResponse.json({ error: "Failed to stream PDF" }, { status: 500 });
  }
}
