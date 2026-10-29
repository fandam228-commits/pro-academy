import { Client } from "pg";
import {
  assertSafeHomeworkAuditTarget,
  summarizeHomeworkStoragePaths,
} from "../src/lib/homework-storage-audit.mjs";

const connectionString = process.env.DATABASE_URL;
const allowRemote = process.env.ALLOW_REMOTE_HOMEWORK_STORAGE_AUDIT === "true";
let auditAllowed = false;

try {
  assertSafeHomeworkAuditTarget(connectionString, allowRemote);
  auditAllowed = true;
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid audit configuration.");
  process.exitCode = 1;
}

if (auditAllowed) {
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

    // Read only the file-reference column; never fetch student names, IDs, or file contents.
    const result = await client.query("SELECT storage_path FROM homework_submissions");
    const summary = summarizeHomeworkStoragePaths(result.rows.map((row) => row.storage_path));

    await client.query("ROLLBACK");
    readOnlyTransactionStarted = false;

    console.log(JSON.stringify({
      auditMode: "read-only",
      databaseScope: allowRemote ? "explicit-remote-opt-in" : "local-only",
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
