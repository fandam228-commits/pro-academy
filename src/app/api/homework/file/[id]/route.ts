import { db } from "@/db";
import { homeworkSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import fs from "fs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const subs = await db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, id));
    if (subs.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const sub = subs[0];
    // Only the owning student, teachers, or admins may view the answer file
    const isAllowed = ctx.user.role === "teacher" || ctx.user.role === "admin" || ctx.user.id === sub.studentId;
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!sub.storagePath) {
      return NextResponse.json({ error: "No file attached to this submission" }, { status: 404 });
    }

    let buffer: Buffer;
    try {
      buffer = await fs.promises.readFile(sub.storagePath);
    } catch {
      return NextResponse.json({ error: "File missing on server" }, { status: 404 });
    }

    const ext = (sub.fileName || "").split(".").pop()?.toLowerCase() || "";
    const mime =
      ext === "pdf" ? "application/pdf" : ext === "png" || ext === "jpg" || ext === "jpeg" ? `image/${ext === "jpg" ? "jpeg" : ext}` : "application/octet-stream";

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${sub.fileName || "answer"}"`,
        "Cache-Control": "private, max-age=0",
      },
    });
  } catch (error) {
    console.error("Homework file error:", error);
    return NextResponse.json({ error: "Failed to stream file" }, { status: 500 });
  }
}
