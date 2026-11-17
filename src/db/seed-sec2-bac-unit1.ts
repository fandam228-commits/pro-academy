import { db } from "./index";
import {
  curriculumGrades,
  curriculumUnits,
  curriculumSections,
  quizzes,
  questions,
  questionBank,
} from "./schema";
import { eq, inArray } from "drizzle-orm";
import unit1Data from "../data/secondary-2027/sec2-bac-unit1-extracted.json";

export async function seedSec2BacUnit1() {
  console.log("Seeding Second Year Baccalaureate Unit 1 from Giants 2027...");

  try {
    // 1. Ensure Grade exists
    const gradeId = "grade_sec_2_bac";
    const existingGrade = await db
      .select({ id: curriculumGrades.id })
      .from(curriculumGrades)
      .where(eq(curriculumGrades.id, gradeId));

    if (!existingGrade.length) {
      await db.insert(curriculumGrades).values({
        id: gradeId,
        code: "sec_2_bac",
        titleAr: "تانية بكالوريا (Second Year Egyptian Baccalaureate)",
        titleEn: "Second Year Egyptian Baccalaureate",
        stage: "Secondary",
        descriptionAr:
          "منهج البكالوريا المصرية المعتمد 2026/2027: 10 وحدات دراسية، 5 مراجعات توطيدية، وقصة العالم المفقود لآرثر كونان دويل.",
        descriptionEn:
          "Official 2026/2027 Egyptian Baccalaureate Syllabus: 10 Units, 5 Consolidation Reviews, and Arthur Conan Doyle's The Lost World.",
        storyTitleAr: "العالم المفقود",
        storyTitleEn: "The Lost World",
        storyAuthor: "Sir Arthur Conan Doyle",
        courseId: "crs_sec_2_bac",
        orderIndex: 7,
        isActive: true,
      });
      console.log("Created grade: grade_sec_2_bac");
    }

    // 2. Ensure Unit 1 exists
    const unitId = "cu_sec_2_bac_u1";
    const existingUnit = await db
      .select({ id: curriculumUnits.id })
      .from(curriculumUnits)
      .where(eq(curriculumUnits.id, unitId));

    if (!existingUnit.length) {
      await db.insert(curriculumUnits).values({
        id: unitId,
        gradeId,
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: العيش بشكل جيد في عالم معقد (Living Well in a Complex World)",
        titleEn: "Unit 1: Living Well in a Complex World",
        descriptionAr:
          "المفهوم الأساسي: الرفاهية وجودة الحياة (Well-being). دراسة العادات الصحية، إدارة الضغوط اليومية، التوازن البدني والنفسي، وتراكيب اللغة المتقدمة.",
        descriptionEn:
          "Concept: Well-being. Healthy living, stress management, mental-physical balance, and structures for lifestyle discourse.",
        orderIndex: 1,
        isPublished: true,
      });
      console.log("Created unit: cu_sec_2_bac_u1");
    }

    // 3. Insert Curriculum Sections for Unit 1
    const sectionsToSeed = [
      {
        id: "cs_sec2_bac_u1_vocab_l1",
        unitId,
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: وسائل التواصل الاجتماعي والصورة الذاتية (Lesson 1)",
        titleEn: "Vocabulary: Social Media and Self-Image (Lesson 1)",
        contentData: {
          lessonNumber: 1,
          coreVocabulary: unit1Data.lessons[0].coreVocabulary,
          buildYourLanguage: unit1Data.lessons[0].buildYourLanguage,
          synonymsAntonyms: unit1Data.lessons[0].synonymsAntonyms,
          wordFamily: unit1Data.lessons[0].wordFamily,
          collocations: unit1Data.lessons[0].collocations,
          languageNotes: (unit1Data.lessons[0] as any).languageNotes || [],
        },
        orderIndex: 1,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u1_vocab_l2",
        unitId,
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: أنماط الحياة المعاصرة والعافية (Lesson 2)",
        titleEn: "Vocabulary: Exploring Modern Lifestyles (Lesson 2)",
        contentData: {
          lessonNumber: 2,
          coreVocabulary: unit1Data.lessons[1].coreVocabulary,
          buildYourLanguage: unit1Data.lessons[1].buildYourLanguage,
          synonymsAntonyms: unit1Data.lessons[1].synonymsAntonyms,
          wordFamily: (unit1Data.lessons[1] as any).wordFamily || [],
          collocations: unit1Data.lessons[1].collocations,
          languageNotes: (unit1Data.lessons[1] as any).languageNotes || [],
        },
        orderIndex: 2,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u1_grammar",
        unitId,
        gradeId,
        sectionType: "grammar",
        titleAr: "القواعد والتراكيب: عبارات الوصل وصيغ الفاعل وحالات الشرط والقلب",
        titleEn: "Language Structures: Relative Clauses, Participles & Conditionals",
        contentData: {
          grammarStructures: unit1Data.grammarStructures,
        },
        orderIndex: 3,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u1_skills",
        unitId,
        gradeId,
        sectionType: "writing",
        titleAr: "مهارات الكتابة المتقدمة: أساليب الإقناع والفقرة التحليلية (JRE)",
        titleEn: "Advanced Writing & Skills: Persuasive Techniques & Analytical Paragraph",
        contentData: {
          lesson1Skills: (unit1Data.lessons[0] as any).interactiveExercises?.skillsWriting || [],
          lesson2Skills: (unit1Data.lessons[1] as any).interactiveExercises?.skillsWriting || [],
        },
        orderIndex: 4,
        isPublished: true,
      },
    ];

    for (const sec of sectionsToSeed) {
      const existing = await db
        .select({ id: curriculumSections.id })
        .from(curriculumSections)
        .where(eq(curriculumSections.id, sec.id));

      if (!existing.length) {
        await db.insert(curriculumSections).values(sec);
        console.log(`Created section: ${sec.id}`);
      } else {
        await db
          .update(curriculumSections)
          .set({ contentData: sec.contentData, updatedAt: new Date() })
          .where(eq(curriculumSections.id, sec.id));
        console.log(`Updated section: ${sec.id}`);
      }
    }

    // 4. Create an Interactive Quiz for Lesson 1
    const l1Mcq = (unit1Data.lessons[0] as any).interactiveExercises?.mcq || [];
    if (l1Mcq.length > 0) {
      const quizL1Id = "quiz_sec2_bac_u1_l1";
      const existingQuizL1 = await db
        .select({ id: quizzes.id })
        .from(quizzes)
        .where(eq(quizzes.id, quizL1Id));

      if (!existingQuizL1.length) {
        await db.insert(quizzes).values({
          id: quizL1Id,
          unitId,
          title: "اختبار المفردات التفاعلي: الدرس الأول (Social Media & Self-Image)",
          stage: "Secondary",
          type: "quiz",
          durationMinutes: 20,
          passPercentage: 70,
          totalPoints: l1Mcq.length * 10,
        });
        console.log(`Created quiz: ${quizL1Id}`);

        const qRows = l1Mcq.map((q: any, idx: number) => ({
          id: `q_sec2_bac_u1_l1_${String(idx + 1).padStart(3, "0")}`,
          quizId: quizL1Id,
          type: "mcq",
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: 10,
        }));

        for (let i = 0; i < qRows.length; i += 25) {
          await db.insert(questions).values(qRows.slice(i, i + 25));
        }
        console.log(`Inserted ${qRows.length} questions for Quiz L1.`);
      }
    }

    // 5. Populate Question Bank
    const qbItems: any[] = [];

    // Add Lesson 1 MCQs
    l1Mcq.forEach((q: any, idx: number) => {
      qbItems.push({
        id: `qb_sec2_bac_u1_l1_${String(idx + 1).padStart(3, "0")}`,
        domainCategory: "Vocabulary",
        questionText: q.questionText,
        questionType: "mcq",
        stage: "Secondary",
        grade: "Second Secondary",
        curriculum: "Baccalaureate",
        term: "First",
        source: "Giants 2027 — Second Secondary Unit 1 Lesson 1",
        unit: "Unit 1",
        lesson: "Lesson 1: Social Media and Self-Image",
        section: "Vocabulary",
        difficulty: idx < 15 ? "Easy" : idx < 35 ? "Medium" : "Hard",
        skill: "Vocabulary & Definitions",
        topic: "Social Reflection & Well-being",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: 10,
      });
    });

    // Add Grammar MCQs
    unit1Data.grammarStructures.forEach((g) => {
      g.exercises.forEach((q, idx) => {
        qbItems.push({
          id: `qb_sec2_bac_u1_${g.id}_${String(idx + 1).padStart(2, "0")}`,
          domainCategory: "Grammar",
          questionText: q.questionText,
          questionType: "mcq",
          stage: "Secondary",
          grade: "Second Secondary",
          curriculum: "Baccalaureate",
          term: "First",
          source: `Giants 2027 — Second Secondary Unit 1 Grammar (${g.titleEn})`,
          unit: "Unit 1",
          lesson: g.titleEn,
          section: "Grammar",
          difficulty: "Medium",
          skill: "Language Structures",
          topic: g.titleAr,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: 10,
        });
      });
    });

    if (qbItems.length > 0) {
      const qbIds = qbItems.map((x) => x.id);
      const existingQb = await db
        .select({ id: questionBank.id })
        .from(questionBank)
        .where(inArray(questionBank.id, qbIds));
      const existingQbSet = new Set(existingQb.map((x) => x.id));
      const missingQb = qbItems.filter((x) => !existingQbSet.has(x.id));

      if (missingQb.length > 0) {
        for (let i = 0; i < missingQb.length; i += 25) {
          await db.insert(questionBank).values(missingQb.slice(i, i + 25));
        }
        console.log(`Inserted ${missingQb.length} questions into Question Bank.`);
      } else {
        console.log("Question Bank already up to date.");
      }
    }

    console.log("Successfully completed seeding Unit 1 of Baccalaureate!");
  } catch (error) {
    console.error("Error seeding Unit 1:", error);
    throw error;
  }
}
