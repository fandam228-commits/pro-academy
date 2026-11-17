import { db } from "./index";
import {
  curriculumGrades,
  curriculumUnits,
  curriculumSections,
  quizzes,
  questions,
  questionBank,
  storyChapters,
  notifications,
} from "./schema";
import { eq } from "drizzle-orm";

import unit1Data from "../data/secondary-2027/sec2-bac-unit1-extracted.json";
import unit2Data from "../data/secondary-2027/sec2-bac-unit2-extracted.json";
import reviewAData from "../data/secondary-2027/sec2-bac-review-a-extracted.json";
import unit3Data from "../data/secondary-2027/sec2-bac-unit3-extracted.json";
import unit4Data from "../data/secondary-2027/sec2-bac-unit4-extracted.json";
import reviewBData from "../data/secondary-2027/sec2-bac-review-b-extracted.json";
import unit5Data from "../data/secondary-2027/sec2-bac-unit5-extracted.json";
import novelData from "../data/secondary-2027/sec2-bac-novel-the-lost-world.json";

export async function seedSec2BacComplete() {
  console.log("==================================================================");
  console.log("Seeding COMPLETE Second Year Baccalaureate Curriculum (Giants 2027)");
  console.log("==================================================================");

  try {
    const gradeId = "grade_sec_2_bac";

    // 1. Ensure Grade
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
          "منهج البكالوريا المصرية المعتمد 2026/2027: 5 وحدات دراسية، مراجعتان توطيديتان، ورواية العالم المفقود لآرثر كونان دويل.",
        descriptionEn:
          "Official 2026/2027 Egyptian Baccalaureate Syllabus: 5 Units, 2 Consolidation Reviews, and Arthur Conan Doyle\'s The Lost World.",
        storyTitleAr: "العالم المفقود",
        storyTitleEn: "The Lost World",
        storyAuthor: "Sir Arthur Conan Doyle",
        courseId: "crs_sec_2_bac",
        orderIndex: 7,
        isActive: true,
      });
      console.log("✓ Grade ensured: grade_sec_2_bac");
    }

    // 2. Units to Seed
    const unitsToSeed = [
      {
        id: "cu_sec_2_bac_u1",
        unitNumber: 1,
        type: "unit" as const,
        titleAr: "الوحدة الأولى: العيش بشكل جيد في عالم معقد (Living Well in a Complex World)",
        titleEn: "Unit 1: Living Well in a Complex World",
        descriptionAr: "المفهوم الأساسي: الرفاهية وجودة الحياة (Well-being). دراسة العادات الصحية، إدارة الضغوط، والتراكيب المتقدمة.",
        descriptionEn: "Concept: Well-being. Healthy living, stress management, mental-physical balance, and advanced structures.",
        orderIndex: 1,
      },
      {
        id: "cu_sec_2_bac_u2",
        unitNumber: 2,
        type: "unit" as const,
        titleAr: "الوحدة الثانية: وقت الفراغ والتوازن الرقمي (Leisure Time)",
        titleEn: "Unit 2: Leisure Time",
        descriptionAr: "المفهوم الأساسي: الأنشطة الحياتية والتوازن (Lifelong Activity). الرياضة، وقت الشاشات، والهوايات الإبداعية وقواعد أشكال المصدر والـ Gerund.",
        descriptionEn: "Concept: Lifelong Activity. Recreation, screen time, healthy balance, and verb patterns (gerunds vs infinitives).",
        orderIndex: 2,
      },
      {
        id: "cu_sec_2_bac_reva",
        unitNumber: 2,
        type: "review" as const,
        titleAr: "المراجعة التوطيدية الشاملة (أ) - الوحدتان الأولى والثانية",
        titleEn: "Consolidation Review A (Units 1 & 2)",
        descriptionAr: "مراجعة تقييمية شاملة على المفردات، القواعد، فقرات التعبير عن الرأي، ونموذج اختبار تفاعلي.",
        descriptionEn: "Comprehensive consolidation review covering Units 1 & 2: vocabulary, grammar, and opinion paragraphs.",
        orderIndex: 3,
      },
      {
        id: "cu_sec_2_bac_u3",
        unitNumber: 3,
        type: "unit" as const,
        titleAr: "الوحدة الثالثة: أصداء الماضي والتراث المصري (Echoes of the Past)",
        titleEn: "Unit 3: Echoes of the Past",
        descriptionAr: "المفهوم الأساسي: الهوية والتراث (Identity & Heritage). معبد الكرنك، المتحف المصري الكبير، الأزمنة السردية وعبارات التناقض (Concession).",
        descriptionEn: "Concept: Identity & Heritage. Karnak Temple, GEM, narrative tenses, and clauses of concession.",
        orderIndex: 4,
      },
      {
        id: "cu_sec_2_bac_u4",
        unitNumber: 4,
        type: "unit" as const,
        titleAr: "الوحدة الرابعة: قوة الاختيار والاستهلاك المستدام (The Power of Choice)",
        titleEn: "Unit 4: The Power of Choice",
        descriptionAr: "المفهوم الأساسي: الاستهلاك الرشيد (Sustainable Consumption). الحد من هدر الطعام، قراءة ملصقات الصلاحية، والمضارع التام البسيط والمستمر.",
        descriptionEn: "Concept: Sustainable Consumption. Food waste reduction, label awareness, and present perfect aspects.",
        orderIndex: 5,
      },
      {
        id: "cu_sec_2_bac_revb",
        unitNumber: 4,
        type: "review" as const,
        titleAr: "المراجعة التوطيدية الشاملة (ب) - الوحدتان الثالثة والرابعة",
        titleEn: "Consolidation Review B (Units 3 & 4)",
        descriptionAr: "مراجعة شاملة لتقييم المفردات والقواعد وكتابة التقارير الرسمية والتحليل النقدي.",
        descriptionEn: "Consolidation review covering Units 3 & 4: vocabulary, grammar, formal reports, and critical analysis.",
        orderIndex: 6,
      },
      {
        id: "cu_sec_2_bac_u5",
        unitNumber: 5,
        type: "unit" as const,
        titleAr: "الوحدة الخامسة: الانحباس الحراري ومشاركة الكوكب (The Greenhouse Effect)",
        titleEn: "Unit 5: The Greenhouse Effect",
        descriptionAr: "المفهوم الأساسي: مشاركة الكوكب (Sharing the Planet). التغير المناخي، الطاقة المتجددة، روابط السبب والنتيجة، ومواضع الظروف.",
        descriptionEn: "Concept: Sharing the Planet. Climate resilience, renewable energy, cause-effect linkers, and adverb positions.",
        orderIndex: 7,
      },
    ];

    for (const u of unitsToSeed) {
      const existing = await db
        .select({ id: curriculumUnits.id })
        .from(curriculumUnits)
        .where(eq(curriculumUnits.id, u.id));

      if (!existing.length) {
        await db.insert(curriculumUnits).values({
          id: u.id,
          gradeId,
          unitNumber: u.unitNumber,
          type: u.type,
          titleAr: u.titleAr,
          titleEn: u.titleEn,
          descriptionAr: u.descriptionAr,
          descriptionEn: u.descriptionEn,
          orderIndex: u.orderIndex,
          isPublished: true,
        });
        console.log(`✓ Inserted unit: ${u.id}`);
      }
    }

    // 3. Sections for Unit 2
    const u2Sections = [
      {
        id: "cs_sec2_bac_u2_vocab_l1",
        unitId: "cu_sec_2_bac_u2",
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: وقت الشاشات والشباب (Lesson 1)",
        titleEn: "Vocabulary: Screen Time and Young People (Lesson 1)",
        contentData: {
          lessonNumber: 1,
          coreVocabulary: unit2Data.lessons[0].coreVocabulary,
          buildYourLanguage: unit2Data.lessons[0].buildYourLanguage,
          synonymsAntonyms: unit2Data.lessons[0].synonymsAntonyms,
          wordFamily: unit2Data.lessons[0].wordFamily,
          collocations: unit2Data.lessons[0].collocations,
          languageNotes: unit2Data.lessons[0].languageNotes,
        },
        orderIndex: 1,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u2_vocab_l2",
        unitId: "cu_sec_2_bac_u2",
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: الرياضة والنشاط المستمر (Lesson 2)",
        titleEn: "Vocabulary: Sport & Lifelong Activity (Lesson 2)",
        contentData: {
          lessonNumber: 2,
          coreVocabulary: unit2Data.lessons[1].coreVocabulary,
          buildYourLanguage: unit2Data.lessons[1].buildYourLanguage,
          synonymsAntonyms: unit2Data.lessons[1].synonymsAntonyms,
          collocations: unit2Data.lessons[1].collocations,
          languageNotes: unit2Data.lessons[1].languageNotes,
        },
        orderIndex: 2,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u2_grammar",
        unitId: "cu_sec_2_bac_u2",
        gradeId,
        sectionType: "grammar",
        titleAr: "القواعد والتراكيب: أشكال المصدر والـ Gerund والأفعال متغيرة المعنى",
        titleEn: "Language Structures: Verb Patterns (Gerunds vs Infinitives)",
        contentData: {
          grammarStructures: unit2Data.grammarStructures,
        },
        orderIndex: 3,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u2_skills",
        unitId: "cu_sec_2_bac_u2",
        gradeId,
        sectionType: "writing",
        titleAr: "مهارات الكتابة المتقدمة: فقرة إبداء الرأي واليوميات الشخصية",
        titleEn: "Advanced Writing Skills: Opinion Paragraph & Diary Entry",
        contentData: {
          skills: unit2Data.skills,
        },
        orderIndex: 4,
        isPublished: true,
      },
    ];

    for (const sec of u2Sections) {
      const existing = await db
        .select({ id: curriculumSections.id })
        .from(curriculumSections)
        .where(eq(curriculumSections.id, sec.id));
      if (!existing.length) {
        await db.insert(curriculumSections).values(sec);
        console.log(`✓ Inserted section: ${sec.id}`);
      }
    }

    // 4. Sections for Unit 3
    const u3Sections = [
      {
        id: "cs_sec2_bac_u3_vocab",
        unitId: "cu_sec_2_bac_u3",
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: مواقع الذاكرة والتراث الحضاري المصري",
        titleEn: "Vocabulary: Sites of Memory & Egyptian Heritage",
        contentData: {
          coreVocabulary: unit3Data.lessons[0].coreVocabulary,
          buildYourLanguage: unit3Data.lessons[0].buildYourLanguage,
          synonymsAntonyms: unit3Data.lessons[0].synonymsAntonyms,
          wordFamily: unit3Data.lessons[0].wordFamily,
          collocations: unit3Data.lessons[0].collocations,
          languageNotes: unit3Data.lessons[0].languageNotes,
        },
        orderIndex: 1,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u3_grammar",
        unitId: "cu_sec_2_bac_u3",
        gradeId,
        sectionType: "grammar",
        titleAr: "القواعد والتراكيب: عبارات التناقض والتنازل (Concession Clauses) والأزمنة السردية",
        titleEn: "Language Structures: Clauses of Concession & Narrative Tenses",
        contentData: {
          grammarStructures: unit3Data.grammarStructures,
        },
        orderIndex: 2,
        isPublished: true,
      },
    ];

    for (const sec of u3Sections) {
      const existing = await db
        .select({ id: curriculumSections.id })
        .from(curriculumSections)
        .where(eq(curriculumSections.id, sec.id));
      if (!existing.length) {
        await db.insert(curriculumSections).values(sec);
        console.log(`✓ Inserted section: ${sec.id}`);
      }
    }

    // 5. Sections for Unit 4
    const u4Sections = [
      {
        id: "cs_sec2_bac_u4_vocab",
        unitId: "cu_sec_2_bac_u4",
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: الاستهلاك الرشيد والحد من هدر الطعام",
        titleEn: "Vocabulary: Sustainable Consumption & Food Waste Reduction",
        contentData: {
          coreVocabulary: unit4Data.lessons[0].coreVocabulary,
          buildYourLanguage: unit4Data.lessons[0].buildYourLanguage,
          synonymsAntonyms: unit4Data.lessons[0].synonymsAntonyms,
          wordFamily: unit4Data.lessons[0].wordFamily,
          collocations: unit4Data.lessons[0].collocations,
          languageNotes: unit4Data.lessons[0].languageNotes,
        },
        orderIndex: 1,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u4_grammar",
        unitId: "cu_sec_2_bac_u4",
        gradeId,
        sectionType: "grammar",
        titleAr: "القواعد والتراكيب: المضارع التام البسيط والمستمر (Present Perfect Aspects)",
        titleEn: "Language Structures: Present Perfect Simple & Continuous",
        contentData: {
          grammarStructures: unit4Data.grammarStructures,
        },
        orderIndex: 2,
        isPublished: true,
      },
    ];

    for (const sec of u4Sections) {
      const existing = await db
        .select({ id: curriculumSections.id })
        .from(curriculumSections)
        .where(eq(curriculumSections.id, sec.id));
      if (!existing.length) {
        await db.insert(curriculumSections).values(sec);
        console.log(`✓ Inserted section: ${sec.id}`);
      }
    }

    // 6. Sections for Unit 5
    const u5Sections = [
      {
        id: "cs_sec2_bac_u5_vocab",
        unitId: "cu_sec_2_bac_u5",
        gradeId,
        sectionType: "vocabulary",
        titleAr: "المفردات اللغوية: الاحترار العالمي والغازات الدفيئة والتنوع الحيوي",
        titleEn: "Vocabulary: Climate Resilience, Emissions & Biodiversity",
        contentData: {
          coreVocabulary: unit5Data.lessons[0].coreVocabulary,
          buildYourLanguage: unit5Data.lessons[0].buildYourLanguage,
          synonymsAntonyms: unit5Data.lessons[0].synonymsAntonyms,
          collocations: unit5Data.lessons[0].collocations,
        },
        orderIndex: 1,
        isPublished: true,
      },
      {
        id: "cs_sec2_bac_u5_grammar",
        unitId: "cu_sec_2_bac_u5",
        gradeId,
        sectionType: "grammar",
        titleAr: "القواعد والتراكيب: روابط السبب والنتيجة ومواضع الظروف",
        titleEn: "Language Structures: Cause-Effect Connectors & Adverbs",
        contentData: {
          grammarStructures: unit5Data.grammarStructures,
        },
        orderIndex: 2,
        isPublished: true,
      },
    ];

    for (const sec of u5Sections) {
      const existing = await db
        .select({ id: curriculumSections.id })
        .from(curriculumSections)
        .where(eq(curriculumSections.id, sec.id));
      if (!existing.length) {
        await db.insert(curriculumSections).values(sec);
        console.log(`✓ Inserted section: ${sec.id}`);
      }
    }

    // 7. Seed Story Chapters (The Lost World)
    for (const ch of novelData.chapters) {
      const chId = `story_ch_sec2_bac_${ch.chapterNumber}`;
      const existing = await db
        .select({ id: storyChapters.id })
        .from(storyChapters)
        .where(eq(storyChapters.id, chId));

      if (!existing.length) {
        await db.insert(storyChapters).values({
          id: chId,
          gradeId,
          chapterNumber: ch.chapterNumber,
          titleAr: ch.titleAr,
          titleEn: ch.titleEn,
          explanation: `${ch.summaryAr}\n\n${ch.summaryEn}`,
          vocabulary: ch.keyVocabulary,
          orderIndex: ch.chapterNumber,
          isPublished: true,
        });
        console.log(`✓ Inserted story chapter: ${chId}`);
      }
    }

    // 8. Seed Unit 2 Quiz & Questions
    const u2QuizId = "quiz_sec_2_bac_u2";
    const existingQuiz2 = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.id, u2QuizId));

    if (!existingQuiz2.length) {
      await db.insert(quizzes).values({
        id: u2QuizId,
        title: "امتحان الوحدة الثانية: وقت الفراغ والتوازن الرقمي - Unit 2 Exam",
        durationMinutes: 45,
        passPercentage: 60,
        stage: "Secondary",
        type: "quiz",
        unitId: "cu_sec_2_bac_u2",
        courseId: "crs_sec_2_bac",
      });
      console.log(`✓ Inserted quiz: ${u2QuizId}`);

      let qOrder = 1;
      for (const ex of unit2Data.exercises) {
        await db.insert(questions).values({
          id: `q_sec2_bac_u2_${qOrder}`,
          quizId: u2QuizId,
          type: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          points: 1,
        });

        await db.insert(questionBank).values({
          id: `qb_sec2_bac_u2_${qOrder}`,
          domainCategory: "Grammar",
          stage: "Secondary",
          grade: "Second Secondary",
          curriculum: "Baccalaureate",
          term: "First",
          unit: "Unit 2",
          topic: "Verb Patterns & Digital Leisure",
          questionType: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          difficulty: ex.level.includes("Level 1") ? "Easy" : ex.level.includes("Level 2") ? "Medium" : "Hard",
          points: 10,
        });

        qOrder++;
      }
      console.log(`✓ Seeded ${qOrder - 1} questions for Unit 2.`);
    }

    // 9. Seed Unit 3 Quiz & Questions
    const u3QuizId = "quiz_sec_2_bac_u3";
    const existingQuiz3 = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.id, u3QuizId));

    if (!existingQuiz3.length) {
      await db.insert(quizzes).values({
        id: u3QuizId,
        title: "امتحان الوحدة الثالثة: أصداء الماضي والتراث المصري - Unit 3 Exam",
        durationMinutes: 40,
        passPercentage: 60,
        stage: "Secondary",
        type: "quiz",
        unitId: "cu_sec_2_bac_u3",
        courseId: "crs_sec_2_bac",
      });

      let qOrder = 1;
      for (const ex of unit3Data.exercises) {
        await db.insert(questions).values({
          id: `q_sec2_bac_u3_${qOrder}`,
          quizId: u3QuizId,
          type: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          points: 1,
        });

        await db.insert(questionBank).values({
          id: `qb_sec2_bac_u3_${qOrder}`,
          domainCategory: "Grammar",
          stage: "Secondary",
          grade: "Second Secondary",
          curriculum: "Baccalaureate",
          term: "First",
          unit: "Unit 3",
          topic: "Heritage & Concession Clauses",
          questionType: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          difficulty: ex.level.includes("Level 1") ? "Easy" : ex.level.includes("Level 2") ? "Medium" : "Hard",
          points: 10,
        });
        qOrder++;
      }
      console.log(`✓ Seeded ${qOrder - 1} questions for Unit 3.`);
    }

    // 10. Seed Unit 4 Quiz & Questions
    const u4QuizId = "quiz_sec_2_bac_u4";
    const existingQuiz4 = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.id, u4QuizId));

    if (!existingQuiz4.length) {
      await db.insert(quizzes).values({
        id: u4QuizId,
        title: "امتحان الوحدة الرابعة: قوة الاختيار والاستهلاك المستدام - Unit 4 Exam",
        durationMinutes: 40,
        passPercentage: 60,
        stage: "Secondary",
        type: "quiz",
        unitId: "cu_sec_2_bac_u4",
        courseId: "crs_sec_2_bac",
      });

      let qOrder = 1;
      for (const ex of unit4Data.exercises) {
        await db.insert(questions).values({
          id: `q_sec2_bac_u4_${qOrder}`,
          quizId: u4QuizId,
          type: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          points: 1,
        });

        await db.insert(questionBank).values({
          id: `qb_sec2_bac_u4_${qOrder}`,
          domainCategory: "Grammar",
          stage: "Secondary",
          grade: "Second Secondary",
          curriculum: "Baccalaureate",
          term: "First",
          unit: "Unit 4",
          topic: "Food Waste & Present Perfect",
          questionType: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          difficulty: ex.level.includes("Level 1") ? "Easy" : ex.level.includes("Level 2") ? "Medium" : "Hard",
          points: 10,
        });
        qOrder++;
      }
      console.log(`✓ Seeded ${qOrder - 1} questions for Unit 4.`);
    }

    // 11. Seed Unit 5 Quiz & Questions
    const u5QuizId = "quiz_sec_2_bac_u5";
    const existingQuiz5 = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.id, u5QuizId));

    if (!existingQuiz5.length) {
      await db.insert(quizzes).values({
        id: u5QuizId,
        title: "امتحان الوحدة الخامسة: الانحباس الحراري ومشاركة الكوكب - Unit 5 Exam",
        durationMinutes: 40,
        passPercentage: 60,
        stage: "Secondary",
        type: "quiz",
        unitId: "cu_sec_2_bac_u5",
        courseId: "crs_sec_2_bac",
      });

      let qOrder = 1;
      for (const ex of unit5Data.exercises) {
        await db.insert(questions).values({
          id: `q_sec2_bac_u5_${qOrder}`,
          quizId: u5QuizId,
          type: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          points: 1,
        });

        await db.insert(questionBank).values({
          id: `qb_sec2_bac_u5_${qOrder}`,
          domainCategory: "Grammar",
          stage: "Secondary",
          grade: "Second Secondary",
          curriculum: "Baccalaureate",
          term: "First",
          unit: "Unit 5",
          topic: "Climate Resilience & Adverb Positions",
          questionType: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          difficulty: ex.level.includes("Level 1") ? "Easy" : ex.level.includes("Level 2") ? "Medium" : "Hard",
          points: 10,
        });
        qOrder++;
      }
      console.log(`✓ Seeded ${qOrder - 1} questions for Unit 5.`);
    }

    // 12. Seed Novel Quiz & Questions
    const novelQuizId = "quiz_sec_2_bac_novel";
    const existingNovelQuiz = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.id, novelQuizId));

    if (!existingNovelQuiz.length) {
      await db.insert(quizzes).values({
        id: novelQuizId,
        title: "امتحان قصة العالم المفقود (The Lost World) - Literature Exam",
        durationMinutes: 40,
        passPercentage: 60,
        stage: "Secondary",
        type: "exam",
        courseId: "crs_sec_2_bac",
      });

      let qOrder = 1;
      for (const ex of novelData.interactiveQuestions) {
        await db.insert(questions).values({
          id: `q_sec2_bac_novel_${qOrder}`,
          quizId: novelQuizId,
          type: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          points: 1,
        });

        await db.insert(questionBank).values({
          id: `qb_sec2_bac_novel_${qOrder}`,
          domainCategory: "Reading",
          stage: "Secondary",
          grade: "Second Secondary",
          curriculum: "Baccalaureate",
          term: "First",
          unit: "Literature: The Lost World",
          topic: "Arthur Conan Doyle Novel",
          questionType: "mcq",
          questionText: ex.questionText,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          difficulty: "Medium",
          points: 10,
        });
        qOrder++;
      }
      console.log(`✓ Seeded ${qOrder - 1} questions for The Lost World.`);
    }

    // 13. Broadcast System Announcement
    const notifId = "notif_sec2_bac_giants_2027";
    const existingNotif = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.id, notifId));

    if (!existingNotif.length) {
      await db.insert(notifications).values({
        id: notifId,
        userId: null,
        title: "🎉 تم نشر وتحديث منهج تانية بكالوريا 2026/2027 كاملاً (كتاب العمالقة)",
        message: "تمت إضافة الوحدات من 1 إلى 5 والمراجعات التوطيدية الشاملة A و B ورواية العالم المفقود (The Lost World) بجميع تدريباتها التفاعلية وقواميسها اللغوية.",
        type: "announcement",
        isRead: false,
      });
      console.log("✓ Broadcast update notification created.");
    }

    console.log("==================================================================");
    console.log("✓ SUCCESS: Full 2nd Year Baccalaureate Curriculum successfully seeded!");
    console.log("==================================================================");
  } catch (error) {
    console.error("Error seeding complete 2nd year baccalaureate curriculum:", error);
    throw error;
  }
}
