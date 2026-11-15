import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  translationModules,
  translationLessons,
  translationQuestions,
  translationStudentProgress,
  translationSubmissions,
  users,
} from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const targetStudentId = searchParams.get("studentId") || ctx?.user?.id;

    // Fetch modules
    const modules = await db.select().from(translationModules);
    const lessons = await db.select().from(translationLessons);
    const totalQuestions = await db.select({ id: translationQuestions.id }).from(translationQuestions);

    let studentProgress: any[] = [];
    let studentSubmissions: any[] = [];

    if (targetStudentId) {
      studentProgress = await db
        .select()
        .from(translationStudentProgress)
        .where(eq(translationStudentProgress.studentId, targetStudentId));

      studentSubmissions = await db
        .select()
        .from(translationSubmissions)
        .where(eq(translationSubmissions.studentId, targetStudentId))
        .orderBy(desc(translationSubmissions.createdAt));
    }

    // 1. Overall stats
    const totalAnswered = studentSubmissions.length;
    const gradedSubmissions = studentSubmissions.filter((s) => s.status !== "needs_review");
    const totalScore = gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0);
    const maxPossible = gradedSubmissions.reduce((acc, s) => acc + (s.maxMarks || 1), 0);
    const averageAccuracy = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

    // 2. Accuracy by Module
    const moduleAnalytics = modules.map((m) => {
      const moduleLessons = lessons.filter((l) => l.moduleId === m.id);
      const lessonIds = new Set(moduleLessons.map((l) => l.id));
      const moduleSubs = studentSubmissions.filter((s) => lessonIds.has(s.lessonId));

      const subScores = moduleSubs.reduce((acc, s) => acc + (s.score || 0), 0);
      const subMax = moduleSubs.reduce((acc, s) => acc + (s.maxMarks || 1), 0);
      const acc = subMax > 0 ? Math.round((subScores / subMax) * 100) : 0;

      const completedCount = studentProgress.filter(
        (p) => p.moduleId === m.id && p.completed
      ).length;

      return {
        moduleId: m.id,
        code: m.code,
        titleAr: m.titleAr,
        titleEn: m.titleEn,
        totalLessons: moduleLessons.length,
        completedLessons: completedCount,
        accuracy: acc,
        submissionsCount: moduleSubs.length,
      };
    });

    // 3. Rubric Breakdown Weakness Analysis (Meaning vs Grammar vs Vocab vs Structure vs Mechanics)
    let totalMeaning = 0;
    let totalGrammar = 0;
    let totalVocab = 0;
    let totalStructure = 0;
    let totalMechanics = 0;
    let countWithRubric = 0;

    for (const sub of studentSubmissions) {
      const rb = sub.rubricBreakdown;
      if (rb && typeof rb === "object" && rb.totalPercentage !== undefined) {
        totalMeaning += rb.meaning || 0; // out of 40
        totalGrammar += rb.grammar || 0; // out of 20
        totalVocab += rb.vocab || 0; // out of 20
        totalStructure += rb.structure || 0; // out of 10
        totalMechanics += rb.mechanics || 0; // out of 10
        countWithRubric++;
      }
    }

    const rubricAnalysis = {
      meaningScorePct: countWithRubric > 0 ? Math.round((totalMeaning / (countWithRubric * 40)) * 100) : 100,
      grammarScorePct: countWithRubric > 0 ? Math.round((totalGrammar / (countWithRubric * 20)) * 100) : 100,
      vocabScorePct: countWithRubric > 0 ? Math.round((totalVocab / (countWithRubric * 20)) * 100) : 100,
      structureScorePct: countWithRubric > 0 ? Math.round((totalStructure / (countWithRubric * 10)) * 100) : 100,
      mechanicsScorePct: countWithRubric > 0 ? Math.round((totalMechanics / (countWithRubric * 10)) * 100) : 100,
    };

    // Identified Weakness Highlights
    const weaknesses: string[] = [];
    if (rubricAnalysis.grammarScorePct < 70) {
      weaknesses.push("دقة القواعد والأزمنة (Grammar & Tenses Accuracy)");
    }
    if (rubricAnalysis.vocabScorePct < 70) {
      weaknesses.push("تنوع المفردات والمتلازمات اللفظية (Vocabulary & Collocations)");
    }
    if (rubricAnalysis.structureScorePct < 70) {
      weaknesses.push("بنية وترتيب الجملة الإنجليزية (Sentence Word Order)");
    }
    if (rubricAnalysis.mechanicsScorePct < 70) {
      weaknesses.push("علامات الترقيم وكتابة الحروف الكبيرة (Punctuation & Capitalization)");
    }
    if (rubricAnalysis.meaningScorePct < 70) {
      weaknesses.push("استيفاء ونقل المعنى كاملاً دون حذف (Core Meaning Completeness)");
    }

    // Common Translation Pitfalls
    const commonMistakesInsights = [
      {
        rule: "ترتيب الصفة والموصوف",
        adviceAr: "تذكر دائماً أن الصفة تسبق الاسم في الإنجليزية ولا تجمع أبداً.",
        frequency: "شائع في البدايات",
      },
      {
        rule: "ترجمة 'إنّ' و'لقد'",
        adviceAr: "لا تترجم 'إنّ' بـ That في أول الجملة، وترجم 'لقد + ماضي' بمضارع تام.",
        frequency: "شائع في الامتحانات",
      },
      {
        rule: "البدء بالفاعل في الإنجليزية",
        adviceAr: "الجملة الإنجليزية يجب أن تبدأ بفاعل صريح (Subject) وليس بفعل.",
        frequency: "متكرر في الترجمة من العربية",
      },
      {
        rule: "المتلازمات اللفظية مع measures و progress",
        adviceAr: "نقول take measures ونقول make progress وليس العكس.",
        frequency: "فروق دقيقة",
      },
    ];

    return NextResponse.json({
      success: true,
      summary: {
        totalModules: modules.length,
        totalLessons: lessons.length,
        totalQuestionsInBank: totalQuestions.length,
        studentSubmissionsCount: totalAnswered,
        averageAccuracy,
        completedLessonsCount: studentProgress.filter((p) => p.completed).length,
      },
      rubricAnalysis,
      identifiedWeaknesses: weaknesses,
      moduleAnalytics,
      commonMistakesInsights,
      recentSubmissions: studentSubmissions.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Translation Analytics GET Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load translation analytics" }, { status: 500 });
  }
}
