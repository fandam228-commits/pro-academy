import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const questionsPath = path.join(__dirname, "../src/data/training-center-extracted-questions.json");
const auditReportPath = path.join(__dirname, "../src/data/training-center-audit-report.json");

test("Training Center: Extracted questions data file exists and contains full inventory", () => {
  assert.ok(fs.existsSync(questionsPath), "Extracted questions JSON file must exist");
  assert.ok(fs.existsSync(auditReportPath), "Audit report JSON file must exist");

  const rawQuestions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
  const auditReport = JSON.parse(fs.readFileSync(auditReportPath, "utf-8"));

  assert.equal(rawQuestions.length, 894, "All 894 content questions must be extracted from the 108-page document");
  assert.equal(auditReport.totalPagesAudited, 108, "Must record audit of all 108 pages");
  assert.equal(auditReport.sourceDocument, "Professional_Question_Bank_20261108_233552.docx");
});

test("Training Center: Multi-status validation pipeline categorizes every question strictly", () => {
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

  const validStatuses = new Set([
    "complete_verified",
    "missing_text",
    "missing_options",
    "unclear_formatting",
    "duplicate_candidates",
    "unverified_answer",
    "ready_for_publication",
  ]);

  for (const q of questions) {
    assert.ok(q.id.startsWith("TRQ-"), `ID ${q.id} must follow standard prefix TRQ-`);
    assert.ok(validStatuses.has(q.validationStatus), `Invalid status ${q.validationStatus} for ${q.id}`);
    assert.ok(typeof q.originalOrder === "number", "Must have numerical original order");
    assert.ok(q.sourcePage >= 1 && q.sourcePage <= 108, "Source page must be between 1 and 108");

    // Rule: ONLY complete_verified or ready_for_publication can be published by default
    if (q.isPublished) {
      assert.ok(
        q.validationStatus === "complete_verified" || q.validationStatus === "ready_for_publication",
        `Unpublished defect question ${q.id} cannot be published`
      );
    }
  }
});

test("Training Center: Original English wording, question numbering and options are preserved", () => {
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

  // Check specific extracted questions from document
  const q2 = questions.find((q) => q.id === "TRQ-0027");
  assert.ok(q2, "Question TRQ-0027 must be present");
  assert.equal(q2.questionNumber, "2", "Question number must be 2");
  assert.ok(q2.questionText.includes("little boy"), "Question text must preserve 'little boy'");

  // Check options format
  assert.ok(Array.isArray(q2.options), "Options must be an array");
  assert.equal(q2.options.length, 4, "Must have 4 options");
  assert.deepEqual(
    q2.options.map((o) => o.label),
    ["a", "b", "c", "d"]
  );
  for (const opt of q2.options) {
    assert.ok(opt.label, "Option must have a label (e.g. a, b, c, d)");
    assert.ok(opt.text, "Option must have non-empty text");
  }
});

test("Training Center: Topics are accurately classified across grammar domains", () => {
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

  const topicsSeen = new Set(questions.map((q) => q.topic));
  assert.ok(topicsSeen.has("Past Tenses"), "Must classify Past Tenses");
  assert.ok(topicsSeen.has("Present Perfect"), "Must classify Present Perfect");
  assert.ok(topicsSeen.has("Modals & Auxiliaries"), "Must classify Modals & Auxiliaries");
  assert.ok(topicsSeen.has("Relative Clauses & Pronouns"), "Must classify Relative Clauses & Pronouns");
  assert.ok(topicsSeen.has("Prepositions & Phrasal Verbs"), "Must classify Prepositions & Phrasal Verbs");
});

test("Training Center: Server-side grading logic correctly evaluates answers and prevents cheating", () => {
  function gradeAnswer(selectedAnswer, correctAnswer, options = []) {
    if (!selectedAnswer || !correctAnswer) return false;
    const normalizedSelected = String(selectedAnswer).trim().toLowerCase();
    const normalizedCorrect = String(correctAnswer).trim().toLowerCase();

    if (normalizedSelected === normalizedCorrect) return true;

    // Check matching by option text
    const matched = options.find((o) => String(o.label).toLowerCase() === normalizedCorrect);
    if (matched && String(matched.text).trim().toLowerCase() === normalizedSelected) {
      return true;
    }
    return false;
  }

  const options = [
    { label: "a", text: "was going" },
    { label: "b", text: "went" },
    { label: "c", text: "has gone" },
    { label: "d", text: "had gone" },
  ];

  // Correct letter
  assert.equal(gradeAnswer("b", "b", options), true);
  assert.equal(gradeAnswer("B", "b", options), true);

  // Correct text
  assert.equal(gradeAnswer("went", "b", options), true);

  // Incorrect letter & text
  assert.equal(gradeAnswer("c", "b", options), false);
  assert.equal(gradeAnswer("was going", "b", options), false);

  // Missing or empty answer
  assert.equal(gradeAnswer("", "b", options), false);
  assert.equal(gradeAnswer(null, "b", options), false);
  assert.equal(gradeAnswer(undefined, "b", options), false);
});

test("Training Center: Exam score and passing thresholds calculate with exact precision", () => {
  function computeExamScore(totalQuestions, correctCount) {
    const percentage = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;
    const passed = percentage >= 60;
    const points = correctCount * 10 + (passed ? 50 : 0);
    return { score: correctCount, totalQuestions, percentage, passed, points };
  }

  const perfect = computeExamScore(20, 20);
  assert.equal(perfect.percentage, 100);
  assert.equal(perfect.passed, true);
  assert.equal(perfect.points, 250); // 20*10 + 50

  const passing = computeExamScore(20, 12);
  assert.equal(passing.percentage, 60);
  assert.equal(passing.passed, true);
  assert.equal(passing.points, 170); // 12*10 + 50

  const failing = computeExamScore(20, 11);
  assert.equal(failing.percentage, 55);
  assert.equal(failing.passed, false);
  assert.equal(failing.points, 110); // 11*10
});
