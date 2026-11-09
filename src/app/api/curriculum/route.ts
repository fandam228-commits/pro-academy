import { db } from "@/db";
import {
  curriculumGrades,
  curriculumUnits,
  curriculumSections,
  storyChapters,
  studentCurriculumProgress,
} from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup, syncCurriculum2026 } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { getCurriculumUnits } from "@/config/curriculum-2026";

// =========================================================================
// GET: Fetch Curriculum Structure, Units, Sections, Stories, & Progress
// =========================================================================
export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const gradeCodeOrId = searchParams.get("grade");
  const unitId = searchParams.get("unitId");
  const chapterId = searchParams.get("chapterId");
  let studentId = searchParams.get("studentId");

  const ctx = await getAuthContext(req);
  if (!studentId && ctx?.user?.role === "student") {
    studentId = ctx.user.id;
  }

  try {
    // 1. Fetch single unit details with its sections
    if (unitId) {
      const unitsFound = await db.select().from(curriculumUnits).where(eq(curriculumUnits.id, unitId));
      if (unitsFound.length === 0) {
        return NextResponse.json({ error: "Unit not found" }, { status: 404 });
      }
      const unit = unitsFound[0];
      const sections = await db
        .select()
        .from(curriculumSections)
        .where(eq(curriculumSections.unitId, unitId))
        .orderBy(asc(curriculumSections.orderIndex));

      // Fetch progress for this unit's sections if studentId provided
      let progressMap: Record<string, any> = {};
      if (studentId) {
        const progressRows = await db
          .select()
          .from(studentCurriculumProgress)
          .where(and(eq(studentCurriculumProgress.studentId, studentId), eq(studentCurriculumProgress.unitId, unitId)));
        for (const row of progressRows) {
          if (row.sectionId) progressMap[row.sectionId] = row;
        }
      }

      return NextResponse.json({
        success: true,
        unit,
        sections: sections.map((s) => ({
          ...s,
          isCompleted: progressMap[s.id]?.isCompleted || false,
          userScore: progressMap[s.id]?.score ?? null,
        })),
      });
    }

    // 2. Fetch single story chapter details
    if (chapterId) {
      const chaptersFound = await db.select().from(storyChapters).where(eq(storyChapters.id, chapterId));
      if (chaptersFound.length === 0) {
        return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      }
      const chapter = chaptersFound[0];

      let isCompleted = false;
      let userScore = null;
      if (studentId) {
        const pr = await db
          .select()
          .from(studentCurriculumProgress)
          .where(and(eq(studentCurriculumProgress.studentId, studentId), eq(studentCurriculumProgress.chapterId, chapterId)));
        if (pr.length > 0) {
          isCompleted = pr[0].isCompleted;
          userScore = pr[0].score;
        }
      }

      return NextResponse.json({
        success: true,
        chapter: {
          ...chapter,
          isCompleted,
          userScore,
        },
      });
    }

    // 3. Fetch specific grade tree (Units 1-6 + Reviews + Story Chapters)
    if (gradeCodeOrId) {
      let gradesFound = await db.select().from(curriculumGrades).where(eq(curriculumGrades.code, gradeCodeOrId));
      if (gradesFound.length === 0) {
        gradesFound = await db.select().from(curriculumGrades).where(eq(curriculumGrades.id, gradeCodeOrId));
      }
      if (gradesFound.length === 0) {
        return NextResponse.json({ error: "Grade not found" }, { status: 404 });
      }
      const grade = gradesFound[0];

      // Fetch units & reviews
      const unitsList = await db
        .select()
        .from(curriculumUnits)
        .where(eq(curriculumUnits.gradeId, grade.id))
        .orderBy(asc(curriculumUnits.orderIndex));

      // Fetch sections for all units
      const allSections = await db
        .select()
        .from(curriculumSections)
        .where(eq(curriculumSections.gradeId, grade.id))
        .orderBy(asc(curriculumSections.orderIndex));

      // Fetch story chapters
      const chaptersList = await db
        .select()
        .from(storyChapters)
        .where(eq(storyChapters.gradeId, grade.id))
        .orderBy(asc(storyChapters.orderIndex));

      // Fetch student progress for whole grade
      let completedSectionIds = new Set<string>();
      let completedChapterIds = new Set<string>();

      if (studentId) {
        const allProgress = await db
          .select()
          .from(studentCurriculumProgress)
          .where(and(eq(studentCurriculumProgress.studentId, studentId), eq(studentCurriculumProgress.gradeId, grade.id)));

        for (const p of allProgress) {
          if (p.isCompleted) {
            if (p.sectionId) completedSectionIds.add(p.sectionId);
            if (p.chapterId) completedChapterIds.add(p.chapterId);
          }
        }
      }

      // Group sections into units with completion counts
      const unitsWithSections = unitsList.map((u) => {
        const uSections = allSections.filter((s) => s.unitId === u.id);
        const completedCount = uSections.filter((s) => completedSectionIds.has(s.id)).length;
        const totalCount = uSections.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return {
          ...u,
          sectionsCount: totalCount,
          completedSectionsCount: completedCount,
          progressPercentage,
          sections: uSections.map((s) => ({
            id: s.id,
            sectionType: s.sectionType,
            titleAr: s.titleAr,
            titleEn: s.titleEn,
            videoDuration: s.videoDuration,
            hasVideo: Boolean(s.videoUrl),
            hasPdf: Boolean(s.pdfUrl),
            isCompleted: completedSectionIds.has(s.id),
          })),
        };
      });

      // Chapters with completion
      const chaptersWithProgress = chaptersList.map((ch) => ({
        ...ch,
        isCompleted: completedChapterIds.has(ch.id),
      }));

      // Calculate total overall curriculum progress
      const totalItems = allSections.length + chaptersList.length;
      const completedItems = completedSectionIds.size + completedChapterIds.size;
      const overallProgressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return NextResponse.json({
        success: true,
        grade,
        mainCurriculum: {
          units: unitsWithSections,
          totalUnits: unitsWithSections.filter((u) => u.type === "unit").length,
          totalReviews: unitsWithSections.filter((u) => u.type === "review").length,
        },
        storyCorner: {
          storyTitleAr: grade.storyTitleAr,
          storyTitleEn: grade.storyTitleEn,
          storyAuthor: grade.storyAuthor,
          storyDescriptionAr: grade.storyDescriptionAr,
          storyDescriptionEn: grade.storyDescriptionEn,
          storyCover: grade.storyCover,
          chapters: chaptersWithProgress,
          totalChapters: chaptersList.length,
          completedChapters: completedChapterIds.size,
        },
        progress: {
          totalTrackableItems: totalItems,
          completedItems,
          overallPercentage: overallProgressPercentage,
        },
      });
    }

    // 4. Default: Fetch list of all grades with summary metadata
    const allGrades = await db
      .select()
      .from(curriculumGrades)
      .orderBy(asc(curriculumGrades.orderIndex));

    const gradesWithMeta = await Promise.all(
      allGrades.map(async (g) => {
        const unitRows = await db.select({ id: curriculumUnits.id, type: curriculumUnits.type }).from(curriculumUnits).where(eq(curriculumUnits.gradeId, g.id));
        const chapterRows = await db.select({ id: storyChapters.id }).from(storyChapters).where(eq(storyChapters.gradeId, g.id));

        return {
          ...g,
          unitsCount: unitRows.filter((u) => u.type === "unit").length,
          reviewsCount: unitRows.filter((u) => u.type === "review").length,
          chaptersCount: chapterRows.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      grades: gradesWithMeta,
    });
  } catch (error) {
    console.error("Curriculum GET Error:", error);
    return NextResponse.json({ error: "Failed to load curriculum data." }, { status: 500 });
  }
}

// =========================================================================
// POST: Actions for Progress Tracking & Admin Management
// =========================================================================
export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const body = await req.json();
    const action = String(body.action || "").trim().toLowerCase();

    // ---------------------------------------------------------------------
    // STUDENT ACTION: Toggle Progress / Mark Completed
    // ---------------------------------------------------------------------
    if (action === "toggle_progress") {
      const { studentId, gradeId, unitId, sectionId, chapterId, itemType, isCompleted, score, maxScore } = body;
      if (!studentId || !gradeId || (!sectionId && !chapterId)) {
        return NextResponse.json({ error: "Missing required progress fields." }, { status: 400 });
      }

      const percentage = score !== undefined && maxScore ? Math.round((score / maxScore) * 100) : null;
      const progressId = `prog_${studentId}_${sectionId || chapterId}`;

      const existing = await db
        .select()
        .from(studentCurriculumProgress)
        .where(
          and(
            eq(studentCurriculumProgress.studentId, studentId),
            sectionId
              ? eq(studentCurriculumProgress.sectionId, sectionId)
              : eq(studentCurriculumProgress.chapterId, chapterId!)
          )
        );

      if (existing.length > 0) {
        await db
          .update(studentCurriculumProgress)
          .set({
            isCompleted: isCompleted ?? true,
            score: score ?? existing[0].score,
            maxScore: maxScore ?? existing[0].maxScore,
            percentage: percentage ?? existing[0].percentage,
            completedAt: isCompleted ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(studentCurriculumProgress.id, existing[0].id));
      } else {
        await db.insert(studentCurriculumProgress).values({
          id: progressId,
          studentId,
          gradeId,
          unitId: unitId || null,
          sectionId: sectionId || null,
          chapterId: chapterId || null,
          itemType: itemType || (sectionId ? "section" : "chapter"),
          isCompleted: isCompleted ?? true,
          score: score || null,
          maxScore: maxScore || null,
          percentage: percentage || null,
          completedAt: isCompleted !== false ? new Date() : null,
        });
      }

      return NextResponse.json({ success: true, progressId, isCompleted: isCompleted ?? true });
    }

    // ---------------------------------------------------------------------
    // ADMIN / TEACHER PRIVILEGED ACTIONS
    // ---------------------------------------------------------------------
    const { user, denied } = await requireRoles(req, ["admin", "teacher"]);
    if (denied) return denied;

    // 1. Create or Update Grade
    if (action === "save_grade") {
      const { id, code, titleAr, titleEn, stage, storyTitleAr, storyTitleEn, storyAuthor, storyDescriptionAr, storyDescriptionEn, storyCover, courseId, orderIndex, isActive } = body;
      if (!titleAr || !titleEn || !stage) {
        return NextResponse.json({ error: "Title and stage are required." }, { status: 400 });
      }

      const gradeId = id || `grade_${code || Date.now()}`;
      const gradeCode = code || `track_${Date.now()}`;

      const existing = id ? await db.select().from(curriculumGrades).where(eq(curriculumGrades.id, id)) : [];
      if (existing.length > 0) {
        await db
          .update(curriculumGrades)
          .set({
            titleAr,
            titleEn,
            stage,
            storyTitleAr: storyTitleAr || null,
            storyTitleEn: storyTitleEn || null,
            storyAuthor: storyAuthor || null,
            storyDescriptionAr: storyDescriptionAr || null,
            storyDescriptionEn: storyDescriptionEn || null,
            storyCover: storyCover || null,
            courseId: courseId || null,
            orderIndex: orderIndex || 1,
            isActive: isActive ?? true,
          })
          .where(eq(curriculumGrades.id, id));
        return NextResponse.json({ success: true, gradeId: id, updated: true });
      } else {
        await db.insert(curriculumGrades).values({
          id: gradeId,
          code: gradeCode,
          titleAr,
          titleEn,
          stage,
          storyTitleAr: storyTitleAr || null,
          storyTitleEn: storyTitleEn || null,
          storyAuthor: storyAuthor || null,
          storyDescriptionAr: storyDescriptionAr || null,
          storyDescriptionEn: storyDescriptionEn || null,
          storyCover: storyCover || null,
          courseId: courseId || null,
          orderIndex: orderIndex || 1,
          isActive: isActive ?? true,
        });
        return NextResponse.json({ success: true, gradeId, created: true });
      }
    }

    // 1.5. Full 2026/2027 Egyptian Curriculum Sync
    if (action === "sync_curriculum_2026") {
      const stats = await syncCurriculum2026();
      return NextResponse.json({
        success: true,
        message: "تمت مزامنة المناهج المصرية الرسمية 2026/2027 بنجاح لجميع الصفوف الدراسية.",
        stats,
      });
    }

    // 2. Auto-Generate 6 Units + 2 Reviews for a Grade using official 2026/2027 Syllabus
    if (action === "auto_generate_units") {
      const { gradeId } = body;
      if (!gradeId) return NextResponse.json({ error: "gradeId is required." }, { status: 400 });

      const grades = await db.select().from(curriculumGrades).where(eq(curriculumGrades.id, gradeId));
      if (grades.length === 0) return NextResponse.json({ error: "Grade not found." }, { status: 404 });
      const grade = grades[0];

      // Retrieve official 2026/2027 specification for this grade
      const specUnits = getCurriculumUnits(grade.code);
      const structurePlan = specUnits.map((u) => ({
        unitNumber: u.unitNumber,
        type: u.type,
        titleAr: u.titleAr,
        titleEn: u.titleEn,
        reviewScope: u.reviewScope || null,
        descriptionAr: u.descriptionAr || "",
        descriptionEn: u.descriptionEn || "",
        orderIndex: u.orderIndex,
      }));

      for (const item of structurePlan) {
        const uId = `unit_${grade.code}_${item.type === "review" ? `rev_${item.orderIndex}` : `u${item.unitNumber}`}`;
        const existingUnit = await db.select().from(curriculumUnits).where(eq(curriculumUnits.id, uId));

        if (existingUnit.length === 0) {
          await db.insert(curriculumUnits).values({
            id: uId,
            gradeId: grade.id,
            unitNumber: item.unitNumber,
            type: item.type,
            titleAr: item.titleAr,
            titleEn: item.titleEn,
            reviewScope: item.reviewScope || null,
            orderIndex: item.orderIndex,
            isPublished: true,
          });

          // Generate default 3 sections for Units
          if (item.type === "unit") {
            const defaultSections = [
              { type: "vocabulary", titleAr: "الكلمات والمفردات اللغوية (Vocabulary)", titleEn: "Vocabulary & Language Notes", order: 1 },
              { type: "grammar", titleAr: "شرح القواعد اللغوية (Grammar Rules)", titleEn: "Grammar & Structural Mastery", order: 2 },
              { type: "writing", titleAr: "مهارات الكتابة والتعبير (Writing Skills)", titleEn: "Writing Skills & Guided Practice", order: 3 },
            ];
            for (const ds of defaultSections) {
              await db.insert(curriculumSections).values({
                id: `sec_${uId}_${ds.type}`,
                unitId: uId,
                gradeId: grade.id,
                sectionType: ds.type,
                titleAr: ds.titleAr,
                titleEn: ds.titleEn,
                orderIndex: ds.order,
                contentData: {},
                isPublished: true,
              });
            }
          } else {
            // Generate review sections
            await db.insert(curriculumSections).values({
              id: `sec_${uId}_mixed`,
              unitId: uId,
              gradeId: grade.id,
              sectionType: "mixed_review",
              titleAr: "المراجعة المجمعة والتدريبات",
              titleEn: "Consolidated Revision & Drills",
              orderIndex: 1,
              contentData: {},
              isPublished: true,
            });
            await db.insert(curriculumSections).values({
              id: `sec_${uId}_exam`,
              unitId: uId,
              gradeId: grade.id,
              sectionType: "comprehensive_test",
              titleAr: "الامتحان الشامل",
              titleEn: "Comprehensive Exam",
              orderIndex: 2,
              contentData: { durationMinutes: 45, totalPoints: 100 },
              isPublished: true,
            });
          }
        }
      }

      return NextResponse.json({ success: true, message: "Units and Reviews generated successfully." });
    }

    // 3. Save / Update Section (Vocab, Grammar, Writing)
    if (action === "save_section") {
      const { id, unitId, gradeId, sectionType, titleAr, titleEn, videoUrl, videoDuration, pdfUrl, pdfTitle, contentData, quizId, orderIndex, isPublished } = body;
      if (!unitId || !sectionType || !titleAr) {
        return NextResponse.json({ error: "Missing required section fields." }, { status: 400 });
      }

      const secId = id || `sec_${unitId}_${sectionType}_${Date.now()}`;
      const existing = id ? await db.select().from(curriculumSections).where(eq(curriculumSections.id, id)) : [];

      if (existing.length > 0) {
        await db
          .update(curriculumSections)
          .set({
            titleAr,
            titleEn: titleEn || titleAr,
            videoUrl: videoUrl || null,
            videoDuration: videoDuration || "25 mins",
            pdfUrl: pdfUrl || null,
            pdfTitle: pdfTitle || null,
            contentData: contentData || {},
            quizId: quizId || null,
            orderIndex: orderIndex || 1,
            isPublished: isPublished ?? true,
            updatedAt: new Date(),
          })
          .where(eq(curriculumSections.id, id));
        return NextResponse.json({ success: true, sectionId: id, updated: true });
      } else {
        await db.insert(curriculumSections).values({
          id: secId,
          unitId,
          gradeId,
          sectionType,
          titleAr,
          titleEn: titleEn || titleAr,
          videoUrl: videoUrl || null,
          videoDuration: videoDuration || "25 mins",
          pdfUrl: pdfUrl || null,
          pdfTitle: pdfTitle || null,
          contentData: contentData || {},
          quizId: quizId || null,
          orderIndex: orderIndex || 1,
          isPublished: isPublished ?? true,
        });
        return NextResponse.json({ success: true, sectionId: secId, created: true });
      }
    }

    // 4. Save / Update Story Chapter
    if (action === "save_story_chapter") {
      const { id, gradeId, chapterNumber, titleAr, titleEn, explanation, videoUrl, pdfUrl, vocabulary, characters, events, importantQuotes, questionsAndAnswers, mcqQuestions, chapterTestQuizId, orderIndex, isPublished } = body;
      if (!gradeId || !chapterNumber || !titleAr) {
        return NextResponse.json({ error: "Missing required chapter fields." }, { status: 400 });
      }

      const chapId = id || `sc_${gradeId}_ch_${chapterNumber}_${Date.now()}`;
      const existing = id ? await db.select().from(storyChapters).where(eq(storyChapters.id, id)) : [];

      if (existing.length > 0) {
        await db
          .update(storyChapters)
          .set({
            chapterNumber,
            titleAr,
            titleEn: titleEn || titleAr,
            explanation: explanation || "",
            videoUrl: videoUrl || null,
            pdfUrl: pdfUrl || null,
            vocabulary: vocabulary || [],
            characters: characters || [],
            events: events || [],
            importantQuotes: importantQuotes || [],
            questionsAndAnswers: questionsAndAnswers || [],
            mcqQuestions: mcqQuestions || [],
            chapterTestQuizId: chapterTestQuizId || null,
            orderIndex: orderIndex || chapterNumber,
            isPublished: isPublished ?? true,
          })
          .where(eq(storyChapters.id, id));
        return NextResponse.json({ success: true, chapterId: id, updated: true });
      } else {
        await db.insert(storyChapters).values({
          id: chapId,
          gradeId,
          chapterNumber,
          titleAr,
          titleEn: titleEn || titleAr,
          explanation: explanation || "",
          videoUrl: videoUrl || null,
          pdfUrl: pdfUrl || null,
          vocabulary: vocabulary || [],
          characters: characters || [],
          events: events || [],
          importantQuotes: importantQuotes || [],
          questionsAndAnswers: questionsAndAnswers || [],
          mcqQuestions: mcqQuestions || [],
          chapterTestQuizId: chapterTestQuizId || null,
          orderIndex: orderIndex || chapterNumber,
          isPublished: isPublished ?? true,
        });
        return NextResponse.json({ success: true, chapterId: chapId, created: true });
      }
    }

    // 5. Delete Story Chapter
    if (action === "delete_story_chapter") {
      const { chapterId } = body;
      if (!chapterId) return NextResponse.json({ error: "chapterId required." }, { status: 400 });
      await db.delete(storyChapters).where(eq(storyChapters.id, chapterId));
      return NextResponse.json({ success: true, deleted: chapterId });
    }

    // 6. Delete Unit
    if (action === "delete_unit") {
      const { unitId } = body;
      if (!unitId) return NextResponse.json({ error: "unitId required." }, { status: 400 });
      await db.delete(curriculumUnits).where(eq(curriculumUnits.id, unitId));
      return NextResponse.json({ success: true, deleted: unitId });
    }

    return NextResponse.json({ error: "Unrecognized action." }, { status: 400 });
  } catch (error) {
    console.error("Curriculum POST Error:", error);
    return NextResponse.json({ error: "Curriculum operation failed." }, { status: 500 });
  }
}
