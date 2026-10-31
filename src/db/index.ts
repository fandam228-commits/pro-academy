import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
export const databaseConfigured = Boolean(databaseUrl);
export const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function isLoopbackDatabaseUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^\[|\]$/g, "");
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

if (!databaseConfigured && !isBuildPhase) {
  throw new Error("DATABASE_URL is required for runtime database operations.");
}

if (process.env.VERCEL && databaseUrl && isLoopbackDatabaseUrl(databaseUrl)) {
  throw new Error("DATABASE_URL must point to a remote database on Vercel.");
}

// Build-time imports need a syntactically valid pool URL, but must never target a local database.
const connectionString = databaseUrl ?? "postgresql://build.invalid:5432/build";

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
