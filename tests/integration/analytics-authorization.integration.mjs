import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, exists, inArray, isNotNull } from "drizzle-orm";
import { alias, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { canAccessStudentAnalytics } from "../../src/lib/analytics-authorization.mjs";
import {
  getTeacherAnalyticsStudentIds,
  getTeacherAnalyticsCourseIds,
  isHomeworkGradeVisibleToStudent,
  getVerifiedParentAnalyticsStudentIds,
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

// Pure authorization-policy regression tests run even when PostgreSQL integration tests are skipped locally.
test("Analytics authorization denies cross-student, unlinked-parent, and unscoped-teacher access", () => {
  assert.equal(
    canAccessStudentAnalytics({ role: "student", requesterId: "student-1", studentId: "student-1" }),
    true,
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "student", requesterId: "student-1", studentId: "student-2" }),
    false,
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "parent", requesterId: "parent-1", studentId: "student-1", linkedParentStudentIds: [] }),
    false,
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "teacher", requesterId: "teacher-1", studentId: "student-1", teacherStudentIds: [] }),
    false,
  );
  assert.equal(
    canAccessStudentAnalytics({ role: "support", requesterId: "support-1", studentId: "student-1" }),
    false,
  );
});

test("Parent analytics selection fails closed for missing, malformed, and ambiguous links", () => {
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, []),
    { ok: false, reason: "no-linked-student" },
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1"]),
    { ok: true, studentId: "student-1" },
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1", "student-2"]),
    { ok: false, reason: "student-id-required" },
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId("student-2", ["student-1", "student-2"]),
    { ok: true, studentId: "student-2" },
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId("student-3", ["student-1", "student-2"]),
    { ok: false, reason: "forbidden" },
  );
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1", ""]),
    { ok: false, reason: "invalid-links" },
  );
});


test("Verified parent analytics IDs reject incomplete verification metadata and deduplicate links", () => {
  const verifiedAt = new Date("2026-10-29T08:00:00.000Z");
  const links = [
    { studentId: "student-1", verifiedAt, verifiedBy: "admin-1" },
    // Duplicate legacy rows must not make one child look like multiple children.
    { studentId: "student-1", verifiedAt: verifiedAt.toISOString(), verifiedBy: "admin-1" },
    { studentId: "student-2", verifiedAt: "2026-10-29T08:00:00.000Z", verifiedBy: "admin-1" },
    { studentId: "student-3", verifiedAt: null, verifiedBy: "admin-1" },
    { studentId: "student-4", verifiedAt: "not-a-date", verifiedBy: "admin-1" },
    { studentId: "student-5", verifiedAt, verifiedBy: " " },
    { studentId: " ", verifiedAt, verifiedBy: "admin-1" },
    null,
    "not-a-link",
  ];

  const linkedIds = getVerifiedParentAnalyticsStudentIds(links);
  assert.deepEqual(linkedIds, ["student-1", "student-2"]);
  assert.deepEqual(
    resolveParentAnalyticsStudentId(null, ["student-1", "student-1"]),
    { ok: true, studentId: "student-1" },
  );
});

const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
});

