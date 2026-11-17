import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SEED_ACCESS_VOUCHERS,
  SEED_ESSAY_TOPICS,
  SEED_VOCAB_CARDS,
  SEED_MOCK_EXAM,
} from "../src/data/pro-suite-seeds.ts";

test("1. Database Schema & Migration SQL Verification", () => {
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/create_pro_suite_pack.sql");
  assert.ok(fs.existsSync(migrationPath), "create_pro_suite_pack.sql must exist");

  const sql = fs.readFileSync(migrationPath, "utf-8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS access_vouchers/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS user_subscriptions/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS essay_topics/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS user_essays/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS mock_exams/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS (exam_attempts|mock_exam_attempts)/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS vocab_cards/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS user_vocab_progress/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS center_attendance/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS lesson_prerequisites/i);
  assert.match(sql, /student_code/i);
  assert.match(sql, /idx_vouchers_code/i);
  assert.match(sql, /idx_user_subs_user/i);
  assert.match(sql, /idx_uvp_user_review/i);
  assert.match(sql, /idx_center_att_code/i);
  assert.match(sql, /PRO-8492-XK/i);
  assert.match(sql, /Sustainable Development/i);
  assert.match(sql, /piracy/i);
});

test("2. Drizzle Schema & Self-Healing Migration Definitions", () => {
  const schemaPath = path.resolve(process.cwd(), "src/db/schema.ts");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  assert.match(schema, /export const accessVouchers = pgTable/i);
  assert.match(schema, /export const userSubscriptions = pgTable/i);
  assert.match(schema, /export const essayTopics = pgTable/i);
  assert.match(schema, /export const userEssays = pgTable/i);
  assert.match(schema, /export const mockExams = pgTable/i);
  assert.match(schema, /export const mockExamAttempts = pgTable/i);
  assert.match(schema, /export const vocabCards = pgTable/i);
  assert.match(schema, /export const userVocabProgress = pgTable/i);
  assert.match(schema, /export const centerAttendance = pgTable/i);
  assert.match(schema, /export const lessonPrerequisites = pgTable/i);
  assert.match(schema, /studentCode: text\("student_code"\)/i);

  const migratePath = path.resolve(process.cwd(), "src/db/migrate-and-seed.ts");
  const migrate = fs.readFileSync(migratePath, "utf-8");
  assert.match(migrate, /CREATE TABLE IF NOT EXISTS access_vouchers/i);
  assert.match(migrate, /CREATE TABLE IF NOT EXISTS essay_topics/i);
  assert.match(migrate, /CREATE TABLE IF NOT EXISTS mock_exams/i);
  assert.match(migrate, /CREATE TABLE IF NOT EXISTS vocab_cards/i);
  assert.match(migrate, /CREATE TABLE IF NOT EXISTS center_attendance/i);
  assert.match(migrate, /seedProSuiteIfEmpty/i);
});

test("3. Pro Suite Seed Inventory Integrity", () => {
  // Vouchers
  assert.ok(Array.isArray(SEED_ACCESS_VOUCHERS) && SEED_ACCESS_VOUCHERS.length >= 5);
  const sampleV = SEED_ACCESS_VOUCHERS.find((v) => v.code === "PRO-8492-XK");
  assert.ok(sampleV, "Sample voucher PRO-8492-XK must exist");
  assert.strictEqual(sampleV.durationDays, 30);

  // Essay Topics
  assert.ok(Array.isArray(SEED_ESSAY_TOPICS) && SEED_ESSAY_TOPICS.length >= 2);
  const youthTopic = SEED_ESSAY_TOPICS.find((t) => t.titleEn.includes("Youth"));
  assert.ok(youthTopic, "Youth in Sustainable Development essay must exist");
  assert.ok(youthTopic.ideaBankAr.length >= 3, "Must have idea bank");
  assert.ok(youthTopic.helperVocab.length >= 5, "Must have helper vocab");
  assert.ok(youthTopic.modelEssay.length > 200, "Must have comprehensive model essay");

  const aiTopic = SEED_ESSAY_TOPICS.find((t) => t.titleEn.includes("Artificial Intelligence"));
  assert.ok(aiTopic, "AI in Education essay must exist");

  // Vocab Flashcards
  assert.ok(Array.isArray(SEED_VOCAB_CARDS) && SEED_VOCAB_CARDS.length >= 12);
  const piracyCard = SEED_VOCAB_CARDS.find((c) => c.word === "piracy");
  assert.ok(piracyCard, "Piracy card must exist");
  assert.ok(piracyCard.synonyms.length >= 2, "Must include synonyms");
  assert.ok(piracyCard.exampleEn, "Must include example sentence");

  // Mock Exam
  assert.ok(SEED_MOCK_EXAM, "Mock exam must exist");
  assert.strictEqual(SEED_MOCK_EXAM.durationMinutes, 180, "Duration must be 180 minutes");
  assert.ok(SEED_MOCK_EXAM.sections.mcq.length >= 4, "Must have MCQ section");
  assert.ok(SEED_MOCK_EXAM.sections.passage.questions.length >= 2, "Must have passage questions");
  assert.ok(SEED_MOCK_EXAM.sections.translation.length >= 2, "Must have translation questions");
  assert.ok(SEED_MOCK_EXAM.sections.novel.length >= 1, "Must have novel question");
  assert.ok(SEED_MOCK_EXAM.sections.essay.minWords === 180, "Must have essay prompt");
});

test("4. Pro Suite API Route Handlers Verification", () => {
  const routes = [
    { file: "src/app/api/vouchers/activate/route.ts", checks: [/POST/i, /isUsed/i, /userSubscriptions/i] },
    { file: "src/app/api/vouchers/admin/route.ts", checks: [/requireRoles/i, /GET/i, /POST/i, /batchLabel/i] },
    { file: "src/app/api/essays/topics/route.ts", checks: [/GET/i, /essayTopics/i] },
    { file: "src/app/api/essays/analyze/route.ts", checks: [/POST/i, /wordCount/i, /BASIC_WORDS_MAP/i, /awardXP/i, /TRANSITION_CONNECTORS/i] },
    { file: "src/app/api/exam-simulator/exams/route.ts", checks: [/GET/i, /mockExams/i] },
    { file: "src/app/api/exam-simulator/submit/route.ts", checks: [/POST/i, /recordMistake/i, /awardXP/i, /totalScore/i] },
    { file: "src/app/api/flashcards/deck/route.ts", checks: [/GET/i, /vocabCards/i, /dueCards/i] },
    { file: "src/app/api/flashcards/review/route.ts", checks: [/POST/i, /mastered/i, /awardXP/i, /nextReviewAt/i] },
    { file: "src/app/api/center/student-qr/route.ts", checks: [/GET/i, /QRCode\.toDataURL/i, /studentCode/i] },
    { file: "src/app/api/center/attendance/route.ts", checks: [/requireRoles/i, /POST/i, /homeworkCompleted/i, /whatsappUrl/i] },
  ];

  for (const r of routes) {
    const full = path.resolve(process.cwd(), r.file);
    assert.ok(fs.existsSync(full), `File ${r.file} must exist`);
    const content = fs.readFileSync(full, "utf-8");
    for (const chk of r.checks) {
      assert.match(content, chk, `Route ${r.file} must match check ${chk}`);
    }
  }
});

test("5. Frontend Components & Admin Integration Verification", () => {
  const components = [
    "src/components/pro-suite/VoucherActivationWorkspace.tsx",
    "src/components/pro-suite/EssayLabWorkspace.tsx",
    "src/components/pro-suite/ExamSimulatorWorkspace.tsx",
    "src/components/pro-suite/FlashcardsWorkspace.tsx",
    "src/components/pro-suite/StudentQrCardWorkspace.tsx",
    "src/components/admin/AdminVouchersModule.tsx",
    "src/components/admin/AdminCenterAttendanceModule.tsx",
  ];

  for (const c of components) {
    const full = path.resolve(process.cwd(), c);
    assert.ok(fs.existsSync(full), `Component ${c} must exist`);
  }

  // Admin panel integration
  const adminPanel = fs.readFileSync(path.resolve(process.cwd(), "src/components/admin/HabibAdminControlPanel.tsx"), "utf-8");
  assert.match(adminPanel, /AdminVouchersModule/i);
  assert.match(adminPanel, /AdminCenterAttendanceModule/i);
  assert.match(adminPanel, /vouchers/i);
  assert.match(adminPanel, /center_attendance/i);
});

test("6. Dedicated Routes Verification", () => {
  const pages = [
    "src/app/dashboard/activate/page.tsx",
    "src/app/dashboard/essay-lab/page.tsx",
    "src/app/dashboard/exam-simulator/page.tsx",
    "src/app/dashboard/flashcards/page.tsx",
    "src/app/dashboard/my-qr/page.tsx",
  ];

  for (const p of pages) {
    const full = path.resolve(process.cwd(), p);
    assert.ok(fs.existsSync(full), `Page ${p} must exist`);
    const content = fs.readFileSync(full, "utf-8");
    assert.match(content, /AppProvider/i, `Page ${p} must wrap content in AppProvider`);
  }
});
