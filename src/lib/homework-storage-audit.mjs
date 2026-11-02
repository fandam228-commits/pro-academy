const PRIVATE_HOMEWORK_PREFIX = "homework/";

/**
 * Start a stable, read-only snapshot so keyset-paginated audit batches observe
 * one consistent database view even if submissions change during the audit.
 */
export async function beginConsistentReadOnlyHomeworkAudit(client) {
  if (!client || typeof client.query !== "function") {
    throw new TypeError("A PostgreSQL-compatible client is required.");
  }
  await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
}

function isSafePrivateHomeworkPath(value) {
  if (!value.startsWith(PRIVATE_HOMEWORK_PREFIX)) return false;
  if (value.includes("\\") || value.includes("?") || value.includes("#") || value.includes("%")) return false;
  const segments = value.split("/");
  return segments.every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

/**
 * Recognize Vercel's public Blob hostname without logging or returning the URL.
 * This is a high-priority provider-review signal, not proof the object still exists.
 */
function isKnownVercelPublicBlobUrl(value) {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (host === "public.blob.vercel-storage.com" || host.endsWith(".public.blob.vercel-storage.com"));
  } catch {
    return false;
  }
}

/**
 * Classifies a stored homework file reference without exposing the reference itself.
 * An absolute URL is flagged for review; this does not claim that the URL is public.
 */
export function classifyHomeworkStoragePath(value) {
  if (typeof value !== "string" || value.trim() === "") return "empty";
  const normalized = value.trim();

  if (/^https?:\/\//i.test(normalized)) {
    return isKnownVercelPublicBlobUrl(normalized)
      ? "vercel-public-blob-url-needs-review"
      : "absolute-url-needs-review";
  }
  if (isSafePrivateHomeworkPath(normalized)) return "private-path";
  return "unknown-or-malformed";
}

/**
 * Guard against accidentally scanning a remote database. Remote read-only audits
 * require an explicit opt-in; the CLI still starts a PostgreSQL READ ONLY transaction.
 */
export function assertSafeHomeworkAuditTarget(connectionString, allowRemote = false) {
  if (typeof connectionString !== "string" || connectionString.trim() === "") {
    throw new Error("DATABASE_URL is required for the read-only homework storage audit.");
  }

  let parsed;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres:// or postgresql:// protocol.");
  }

  const host = parsed.hostname.toLowerCase();
  const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  if (!isLocal && allowRemote !== true) {
    throw new Error(
      "Refusing a non-local database by default. For an explicitly approved read-only audit only, set ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT=true."
    );
  }

  return isLocal ? "local" : "remote-read-only-opt-in";
}

/** Returns aggregate counts only; never returns or logs stored paths or student identifiers. */
export function summarizeHomeworkStoragePaths(values) {
  const summary = {
    totalRows: 0,
    empty: 0,
    privatePath: 0,
    vercelPublicBlobUrlNeedsReview: 0,
    absoluteUrlNeedsReview: 0,
    unknownOrMalformed: 0,
  };

  for (const value of Array.isArray(values) ? values : []) {
    summary.totalRows += 1;
    switch (classifyHomeworkStoragePath(value)) {
      case "empty":
        summary.empty += 1;
        break;
      case "private-path":
        summary.privatePath += 1;
        break;
      case "vercel-public-blob-url-needs-review":
        summary.vercelPublicBlobUrlNeedsReview += 1;
        break;
      case "absolute-url-needs-review":
        summary.absoluteUrlNeedsReview += 1;
        break;
      default:
        summary.unknownOrMalformed += 1;
    }
  }

  return summary;
}


/** Combine per-batch aggregate counts without retaining any stored file references. */
export function mergeHomeworkStoragePathSummaries(...summaries) {
  const merged = summarizeHomeworkStoragePaths([]);
  const keys = Object.keys(merged);

  for (const summary of summaries) {
    if (!summary || typeof summary !== "object") continue;
    for (const key of keys) {
      const count = summary[key];
      if (Number.isSafeInteger(count) && count >= 0) {
        merged[key] += count;
      }
    }
  }

  return merged;
}


const AUDIT_REPORT_COUNT_KEYS = [
  "totalRows",
  "empty",
  "privatePath",
  "vercelPublicBlobUrlNeedsReview",
  "absoluteUrlNeedsReview",
  "unknownOrMalformed",
];

/**
 * Build a strict, non-sensitive CLI report. Only aggregate count fields are
 * copied; extra properties (including raw paths, URLs, or student identifiers)
 * can never leak into serialized audit output.
 */
export function buildHomeworkStorageAuditReport(databaseScope, summary) {
  const safeScope = databaseScope === "local" || databaseScope === "remote-read-only-opt-in"
    ? databaseScope
    : "unknown";
  const counts = {};

  for (const key of AUDIT_REPORT_COUNT_KEYS) {
    const value = summary && typeof summary === "object" ? summary[key] : undefined;
    counts[key] = Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  return {
    auditMode: "read-only",
    databaseScope: safeScope,
    ...counts,
    note: "Known Vercel public Blob host references are counted separately for priority provider review; counts do not prove an object still exists or remains accessible. Other absolute URLs also require provider review. No paths, URLs, or student identifiers are printed.",
  };
}
