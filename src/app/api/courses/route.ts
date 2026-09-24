import { db } from "@/db";
import { courses, units, lessons, enrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("id");
  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");

  try {
    if (courseId) {
      const courseList = await db.select().from(courses).where(eq(courses.id, courseId));
      if (courseList.length === 0) return NextResponse.json({ error: "Course not found" }, { status: 404 });

      const course = courseList[0];
      const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));

      const ctx = await getAuthContext(req);
      const isPrivileged = ctx?.user?.role === "admin" || ctx?.user?.role === "teacher";
      const isOwner = ctx?.user?.role === "student";

      if (course.isPublished === false && !isPrivileged) {
        return NextResponse.json({ error: "Course is not published." }, { status: 403 });
      }

      let isEnrolled = false;
      let userEnrollment = null;
      if (isOwner) {
        const enr = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.studentId, ctx!.user.id), eq(enrollments.courseId, courseId), eq(enrollments.status, "active")));
        if (enr.length > 0) {
          isEnrolled = true;
          userEnrollment = enr[0];
        }
      }

      const unitsWithLessons = await Promise.all(
        courseUnits.map(async (u) => {
          const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, u.id));
          return {
            ...u,
            lessons: unitLessons.map((lesson) => {
              const canSeeProtected = isPrivileged || isEnrolled || lesson.isFree;
              return canSeeProtected
                ? lesson
                : { id: lesson.id, unitId: lesson.unitId, title: lesson.title, description: lesson.description, duration: lesson.duration, orderIndex: lesson.orderIndex, isFree: lesson.isFree };
            }),
          };
        })
      );

      return NextResponse.json({ course, units: unitsWithLessons, isEnrolled, enrollment: userEnrollment });
    }

    let allCourses = await db.select().from(courses);
    if (stage) allCourses = allCourses.filter((c) => c.stage.toLowerCase() === stage.toLowerCase());
    if (grade) allCourses = allCourses.filter((c) => c.grade.toLowerCase() === grade.toLowerCase());
    return NextResponse.json({ courses: allCourses.filter((c) => c.isPublished) });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const body = await req.json();
    const { action, courseData, unitData, lessonData, courseId } = body;

    const authoringActions = ["create_course", "create_unit", "create_lesson"];
    if (authoringActions.includes(action)) {
      const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      if (action === "create_course" && user!.role === "teacher" && courseData.teacherId && courseData.teacherId !== user!.id) {
        return NextResponse.json({ error: "Teachers may only create courses under their own account." }, { status: 403 });
      }
    }

    if (action === "create_course") {
      const { user } = await requireRoles(req, ["admin", "teacher"]);
      const id = `crs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const newCourse = {
        id,
        title: String(courseData.title || "").trim(),
        description: String(courseData.description || "").trim(),
        stage: courseData.stage,
        grade: courseData.grade,
        teacherId: user!.role === "teacher" ? user!.id : (courseData.teacherId || user!.id),
        teacherName: user!.role === "teacher" ? user!.name : (courseData.teacherName || "Mr. Habib El Rahman"),
        thumbnail: courseData.thumbnail || "",
        price: String(courseData.price || "250.00"),
        category: courseData.category || "Grammar & Vocabulary",
        isPublished: false,
      };
      if (!newCourse.title || !newCourse.description || !newCourse.stage || !newCourse.grade) {
        return NextResponse.json({ error: "Title, description, stage and grade are required." }, { status: 400 });
      }
      await db.insert(courses).values(newCourse);
      return NextResponse.json({ success: true, course: newCourse });
    }

    if (action === "create_unit") {
      const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      const parent = await db.select().from(courses).where(eq(courses.id, unitData.courseId));
      if (!parent.length) return NextResponse.json({ error: "Course not found." }, { status: 404 });
      if (user!.role === "teacher" && parent[0].teacherId !== user!.id) return NextResponse.json({ error: "You do not own this course." }, { status: 403 });

      const id = `unit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const newUnit = { id, courseId: unitData.courseId, title: String(unitData.title || "").trim(), description: unitData.description || "", orderIndex: Number(unitData.orderIndex) || 1 };
      if (!newUnit.title) return NextResponse.json({ error: "Unit title is required." }, { status: 400 });
      await db.insert(units).values(newUnit);
      return NextResponse.json({ success: true, unit: newUnit });
    }

    if (action === "create_lesson") {
      const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      const parent = await db.select({ teacherId: courses.teacherId }).from(courses)
        .innerJoin(units, eq(units.courseId, courses.id))
        .where(eq(units.id, lessonData.unitId));
      if (!parent.length) return NextResponse.json({ error: "Unit not found." }, { status: 404 });
      if (user!.role === "teacher" && parent[0].teacherId !== user!.id) return NextResponse.json({ error: "You do not own this course." }, { status: 403 });

      const id = `lsn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const newLesson = {
        id,
        unitId: lessonData.unitId,
        title: String(lessonData.title || "").trim(),
        description: lessonData.description || "",
        videoUrl: String(lessonData.videoUrl || "").trim(),
        duration: lessonData.duration || "25 mins",
        pdfUrl: lessonData.pdfUrl || "",
        orderIndex: Number(lessonData.orderIndex) || 1,
        isFree: Boolean(lessonData.isFree),
      };
      if (!newLesson.title || !newLesson.videoUrl) return NextResponse.json({ error: "Lesson title and video URL are required." }, { status: 400 });
      await db.insert(lessons).values(newLesson);
      return NextResponse.json({ success: true, lesson: newLesson });
    }

    if (action === "enroll") {
      const { user, denied } = await requireRoles(req, ["student"]);
      if (denied) return denied;
      if (!courseId) return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
      const existing = await db.select().from(enrollments).where(and(eq(enrollments.studentId, user!.id), eq(enrollments.courseId, courseId)));
      if (existing.length) return NextResponse.json({ success: true, enrollment: existing[0] });
      return NextResponse.json({ error: "Enrollment requires an approved payment or activation code." }, { status: 402 });
    }

    if (action === "complete_lesson") {
      const { user, denied } = await requireRoles(req, ["student"]);
      if (denied) return denied;
      if (!courseId || !body.lessonId) return NextResponse.json({ error: "Course and lesson are required." }, { status: 400 });

      const enrs = await db.select().from(enrollments).where(and(eq(enrollments.studentId, user!.id), eq(enrollments.courseId, courseId), eq(enrollments.status, "active")));
      if (!enrs.length) return NextResponse.json({ error: "You are not enrolled in this course." }, { status: 403 });

      const lessonRows = await db.select({ id: lessons.id }).from(lessons)
        .innerJoin(units, eq(units.id, lessons.unitId))
        .where(and(eq(lessons.id, body.lessonId), eq(units.courseId, courseId)));
      if (!lessonRows.length) return NextResponse.json({ error: "Lesson does not belong to this course." }, { status: 400 });

      const enr = enrs[0];
      const completed = Array.isArray(enr.completedLessonIds) ? [...(enr.completedLessonIds as string[])] : [];
      if (!completed.includes(body.lessonId)) completed.push(body.lessonId);

      const totalLessonsRows = await db.select({ id: lessons.id })
        .innerJoin(units, eq(units.id, lessons.unitId))
        .where(eq(units.courseId, courseId));
      const progress = totalLessonsRows.length ? Math.round((completed.length / totalLessonsRows.length) * 100) : 0;

      await db.update(enrollments).set({ completedLessonIds: completed, progress: Math.min(100, progress) }).where(eq(enrollments.id, enr.id));
      return NextResponse.json({ success: true, progress: Math.min(100, progress) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
