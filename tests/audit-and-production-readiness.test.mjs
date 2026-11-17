import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("Audit Check 1: Master SQL Script (00_master_verify_and_fix.sql) Integrity", () => {
  const masterSqlPath = path.join(rootDir, "supabase", "migrations", "00_master_verify_and_fix.sql");
  assert.ok(fs.existsSync(masterSqlPath), "00_master_verify_and_fix.sql must exist");

  const content = fs.readFileSync(masterSqlPath, "utf-8");

  // Check required tables
  const requiredTables = [
    "users",
    "user_mistakes",
    "student_gamification",
    "xp_transactions",
    "translation_exercises",
    "user_translation_attempts",
    "novel_chapters",
    "student_literature_progress",
    "access_vouchers",
    "user_subscriptions",
    "essay_topics",
    "user_essays",
    "mock_exams",
    "mock_exam_attempts",
    "exam_attempts",
    "vocab_cards",
    "user_vocab_progress",
    "center_attendance",
    "lesson_prerequisites",
  ];

  for (const table of requiredTables) {
    assert.ok(
      content.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
      `Master SQL must contain CREATE TABLE IF NOT EXISTS for '${table}'`
    );
  }

  // Check RLS enabled
  assert.ok(content.includes("ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;"));
  assert.ok(content.includes("ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;"));
  assert.ok(content.includes("ALTER TABLE access_vouchers ENABLE ROW LEVEL SECURITY;"));

  // Check RPC get_weekly_leaderboard
  assert.ok(
    content.includes("CREATE OR REPLACE FUNCTION get_weekly_leaderboard"),
    "Master SQL must create get_weekly_leaderboard function"
  );
});

test("Audit Check 2: All 11 Dashboard and Core App Routes Exist as Physical Files", () => {
  const expectedRouteFiles = [
    "src/app/page.tsx",
    "src/app/login/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/dashboard/mistakes/page.tsx",
    "src/app/dashboard/leaderboard/page.tsx",
    "src/app/dashboard/translation/page.tsx",
    "src/app/dashboard/literature/page.tsx",
    "src/app/dashboard/essay-lab/page.tsx",
    "src/app/dashboard/exam-simulator/page.tsx",
    "src/app/dashboard/flashcards/page.tsx",
    "src/app/dashboard/activate/page.tsx",
    "src/app/dashboard/my-qr/page.tsx",
  ];

  for (const relPath of expectedRouteFiles) {
    const fullPath = path.join(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `Route file '${relPath}' must exist`);
  }
});

test("Audit Check 3: Middleware Correctly Allows Landing Page and Protects Dashboard", () => {
  const middlewarePath = path.join(rootDir, "src", "middleware.ts");
  const content = fs.readFileSync(middlewarePath, "utf-8");

  assert.ok(content.includes('"/"'), 'PUBLIC_PAGE_PATHS must include "/" for the Landing Page');
  assert.ok(content.includes('"/login"'), 'PUBLIC_PAGE_PATHS must include "/login"');
  assert.ok(content.includes("hasToken"), "Middleware must check session hasToken");
  assert.ok(content.includes("returnUrl"), "Middleware must preserve returnUrl on redirect to login");
});

test("Audit Check 4: PWA Manifest and Service Worker Auth Bypass", () => {
  const manifestTsPath = path.join(rootDir, "src", "app", "manifest.ts");
  const manifestJsonPath = path.join(rootDir, "public", "manifest.json");
  const swPath = path.join(rootDir, "public", "sw.js");

  const manifestTs = fs.readFileSync(manifestTsPath, "utf-8");
  const manifestJson = fs.readFileSync(manifestJsonPath, "utf-8");
  const sw = fs.readFileSync(swPath, "utf-8");

  // Manifest targets should use ?tab=translation (not stale translation_academy)
  assert.ok(manifestTs.includes("/?tab=translation"));
  assert.ok(manifestJson.includes("/?tab=translation"));

  // Service worker must bypass caching for auth mutations
  assert.ok(sw.includes('url.pathname.startsWith("/api/auth")'), "SW must explicitly exclude /api/auth from caching");
  assert.ok(sw.includes('request.method !== "GET"'), "SW must bypass non-GET mutation requests");
});

test("Audit Check 5: Mobile UI Polish, Non-Overlapping Prompts & Bidirectional Text (dir=ltr)", () => {
  const pwaPromptPath = path.join(rootDir, "src", "components", "InstallAppPrompt.tsx");
  const whatsappPath = path.join(rootDir, "src", "components", "WhatsAppButton.tsx");
  const mistakesWorkspacePath = path.join(rootDir, "src", "components", "mistakes", "MistakesBankWorkspace.tsx");
  const adminPanelPath = path.join(rootDir, "src", "components", "admin", "HabibAdminControlPanel.tsx");
  const adminVouchersPath = path.join(rootDir, "src", "components", "admin", "AdminVouchersModule.tsx");

  const pwaPrompt = fs.readFileSync(pwaPromptPath, "utf-8");
  const whatsapp = fs.readFileSync(whatsappPath, "utf-8");
  const mistakes = fs.readFileSync(mistakesWorkspacePath, "utf-8");
  const adminPanel = fs.readFileSync(adminPanelPath, "utf-8");
  const adminVouchers = fs.readFileSync(adminVouchersPath, "utf-8");

  // Floating prompts must clear mobile bottom nav (bottom-20)
  assert.ok(pwaPrompt.includes("bottom-20"), "InstallAppPrompt must use bottom-20 on mobile to avoid overlapping nav");
  assert.ok(whatsapp.includes("bottom-20"), "WhatsAppButton must use bottom-20 on mobile to avoid overlapping nav");

  // English question text in Mistakes Bank must have dir="ltr"
  assert.ok(mistakes.includes('dir="ltr"'), "MistakesBankWorkspace must use dir=ltr for English text and options");

  // Print CSS
  assert.ok(adminPanel.includes("print:hidden"), "HabibAdminControlPanel must hide sidebar/header on print");
  assert.ok(adminVouchers.includes("print:hidden"), "AdminVouchersModule must hide header/stats on print");
  assert.ok(adminVouchers.includes("print:grid-cols-3"), "AdminVouchersModule must use 3-column print layout");
});
