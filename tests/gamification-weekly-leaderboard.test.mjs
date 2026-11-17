import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("Gamification System — 1. SQL Migration Script Verification", () => {
  const sqlPath = path.join(root, "supabase", "migrations", "add_gamification_system.sql");
  assert.ok(fs.existsSync(sqlPath), "Migration SQL file must exist at supabase/migrations/add_gamification_system.sql");

  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  assert.match(sqlContent, /CREATE TABLE IF NOT EXISTS student_gamification/i, "Must create student_gamification table");
  assert.match(sqlContent, /total_xp\s+INTEGER/i, "Must have total_xp column");
  assert.match(sqlContent, /weekly_xp\s+INTEGER/i, "Must have weekly_xp column");
  assert.match(sqlContent, /current_streak\s+INTEGER/i, "Must have current_streak column");
  assert.match(sqlContent, /longest_streak\s+INTEGER/i, "Must have longest_streak column");
  assert.match(sqlContent, /last_activity_date\s+DATE/i, "Must have last_activity_date column");
  assert.match(sqlContent, /grade_level\s+TEXT/i, "Must have grade_level column");

  assert.match(sqlContent, /CREATE TABLE IF NOT EXISTS xp_transactions/i, "Must create xp_transactions table");
  assert.match(sqlContent, /action_type\s+TEXT\s+NOT\s+NULL/i, "Must have action_type in transactions");
  assert.match(sqlContent, /xp_earned\s+INTEGER/i, "Must have xp_earned in transactions");
  assert.match(sqlContent, /reference_id\s+TEXT/i, "Must have reference_id in transactions");

  assert.match(sqlContent, /ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY/i, "Must enable RLS on student_gamification");
  assert.match(sqlContent, /ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY/i, "Must enable RLS on xp_transactions");
  assert.match(sqlContent, /CREATE OR REPLACE FUNCTION get_weekly_leaderboard/i, "Must define get_weekly_leaderboard RPC function");
});

