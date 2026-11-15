import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Secondary 2027 Master Content Extraction - Unit 1 Validation", async (t) => {
  const filePath = path.join(rootDir, "src/data/secondary-2027/sec1-unit1-extracted.json");
  assert.ok(fs.existsSync(filePath), "Extracted JSON file must exist");

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  await t.test("Curriculum Metadata Integrity", () => {
    assert.equal(data.curriculumMetadata.stage, "Secondary");
    assert.equal(data.curriculumMetadata.grade, "First Secondary");
    assert.equal(data.curriculumMetadata.term, "First");
    assert.equal(data.curriculumMetadata.unitNumber, 1);
    assert.equal(data.curriculumMetadata.unitTitleEn, "Egypt's Heritage");
    assert.equal(data.curriculumMetadata.sourceFile, "أولي ثانوي ترم أول 2027 - Habib El Rahman (1).pdf");
  });

  await t.test("Key Vocabulary & Definitions Exactness", () => {
    assert.ok(Array.isArray(data.keyVocabulary) && data.keyVocabulary.length >= 20);
    assert.ok(Array.isArray(data.definitions) && data.definitions.length >= 8);

    data.keyVocabulary.forEach((v) => {
      assert.ok(v.word && v.meaningAr && v.pos, "Vocabulary word must have word, meaning, pos");
      assert.equal(v.page, 4, "Key vocabulary source page must be 4");
    });
  });

  await t.test("Reading Passage Exactness", () => {
    assert.ok(Array.isArray(data.readingPassages) && data.readingPassages.length >= 1);
    const passage = data.readingPassages[0];
    assert.ok(passage.text.includes("Egypt is a land with a heart that has been beating for thousands of years"));
    assert.equal(passage.sourcePage, 10);
  });

  await t.test("Extracted Questions Integrity (No Hallucination, Exact Options)", () => {
    assert.ok(Array.isArray(data.extractedQuestions) && data.extractedQuestions.length === 25);

    data.extractedQuestions.forEach((q) => {
      assert.ok(q.id, "Question must have an ID");
      assert.ok(q.questionText && q.questionText.length > 10, "Question text must not be truncated");
      assert.ok(Array.isArray(q.options) && q.options.length >= 4, "Must have at least 4 options");
      assert.ok(q.correctAnswer, "Must have verified correct answer");
      assert.ok([15, 16].includes(q.sourcePage), "Question source page must be 15 or 16");
      assert.equal(q.sourceDocument, "أولي ثانوي ترم أول 2027 - Habib El Rahman (1).pdf");
    });
  });
});

test("Secondary 2027 Master Content Extraction - Unit 2 Validation", async (t) => {
  const filePath = path.join(rootDir, "src/data/secondary-2027/sec1-unit2-extracted.json");
  assert.ok(fs.existsSync(filePath), "Unit 2 JSON file must exist");

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  await t.test("Curriculum Metadata Integrity", () => {
    assert.equal(data.curriculumMetadata.stage, "Secondary");
    assert.equal(data.curriculumMetadata.grade, "First Secondary");
    assert.equal(data.curriculumMetadata.unitNumber, 2);
    assert.equal(data.curriculumMetadata.unitTitleEn, "Hands Help, Hearts Care");
  });

  await t.test("Balanced Questions Integrity (36 questions, 9 of each letter, streak <= 2)", () => {
    assert.ok(Array.isArray(data.extractedQuestions) && data.extractedQuestions.length === 36);

    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let currentStreak = 1;
    let maxStreak = 1;

    data.extractedQuestions.forEach((q, idx) => {
      assert.ok(q.id && q.stemEn && q.correctAnswer);
      assert.equal(q.options.length, 4);
      assert.equal(q.options[q.correctOptionIndex], q.correctAnswer);
      counts[q.correctOptionIndex]++;

      if (idx > 0) {
        if (q.correctOptionIndex === data.extractedQuestions[idx - 1].correctOptionIndex) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 1;
        }
      }
    });

    assert.deepEqual(counts, { 0: 9, 1: 9, 2: 9, 3: 9 });
    assert.ok(maxStreak <= 2, `Max streak ${maxStreak} must be <= 2`);
  });
});

test("Secondary 2027 Master Content Extraction - Unit 3 Validation", async (t) => {
  const filePath = path.join(rootDir, "src/data/secondary-2027/sec1-unit3-extracted.json");
  assert.ok(fs.existsSync(filePath), "Unit 3 JSON file must exist");

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  await t.test("Curriculum Metadata Integrity", () => {
    assert.equal(data.curriculumMetadata.stage, "Secondary");
    assert.equal(data.curriculumMetadata.grade, "First Secondary");
    assert.equal(data.curriculumMetadata.unitNumber, 3);
    assert.equal(data.curriculumMetadata.unitTitleEn, "Truth Vs. Lies");
    assert.equal(data.curriculumMetadata.grammarTopicEn.includes("Conditionals"), true);
  });

  await t.test("Key Vocabulary, Definitions, Synonyms & Prepositions", () => {
    assert.ok(Array.isArray(data.keyVocabulary) && data.keyVocabulary.length >= 30);
    assert.ok(Array.isArray(data.definitions) && data.definitions.length >= 6);
    assert.ok(Array.isArray(data.synonymsAndAntonyms) && data.synonymsAndAntonyms.length >= 6);
    assert.ok(Array.isArray(data.expressionsAndPrepositions) && data.expressionsAndPrepositions.length >= 6);
    assert.ok(Array.isArray(data.readingPassages) && data.readingPassages.length >= 3);
  });

  await t.test("Balanced Questions Integrity (36 questions, 9 of each letter, streak <= 2)", () => {
    assert.ok(Array.isArray(data.extractedQuestions) && data.extractedQuestions.length === 36);

    const counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let currentStreak = 1;
    let maxStreak = 1;

    data.extractedQuestions.forEach((q, idx) => {
      assert.ok(q.id && q.stemEn && q.correctAnswer);
      assert.equal(q.options.length, 4);
      assert.equal(q.options[q.correctOptionIndex], q.correctAnswer);
      counts[q.correctOptionIndex]++;

      if (idx > 0) {
        if (q.correctOptionIndex === data.extractedQuestions[idx - 1].correctOptionIndex) {
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 1;
        }
      }
    });

    assert.deepEqual(counts, { 0: 9, 1: 9, 2: 9, 3: 9 });
    assert.ok(maxStreak <= 2, `Max streak ${maxStreak} must be <= 2`);
  });
});
