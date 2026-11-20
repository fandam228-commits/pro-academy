/**
 * PRO MEDIA COMMAND CENTER (PMC) — Audit Logs API Route
 * Professional Academy — Mr. Habib El Rahman
 * Security and Compliance Audit Trail.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { getAuditLogHistory } from "@/lib/media-center/audit-logger";

export async function GET(req: Request) {
  // Viewing audit trails requires Super Admin or Analyst privileges
  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "all";
    const actorId = searchParams.get("actorId") || "all";
    const entityType = searchParams.get("entityType") || "all";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const history = await getAuditLogHistory({
      action,
      actorId,
      entityType,
      search,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load audit logs." }, { status: 500 });
  }
}
