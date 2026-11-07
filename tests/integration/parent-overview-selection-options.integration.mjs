import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { alias, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { getParentAnalyticsSelectionData } from "../../src/lib/analytics-report-scope.mjs";

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
  name: text("name").notNull(),
  grade: text("grade"),
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

async function readParentLinks(db, parentId) {
  return db
    .select({
      studentId: parentLinks.studentId,
      verifiedAt: parentLinks.verifiedAt,
      verifiedBy: parentLinks.verifiedBy,
      verifierRole: verifiedByUser.role,
    })
    .from(parentLinks)
    .innerJoin(parentAccountUser, eq(parentLinks.parentId, parentAccountUser.id))
    .innerJoin(users, eq(parentLinks.studentId, users.id))
    .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
    .where(and(
      eq(parentLinks.parentId, parentId),
      eq(parentAccountUser.role, "parent"),
      eq(users.role, "student"),
    ));
}

// Mirrors the selection-options query in /api/parent. It deliberately joins the
// current parent and verifier roles again instead of trusting an earlier snapshot.
async function readSelectableStudents(db, parentId, verifiedStudentIds) {
  if (verifiedStudentIds.length === 0) return [];
  return db
    .selectDistinct({
      id: users.id,
      name: users.name,
      grade: users.grade,
    })
    .from(users)
    .innerJoin(parentLinks, and(
      eq(parentLinks.studentId, users.id),
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
      inArray(users.id, verifiedStudentIds),
      eq(users.role, "student"),
    ));
}

integrationTest("parent child picker exposes only currently verified linked student profiles", async () => {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      "CREATE TEMP TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, grade TEXT, role TEXT NOT NULL);" +
      "CREATE TEMP TABLE parent_links (id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, student_id TEXT NOT NULL, verified_at TIMESTAMP, verified_by TEXT);" +
      "INSERT INTO users (id, name, grade, role) VALUES " +
      "('parent-1', 'Parent One', NULL, 'parent'), ('parent-2', 'Parent Two', NULL, 'parent'), " +
      "('student-verified', 'Verified Student', 'Third Secondary', 'student'), " +
      "('student-unverified', 'Unverified Student', 'Second Secondary', 'student'), " +
      "('student-stale-verifier', 'Stale Verifier Student', 'First Secondary', 'student'), " +
      "('student-other-parent', 'Other Parent Student', 'Third Prep', 'student'), " +
      "('admin-1', 'Current Admin', NULL, 'admin'), ('teacher-1', 'Demoted Admin', NULL, 'teacher');" +
      "INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES " +
      "('link-verified', 'parent-1', 'student-verified', NOW(), 'admin-1'), " +
      "('link-unverified', 'parent-1', 'student-unverified', NULL, NULL), " +
      "('link-stale-verifier', 'parent-1', 'student-stale-verifier', NOW(), 'teacher-1'), " +
      "('link-other-parent', 'parent-2', 'student-other-parent', NOW(), 'admin-1');"
    );

    const db = drizzle(client);
    const links = await readParentLinks(db, "parent-1");
    const selection = getParentAnalyticsSelectionData(links);

    assert.deepEqual(
      selection.allLinkedStudentIds.sort(),
      ["student-stale-verifier", "student-unverified", "student-verified"],
      "unverified links must remain in the ambiguity set",
    );
    assert.deepEqual(selection.verifiedStudentIds, ["student-verified"]);

    const selectable = await readSelectableStudents(db, "parent-1", selection.verifiedStudentIds);
    assert.deepEqual(selectable, [{
      id: "student-verified",
      name: "Verified Student",
      grade: "Third Secondary",
    }], "only the currently verified child may appear as a selection option");

    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'admin-1'");
    const afterVerifierDemotion = await readSelectableStudents(db, "parent-1", selection.verifiedStudentIds);
    assert.deepEqual(afterVerifierDemotion, [], "a demoted verifier must remove the child from selectable options");

    await client.query("UPDATE users SET role = 'admin' WHERE id = 'admin-1'");
    await client.query("UPDATE users SET role = 'teacher' WHERE id = 'parent-1'");
    const afterParentRoleChange = await readSelectableStudents(db, "parent-1", selection.verifiedStudentIds);
    assert.deepEqual(afterParentRoleChange, [], "a user who is no longer a parent must not receive child options");
  } finally {
    await client.end();
  }
});
