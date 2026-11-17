import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("Smart Mistakes Bank — 1. SQL Migration Script Verification", () => {
  const sqlPath = path.join(root, "supabase", "migrations", "create_user_mistakes.sql");
  assert.ok(fs.existsSync(sqlPath), "Migration SQL file must exist at supabase/migrations/create_user_mistakes.sql");

  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  assert.match(sqlContent, /CREATE TABLE IF NOT EXISTS user_mistakes/i, "Must create user_mistakes table");
  assert.match(sqlContent, /user_id\s+TEXT\s+NOT\s+NULL/i, "Must have user_id column");
  assert.match(sqlContent, /question_id\s+TEXT\s+NOT\s+NULL/i, "Must have question_id column");
  assert.match(sqlContent, /question_snapshot\s+JSONB/i, "Must have question_snapshot JSONB column");
  assert.match(sqlContent, /wrong_answer\s+TEXT/i, "Must have wrong_answer column");
  assert.match(sqlContent, /mistake_count\s+INTEGER/i, "Must have mistake_count column");
  assert.match(sqlContent, /status\s+TEXT.*DEFAULT\s+'unresolved'/i, "Must have status column with 'unresolved' default");
  assert.match(sqlContent, /CONSTRAINT.*UNIQUE\s*\(user_id,\s*question_id\)/i, "Must have unique constraint on (user_id, question_id)");
  assert.match(sqlContent, /ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY/i, "Must enable Row Level Security (RLS)");
  assert.match(sqlContent, /CREATE POLICY[\s\S]*?ON user_mistakes/i, "Must define RLS policies");
  assert.match(sqlContent, /update_user_mistakes_timestamp/i, "Must define auto-update timestamp trigger");
});

