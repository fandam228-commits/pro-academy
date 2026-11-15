import test from "node:test";
import assert from "node:assert/strict";
import {
  LABELS,
  generateControlledBalancedSequence,
  rebalanceQuestion,
  rebalanceQuestionSet,
  verifyQuestionIntegrity,
  resolveQuestionCorrectOption,
} from "../src/lib/mcq-balancer.mjs";

test("MCQ Balancer - Controlled Balanced Sequence Generator", async (t) => {
  await t.test("Generates exact balanced counts for multiples of 4", () => {
    const seq = generateControlledBalancedSequence(40, { seed: 12345 });
    assert.equal(seq.length, 40);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    seq.forEach((l) => counts[l]++);

    assert.equal(counts.A, 10, "A count must be 10");
    assert.equal(counts.B, 10, "B count must be 10");
    assert.equal(counts.C, 10, "C count must be 10");
    assert.equal(counts.D, 10, "D count must be 10");
  });

  await t.test("Generates balanced counts for non-multiples of 4", () => {
    const seq = generateControlledBalancedSequence(50, { seed: 999 });
    assert.equal(seq.length, 50);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    seq.forEach((l) => counts[l]++);

    // 50 / 4 = 12 remainder 2 -> 13, 13, 12, 12
    const sorted = Object.values(counts).sort((a, b) => b - a);
    assert.deepEqual(sorted, [13, 13, 12, 12]);
  });

  await t.test("Strictly enforces max streak <= 2 (No AAA, BBB, CCC, DDD)", () => {
    for (const size of [12, 20, 40, 50, 100]) {
      const seq = generateControlledBalancedSequence(size, { seed: size * 7 });
      for (let i = 2; i < seq.length; i++) {
        const isRunOf3 = seq[i] === seq[i - 1] && seq[i] === seq[i - 2];
        assert.equal(isRunOf3, false, `Run of 3 found at index ${i} in size ${size}: ${seq.slice(i - 2, i + 1)}`);
      }
    }
  });

  await t.test("Strictly prevents 2-element repetitive cycles (e.g. ABABAB, CDCDCD)", () => {
    const seq = generateControlledBalancedSequence(40, { seed: 42 });
    for (let i = 5; i < seq.length; i++) {
      const isCycleOf2 =
        seq[i] === seq[i - 2] &&
        seq[i - 2] === seq[i - 4] &&
        seq[i - 1] === seq[i - 3] &&
        seq[i - 3] === seq[i - 5];
      assert.equal(isCycleOf2, false, `Repetitive 2-cycle found at index ${i}`);
    }
  });

  await t.test("Strictly prevents 4-element repetitive cycles (e.g. ABCDABCD)", () => {
    const seq = generateControlledBalancedSequence(40, { seed: 88 });
    for (let i = 7; i < seq.length; i++) {
      const isCycleOf4 =
        seq[i] === seq[i - 4] &&
        seq[i - 1] === seq[i - 5] &&
        seq[i - 2] === seq[i - 6] &&
        seq[i - 3] === seq[i - 7];
      assert.equal(isCycleOf4, false, `Repetitive 4-cycle found at index ${i}`);
    }
  });
});

test("MCQ Balancer - Question Rebalancer & Integrity", async (t) => {
  const originalQ = {
    id: "q_test_1",
    questionText: "She has lived here _____ 2020.",
    options: ["since", "for", "from", "in"],
    correctAnswer: "since",
    explanation: "Since indicates a starting point in time.",
    difficulty: "Medium",
  };

  await t.test("Rebalances question to target position 'B' (index 1)", () => {
    const rebalanced = rebalanceQuestion(originalQ, "B");

    assert.equal(rebalanced.questionText, originalQ.questionText, "Question text must never change");
    assert.equal(rebalanced.options[1], "since", "Correct option must now be at index 1 (Option B)");
    assert.equal(rebalanced.correctAnswer, "since", "Correct answer text must remain unchanged");
    assert.equal(rebalanced.options.length, 4);

    const integrity = verifyQuestionIntegrity(originalQ, rebalanced);
    assert.equal(integrity.valid, true, `Integrity failed: ${integrity.errors.join(", ")}`);
  });

  await t.test("Rebalances question to target position 'D' (index 3)", () => {
    const rebalanced = rebalanceQuestion(originalQ, "D");

    assert.equal(rebalanced.options[3], "since", "Correct option must now be at index 3 (Option D)");
    const integrity = verifyQuestionIntegrity(originalQ, rebalanced);
    assert.equal(integrity.valid, true);
  });

  await t.test("Correctly rebalances questions with numeric 'correct' index", () => {
    const numericQ = {
      id: "placement_q1",
      question: "Choose the correct verb form:",
      options: ["goes", "went", "gone", "going"],
      correct: 0, // Option A
      explanationAr: "شرح القاعدة",
    };

    const rebalanced = rebalanceQuestion(numericQ, "C");
    assert.equal(rebalanced.correct, 2, "Numeric correct index must now be 2 (Option C)");
    assert.equal(rebalanced.options[2], "goes", "Target index must contain the correct text");

    const integrity = verifyQuestionIntegrity(numericQ, rebalanced);
    assert.equal(integrity.valid, true);
  });

  await t.test("Correctly rebalances questions with letter 'correctAnswer'", () => {
    const letterQ = {
      id: "tc_q1",
      questionText: "Which is a synonym of essential?",
      options: [
        { label: "a", text: "vital" },
        { label: "b", text: "minor" },
        { label: "c", text: "trivial" },
        { label: "d", text: "useless" },
      ],
      correctAnswer: "a",
    };

    const rebalanced = rebalanceQuestion(letterQ, "D");
    assert.equal(rebalanced.correctAnswer.toLowerCase(), "d", "Letter answer must be updated to 'd'");
    assert.equal(rebalanced.options[3].text, "vital", "Option D must have text 'vital'");

    const integrity = verifyQuestionIntegrity(letterQ, rebalanced);
    assert.equal(integrity.valid, true);
  });
});

test("MCQ Balancer - Rebalance Entire Set with Statistics", async (t) => {
  const dummyQuestions = [];
  for (let i = 0; i < 40; i++) {
    dummyQuestions.push({
      id: `set_q_${i}`,
      questionText: `Question stem #${i + 1}`,
      options: [`Correct_${i}`, `Distractor1_${i}`, `Distractor2_${i}`, `Distractor3_${i}`],
      correctAnswer: `Correct_${i}`, // 100% Option A initially
    });
  }

  const result = rebalanceQuestionSet(dummyQuestions, { seed: 777 });

  assert.equal(result.rebalancedQuestions.length, 40);
  assert.equal(result.stats.distributionBefore.A, 40);
  assert.equal(result.stats.distributionBefore.B, 0);

  // After rebalancing
  assert.equal(result.stats.distributionAfter.A, 10);
  assert.equal(result.stats.distributionAfter.B, 10);
  assert.equal(result.stats.distributionAfter.C, 10);
  assert.equal(result.stats.distributionAfter.D, 10);

  assert.equal(result.stats.maxStreakAfter <= 2, true, `Max streak after must be <= 2, got ${result.stats.maxStreakAfter}`);
  assert.equal(result.stats.integrityErrors.length, 0);
});
