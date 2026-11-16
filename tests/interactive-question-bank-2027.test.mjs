import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Interactive Question Bank 2027 - Master Extraction & Classification", async (t) => {
  const dataPath = path.join(rootDir, "src/data/question-bank-2027-master.json");
  assert.ok(fs.existsSync(dataPath), "Master question bank JSON must exist");

  const questions = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  await t.test("Dataset Volume and Term Integrity", () => {
    assert.ok(Array.isArray(questions), "Questions must be an array");
    assert.ok(questions.length >= 50, `Expected at least 50 questions, got ${questions.length}`);

    // STRICT CHECK: Every single question MUST be classified under 'First' term
    questions.forEach((q) => {
      assert.equal(q.term, "First", `Question ${q.id} must be explicitly classified under First term`);
      assert.ok(q.id && q.id.startsWith("qb_2027_"), `Question ID must be prefixed: ${q.id}`);
      assert.ok(q.questionText && q.questionText.length > 5, `Question text missing for ${q.id}`);
      assert.ok(q.correctAnswer, `Correct answer missing for ${q.id}`);
      assert.ok(q.source, `Source document missing for ${q.id}`);
    });
  });

  await t.test("Grade Stage Coverage (All 6 Stages Represented)", () => {
    const grades = new Set(questions.map((q) => q.grade));
    assert.ok(grades.has("First Prep"), "Must cover First Prep");
    assert.ok(grades.has("Second Prep"), "Must cover Second Prep");
    assert.ok(grades.has("Third Prep"), "Must cover Third Prep");
    assert.ok(grades.has("First Secondary"), "Must cover First Secondary");
    assert.ok(grades.has("Second Secondary"), "Must cover Second Secondary");
    assert.ok(grades.has("Third Secondary (Baccalaureate)"), "Must cover Third Secondary");
  });

  await t.test("Question Types Coverage", () => {
    const types = new Set(questions.map((q) => q.questionType));
    assert.ok(types.has("mcq"), "Must have Multiple Choice questions");
    assert.ok(types.has("translation"), "Must have Translation questions");
    assert.ok(types.has("comprehension"), "Must have Reading Comprehension questions");
    assert.ok(types.has("rewrite"), "Must have Rewrite questions");
    assert.ok(types.has("correction"), "Must have Correction questions");
  });

  await t.test("Reading Comprehension Passages Integrity", () => {
    const compQuestions = questions.filter((q) => q.questionType === "comprehension");
    assert.ok(compQuestions.length >= 4, "Must have reading comprehension questions");

    compQuestions.forEach((q) => {
      assert.ok(q.passageText && q.passageText.length > 100, `Passage text missing or too short for ${q.id}`);
      assert.ok(Array.isArray(q.options) && q.options.length >= 4, `Comprehension question ${q.id} must have 4 options`);
      assert.ok(q.options.includes(q.correctAnswer), `Options must include correct answer for ${q.id}`);
    });
  });

  await t.test("Rewrite Questions Integrity", () => {
    const rewriteQuestions = questions.filter((q) => q.questionType === "rewrite");
    assert.ok(rewriteQuestions.length >= 10, "Must have rewrite questions");

    rewriteQuestions.forEach((q) => {
      assert.ok(q.questionText.includes("[") || q.questionText.includes("("), `Rewrite question ${q.id} must contain bracketed keyword`);
      assert.ok(q.correctAnswer && q.correctAnswer.length > 5, `Rewrite question ${q.id} must have valid model answer`);
      assert.ok(q.explanation, `Rewrite question ${q.id} must have explanation`);
    });
  });

  await t.test("Translation Questions Integrity", () => {
    const transQuestions = questions.filter((q) => q.questionType === "translation");
    assert.ok(transQuestions.length >= 5, "Must have translation questions");

    transQuestions.forEach((q) => {
      assert.ok(q.questionText.includes("ترجم") || q.questionText.includes("Translate") || q.questionText.includes("Donating"), `Question text must be translation for ${q.id}`);
      assert.ok(q.correctAnswer, `Translation question ${q.id} must have model answer`);
    });
  });
});
