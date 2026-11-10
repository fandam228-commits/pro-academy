import test from "node:test";
import assert from "node:assert/strict";
import { parseQuestions } from "../src/lib/question-importer.ts";

test("Question Importer: empty input returns descriptive error message", () => {
  const res1 = parseQuestions("");
  assert.equal(res1.items.length, 0);
  assert.ok(res1.errors.length > 0);
  assert.match(res1.errors[0], /فارغ/);

  const res2 = parseQuestions("    \n\n  \t  ");
  assert.equal(res2.items.length, 0);
  assert.ok(res2.errors.length > 0);
});

test("Question Importer: single question import with pipe format succeeds", () => {
  const raw = "What is the capital of Egypt? | Cairo, Alexandria, Giza, Luxor | Cairo";
  const res = parseQuestions(raw, {
    stage: "Secondary",
    grade: "First Secondary",
    unit: "Unit 1",
  });

  assert.equal(res.items.length, 1);
  assert.equal(res.errors.length, 0);
  const q = res.items[0];
  assert.equal(q.questionText, "What is the capital of Egypt?");
  assert.deepEqual(q.options, ["Cairo", "Alexandria", "Giza", "Luxor"]);
  assert.equal(q.correctAnswer, "Cairo");
  assert.equal(q.grade, "First Secondary");
  assert.equal(q.unit, "Unit 1");
});

test("Question Importer: imports 5 questions cleanly across multiple lines", () => {
  const raw = [
    "Hardly had he arrived | had he, did he, he had, has he | had he",
    "No sooner had she started | than, when, that, then | than",
    "She succeeded ______ hard work. | because of, despite, although, in spite | because of",
    "By 2030, scientists ______ a cure. | will have found, found, find, were finding | will have found",
    "If he had studied, he ______ passed. | would have, will have, had, would | would have",
  ].join("\n");

  const res = parseQuestions(raw);
  assert.equal(res.items.length, 5);
  assert.equal(res.errors.length, 0);
  assert.equal(res.items[0].correctAnswer, "had he");
  assert.equal(res.items[4].correctAnswer, "would have");
});

test("Question Importer: invalid data lines are flagged and do not crash parsing", () => {
  const raw = [
    "Just a random sentence with no separators or answers",
    "Valid Question | Option A, Option B | Option A",
    "Another malformed one",
  ].join("\n");

  const res = parseQuestions(raw);
  assert.equal(res.items.length, 1);
  assert.ok(res.errors.length >= 2);
  assert.equal(res.items[0].questionText, "Valid Question");
});

test("Question Importer: letter correct answer (A/B/C/D) is resolved to option text", () => {
  const raw = "Which gas do plants absorb? | Oxygen, Carbon dioxide, Nitrogen, Helium | B";
  const res = parseQuestions(raw);

  assert.equal(res.items.length, 1);
  assert.equal(res.items[0].correctAnswer, "Carbon dioxide");
});

test("Question Importer: unlisted correct answer is appended to options to ensure solvability", () => {
  const raw = "Select the missing synonym | small, tiny, little | microscopic";
  const res = parseQuestions(raw);

  assert.equal(res.items.length, 1);
  assert.equal(res.items[0].correctAnswer, "microscopic");
  assert.ok(res.items[0].options.includes("microscopic"));
});

test("Question Importer: Excel tab-separated lines are parsed accurately", () => {
  const raw = "What is the antonym of abundant?\tscarce\tplentiful\tample\thuge\tscarce";
  const res = parseQuestions(raw);

  assert.equal(res.items.length, 1);
  assert.equal(res.items[0].questionText, "What is the antonym of abundant?");
  assert.deepEqual(res.items[0].options, ["scarce", "plentiful", "ample", "huge"]);
  assert.equal(res.items[0].correctAnswer, "scarce");
});

test("Question Importer: Word document exam multi-line format is parsed cleanly", () => {
  const doc = `1. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Saturn
Answer: B

2. What is the synonym of enormous?
A) tiny
B) huge
C) narrow
D) weak
Answer: huge`;

  const res = parseQuestions(doc);
  assert.equal(res.items.length, 2);
  assert.equal(res.items[0].questionText, "Which planet is known as the Red Planet?");
  assert.equal(res.items[0].correctAnswer, "Mars");
  assert.equal(res.items[1].questionText, "What is the synonym of enormous?");
  assert.equal(res.items[1].correctAnswer, "huge");
});
