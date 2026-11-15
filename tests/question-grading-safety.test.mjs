import test from "node:test";
import assert from "node:assert/strict";
import { answersMatch, isOptionCorrect } from "../src/lib/question-grading.mjs";

test("answersMatch: matches valid identical answers case-insensitively", () => {
  const q = { correctAnswer: "will have finished", questionType: "mcq" };
  assert.equal(answersMatch(q, "will have finished"), true);
  assert.equal(answersMatch(q, "  WILL HAVE FINISHED  "), true);
  assert.equal(answersMatch(q, "had finished"), false);
});

test("answersMatch: returns false when correctAnswer is null or undefined (never awards points)", () => {
  const qNull = { correctAnswer: null, questionType: "mcq" };
  const qUndefined = { correctAnswer: undefined, questionType: "mcq" };
  const qMissing = { questionType: "mcq" };

  assert.equal(answersMatch(qNull, "anything"), false);
  assert.equal(answersMatch(qUndefined, "anything"), false);
  assert.equal(answersMatch(qMissing, "anything"), false);
});

test("answersMatch: returns false when correctAnswer is empty or whitespace only", () => {
  const qEmpty = { correctAnswer: "", questionType: "mcq" };
  const qSpaces = { correctAnswer: "   ", questionType: "mcq" };

  assert.equal(answersMatch(qEmpty, "anything"), false);
  assert.equal(answersMatch(qSpaces, "anything"), false);
});

test("answersMatch: never awards points when both studentAnswer and correctAnswer are empty", () => {
  const qEmpty = { correctAnswer: "", questionType: "mcq" };
  const qNull = { correctAnswer: null, questionType: "mcq" };

  assert.equal(answersMatch(qEmpty, ""), false);
  assert.equal(answersMatch(qEmpty, "   "), false);
  assert.equal(answersMatch(qNull, ""), false);
});

test("answersMatch: returns false when studentAnswer is empty, null or undefined", () => {
  const q = { correctAnswer: "option A", questionType: "mcq" };

  assert.equal(answersMatch(q, ""), false);
  assert.equal(answersMatch(q, "   "), false);
  assert.equal(answersMatch(q, null), false);
  assert.equal(answersMatch(q, undefined), false);
});

test("answersMatch: handles multi_select with valid and malformed answers", () => {
  const qMulti = {
    correctAnswer: JSON.stringify(["a", "c"]),
    questionType: "multi_select",
  };

  assert.equal(answersMatch(qMulti, JSON.stringify(["c", "a"])), true);
  assert.equal(answersMatch(qMulti, JSON.stringify(["a"])), false);
  assert.equal(answersMatch(qMulti, JSON.stringify(["a", "b"])), false);
  assert.equal(answersMatch(qMulti, "invalid json"), false);
  assert.equal(answersMatch(qMulti, ""), false);

  const qMultiMalformed = {
    correctAnswer: "not valid json",
    questionType: "multi_select",
  };
  assert.equal(answersMatch(qMultiMalformed, JSON.stringify(["a"])), false);
});

test("isOptionCorrect: frontend helper never throws TypeError when correctAnswer is missing or undefined", () => {
  // Student view simulation: correctAnswer is stripped by API
  assert.doesNotThrow(() => {
    assert.equal(isOptionCorrect("Option A", undefined), false);
    assert.equal(isOptionCorrect("Option A", null), false);
    assert.equal(isOptionCorrect("Option A", ""), false);
    assert.equal(isOptionCorrect("Option A", "   "), false);
  });

  // Valid teacher/admin view
  assert.equal(isOptionCorrect("Option A", "Option A"), true);
  assert.equal(isOptionCorrect("option a", "  Option A  "), true);
  assert.equal(isOptionCorrect("Option B", "Option A"), false);

  // Safe against null/undefined option
  assert.equal(isOptionCorrect(null, "Option A"), false);
  assert.equal(isOptionCorrect(undefined, "Option A"), false);
  assert.equal(isOptionCorrect("", "Option A"), false);
});

test("isOptionCorrect: supports multi_select JSON options safely", () => {
  const correctJson = JSON.stringify(["first", "second"]);
  assert.equal(isOptionCorrect("first", correctJson, "multi_select"), true);
  assert.equal(isOptionCorrect("second", correctJson, "multi_select"), true);
  assert.equal(isOptionCorrect("third", correctJson, "multi_select"), false);
  assert.equal(isOptionCorrect("first", null, "multi_select"), false);
});
