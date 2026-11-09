import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text } from "drizzle-orm/pg-core";
import { lockHomeworkSubmissionAuthorization } from "../../src/lib/homework-submission-authorization.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
const integrationTest = connectionString ? test : test.skip;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function assertLocalTestDatabase(value) {
  if (!value) throw new Error("TEST_DATABASE_URL is required for this integration test");
  const parsed = new URL(value);
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname)) {
    throw new Error("TEST_DATABASE_URL must point to localhost/127.0.0.1/::1 only");
  }
}

integrationTest("homework submission authorization uses current role, grade, and active/completed course enrollment", async () => {
  assertLocalTestDatabase(connectionString);
  const suffix = randomUUID().replaceAll("-", "");
  const usersName = `hwsu_users_${suffix}`;
  const coursesName = `hwsu_courses_${suffix}`;
  const homeworkName = `hwsu_homework_${suffix}`;
  const enrollmentsName = `hwsu_enrollments_${suffix}`;

  const users = pgTable(usersName, {
    id: text("id").primaryKey(),
    role: text("role").notNull(),
    grade: text("grade"),
  });
  const courses = pgTable(coursesName, { id: text("id").primaryKey() });
  const homework = pgTable(homeworkName, {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    teacherId: text("teacher_id").notNull(),
    grade: text("grade"),
    courseId: text("course_id"),
  });
  const enrollments = pgTable(enrollmentsName, {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    courseId: text("course_id").notNull(),
    status: text("status"),
  });

  const setup = new Client({ connectionString });
  const actor = new Client({ connectionString });
  const roleChanger = new Client({ connectionString });
  const enrollmentChanger = new Client({ connectionString });
  let setupConnected = false;
  let actorConnected = false;
  let roleChangerConnected = false;
  let enrollmentChangerConnected = false;
  let releaseTransaction;
  let signalLocked;
  let transactionPromise;
  const transactionGate = new Promise((resolve) => { releaseTransaction = resolve; });
  const lockedSignal = new Promise((resolve) => { signalLocked = resolve; });

  try {
    await setup.connect();
    setupConnected = true;
    await actor.connect();
    actorConnected = true;
    await roleChanger.connect();
    roleChangerConnected = true;
    await enrollmentChanger.connect();
    enrollmentChangerConnected = true;

    await setup.query(`
      CREATE TABLE "${usersName}" (id TEXT PRIMARY KEY, role TEXT NOT NULL, grade TEXT);
      CREATE TABLE "${coursesName}" (id TEXT PRIMARY KEY);
      CREATE TABLE "${homeworkName}" (id TEXT PRIMARY KEY, title TEXT NOT NULL, teacher_id TEXT NOT NULL, grade TEXT, course_id TEXT);
      CREATE TABLE "${enrollmentsName}" (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, course_id TEXT NOT NULL, status TEXT);
      INSERT INTO "${usersName}" (id, role, grade) VALUES
        ('student-active', 'student', 'Third Secondary'),
        ('student-completed', 'student', 'Third Secondary'),
        ('student-cancelled', 'student', 'Third Secondary'),
        ('student-wrong-grade', 'student', 'First Secondary'),
        ('student-demoted', 'parent', 'Third Secondary');
      INSERT INTO "${coursesName}" (id) VALUES ('course-1');
      INSERT INTO "${homeworkName}" (id, title, teacher_id, grade, course_id) VALUES
        ('hw-course', 'Course homework', 'teacher-1', 'Third Secondary', 'course-1'),
        ('hw-grade-only', 'Grade-only homework', 'teacher-1', 'Third Secondary', NULL),
        ('hw-missing-course', 'Missing course homework', 'teacher-1', 'Third Secondary', 'course-missing');
      INSERT INTO "${enrollmentsName}" (id, student_id, course_id, status) VALUES
        ('enroll-active', 'student-active', 'course-1', 'active'),
        ('enroll-completed', 'student-completed', 'course-1', 'completed'),
        ('enroll-cancelled', 'student-cancelled', 'course-1', 'cancelled');
    `);

    const actorDb = drizzle(actor);
    const tables = { users, homework, courses, enrollments };
    const authorize = (studentId, homeworkId, sessionRole = "student") =>
      actorDb.transaction((tx) =>
        lockHomeworkSubmissionAuthorization(tx, { homeworkId, studentId, sessionRole }, tables),
      );

    assert.equal((await authorize("student-active", "hw-course")).allowed, true);
    assert.equal((await authorize("student-completed", "hw-course")).allowed, true);
    assert.equal((await authorize("student-active", "hw-grade-only")).allowed, true);
    assert.deepEqual(await authorize("student-cancelled", "hw-course"), {
      allowed: false, reason: "not-enrolled",
    });
    assert.deepEqual(await authorize("student-wrong-grade", "hw-course"), {
      allowed: false, reason: "grade-mismatch",
    });
    assert.deepEqual(await authorize("student-demoted", "hw-course"), {
      allowed: false, reason: "role-changed",
    });
    assert.deepEqual(await authorize("student-active", "hw-missing-course"), {
      allowed: false, reason: "course-not-found",
    });
    assert.deepEqual(await authorize("student-active", "hw-course", "teacher"), {
      allowed: false, reason: "unsupported-role",
    });

    // Hold the same shared locks the route uses through its write transaction.
    // Concurrent role demotion and enrollment revocation must wait until commit.
    transactionPromise = actorDb.transaction(async (tx) => {
      try {
        const access = await lockHomeworkSubmissionAuthorization(
          tx,
          { homeworkId: "hw-course", studentId: "student-active", sessionRole: "student" },
          tables,
        );
        signalLocked();
        assert.equal(access.allowed, true);
        await transactionGate;
        return access;
      } catch (error) {
        signalLocked();
        throw error;
      }
    });

    await lockedSignal;
    let roleUpdateFinished = false;
    let enrollmentUpdateFinished = false;
    const roleUpdate = roleChanger
      .query(`UPDATE "${usersName}" SET role = 'parent' WHERE id = 'student-active'`)
      .then(() => { roleUpdateFinished = true; });
    const enrollmentUpdate = enrollmentChanger
      .query(`UPDATE "${enrollmentsName}" SET status = 'cancelled' WHERE id = 'enroll-active'`)
      .then(() => { enrollmentUpdateFinished = true; });

    await delay(100);
    assert.equal(roleUpdateFinished, false, "role demotion must wait while the authorized write holds the user row lock");
    assert.equal(enrollmentUpdateFinished, false, "enrollment revocation must wait while the authorized write holds the enrollment row lock");

    releaseTransaction();
    await transactionPromise;
    await Promise.all([roleUpdate, enrollmentUpdate]);
    assert.equal(roleUpdateFinished, true);
    assert.equal(enrollmentUpdateFinished, true);
  } finally {
    releaseTransaction();
    if (transactionPromise) await transactionPromise.catch(() => {});
    if (roleChangerConnected) await roleChanger.end();
    if (enrollmentChangerConnected) await enrollmentChanger.end();
    if (actorConnected) await actor.end();
    if (setupConnected) {
      await setup.query(
        `DROP TABLE IF EXISTS "${enrollmentsName}", "${homeworkName}", "${coursesName}", "${usersName}"`,
      ).catch(() => {});
      await setup.end();
    }
  }
});