const users = pgTable("users", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  grade: text("grade"),
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
const verifiedByUser = alias(users, "verified_by_user");
const parentAccount = alias(users, "parent_account");
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
      CREATE TEMP TABLE users (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        grade TEXT
      );
      INSERT INTO users (id, role, name, grade) VALUES
        ('student-1', 'student', 'Student One', 'Third Secondary'),
        ('student-2', 'student', 'Student Two', 'Third Secondary'),
        ('student-3', 'student', 'Student Three', 'Third Secondary'),
        ('student-4', 'student', 'Student Four', 'Third Secondary'),
        ('student-5', 'student', 'Student Five', 'Third Secondary'),
        ('student-6', 'student', 'Student Six', 'Third Secondary'),
        ('teacher-2', 'teacher', 'Teacher Two', NULL),
        ('admin-1', 'admin', 'Admin One', NULL),
        ('parent-1', 'parent', 'Parent One', NULL),
        ('parent-2', 'parent', 'Parent Two', NULL);
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
        student_id TEXT NOT NULL,
        verified_at TIMESTAMP,
        verified_by TEXT
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
        ('enroll-6', 'student-5', 'course-other', 'active'),
        -- Malformed legacy data must not turn a teacher account into a student roster row.
        ('enroll-7', 'teacher-2', 'course-a', 'active');

      INSERT INTO parent_links (id, parent_id, student_id, verified_at, verified_by) VALUES
        ('link-1', 'parent-1', 'student-1', '2026-10-29 08:00:00', 'admin-1'),
        ('link-2', 'parent-1', 'student-2', '2026-10-29 08:00:00', 'admin-1'),
        ('link-3', 'parent-2', 'student-3', '2026-10-29 08:00:00', 'admin-1'),
        -- Even a malformed legacy link with verification metadata must not authorize a non-student account.
        ('link-4', 'parent-1', 'teacher-2', '2026-10-29 08:00:00', 'admin-1'),
        ('link-5', 'parent-1', 'deleted-student', NULL, NULL),
        ('link-6', 'parent-1', 'student-4', NULL, NULL),
        -- Verification metadata from a non-admin must not authorize parent analytics.
        ('link-7', 'parent-1', 'student-5', '2026-10-29 08:00:00', 'teacher-2'),
        -- A deleted verifier account must fail closed.
        ('link-8', 'parent-1', 'student-6', '2026-10-29 08:00:00', 'deleted-admin');

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
        ('hw-unscoped', 'teacher-1', NULL, 'Third Secondary', 100),
        ('hw-any-grade', 'teacher-1', 'course-a', NULL, 100);
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
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(and(eq(courses.teacherId, "teacher-1"), eq(users.role, "student"), inArray(enrollments.status, ["active", "completed"])));

    const allowedStudentIds = getTeacherAnalyticsStudentIds(rows, "teacher-1");
    assert.deepEqual(allowedStudentIds, ["student-1", "student-2"]);
    // A malformed enrollment that points to a teacher account must not authorize a direct report lookup.
    assert.equal(
      canAccessStudentAnalytics({
        role: "teacher",
        requesterId: "teacher-1",
        studentId: "teacher-2",
        teacherStudentIds: allowedStudentIds,
      }),
      false,
    );
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

integrationTest("PostgreSQL teacher roster query returns only current student accounts in the owned-course scope", async () => {
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
      .where(and(eq(courses.teacherId, "teacher-1"), inArray(enrollments.status, ["active", "completed"])));
    assert.equal(enrollmentRows.some((row) => row.studentId === "student-3"), false, "cancelled enrollment must be excluded by SQL");
    assert.equal(enrollmentRows.some((row) => row.studentId === "student-4"), false, "unknown enrollment status must be excluded by SQL");
    const allowedIds = getTeacherAnalyticsStudentIds(enrollmentRows, "teacher-1");
    const visibleStudents = allowedIds.length === 0
      ? []
      : await db
          .select({ id: users.id, name: users.name, grade: users.grade })
          .from(users)
          .where(and(eq(users.role, "student"), inArray(users.id, allowedIds)));

    assert.deepEqual(visibleStudents.map((student) => student.id), ["student-1", "student-2"]);
    assert.equal(visibleStudents.some((student) => student.id === "teacher-2"), false);
    assert.equal(visibleStudents.some((student) => student.id === "deleted-student"), false);
  });
});

