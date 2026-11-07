import { db } from "@/db";
import { parentLinks, users, enrollments, quizSubmissions, attendance } from "@/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getParentAnalyticsSelectionData, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";

const parentAccountUser = alias(users, "parent_route_parent_account");
const verifiedByUser = alias(users, "parent_route_verified_by_user");
const studentAccountUser = alias(users, "parent_route_student_account");

export async function GET(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // This is a parent overview endpoint, not a teacher report endpoint. Teachers must use
  // /api/reports, which scopes every report to courses they own.
  if (ctx.user.role !== "parent" && ctx.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const parentId = ctx.user.role === "parent" ? ctx.user.id : searchParams.get("parentId");
  const requestedStudent = searchParams.get("studentId");
  if (!parentId) return NextResponse.json({ error: "parentId required" }, { status: 400 });

  try {
    const parentAccountRows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, parentId), eq(users.role, "parent")));
    if (parentAccountRows.length === 0) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

    const links = await db
      .select({
        studentId: parentLinks.studentId,
        relationship: parentLinks.relationship,
        verifiedAt: parentLinks.verifiedAt,
        verifiedBy: parentLinks.verifiedBy,
        verifierRole: verifiedByUser.role,
      })
      .from(parentLinks)
      .innerJoin(parentAccountUser, eq(parentLinks.parentId, parentAccountUser.id))
      .innerJoin(users, eq(parentLinks.studentId, users.id))
      // Keep unverified links in the ambiguity set; they must not grant access.
      .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
      .where(and(
        eq(parentLinks.parentId, parentId),
        eq(parentAccountUser.role, "parent"),
        eq(users.role, "student"),
      ));
    const {
      allLinkedStudentIds: linkedStudentIds,
      verifiedStudentIds,
    } = getParentAnalyticsSelectionData(links);
    const resolution = resolveParentAnalyticsStudentId(requestedStudent, linkedStudentIds);
    if (!resolution.ok) {
      if (resolution.reason === "no-linked-student") {
        return NextResponse.json({ error: "No verified linked student found" }, { status: 404 });
      }
      if (resolution.reason === "student-id-required") {
        // Return only currently verified children as safe choices. Unverified links
        // still count toward ambiguity, but must never appear as selectable students.
        const selectableStudents = verifiedStudentIds.length > 0
          ? await db
              .selectDistinct({
                id: users.id,
                name: users.name,
                grade: users.grade,
              })
              .from(users)
              .innerJoin(parentLinks, and(
                eq(parentLinks.studentId, users.id),
                eq(parentLinks.parentId, parentId),
                isNotNull(parentLinks.verifiedAt),
                isNotNull(parentLinks.verifiedBy),
              ))
              .innerJoin(parentAccountUser, and(
                eq(parentLinks.parentId, parentAccountUser.id),
                eq(parentAccountUser.role, "parent"),
              ))
              .innerJoin(verifiedByUser, and(
                eq(parentLinks.verifiedBy, verifiedByUser.id),
                eq(verifiedByUser.role, "admin"),
              ))
              .where(and(
                inArray(users.id, verifiedStudentIds),
                eq(users.role, "student"),
              ))
          : [];
        return NextResponse.json({
          error: "studentId is required when multiple students are linked",
          requiresStudentSelection: true,
          students: selectableStudents,
        }, { status: 400 });
      }
      if (resolution.reason === "invalid-student-id") {
        return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!verifiedStudentIds.includes(resolution.studentId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const studentId = resolution.studentId;
    const primaryLink = links.find((link) =>
      link.studentId === studentId &&
      link.verifierRole === "admin" &&
      link.verifiedAt &&
      link.verifiedBy
    );
    if (!primaryLink) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Never return the complete users row: it includes password and other private account fields.
    const studentList = await db
      .select({
        id: users.id,
        name: users.name,
        grade: users.grade,
        level: users.level,
        streak: users.streak,
        points: users.points,
      })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, "student")));
    const student = studentList[0];
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Return only fields used by the parent overview. In particular, never expose
    // enrollment payment metadata or students' raw quiz answers/feedback here.
    const studentEnrs = await db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        completedLessonIds: enrollments.completedLessonIds,
        activatedAt: enrollments.activatedAt,
      })
      .from(enrollments)
      .where(eq(enrollments.studentId, student.id));
    const studentSubs = await db
      .select({
        id: quizSubmissions.id,
        quizId: quizSubmissions.quizId,
        score: quizSubmissions.score,
        totalQuestions: quizSubmissions.totalQuestions,
        percentage: quizSubmissions.percentage,
        passed: quizSubmissions.passed,
        submittedAt: quizSubmissions.submittedAt,
      })
      .from(quizSubmissions)
      .where(eq(quizSubmissions.studentId, student.id));
    const studentAtt = await db
      .select({
        id: attendance.id,
        courseId: attendance.courseId,
        lessonId: attendance.lessonId,
        status: attendance.status,
        date: attendance.date,
      })
      .from(attendance)
      .where(eq(attendance.studentId, student.id));

    const avgScore = studentSubs.length > 0
      ? Math.round(studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length)
      : null;

    // Revalidate the complete relationship after all student-data reads. The
    // parent, student, and verifier roles may change while the overview is built.
    // Requiring the link and verifier in the final SQL statement makes revocation
    // or verifier demotion fail closed before any student data is returned.
    const parentAccessStillValid = await db
      .select({ id: studentAccountUser.id })
      .from(studentAccountUser)
      .innerJoin(parentLinks, and(
        eq(parentLinks.studentId, studentAccountUser.id),
        eq(parentLinks.parentId, parentId),
        isNotNull(parentLinks.verifiedAt),
        isNotNull(parentLinks.verifiedBy),
      ))
      .innerJoin(parentAccountUser, and(
        eq(parentLinks.parentId, parentAccountUser.id),
        eq(parentAccountUser.role, "parent"),
      ))
      .innerJoin(verifiedByUser, and(
        eq(parentLinks.verifiedBy, verifiedByUser.id),
        eq(verifiedByUser.role, "admin"),
      ))
      .where(and(
        eq(studentAccountUser.id, studentId),
        eq(studentAccountUser.role, "student"),
      ))
      .limit(1);
    if (parentAccessStillValid.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      student,
      relationship: primaryLink.relationship,
      enrollments: studentEnrs,
      submissions: studentSubs,
      attendance: studentAtt,
      averageScore: avgScore,
      attendanceRate: null,
    });
  } catch (error) {
    console.error("Parent GET error:", error);
    return NextResponse.json({ error: "Failed to fetch parent data" }, { status: 500 });
  }
}
