import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { alias, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { buildVerifiedParentLinkPredicate } from "../../src/lib/parent-report-authorization.mjs";

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
const parentAccount = alias(users, "weekly_report_parent_account");
const studentAccount = alias(users, "weekly_report_student_account");
const verifiedByUser = alias(users, "weekly_report_verifier_account");

integrationTest("weekly parent report predicate requires a live verified link and current account roles", async () => {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Temporary tables are session-local and contain synthetic identities only.
    await client.query(
      "CREATE TEMP TABLE users (id TEXT PRIMARY KEY, role TEXT NOT NULL);" +
      "CREATE TEMP TABLE parent_links (id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, student_id TEXT NOT NULL, verified_at TIMESTAMP, verified_by TEXT);" +
      "INSERT INTO users (id, role) VALUES ('parent-1', 'parent'), ('student-1', 'student'), ('admin-1', 'admin');" +
      "INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES ('link-1', 'parent-1', 'student-1', NOW(), 'admin-1');"
    );

    const db = drizzle(client);
    const isAllowed = async () => {
      const rows = await db.select({ allowed: buildVerifiedParentLinkPredicate({
        db,
        parentLinks,
        parentAccount,
        studentAccount,
        verifiedByUser,
        parentId: "parent-1",
        studentId: "student-1",
      }) });
      return rows[0]?.allowed === true;
    };

    assert.equal(await isAllowed(), true, "a currently verified parent/student/admin relationship must authorize");

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'parent-1'");
    assert.equal(await isAllowed(), false, "a parent account demoted to teacher must lose access immediately");
    await client.query("UPDATE users SET role = 'parent' WHERE id = 'parent-1'");

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'student-1'");
    assert.equal(await isAllowed(), false, "a linked account that is no longer a student must not authorize");
    await client.query("UPDATE users SET role = 'student' WHERE id = 'student-1'");

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'admin-1'");
    assert.equal(await isAllowed(), false, "a verifier who loses admin role must no longer authorize the link");
    await client.query("UPDATE users SET role = 'admin' WHERE id = 'admin-1'");

    await client.query("UPDATE parent_links SET verified_at = NULL WHERE id = 'link-1'");
    assert.equal(await isAllowed(), false, "a link without a verification timestamp must fail closed");
    await client.query("UPDATE parent_links SET verified_at = NOW(), verified_by = NULL WHERE id = 'link-1'");
    assert.equal(await isAllowed(), false, "a link without a verifier identity must fail closed");

    await client.query("DELETE FROM parent_links WHERE id = 'link-1'");
    assert.equal(await isAllowed(), false, "a revoked/deleted parent link must immediately lose report access");
  } finally {
    await client.end();
  }
});
