import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, exists, isNull, ne, or } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
});

const homework = pgTable("homework", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  courseId: text("course_id"),
});

const homeworkSubmissions = pgTable("homework_submissions", {
  id: text("id").primaryKey(),
  homeworkId: text("homework_id").notNull(),
  studentId: text("student_id").notNull(),
  status: text("status"),
});

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

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
      CREATE TEMP TABLE homework (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        course_id TEXT
      );
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY,
        homework_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT
      );

      INSERT INTO courses (id, teacher_id) VALUES
        ('course-1', 'teacher-1'),
        ('course-2', 'teacher-2');
      INSERT INTO homework (id, teacher_id, course_id) VALUES
        ('homework-1', 'teacher-1', 'course-1'),
        ('homework-grade-only', 'teacher-1', NULL),
        ('homework-transfer', 'teacher-1', 'course-1'),
        ('homework-admin', 'teacher-2', 'course-2');
      INSERT INTO homework_submissions (id, homework_id, student_id, status) VALUES
        ('submission-1', 'homework-1', 'student-1', 'submitted'),
        ('submission-grade-only', 'homework-grade-only', 'student-2', 'submitted'),
        ('submission-transfer', 'homework-transfer', 'student-3', 'submitted'),
        ('submission-admin', 'homework-admin', 'student-4', 'submitted');
    `);
    await run(drizzle(client));
  } finally {
    await client.end();
  }
}

integrationTest("PostgreSQL grading update rechecks current ownership and prevents duplicate grading", async () => {
  await withFixture(async (db) => {
    const gradeSubmission = async (submissionId, { role, requesterId }) => {
      const predicates = [
        eq(homeworkSubmissions.id, submissionId),
        or(isNull(homeworkSubmissions.status), ne(homeworkSubmissions.status, "graded")),
      ];

      if (role === "teacher") {
        predicates.push(exists(
          db
            .select({ id: homework.id })
            .from(homework)
            .leftJoin(courses, eq(homework.courseId, courses.id))
            .where(and(
              eq(homework.id, homeworkSubmissions.homeworkId),
              eq(homework.teacherId, requesterId),
              or(isNull(homework.courseId), eq(courses.teacherId, requesterId)),
            )),
        ));
      }

      return db
        .update(homeworkSubmissions)
        .set({ status: "graded" })
        .where(and(...predicates))
        .returning({ studentId: homeworkSubmissions.studentId });
    };

    const firstGrade = await gradeSubmission("submission-1", { role: "teacher", requesterId: "teacher-1" });
    assert.deepEqual(firstGrade, [{ studentId: "student-1" }]);

    const duplicateGrade = await gradeSubmission("submission-1", { role: "teacher", requesterId: "teacher-1" });
    assert.deepEqual(duplicateGrade, [], "a second grade must not award points a second time");

    const gradeOnly = await gradeSubmission("submission-grade-only", { role: "teacher", requesterId: "teacher-1" });
    assert.deepEqual(gradeOnly, [{ studentId: "student-2" }], "grade-only homework remains supported");

    // Simulate a transfer after the route's preflight lookup but before its final UPDATE.
    // The final UPDATE must evaluate the current course owner, not the earlier result.
    await db.update(courses).set({ teacherId: "teacher-2" }).where(eq(courses.id, "course-1"));
    await db.update(homework).set({ teacherId: "teacher-2" }).where(eq(homework.id, "homework-transfer"));

    const formerOwner = await gradeSubmission("submission-transfer", { role: "teacher", requesterId: "teacher-1" });
    assert.deepEqual(formerOwner, [], "the former owner must not grade after course ownership changes");

    const currentOwner = await gradeSubmission("submission-transfer", { role: "teacher", requesterId: "teacher-2" });
    assert.deepEqual(currentOwner, [{ studentId: "student-3" }], "the current owner may grade the submission");

    const adminGrade = await gradeSubmission("submission-admin", { role: "admin", requesterId: "admin-1" });
    assert.deepEqual(adminGrade, [{ studentId: "student-4" }], "admins retain their existing cross-course grading access");
  });
});
