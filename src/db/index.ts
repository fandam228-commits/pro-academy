import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Vercel Build Phase has no DATABASE_URL — use dummy URL so `next build` doesn't crash.
// At runtime Vercel injects the real DATABASE_URL and Pool will connect to the real DB.
const databaseUrl = process.env.DATABASE_URL;

// Detect Next.js build phase (no DB needed)
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!databaseUrl && !isBuildPhase) {
  console.warn(
    "DATABASE_URL is not set — database operations are disabled until a database is configured."
  );
}

export function assertDatabaseConfigured(): void {
  if (!databaseUrl && !isBuildPhase) {
    throw new Error("DATABASE_URL is required for database operations.");
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const isRemotePostgres = Boolean(
  databaseUrl &&
    !databaseUrl.includes("localhost") &&
    !databaseUrl.includes("127.0.0.1")
);

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    ...(databaseUrl ? { connectionString: databaseUrl } : {}),
    ...(isRemotePostgres ? { ssl: { rejectUnauthorized: false } } : {}),
    connectionTimeoutMillis: isBuildPhase ? 1000 : 10000,
    idleTimeoutMillis: isBuildPhase ? 1000 : 30000,
    max: isBuildPhase ? 1 : 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
