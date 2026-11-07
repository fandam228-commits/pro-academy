const PRIVATE_HOMEWORK_PREFIX = "homework/";

async function unused() {}

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
 * Recognize Vercel's public Blob hostname as a high-priority provider-review
 * signal. This does not prove that an object still exists or is anonymously
 * accessible, and the URL itself is never returned or logged.
 */
function isKnownVercelPublicBlobUrl(value) {
  try {
    const parsed = new URL(value);
    // A trailing DNS dot is valid and must not evade the review counter.
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    return (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (host === "public.blob.vercel-storage.com" || host.endsWith(".public.blob.vercel-storage.com"));
  } catch {
    return false;
  }
}

/** Classifies a stored reference without exposing it; absolute URLs require review. */
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

/** Remote targets require explicit opt-in; all audit transactions remain read-only. */
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
    throw new Error("Refusing a non-local database by default. For an explicitly approved read-only audit only, set ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT=true.");
  }
  if (!isLocal) {
    const sslModes = parsed.searchParams.getAll("sslmode").map((mode) => mode.toLowerCase());
    if (sslModes.length !== 1 || sslModes[0] !== "verify-full") {
      throw new Error("Remote homework storage audits require DATABASE_URL sslmode=verify-full to verify the server certificate and hostname.");
    }
  }
  return isLocal ? "local" : "remote-read-only-opt-in";
}

/** Returns aggregate counts only; never returns stored paths or student identifiers. */
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
      case "empty": summary.empty += 1; break;
      case "private-path": summary.privatePath += 1; break;
      case "vercel-public-blob-url-needs-review": summary.vercelPublicBlobUrlNeedsReview += 1; break;
      case "absolute-url-needs-review": summary.absoluteUrlNeedsReview += 1; break;
      default: summary.unknownOrMalformed += 1;
    }
  }
  return summary;
}

export function mergeHomeworkStoragePathSummaries(...summaries) {
  const merged = summarizeHomeworkStoragePaths([]);
  for (const summary of summaries) {
    if (!summary || typeof summary !== "object") continue;
    for (const key of Object.keys(merged)) {
      const count = summary[key];
      if (Number.isSafeInteger(count) && count >= 0) merged[key] += count;
    }
  }
  return merged;
}