integrationTest("PostgreSQL parent links require explicit choice for multiple children and deny unlinked students", async () => {
  await withFixture(async ({ db }) => {
    const rows = await db
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
    const linkedIds = getVerifiedParentAnalyticsStudentIds(rows);
    assert.deepEqual(linkedIds, ["student-1", "student-2"]);
    assert.equal(rows.some((row) => row.studentId === "student-5"), false, "a teacher verifier must not authorize a parent link");
    assert.equal(rows.some((row) => row.studentId === "student-6"), false, "a missing verifier account must not authorize a parent link");

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

    // A stale session must not preserve parent report access after the account role changes.
    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "parent-2"));
    const staleRoleRows = await db
      .select({ studentId: parentLinks.studentId })
      .from(parentLinks)
      .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
      .innerJoin(users, eq(parentLinks.studentId, users.id))
      .innerJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
      .where(and(
        eq(parentLinks.parentId, "parent-2"),
        eq(parentAccount.role, "parent"),
        eq(users.role, "student"),
        eq(verifiedByUser.role, "admin"),
        isNotNull(parentLinks.verifiedAt),
        isNotNull(parentLinks.verifiedBy),
      ));
    assert.deepEqual(staleRoleRows, [], "a stale parent session must not authorize reports after the parent role changes");
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

    assert.deepEqual(allowedHomeworkIds, ["hw-a", "hw-any-grade"]);
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


integrationTest("PostgreSQL Analytics homework scope fails closed for unknown student grade", async () => {
  await withFixture(async ({ db }) => {
    const [student] = await db
      .select({ grade: users.grade })
      .from(users)
      .where(eq(users.id, "student-1"));
    const items = await db
      .select({ id: homework.id, grade: homework.grade })
      .from(homework)
      .where(and(eq(homework.teacherId, "teacher-1"), eq(homework.courseId, "course-a")));

    const knownGradeIds = items
      .filter((item) => isHomeworkGradeVisibleToStudent(item.grade, student?.grade))
      .map((item) => item.id)
      .sort();
    const unknownGradeIds = items
      .filter((item) => isHomeworkGradeVisibleToStudent(item.grade, null))
      .map((item) => item.id)
      .sort();

    assert.deepEqual(knownGradeIds, ["hw-a", "hw-any-grade"]);
    assert.deepEqual(unknownGradeIds, ["hw-any-grade"]);
  });
});


integrationTest("PostgreSQL teacher Analytics rechecks current ownership and active enrollment after allowlist resolution", async () => {
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
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(and(
        eq(courses.teacherId, "teacher-1"),
        eq(users.role, "student"),
        inArray(enrollments.status, ["active", "completed"]),
      ));
    const allowedCourseIds = getTeacherAnalyticsCourseIds(enrollmentRows, "teacher-1", "student-1");
    assert.deepEqual(allowedCourseIds, ["course-a"]);

    const readScopedRows = async () => {
      const profileRows = await db
        .select({ id: users.id })
        .from(users)
        .innerJoin(enrollments, eq(enrollments.studentId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(and(
          eq(users.id, "student-1"),
          eq(users.role, "student"),
          eq(courses.teacherId, "teacher-1"),
          inArray(enrollments.courseId, allowedCourseIds),
          inArray(enrollments.status, ["active", "completed"]),
          exists(db
            .select({ id: users.id })
            .from(users)
            .where(and(
              eq(users.id, "student-1"),
              eq(users.role, "student"),
            ))),
        ));

      const quizRows = await db
        .select({ id: quizSubmissions.id })
        .from(quizSubmissions)
        .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
        .innerJoin(courses, eq(quizzes.courseId, courses.id))
        .where(and(
          eq(quizSubmissions.studentId, "student-1"),
          eq(courses.teacherId, "teacher-1"),
          inArray(quizzes.courseId, allowedCourseIds),
          exists(db
            .select({ id: users.id })
            .from(users)
            .where(and(
              eq(users.id, "student-1"),
              eq(users.role, "student"),
            ))),
          exists(db
            .select({ id: enrollments.id })
            .from(enrollments)
            .where(and(
              eq(enrollments.studentId, quizSubmissions.studentId),
              eq(enrollments.courseId, quizzes.courseId),
              inArray(enrollments.status, ["active", "completed"]),
            ))),
        ));

      const allowedHomework = await db
        .select({ id: homework.id })
        .from(homework)
        .innerJoin(courses, eq(homework.courseId, courses.id))
        .where(and(
          eq(homework.teacherId, "teacher-1"),
          eq(courses.teacherId, "teacher-1"),
          inArray(homework.courseId, allowedCourseIds),
          exists(db
            .select({ id: users.id })
            .from(users)
            .where(and(
              eq(users.id, "student-1"),
              eq(users.role, "student"),
            ))),
          exists(db
            .select({ id: enrollments.id })
            .from(enrollments)
            .where(and(
              eq(enrollments.studentId, "student-1"),
              eq(enrollments.courseId, homework.courseId),
              inArray(enrollments.status, ["active", "completed"]),
            ))),
        ));
      const allowedHomeworkIds = allowedHomework.map((row) => row.id);

      const homeworkRows = allowedHomeworkIds.length
        ? await db
            .select({ id: homeworkSubmissions.id })
            .from(homeworkSubmissions)
            .innerJoin(homework, eq(homeworkSubmissions.homeworkId, homework.id))
            .innerJoin(courses, eq(homework.courseId, courses.id))
            .where(and(
              eq(homeworkSubmissions.studentId, "student-1"),
              eq(homework.teacherId, "teacher-1"),
              eq(courses.teacherId, "teacher-1"),
              inArray(homeworkSubmissions.homeworkId, allowedHomeworkIds),
              exists(db
                .select({ id: users.id })
                .from(users)
                .where(and(
                  eq(users.id, homeworkSubmissions.studentId),
                  eq(users.role, "student"),
                ))),
              exists(db
                .select({ id: enrollments.id })
                .from(enrollments)
                .where(and(
                  eq(enrollments.studentId, homeworkSubmissions.studentId),
                  eq(enrollments.courseId, homework.courseId),
                  inArray(enrollments.status, ["active", "completed"]),
                ))),
            ))
        : [];

      const myEnrollments = await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(and(
          eq(enrollments.studentId, "student-1"),
          eq(courses.teacherId, "teacher-1"),
          inArray(enrollments.courseId, allowedCourseIds),
          inArray(enrollments.status, ["active", "completed"]),
          exists(db
            .select({ id: users.id })
            .from(users)
            .where(and(
              eq(users.id, "student-1"),
              eq(users.role, "student"),
            ))),
        ));

      return { profileRows, quizRows, allowedHomeworkIds, homeworkRows, myEnrollments };
    };

    const initiallyAuthorized = await readScopedRows();
    assert.deepEqual(initiallyAuthorized.profileRows.map((row) => row.id), ["student-1"]);
    assert.deepEqual(initiallyAuthorized.quizRows.map((row) => row.id), ["quiz-sub-a"]);
    assert.deepEqual(initiallyAuthorized.allowedHomeworkIds, ["hw-a", "hw-any-grade"]);
    assert.deepEqual(initiallyAuthorized.homeworkRows.map((row) => row.id), ["hw-sub-a"]);
    assert.deepEqual(initiallyAuthorized.myEnrollments.map((row) => row.courseId), ["course-a"]);

    // Revoke enrollment after the preliminary allowlist was computed.
    await db.update(enrollments).set({ status: "cancelled" }).where(eq(enrollments.id, "enroll-1"));
    const afterEnrollmentRevocation = await readScopedRows();
    assert.deepEqual(afterEnrollmentRevocation.profileRows, [], "revoked enrollment must hide the student profile");
    assert.deepEqual(afterEnrollmentRevocation.quizRows, [], "revoked enrollment must hide quiz results");
    assert.deepEqual(afterEnrollmentRevocation.allowedHomeworkIds, [], "revoked enrollment must hide course homework");
    assert.deepEqual(afterEnrollmentRevocation.homeworkRows, [], "revoked enrollment must hide homework submissions");
    assert.deepEqual(afterEnrollmentRevocation.myEnrollments, [], "revoked enrollment must not count as an enrolled course");

    // Restore the enrollment, then transfer course ownership after the allowlist
    // was computed. The current course owner must be rechecked by every report query.
    await db.update(enrollments).set({ status: "active" }).where(eq(enrollments.id, "enroll-1"));
    await db.update(courses).set({ teacherId: "teacher-2" }).where(eq(courses.id, "course-a"));
    const afterOwnershipTransfer = await readScopedRows();
    assert.deepEqual(afterOwnershipTransfer.profileRows, [], "a transferred course must no longer authorize the student's profile");
    assert.deepEqual(afterOwnershipTransfer.quizRows, [], "quiz scores must not leak after course ownership changes");
    assert.deepEqual(afterOwnershipTransfer.allowedHomeworkIds, [], "homework must be rechecked against the current course owner");
    assert.deepEqual(afterOwnershipTransfer.homeworkRows, [], "homework submissions must be rechecked against the current course owner");
    assert.deepEqual(afterOwnershipTransfer.myEnrollments, [], "course counts must exclude enrollment after ownership transfer");

    // Restore course ownership and enrollment, then demote the target account.
    // Every teacher data query must independently require the current student role.
    await db.update(courses).set({ teacherId: "teacher-1" }).where(eq(courses.id, "course-a"));
    await db.update(enrollments).set({ status: "active" }).where(eq(enrollments.id, "enroll-1"));
    await db.update(users).set({ role: "teacher" }).where(eq(users.id, "student-1"));
    const afterStudentRoleChange = await readScopedRows();
    assert.deepEqual(afterStudentRoleChange.profileRows, [], "a non-student account must not expose a teacher report profile");
    assert.deepEqual(afterStudentRoleChange.quizRows, [], "quiz results must be hidden after the account loses the student role");
    assert.deepEqual(afterStudentRoleChange.allowedHomeworkIds, [], "homework must be hidden after the account loses the student role");
    assert.deepEqual(afterStudentRoleChange.homeworkRows, [], "submissions must be hidden after the account loses the student role");
    assert.deepEqual(afterStudentRoleChange.myEnrollments, [], "course counts must be hidden after the account loses the student role");
  });
});
