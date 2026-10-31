import { db } from "@/db";
import { parentLinks, users } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Record an administrator's explicit verification of a parent/student link.
 * The administrator must independently confirm the relationship before calling this endpoint.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Reject unauthenticated and non-admin requests before triggering database setup.
  // This mirrors DELETE and prevents unauthorized requests from invoking setup/migration work.
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDbSetup();
  try {
    const { id } = await params;
    if (!id || !id.trim()) return NextResponse.json({ error: "Invalid parent link id" }, { status: 400 });

    const rows = await db
      .select({ id: parentLinks.id, parentId: parentLinks.parentId, studentId: parentLinks.studentId })
      .from(parentLinks)
      .where(eq(parentLinks.id, id));
    const link = rows[0];
    if (!link) return NextResponse.json({ error: "Parent link not found" }, { status: 404 });

    const [parentRows, studentRows] = await Promise.all([
      db.select({ role: users.role }).from(users).where(eq(users.id, link.parentId)),
      db.select({ role: users.role }).from(users).where(eq(users.id, link.studentId)),
    ]);
    if (parentRows[0]?.role !== "parent" || studentRows[0]?.role !== "student") {
      return NextResponse.json({ error: "Parent link does not resolve to a current parent and student account" }, { status: 409 });
    }

    const verifiedAt = new Date();
    await db.update(parentLinks)
      .set({ verifiedAt, verifiedBy: ctx.user.id })
      .where(eq(parentLinks.id, id));

    return NextResponse.json({ success: true, verifiedAt: verifiedAt.toISOString() });
  } catch (error) {
    console.error("Parent link verification error:", error);
    return NextResponse.json({ error: "Unable to verify parent link" }, { status: 500 });
  }
}

/** Revoke a previously recorded verification without deleting the relationship history. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureDbSetup();
  try {
    const { id } = await params;
    if (!id || !id.trim()) return NextResponse.json({ error: "Invalid parent link id" }, { status: 400 });

    const rows = await db.select({ id: parentLinks.id }).from(parentLinks).where(eq(parentLinks.id, id));
    if (!rows[0]) return NextResponse.json({ error: "Parent link not found" }, { status: 404 });

    await db.update(parentLinks)
      .set({ verifiedAt: null, verifiedBy: null })
      .where(eq(parentLinks.id, id));

    return NextResponse.json({ success: true, verified: false });
  } catch (error) {
    console.error("Parent link verification revocation error:", error);
    return NextResponse.json({ error: "Unable to revoke parent link verification" }, { status: 500 });
  }
}
