import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateQuestion,
  normalizeArabic,
  normalizeEnglish,
  expandContractions,
  jaccardSimilarity,
  levenshteinDistance,
} from "../src/lib/translation-evaluator.ts";
import { TRANSLATION_MODULES_SEED, SAMPLE_TRANSLATION_EXAMS } from "../src/data/translation-academy-seed.ts";

test("Translation Normalization: Arabic alef, taa marbuta, and diacritics", () => {
  const raw = "إِنَّ التَّنْمِيَةَ الْمُسْتَدَامَةَ هَدَفٌ رَئِيسِيٌّ.";
  const normalized = normalizeArabic(raw);
  assert.equal(normalized, "ان التنميه المستدامه هدف رئيسي");
});

test("Translation Normalization: English contractions and punctuation", () => {
  const raw = "Youth shouldn't give up; it's their future!";
  const normalized = normalizeEnglish(raw);
  assert.equal(normalized, "youth should not give up it is their future");
});

test("Smart Translation: Objective MCQ grading", () => {
  const result = evaluateQuestion(
    "mcq",
    "The government exerts great efforts to develop education and health.",
    "The government exerts great efforts to develop education and health.",
    [],
    null,
    2
  );
  assert.equal(result.isCorrect, true);
  assert.equal(result.score, 2);
  assert.equal(result.percentage, 100);
  assert.equal(result.status, "graded");
  assert.equal(result.needsTeacherReview, false);
});

test("Smart Translation: Sentence ordering accepts valid reconstructed sentence", () => {
  const result = evaluateQuestion(
    "sentence_ordering",
    "Reading feeds the mind and broadens one's horizons.",
    "Reading feeds the mind and broadens one's horizons.",
    ["Reading feeds the mind and broadens horizons."],
    null,
    2
  );
  assert.equal(result.isCorrect, true);
  assert.equal(result.score, 2);
});

test("Smart Translation: Written translation accepts valid alternative translations (no exact match required)", () => {
  const modelAnswer = "Youth are the backbone of the nation and its hope for a bright future.";
  const alternatives = [
    "Young people are the pillar of the nation and its hope for a bright future.",
    "Youth are the cornerstone of the nation and its hope for a bright future.",
  ];

  // Student submitted a valid alternative
  const studentAnswer = "Young people are the pillar of the nation and its hope for a bright future.";

  const result = evaluateQuestion(
    "ar_to_en_text",
    studentAnswer,
    modelAnswer,
    alternatives,
    null,
    3
  );

  assert.equal(result.isCorrect, true);
  assert.equal(result.percentage, 100);
  assert.equal(result.score, 3);
  assert.equal(result.rubric.meaning, 40);
  assert.equal(result.rubric.grammar, 20);
  assert.equal(result.rubric.vocab, 20);
  assert.equal(result.rubric.structure, 10);
  assert.equal(result.rubric.mechanics, 10);
});

test("Smart Translation: Rubric breakdown evaluates partial/borderline answers and flags for Teacher Review", () => {
  const modelAnswer = "The government strives to attract foreign investments.";
  // Student answer has the core meaning and good keywords, but subtle grammatical/syntactical phrasing
  const studentAnswer = "Government try hard attracting foreign investment.";

  const result = evaluateQuestion(
    "ar_to_en_text",
    studentAnswer,
    modelAnswer,
    ["The state strives to attract foreign investments."],
    null,
    2
  );

  // Borderline score should trigger Teacher Review flag rather than outright rejection
  assert.ok(result.percentage >= 40 && result.percentage <= 80);
  assert.equal(result.needsTeacherReview, true);
  assert.equal(result.status, "needs_review");
  assert.ok(result.rubric.meaning > 0);
  assert.ok(result.feedback.includes("المستر") || result.feedback.includes("مراجعتها"));
});

test("Smart Translation: Identifies grammar errors (missing auxiliary in passive)", () => {
  const modelAnswer = "The Grand Egyptian Museum was officially inaugurated.";
  const studentAnswer = "The Grand Egyptian Museum officially inaugurated."; // missing 'was'

  const result = evaluateQuestion(
    "ar_to_en_text",
    studentAnswer,
    modelAnswer,
    [],
    null,
    2
  );

  assert.ok(result.rubric.grammar < 20);
  assert.ok(result.errorsDetected.some((e) => e.includes("Passive") || e.includes("auxiliary") || e.includes("grammar")));
});

test("Smart Translation: Handles empty submission safely with zero score", () => {
  const result = evaluateQuestion(
    "ar_to_en_text",
    "   ",
    "Model answer",
    [],
    null,
    2
  );
  assert.equal(result.isCorrect, false);
  assert.equal(result.score, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.needsTeacherReview, false);
});

test("Translation Academy Seed: All 8 mandatory modules are populated for First Secondary", () => {
  assert.equal(TRANSLATION_MODULES_SEED.length, 8);

  const codes = TRANSLATION_MODULES_SEED.map((m) => m.code);
  assert.ok(codes.includes("mod_basics"));
  assert.ok(codes.includes("mod_vocab_context"));
  assert.ok(codes.includes("mod_grammar_trans"));
  assert.ok(codes.includes("mod_ar_to_en"));
  assert.ok(codes.includes("mod_en_to_ar"));
  assert.ok(codes.includes("mod_sentences"));
  assert.ok(codes.includes("mod_paragraphs"));
  assert.ok(codes.includes("mod_exams"));

  // Check that every module has lessons with rules, vocabulary, solved examples, and questions
  for (const mod of TRANSLATION_MODULES_SEED) {
    assert.ok(mod.lessons.length > 0, `Module ${mod.code} has lessons`);
    const l1 = mod.lessons[0];
    assert.ok(l1.rules.length > 0, `Lesson in ${mod.code} has rules`);
    assert.ok(l1.vocabulary.length > 0, `Lesson in ${mod.code} has vocabulary`);
    assert.ok(l1.solvedExamples.length > 0, `Lesson in ${mod.code} has solved examples`);
    assert.ok(l1.commonMistakes.length > 0, `Lesson in ${mod.code} has common mistakes`);
    assert.ok(l1.questions.length > 0, `Lesson in ${mod.code} has interactive questions`);
  }
});

test("Translation Academy Seed: Sample final exam is configured with passing score and duration", () => {
  assert.ok(SAMPLE_TRANSLATION_EXAMS.length > 0);
  const exam = SAMPLE_TRANSLATION_EXAMS[0];
  assert.equal(exam.timeLimitMinutes, 30);
  assert.equal(exam.passingScore, 60);
  assert.ok(exam.questionIds.length >= 10);
});
