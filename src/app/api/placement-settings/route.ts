import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { examAttempts, generatedExams, questionBank } from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext, requireRoles } from "@/lib/security";
import { getFirstSecondaryAdminExamQuestions } from "@/db/first-secondary-admin-exams";
import { getPlacementGrade, PLACEMENT_GRADES, type PlacementGrade } from "@/data/placement-grades";
import {
  defaultDifficultyDistribution,
  defaultThresholds,
  ensurePlacementConfigTable,
  getPlacementConfigs,
  savePlacementConfig,
  type PlacementConfig,
} from "@/lib/placement-config";

function validMcq(question: { options?: unknown; correctAnswer?: unknown }) {
  const options = Array.isArray(question.options) ? question.options.map((option) => String(option).trim()) : [];
  const answer = String(question.correctAnswer || "").trim().toLocaleLowerCase();
  return options.length === 4 && new Set(options.map((option) => option.toLocaleLowerCase())).size === 4 &&
    Boolean(answer) && options.some((option) => option.toLocaleLowerCase() === answer);
}

function parseConfig(body: any): PlacementConfig | string {
  const gradeName = String(body?.grade || "");
  const grade = getPlacementGrade(gradeName);
  if (!grade) return "Select one of the six supported school grades.";

  const number = (value: unknown, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const questionCount = number(body.questionCount, 30);
  const durationMinutes = number(body.durationMinutes, 30);
  const marksPerQuestion = number(body.marksPerQuestion, 1);
  const passPercentage = number(body.passPercentage, 60);
  if (!Number.isInteger(questionCount) || questionCount < 8 || questionCount > 100) return "Question count must be between 8 and 100.";
  if (!Number.isInteger(durationMinutes) || durationMinutes < 0 || durationMinutes > 180) return "Duration must be 0 (untimed) or between 1 and 180 minutes.";
  if (!Number.isInteger(marksPerQuestion) || marksPerQuestion < 1 || marksPerQuestion > 100) return "Marks per question must be between 1 and 100.";
  if (!Number.isInteger(passPercentage) || passPercentage < 0 || passPercentage > 100) return "Pass percentage must be between 0 and 100.";

  const thresholds = body.proficiencyThresholds || defaultThresholds();
  const thresholdValues = [thresholds.developing, thresholds.good, thresholds.veryGood, thresholds.excellent].map(Number);
  if (thresholdValues.some((value) => !Number.isInteger(value) || value < 0 || value > 100) ||
      thresholdValues.some((value, index) => index > 0 && value <= thresholdValues[index - 1])) {
    return "Proficiency thresholds must be whole percentages in increasing order.";
  }

  const difficulty = body.difficultyDistribution || defaultDifficultyDistribution();
  const difficultyValues = [difficulty.Easy, difficulty.Medium, difficulty.Hard].map(Number);
  if (difficultyValues.some((value) => !Number.isInteger(value) || value < 0 || value > 100) || difficultyValues.reduce((sum, value) => sum + value, 0) !== 100) {
    return "Difficulty percentages must add up to 100.";
  }

  const topicDistribution = Array.isArray(body.topicDistribution) ? body.topicDistribution : [];
  if (topicDistribution.some((item: any) => !item || typeof item.topic !== "string" || item.topic.length > 120 || !Number.isFinite(Number(item.percent)) || Number(item.percent) < 0 || Number(item.percent) > 100)) {
    return "Topic distribution must contain topic names with percentages from 0 to 100.";
  }
  const topicTotal = topicDistribution.reduce((sum: number, item: any) => sum + Number(item.percent), 0);
  if (topicDistribution.length && Math.round(topicTotal) !== 100) return "Topic percentages must add up to 100.";
  const verificationStatus = body.verificationStatus === "verified" ? "verified" : "needs_review";
  const sourceNote = String(body.sourceNote || "").trim().slice(0, 500);
  if (verificationStatus === "verified" && sourceNote.length < 8) return "Add the curriculum source or review note before marking the assessment verified.";

  return {
    grade: grade.grade,
    stage: grade.stage,
    academicYear: String(body.academicYear || "Needs confirmation").trim().slice(0, 80),
    term: String(body.term || "First").trim().slice(0, 40),
    curriculum: body.curriculum ? String(body.curriculum).trim().slice(0, 100) : null,
    curriculumVersion: String(body.curriculumVersion || "Development sample").trim().slice(0, 120),
    verificationStatus,
    sourceNote,
    questionCount,
    durationMinutes,
    marksPerQuestion,
    passPercentage,
    proficiencyThresholds: {
      developing: Number(thresholds.developing),
      good: Number(thresholds.good),
      veryGood: Number(thresholds.veryGood),
      excellent: Number(thresholds.excellent),
    },
    topicDistribution: topicDistribution.map((item: any) => ({ topic: String(item.topic).trim(), percent: Number(item.percent) })),
    difficultyDistribution: { Easy: Number(difficulty.Easy), Medium: Number(difficulty.Medium), Hard: Number(difficulty.Hard) },
    isPublished: body.isPublished !== false,
  };
}

async function getBankSummary(config: PlacementConfig) {
  const conditions = [
    eq(questionBank.grade, config.grade),
    eq(questionBank.stage, config.stage),
    eq(questionBank.term, config.term),
    eq(questionBank.questionType, "mcq"),
  ];
  if (config.curriculum) conditions.push(eq(questionBank.curriculum, config.curriculum));
  const rows = await db.select({
    id: questionBank.id,
    options: questionBank.options,
    correctAnswer: questionBank.correctAnswer,
    topic: questionBank.topic,
    difficulty: questionBank.difficulty,
  }).from(questionBank).where(and(...conditions)).limit(5000);
  const imported = getFirstSecondaryAdminExamQuestions().filter((question) =>
    question.grade === config.grade && question.stage === config.stage && question.term === config.term &&
    question.questionType === "mcq" && (!config.curriculum || question.curriculum === config.curriculum)
  );
  const unique = new Map<string, { id: string; options: unknown; correctAnswer: unknown; topic: string; difficulty: string }>();
  for (const question of [...rows, ...imported]) {
    if (validMcq(question)) unique.set(question.id, question as any);
  }
  const questions = [...unique.values()];
  const topicCounts = new Map<string, number>();
  const difficultyCounts = new Map<string, number>();
  for (const question of questions) {
    const topic = String(question.topic || "Unclassified");
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    const difficulty = String(question.difficulty || "Medium");
    difficultyCounts.set(difficulty, (difficultyCounts.get(difficulty) || 0) + 1);
  }
  return {
    availableQuestionCount: questions.length,
    topics: [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([topic, count]) => ({ topic, count })),
    difficultyCounts: Object.fromEntries(difficultyCounts),
  };
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  await ensurePlacementConfigTable();
  const search = new URL(req.url).searchParams;

  if (search.get("history") === "1") {
    if (ctx.user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });
    const exams = await db.select().from(generatedExams)
      .where(eq(generatedExams.studentId, ctx.user.id))
      .orderBy(desc(generatedExams.createdAt)).limit(100);
    const placementExams = exams.filter((exam) => (exam.config as any)?.type === "grade-placement");
    if (!placementExams.length) return NextResponse.json({ history: [] }, { headers: { "Cache-Control": "no-store" } });
    const attempts = await db.select().from(examAttempts)
      .where(inArray(examAttempts.examId, placementExams.map((exam) => exam.id)))
      .orderBy(desc(examAttempts.submittedAt));
    const examById = new Map(placementExams.map((exam) => [exam.id, exam]));
    const history = attempts.slice(0, 12).map((attempt) => {
      const exam = examById.get(attempt.examId);
      return {
        attemptId: attempt.id,
        examId: attempt.examId,
        grade: exam?.grade || "",
        academicYear: (exam?.config as any)?.academicYear || "",
        term: (exam?.config as any)?.term || "",
        curriculumVersion: (exam?.config as any)?.curriculumVersion || "",
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        passed: attempt.passed,
        completedAt: attempt.submittedAt,
      };
    });
    return NextResponse.json({ history }, { headers: { "Cache-Control": "no-store" } });
  }

  const isAdmin = ctx.user.role === "admin";
  const configs = await getPlacementConfigs();
  const summaries = await Promise.all(configs.map(async (config) => ({ ...config, ...(await getBankSummary(config)) })));
  return NextResponse.json({
    defaultsAreDevelopmentOnly: true,
    grades: PLACEMENT_GRADES,
    settings: summaries.map((config) => isAdmin ? config : {
      grade: config.grade,
      stage: config.stage,
      academicYear: config.academicYear,
      term: config.term,
      curriculumVersion: config.curriculumVersion,
      verificationStatus: config.verificationStatus,
      questionCount: config.questionCount,
      durationMinutes: config.durationMinutes,
      marksPerQuestion: config.marksPerQuestion,
      passPercentage: config.passPercentage,
      isPublished: config.isPublished,
      availableQuestionCount: config.availableQuestionCount,
      topics: config.topics,
      difficultyCounts: config.difficultyCounts,
    }),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  await ensureDbSetup();
  const { user, denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;

  try {
    const body = await req.json();
    const config = parseConfig(body);
    if (typeof config === "string") return NextResponse.json({ error: config }, { status: 400 });
    await savePlacementConfig(config, user.id);
    return NextResponse.json({ success: true, config }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Placement settings update error:", error);
    return NextResponse.json({ error: "Could not save placement settings." }, { status: 500 });
  }
}
