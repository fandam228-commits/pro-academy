import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Training Center: Strict 4-Option Constraint and Balanced Answer Distribution", () => {
  const tcPath = path.join(__dirname, "../src/data/training-center-extracted-questions.json");
  assert.ok(fs.existsSync(tcPath), "training-center-extracted-questions.json must exist");
  const questions = JSON.parse(fs.readFileSync(tcPath, "utf-8"));

  assert.equal(questions.length, 894, "Must contain all 894 training questions");

  const labelCounts = { a: 0, b: 0, c: 0, d: 0 };

  for (const q of questions) {
    // 1. Strict 4-options constraint
    assert.equal(
      Array.isArray(q.options),
      true,
      `Options must be array in ${q.id}`
    );
    assert.equal(
      q.options.length,
      4,
      `Question ${q.id} must have EXACTLY 4 options, found ${q.options.length}`
    );
    assert.equal(
      q.optionsCount,
      4,
      `Question ${q.id} optionsCount must be 4`
    );

    // 2. Labels must strictly be a, b, c, d
    const labels = q.options.map((o) => o.label);
    assert.deepEqual(
      labels,
      ["a", "b", "c", "d"],
      `Options labels must be ['a', 'b', 'c', 'd'] in ${q.id}`
    );

    // 3. Option texts must be non-empty and unique
    const texts = q.options.map((o) => String(o.text || "").trim());
    for (const t of texts) {
      assert.ok(t.length > 0, `Empty option text in ${q.id}`);
    }

    // 4. Correct answer must be one of a, b, c, d
    assert.ok(
      ["a", "b", "c", "d"].includes(q.correctAnswer),
      `Invalid correctAnswer '${q.correctAnswer}' in ${q.id}`
    );
    labelCounts[q.correctAnswer]++;

    // 5. Correct answer option text must exist
    const correctOpt = q.options.find((o) => o.label === q.correctAnswer);
    assert.ok(correctOpt, `Matching correct option not found in ${q.id}`);
    assert.ok(correctOpt.text, `Correct option text empty in ${q.id}`);

    // 6. Validation status must be verified and published
    assert.equal(
      q.validationStatus,
      "complete_verified",
      `Status must be complete_verified for ${q.id}`
    );
    assert.equal(q.isPublished, true, `Question ${q.id} must be published`);
  }

  // 7. Non-stereotypical answer distribution (~25% each letter)
  // Total 894: each letter should be between 20% and 30% (around 223.5)
  for (const [letter, count] of Object.entries(labelCounts)) {
    const pct = (count / questions.length) * 100;
    assert.ok(
      pct >= 23 && pct <= 27,
      `Letter '${letter}' distribution out of balance: ${count} (${pct.toFixed(2)}%)`
    );
  }
});

test("Grammar Packages: Strict 4-Option Constraint and Balanced Answer Distribution", () => {
  const gpPath = path.join(__dirname, "../src/data/grammar-summaries-and-questions.ts");
  assert.ok(fs.existsSync(gpPath), "grammar-summaries-and-questions.ts must exist");
  const text = fs.readFileSync(gpPath, "utf-8");

  const startKw = "export const grammarPackages: Record<string, GrammarTopicPackage> = ";
  const start = text.indexOf(startKw);
  const end = text.indexOf("export const getGrammarPackage =");
  assert.ok(start !== -1 && end !== -1, "Grammar packages bounds must exist");

  let jsonPart = text.slice(start + startKw.length, end).trim();
  if (jsonPart.endsWith(";")) jsonPart = jsonPart.slice(0, -1).trim();

  const data = JSON.parse(jsonPart);
  const topics = Object.keys(data);
  assert.equal(topics.length, 9, "Must contain 9 grammar packages");

  const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let totalQuestions = 0;

  for (const topicId of topics) {
    const pkg = data[topicId];
    const qs = pkg.questions || [];
    assert.equal(qs.length, 50, `Package ${topicId} must contain 50 questions`);

    for (const q of qs) {
      totalQuestions++;
      // Strict 4 options
      assert.equal(
        Array.isArray(q.options),
        true,
        `Options must be array in ${q.id}`
      );
      assert.equal(
        q.options.length,
        4,
        `Question ${q.id} must have EXACTLY 4 options, found ${q.options.length}`
      );

      // Correct answer must exist in options
      const ca = q.correctAnswer;
      const idx = q.options.indexOf(ca);
      assert.ok(
        idx !== -1,
        `Correct answer '${ca}' must be in options of ${q.id}`
      );
      positionCounts[idx]++;
    }
  }

  assert.equal(totalQuestions, 450, "Must have exactly 450 grammar questions");

  // Non-stereotypical distribution (~25% per index 0, 1, 2, 3)
  for (const [idx, count] of Object.entries(positionCounts)) {
    const pct = (count / totalQuestions) * 100;
    assert.ok(
      pct >= 23 && pct <= 27,
      `Grammar position ${idx} distribution out of balance: ${count} (${pct.toFixed(2)}%)`
    );
  }
});

test("Story World: Strict 4-Option Constraint and Balanced Answer Distribution", () => {
  const storyDir = path.join(__dirname, "../src/data/story-world");
  const files = fs.readdirSync(storyDir).filter((f) => f.endsWith(".json"));

  let totalMcqs = 0;
  const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(storyDir, f), "utf-8"));
    const stories = Array.isArray(data) ? data : [data];

    for (const s of stories) {
      for (const ch of s.chapters || []) {
        for (const q of ch.mcqQuestions || []) {
          totalMcqs++;
          assert.equal(
            Array.isArray(q.options),
            true,
            "MCQ options must be an array"
          );
          assert.equal(
            q.options.length,
            4,
            `Story question '${q.question}' must have EXACTLY 4 options, found ${q.options.length}`
          );

          const idx = q.options.indexOf(q.correctAnswer);
          assert.ok(
            idx !== -1,
            `Story question '${q.question}' correct answer not in options`
          );
          positionCounts[idx]++;
        }
      }
    }
  }

  assert.equal(totalMcqs, 58, "Must verify all 58 Story World MCQs");

  // Distribution must be non-stereotypical (each position has at least 15%)
  for (const [idx, count] of Object.entries(positionCounts)) {
    const pct = (count / totalMcqs) * 100;
    assert.ok(
      pct >= 18 && pct <= 32,
      `Story position ${idx} distribution out of balance: ${count} (${pct.toFixed(2)}%)`
    );
  }
});

test("Translation Academy: Strict 4-Option Constraint on All Multiple-Choice Questions", () => {
  const tqPath = path.join(__dirname, "../src/data/translation-questions-complete.json");
  const questions = JSON.parse(fs.readFileSync(tqPath, "utf-8"));

  const mcqTypes = new Set([
    "mcq",
    "fill_blanks",
    "complete_translation",
    "word_selection",
    "error_identification",
    "sentence_ordering",
    "word_matching",
  ]);

  for (const q of questions) {
    if (mcqTypes.has(q.type) && Array.isArray(q.options)) {
      assert.equal(
        q.options.length,
        4,
        `Translation question ${q.id} (${q.type}) must have EXACTLY 4 options, found ${q.options.length}`
      );
    }
  }
});

test("Question Bank Seed Data: All MCQs Have Strictly 4 Options and Balanced Positions", () => {
  const seedPath = path.join(__dirname, "../src/db/seed-data.ts");
  const content = fs.readFileSync(seedPath, "utf-8");

  // Verify no empty options in initialQuestionBank
  assert.ok(
    !content.includes("options: []"),
    "Question bank seed data must not have empty options"
  );
});
