import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("El-Amaliqa: 2nd Secondary Baccalaureate 2027 Extracted Dataset Integrity", () => {
  const amaliqaPath = path.join(__dirname, "../src/data/secondary-2027/sec2-bac-amaliqa-mcq-extracted.json");
  assert.ok(fs.existsSync(amaliqaPath), "sec2-bac-amaliqa-mcq-extracted.json must exist");
  const questions = JSON.parse(fs.readFileSync(amaliqaPath, "utf-8"));

  assert.equal(questions.length, 111, "Must contain exactly 111 pristine questions from El-Amaliqa Parts 1, 2, and 3");

  for (const q of questions) {
    // 1. Strict 4 options
    assert.equal(Array.isArray(q.options), true, `Options must be array in ${q.id}`);
    assert.equal(q.options.length, 4, `Question ${q.id} must have exactly 4 options`);
    const uniqueOptions = new Set(q.options.map((o) => String(o).trim().toLowerCase()));
    assert.equal(uniqueOptions.size, 4, `Options must be distinct in ${q.id}`);

    // 2. Correct answer exists in options
    assert.ok(q.options.includes(q.correctAnswer), `correctAnswer '${q.correctAnswer}' not in options of ${q.id}`);

    // 3. Question stem non-empty and educational
    assert.ok(q.questionText && q.questionText.trim().length >= 15, `Stem too short in ${q.id}`);

    // 4. Grade, Stage, Curriculum, Term standards
    assert.equal(q.stage, "Secondary");
    assert.equal(q.grade, "Second Secondary (Baccalaureate)");
    assert.equal(q.curriculum, "Baccalaureate");
    assert.equal(q.term, "First");

    // 5. Arabic explanation present
    assert.ok(q.explanation && q.explanation.length > 0, `Explanation missing in ${q.id}`);
  }
});

test("El-Amaliqa: Master Question Bank and Training Center Integration", () => {
  const masterPath = path.join(__dirname, "../src/data/question-bank-2027-master.json");
  const tcPath = path.join(__dirname, "../src/data/training-center-extracted-questions.json");

  const masterQs = JSON.parse(fs.readFileSync(masterPath, "utf-8"));
  const tcQs = JSON.parse(fs.readFileSync(tcPath, "utf-8"));

  const masterAmaliqa = masterQs.filter((q) => q.id.includes("amaliqa"));
  assert.equal(masterAmaliqa.length, 111, "All 111 El-Amaliqa questions must be present in Master Question Bank");

  const tcAmaliqa = tcQs.filter((q) => q.id.startsWith("TRQ-SEC2-AML-"));
  assert.equal(tcAmaliqa.length, 111, "All 111 El-Amaliqa questions must be present in Training Center");

  // Every Amaliqa question in TC has 4 labeled options [a, b, c, d]
  for (const q of tcAmaliqa) {
    assert.equal(q.optionsCount, 4);
    assert.equal(q.options.length, 4);
    assert.deepEqual(q.options.map((o) => o.label), ["a", "b", "c", "d"]);
    assert.ok(["a", "b", "c", "d"].includes(q.correctAnswer));
    assert.equal(q.validationStatus, "complete_verified");
    assert.equal(q.isPublished, true);
  }
});

test("El-Amaliqa: Interactive Exam Balance and Streak Standards", async () => {
  const { AMALIQA_INTERACTIVE_EXAMS } = await import("../src/data/amaliqa-revision-index.ts");
  assert.ok(AMALIQA_INTERACTIVE_EXAMS["amaliqa_sec2_bac_exam1"], "amaliqa_sec2_bac_exam1 must exist");

  const exam = AMALIQA_INTERACTIVE_EXAMS["amaliqa_sec2_bac_exam1"];
  assert.equal(exam.questions.length, 25, "Exam must have 25 questions");

  const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let maxStreak = 1;
  let currentStreak = 1;
  let prevIdx = -1;

  for (const q of exam.questions) {
    assert.equal(q.options.length, 4);
    const idx = q.options.indexOf(q.correctAnswer);
    assert.ok(idx !== -1, `Correct answer '${q.correctAnswer}' not in options of ${q.id}`);
    counts[idx] = (counts[idx] || 0) + 1;

    if (idx === prevIdx) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
    prevIdx = idx;
  }

  // Check max streak <= 2
  assert.ok(maxStreak <= 2, `Max streak ${maxStreak} exceeds 2`);

  // Check balanced distribution (each position between 5 and 8 out of 25)
  for (let i = 0; i < 4; i++) {
    assert.ok(counts[i] >= 5 && counts[i] <= 8, `Position ${i} count ${counts[i]} outside range [5, 8]`);
  }
});
