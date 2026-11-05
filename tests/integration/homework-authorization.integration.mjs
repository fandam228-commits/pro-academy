import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, exists, inArray, isNull, or } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { canAssignHomeworkToCourse, canAccessHomeworkCourse, canManageHomework } from "../../src/lib/homework-authorization.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;

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

const homework = pgTable("homework", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  courseId: text("course_id"),
});

const homeworkSubmissions = pgTable("homework_submissions", {
  id: text("id").primaryKey(),
  homeworkId: text("homework_id").notNull(),
  status: text("status"),
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
      CREATE TEMP TABLE enrollments (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        status TEXT
      );
      CREATE TEMP TABLE homework (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        course_id TEXT
      );
      INSERT INTO courses (id, teacher_id) VALUES
        ('course-owned', 'teacher-1'),
        ('course-completed', 'teacher-1'),
        ('course-cancelled', 'teacher-1'),
        ('course-other', 'teacher-2');
      INSERT INTO enrollments (id, student_id, course_id, status) VALUES
        ('enroll-active', 'student-1', 'course-owned', 'active'),
        ('enroll-completed', 'student-1', 'course-completed', 'completed'),
        ('enroll-cancelled', 'student-1', 'course-cancelled', 'cancelled'),
        ('enroll-other-student', 'student-2', 'course-owned', 'active');
      CREATE TEMP TABLE homework_submissions (
        id TEXT PRIMARY KEY,
        homework_id TEXT NOT NULL,
        status TEXT
      );
      INSERT INTO homework (id, teacher_id, course_id) VALUES
        ('homework-owned', 'teacher-1', 'course-owned'),
        ('homework-reassigned', 'teacher-1', 'course-other'),
        ('homework-orphaned', 'teacher-1', 'course-missing'),
        ('homework-grade-only', 'teacher-1', NULL);
      INSERT INTO homework_submissions (id, homework_id, status)
      VALUES ('submission-owned', 'homework-owned', 'submitted');
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


integrationTest("PostgreSQL current course ownership revokes stale teacher access to homework", async () => {
  await withFixture(async (db) => {
    const rows = await db
      .select({
        id: homework.id,
        teacherId: homework.teacherId,
        courseId: homework.courseId,
        courseTeacherId: courses.teacherId,
      })
      .from(homework)
      .leftJoin(courses, eq(homework.courseId, courses.id));

    const decisions = new Map(rows.map((row) => [
      row.id,
      canManageHomework({
        role: "teacher",
        requesterId: "teacher-1",
        homeworkTeacherId: row.teacherId,
        homeworkCourseId: row.courseId,
        courseTeacherId: row.courseTeacherId,
      }),
    ]));

    assert.equal(decisions.get("homework-owned"), true);
    assert.equal(decisions.get("homework-reassigned"), false,
      "the former teacher must lose access when the course owner changes");
    assert.equal(decisions.get("homework-orphaned"), false,
      "a missing linked course must fail closed");
    assert.equal(decisions.get("homework-grade-only"), true,
      "legacy grade-only homework remains scoped to its recorded teacher");

    const visibleRows = await db
      .select({ id: homework.id })
      .from(homework)
      .leftJoin(courses, eq(homework.courseId, courses.id))
      .where(and(
        eq(homework.teacherId, "teacher-1"),
        or(isNull(homework.courseId), eq(courses.teacherId, "teacher-1")),
      ));
    assert.deepEqual(
      visibleRows.map((row) => row.id).sort(),
      ["homework-grade-only", "homework-owned"],
      "teacher homework listings must exclude reassigned and orphaned course records",
    );
  });
});

integrationTest("PostgreSQL mutation predicates deny stale teacher grading and deletion after course ownership transfer", async () => {
  await withFixture(async (db) => {
    // The teacher passed the earlier ownership preflight, but the course is
    // reassigned before the final mutation statement executes.
    await db.update(courses).set({ teacherId: "teacher-2" }).where(eq(courses.id, "course-owned"));

    const graded = await db
      .update(homeworkSubmissions)
      .set({ status: "graded" })
      .where(and(
        eq(homeworkSubmissions.id, "submission-owned"),
        exists(db
          .select({ id: homework.id })
          .from(homework)
          .leftJoin(courses, eq(homework.courseId, courses.id))
          .where(and(
            eq(homework.id, homeworkSubmissions.homeworkId),
            eq(homework.teacherId, "teacher-1"),
            or(isNull(homework.courseId), eq(courses.teacherId, "teacher-1")),
          ))),
      ))
      .returning({ id: homeworkSubmissions.id });
    assert.deepEqual(graded, [], "the former course owner must not grade after ownership transfer");

    const deleted = await db
      .delete(homework)
      .where(and(
        eq(homework.id, "homework-owned"),
        eq(homework.teacherId, "teacher-1"),
        or(
          isNull(homework.courseId),
          exists(db
            .select({ id: courses.id })
            .from(courses)
            .where(and(
              eq(courses.id, homework.courseId),
              eq(courses.teacherId, "teacher-1"),
            ))),
        ),
      ))
      .returning({ id: homework.id });
    assert.deepEqual(deleted, [], "the former course owner must not delete after ownership transfer");

    const submissionRows = await db
      .select({ status: homeworkSubmissions.status })
      .from(homeworkSubmissions)
      .where(eq(homeworkSubmissions.id, "submission-owned"));
    assert.equal(submissionRows[0]?.status, "submitted", "the denied grading attempt must leave the submission unchanged");

    const homeworkRows = await db
      .select({ id: homework.id })
      .from(homework)
      .where(eq(homework.id, "homework-owned"));
    assert.equal(homeworkRows.length, 1, "the denied delete attempt must leave the homework unchanged");
  });
});

integrationTest("PostgreSQL enrollment scope blocks same-grade students from another course's homework", async () => {
  await withFixture(async (db) => {
    const rows = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(
        eq(enrollments.studentId, "student-1"),
        inArray(enrollments.status, ["active", "completed"]),
      ));
    const enrolledCourseIds = [...new Set(rows.map((row) => row.courseId))].sort();
    assert.deepEqual(enrolledCourseIds, ["course-completed", "course-owned"]);

    assert.equal(canAccessHomeworkCourse({
      role: "student", homeworkCourseId: "course-owned", enrolledCourseIds,
    }), true);
    assert.equal(canAccessHomeworkCourse({
      role: "student", homeworkCourseId: "course-completed", enrolledCourseIds,
    }), true);
    assert.equal(canAccessHomeworkCourse({
      role: "student", homeworkCourseId: "course-cancelled", enrolledCourseIds,
    }), false);
    assert.equal(canAccessHomeworkCourse({
      role: "student", homeworkCourseId: "course-other", enrolledCourseIds,
    }), false);
    assert.equal(canAccessHomeworkCourse({
      role: "student", homeworkCourseId: null, enrolledCourseIds,
    }), true);
  });
});


integrationTest("PostgreSQL teacher homework detail and list reads scope submission rows to the current course owner in one query", async () => {
  await withFixture(async (db) => {
    const readTeacherDetail = async (homeworkId) => db
      .select({
        homeworkId: homework.id,
        submissionId: homeworkSubmissions.id,
        submissionStatus: homeworkSubmissions.status,
      })
      .from(homework)
      .leftJoin(courses, eq(homework.courseId, courses.id))
      .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.homeworkId, homework.id))
      .where(and(
        eq(homework.id, homeworkId),
        eq(homework.teacherId, "teacher-1"),
        or(isNull(homework.courseId), eq(courses.teacherId, "teacher-1")),
      ));

    const readTeacherList = async () => db
      .select({
        homeworkId: homework.id,
        submissionId: homeworkSubmissions.id,
        submissionStatus: homeworkSubmissions.status,
      })
      .from(homework)
      .leftJoin(courses, eq(homework.courseId, courses.id))
      .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.homeworkId, homework.id))
      .where(and(
        eq(homework.teacherId, "teacher-1"),
        or(isNull(homework.courseId), eq(courses.teacherId, "teacher-1")),
      ));

    const initialDetail = await readTeacherDetail("homework-owned");
    assert.deepEqual(initialDetail.map((row) => row.submissionId), ["submission-owned"]);

    const initialList = await readTeacherList();
    assert.ok(initialList.some((row) => row.homeworkId === "homework-owned" && row.submissionId === "submission-owned"));

    // Ownership changes after an earlier request/preflight. The next single-statement
    // detail and list reads must not return either the assignment or its submissions.
    await db.update(courses).set({ teacherId: "teacher-2" }).where(eq(courses.id, "course-owned"));

    assert.deepEqual(
      await readTeacherDetail("homework-owned"),
      [],
      "detail read must deny the former owner and must not return submission rows",
    );
    const afterTransferList = await readTeacherList();
    assert.equal(
      afterTransferList.some((row) => row.homeworkId === "homework-owned"),
      false,
      "list read must exclude the reassigned assignment and its submission counts",
    );
    assert.ok(
      afterTransferList.some((row) => row.homeworkId === "homework-grade-only"),
      "grade-only homework remains scoped to its recorded teacher",
    );
  });
});
