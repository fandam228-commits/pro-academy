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
const parentAccountUser = alias(users, "parent_route_parent_account");
const verifiedByUser = alias(users, "parent_route_verified_by_user");
const studentAccountUser = alias(users, "parent_route_student_account");

// Keep this predicate structurally identical to the final revalidation query in
// src/app/api/parent/route.ts. It must prove the current parent, student, verifier,
// and verified link in one SQL statement.
async function readCurrentVerifiedParentLink(db, parentId, studentId) {
  return db
    .select({ id: studentAccountUser.id })
    .from(studentAccountUser)
    .innerJoin(parentLinks, and(
      eq(parentLinks.studentId, studentAccountUser.id),
      eq(parentLinks.parentId, parentId),
      isNotNull(parentLinks.verifiedAt),
      isNotNull(parentLinks.verifiedBy),
    ))
    .innerJoin(parentAccountUser, and(
      eq(parentLinks.parentId, parentAccountUser.id),
      eq(parentAccountUser.role, "parent"),
    ))
    .innerJoin(verifiedByUser, and(
      eq(parentLinks.verifiedBy, verifiedByUser.id),
      eq(verifiedByUser.role, "admin"),
    ))
    .where(and(
      eq(studentAccountUser.id, studentId),
      eq(studentAccountUser.role, "student"),
    ))
    .limit(1);
}

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Temporary tables are session-local; no persistent or production data is touched.
    await client.query(
      "CREATE TEMP TABLE users (id TEXT PRIMARY KEY, role TEXT NOT NULL);" +
      "CREATE TEMP TABLE parent_links (id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, student_id TEXT NOT NULL, verified_at TIMESTAMP, verified_by TEXT);" +
      "INSERT INTO users (id, role) VALUES " +
      "('parent-1', 'parent'), ('parent-2', 'parent'), ('student-1', 'student'), " +
      "('admin-1', 'admin'), ('admin-2', 'admin');" +
      "INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES " +
      "('link-1', 'parent-1', 'student-1', '2026-11-07 08:00:00', 'admin-1');"
    );
    await run({ db: drizzle(client), client });
  } finally {
    await client.end();
  }
}

integrationTest("parent overview final authorization fails closed when any current role or verified link changes", async () => {
  await withFixture(async ({ db, client }) => {
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 1);
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-2", "student-1")).length, 0);

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'parent-1'");
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 0);
    await client.query("UPDATE users SET role = 'parent' WHERE id = 'parent-1'");

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'student-1'");
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 0);
    await client.query("UPDATE users SET role = 'student' WHERE id = 'student-1'");

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'admin-1'");
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 0);
    await client.query("UPDATE users SET role = 'admin' WHERE id = 'admin-1'");

    await client.query("UPDATE parent_links SET verified_at = NULL WHERE id = 'link-1'");
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 0);
    await client.query("UPDATE parent_links SET verified_at = '2026-11-07 08:00:00' WHERE id = 'link-1'");

    await client.query("UPDATE parent_links SET verified_by = NULL WHERE id = 'link-1'");
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 0);
    await client.query("DELETE FROM parent_links WHERE id = 'link-1'");
    assert.equal((await readCurrentVerifiedParentLink(db, "parent-1", "student-1")).length, 0);
  });
});
