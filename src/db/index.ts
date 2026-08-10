import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Vercel Build Phase has no DATABASE_URL — use dummy URL so `next build` doesn't crash.
// At runtime Vercel injects the real DATABASE_URL and Pool will connect to the real DB.
const databaseUrl = process.env.DATABASE_URL;

// Detect Next.js build phase (no DB needed)
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const connectionString = databaseUrl || "postgresql://dummy:dummy@localhost:5432/dummy";

if (!databaseUrl && !isBuildPhase) {
  console.warn(
    "⚠️ DATABASE_URL is not set — database operations will fail. Set it in Vercel → Project → Settings → Environment Variables."
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString,
    // Keep build-phase pool lightweight
    ...(isBuildPhase ? { max: 1, idleTimeoutMillis: 1000, connectionTimeoutMillis: 1000 } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
