import { Client } from "pg";
import {
  assertSafeHomeworkAuditTarget,
  summarizeHomeworkStoragePaths,
  mergeHomeworkStoragePathSummaries,
} from "../src/lib/homework-storage-audit.mjs";

const connectionString = process.env.DATABASE_URL;
const allowRemote = process.env.ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT === "true";
let databaseScope;

try {
  databaseScope = assertSafeHomeworkAuditTarget(connectionString, allowRemote);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid audit configuration.");
  process.exitCode = 1;
}

if (databaseScope) {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
  });
  let connected = false;
  let readOnlyTransactionStarted = false;

  try {
    await client.connect();
    connected = true;
    await client.query("BEGIN READ ONLY");
    readOnlyTransactionStarted = true;

    // Process a bounded number of rows per query so a large submissions table
    // cannot force the audit to retain every stored path in memory. IDs and paths
    // are used only in-process and are never printed.
    const batchSize = 500;
    let lastId = null;
    let summary = summarizeHomeworkStoragePaths([]);

    while (true) {
      const result = lastId === null
        ? await client.query(
            "SELECT id, storage_path FROM homework_submissions ORDER BY id ASC LIMIT $1",
            [batchSize],
          )
        : await client.query(
            "SELECT id, storage_path FROM homework_submissions WHERE id > $1 ORDER BY id ASC LIMIT $2",
            [lastId, batchSize],
          );

      if (result.rows.length === 0) break;

      summary = mergeHomeworkStoragePathSummaries(
        summary,
        summarizeHomeworkStoragePaths(result.rows.map((row) => row.storage_path)),
      );
      lastId = result.rows[result.rows.length - 1].id;

      if (result.rows.length < batchSize) break;
    }

    await client.query("ROLLBACK");
    readOnlyTransactionStarted = false;

    console.log(JSON.stringify({
      auditMode: "read-only",
      databaseScope,
      ...summary,
      note: "Absolute URLs require review in the storage provider; counts alone do not prove whether a URL is publicly accessible. No paths or student identifiers are printed.",
    }, null, 2));
  } catch {
    if (connected && readOnlyTransactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original audit failure without printing connection details.
      }
    }
    console.error("Read-only homework storage audit failed. No writes were issued; verify connectivity and the homework_submissions.storage_path schema.");
    process.exitCode = 1;
  } finally {
    if (connected) {
      try {
        await client.end();
      } catch {
        process.exitCode = 1;
      }
    }
  }
}
