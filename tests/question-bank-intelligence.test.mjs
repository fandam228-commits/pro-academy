import test from "node:test";
import assert from "node:assert/strict";
import {
  LABELS,
  validateAndStandardizeFourOptions,
  generateBalancedTargetLetters,
  createExamAttemptSession,
  gradeExamAttempt,
} from "../src/lib/smart-shuffle-engine.mjs";

test("Question Intelligence: Enforces exact 4 options without duplicates or empty options", () => {
  // Valid 4 options
  const validQ = {
    id: "Q1",
    questionText: "She has lived here _____ 2020.",
    options: [
      { label: "A", text: "since" },
      { label: "B", text: "for" },
      { label: "C", text: "from" },
      { label: "D", text: "in" },
    ],
    correctAnswer: "since",
  };
  const result = validateAndStandardizeFourOptions(validQ);
  assert.ok(result, "Valid question should be accepted");
  assert.equal(result.options.length, 4, "Must have exactly 4 options");
  assert.equal(result.correctText, "since");

  // Invalid: only 2 options (e.g. truncated OCR)
  const invalid2Opts = {
    id: "Q2",
    questionText: "He is _____ teacher.",
    options: [
      { label: "A", text: "a" },
      { label: "B", text: "an" },
    ],
    correctAnswer: "a",
  };
  assert.equal(validateAndStandardizeFourOptions(invalid2Opts), null, "2 options must be rejected");

  // Invalid: duplicate option text
  const duplicateOpts = {
    id: "Q3",
    questionText: "Choose the correct word.",
    options: [
      { label: "A", text: "important" },
      { label: "B", text: "crucial" },
      { label: "C", text: "important" }, // duplicate!
      { label: "D", text: "vital" },
    ],
    correctAnswer: "vital",
  };
  assert.equal(validateAndStandardizeFourOptions(duplicateOpts), null, "Duplicate options must be rejected");

  // Invalid: correct answer not found in options
  const unverifiedAnswer = {
    id: "Q4",
    questionText: "What is the past participle of go?",
    options: [
      { label: "A", text: "went" },
      { label: "B", text: "goes" },
      { label: "C", text: "going" },
      { label: "D", text: "walked" },
    ],
    correctAnswer: "gone", // not in options!
  };
  assert.equal(validateAndStandardizeFourOptions(unverifiedAnswer), null, "Unmatched answer must be rejected");
});

test("Smart Answer Distribution: Balances A/B/C/D across 20-question exam and prevents runs of 3", () => {
  for (let trial = 0; trial < 100; trial++) {
    const letters = generateBalancedTargetLetters(20);
    assert.equal(letters.length, 20);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    for (let i = 0; i < letters.length; i++) {
      counts[letters[i]]++;

      // Max run of 2 identical letters (never 3 in a row)
      if (i >= 2) {
        const runOfThree = letters[i] === letters[i - 1] && letters[i] === letters[i - 2];
        assert.equal(runOfThree, false, `Run of 3 identical letters detected at index ${i} in trial ${trial}`);
      }
    }

    // Each letter should have exactly 5 questions (25% each) for a 20-question exam
    assert.equal(counts.A, 5, "A count should be 5");
    assert.equal(counts.B, 5, "B count should be 5");
    assert.equal(counts.C, 5, "C count should be 5");
    assert.equal(counts.D, 5, "D count should be 5");
  }
});

test("Smart Shuffle Engine: Strips answers from client payload and accurately grades attempts", () => {
  const sampleQuestions = [
    {
      id: "SQ1",
      questionText: "Question 1 text",
      options: [
        { label: "A", text: "Ans1" },
        { label: "B", text: "Wrong1" },
        { label: "C", text: "Wrong2" },
        { label: "D", text: "Wrong3" },
      ],
      correctAnswer: "Ans1",
    },
    {
      id: "SQ2",
      questionText: "Question 2 text",
      options: [
        { label: "A", text: "WrongA" },
        { label: "B", text: "Ans2" },
        { label: "C", text: "WrongC" },
        { label: "D", text: "WrongD" },
      ],
      correctAnswer: "Ans2",
    },
    {
      id: "SQ3",
      questionText: "Question 3 text",
      options: [
        { label: "A", text: "WrongA" },
        { label: "B", text: "WrongB" },
        { label: "C", text: "Ans3" },
        { label: "D", text: "WrongD" },
      ],
      correctAnswer: "Ans3",
    },
    {
      id: "SQ4",
      questionText: "Question 4 text",
      options: [
        { label: "A", text: "WrongA" },
        { label: "B", text: "WrongB" },
        { label: "C", text: "WrongC" },
        { label: "D", text: "Ans4" },
      ],
      correctAnswer: "Ans4",
    },
  ];

  const session = createExamAttemptSession(sampleQuestions);
  assert.equal(session.clientQuestions.length, 4);

  // Verify client payload has ZERO answer leakage
  for (const cq of session.clientQuestions) {
    assert.equal("correctAnswer" in cq, false, "Client question must NOT leak correctAnswer");
    assert.equal("correctIndex" in cq, false, "Client question must NOT leak correctIndex");
    assert.equal("explanation" in cq, false, "Client question must NOT leak explanation");
    assert.equal(cq.options.length, 4, "Client question must have 4 options");
  }

  // Simulate perfect submission using the visual labels from secrets
  const studentAnswers = {};
  for (const qId of Object.keys(session.secrets)) {
    studentAnswers[qId] = session.secrets[qId].correctVisualLabel;
  }

  const gradeResult = gradeExamAttempt(session.secrets, studentAnswers);
  assert.equal(gradeResult.score, 4, "Perfect answers should score 4 / 4");
  assert.equal(gradeResult.percentage, 100, "Percentage should be 100%");
  assert.equal(gradeResult.passed, true, "Should pass");

  // Simulate mixed answers
  const partialAnswers = {
    SQ1: session.secrets["SQ1"].correctVisualLabel, // Correct
    SQ2: "Z", // Wrong
    SQ3: session.secrets["SQ3"].correctVisualLabel, // Correct
    SQ4: "WrongOption", // Wrong
  };

  const partialResult = gradeExamAttempt(session.secrets, partialAnswers);
  assert.equal(partialResult.score, 2, "Partial answers should score 2 / 4");
  assert.equal(partialResult.percentage, 50, "Percentage should be 50%");
  assert.equal(partialResult.passed, false, "50% should fail threshold (60%)");
});
