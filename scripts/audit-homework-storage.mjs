import { Client } from "pg";
import {
  assertSafeHomeworkAuditTarget,
  beginConsistentReadOnlyHomeworkAudit,
  scanHomeworkStorageReferences,
  buildHomeworkStorageAuditReport,
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
    await beginConsistentReadOnlyHomeworkAudit(client);
    readOnlyTransactionStarted = true;

    const summary = await scanHomeworkStorageReferences(client);

    await client.query("ROLLBACK");
    readOnlyTransactionStarted = false;

    console.log(JSON.stringify(buildHomeworkStorageAuditReport(databaseScope, summary), null, 2));
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
