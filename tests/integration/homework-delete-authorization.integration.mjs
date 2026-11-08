import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { lockHomeworkDeletionAuthorization } from "../../src/lib/homework-delete-authorization.mjs";

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

integrationTest("PostgreSQL homework deletion revalidates live role and ownership and holds row locks through delete", async () => {
  assertLocalTestDatabase(connectionString);
  const suffix = randomUUID().replaceAll("-", "");
  const usersName = `hwd_users_${suffix}`;
  const coursesName = `hwd_courses_${suffix}`;
  const homeworkName = `hwd_homework_${suffix}`;

  const users = pgTable(usersName, {
    id: text("id").primaryKey(),
    role: text("role").notNull(),
  });
  const courses = pgTable(coursesName, {
    id: text("id").primaryKey(),
    teacherId: text("teacher_id").notNull(),
  });
  const homework = pgTable(homeworkName, {
    id: text("id").primaryKey(),
    teacherId: text("teacher_id").notNull(),
    courseId: text("course_id"),
  });

  const setup = new Client({ connectionString });
  const actor = new Client({ connectionString });
  const concurrent = new Client({ connectionString });
  let setupConnected = false;
  let actorConnected = false;
  let concurrentConnected = false;
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
    await concurrent.connect();
    concurrentConnected = true;

    await setup.query(`
      CREATE TABLE "${usersName}" (id TEXT PRIMARY KEY, role TEXT NOT NULL);
      CREATE TABLE "${coursesName}" (id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL);
      CREATE TABLE "${homeworkName}" (id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, course_id TEXT);
      INSERT INTO "${usersName}" VALUES
        ('teacher-1', 'teacher'), ('teacher-2', 'teacher'),
        ('admin-1', 'admin'), ('demoted-1', 'student');
      INSERT INTO "${coursesName}" VALUES
        ('course-1', 'teacher-1'), ('course-2', 'teacher-2');
      INSERT INTO "${homeworkName}" VALUES
        ('owned', 'teacher-1', 'course-1'),
        ('mismatch', 'teacher-1', 'course-2'),
        ('grade-only', 'teacher-1', NULL),
        ('transfer', 'teacher-1', 'course-1'),
        ('admin-target', 'teacher-2', 'course-2'),
        ('role-target', 'demoted-1', NULL),
        ('concurrent-target', 'teacher-1', 'course-1');
    `);

    const actorDb = drizzle(actor);
    const concurrentDb = drizzle(concurrent);
    const tables = { users, homework, courses };

    async function deleteAs(db, homeworkId, requesterId, sessionRole) {
      return db.transaction(async (tx) => {
        const access = await lockHomeworkDeletionAuthorization(
          tx,
          { homeworkId, requesterId, sessionRole },
          tables,
        );
        if (!access.allowed) return access;
        const rows = await tx.delete(homework)
          .where(eq(homework.id, access.homeworkId))
          .returning({ id: homework.id });
        return rows.length === 1
          ? { allowed: true, homeworkId: rows[0].id }
          : { allowed: false, reason: "homework-not-found" };
      });
    }

    assert.deepEqual(await deleteAs(actorDb, "owned", "teacher-1", "teacher"), {
      allowed: true, homeworkId: "owned",
    });
    assert.deepEqual(await deleteAs(actorDb, "mismatch", "teacher-1", "teacher"), {
      allowed: false, reason: "forbidden",
    });
    const mismatchStillExists = await setup.query(`SELECT id FROM "${homeworkName}" WHERE id = 'mismatch'`);
    assert.equal(mismatchStillExists.rowCount, 1, "a teacher must not delete homework linked to another teacher's course");

    await setup.query(`UPDATE "${coursesName}" SET teacher_id = 'teacher-2' WHERE id = 'course-1'`);
    assert.deepEqual(await deleteAs(actorDb, "transfer", "teacher-1", "teacher"), {
      allowed: false, reason: "forbidden",
    });
    await setup.query(`UPDATE "${homeworkName}" SET teacher_id = 'teacher-2' WHERE id = 'transfer'`);
    assert.deepEqual(await deleteAs(actorDb, "transfer", "teacher-2", "teacher"), {
      allowed: true, homeworkId: "transfer",
    });

    assert.deepEqual(await deleteAs(actorDb, "grade-only", "teacher-1", "teacher"), {
      allowed: true, homeworkId: "grade-only",
    });
    assert.deepEqual(await deleteAs(actorDb, "admin-target", "admin-1", "admin"), {
      allowed: true, homeworkId: "admin-target",
    });
    assert.deepEqual(await deleteAs(actorDb, "role-target", "demoted-1", "teacher"), {
      allowed: false, reason: "role-changed",
    });

    // Restore a current owner and prove a concurrent course transfer waits
    // while the authorized deletion transaction holds the course row FOR SHARE.
    await setup.query(`UPDATE "${coursesName}" SET teacher_id = 'teacher-1' WHERE id = 'course-1'`);
    let transferFinished = false;
    transactionPromise = actorDb.transaction(async (tx) => {
      const access = await lockHomeworkDeletionAuthorization(
        tx,
        { homeworkId: "concurrent-target", requesterId: "teacher-1", sessionRole: "teacher" },
        tables,
      );
      assert.equal(access.allowed, true);
      if (!access.allowed) throw new Error("Expected current owner to be allowed");
      signalLocked();
      await transactionGate;
      const rows = await tx.delete(homework)
        .where(eq(homework.id, access.homeworkId))
        .returning({ id: homework.id });
      return rows.length;
    });

    await lockedSignal;
    const transferPromise = concurrentDb
      .update(courses)
      .set({ teacherId: "teacher-2" })
      .where(eq(courses.id, "course-1"))
      .then(() => { transferFinished = true; });
    await delay(100);
    assert.equal(transferFinished, false,
      "a concurrent course transfer must wait while the authorization row lock is held");
    releaseTransaction();
    assert.equal(await transactionPromise, 1);
    await transferPromise;
    assert.equal(transferFinished, true);
  } finally {
    releaseTransaction();
    if (transactionPromise) await transactionPromise.catch(() => {});
    if (actorConnected) await actor.end();
    if (concurrentConnected) await concurrent.end();
    if (setupConnected) {
      await setup.query(`DROP TABLE IF EXISTS "${homeworkName}", "${coursesName}", "${usersName}"`).catch(() => {});
      await setup.end();
    }
  }
});
