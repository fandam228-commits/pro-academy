import { db } from "@/db";
import { questionBank, generatedExams, examAttempts, users } from "@/db/schema";
import { eq, and, sql, ilike, inArray, notInArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles, getAuthContext } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const domainCategory = searchParams.get("domainCategory"); // 'Vocabulary', 'Grammar'
  const grade = searchParams.get("grade");
  const difficulty = searchParams.get("difficulty");
  const grammarTopic = searchParams.get("grammarTopic");
  const topic = searchParams.get("topic");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "100");

  try {
    let allQuestions = await db.select().from(questionBank).limit(limit);

    if (domainCategory) {
      allQuestions = allQuestions.filter((q) => q.domainCategory.toLowerCase() === domainCategory.toLowerCase());
    }
    if (grade) {
      allQuestions = allQuestions.filter((q) => q.grade.toLowerCase() === grade.toLowerCase());
    }
    if (difficulty) {
      allQuestions = allQuestions.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (grammarTopic) {
      allQuestions = allQuestions.filter((q) => q.grammarTopic?.toLowerCase() === grammarTopic.toLowerCase());
    }
    if (topic) {
      allQuestions = allQuestions.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      allQuestions = allQuestions.filter(
        (q) => q.questionText.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s)
      );
    }

    // Analytics summary
    const totalCount = allQuestions.length;
    const vocabCount = allQuestions.filter((q) => q.domainCategory === "Vocabulary").length;
    const grammarCount = allQuestions.filter((q) => q.domainCategory === "Grammar").length;

    return NextResponse.json({
      questions: allQuestions,
      stats: {
        total: totalCount,
        vocabularyCount: vocabCount,
        grammarCount: grammarCount,
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
    const body = await req.json();
    const { action } = body;

    // ---- SECURITY: Bank modifications (add/import/AI authoring) → teachers & admins only
    const teacherActions = ["add_question", "import_questions", "ai_generate_questions"];
    if (teacherActions.includes(action)) {
      const { denied } = await requireRoles(req, ["admin", "teacher"]);
      if (denied) return denied;
    }

    // ---- SECURITY: Exam generation & submission → any logged-in session required
    const studentActions = ["generate_smart_exam", "submit_exam"];
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
        unit: qData.unit || "Unit 1",
        lesson: qData.lesson || "Lesson 1",
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
          unit: item.unit || "Unit 1",
          lesson: item.lesson || "Lesson 1",
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
          unit: "Unit 1",
          lesson: "Lesson 1",
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

    // 4. SMART EXAM GENERATOR
    if (action === "generate_smart_exam") {
      const { studentId, stage, grade, questionCount, easyPercent, mediumPercent, hardPercent, grammarRatio } = body;

      const totalNum = parseInt(questionCount) || 15;
      const numGrammar = Math.round(totalNum * ((parseInt(grammarRatio) || 50) / 100));
      const numVocab = totalNum - numGrammar;

      // Query candidate pool from Question Bank
      let candidates = await db.select().from(questionBank).where(eq(questionBank.grade, grade));
      if (candidates.length === 0) {
        candidates = await db.select().from(questionBank);
      }

      // Shuffle candidate list
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);

      // Filter and select non-repeating questions
      const selected: any[] = [];
      const usedIds = new Set<string>();

      for (const q of shuffled) {
        if (selected.length >= totalNum) break;
        if (!usedIds.has(q.id)) {
          // Shuffle question options so choices are randomized every exam
          let randomizedOptions = q.options;
          if (Array.isArray(q.options)) {
            randomizedOptions = [...q.options].sort(() => Math.random() - 0.5);
          }

          selected.push({
            ...q,
            options: randomizedOptions,
          });
          usedIds.add(q.id);

          // Update usage statistics in DB
          await db
            .update(questionBank)
            .set({
              timesUsed: (q.timesUsed || 0) + 1,
              lastUsedAt: new Date(),
            })
            .where(eq(questionBank.id, q.id));
        }
      }

      const examId = `exam_${Date.now()}`;
      const examObj = {
        id: examId,
        studentId: studentId || "usr_student_1",
        title: `Smart Exam: ${grade} (${totalNum} Questions)`,
        stage: stage || "Secondary",
        grade: grade || "Third Secondary (Baccalaureate)",
        config: { questionCount: totalNum, easyPercent, mediumPercent, hardPercent, grammarRatio },
        questionIds: Array.from(usedIds),
        questionsData: selected,
        totalPoints: selected.reduce((sum, q) => sum + (q.points || 10), 0),
        durationMinutes: Math.round(totalNum * 2.5),
      };

      await db.insert(generatedExams).values(examObj);

      return NextResponse.json({
        success: true,
        exam: examObj,
      });
    }

    // 5. SUBMIT GENERATED SMART EXAM
    if (action === "submit_exam") {
      const { examId, studentId, userAnswers } = body;
      const examsList = await db.select().from(generatedExams).where(eq(generatedExams.id, examId));

      if (examsList.length === 0) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      const exam = examsList[0];
      const questions = (exam.questionsData as any[]) || [];

      let earned = 0;
      let totalPoints = 0;
      const feedback: Record<string, any> = {};

      for (const q of questions) {
        const p = q.points || 10;
        totalPoints += p;
        const studentAns = (userAnswers[q.id] || "").trim();
        const isCorrect = studentAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();

        if (isCorrect) {
          earned += p;
        }

        feedback[q.id] = {
          questionText: q.questionText,
          studentAnswer: studentAns,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        };

        // Update discrimination/difficulty stats in questionBank
        const qbList = await db.select().from(questionBank).where(eq(questionBank.id, q.id));
        if (qbList.length > 0) {
          const qb = qbList[0];
          const newAttempts = (qb.totalAttempts || 0) + 1;
          const newCorrect = (qb.correctCount || 0) + (isCorrect ? 1 : 0);
          const diffIdx = (newCorrect / newAttempts).toFixed(2);

          await db
            .update(questionBank)
            .set({
              totalAttempts: newAttempts,
              correctCount: newCorrect,
              difficultyIndex: diffIdx,
            })
            .where(eq(questionBank.id, q.id));
        }
      }

      const percentage = Math.round((earned / (totalPoints || 1)) * 100);
      const passed = percentage >= 60;

      const attemptId = `att_${Date.now()}`;
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

      await db.insert(examAttempts).values(newAttempt);

      // Award Points & Streak
      const stList = await db.select().from(users).where(eq(users.id, studentId));
      if (stList.length > 0) {
        const u = stList[0];
        await db
          .update(users)
          .set({ points: (u.points || 0) + earned, streak: (u.streak || 0) + 1 })
          .where(eq(users.id, studentId));
      }

      return NextResponse.json({
        success: true,
        attempt: newAttempt,
        score: earned,
        percentage,
        passed,
        feedback,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Question Bank POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
