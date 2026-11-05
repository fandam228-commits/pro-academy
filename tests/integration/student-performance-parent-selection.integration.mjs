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
const parentAccountUser = alias(users, "student_performance_parent_account");
const linkedStudentUser = alias(users, "student_performance_linked_student");
const verifiedByUser = alias(users, "student_performance_verified_by_user");

function assertLocalTestDatabase(value) {
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Connection-scoped temporary tables shadow application tables; no persistent data is touched.
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
        ('admin-1', 'admin'),
        ('admin-demoted', 'teacher'),
        ('parent-1', 'parent'),
        ('parent-demoted', 'student'),
        ('parent-single', 'parent'),
        ('parent-unverified', 'parent'),
        ('student-1', 'student'),
        ('student-2', 'student'),
        ('student-3', 'student'),
        ('student-demoted', 'teacher'),
        ('student-single', 'student'),
        ('student-unverified', 'student');
      INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES
        ('link-verified', 'parent-1', 'student-1', '2026-11-04T10:00:00Z', 'admin-1'),
        ('link-unverified', 'parent-1', 'student-2', NULL, NULL),
        ('link-demoted-verifier', 'parent-1', 'student-3', '2026-11-04T10:00:00Z', 'admin-demoted'),
        ('link-duplicate', 'parent-1', 'student-1', NULL, NULL),
        ('link-bad-parent', 'parent-demoted', 'student-1', '2026-11-04T10:00:00Z', 'admin-1'),
        ('link-bad-student', 'parent-1', 'student-demoted', '2026-11-04T10:00:00Z', 'admin-1'),
        ('link-single', 'parent-single', 'student-single', '2026-11-04T10:00:00Z', 'admin-1'),
        ('link-unverified-only', 'parent-unverified', 'student-unverified', NULL, NULL);
    `);
    await run({ db: drizzle(client) });
  } finally {
    await client.end();
  }
}

async function loadParentSelectionRows(db, parentId) {
  // Mirrors the student-performance route: all current parent/student links remain
  // in the ambiguity set; verifier status is read with LEFT JOIN for authorization.
  return db
    .select({
      studentId: parentLinks.studentId,
      verifiedAt: parentLinks.verifiedAt,
      verifiedBy: parentLinks.verifiedBy,
      verifierRole: verifiedByUser.role,
    })
    .from(parentLinks)
    .innerJoin(parentAccountUser, eq(parentLinks.parentId, parentAccountUser.id))
    .innerJoin(linkedStudentUser, eq(parentLinks.studentId, linkedStudentUser.id))
    .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
    .where(and(
      eq(parentLinks.parentId, parentId),
      eq(parentAccountUser.role, "parent"),
      eq(linkedStudentUser.role, "student"),
    ));
}

integrationTest("PostgreSQL parent performance selection requires explicit choice across verified and unverified children", async () => {
  await withFixture(async ({ db }) => {
    const rows = await loadParentSelectionRows(db, "parent-1");
    const selection = getParentAnalyticsSelectionData(rows);

    assert.deepEqual(selection.allLinkedStudentIds.sort(), ["student-1", "student-2", "student-3"]);
    assert.deepEqual(selection.verifiedStudentIds, ["student-1"]);

    assert.deepEqual(
      resolveParentAnalyticsStudentId(null, selection.allLinkedStudentIds),
      { ok: false, reason: "student-id-required" },
    );

    const verified = resolveParentAnalyticsStudentId("student-1", selection.allLinkedStudentIds);
    assert.deepEqual(verified, { ok: true, studentId: "student-1" });
    assert.equal(selection.verifiedStudentIds.includes(verified.studentId), true);

    for (const unverifiedId of ["student-2", "student-3"]) {
      const requested = resolveParentAnalyticsStudentId(unverifiedId, selection.allLinkedStudentIds);
      assert.equal(requested.ok, true);
      assert.equal(selection.verifiedStudentIds.includes(requested.studentId), false);
    }

    assert.deepEqual(
      resolveParentAnalyticsStudentId("student-outside-link", selection.allLinkedStudentIds),
      { ok: false, reason: "forbidden" },
    );
  });
});

integrationTest("PostgreSQL selection ignores stale parent and non-student target links", async () => {
  await withFixture(async ({ db }) => {
    const rows = await loadParentSelectionRows(db, "parent-1");
    const selection = getParentAnalyticsSelectionData(rows);
    assert.equal(selection.allLinkedStudentIds.includes("student-demoted"), false);

    const staleParentRows = await loadParentSelectionRows(db, "parent-demoted");
    assert.deepEqual(getParentAnalyticsSelectionData(staleParentRows), {
      allLinkedStudentIds: [],
      verifiedStudentIds: [],
    });
  });
});

integrationTest("PostgreSQL one-child default requires verification and deduplicates repeated links", async () => {
  await withFixture(async ({ db }) => {
    const singleRows = await loadParentSelectionRows(db, "parent-single");
    const single = getParentAnalyticsSelectionData(singleRows);
    assert.deepEqual(single.allLinkedStudentIds, ["student-single"]);
    assert.deepEqual(single.verifiedStudentIds, ["student-single"]);
    assert.deepEqual(
      resolveParentAnalyticsStudentId(null, single.allLinkedStudentIds),
      { ok: true, studentId: "student-single" },
    );

    const unverifiedRows = await loadParentSelectionRows(db, "parent-unverified");
    const unverified = getParentAnalyticsSelectionData(unverifiedRows);
    const resolution = resolveParentAnalyticsStudentId(null, unverified.allLinkedStudentIds);
    assert.deepEqual(resolution, { ok: true, studentId: "student-unverified" });
    assert.equal(unverified.verifiedStudentIds.includes(resolution.studentId), false);
  });
});
