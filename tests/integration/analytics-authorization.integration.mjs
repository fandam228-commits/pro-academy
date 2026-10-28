import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { canAccessStudentAnalytics } from "../../src/lib/analytics-authorization.mjs";
import {
  getTeacherAnalyticsStudentIds,
  getTeacherAnalyticsCourseIds,
  resolveParentAnalyticsStudentId,
} from "../../src/lib/analytics-report-scope.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

// Keep this suite safe by refusing any non-local database URL. CI supplies an
// ephemeral PostgreSQL service; these tests must never point at production.
function assertLocalTestDatabase(value) {
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
});
const enrollments = pgTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  status: text("status"),
});
const parentLinks = pgTable("parent_links", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").notNull(),
  studentId: text("student_id").notNull(),
});

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Temporary tables are scoped to this client connection and disappear
    // when it closes; no persistent or production tables are touched.
    await client.query(`
      CREATE TEMP TABLE courses (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL
      );
      CREATE TEMP TABLE enrollments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        status TEXT
      );
      CREATE TEMP TABLE parent_links (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        student_id TEXT NOT NULL
      );

      INSERT INTO courses (id, teacher_id) VALUES
        ('course-a', 'teacher-1'),
        ('course-b', 'teacher-1'),
        ('course-other', 'teacher-2');

      INSERT INTO enrollments (id, student_id, course_id, status) VALUES
        ('enroll-1', 'student-1', 'course-a', 'active'),
        ('enroll-2', 'student-1', 'course-other', 'active'),
        ('enroll-3', 'student-2', 'course-b', 'completed'),
        ('enroll-4', 'student-3', 'course-a', 'cancelled'),
        ('enroll-5', 'student-4', 'course-a', NULL),
        ('enroll-6', 'student-5', 'course-other', 'active');

      INSERT INTO parent_links (id, parent_id, student_id) VALUES
        ('link-1', 'parent-1', 'student-1'),
        ('link-2', 'parent-1', 'student-2'),
        ('link-3', 'parent-2', 'student-3');
    `);
    await run({ db: drizzle(client) });
  } finally {
    await client.end();
  }
}

integrationTest("PostgreSQL teacher enrollment query enforces owned-course scope and eligible statuses", async () => {
  await withFixture(async ({ db }) => {
    const rows = await db
      .select({
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        teacherId: courses.teacherId,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(courses.teacherId, "teacher-1"));

    assert.deepEqual(getTeacherAnalyticsStudentIds(rows, "teacher-1"), ["student-1", "student-2"]);
    assert.deepEqual(getTeacherAnalyticsCourseIds(rows, "teacher-1", "student-1"), ["course-a"]);
    assert.deepEqual(getTeacherAnalyticsCourseIds(rows, "teacher-1", "student-5"), []);
    assert.equal(
      canAccessStudentAnalytics({
        role: "teacher",
        requesterId: "teacher-1",
        studentId: "student-5",
        teacherStudentIds: getTeacherAnalyticsStudentIds(rows, "teacher-1"),
      }),
      false,
    );
  });
});

integrationTest("PostgreSQL parent links require explicit choice for multiple children and deny unlinked students", async () => {
  await withFixture(async ({ db }) => {
    const rows = await db
      .select({ studentId: parentLinks.studentId })
      .from(parentLinks)
      .where(eq(parentLinks.parentId, "parent-1"));
    const linkedIds = rows.map((row) => row.studentId);

    assert.deepEqual(
      resolveParentAnalyticsStudentId(null, linkedIds),
      { ok: false, reason: "student-id-required" },
    );
    assert.deepEqual(
      resolveParentAnalyticsStudentId("student-2", linkedIds),
      { ok: true, studentId: "student-2" },
    );
    assert.deepEqual(
      resolveParentAnalyticsStudentId("student-3", linkedIds),
      { ok: false, reason: "forbidden" },
    );
    assert.equal(
      canAccessStudentAnalytics({
        role: "parent",
        requesterId: "parent-1",
        studentId: "student-3",
        linkedParentStudentIds: linkedIds,
      }),
      false,
    );
  });
});

integrationTest("student analytics authorization is self-only", async () => {
  await withFixture(async () => {
    assert.equal(
      canAccessStudentAnalytics({
        role: "student",
        requesterId: "student-1",
        studentId: "student-1",
      }),
      true,
    );
    assert.equal(
      canAccessStudentAnalytics({
        role: "student",
        requesterId: "student-1",
        studentId: "student-2",
      }),
      false,
    );
  });
});
