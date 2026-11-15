import { db } from "@/db";
import { courses, units, lessons, enrollments } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { getFreeCoursesSettings, isFreeCourseAccessActive } from "@/lib/system-settings";

const FALLBACK_COURSES = [
  {
    id: "crs_sec_3",
    title: "Third Secondary Master Class 2025/2026 (Thanawya Amma)",
    description: "Comprehensive English Mastery for Baccalaureate Students. Covers Grammar, Advanced Vocabulary, Novel Analysis (The Count of Monte Cristo), Comprehension, and Exam Techniques with Mr. Habib El Rahman.",
    stage: "Secondary",
    grade: "Third Secondary (Baccalaureate)",
    teacherId: "usr_admin_1",
    teacherName: "Mr. Habib El Rahman",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    price: "350.00",
    isPublished: true,
    category: "Thanawya Amma Curriculum",
  },
  {
    id: "crs_sec_2_bac",
    title: "Second Year Egyptian Baccalaureate 2026/2027",
    description: "Independent Baccalaureate: 10 Units, 5 Consolidation Reviews & The Lost World novel.",
    stage: "Secondary",
    grade: "Second Year Baccalaureate",
    teacherId: "usr_admin_1",
    teacherName: "Mr. Habib El Rahman",
    thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
    price: "320.00",
    isPublished: true,
    category: "Egyptian Baccalaureate",
  },
  {
    id: "crs_sec_2",
    title: "Second Secondary Intensive English Program",
    description: "Master direct/indirect speech, conditionals, passive voice, and academic writing tailored for the latest Ministry of Education curriculum.",
    stage: "Secondary",
    grade: "Second Secondary",
    teacherId: "usr_teacher_1",
    teacherName: "Ms. Sarah Ahmed",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    price: "280.00",
    isPublished: true,
    category: "Grammar & Vocabulary",
  },
  {
    id: "crs_sec_1",
    title: "First Secondary Foundation & Grammar Mastery",
    description: "Transition smoothly from preparatory to secondary stage. Tenses, relative clauses, formal writing, and vocabulary builder.",
    stage: "Secondary",
    grade: "First Secondary",
    teacherId: "usr_admin_1",
    teacherName: "Mr. Habib El Rahman",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    price: "250.00",
    isPublished: true,
    category: "Secondary Core",
  },
  {
    id: "crs_prep_3",
    title: "Third Prep High Score Booster (الشهادة الإعدادية)",
    description: "Complete preparation for Third Prep final exams. Detailed breakdown of dialogue completion, reading comprehension, and top grammar rules.",
    stage: "Preparatory",
    grade: "Third Prep",
    teacherId: "usr_admin_1",
    teacherName: "Mr. Habib El Rahman",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    price: "200.00",
    isPublished: true,
    category: "Preparatory Excellence",
  },
];

const FALLBACK_UNITS_SEC3 = [
  {
    id: "u_sec3_1",
    courseId: "crs_sec_3",
    title: "Unit 1: Inside the World of Care (Healthcare & Emergency)",
    orderIndex: 1,
    lessons: [
      {
        id: "lsn_sec3_1_1",
        unitId: "u_sec3_1",
        title: "Lecture 1: Present Perfect Simple vs Continuous (Comprehensive Explanation)",
        description: "Deep dive into present perfect tenses with real Thanawya Amma exam drills.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
        pdfUrl: "/api/pdfs/file/pdf_sec3_unit1_notes",
        orderIndex: 1,
        isFree: true,
      },
      {
        id: "lsn_sec3_1_2",
        unitId: "u_sec3_1",
        title: "Lecture 2: Core Medical & Emergency Vocabulary and Context Clues",
        description: "Master essential vocabulary, collocations, and contextual exercises.",
        duration: "38 mins",
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        pdfUrl: "/api/pdfs/file/pdf_sec3_unit1_vocab",
        orderIndex: 2,
        isFree: true,
      },
    ],
  },
  {
    id: "u_sec3_2",
    courseId: "crs_sec_3",
    title: "Unit 2: The Power of Machines (Past Narrative Tenses)",
    orderIndex: 2,
    lessons: [
      {
        id: "lsn_sec3_2_1",
        unitId: "u_sec3_2",
        title: "Lecture 1: Past Simple, Past Continuous & Past Perfect Mastery",
        description: "Master sequential narrative tenses with past perfect nuance.",
        duration: "42 mins",
        videoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
        pdfUrl: "/api/pdfs/file/pdf_sec3_unit2_notes",
        orderIndex: 1,
        isFree: true,
      },
    ],
  },
  {
    id: "u_sec3_3",
    courseId: "crs_sec_3",
    title: "Unit 3: Protect Nature, Protect Future (Adjectives & Adverbs)",
    orderIndex: 3,
    lessons: [
      {
        id: "lsn_sec3_3_1",
        unitId: "u_sec3_3",
        title: "Lecture 1: Compound Adjectives, Modifiers & Sustainability Idioms",
        description: "Detailed analysis of compound adjectives and adverbial modifiers.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        pdfUrl: "/api/pdfs/file/pdf_sec3_unit3_notes",
        orderIndex: 1,
        isFree: true,
      },
    ],
  },
];

