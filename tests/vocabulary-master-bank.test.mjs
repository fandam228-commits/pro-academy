import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Professional Vocabulary Master Bank - Schema, 4 Tables & Query Engine", async (t) => {
  // Dynamically import the TypeScript / compiled module
  // Using node with tsx / ES module loader or testing the master data directly
  const {
    CORE_VOCABULARY_TABLE,
    EXTRA_VOCABULARY_TABLE,
    SYNONYMS_ANTONYMS_TABLE,
    PREPOSITIONS_EXPRESSIONS_TABLE,
    queryVocabularyBank,
    generateInteractiveVocabularyQuiz,
  } = await import("../src/data/vocabulary-master-bank/index.ts");

  await t.test("Table 1: Core Vocabulary Integrity (Sec 1, Sec 2, Sec 3)", () => {
    assert.ok(Array.isArray(CORE_VOCABULARY_TABLE), "Core table must be an array");
    assert.ok(CORE_VOCABULARY_TABLE.length >= 25, "Must contain at least 25 core words");

    CORE_VOCABULARY_TABLE.forEach((item) => {
      assert.ok(item.id, "Item must have id");
      assert.ok(item.word && item.word.length > 1, `Word must be valid: ${item.word}`);
      assert.ok(item.pos, `Must have part of speech: ${item.word}`);
      assert.ok(item.meaningAr, `Must have Arabic meaning: ${item.word}`);
      assert.ok(item.definitionEn, `Must have English definition: ${item.word}`);
      assert.ok(item.exampleEn, `Must have example sentence: ${item.word}`);
      assert.ok(["sec_1", "sec_2", "sec_3", "prep_1", "prep_2", "prep_3"].includes(item.gradeCode));
      assert.ok(item.sourceFile, `Must have source file: ${item.word}`);
      assert.ok(item.sourcePage > 0, `Must have source page: ${item.word}`);
      assert.equal(item.isCore, true, "isCore must be strictly true");
    });
  });

  await t.test("Table 2: Extra Vocabulary Separation and Provenance", () => {
    assert.ok(Array.isArray(EXTRA_VOCABULARY_TABLE), "Extra table must be an array");
    assert.ok(EXTRA_VOCABULARY_TABLE.length > 0, "Must contain extra vocabulary");

    EXTRA_VOCABULARY_TABLE.forEach((item) => {
      assert.ok(item.id, "Extra item must have id");
      assert.ok(item.word && item.meaningAr, "Must have word and Arabic meaning");
      assert.ok(item.sourceBook, "Must specify source book");
      assert.equal(item.isCore, false, "Extra vocabulary isCore must be strictly false");
    });
  });

  await t.test("Table 3: Synonyms and Antonyms Verification", () => {
    assert.ok(Array.isArray(SYNONYMS_ANTONYMS_TABLE), "Synonyms/Antonyms table must be an array");
    assert.ok(SYNONYMS_ANTONYMS_TABLE.length >= 7, "Must contain synonyms/antonyms items");

    SYNONYMS_ANTONYMS_TABLE.forEach((item) => {
      assert.ok(item.mainWord && item.meaningAr, "Must have mainWord and meaningAr");
      assert.ok(Array.isArray(item.synonyms) && item.synonyms.length >= 2, "Must have at least 2 synonyms");
      assert.ok(Array.isArray(item.antonyms) && item.antonyms.length >= 2, "Must have at least 2 antonyms");
      assert.ok(item.sourceFile && item.sourcePage > 0, "Must cite source file and page");
    });
  });

  await t.test("Table 4: Prepositions and Expressions Verification", () => {
    assert.ok(Array.isArray(PREPOSITIONS_EXPRESSIONS_TABLE), "Expressions table must be an array");
    assert.ok(PREPOSITIONS_EXPRESSIONS_TABLE.length >= 8, "Must contain expressions");

    PREPOSITIONS_EXPRESSIONS_TABLE.forEach((item) => {
      assert.ok(item.expression && item.meaningAr, "Must have expression and meaningAr");
      assert.ok(item.expressionType, "Must have expressionType");
      assert.ok(item.exampleEn, "Must have contextual example");
      assert.ok(item.sourceBook && item.sourcePage > 0, "Must cite source book and page");
    });
  });

  await t.test("Search & Filter Query Engine", () => {
    // 1. Search Core by English word
    const resEn = queryVocabularyBank({
      tableType: "core",
      gradeCode: "sec_1",
      searchQuery: "heritage",
    });
    assert.ok(resEn.length >= 1, "Should find 'heritage' in Sec 1 Core");
    assert.equal(resEn[0].word, "heritage");

    // 2. Search Core by Arabic meaning
    const resAr = queryVocabularyBank({
      tableType: "core",
      gradeCode: "sec_1",
      searchQuery: "حضارة",
    });
    assert.ok(resAr.length >= 1, "Should find 'حضارة' (civilization)");

    // 3. Search Synonyms
    const resSyn = queryVocabularyBank({
      tableType: "synonyms_antonyms",
      searchQuery: "essential",
    });
    assert.ok(resSyn.length >= 1);
    assert.ok(resSyn[0].synonyms.includes("necessary"));

    // 4. Search Expressions
    const resExp = queryVocabularyBank({
      tableType: "prepositions_expressions",
      searchQuery: "pride",
    });
    assert.ok(resExp.length >= 1);
    assert.equal(resExp[0].expression, "take pride in");
  });

  await t.test("Interactive Training Quiz Generator (10 Modes)", () => {
    const quiz = generateInteractiveVocabularyQuiz("sec_1");
    assert.equal(quiz.length, 10, "Quiz must generate exactly 10 questions");

    quiz.forEach((q, idx) => {
      assert.ok(q.id, `Question ${idx + 1} must have id`);
      assert.ok(q.promptEn, `Question ${idx + 1} must have promptEn`);
      assert.ok(Array.isArray(q.options) && q.options.length >= 4, `Question ${idx + 1} must have 4 options`);
      assert.ok(q.options.includes(q.correctAnswer), `Question ${idx + 1} correctAnswer must be in options`);
      assert.ok(q.explanationAr, `Question ${idx + 1} must have explanationAr`);
      assert.ok(q.sourceReference, `Question ${idx + 1} must have source reference`);
    });
  });
});
