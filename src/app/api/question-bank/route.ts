import { db } from "@/db";
import { questionBank, generatedExams, examAttempts, users } from "@/db/schema";
import { eq, and, sql, ilike, inArray, notInArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";
import { getFirstSecondaryAdminExamQuestions } from "@/db/first-secondary-admin-exams";
import { getThirdPrepProfessionalEnglishQuestions } from "@/db/third-prep-professional-english";
import { getPlacementGrade } from "@/data/placement-grades";
import { getPlacementConfig } from "@/lib/placement-config";

function normalizedAnswerSet(value: unknown): string[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x).trim().toLowerCase()).sort();
  } catch {
    return [];
  }
}

function answersMatch(question: any, studentAnswer: string): boolean {
  if (question.questionType === "multi_select") {
    const expected = normalizedAnswerSet(question.correctAnswer);
    const actual = normalizedAnswerSet(studentAnswer);
    return expected.length > 0 && expected.length === actual.length && expected.every((x, i) => x === actual[i]);
  }
  const normalizeText = (value: unknown) => String(value || "").trim().toLocaleLowerCase().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
  const acceptedAnswers = Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [];
  return [question.correctAnswer, ...acceptedAnswers].some((answer) => normalizeText(answer) === normalizeText(studentAnswer));
}

function getBundledQuestionBankQuestions() {
  return [...getFirstSecondaryAdminExamQuestions(), ...getThirdPrepProfessionalEnglishQuestions()];
}

function isBundledQuestionId(id: string) {
  return id.startsWith("qb_1sec_admin_") || id.startsWith("qb_3prep_professional_");
}

function buildPlacementDiagnostic(exam: any, percentage: number, feedback: Record<string, any>) {
  const topicScores = new Map<string, { correct: number; total: number }>();
  const domainScores = new Map<string, { correct: number; total: number }>();
  for (const item of Object.values(feedback) as any[]) {
    const topic = String(item.topic || "General");
    const stats = topicScores.get(topic) || { correct: 0, total: 0 };
    stats.total += 1;
    if (item.isCorrect) stats.correct += 1;
    topicScores.set(topic, stats);

    const domain = String(item.domainCategory || item.skill || "General");
    const domainStats = domainScores.get(domain) || { correct: 0, total: 0 };
    domainStats.total += 1;
    if (item.isCorrect) domainStats.correct += 1;
    domainScores.set(domain, domainStats);
  }
  const topicResults = [...topicScores.entries()].map(([topic, stats]) => ({
    topic,
    ...stats,
    percentage: Math.round(stats.correct / Math.max(1, stats.total) * 100),
  }));
  const domainResults = [...domainScores.entries()].map(([domain, stats]) => ({
    domain,
    ...stats,
    percentage: Math.round(stats.correct / Math.max(1, stats.total) * 100),
  })).filter((result) => result.domain !== "General");
  const config = exam.config as any;
  const thresholds = config?.proficiencyThresholds || { developing: 40, good: 60, veryGood: 75, excellent: 90 };
  const proficiency = percentage >= Number(thresholds.excellent) ? "Excellent"
    : percentage >= Number(thresholds.veryGood) ? "Very Good"
      : percentage >= Number(thresholds.good) ? "Good"
        : percentage >= Number(thresholds.developing) ? "Developing" : "Needs Foundation";
  return {
    grade: exam.grade,
    academicYear: config?.academicYear || "Needs confirmation",
    isOfficialGrade: false,
    sourceVerification: config?.verificationStatus || "needs_review",
    proficiency,
    domainResults,
    topicResults,
    strengths: topicResults.filter((topic) => topic.percentage >= 75).map((topic) => topic.topic),
    revisionTopics: topicResults.filter((topic) => topic.percentage < 60).map((topic) => topic.topic),
    message: "Diagnostic result only; this is not an official school examination grade.",
  };
}

