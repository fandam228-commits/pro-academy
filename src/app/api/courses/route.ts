import { db } from "@/db";
import { courses, units, lessons, enrollments, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("id");
  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");
  const studentId = searchParams.get("studentId");

  try {
    if (courseId) {
      const courseList = await db.select().from(courses).where(eq(courses.id, courseId));
      if (courseList.length === 0) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const course = courseList[0];
      const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
      
      // Fetch lessons for all units
      const unitsWithLessons = await Promise.all(
        courseUnits.map(async (u) => {
          const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, u.id));
          return { ...u, lessons: unitLessons };
        })
      );

      let isEnrolled = false;
      let userEnrollment = null;
      if (studentId) {
        const enr = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));
        if (enr.length > 0) {
          isEnrolled = true;
          userEnrollment = enr[0];
        }
      }

      return NextResponse.json({
        course,
        units: unitsWithLessons,
        isEnrolled,
        enrollment: userEnrollment,
      });
    }

    // List courses with optional filters
    let allCourses = await db.select().from(courses);

    if (stage) {
      allCourses = allCourses.filter((c) => c.stage.toLowerCase() === stage.toLowerCase());
    }
    if (grade) {
      allCourses = allCourses.filter((c) => c.grade.toLowerCase() === grade.toLowerCase());
    }

    return NextResponse.json({ courses: allCourses });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const body = await req.json();
    const { action, courseData, unitData, lessonData, studentId, courseId } = body;

    // ---- SECURITY: Curriculum authoring → teachers & admins only
    const authoringActions = ["create_course", "create_unit", "create_lesson"];
    if (authoringActions.includes(action)) {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
    }

    if (action === "create_course") {
      const id = `crs_${Date.now()}`;
      const newCourse = {
        id,
        title: courseData.title,
        description: courseData.description,
        stage: courseData.stage,
        grade: courseData.grade,
        teacherId: courseData.teacherId || "usr_admin_1",
        teacherName: courseData.teacherName || "Mr. Habib El Rahman",
        thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        price: courseData.price || "250.00",
        category: courseData.category || "Grammar & Vocabulary",
        isPublished: true,
      };
      await db.insert(courses).values(newCourse);
      return NextResponse.json({ success: true, course: newCourse });
    }

    if (action === "create_unit") {
      const id = `unit_${Date.now()}`;
      const newUnit = {
        id,
        courseId: unitData.courseId,
        title: unitData.title,
        description: unitData.description || "",
        orderIndex: unitData.orderIndex || 1,
      };
      await db.insert(units).values(newUnit);
      return NextResponse.json({ success: true, unit: newUnit });
    }

    if (action === "create_lesson") {
      const id = `lsn_${Date.now()}`;
      const newLesson = {
        id,
        unitId: lessonData.unitId,
        title: lessonData.title,
        description: lessonData.description || "",
        videoUrl: lessonData.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration: lessonData.duration || "25 mins",
        pdfUrl: lessonData.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        orderIndex: lessonData.orderIndex || 1,
        isFree: lessonData.isFree || false,
      };
      await db.insert(lessons).values(newLesson);
      return NextResponse.json({ success: true, lesson: newLesson });
    }

    if (action === "enroll") {
      const existing = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));

      if (existing.length > 0) {
        return NextResponse.json({ success: true, enrollment: existing[0] });
      }

      const enrId = `enr_${Date.now()}`;
      const newEnrollment = {
        id: enrId,
        studentId,
        courseId,
        status: "active",
        progress: 0,
        completedLessonIds: [],
        paymentMethod: body.paymentMethod || "instant_enroll",
      };
      await db.insert(enrollments).values(newEnrollment);
      return NextResponse.json({ success: true, enrollment: newEnrollment });
    }

    if (action === "complete_lesson") {
      const enrs = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));

      if (enrs.length > 0) {
        const enr = enrs[0];
        const completed = (enr.completedLessonIds as string[]) || [];
        if (!completed.includes(body.lessonId)) {
          completed.push(body.lessonId);
        }
        await db
          .update(enrollments)
          .set({ completedLessonIds: completed, progress: Math.min(100, completed.length * 25) })
          .where(eq(enrollments.id, enr.id));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
