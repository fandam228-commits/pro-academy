import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  evaluateSmartTranslation,
  normalizeArabic,
  normalizeEnglish,
} from "../src/lib/translation-evaluator.ts";
import { INTERACTIVE_TRANSLATION_SEEDS } from "../src/data/interactive-translation-seed.ts";

test("1. Database Schema & Migration SQL Verification", () => {
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/create_translation_academy.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration SQL file should exist");

  const migrationContent = fs.readFileSync(migrationPath, "utf-8");
  assert.match(migrationContent, /CREATE TABLE IF NOT EXISTS translation_exercises/i);
  assert.match(migrationContent, /CREATE TABLE IF NOT EXISTS user_translation_attempts/i);
  assert.match(migrationContent, /idx_trans_ex_lookup/i);
  assert.match(migrationContent, /idx_trans_att_user/i);
  assert.match(migrationContent, /CREATE POLICY[\s\S]*?ON translation_exercises/i);
  assert.match(migrationContent, /CREATE POLICY[\s\S]*?ON user_translation_attempts/i);
  assert.match(migrationContent, /e1000000-0000-0000-0000-000000000001/i);
});

test("2. Drizzle Schema & Self-Healing Migration Definitions", () => {
  const schemaPath = path.resolve(process.cwd(), "src/db/schema.ts");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  assert.match(schemaContent, /export const translationExercises = pgTable/i);
  assert.match(schemaContent, /export const userTranslationAttempts = pgTable/i);

  const migratePath = path.resolve(process.cwd(), "src/db/migrate-and-seed.ts");
  const migrateContent = fs.readFileSync(migratePath, "utf-8");
  assert.match(migrateContent, /CREATE TABLE IF NOT EXISTS translation_exercises/i);
  assert.match(migrateContent, /seedInteractiveTranslationExercisesIfEmpty/i);
});

test("3. Seed Exercises Content and Structure Integrity", () => {
  assert.ok(Array.isArray(INTERACTIVE_TRANSLATION_SEEDS), "Seeds should be an array");
  assert.strictEqual(INTERACTIVE_TRANSLATION_SEEDS.length, 6, "Must contain exactly 6 high-value exercises");

  const writtenEnToAr = INTERACTIVE_TRANSLATION_SEEDS.find(
    (e) => e.exerciseType === "written" && e.direction === "en_to_ar"
  );
  assert.ok(writtenEnToAr, "Should have En -> Ar written exercise");
  assert.ok(writtenEnToAr.keyVocabulary.length >= 4, "Should have at least 4 key vocabulary terms");

  const mcqEnToAr = INTERACTIVE_TRANSLATION_SEEDS.find(
    (e) => e.exerciseType === "mcq" && e.direction === "en_to_ar"
  );
  assert.ok(mcqEnToAr, "Should have En -> Ar MCQ exercise");
  assert.strictEqual(mcqEnToAr.mcqOptions?.options.length, 4, "MCQ must have 4 options");
  assert.ok(mcqEnToAr.mcqOptions?.trap_explanations["1"], "Should explain trap in option 1");

  const writtenArToEn = INTERACTIVE_TRANSLATION_SEEDS.find(
    (e) => e.exerciseType === "written" && e.direction === "ar_to_en"
  );
  assert.ok(writtenArToEn, "Should have Ar -> En written exercise");
  assert.ok(writtenArToEn.keyVocabulary.length >= 4, "Should have key vocabulary terms");

  const mcqArToEn = INTERACTIVE_TRANSLATION_SEEDS.find(
    (e) => e.exerciseType === "mcq" && e.direction === "ar_to_en"
  );
  assert.ok(mcqArToEn, "Should have Ar -> En MCQ exercise");
  assert.strictEqual(mcqArToEn.mcqOptions?.options.length, 4, "MCQ must have 4 options");
});

test("4. Normalization Helpers (Arabic & English)", () => {
  const normAr = normalizeArabic("تَلْعَبُ التِّكْنُولُوجِيَا الحَدِيثَةُ دَوْراً حَيَوِيّاً في إِصْلاحِ المَنْظُومَةِ!");
  assert.ok(!normAr.includes("ً"), "Diacritics must be removed");
  assert.ok(normAr.includes("التكنولوجيا الحديثه دورا حيويا"), "Taa marbuta and alef must be normalized");

  const normEn = normalizeEnglish("Don't compromise future generations' needs!");
  assert.ok(normEn.includes("do not compromise"), "Contractions should be expanded");
});

