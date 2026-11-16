import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  generateControlledBalancedSequence,
  rebalanceQuestion,
  rebalanceQuestionSet,
  resolveQuestionCorrectOption,
  standardizeQuestionOptions,
  verifyQuestionIntegrity,
} from "../src/lib/mcq-balancer.mjs";

import {
  validateAndStandardizeFourOptions,
  generateBalancedTargetLetters,
  createExamAttemptSession,
} from "../src/lib/smart-shuffle-engine.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const master2027Path = path.resolve(__dirname, "../src/data/question-bank-2027-master.json");
const trainingCenterPath = path.resolve(__dirname, "../src/data/training-center-extracted-questions.json");

describe("MCQ Standards & Answer Key Distribution Compliance", () => {
  const masterQuestions = JSON.parse(fs.readFileSync(master2027Path, "utf8"));
  const trainingQuestions = JSON.parse(fs.readFileSync(trainingCenterPath, "utf8"));

  it("Criterion 1: Strict Max 4 Options across 2027 Master Question Bank", () => {
    let violationCount = 0;
    const violations = [];

    for (const q of masterQuestions) {
      if (Array.isArray(q.options) && q.options.length > 4) {
        violationCount++;
        violations.push({ id: q.id, length: q.options.length });
      }
    }

    assert.equal(violationCount, 0, `Found questions with > 4 options: ${JSON.stringify(violations)}`);
  });

  it("Criterion 1: Strict Max 4 Options across Training Center Dataset", () => {
    let violationCount = 0;
    const violations = [];

    for (const q of trainingQuestions) {
      if (Array.isArray(q.options) && q.options.length > 4) {
        violationCount++;
        violations.push({ id: q.id, length: q.options.length });
      }
    }

    assert.equal(violationCount, 0, `Found questions with > 4 options: ${JSON.stringify(violations)}`);
  });

  it("Criterion 2 & 3: Standard Psychometric Answer Distribution in 2027 Master MCQs", () => {
    const mcqs = masterQuestions.filter(
      (q) => q.questionType === "mcq" || (Array.isArray(q.options) && q.options.length === 4)
    );

    assert.ok(mcqs.length >= 20, `Expected at least 20 MCQs, got ${mcqs.length}`);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    const sequence = [];

    for (const q of mcqs) {
      const resolved = resolveQuestionCorrectOption(q);
      assert.ok(resolved, `MCQ ${q.id} must have resolvable correct option`);
      counts[resolved.label]++;
      sequence.push(resolved.label);
    }

    // Check ~25% share per letter
    for (const label of ["A", "B", "C", "D"]) {
      const share = counts[label] / mcqs.length;
      assert.ok(
        share >= 0.18 && share <= 0.35,
        `Letter ${label} share (${(share * 100).toFixed(1)}%) outside expected psychometric range (18%-35%)`
      );
    }

    // Check max streak <= 2 (strictly no streak of 3 or more e.g. AAA, BBB, CCC, DDD)
    let maxStreak = 0;
    let currentStreak = 0;
    let currentLabel = null;

    for (const label of sequence) {
      if (label === currentLabel) {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentLabel = label;
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }

    assert.ok(
      maxStreak <= 2,
      `Streak of identical consecutive answers exceeds 2! maxStreak = ${maxStreak}`
    );

    // Check no 2-cycle repeats (e.g. ABABAB)
    for (let i = 5; i < sequence.length; i++) {
      const is2Cycle =
        sequence[i] === sequence[i - 2] &&
        sequence[i - 2] === sequence[i - 4] &&
        sequence[i - 1] === sequence[i - 3] &&
        sequence[i - 3] === sequence[i - 5];
      assert.ok(!is2Cycle, `Detected repeating 2-cycle at index ${i}`);
    }

    // Check no 4-cycle repeats (e.g. ABCDABCD)
    for (let i = 7; i < sequence.length; i++) {
      const is4Cycle =
        sequence[i] === sequence[i - 4] &&
        sequence[i - 1] === sequence[i - 5] &&
        sequence[i - 2] === sequence[i - 6] &&
        sequence[i - 3] === sequence[i - 7];
      assert.ok(!is4Cycle, `Detected repeating 4-cycle at index ${i}`);
    }
  });

  it("Criterion 2 & 3: Standard Psychometric Answer Distribution in Published Training Center MCQs", () => {
    const verified = trainingQuestions.filter(
      (q) => q.isPublished && q.validationStatus === "complete_verified" && Array.isArray(q.options) && q.options.length === 4
    );

    assert.ok(verified.length >= 500, `Expected >= 500 verified questions, got ${verified.length}`);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    const sequence = [];

    for (const q of verified) {
      const resolved = resolveQuestionCorrectOption(q);
      assert.ok(resolved, `Training question ${q.id} must have resolvable correct option`);
      counts[resolved.label]++;
      sequence.push(resolved.label);
    }

    // Check ~25% share per letter (23% - 27%)
    for (const label of ["A", "B", "C", "D"]) {
      const share = counts[label] / verified.length;
      assert.ok(
        share >= 0.22 && share <= 0.28,
        `Letter ${label} share (${(share * 100).toFixed(1)}%) outside expected range (22%-28%)`
      );
    }

    // Check max streak <= 2
    let maxStreak = 0;
    let currentStreak = 0;
    let currentLabel = null;

    for (const label of sequence) {
      if (label === currentLabel) {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentLabel = label;
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }

    assert.ok(
      maxStreak <= 2,
      `Streak of identical consecutive answers exceeds 2 in training center! maxStreak = ${maxStreak}`
    );
  });

  it("Criterion 4: standardizeQuestionOptions correctly prunes >4 options without data loss", () => {
    const testQ = {
      id: "test_extra_opts",
      questionText: "Which word means extremely big?",
      options: ["tiny", "colossal", "microscopic", "small", "minute", "slender", "huge"],
      correctAnswer: "colossal",
    };

    const standardized = standardizeQuestionOptions(testQ);
    assert.equal(standardized.options.length, 4, "Must prune to exactly 4 options");
    assert.ok(standardized.options.includes("colossal"), "Correct answer must be preserved");

    // Rebalancing should work flawlessly
    const rebalanced = rebalanceQuestion(standardized, "C");
    assert.equal(rebalanced.options.length, 4);
    assert.equal(rebalanced.options[2], "colossal", "Option C must be colossal");
  });

  it("Criterion 5: Controlled Sequence Generator guarantees balance and streak <= 2 for arbitrary N", () => {
    for (const n of [10, 20, 25, 40, 100, 250, 500]) {
      const seq = generateControlledBalancedSequence(n, { seed: 12345 + n });
      assert.equal(seq.length, n);

      let maxStreak = 0;
      let curStreak = 0;
      let last = null;
      for (const item of seq) {
        if (item === last) {
          curStreak++;
        } else {
          curStreak = 1;
          last = item;
        }
        if (curStreak > maxStreak) maxStreak = curStreak;
      }

      assert.ok(maxStreak <= 2, `For N=${n}, maxStreak is ${maxStreak}`);

      const counts = { A: 0, B: 0, C: 0, D: 0 };
      for (const item of seq) counts[item]++;

      const minCount = Math.floor(n / 4);
      const maxCount = minCount + (n % 4 > 0 ? 1 : 0);

      for (const label of ["A", "B", "C", "D"]) {
        assert.ok(
          counts[label] >= minCount && counts[label] <= maxCount,
          `Count for ${label} (${counts[label]}) violates uniform expectation [${minCount}, ${maxCount}]`
        );
      }
    }
  });

  it("Criterion 6: Smart Shuffle Engine produces balanced exam attempt sessions", () => {
    const sampleQuestions = masterQuestions
      .filter((q) => q.questionType === "mcq" || (Array.isArray(q.options) && q.options.length === 4))
      .slice(0, 20);

    const session = createExamAttemptSession(sampleQuestions);
    assert.equal(session.clientQuestions.length, sampleQuestions.length);

    // Check all questions delivered to student have exactly 4 options
    for (const q of session.clientQuestions) {
      assert.equal(q.options.length, 4, `Delivered question ${q.id} does not have 4 options`);
      const labels = q.options.map((o) => o.label);
      assert.deepEqual(labels, ["A", "B", "C", "D"]);
    }

    // Check correct answer visual labels in secrets
    const secretKeys = Object.values(session.secrets);
    const targetCounts = { A: 0, B: 0, C: 0, D: 0 };
    for (const sec of secretKeys) {
      targetCounts[sec.correctVisualLabel]++;
    }

    for (const label of ["A", "B", "C", "D"]) {
      assert.ok(
        targetCounts[label] >= 3 && targetCounts[label] <= 7,
        `Visual label distribution skewed for ${label}: ${targetCounts[label]}`
      );
    }
  });
});
