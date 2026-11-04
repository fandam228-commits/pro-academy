import "dotenv/config";
import { Client } from "pg";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  assertSafeHomeworkAuditTarget,
  beginConsistentReadOnlyHomeworkAudit,
  mergeHomeworkStoragePathSummaries,
  summarizeHomeworkStoragePaths,
} from "../src/lib/homework-storage-audit.mjs";

const DEFAULT_BATCH_SIZE = 500;
const MAX_BATCH_SIZE = 5000;

function getBatchSize(value) {
  if (value === undefined || value === "") return DEFAULT_BATCH_SIZE;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_BATCH_SIZE) {
    throw new Error(`HOMEWORK_AUDIT_BATCH_SIZE must be an integer between 1 and ${MAX_BATCH_SIZE}.`);
  }
  return parsed;
}

/**
 * Read-only inventory of homework file references. It reports aggregate counts
 * only: never prints stored paths, submission IDs, student IDs, or connection data.
 * Absolute URLs are flagged for review, not asserted to be publicly accessible.
 */
export async function runHomeworkStorageAudit({
  connectionString = process.env.DATABASE_URL,
  allowRemote = process.env.ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT === "true",
  batchSize = getBatchSize(process.env.HOMEWORK_AUDIT_BATCH_SIZE),
  ClientClass = Client,
  write = (line) => console.log(line),
} = {}) {
  const target = assertSafeHomeworkAuditTarget(connectionString, allowRemote);
  const client = new ClientClass({ connectionString });
  let connected = false;
  let transactionStarted = false;

  try {
    await client.connect();
    connected = true;
    await beginConsistentReadOnlyHomeworkAudit(client);
    transactionStarted = true;

    const transaction = await client.query(
      "SELECT current_setting('transaction_read_only') AS read_only, current_setting('transaction_isolation') AS isolation",
    );
    if (transaction.rows[0]?.read_only !== "on" || transaction.rows[0]?.isolation !== "repeatable read") {
      throw new Error("Database did not enter the required read-only repeatable-read transaction.");
    }

    let lastId = null;
    let summary = summarizeHomeworkStoragePaths([]);
    while (true) {
      const result = await client.query(
        `SELECT id, storage_path
         FROM homework_submissions
         WHERE ($1::text IS NULL OR id > $1)
         ORDER BY id ASC
         LIMIT $2`,
        [lastId, batchSize],
      );
      const rows = result.rows ?? [];
      if (rows.length === 0) break;

      summary = mergeHomeworkStoragePathSummaries(
        summary,
        summarizeHomeworkStoragePaths(rows.map((row) => row.storage_path)),
      );
      lastId = rows[rows.length - 1].id;
      if (rows.length < batchSize) break;
    }

    // Aggregate-only output: no host, credentials, file references, or row identifiers.
    write(JSON.stringify({
      audit: "homework-storage-reference-inventory",
      target,
      readOnly: true,
      snapshotIsolation: "repeatable read",
      batchSize,
      counts: summary,
      note: "absoluteUrlNeedsReview is not proof that a URL is publicly accessible; verify URLs with the storage provider through an approved process.",
    }, null, 2));
    return summary;
  } finally {
    if (connected && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original failure and guarantee the audit never commits writes.
      }
    }
    if (connected) await client.end();
  }
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedDirectly) {
  runHomeworkStorageAudit().catch((error) => {
    // Avoid printing raw connection details, SQL values, or stored file references.
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Homework storage audit failed: ${message}`);
    process.exitCode = 1;
  });
}
