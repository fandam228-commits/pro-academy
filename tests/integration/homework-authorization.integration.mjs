import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { canAssignHomeworkToCourse } from "../../src/lib/homework-authorization.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
});

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
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
    await client.query(`
      CREATE TEMP TABLE courses (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL
      );
      INSERT INTO courses (id, teacher_id) VALUES
        ('course-owned', 'teacher-1'),
        ('course-other', 'teacher-2');
    `);
    await run(drizzle(client));
  } finally {
    await client.end();
  }
}

integrationTest("PostgreSQL course lookup enforces the database-backed homework ownership policy", async () => {
  await withFixture(async (db) => {
    const ownedRows = await db
      .select({ id: courses.id, teacherId: courses.teacherId })
      .from(courses)
      .where(eq(courses.id, "course-owned"));
    assert.equal(ownedRows.length, 1);
    assert.equal(
      canAssignHomeworkToCourse({
        role: "teacher",
        requesterId: "teacher-1",
        courseTeacherId: ownedRows[0].teacherId,
      }),
      true,
    );

    const otherRows = await db
      .select({ id: courses.id, teacherId: courses.teacherId })
      .from(courses)
      .where(eq(courses.id, "course-other"));
    assert.equal(otherRows.length, 1);
    assert.equal(
      canAssignHomeworkToCourse({
        role: "teacher",
        requesterId: "teacher-1",
        courseTeacherId: otherRows[0].teacherId,
      }),
      false,
      "a teacher must not attach homework to a course owned by another teacher",
    );

    const missingRows = await db
      .select({ id: courses.id, teacherId: courses.teacherId })
      .from(courses)
      .where(eq(courses.id, "course-missing"));
    assert.equal(missingRows.length, 0);
    assert.equal(
      canAssignHomeworkToCourse({
        role: "teacher",
        requesterId: "teacher-1",
        courseTeacherId: missingRows[0]?.teacherId,
      }),
      false,
      "a missing course must fail closed before homework creation",
    );
  });
});
