import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { alias, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  getVerifiedParentAnalyticsStudentIds,
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
  name: text("name").notNull(),
  grade: text("grade"),
});
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
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"),
});
const attendanceRecords = pgTable("attendance_records", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  sessionTitle: text("session_title").notNull(),
  sessionDate: text("session_date").notNull(),
  status: text("status").notNull(),
  grade: text("grade"),
  markedBy: text("marked_by").notNull(),
});
const parentAccount = alias(users, "parent_account");
const verifiedByUser = alias(users, "verified_by_user");

async function withFixture(run) {
  assertLocalTestDatabase(connectionString);
  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Temporary tables are connection-scoped and disappear when this client closes.
    await client.query(`
      CREATE TEMP TABLE users (
        id TEXT PRIMARY KEY, role TEXT NOT NULL, name TEXT NOT NULL, grade TEXT
      );
      CREATE TEMP TABLE courses (id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL);
      CREATE TEMP TABLE enrollments (
        id TEXT PRIMARY KEY, student_id TEXT NOT NULL, course_id TEXT NOT NULL, status TEXT
      );
      CREATE TEMP TABLE parent_links (
        id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, student_id TEXT NOT NULL,
        verified_at TIMESTAMP, verified_by TEXT
      );
      CREATE TEMP TABLE attendance_records (
        id TEXT PRIMARY KEY, student_id TEXT NOT NULL, student_name TEXT NOT NULL,
        session_title TEXT NOT NULL, session_date TEXT NOT NULL, status TEXT NOT NULL,
        grade TEXT, marked_by TEXT NOT NULL
      );

      INSERT INTO users (id, role, name, grade) VALUES
        ('teacher-1', 'teacher', 'Teacher One', NULL),
        ('teacher-2', 'teacher', 'Teacher Two', NULL),
        ('admin-1', 'admin', 'Admin One', NULL),
        ('parent-1', 'parent', 'Parent One', NULL),
        ('parent-2', 'parent', 'Parent Two', NULL),
        ('student-1', 'student', 'Student One', 'Third Secondary'),
        ('student-2', 'student', 'Student Two', 'Third Secondary'),
        ('student-3', 'student', 'Student Three', 'Third Secondary'),
        ('student-4', 'student', 'Student Four', 'Third Secondary'),
        ('student-5', 'student', 'Student Five', 'Third Secondary');

      INSERT INTO courses (id, teacher_id) VALUES
        ('course-a', 'teacher-1'),
        ('course-b', 'teacher-1'),
        ('course-other', 'teacher-2');

      INSERT INTO enrollments (id, student_id, course_id, status) VALUES
        ('enroll-1', 'student-1', 'course-a', 'active'),
        ('enroll-2', 'student-2', 'course-b', 'completed'),
        ('enroll-3', 'student-3', 'course-other', 'active'),
        ('enroll-4', 'student-4', 'course-a', 'cancelled'),
        ('enroll-5', 'teacher-2', 'course-a', 'active');

      INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES
        ('link-1', 'parent-1', 'student-1', '2026-10-29 08:00:00', 'admin-1'),
        ('link-2', 'parent-1', 'student-2', '2026-10-29 08:00:00', 'admin-1'),
        ('link-3', 'parent-1', 'student-3', NULL, NULL),
        ('link-4', 'parent-1', 'student-4', '2026-10-29 08:00:00', 'teacher-2'),
        ('link-5', 'parent-2', 'student-5', '2026-10-29 08:00:00', 'admin-1');

      INSERT INTO attendance_records
        (id, student_id, student_name, session_title, session_date, status, grade, marked_by) VALUES
        ('att-1', 'student-1', 'Student One', 'Lesson A', '2026-10-29', 'present', 'Third Secondary', 'teacher-1'),
        ('att-2', 'student-2', 'Student Two', 'Lesson B', '2026-10-29', 'present', 'Third Secondary', 'teacher-2'),
        ('att-3', 'student-3', 'Student Three', 'Lesson A', '2026-10-29', 'present', 'Third Secondary', 'teacher-1'),
        ('att-4', 'student-4', 'Student Four', 'Lesson A', '2026-10-29', 'absent', 'Third Secondary', 'teacher-1'),
        ('att-5', 'student-1', 'Student One', 'Self Check-in', '2026-10-29', 'present', 'Third Secondary', 'self');
    `);
    await run({ db: drizzle(client) });
  } finally {
    await client.end();
  }
}

