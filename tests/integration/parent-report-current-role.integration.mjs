import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { alias, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  getParentAnalyticsSelectionData,
  resolveParentAnalyticsStudentId,
} from "../../src/lib/analytics-report-scope.mjs";

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
      "('admin-1', 'admin'), ('admin-demoted', 'admin'), ('parent-1', 'parent'), ('parent-2', 'parent'), " +
      "('parent-single', 'parent'), ('parent-unverified', 'parent'), ('student-1', 'student'), " +
      "('student-2', 'student'), ('student-3', 'student'), ('student-single', 'student'), ('student-unverified', 'student');" +
      "INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES " +
      "('link-1', 'parent-1', 'student-1', '2026-11-03 08:00:00', 'admin-1')," +
      "('link-2', 'parent-1', 'student-2', NULL, NULL)," +
      "('link-3', 'parent-1', 'student-3', '2026-11-03 08:00:00', 'admin-demoted')," +
      "('link-1-duplicate', 'parent-1', 'student-1', NULL, NULL)," +
      "('link-4', 'parent-2', 'student-2', '2026-11-03 08:00:00', 'admin-1')," +
      "('link-single', 'parent-single', 'student-single', '2026-11-03 08:00:00', 'admin-1')," +
      "('link-single-duplicate', 'parent-single', 'student-single', NULL, NULL)," +
      "('link-unverified', 'parent-unverified', 'student-unverified', NULL, NULL);"
    );
    await run({ db: drizzle(client) });
  } finally {
    await client.end();
  }
}

async function getParentSelectionRows(db, parentId) {
  return db
    .select({
      studentId: parentLinks.studentId,
      verifiedAt: parentLinks.verifiedAt,
      verifiedBy: parentLinks.verifiedBy,
      verifierRole: verifierAccount.role,
    })
    .from(parentLinks)
    .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
    .innerJoin(studentAccount, eq(parentLinks.studentId, studentAccount.id))
    // Keep all current parent/student links for ambiguity; only a current admin verifier authorizes.
    .leftJoin(verifierAccount, eq(parentLinks.verifiedBy, verifierAccount.id))
    .where(and(
      eq(parentLinks.parentId, parentId),
      eq(parentAccount.role, "parent"),
      eq(studentAccount.role, "student"),
    ));
}

integrationTest("parent reports require explicit selection across verified and unverified linked children", async () => {
  await withFixture(async ({ db }) => {
    const rows = await getParentSelectionRows(db, "parent-1");
    const selection = getParentAnalyticsSelectionData(rows);
    assert.deepEqual(selection.allLinkedStudentIds, ["student-1", "student-2", "student-3"]);
    assert.deepEqual(selection.verifiedStudentIds, ["student-1", "student-3"]);

    assert.deepEqual(
      resolveParentAnalyticsStudentId(null, selection.allLinkedStudentIds),
      { ok: false, reason: "student-id-required" },
    );

    const verified = resolveParentAnalyticsStudentId("student-1", selection.allLinkedStudentIds);
    assert.deepEqual(verified, { ok: true, studentId: "student-1" });
    assert.equal(selection.verifiedStudentIds.includes(verified.studentId), true);

    for (const unverifiedId of ["student-2"]) {
      const selected = resolveParentAnalyticsStudentId(unverifiedId, selection.allLinkedStudentIds);
      assert.equal(selected.ok, true);
      assert.equal(selection.verifiedStudentIds.includes(selected.studentId), false);
    }
  });
});

integrationTest("parent report selection remains scoped to the authenticated parent and current roles", async () => {
  await withFixture(async ({ db }) => {
    const parentTwo = getParentAnalyticsSelectionData(await getParentSelectionRows(db, "parent-2"));
    assert.deepEqual(parentTwo.allLinkedStudentIds, ["student-2"]);
    assert.deepEqual(parentTwo.verifiedStudentIds, ["student-2"]);

    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "parent-1"));
    assert.deepEqual(
      getParentAnalyticsSelectionData(await getParentSelectionRows(db, "parent-1")),
      { allLinkedStudentIds: [], verifiedStudentIds: [] },
    );
  });
});

integrationTest("parent report selection rejects one unverified child and deduplicates one verified child", async () => {
  await withFixture(async ({ db }) => {
    const single = getParentAnalyticsSelectionData(await getParentSelectionRows(db, "parent-single"));
    assert.deepEqual(single.allLinkedStudentIds, ["student-single"]);
    assert.deepEqual(single.verifiedStudentIds, ["student-single"]);
    assert.deepEqual(
      resolveParentAnalyticsStudentId(null, single.allLinkedStudentIds),
      { ok: true, studentId: "student-single" },
    );

    const unverified = getParentAnalyticsSelectionData(await getParentSelectionRows(db, "parent-unverified"));
    const resolution = resolveParentAnalyticsStudentId(null, unverified.allLinkedStudentIds);
    assert.deepEqual(resolution, { ok: true, studentId: "student-unverified" });
    assert.equal(unverified.verifiedStudentIds.includes(resolution.studentId), false);
  });
});

integrationTest("a verifier who loses admin role remains in the ambiguity set but cannot authorize a report", async () => {
  await withFixture(async ({ db }) => {
    const before = getParentAnalyticsSelectionData(await getParentSelectionRows(db, "parent-1"));
    assert.equal(before.allLinkedStudentIds.includes("student-3"), true);
    assert.equal(before.verifiedStudentIds.includes("student-3"), true);

    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "admin-demoted"));
    const after = getParentAnalyticsSelectionData(await getParentSelectionRows(db, "parent-1"));
    assert.equal(after.verifiedStudentIds.includes("student-3"), false);
  });
});