test("Smart Mistakes Bank — 2. Drizzle ORM Schema Verification", () => {
  const schemaPath = path.join(root, "src", "db", "schema.ts");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  assert.match(schemaContent, /export const userMistakes = pgTable\(\s*"user_mistakes"/, "Must export userMistakes pgTable");
  assert.match(schemaContent, /userId:\s*text\("user_id"\)\.notNull\(\)/, "Must define userId");
  assert.match(schemaContent, /questionId:\s*text\("question_id"\)\.notNull\(\)/, "Must define questionId");
  assert.match(schemaContent, /questionSnapshot:\s*jsonb\("question_snapshot"\)\.notNull\(\)/, "Must define questionSnapshot JSONB");
  assert.match(schemaContent, /wrongAnswer:\s*text\("wrong_answer"\)/, "Must define wrongAnswer");
  assert.match(schemaContent, /mistakeCount:\s*integer\("mistake_count"\)/, "Must define mistakeCount");
  assert.match(schemaContent, /status:\s*text\("status"\)/, "Must define status");
  assert.match(schemaContent, /uniqueIndex\("idx_um_user_question"\)\.on\(table\.userId,\s*table\.questionId\)/, "Must index unique user_id + question_id");
});

test("Smart Mistakes Bank — 3. Self-Healing Migration & Seed Sync", () => {
  const migratePath = path.join(root, "src", "db", "migrate-and-seed.ts");
  const migrateContent = fs.readFileSync(migratePath, "utf-8");

  assert.match(migrateContent, /CREATE TABLE IF NOT EXISTS user_mistakes/, "Must include self-healing CREATE TABLE in migrate-and-seed.ts");
  assert.match(migrateContent, /user_mistakes_user_question_unique/, "Must include unique constraint in self-healing SQL");
});

test("Smart Mistakes Bank — 4. Mistakes API Route Verification", () => {
  const routePath = path.join(root, "src", "app", "api", "mistakes", "route.ts");
  assert.ok(fs.existsSync(routePath), "API route must exist at src/app/api/mistakes/route.ts");

  const routeContent = fs.readFileSync(routePath, "utf-8");
  assert.match(routeContent, /export async function GET/, "Must export GET handler");
  assert.match(routeContent, /export async function POST/, "Must export POST handler");
  assert.match(routeContent, /action === "record"/, "Must handle 'record' action");
  assert.match(routeContent, /action === "resolve"/, "Must handle 'resolve' action");
  assert.match(routeContent, /action === "bulk_record"/, "Must handle 'bulk_record' action");
  assert.match(routeContent, /action === "clear_mastered"/, "Must handle 'clear_mastered' action");
  assert.match(routeContent, /onConflictDoUpdate/, "Must perform UPSERT on conflict");
  assert.match(routeContent, /totalUnresolved/, "Must return stats with totalUnresolved and totalMastered");
});

test("Smart Mistakes Bank — 5. Client Service & Hook Verification", () => {
  const servicePath = path.join(root, "src", "lib", "mistakes-service.ts");
  assert.ok(fs.existsSync(servicePath), "Service must exist at src/lib/mistakes-service.ts");
  const serviceContent = fs.readFileSync(servicePath, "utf-8");
  assert.match(serviceContent, /export async function fetchMistakes/, "Must export fetchMistakes");
  assert.match(serviceContent, /export async function recordMistake/, "Must export recordMistake");
  assert.match(serviceContent, /export async function recordBulkMistakes/, "Must export recordBulkMistakes");
  assert.match(serviceContent, /export async function resolveMistake/, "Must export resolveMistake");

  const hookPath = path.join(root, "src", "hooks", "useMistakesBank.ts");
  assert.ok(fs.existsSync(hookPath), "Hook must exist at src/hooks/useMistakesBank.ts");
  const hookContent = fs.readFileSync(hookPath, "utf-8");
  assert.match(hookContent, /export function useMistakesBank/, "Must export useMistakesBank hook");
  assert.match(hookContent, /resolveQuestion/, "Must provide resolveQuestion function");
  assert.match(hookContent, /recordWrong/, "Must provide recordWrong function");
  assert.match(hookContent, /unresolvedMistakes/, "Must manage unresolvedMistakes");
  assert.match(hookContent, /masteredMistakes/, "Must manage masteredMistakes");
});

test("Smart Mistakes Bank — 6. Quiz Answer Submission Auto-Hook", () => {
  const quizPlayerPath = path.join(root, "src", "components", "QuizPlayer.tsx");
  const quizContent = fs.readFileSync(quizPlayerPath, "utf-8");

  assert.match(quizContent, /import\s*\{\s*recordBulkMistakes\s*\}\s*from\s*["']@\/lib\/mistakes-service["']/, "Must import recordBulkMistakes in QuizPlayer");
  assert.match(quizContent, /recordBulkMistakes\(mistakesToSave/, "Must automatically trigger recordBulkMistakes on quiz completion");
});

test("Smart Mistakes Bank — 7. UI Workspace & Navigation Integration", () => {
  const workspacePath = path.join(root, "src", "components", "mistakes", "MistakesBankWorkspace.tsx");
  assert.ok(fs.existsSync(workspacePath), "Workspace component must exist");
  const workspaceContent = fs.readFileSync(workspacePath, "utf-8");

  assert.match(workspaceContent, /بنك أخطائي الذكي/, "Must include Arabic title");
  assert.match(workspaceContent, /mode === "practice"/, "Must support interactive Practice Quiz Runner mode");
  assert.match(workspaceContent, /mode === "browse"/, "Must support browse review mode");
  assert.match(workspaceContent, /أحسنت! تم إتقان هذا السؤال وحذفه من بنك أخطائك/, "Must show celebration toast on mastering");

  const pagePath = path.join(root, "src", "app", "page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");
  assert.match(pageContent, /activeTab === "mistakes_bank"/, "Must handle mistakes_bank tab in page.tsx");
  assert.match(pageContent, /<MistakesBankWorkspace \/>/, "Must mount MistakesBankWorkspace");

  const navbarPath = path.join(root, "src", "components", "Navbar.tsx");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");
  assert.match(navbarContent, /id: "mistakes_bank"/, "Must include mistakes_bank in Navbar");

  const dashboardPath = path.join(root, "src", "components", "StudentDashboard.tsx");
  const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");
  assert.match(dashboardContent, /onOpenMistakesBank/, "Must support onOpenMistakesBank prop");
  assert.match(dashboardContent, /بنك أخطائي الذكي/, "Must display Mistakes Bank card in StudentDashboard");
});
