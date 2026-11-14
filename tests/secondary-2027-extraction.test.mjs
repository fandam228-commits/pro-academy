import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Secondary 2027 Master Content Extraction - Pilot Unit 1 Validation", async (t) => {
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
