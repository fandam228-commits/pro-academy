import assert from "node:assert/strict";
import { test } from "node:test";
import { shuffleOptionsBalanced } from "./balanced-option-shuffle.mjs";

const makeQuestions = (count) => Array.from({ length: count }, (_, index) => ({
  id: `q${index + 1}`,
  question: `Original question ${index + 1}`,
  options: ["Alpha", "Bravo", "Charlie", "Delta"],
  correctAnswer: "Charlie",
}));

test("balances correct option positions across four-choice questions", () => {
  const result = shuffleOptionsBalanced(makeQuestions(12), () => 0.37);
  const counts = [0, 0, 0, 0];

  for (const question of result) {
    counts[question.options.indexOf(question.correctAnswer)] += 1;
  }

  assert.deepEqual(counts, [3, 3, 3, 3]);
});

test("preserves question text and every option string without mutation", () => {
  const original = makeQuestions(4);
  const snapshot = structuredClone(original);
  const result = shuffleOptionsBalanced(original, () => 0.61);

  assert.deepEqual(original, snapshot);
  for (let index = 0; index < result.length; index += 1) {
    assert.equal(result[index].question, snapshot[index].question);
    assert.deepEqual([...result[index].options].sort(), [...snapshot[index].options].sort());
    assert.equal(result[index].correctAnswer, snapshot[index].correctAnswer);
  }
});

test("leaves questions unchanged when the answer key does not match exactly one option", () => {
  const questions = [
    { id: "missing", question: "Q?", options: ["A", "B", "C", "D"], correctAnswer: "E" },
    { id: "duplicate", question: "Q?", options: ["A", "B", "B", "D"], correctAnswer: "B" },
  ];

  assert.deepEqual(shuffleOptionsBalanced(questions, () => 0.25), questions);
});

test("returns fresh question and options arrays", () => {
  const original = makeQuestions(2);
  const result = shuffleOptionsBalanced(original, () => 0.4);

  assert.notEqual(result, original);
  assert.notEqual(result[0], original[0]);
  assert.notEqual(result[0].options, original[0].options);
});
