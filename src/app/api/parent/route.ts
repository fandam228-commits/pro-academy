import { db } from "@/db";
import { parentLinks, users, enrollments, quizSubmissions, attendance } from "@/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getParentAnalyticsSelectionData, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";
import { buildVerifiedParentLinkPredicate } from "@/lib/parent-report-authorization.mjs";

const verifiedByUser = alias(users, "parent_route_verified_by_user");
const parentAccount = alias(users, "parent_route_parent_account");
const studentAccountUser = alias(users, "parent_route_student_account");

function privateJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json(body, { ...init, headers });
}

export async function GET(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) return privateJson({ error: "Unauthorized" }, { status: 401 });
  // This is a parent overview endpoint, not a teacher report endpoint. Teachers must use
  // /api/reports, which scopes every report to courses they own.
  if (ctx.user.role !== "parent" && ctx.user.role !== "admin") {
    return privateJson({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const parentId = ctx.user.role === "parent" ? ctx.user.id : searchParams.get("parentId");
  const requestedStudent = searchParams.get("studentId");
  if (!parentId) return privateJson({ error: "parentId required" }, { status: 400 });

  try {
    const parentAccountRows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, parentId), eq(users.role, "parent")));
    if (parentAccountRows.length === 0) return privateJson({ error: "Parent not found" }, { status: 404 });

    const links = await db
      .select({
        studentId: parentLinks.studentId,
        relationship: parentLinks.relationship,
        verifiedAt: parentLinks.verifiedAt,
        verifiedBy: parentLinks.verifiedBy,
        studentRole: users.role,
        verifierRole: verifiedByUser.role,
      })
      .from(parentLinks)
      .innerJoin(parentAccount, eq(parentLinks.parentId, parentAccount.id))
      .leftJoin(users, eq(parentLinks.studentId, users.id))
      .leftJoin(verifiedByUser, eq(parentLinks.verifiedBy, verifiedByUser.id))
      .where(and(
        eq(parentLinks.parentId, parentId),
        eq(parentAccount.role, "parent"),
      ));
    const selectionData = getParentAnalyticsSelectionData(
      links.filter((link) => link.studentRole === "student"),
    );
    if (selectionData.verifiedStudentIds.length === 0) {
      return privateJson({ error: "No verified linked student found" }, { status: 404 });
    }
    const resolution = resolveParentAnalyticsStudentId(
      requestedStudent,
      selectionData.allLinkedStudentIds,
    );
    if (!resolution.ok) {
      if (resolution.reason === "no-linked-student") {
        return privateJson({ error: "No linked student found" }, { status: 404 });
      }
      if (resolution.reason === "student-id-required") {
        // Return only currently verified children as safe choices. Unverified links
        // remain part of the ambiguity check but must never be selectable.
        const selectableStudents = selectionData.verifiedStudentIds.length > 0
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
              .innerJoin(parentAccount, and(
                eq(parentLinks.parentId, parentAccount.id),
                eq(parentAccount.role, "parent"),
              ))
              .innerJoin(verifiedByUser, and(
                eq(parentLinks.verifiedBy, verifiedByUser.id),
                eq(verifiedByUser.role, "admin"),
              ))
              .where(and(
                inArray(users.id, selectionData.verifiedStudentIds),
                eq(users.role, "student"),
              ))
          : [];
        return privateJson({
          error: "studentId is required when multiple students are linked",
          requiresStudentSelection: true,
          students: selectableStudents,
        }, { status: 400 });
      }
      if (resolution.reason === "invalid-student-id") {
        return privateJson({ error: "Invalid studentId" }, { status: 400 });
      }
      return privateJson({ error: "Forbidden" }, { status: 403 });
    }
    const studentId = resolution.studentId;
    if (!selectionData.verifiedStudentIds.includes(studentId)) {
      return privateJson({ error: "Forbidden" }, { status: 403 });
    }
    const primaryLink = links.find((link) => link.studentId === studentId && getParentAnalyticsSelectionData([link]).verifiedStudentIds.includes(studentId));
    if (!primaryLink) return privateJson({ error: "Forbidden" }, { status: 403 });

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
    if (!student) return privateJson({ error: "Student not found" }, { status: 404 });

    const studentEnrs = await db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        activatedAt: enrollments.activatedAt,
      })
      .from(enrollments)
      .where(eq(enrollments.studentId, student.id));
    const studentSubs = await db
      .select({
        id: quizSubmissions.id,
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
        status: attendance.status,
        date: attendance.date,
      })
      .from(attendance)
      .where(eq(attendance.studentId, student.id));

    const avgScore = studentSubs.length > 0
      ? Math.round(studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length)
      : null;

    // Revalidate the complete relationship after all report reads. The link,
    // parent/student roles, or verifier role may change while those reads run.
    const parentAccessStillValid = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.id, studentId),
        eq(users.role, "student"),
        buildVerifiedParentLinkPredicate({
          db,
          parentLinks,
          parentAccount,
          studentAccount: studentAccountUser,
          verifiedByUser,
          parentId,
          studentId,
        }),
      ))
      .limit(1);
    if (parentAccessStillValid.length === 0) {
      return privateJson({ error: "Forbidden" }, { status: 403 });
    }

    return privateJson({
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
    return privateJson({ error: "Failed to fetch parent data" }, { status: 500 });
  }
}
