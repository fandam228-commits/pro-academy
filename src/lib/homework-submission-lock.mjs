import { sql } from "drizzle-orm";

/**
 * Serialize all submission create/replace attempts for one student/homework pair.
 * The lock is transaction-scoped, so it is released automatically on commit/rollback.
 * A hash collision can only serialize unrelated submissions; it cannot grant access.
 */
export async function withHomeworkSubmissionLock(tx, { homeworkId, studentId }, callback) {
  if (!tx || typeof tx.execute !== "function") {
    throw new TypeError("A database transaction is required for homework submission locking.");
  }
  if (typeof homeworkId !== "string" || homeworkId.trim() === ""
      || typeof studentId !== "string" || studentId.trim() === "") {
    throw new TypeError("A homework ID and student ID are required for submission locking.");
  }

  const lockKey = `homework-submission:${homeworkId}:${studentId}`;
  // READ COMMITTED gives the post-lock SELECT a fresh snapshot after any prior
  // transaction holding this key commits, even if the session default differs.
  await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`);
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`);
  return callback(tx);
}
