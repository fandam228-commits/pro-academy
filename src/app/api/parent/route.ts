import { db } from "@/db";
import { parentLinks, users, enrollments, quizSubmissions, attendance } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { getParentAnalyticsSelectionData, resolveParentAnalyticsStudentId } from "@/lib/analytics-report-scope.mjs";

const verifiedByUser = alias(users, "parent_route_verified_by_user");
const parentAccount = alias(users, "parent_route_parent_account");

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
    const parentAccount = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, parentId), eq(users.role, "parent")));
    if (parentAccount.length === 0) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

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
      return NextResponse.json({ error: "No verified linked student found" }, { status: 404 });
    }
    const resolution = resolveParentAnalyticsStudentId(
      requestedStudent,
      selectionData.allLinkedStudentIds,
    );
    if (!resolution.ok) {
      if (resolution.reason === "no-linked-student") {
        return NextResponse.json({ error: "No linked student found" }, { status: 404 });
      }
      if (resolution.reason === "student-id-required") {
        return NextResponse.json({ error: "studentId is required when multiple students are linked" }, { status: 400 });
      }
      if (resolution.reason === "invalid-student-id") {
        return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const studentId = resolution.studentId;
    if (!selectionData.verifiedStudentIds.includes(studentId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = resolution.studentId;
    const primaryLink = links.find((link) => link.studentId === studentId && link.studentRole === "student" && link.verifierRole === "admin" && Boolean(link.verifiedAt) && Boolean(link.verifiedBy));
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

    const studentEnrs = await db.select().from(enrollments).where(eq(enrollments.studentId, student.id));
    const studentSubs = await db.select().from(quizSubmissions).where(eq(quizSubmissions.studentId, student.id));
    const studentAtt = await db.select().from(attendance).where(eq(attendance.studentId, student.id));

    const avgScore = studentSubs.length > 0
      ? Math.round(studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length)
      : 85;

    return NextResponse.json({
      student,
      relationship: primaryLink.relationship,
      enrollments: studentEnrs,
      submissions: studentSubs,
      attendance: studentAtt,
      averageScore: avgScore,
      attendanceRate: "98%",
    });
  } catch (error) {
    console.error("Parent GET error:", error);
    return NextResponse.json({ error: "Failed to fetch parent data" }, { status: 500 });
  }
}