integrationTest("teacher attendance reads only their owned-course student roster and records they marked", async () => {
  await withFixture(async ({ db }) => {
    const rosterRows = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(and(
        eq(courses.teacherId, "teacher-1"),
        eq(users.role, "student"),
        inArray(enrollments.status, ["active", "completed"]),
      ));
    const allowedStudentIds = [...new Set(rosterRows.map((row) => row.studentId))].sort();
    assert.deepEqual(allowedStudentIds, ["student-1", "student-2"]);

    const teacherRecords = await db
      .select({ id: attendanceRecords.id, studentId: attendanceRecords.studentId })
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.markedBy, "teacher-1"),
        inArray(attendanceRecords.studentId, allowedStudentIds),
      ));
    assert.deepEqual(teacherRecords, [{ id: "att-1", studentId: "student-1" }]);
    assert.equal(allowedStudentIds.includes("student-3"), false, "another teacher's student must not enter this roster");
    assert.equal(allowedStudentIds.includes("student-4"), false, "cancelled enrollment must not authorize attendance access");
    assert.equal(allowedStudentIds.includes("teacher-2"), false, "a teacher account must not be treated as a student");
  });
});

integrationTest("teacher bulk marking must reject any student outside owned-course enrollment scope", async () => {
  await withFixture(async ({ db }) => {
    const rows = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(and(
        eq(courses.teacherId, "teacher-1"),
        eq(users.role, "student"),
        inArray(enrollments.status, ["active", "completed"]),
      ));
    const allowed = new Set(rows.map((row) => row.studentId));
    assert.equal([{ studentId: "student-1" }, { studentId: "student-2" }].every((mark) => allowed.has(mark.studentId)), true);
    assert.equal([{ studentId: "student-1" }, { studentId: "student-3" }].some((mark) => !allowed.has(mark.studentId)), true);
  });
});

integrationTest("parent attendance requires a current parent role, admin-verified student links, and explicit child selection", async () => {
  await withFixture(async ({ db }) => {
    const queryLinks = () => db
      .select({
        studentId: parentLinks.studentId,
        verifiedAt: parentLinks.verifiedAt,
        verifiedBy: parentLinks.verifiedBy,
      })
      .from(parentLinks)
      .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
      .innerJoin(users, eq(parentLinks.studentId, users.id))
      .innerJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
      .where(and(
        eq(parentLinks.parentId, "parent-1"),
        eq(parentAccount.role, "parent"),
        eq(users.role, "student"),
        eq(verifiedByUser.role, "admin"),
        isNotNull(parentLinks.verifiedAt),
        isNotNull(parentLinks.verifiedBy),
      ));

    const linkedIds = getVerifiedParentAnalyticsStudentIds(await queryLinks());
    assert.deepEqual(linkedIds, ["student-1", "student-2"]);
    assert.deepEqual(resolveParentAnalyticsStudentId(null, linkedIds), {
      ok: false, reason: "student-id-required",
    });
    assert.deepEqual(resolveParentAnalyticsStudentId("student-2", linkedIds), {
      ok: true, studentId: "student-2",
    });
    assert.deepEqual(resolveParentAnalyticsStudentId("student-3", linkedIds), {
      ok: false, reason: "forbidden",
    });

    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "parent-1"));
    assert.deepEqual(await queryLinks(), [], "a stale parent session must not authorize attendance after the live role changes");
  });
});

integrationTest("student attendance query returns only the requesting student's records", async () => {
  await withFixture(async ({ db }) => {
    const ownRecords = await db
      .select({ id: attendanceRecords.id, studentId: attendanceRecords.studentId })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, "student-1"));
    assert.deepEqual(ownRecords, [
      { id: "att-1", studentId: "student-1" },
      { id: "att-5", studentId: "student-1" },
    ]);
    assert.equal(ownRecords.some((row) => row.studentId !== "student-1"), false);
  });
});