export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("id");
  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");

  const freeSettings = getFreeCoursesSettings();
  const isFreeActive = isFreeCourseAccessActive();

  try {
    if (courseId) {
      let course: any = null;
      let unitsWithLessons: any[] = [];
      const ctx = await getAuthContext(req);
      const isPrivileged = ctx?.user?.role === "admin" || ctx?.user?.role === "teacher";
      const isOwner = ctx?.user?.role === "student";

      if (process.env.DATABASE_URL) {
        try {
          const courseList = await db.select().from(courses).where(eq(courses.id, courseId));
          if (courseList.length > 0) {
            course = courseList[0];
            const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
            unitsWithLessons = await Promise.all(
              courseUnits.map(async (u) => {
                const unitLessons = await db.select().from(lessons).where(eq(lessons.unitId, u.id));
                return {
                  ...u,
                  lessons: unitLessons.map((lesson) => {
                    const canSeeProtected = isPrivileged || isFreeActive || lesson.isFree;
                    return canSeeProtected
                      ? lesson
                      : { id: lesson.id, unitId: lesson.unitId, title: lesson.title, description: lesson.description, duration: lesson.duration, orderIndex: lesson.orderIndex, isFree: lesson.isFree };
                  }),
                };
              })
            );
          }
        } catch (dbErr) {
          console.warn("DB course query failed, utilizing fallback catalog:", dbErr);
        }
      }

      // Fallback for preview/local environments without Postgres connection
      if (!course) {
        course = FALLBACK_COURSES.find((c) => c.id === courseId) || FALLBACK_COURSES[0];
        unitsWithLessons = FALLBACK_UNITS_SEC3.map((u) => ({
          ...u,
          lessons: u.lessons.map((lesson) => {
            const canSeeProtected = isPrivileged || isFreeActive || lesson.isFree;
            return canSeeProtected
              ? lesson
              : { id: lesson.id, unitId: lesson.unitId, title: lesson.title, description: lesson.description, duration: lesson.duration, orderIndex: lesson.orderIndex, isFree: lesson.isFree };
          }),
        }));
      }

      let isEnrolled = isFreeActive;
      let userEnrollment = null;

      if (isOwner && ctx?.user?.id && process.env.DATABASE_URL) {
        try {
          const enr = await db
            .select()
            .from(enrollments)
            .where(and(eq(enrollments.studentId, ctx.user.id), eq(enrollments.courseId, courseId), eq(enrollments.status, "active")));
          if (enr.length > 0) {
            isEnrolled = true;
            userEnrollment = enr[0];
          }
        } catch {}
      }

      const enhancedCourse = {
        ...course,
        originalPrice: course.price,
        isFreeUntilEndOfTerm: isFreeActive,
        freeCoursesAccessUntil: freeSettings.freeCoursesAccessUntil,
        displayPrice: isFreeActive ? freeSettings.labelAr : `${course.price} EGP`,
        freeLabelAr: freeSettings.labelAr,
        freeLabelEn: freeSettings.labelEn,
      };

      return NextResponse.json({
        course: enhancedCourse,
        units: unitsWithLessons,
        isEnrolled,
        enrollment: userEnrollment,
        isFreeUntilEndOfTerm: isFreeActive,
        freeCoursesAccessUntil: freeSettings.freeCoursesAccessUntil,
      });
    }

    let allCourses: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        allCourses = await db.select().from(courses);
      } catch (dbErr) {
        console.warn("DB all-courses query failed, using fallback:", dbErr);
      }
    }

    if (allCourses.length === 0) {
      allCourses = FALLBACK_COURSES;
    }

    if (stage) allCourses = allCourses.filter((c) => c.stage.toLowerCase() === stage.toLowerCase());
    if (grade) allCourses = allCourses.filter((c) => c.grade.toLowerCase() === grade.toLowerCase());

    const mappedCourses = allCourses.filter((c) => c.isPublished).map((c) => ({
      ...c,
      originalPrice: c.price,
      isFreeUntilEndOfTerm: isFreeActive,
      freeCoursesAccessUntil: freeSettings.freeCoursesAccessUntil,
      displayPrice: isFreeActive ? freeSettings.labelAr : `${c.price} EGP`,
      freeLabelAr: freeSettings.labelAr,
      freeLabelEn: freeSettings.labelEn,
    }));

    return NextResponse.json({
      courses: mappedCourses,
      isFreeUntilEndOfTerm: isFreeActive,
      freeCoursesAccessUntil: freeSettings.freeCoursesAccessUntil,
    });
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

      // If free courses access until end of term is active, grant instant free enrollment
      if (isFreeCourseAccessActive()) {
        const freeEnr = {
          id: `enr_free_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          studentId: user!.id,
          courseId,
          status: "active" as const,
          progress: 0,
          completedLessonIds: [],
        };
        try {
          await db.insert(enrollments).values(freeEnr);
        } catch (e) {
          console.warn("DB enrollment insert error:", e);
        }
        return NextResponse.json({ success: true, enrollment: freeEnr, isFreeUntilEndOfTerm: true });
      }

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

      const courseUnitRows = await db.select({ id: units.id })
        .from(units)
        .where(eq(units.courseId, courseId));
      const courseUnitIds = courseUnitRows.map((u) => u.id);
      const totalLessonsRows = courseUnitIds.length
        ? await db.select({ id: lessons.id })
            .from(lessons)
            .where(inArray(lessons.unitId, courseUnitIds))
        : [];
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
