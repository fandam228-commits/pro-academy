import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, exists } from "drizzle-orm";
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
const parentAccount = alias(users, "parent_link_parent_account");
const studentAccount = alias(users, "parent_link_student_account");

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Disposable session-local tables only; never touches persistent application data.
    await client.query(`
      CREATE TEMP TABLE users (id TEXT PRIMARY KEY, role TEXT NOT NULL);
      CREATE TEMP TABLE parent_links (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        verified_at TIMESTAMP,
        verified_by TEXT
      );
      INSERT INTO users (id, role) VALUES
        ('parent-valid', 'parent'),
        ('student-valid', 'student'),
        ('parent-role-changed', 'student'),
        ('student-role-changed', 'parent');
      INSERT INTO parent_links (id, parent_id, student_id) VALUES
        ('link-valid', 'parent-valid', 'student-valid'),
        ('link-bad-parent', 'parent-role-changed', 'student-valid'),
        ('link-bad-student', 'parent-valid', 'student-role-changed');
    `);
    await run({ db: drizzle(client) });
  } finally {
    await client.end();
  }
}

async function guardedVerify(db, linkId, adminId = "admin-1") {
  const verifiedAt = new Date("2026-10-31T12:00:00.000Z");
  return db.update(parentLinks)
    .set({ verifiedAt, verifiedBy: adminId })
    .where(and(
      eq(parentLinks.id, linkId),
      exists(db.select({ id: parentAccount.id }).from(parentAccount).where(and(
        eq(parentAccount.id, parentLinks.parentId),
        eq(parentAccount.role, "parent"),
      ))),
      exists(db.select({ id: studentAccount.id }).from(studentAccount).where(and(
        eq(studentAccount.id, parentLinks.studentId),
        eq(studentAccount.role, "student"),
      ))),
    ))
    .returning({ id: parentLinks.id });
}

integrationTest("PostgreSQL guarded verification updates only a current parent-to-student link", async () => {
  await withFixture(async ({ db }) => {
    const valid = await guardedVerify(db, "link-valid");
    assert.deepEqual(valid.map((row) => row.id), ["link-valid"]);

    const badParent = await guardedVerify(db, "link-bad-parent");
    const badStudent = await guardedVerify(db, "link-bad-student");
    assert.deepEqual(badParent, []);
    assert.deepEqual(badStudent, []);

    const rows = await db.select().from(parentLinks);
    assert.equal(rows.find((row) => row.id === "link-valid")?.verifiedBy, "admin-1");
    assert.equal(rows.find((row) => row.id === "link-bad-parent")?.verifiedAt, null);
    assert.equal(rows.find((row) => row.id === "link-bad-student")?.verifiedAt, null);
  });
});

integrationTest("PostgreSQL guarded verification fails closed when an account role changes after preflight", async () => {
  await withFixture(async ({ db }) => {
    // Model a successful preflight role check followed by a role change before UPDATE.
    const preflight = await db.select({ role: users.role }).from(users).where(eq(users.id, "parent-valid"));
    assert.equal(preflight[0]?.role, "parent");
    await db.update(users).set({ role: "student" }).where(eq(users.id, "parent-valid"));

    const updated = await guardedVerify(db, "link-valid");
    assert.deepEqual(updated, []);

    const rows = await db.select().from(parentLinks).where(eq(parentLinks.id, "link-valid"));
    assert.equal(rows[0]?.verifiedAt, null);
    assert.equal(rows[0]?.verifiedBy, null);
  });
});