export async function GET(req: Request) {
  await ensureDbSetup();
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const domainCategory = searchParams.get("domainCategory"); // 'Vocabulary', 'Grammar'
  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");
  const curriculum = searchParams.get("curriculum");
  const term = searchParams.get("term");
  const unit = searchParams.get("unit");
  const questionType = searchParams.get("questionType");
  const difficulty = searchParams.get("difficulty");
  const source = searchParams.get("source");
  const lesson = searchParams.get("lesson");
  const section = searchParams.get("section");
  const grammarTopic = searchParams.get("grammarTopic");
  const topic = searchParams.get("topic");
  const search = searchParams.get("search");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100"), 1), 500);

  try {
    // Apply the complete scope in the database query before LIMIT.
    // This prevents a deep-linked grammar rule from being missed because unrelated
    // questions happened to occupy the first N rows.
    const conditions: any[] = [];
    if (domainCategory) {
      const requestedDomains = domainCategory.split(",").map((d) => d.trim()).filter(Boolean);
      conditions.push(
        requestedDomains.length > 1
          ? inArray(questionBank.domainCategory, requestedDomains)
          : eq(questionBank.domainCategory, requestedDomains[0] || domainCategory)
      );
    }
    if (stage) conditions.push(eq(questionBank.stage, stage));
    if (grade) conditions.push(eq(questionBank.grade, grade));
    if (curriculum) conditions.push(eq(questionBank.curriculum, curriculum));
    if (term) conditions.push(eq(questionBank.term, term));
    if (unit) conditions.push(eq(questionBank.unit, unit));
    if (questionType) conditions.push(eq(questionBank.questionType, questionType));
    if (difficulty) conditions.push(eq(questionBank.difficulty, difficulty));
    if (source) conditions.push(eq(questionBank.source, source));
    if (lesson) conditions.push(eq(questionBank.lesson, lesson));
    if (section) conditions.push(eq(questionBank.section, section));
    if (grammarTopic) conditions.push(eq(questionBank.grammarTopic, grammarTopic));
    if (topic) conditions.push(eq(questionBank.topic, topic));
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(sql`(${questionBank.questionText} ILIKE ${pattern} OR ${questionBank.topic} ILIKE ${pattern})`);
    }

    const databaseQuestions = await db
      .select()
      .from(questionBank)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit);

    // Keep the imported exam questions in the application bundle instead of seeding
    // the shared Preview/Production database with user-provided source material.
    const requestedDomains = domainCategory?.split(",").map((d) => d.trim()).filter(Boolean) || [];
    const importedQuestions = getBundledQuestionBankQuestions().filter((q) => {
      if (domainCategory && !requestedDomains.includes(q.domainCategory)) return false;
      if (stage && q.stage !== stage) return false;
      if (grade && q.grade !== grade) return false;
      if (curriculum && q.curriculum !== curriculum) return false;
      if (term && q.term !== term) return false;
      if (unit && q.unit !== unit) return false;
      if (questionType && q.questionType !== questionType) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      if (source && q.source !== source) return false;
      if (lesson && q.lesson !== lesson) return false;
      if (section && q.section !== section) return false;
      if (topic && q.topic !== topic) return false;
      if (search) {
        const normalizedSearch = search.toLocaleLowerCase();
        if (!q.questionText.toLocaleLowerCase().includes(normalizedSearch) && !q.topic.toLocaleLowerCase().includes(normalizedSearch)) return false;
      }
      return true;
    });
    const questionById = new Map<string, any>();
    for (const question of [...databaseQuestions, ...importedQuestions]) questionById.set(question.id, question);
    const allQuestions = [...questionById.values()].slice(0, limit);

    // Analytics summary
    const totalCount = allQuestions.length;
    const vocabCount = allQuestions.filter((q) => q.domainCategory === "Vocabulary").length;
    const grammarCount = allQuestions.filter((q) => q.domainCategory === "Grammar").length;

    const safeQuestions = (ctx.user.role === "admin" || ctx.user.role === "teacher")
      ? allQuestions
      : allQuestions.map(({ correctAnswer: _correctAnswer, acceptedAnswers: _acceptedAnswers, ...q }) => q);
    return NextResponse.json({
      questions: safeQuestions,
      stats: {
        total: totalCount,
        vocabularyCount: vocabCount,
        grammarCount: grammarCount,
        readingCount: allQuestions.filter((q) => q.domainCategory === "Reading").length,
        translationCount: allQuestions.filter((q) => q.domainCategory === "Translation").length,
      },
    });
  } catch (error) {
    console.error("Question Bank GET error:", error);
    return NextResponse.json({ error: "Failed to fetch question bank" }, { status: 500 });
  }
}