test("5. Smart Translation Evaluator — High Quality En -> Ar Submission", () => {
  const ex = INTERACTIVE_TRANSLATION_SEEDS[0];
  const perfectInput = "تلعب التكنولوجيا الحديثة دورا حيويا في اصلاح المنظومة التعليمية واعداد الطلاب لسوق العمل.";

  const result = evaluateSmartTranslation({
    studentInput: perfectInput,
    modelAnswer: ex.modelAnswer,
    alternativeAnswers: ex.alternativeAnswers,
    keyVocabulary: ex.keyVocabulary,
    direction: ex.direction,
    grammarTip: ex.grammarTip,
  });

  assert.ok(result.accuracyScore >= 85, `Score should be >= 85%, got: ${result.accuracyScore}`);
  assert.strictEqual(result.tier, "excellent");
  assert.strictEqual(result.isEligibleForXP, true, "Should be eligible for +25 XP");
  assert.strictEqual(result.missedKeywords.length, 0, "No keywords should be missed for perfect input");
  assert.ok(result.matchedKeywords.length >= 4, "Should match key terms");
});

test("6. Smart Translation Evaluator — Acceptable Variation En -> Ar Submission", () => {
  const ex = INTERACTIVE_TRANSLATION_SEEDS[0];
  // Slightly different phrasing, using alternative wording
  const studentInput = "تسهم التكنولوجيا الحديثة بشكل حيوي في تطوير المنظومة التعليمية وتجهيز الطلاب لسوق العمل.";

  const result = evaluateSmartTranslation({
    studentInput,
    modelAnswer: ex.modelAnswer,
    alternativeAnswers: ex.alternativeAnswers,
    keyVocabulary: ex.keyVocabulary,
    direction: ex.direction,
    grammarTip: ex.grammarTip,
  });

  assert.ok(result.accuracyScore >= 60, `Score should be acceptable (>= 60%), got: ${result.accuracyScore}`);
  assert.strictEqual(result.isEligibleForXP, true, "Should earn XP");
  assert.ok(["excellent", "acceptable"].includes(result.tier));
});

test("7. Smart Translation Evaluator — Incomplete / Poor Submission", () => {
  const ex = INTERACTIVE_TRANSLATION_SEEDS[0];
  const poorInput = "التكنولوجيا مفيدة جدا للناس.";

  const result = evaluateSmartTranslation({
    studentInput: poorInput,
    modelAnswer: ex.modelAnswer,
    alternativeAnswers: ex.alternativeAnswers,
    keyVocabulary: ex.keyVocabulary,
    direction: ex.direction,
    grammarTip: ex.grammarTip,
  });

  assert.ok(result.accuracyScore < 60, `Score should be < 60%, got: ${result.accuracyScore}`);
  assert.strictEqual(result.tier, "needs_work");
  assert.strictEqual(result.isEligibleForXP, false, "Should not earn XP for failing attempt");
  assert.ok(result.missedKeywords.length > 0, "Should have missed keywords");
});

test("8. Smart Translation Evaluator — Ar -> En High Quality Submission", () => {
  const ex = INTERACTIVE_TRANSLATION_SEEDS[3]; // Grand Egyptian Museum
  const perfectInput = "The Grand Egyptian Museum is considered a cultural monument that attracts millions of tourists from all over the world annually.";

  const result = evaluateSmartTranslation({
    studentInput: perfectInput,
    modelAnswer: ex.modelAnswer,
    alternativeAnswers: ex.alternativeAnswers,
    keyVocabulary: ex.keyVocabulary,
    direction: ex.direction,
    grammarTip: ex.grammarTip,
  });

  assert.ok(result.accuracyScore >= 85, `Score should be >= 85%, got: ${result.accuracyScore}`);
  assert.strictEqual(result.tier, "excellent");
  assert.strictEqual(result.isEligibleForXP, true);
  assert.ok(result.matchedKeywords.some((k) => k.term === "cultural monument"));
});

test("9. UI Workspace & Navigation Integration", () => {
  const workspacePath = path.resolve(
    process.cwd(),
    "src/components/translation/InteractiveTranslationWorkspace.tsx"
  );
  assert.ok(fs.existsSync(workspacePath), "InteractiveTranslationWorkspace component should exist");
  const content = fs.readFileSync(workspacePath, "utf-8");
  assert.match(content, /export const InteractiveTranslationWorkspace/i);
  assert.match(content, /awardXP/i);
  assert.match(content, /recordMistake/i);
  assert.match(content, /ترجمة تحريرية ذكية/i);
  assert.match(content, /ترجمة الاختيار من متعدد/i);

  const parentPath = path.resolve(
    process.cwd(),
    "src/components/translation/TranslationAcademyWorkspace.tsx"
  );
  const parentContent = fs.readFileSync(parentPath, "utf-8");
  assert.match(parentContent, /InteractiveTranslationWorkspace/i);
  assert.match(parentContent, /المختبر التفاعلي الذكي/i);
});
