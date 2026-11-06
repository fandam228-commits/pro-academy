import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { withHomeworkSubmissionLock } from "../../src/lib/homework-submission-lock.mjs";
import { lockCurrentHomeworkSubmissionAccess } from "../../src/lib/homework-submission-authorization.mjs";

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

integrationTest("submission persistence locks current student role, grade, assignment, and enrollment state", async () => {
  assertLocalTestDatabase(connectionString);
  const suffix = randomUUID().replaceAll("-", "");
  const usersName = `hws_access_users_${suffix}`;
  const homeworkName = `hws_access_homework_${suffix}`;
  const enrollmentsName = `hws_access_enrollments_${suffix}`;
  const submissionsName = `hws_access_submissions_${suffix}`;

  const users = pgTable(usersName, {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    grade: text("grade"),
  });
  const homework = pgTable(homeworkName, {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    grade: text("grade"),
    courseId: text("course_id"),
    teacherId: text("teacher_id").notNull(),
  });
  const enrollments = pgTable(enrollmentsName, {
    id: text("id").primaryKey(),
    studentId: text("student_id").notNull(),
    courseId: text("course_id").notNull(),
    status: text("status"),
  });
  const submissions = pgTable(submissionsName, {
    id: text("id").primaryKey(),
    homeworkId: text("homework_id").notNull(),
    studentId: text("student_id").notNull(),
    studentName: text("student_name").notNull(),
  });

  const setup = new Client({ connectionString });
  const submitter = new Client({ connectionString });
  const revoker = new Client({ connectionString });
  let setupConnected = false;
  let submitterConnected = false;
  let revokerConnected = false;
  let transactionPromise;
  let releaseTransaction;
  let signalLocked;
  const lockedSignal = new Promise((resolve) => { signalLocked = resolve; });
  const transactionGate = new Promise((resolve) => { releaseTransaction = resolve; });

  try {
    await setup.connect();
    setupConnected = true;
    await submitter.connect();
    submitterConnected = true;
    await revoker.connect();
    revokerConnected = true;

    await setup.query(`
      CREATE TABLE "${usersName}" (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, grade TEXT
      );
      CREATE TABLE "${homeworkName}" (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, grade TEXT, course_id TEXT, teacher_id TEXT NOT NULL
      );
      CREATE TABLE "${enrollmentsName}" (
        id TEXT PRIMARY KEY, student_id TEXT NOT NULL, course_id TEXT NOT NULL, status TEXT
      );
      CREATE TABLE "${submissionsName}" (
        id TEXT PRIMARY KEY, homework_id TEXT NOT NULL, student_id TEXT NOT NULL, student_name TEXT NOT NULL
      );
      INSERT INTO "${usersName}" (id, name, role, grade)
        VALUES ('student-1', 'Current Student Name', 'student', 'Third Secondary');
      INSERT INTO "${homeworkName}" (id, title, grade, course_id, teacher_id)
        VALUES
          ('course-homework', 'Course Homework', 'Third Secondary', 'course-1', 'teacher-1'),
          ('grade-only-homework', 'Grade-only Homework', 'Third Secondary', NULL, 'teacher-1');
      INSERT INTO "${enrollmentsName}" (id, student_id, course_id, status)
        VALUES ('enrollment-1', 'student-1', 'course-1', 'active');
    `);

    const submitterDb = drizzle(submitter);
    const revokerDb = drizzle(revoker);
    const tables = { users, homework, enrollments };

    transactionPromise = submitterDb.transaction(async (tx) =>
      withHomeworkSubmissionLock(
        tx,
        { homeworkId: "course-homework", studentId: "student-1" },
        async (lockedTx) => {
          const access = await lockCurrentHomeworkSubmissionAccess(
            lockedTx,
            { homeworkId: "course-homework", studentId: "student-1" },
            tables,
          );
          signalLocked();
          assert.equal(access.allowed, true);
          if (!access.allowed) throw new Error("Expected current enrollment to authorize the submission");
          await lockedTx.insert(submissions).values({
            id: randomUUID(),
            homeworkId: "course-homework",
            studentId: access.student.id,
            studentName: access.student.name,
          });
          // Keep the authorization locks until after a competing revocation starts.
          await transactionGate;
          return access;
        },
      ),
    );

    await lockedSignal;
    let revocationFinished = false;
    const revocationPromise = revokerDb
      .update(enrollments)
      .set({ status: "cancelled" })
      .where(eq(enrollments.id, "enrollment-1"))
      .then(() => { revocationFinished = true; });

    await delay(100);
    const revocationWasBlocked = !revocationFinished;
    releaseTransaction();
    const committedAccess = await transactionPromise;
    await revocationPromise;

    assert.equal(committedAccess.allowed, true);
    assert.equal(revocationWasBlocked, true, "an enrollment revocation must wait for the in-flight authorized submission transaction");

    const stored = await setup.query(
      `SELECT student_name FROM "${submissionsName}" WHERE homework_id = 'course-homework' AND student_id = 'student-1'`,
    );
    assert.equal(stored.rowCount, 1);
    assert.equal(stored.rows[0].student_name, "Current Student Name");

    const afterRevocation = await revokerDb.transaction((tx) =>
      lockCurrentHomeworkSubmissionAccess(
        tx,
        { homeworkId: "course-homework", studentId: "student-1" },
        tables,
      ),
    );
    assert.deepEqual(afterRevocation, { allowed: false, reason: "not-enrolled" });

    await setup.query(`UPDATE "${usersName}" SET role = 'teacher' WHERE id = 'student-1'`);
    const changedRole = await revokerDb.transaction((tx) =>
      lockCurrentHomeworkSubmissionAccess(tx, { homeworkId: "course-homework", studentId: "student-1" }, tables),
    );
    assert.deepEqual(changedRole, { allowed: false, reason: "student-not-authorized" });

    await setup.query(`UPDATE "${usersName}" SET role = 'student', grade = 'Second Secondary' WHERE id = 'student-1'`);
    const changedGrade = await revokerDb.transaction((tx) =>
      lockCurrentHomeworkSubmissionAccess(tx, { homeworkId: "course-homework", studentId: "student-1" }, tables),
    );
    assert.deepEqual(changedGrade, { allowed: false, reason: "grade-mismatch" });

    const gradeOnly = await revokerDb.transaction((tx) =>
      lockCurrentHomeworkSubmissionAccess(tx, { homeworkId: "grade-only-homework", studentId: "student-1" }, tables),
    );
    assert.equal(gradeOnly.allowed, true, "grade-only assignments remain supported when the current grade matches");
  } finally {
    releaseTransaction?.();
    if (transactionPromise) await transactionPromise.catch(() => {});
    if (submitterConnected) await submitter.end();
    if (revokerConnected) await revoker.end();
    if (setupConnected) {
      await setup.query(`DROP TABLE IF EXISTS "${submissionsName}", "${enrollmentsName}", "${homeworkName}", "${usersName}"`).catch(() => {});
      await setup.end();
    }
  }
});