// DUPLICATE DETECTION UTILITY: Checks normalized fuzzy string overlap
function isDuplicateQuestion(newText: string, existingQuestions: { questionText: string }[]): boolean {
  const normNew = newText.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const eq of existingQuestions) {
    const normExisting = eq.questionText.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normNew === normExisting || (normNew.length > 15 && normExisting.includes(normNew))) {
      return true;
    }
  }
  return false;
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const ctx = await getAuthContext(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { action } = body;

    // ---- SECURITY: Bank modifications (add/import/AI authoring) → teachers & admins only
    const teacherActions = ["add_question", "import_questions", "ai_generate_questions"];
    if (teacherActions.includes(action)) {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
    }

    // ---- SECURITY: Exam generation & submission → any logged-in session required
    const studentActions = ["generate_smart_exam", "generate_placement_test", "get_placement_test", "submit_exam"];
    if (studentActions.includes(action)) {
      const { denied } = await requireRoles(req);
      if (denied) return denied;
    }

    // 1. ADD NEW SINGLE QUESTION WITH DUPLICATE DETECTION
    if (action === "add_question") {
      const qData = body.question;
      const existing = await db.select({ questionText: questionBank.questionText }).from(questionBank);

      if (isDuplicateQuestion(qData.questionText, existing)) {
        return NextResponse.json(
          { error: "Duplicate detected! A question with identical or nearly identical text already exists." },
          { status: 400 }
        );
      }

      const qId = `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newQ = {
        id: qId,
        domainCategory: qData.domainCategory || "Grammar",
        questionText: qData.questionText,
        questionType: qData.questionType || "mcq",
        stage: qData.stage || "Secondary",
        grade: qData.grade || "Third Secondary (Baccalaureate)",
        curriculum: qData.curriculum || "Ministry",
        term: qData.term || "First",
        source: qData.source || null,
        tags: qData.tags || [],
        unit: qData.unit || "Unit 1",
        lesson: qData.lesson || "Lesson 1",
        section: qData.section || null,
        difficulty: qData.difficulty || "Medium",
        skill: qData.skill || "Grammar & Context",
        wordType: qData.wordType || null,
        topic: qData.topic || "Grammar Core",
        bloomLevel: qData.bloomLevel || "Understand",
        grammarTopic: qData.grammarTopic || null,
        options: qData.options || [],
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation || "",
        points: qData.points || 10,
      };

      await db.insert(questionBank).values(newQ);
      return NextResponse.json({ success: true, question: newQ });
    }

    // 2. UPDATE / DELETE QUESTIONS
    if (action === "update_question" || action === "delete_question") {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
      const id = String(body.id || "");
      if (!id) return NextResponse.json({ error: "Question id is required" }, { status: 400 });

      const existingRows = await db.select().from(questionBank).where(eq(questionBank.id, id));
      if (existingRows.length === 0) return NextResponse.json({ error: "Question not found" }, { status: 404 });

      if (action === "delete_question") {
        await db.delete(questionBank).where(eq(questionBank.id, id));
        return NextResponse.json({ success: true, deletedId: id });
      }

      const q = body.question || {};
      const patch: any = {};
      const fields = ["domainCategory","questionText","questionType","stage","grade","curriculum","term","unit","lesson","section","difficulty","skill","wordType","topic","bloomLevel","grammarTopic","passageText","audioUrl","options","correctAnswer","explanation","points","source","tags"];
      for (const field of fields) if (q[field] !== undefined) patch[field] = q[field];
      if (!patch.questionText || !patch.correctAnswer) {
        return NextResponse.json({ error: "Question text and correct answer are required." }, { status: 400 });
      }
      await db.update(questionBank).set(patch).where(eq(questionBank.id, id));
      const updated = await db.select().from(questionBank).where(eq(questionBank.id, id));
      return NextResponse.json({ success: true, question: updated[0] });
    }

    // 2. BULK IMPORT (CSV / EXCEL / WORD PARSER SIMULATION)
    if (action === "import_questions") {
      const { items } = body; // Array of question objects
      const existing = await db.select({ questionText: questionBank.questionText }).from(questionBank);
      
      let importedCount = 0;
      let duplicateCount = 0;

      for (const item of items) {
        if (!item.questionText || !item.correctAnswer) continue;

        if (isDuplicateQuestion(item.questionText, existing)) {
          duplicateCount++;
          continue;
        }

        const qId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const qVal = {
          id: qId,
          domainCategory: item.domainCategory || (item.grammarTopic ? "Grammar" : "Vocabulary"),
          questionText: item.questionText,
          questionType: item.questionType || "mcq",
          stage: item.stage || "Secondary",
          grade: item.grade || "Third Secondary (Baccalaureate)",
          curriculum: item.curriculum || "Ministry",
          term: item.term || "First",
          source: item.source || null,
          tags: item.tags || [],
          unit: item.unit || "Unit 1",
          lesson: item.lesson || "Lesson 1",
          section: item.section || null,
          difficulty: item.difficulty || "Medium",
          skill: item.skill || "Language Proficiency",
          wordType: item.wordType || null,
          topic: item.topic || "General Practice",
          bloomLevel: item.bloomLevel || "Understand",
          grammarTopic: item.grammarTopic || null,
          options: item.options || [],
          correctAnswer: item.correctAnswer,
          explanation: item.explanation || "Imported question",
          points: item.points || 10,
        };

        await db.insert(questionBank).values(qVal);
        existing.push({ questionText: item.questionText });
        importedCount++;
      }

      return NextResponse.json({
        success: true,
        importedCount,
        duplicateCount,
        message: `Successfully imported ${importedCount} unique questions. Skipped ${duplicateCount} duplicates.`,
      });
    }

    // 3. AI QUESTION GENERATOR WITH DUPLICATE CHECK
    if (action === "ai_generate_questions") {
      const { domain, stage, grade, topic, grammarTopic, difficulty, count } = body;
      const existing = await db.select({ questionText: questionBank.questionText }).from(questionBank);

      const targetCount = parseInt(count) || 3;
      const generated: any[] = [];

      for (let i = 0; i < targetCount; i++) {
        let qText = "";
        let opts: string[] = [];
        let correct = "";
        let exp = "";

        if (domain === "Grammar") {
          const gTopic = grammarTopic || "Conditionals";
          qText = `AI Sample (${gTopic} - ${difficulty} #${i + 1}): If the student ______ the revision notes yesterday, he would have answered all questions correctly.`;
          opts = ["had read", "has read", "reads", "will read"];
          correct = "had read";
          exp = "3rd Conditional requires 'If + Past Perfect (had + V3)' when referring to unfulfilled past conditions.";
        } else {
          qText = `AI Vocabulary Practice (${topic || "Academic"} #${i + 1}): The professor highlighted the ______ need for rigorous experimental verification.`;
          opts = ["paramount", "pessimistic", "profound", "passive"];
          correct = "paramount";
          exp = "'Paramount' means more important than anything else; supreme.";
        }

        if (isDuplicateQuestion(qText, existing)) {
          continue;
        }

        const qObj = {
          id: `ai_qb_${Date.now()}_${i}`,
          domainCategory: domain || "Grammar",
          questionText: qText,
          questionType: "mcq",
          stage: stage || "Secondary",
          grade: grade || "Third Secondary (Baccalaureate)",
          curriculum: body.curriculum || "Ministry",
          term: body.term || "First",
          source: body.source || "AI Generated",
          tags: body.tags || [],
          unit: "Unit 1",
          lesson: body.lesson || "Lesson 1",
          section: body.section || null,
          difficulty: difficulty || "Medium",
          skill: domain === "Grammar" ? "Grammar & Structure" : "Vocabulary & Context",
          wordType: domain === "Vocabulary" ? "Adjective" : null,
          topic: topic || "AI Generated Drills",
          bloomLevel: "Apply",
          grammarTopic: domain === "Grammar" ? grammarTopic || "Conditionals" : null,
          options: opts,
          correctAnswer: correct,
          explanation: exp,
          points: 10,
        };

        await db.insert(questionBank).values(qObj);
        existing.push({ questionText: qText });
        generated.push(qObj);
      }

      return NextResponse.json({
        success: true,
        generatedQuestions: generated,
        count: generated.length,
      });
    }

    // 4. GRADE-SPECIFIC PLACEMENT ASSESSMENT
    if (action === "generate_placement_test") {
      if (ctx.user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });
      const gradeName = String(body.grade || "");
      const grade = getPlacementGrade(gradeName);
      if (!grade) return NextResponse.json({ error: "Select one of the six supported school grades." }, { status: 400 });
      const config = await getPlacementConfig(grade.grade);
      if (!config || !config.isPublished) return NextResponse.json({ error: "This placement assessment is not published yet." }, { status: 404 });

      const scope = [
        eq(questionBank.grade, grade.grade),
        eq(questionBank.stage, grade.stage),
        eq(questionBank.term, config.term),
        eq(questionBank.questionType, "mcq"),
      ];
      if (config.curriculum) scope.push(eq(questionBank.curriculum, config.curriculum));
      const databaseCandidates = await db.select().from(questionBank).where(and(...scope));
      const candidatesById = new Map<string, any>();
      for (const question of databaseCandidates) candidatesById.set(question.id, question);
      for (const question of getBundledQuestionBankQuestions()) {
        if (question.grade === grade.grade && question.stage === grade.stage && question.term === config.term &&
            question.questionType === "mcq" && (!config.curriculum || question.curriculum === config.curriculum)) {
          candidatesById.set(question.id, question);
        }
      }
      const candidates = [...candidatesById.values()].filter((question) => {
        const options = Array.isArray(question.options) ? question.options.map((option: unknown) => String(option).trim()) : [];
        const correctAnswer = String(question.correctAnswer || "").trim().toLocaleLowerCase();
        return options.length === 4 && new Set(options.map((option: string) => option.toLocaleLowerCase())).size === 4 &&
          Boolean(correctAnswer) && options.some((option: string) => option.toLocaleLowerCase() === correctAnswer);
      });
      if (candidates.length < config.questionCount) {
        return NextResponse.json({
          error: `This grade has ${candidates.length} valid four-option questions, but the current assessment needs ${config.questionCount}. Ask an administrator to add or verify questions, or adjust the development settings.`,
          availableQuestionCount: candidates.length,
          requiredQuestionCount: config.questionCount,
        }, { status: 409 });
      }

      const shuffle = <T,>(items: T[]) => {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
      };
      const selected: any[] = [];
      const selectedIds = new Set<string>();
      const push = (question: any) => {
        if (selected.length >= config.questionCount || selectedIds.has(question.id)) return;
        selectedIds.add(question.id);
        selected.push({
          ...question,
          type: question.type || question.questionType,
          options: shuffle(question.options.map((option: unknown) => String(option))),
          points: config.marksPerQuestion,
        });
      };

      const topicTargets = config.topicDistribution;
      if (topicTargets.length > 0) {
        for (const target of topicTargets) {
          const count = Math.round(config.questionCount * target.percent / 100);
          const topicPool = shuffle(candidates.filter((question) => String(question.topic || "") === target.topic));
          for (const question of topicPool.slice(0, count)) push(question);
        }
      }

      for (const difficulty of ["Easy", "Medium", "Hard"]) {
        const targetPercent = config.difficultyDistribution[difficulty as keyof typeof config.difficultyDistribution] || 0;
        const targetCount = Math.round(config.questionCount * targetPercent / 100);
        const alreadySelected = selected.filter((question) => question.difficulty === difficulty).length;
        const need = Math.max(0, targetCount - alreadySelected);
        const pool = shuffle(candidates.filter((question) => question.difficulty === difficulty && !selectedIds.has(question.id)));
        for (const question of pool.slice(0, need)) push(question);
      }
      for (const question of shuffle(candidates)) push(question);

      for (const question of selected) {
        if (!isBundledQuestionId(String(question.id))) {
          await db.update(questionBank).set({ timesUsed: (question.timesUsed || 0) + 1, lastUsedAt: new Date() }).where(eq(questionBank.id, question.id));
        }
      }

      const examId = `placement_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const assessmentConfig = {
        type: "grade-placement",
        academicYear: config.academicYear,
        term: config.term,
        curriculum: config.curriculum,
        curriculumVersion: config.curriculumVersion,
        verificationStatus: config.verificationStatus,
        sourceNote: config.sourceNote,
        questionCount: config.questionCount,
        marksPerQuestion: config.marksPerQuestion,
        passPercentage: config.passPercentage,
        proficiencyThresholds: config.proficiencyThresholds,
        topicDistribution: config.topicDistribution,
        difficultyDistribution: config.difficultyDistribution,
      };
      const exam = {
        id: examId,
        studentId: ctx.user.id,
        title: `Placement Assessment: ${grade.en} (${config.questionCount} Questions)`,
        stage: grade.stage,
        grade: grade.grade,
        config: assessmentConfig,
        questionIds: selected.map((question) => question.id),
        questionsData: selected,
        totalPoints: config.questionCount * config.marksPerQuestion,
        durationMinutes: config.durationMinutes,
      };
      await db.insert(generatedExams).values(exam);
      const safeExam = {
        ...exam,
        questionsData: selected.map(({ correctAnswer: _correctAnswer, acceptedAnswers: _acceptedAnswers, ...question }) => question),
      };
      return NextResponse.json({ success: true, exam: safeExam }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "get_placement_test") {
      if (ctx.user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });
      const examId = String(body.examId || "");
      const exams = await db.select().from(generatedExams).where(and(eq(generatedExams.id, examId), eq(generatedExams.studentId, ctx.user.id)));
      const exam = exams[0];
      if (!exam || (exam.config as any)?.type !== "grade-placement") return NextResponse.json({ error: "Placement assessment not found." }, { status: 404 });
      const questions = Array.isArray(exam.questionsData) ? exam.questionsData as any[] : [];
      const safeExam = {
        ...exam,
        questionsData: questions.map(({ correctAnswer: _correctAnswer, acceptedAnswers: _acceptedAnswers, ...question }) => question),
      };
      const attempts = await db.select().from(examAttempts).where(and(eq(examAttempts.examId, exam.id), eq(examAttempts.studentId, ctx.user.id))).limit(1);
      const attempt = attempts[0];
      const submission = attempt ? {
        success: true,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        details: attempt.detailedFeedback,
        diagnostic: buildPlacementDiagnostic(exam, attempt.percentage, attempt.detailedFeedback as Record<string, any>),
        summaryText: attempt.passed ? "Assessment complete." : "Review the explanations and focus on the suggested topics.",
      } : null;
      return NextResponse.json({ success: true, exam: safeExam, submission }, { headers: { "Cache-Control": "no-store" } });
    }

    // 5. SMART EXAM GENERATOR
    if (action === "generate_smart_exam") {
      const { studentId, stage, grade, curriculum, term, unit, domainCategory, questionType, difficulty, source, lesson, section, grammarTopic, topic, questionCount, easyPercent, mediumPercent, hardPercent, grammarRatio } = body;

      if (!grade) return NextResponse.json({ error: "grade is required for exact exam scope" }, { status: 400 });
      if (ctx.user.role === "student" && studentId && studentId !== ctx.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const effectiveStudentId = ctx.user.role === "student" ? ctx.user.id : studentId;
      const totalNum = Math.min(parseInt(questionCount) || 15, 100);
      const numGrammar = Math.round(totalNum * ((parseInt(grammarRatio) || 50) / 100));
      const numVocab = totalNum - numGrammar;

      // Query candidate pool from Question Bank
      let candidates: any[] = await db.select().from(questionBank).where(eq(questionBank.grade, grade));
      candidates = [
        ...candidates,
        ...getBundledQuestionBankQuestions().filter((q) => q.grade === grade && !candidates.some((existing) => existing.id === q.id)),
      ];
      if (stage) candidates = candidates.filter((q) => q.stage === stage);
      if (curriculum) candidates = candidates.filter((q) => (q.curriculum || "Ministry") === curriculum);
      if (term) candidates = candidates.filter((q) => (q.term || "First") === term);
      if (unit) {
        const requestedUnits = String(unit).split(",").map((u) => u.trim()).filter(Boolean);
        candidates = candidates.filter((q) => requestedUnits.includes(q.unit || ""));
      }
      if (domainCategory) candidates = candidates.filter((q) => q.domainCategory === domainCategory);
      if (questionType) candidates = candidates.filter((q) => q.questionType === questionType);
      if (difficulty) candidates = candidates.filter((q) => q.difficulty === difficulty);
      if (source) candidates = candidates.filter((q) => (q.source || "") === source);
      if (lesson) candidates = candidates.filter((q) => (q.lesson || "") === lesson);
      if (section) candidates = candidates.filter((q) => (q.section || "") === section);
      if (grammarTopic) candidates = candidates.filter((q) => (q.grammarTopic || "") === grammarTopic);
      if (topic) candidates = candidates.filter((q) => (q.topic || "") === topic || (q.grammarTopic || "") === topic);
      if (candidates.length === 0) {
        return NextResponse.json({ error: "No questions found for the exact selected curriculum scope. Nothing was mixed from another bank." }, { status: 404 });
      }

      // Shuffle candidate list
      const targetByDifficulty = {
        Easy: Math.round(totalNum * ((parseInt(easyPercent) || 0) / 100)),
        Medium: Math.round(totalNum * ((parseInt(mediumPercent) || 0) / 100)),
        Hard: Math.round(totalNum * ((parseInt(hardPercent) || 0) / 100)),
      };
      const byDomain = (domain: string) => candidates.filter((q) => q.domainCategory === domain).sort(() => Math.random() - 0.5);
      const byDifficulty = (d: string) => candidates.filter((q) => q.difficulty === d).sort(() => Math.random() - 0.5);
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);

      // Filter and select non-repeating questions
      const selected: any[] = [];
      const usedIds = new Set<string>();

      const pushQuestion = async (q: any) => {
        if (selected.length >= totalNum || usedIds.has(q.id)) return;
        let randomizedOptions = q.options;
        if (Array.isArray(q.options)) randomizedOptions = [...q.options].sort(() => Math.random() - 0.5);
        selected.push({ ...q, type: q.type || q.questionType, options: randomizedOptions });
        usedIds.add(q.id);
        if (!isBundledQuestionId(String(q.id))) {
          await db.update(questionBank).set({ timesUsed: (q.timesUsed || 0) + 1, lastUsedAt: new Date() }).where(eq(questionBank.id, q.id));
        }
      };

      for (const difficultyName of ["Easy","Medium","Hard"]) {
        const pool = byDifficulty(difficultyName);
        for (const q of pool.slice(0, targetByDifficulty[difficultyName as keyof typeof targetByDifficulty])) await pushQuestion(q);
      }

      const targetGrammar = Math.min(numGrammar, selected.length < totalNum ? numGrammar : 0);
      for (const q of byDomain("Grammar").slice(0, targetGrammar)) await pushQuestion(q);
      for (const q of byDomain("Vocabulary").slice(0, totalNum - selected.filter((x) => x.domainCategory === "Grammar").length)) await pushQuestion(q);

      for (const q of shuffled) {
        if (selected.length >= totalNum) break;
        if (!usedIds.has(q.id)) {
          await pushQuestion(q);
        }
      }

      const examId = `exam_${Date.now()}`;
      const examObj = {
        id: examId,
        studentId: effectiveStudentId || ctx.user.id,
        title: `Smart Exam: ${grade} (${totalNum} Questions)`,
        stage: stage || "Secondary",
        grade: grade || "Third Secondary (Baccalaureate)",
        config: { questionCount: totalNum, easyPercent, mediumPercent, hardPercent, grammarRatio, stage, grade, curriculum, term, unit, domainCategory, questionType, difficulty, source, lesson, section, grammarTopic },
        questionIds: Array.from(usedIds),
        questionsData: selected,
        totalPoints: selected.reduce((sum, q) => sum + (q.points || 10), 0),
        durationMinutes: Math.round(totalNum * 2.5),
      };

      await db.insert(generatedExams).values(examObj);

      // Keep the answer key server-side; students receive only the playable exam.
      const safeExam = {
        ...examObj,
        questionsData: selected.map(({ correctAnswer: _correctAnswer, acceptedAnswers: _acceptedAnswers, ...q }) => q),
      };

      return NextResponse.json({
        success: true,
        exam: safeExam,
      });
    }

    // 6. SUBMIT QUICK GRAMMAR PRACTICE
    if (action === "submit_practice") {
      const answers = body.answers || {};
      const questionIds = Array.isArray(body.questionIds) ? body.questionIds.map(String) : [];
      if (!questionIds.length) return NextResponse.json({ error: "No practice questions supplied" }, { status: 400 });
      const rows = await db.select().from(questionBank).where(inArray(questionBank.id, questionIds));
      const byId = new Map<string, any>(rows.map((q) => [q.id, q]));
      for (const question of getBundledQuestionBankQuestions()) {
        if (questionIds.includes(question.id) && !byId.has(question.id)) byId.set(question.id, question);
      }
      let score = 0;
      const feedback: Record<string, any> = {};
      for (const id of questionIds) {
        const q = byId.get(id);
        if (!q) continue;
        const studentAnswer = String(answers[id] || "").trim();
        const isCorrect = answersMatch(q, studentAnswer);
        if (isCorrect) score++;
        feedback[id] = { isCorrect, correctAnswer: q.correctAnswer, explanation: q.explanation };
      }
      return NextResponse.json({ success: true, score, total: questionIds.length, feedback });
    }

    // 7. SUBMIT GENERATED SMART EXAM
    if (action === "submit_exam") {
      const { examId, studentId, userAnswers } = body;
      if (ctx.user.role !== "admin" && ctx.user.role !== "teacher" && studentId !== ctx.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const examsList = await db.select().from(generatedExams).where(eq(generatedExams.id, examId));

      if (examsList.length === 0) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      const exam = examsList[0];
      if (
        ctx.user.role === "student" &&
        (exam.studentId !== ctx.user.id || studentId !== ctx.user.id)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const isPlacementAssessment = (exam.config as any)?.type === "grade-placement";
      if (!userAnswers || typeof userAnswers !== "object" || Array.isArray(userAnswers)) {
        return NextResponse.json({ error: "Answer map is required." }, { status: 400 });
      }

      // One attempt per generated exam prevents repeated point/streak farming.
      const existingAttempts = await db
        .select()
        .from(examAttempts)
        .where(and(eq(examAttempts.examId, examId), eq(examAttempts.studentId, studentId)));
      if (existingAttempts.length > 0) {
        if ((exam.config as any)?.type === "grade-placement") {
          const existingAttempt = existingAttempts[0];
          const diagnostic = buildPlacementDiagnostic(exam, existingAttempt.percentage, existingAttempt.detailedFeedback as Record<string, any>);
          return NextResponse.json({
            success: true,
            attempt: existingAttempt,
            score: existingAttempt.score,
            totalPoints: exam.totalPoints,
            percentage: existingAttempt.percentage,
            passed: existingAttempt.passed,
            feedback: existingAttempt.detailedFeedback,
            diagnostic,
            duplicate: true,
          });
        }
        return NextResponse.json(
          { error: "Exam already submitted", attempt: existingAttempts[existingAttempts.length - 1] },
          { status: 409 }
        );
      }

      if (isPlacementAssessment && exam.durationMinutes > 0 && Date.now() > new Date(exam.createdAt).getTime() + exam.durationMinutes * 60_000 + 60_000) {
        return NextResponse.json({ error: "The assessment time has expired. Your saved answers were not changed." }, { status: 410 });
      }

      const questions = (exam.questionsData as any[]) || [];
      if (isPlacementAssessment) {
        const expectedQuestionIds = new Set(questions.map((question) => String(question.id)));
        if (Object.keys(userAnswers).some((questionId) => !expectedQuestionIds.has(questionId))) {
          return NextResponse.json({ error: "Answers include a question outside this grade-specific assessment." }, { status: 400 });
        }
        for (const question of questions) {
          const answer = userAnswers[question.id];
          if (answer === undefined || String(answer).trim() === "") continue;
          const options = Array.isArray(question.options) ? question.options.map(String) : [];
          if (!options.includes(String(answer))) {
            return NextResponse.json({ error: "One or more selected options are invalid." }, { status: 400 });
          }
        }
      }

      let earned = 0;
      let totalPoints = 0;
      const feedback: Record<string, any> = {};

      for (const q of questions) {
        const p = q.points || 10;
        totalPoints += p;
        const studentAns = String(userAnswers[q.id] || "").trim();
        const isCorrect = answersMatch(q, studentAns);

        if (isCorrect) {
          earned += p;
        }

        feedback[q.id] = {
          questionText: q.questionText,
          topic: q.topic || q.grammarTopic || q.domainCategory || "General",
          domainCategory: q.domainCategory || q.questionType || "General",
          difficulty: q.difficulty || "Medium",
          studentAnswer: studentAns,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        };

      }

      const percentage = Math.round((earned / (totalPoints || 1)) * 100);
      const configuredPassPercentage = Number((exam.config as any)?.passPercentage);
      const passed = percentage >= (Number.isFinite(configuredPassPercentage) ? configuredPassPercentage : 60);

      const attemptId = isPlacementAssessment ? `att_${examId}` : `att_${Date.now()}`;
      const newAttempt = {
        id: attemptId,
        examId,
        studentId,
        score: earned,
        totalQuestions: questions.length,
        percentage,
        passed,
        userAnswers,
        detailedFeedback: feedback,
      };

      let persistedAttempt: typeof newAttempt | any = newAttempt;
      let shouldUpdateQuestionStats = !isPlacementAssessment;
      if (isPlacementAssessment) {
        const inserted = await db.insert(examAttempts).values(newAttempt).onConflictDoNothing().returning({ id: examAttempts.id });
        shouldUpdateQuestionStats = inserted.length > 0;
        const savedAttempts = await db.select().from(examAttempts)
          .where(and(eq(examAttempts.examId, examId), eq(examAttempts.studentId, studentId))).limit(1);
        if (savedAttempts[0]) persistedAttempt = savedAttempts[0];
      } else {
        await db.insert(examAttempts).values(newAttempt);
      }

      if (shouldUpdateQuestionStats) {
        for (const q of questions) {
          const qbList = await db.select().from(questionBank).where(eq(questionBank.id, q.id));
          if (qbList.length === 0) continue;
          const qb = qbList[0];
          const newAttempts = (qb.totalAttempts || 0) + 1;
          const newCorrect = (qb.correctCount || 0) + (feedback[q.id]?.isCorrect ? 1 : 0);
          await db.update(questionBank).set({
            totalAttempts: newAttempts,
            correctCount: newCorrect,
            difficultyIndex: (newCorrect / newAttempts).toFixed(2),
          }).where(eq(questionBank.id, q.id));
        }
      }

      // Award Points & Streak
      const stList = isPlacementAssessment ? [] : await db.select().from(users).where(eq(users.id, studentId));
      if (stList.length > 0) {
        const u = stList[0];
        await db
          .update(users)
          .set({ points: (u.points || 0) + earned, streak: (u.streak || 0) + 1 })
          .where(eq(users.id, studentId));
      }

      const diagnostic = (exam.config as any)?.type === "grade-placement"
        ? buildPlacementDiagnostic(exam, persistedAttempt.percentage, persistedAttempt.detailedFeedback as Record<string, any>)
        : undefined;

      return NextResponse.json({
        success: true,
        attempt: persistedAttempt,
        score: persistedAttempt.score,
        totalPoints,
        percentage: persistedAttempt.percentage,
        passed: persistedAttempt.passed,
        feedback: persistedAttempt.detailedFeedback,
        ...(diagnostic ? { diagnostic } : {}),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Question Bank POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
