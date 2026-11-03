import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, isNotNull } from "drizzle-orm";
import { alias, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

function assertLocalTestDatabase(value) {
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

const users = pgTable("users", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
});
const parentLinks = pgTable("parent_links", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").notNull(),
  studentId: text("student_id").notNull(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"),
});
const parentAccount = alias(users, "report_parent_account");
const studentAccount = alias(users, "report_student_account");
const verifierAccount = alias(users, "report_verifier_account");

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Session-local temporary tables only; no persistent or production data is touched.
    await client.query(
      "CREATE TEMP TABLE users (id TEXT PRIMARY KEY, role TEXT NOT NULL);" +
      "CREATE TEMP TABLE parent_links (id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, student_id TEXT NOT NULL, verified_at TIMESTAMP, verified_by TEXT);" +
      "INSERT INTO users (id, role) VALUES " +
      "('admin-1', 'admin'), ('parent-1', 'parent'), ('parent-2', 'parent'), ('student-1', 'student'), ('student-2', 'student');" +
      "INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES " +
      "('link-1', 'parent-1', 'student-1', '2026-11-03 08:00:00', 'admin-1')," +
      "('link-2', 'parent-2', 'student-2', '2026-11-03 08:00:00', 'admin-1');"
    );
    await run({ db: drizzle(client) });
  } finally {
    await client.end();
  }
}

async function getVerifiedLinkedStudents(db, parentId) {
  return db
    .select({ studentId: parentLinks.studentId })
    .from(parentLinks)
    .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
    .innerJoin(studentAccount, eq(parentLinks.studentId, studentAccount.id))
    .innerJoin(verifierAccount, eq(parentLinks.verifiedBy, verifierAccount.id))
    .where(and(
      eq(parentLinks.parentId, parentId),
      eq(parentAccount.role, "parent"),
      eq(studentAccount.role, "student"),
      eq(verifierAccount.role, "admin"),
      isNotNull(parentLinks.verifiedAt),
      isNotNull(parentLinks.verifiedBy),
    ));
}

integrationTest("verified report links are available only while the parent, student, and verifier roles remain current", async () => {
  await withFixture(async ({ db }) => {
    const valid = await getVerifiedLinkedStudents(db, "parent-1");
    assert.deepEqual(valid.map((row) => row.studentId), ["student-1"]);

    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "parent-1"));
    const staleParent = await getVerifiedLinkedStudents(db, "parent-1");
    assert.deepEqual(staleParent, [], "a stale parent session must not authorize reports after the role changes");

    await db.update(users).set({ role: "parent" }).where(eq(users.id, "parent-1"));
    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "student-1"));
    const staleStudent = await getVerifiedLinkedStudents(db, "parent-1");
    assert.deepEqual(staleStudent, [], "a linked account that is no longer a student must not be exposed");

    await db.update(users).set({ role: "student" }).where(eq(users.id, "student-1"));
    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "admin-1"));
    const staleVerifier = await getVerifiedLinkedStudents(db, "parent-1");
    assert.deepEqual(staleVerifier, [], "verification by an account that is no longer an admin must fail closed");
  });
});

integrationTest("verified report links remain scoped to the authenticated parent ID", async () => {
  await withFixture(async ({ db }) => {
    const rows = await getVerifiedLinkedStudents(db, "parent-1");
    assert.deepEqual(rows.map((row) => row.studentId), ["student-1"]);
    assert.ok(!rows.some((row) => row.studentId === "student-2"));
  });
});
