import { db } from "@/db";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbSetup();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check error:", error);
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
