import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, inArray } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
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
const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  courseId: text("course_id"),
});
const quizSubmissions = pgTable("quiz_submissions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull(),
  studentId: text("student_id").notNull(),
  percentage: integer("percentage").notNull(),
  submittedAt: timestamp("submitted_at").notNull(),
});
const homework = pgTable("homework", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  courseId: text("course_id"),
  grade: text("grade"),
  totalPoints: integer("total_points"),
});
const homeworkSubmissions = pgTable("homework_submissions", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  homeworkId: text("homework_id").notNull(),
  score: integer("score"),
  status: text("status"),
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
      CREATE TEMP TABLE quizzes (
        id TEXT PRIMARY KEY,
        course_id TEXT
      );
      CREATE TEMP TABLE quiz_submissions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        percentage INTEGER NOT NULL,
        submitted_at TIMESTAMP NOT NULL
      );
      CREATE TEMP TABLE homework (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        course_id TEXT,
        grade TEXT,
        total_points INTEGER
      );
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        homework_id TEXT NOT NULL,
        score INTEGER,
        status TEXT
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

      INSERT INTO quizzes (id, course_id) VALUES
        ('quiz-a', 'course-a'),
        ('quiz-b', 'course-b'),
        ('quiz-other', 'course-other'),
        ('quiz-unscoped', NULL);
      INSERT INTO quiz_submissions (id, quiz_id, student_id, percentage, submitted_at) VALUES
        ('quiz-sub-a', 'quiz-a', 'student-1', 91, '2026-10-01 10:00:00'),
        ('quiz-sub-b', 'quiz-b', 'student-1', 82, '2026-10-02 10:00:00'),
        ('quiz-sub-other', 'quiz-other', 'student-1', 75, '2026-10-03 10:00:00'),
        ('quiz-sub-unscoped', 'quiz-unscoped', 'student-1', 64, '2026-10-04 10:00:00');
      INSERT INTO homework (id, teacher_id, course_id, grade, total_points) VALUES
        ('hw-a', 'teacher-1', 'course-a', 'Third Secondary', 100),
        ('hw-b', 'teacher-1', 'course-b', 'Third Secondary', 100),
        ('hw-other', 'teacher-2', 'course-other', 'Third Secondary', 100),
        ('hw-unscoped', 'teacher-1', NULL, 'Third Secondary', 100);
      INSERT INTO homework_submissions (id, student_id, homework_id, score, status) VALUES
        ('hw-sub-a', 'student-1', 'hw-a', 90, 'graded'),
        ('hw-sub-b', 'student-1', 'hw-b', 80, 'graded'),
        ('hw-sub-other', 'student-1', 'hw-other', 70, 'graded'),
        ('hw-sub-unscoped', 'student-1', 'hw-unscoped', 60, 'graded');
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

integrationTest("teacher analytics database reads stay within owned enrolled courses", async () => {
  await withFixture(async ({ db }) => {
    const enrollmentRows = await db
      .select({
        studentId: enrollments.studentId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        teacherId: courses.teacherId,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(courses.teacherId, "teacher-1"));
    const allowedCourseIds = getTeacherAnalyticsCourseIds(enrollmentRows, "teacher-1", "student-1");
    assert.deepEqual(allowedCourseIds, ["course-a"]);

    const quizRows = await db
      .select({ id: quizSubmissions.id, percentage: quizSubmissions.percentage })
      .from(quizSubmissions)
      .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
      .where(and(
        eq(quizSubmissions.studentId, "student-1"),
        inArray(quizzes.courseId, allowedCourseIds),
      ));
    assert.deepEqual(quizRows.map((row) => row.id), ["quiz-sub-a"]);

    const allowedHomework = await db
      .select({ id: homework.id })
      .from(homework)
      .where(and(
        eq(homework.teacherId, "teacher-1"),
        inArray(homework.courseId, allowedCourseIds),
      ));
    const allowedHomeworkIds = allowedHomework.map((row) => row.id);
    const homeworkRows = allowedHomeworkIds.length
      ? await db
          .select({ id: homeworkSubmissions.id, homeworkId: homeworkSubmissions.homeworkId })
          .from(homeworkSubmissions)
          .where(and(
            eq(homeworkSubmissions.studentId, "student-1"),
            inArray(homeworkSubmissions.homeworkId, allowedHomeworkIds),
          ))
      : [];

    assert.deepEqual(allowedHomeworkIds, ["hw-a"]);
    assert.deepEqual(homeworkRows.map((row) => row.id), ["hw-sub-a"]);
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