test("Gamification System — 2. Drizzle ORM Schema & Self-Healing DDL", () => {
  const schemaPath = path.join(root, "src", "db", "schema.ts");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  assert.match(schemaContent, /export const studentGamification = pgTable\(\s*"student_gamification"/, "Must export studentGamification pgTable");
  assert.match(schemaContent, /totalXp:\s*integer\("total_xp"\)/, "Must define totalXp");
  assert.match(schemaContent, /weeklyXp:\s*integer\("weekly_xp"\)/, "Must define weeklyXp");
  assert.match(schemaContent, /currentStreak:\s*integer\("current_streak"\)/, "Must define currentStreak");
  assert.match(schemaContent, /longestStreak:\s*integer\("longest_streak"\)/, "Must define longestStreak");
  assert.match(schemaContent, /lastActivityDate:\s*text\("last_activity_date"\)/, "Must define lastActivityDate");
  assert.match(schemaContent, /gradeLevel:\s*text\("grade_level"\)/, "Must define gradeLevel");

  assert.match(schemaContent, /export const xpTransactions = pgTable\(\s*"xp_transactions"/, "Must export xpTransactions pgTable");
  assert.match(schemaContent, /actionType:\s*text\("action_type"\)/, "Must define actionType");
  assert.match(schemaContent, /xpEarned:\s*integer\("xp_earned"\)/, "Must define xpEarned");

  const migratePath = path.join(root, "src", "db", "migrate-and-seed.ts");
  const migrateContent = fs.readFileSync(migratePath, "utf-8");
  assert.match(migrateContent, /CREATE TABLE IF NOT EXISTS student_gamification/, "Must have self-healing student_gamification SQL");
  assert.match(migrateContent, /CREATE TABLE IF NOT EXISTS xp_transactions/, "Must have self-healing xp_transactions SQL");
});

test("Gamification System — 3. Gamification & Leaderboard API Routes", () => {
  const gamificationRoute = path.join(root, "src", "app", "api", "gamification", "route.ts");
  assert.ok(fs.existsSync(gamificationRoute), "src/app/api/gamification/route.ts must exist");
  const gamificationContent = fs.readFileSync(gamificationRoute, "utf-8");
  assert.match(gamificationContent, /export async function GET/, "Must export GET in gamification route");
  assert.match(gamificationContent, /export async function POST/, "Must export POST in gamification route");
  assert.match(gamificationContent, /action === "award_xp"/, "Must handle award_xp action");
  assert.match(gamificationContent, /action === "update_streak"/, "Must handle update_streak action");

  const leaderboardRoute = path.join(root, "src", "app", "api", "gamification", "leaderboard", "route.ts");
  assert.ok(fs.existsSync(leaderboardRoute), "src/app/api/gamification/leaderboard/route.ts must exist");
  const leaderboardContent = fs.readFileSync(leaderboardRoute, "utf-8");
  assert.match(leaderboardContent, /export async function GET/, "Must export GET in leaderboard route");
  assert.match(leaderboardContent, /pointsToNextRank/, "Must compute pointsToNextRank for motivating feedback");
  assert.match(leaderboardContent, /topPodium/, "Must return topPodium object");
});

test("Gamification System — 4. Client Service & Hook Layer", () => {
  const servicePath = path.join(root, "src", "lib", "gamification-service.ts");
  assert.ok(fs.existsSync(servicePath), "src/lib/gamification-service.ts must exist");
  const serviceContent = fs.readFileSync(servicePath, "utf-8");
  assert.match(serviceContent, /export async function awardXP/, "Must export awardXP");
  assert.match(serviceContent, /export async function fetchGamificationProfile/, "Must export fetchGamificationProfile");
  assert.match(serviceContent, /export async function fetchWeeklyLeaderboard/, "Must export fetchWeeklyLeaderboard");
  assert.match(serviceContent, /export function subscribeGamificationToast/, "Must export toast subscriber");

  const hookPath = path.join(root, "src", "hooks", "useGamification.ts");
  assert.ok(fs.existsSync(hookPath), "src/hooks/useGamification.ts must exist");
  const hookContent = fs.readFileSync(hookPath, "utf-8");
  assert.match(hookContent, /export function useGamification/, "Must export useGamification hook");
  assert.match(hookContent, /triggerXP/, "Must provide triggerXP method");
});

test("Gamification System — 5. UI Components Verification", () => {
  const pillPath = path.join(root, "src", "components", "gamification", "HeaderGamificationPill.tsx");
  assert.ok(fs.existsSync(pillPath), "HeaderGamificationPill.tsx must exist");
  const pillContent = fs.readFileSync(pillPath, "utf-8");
  assert.match(pillContent, /Flame/, "Must show flame icon for streak");
  assert.match(pillContent, /Star/, "Must show star icon for total XP");
  assert.match(pillContent, /Trophy/, "Must show trophy icon for rank");

  const leaderboardViewPath = path.join(root, "src", "components", "gamification", "WeeklyLeaderboardView.tsx");
  assert.ok(fs.existsSync(leaderboardViewPath), "WeeklyLeaderboardView.tsx must exist");
  const lbContent = fs.readFileSync(leaderboardViewPath, "utf-8");
  assert.match(lbContent, /Crown/, "Must render Crown for #1 on podium");
  assert.match(lbContent, /Medal/, "Must render Medals for #2 and #3");
  assert.match(lbContent, /userRow/, "Must render sticky footer for student rank");
  assert.match(lbContent, /pointsToNextRank/, "Must show points to next rank");

  const widgetPath = path.join(root, "src", "components", "gamification", "CompactLeaderboardWidget.tsx");
  assert.ok(fs.existsSync(widgetPath), "CompactLeaderboardWidget.tsx must exist");
});

test("Gamification System — 6. Integration across Navbar, Dashboard, and Activities", () => {
  const navbarPath = path.join(root, "src", "components", "Navbar.tsx");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");
  assert.match(navbarContent, /HeaderGamificationPill/, "Must embed HeaderGamificationPill in Navbar");
  assert.match(navbarContent, /id: "leaderboard"/, "Must have leaderboard item in Navbar");

  const dashboardPath = path.join(root, "src", "components", "StudentDashboard.tsx");
  const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");
  assert.match(dashboardContent, /CompactLeaderboardWidget/, "Must mount CompactLeaderboardWidget in StudentDashboard");

  const quizPath = path.join(root, "src", "components", "QuizPlayer.tsx");
  const quizContent = fs.readFileSync(quizPath, "utf-8");
  assert.match(quizContent, /awardXP/, "Must call awardXP in QuizPlayer");

  const mistakesPath = path.join(root, "src", "components", "mistakes", "MistakesBankWorkspace.tsx");
  const mistakesContent = fs.readFileSync(mistakesPath, "utf-8");
  assert.match(mistakesContent, /awardXP/, "Must call awardXP in MistakesBankWorkspace");
});
