import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NOVEL_CHAPTERS_SEED } from "../src/data/literature-novel-seeds.ts";

test("1. Database Schema & Migration SQL Verification", () => {
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/create_literature_module.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration SQL file should exist: create_literature_module.sql");

  const migrationContent = fs.readFileSync(migrationPath, "utf-8");
  assert.match(migrationContent, /CREATE TABLE IF NOT EXISTS novel_chapters/i);
  assert.match(migrationContent, /CREATE TABLE IF NOT EXISTS student_literature_progress/i);
  assert.match(migrationContent, /idx_nc_grade_novel/i);
  assert.match(migrationContent, /idx_slp_user/i);
  assert.match(migrationContent, /CREATE POLICY[\s\S]*?ON novel_chapters/i);
  assert.match(migrationContent, /CREATE POLICY[\s\S]*?ON student_literature_progress/i);
  assert.match(migrationContent, /Great Expectations/i);
  assert.match(migrationContent, /Pip/i);
});

test("2. Drizzle Schema & Self-Healing Migration Definitions", () => {
  const schemaPath = path.resolve(process.cwd(), "src/db/schema.ts");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  assert.match(schemaContent, /export const novelChapters = pgTable/i);
  assert.match(schemaContent, /export const studentLiteratureProgress = pgTable/i);

  const migratePath = path.resolve(process.cwd(), "src/db/migrate-and-seed.ts");
  const migrateContent = fs.readFileSync(migratePath, "utf-8");
  assert.match(migrateContent, /CREATE TABLE IF NOT EXISTS novel_chapters/i);
  assert.match(migrateContent, /CREATE TABLE IF NOT EXISTS student_literature_progress/i);
  assert.match(migrateContent, /seedNovelChaptersIfEmpty/i);
});

test("3. Literature Novel Seeds Data Integrity", () => {
  assert.ok(Array.isArray(NOVEL_CHAPTERS_SEED), "NOVEL_CHAPTERS_SEED should be an array");
  assert.ok(NOVEL_CHAPTERS_SEED.length >= 3, "Must contain at least 3 flagship novel chapters");

  const geCh1 = NOVEL_CHAPTERS_SEED.find(
    (c) => c.grade_level === "3rd_sec" && c.chapter_number === 1
  );
  assert.ok(geCh1, "Great Expectations Chapter 1 for 3rd Sec must exist");
  assert.strictEqual(geCh1.novel_title, "Great Expectations");
  assert.ok(geCh1.summary_en.length > 100, "English summary should be detailed");
  assert.ok(geCh1.summary_ar.length > 100, "Arabic breakdown by Mr. Habib El Rahman should be detailed");

  // Character Cards
  assert.ok(Array.isArray(geCh1.characters) && geCh1.characters.length >= 2, "Must contain character cards");
  const pip = geCh1.characters.find((c) => c.name.includes("Pip"));
  assert.ok(pip, "Pip must be in character cards");
  assert.ok(pip.motivation_ar, "Pip must have Arabic motivation/conflict details");

  // Key Quotations
  assert.ok(Array.isArray(geCh1.key_quotations) && geCh1.key_quotations.length >= 2, "Must contain key quotations");
  assert.ok(geCh1.key_quotations[0].quote, "Quotation must have quote text");
  assert.ok(geCh1.key_quotations[0].comment_ar, "Quotation must have Mr. Habib's exam commentary in Arabic");

  // Critical Thinking Questions
  assert.ok(Array.isArray(geCh1.critical_thinking_qs) && geCh1.critical_thinking_qs.length >= 2, "Must contain critical thinking questions");
  assert.ok(geCh1.critical_thinking_qs[0].model_answer_en, "Must include model answer in English");
  assert.ok(geCh1.critical_thinking_qs[0].key_points.length >= 2, "Must include key evaluation points");

  // 2nd Sec & 1st Sec
  const kingLear = NOVEL_CHAPTERS_SEED.find((c) => c.grade_level === "2nd_sec");
  assert.ok(kingLear, "King Lear chapter must exist for 2nd Sec");
  const treasureIsland = NOVEL_CHAPTERS_SEED.find((c) => c.grade_level === "1st_sec");
  assert.ok(treasureIsland, "Treasure Island chapter must exist for 1st Sec");
});

test("4. Literature Chapters Backend API Route Implementation", () => {
  const apiRoutePath = path.resolve(process.cwd(), "src/app/api/literature/chapters/route.ts");
  assert.ok(fs.existsSync(apiRoutePath), "API route route.ts must exist");

  const routeContent = fs.readFileSync(apiRoutePath, "utf-8");
  assert.match(routeContent, /export async function GET/i, "Route must export GET handler");
  assert.match(routeContent, /export async function POST/i, "Route must export POST handler");
  assert.match(routeContent, /submit_critical_thinking/i, "POST must handle critical thinking evaluation");
  assert.match(routeContent, /save_progress/i, "POST must handle saving reading/audio progress");
  assert.match(routeContent, /awardXP/i, "Must award gamification XP");
});

test("5. Interactive Frontend Component & Views Verification", () => {
  const compPath = path.resolve(process.cwd(), "src/components/literature/InteractiveLiteratureWorkspace.tsx");
  assert.ok(fs.existsSync(compPath), "InteractiveLiteratureWorkspace.tsx must exist");

  const compContent = fs.readFileSync(compPath, "utf-8");
  assert.match(compContent, /InteractiveLiteratureWorkspace/i);
  assert.match(compContent, /bilingual_plot/i);
  assert.match(compContent, /characters/i);
  assert.match(compContent, /quotations/i);
  assert.match(compContent, /critical_thinking/i);
  assert.match(compContent, /speechSynthesis/i, "Must provide audio speech fallback");
  assert.match(compContent, /playbackRate/i, "Must provide audio playback speed controls");
  assert.match(compContent, /onNavigateHome/i, "Must support home/dashboard return navigation");
});

test("6. Dedicated Routes & Platform Navigation Integration", () => {
  const litPagePath = path.resolve(process.cwd(), "src/app/literature/page.tsx");
  assert.ok(fs.existsSync(litPagePath), "src/app/literature/page.tsx must exist");

  const dashLitPagePath = path.resolve(process.cwd(), "src/app/dashboard/literature/page.tsx");
  assert.ok(fs.existsSync(dashLitPagePath), "src/app/dashboard/literature/page.tsx must exist");

  const storyWorkspacePath = path.resolve(process.cwd(), "src/components/story/StoryWorldWorkspace.tsx");
  const storyContent = fs.readFileSync(storyWorkspacePath, "utf-8");
  assert.match(storyContent, /InteractiveLiteratureWorkspace/i);
  assert.match(storyContent, /activeTab === "literature"/i);

  const mainPagePath = path.resolve(process.cwd(), "src/app/page.tsx");
  const mainContent = fs.readFileSync(mainPagePath, "utf-8");
  assert.match(mainContent, /InteractiveLiteratureWorkspace/i);
  assert.match(mainContent, /activeTab === "literature"/i);
});
