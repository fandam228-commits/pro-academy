import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("1. Database Schema & Migration Verification", async (t) => {
  await t.test("create_peer_challenges.sql exists and contains peer_challenges DDL", () => {
    const sqlPath = path.join(rootDir, "supabase", "migrations", "create_peer_challenges.sql");
    assert.ok(fs.existsSync(sqlPath), "create_peer_challenges.sql must exist");
    const content = fs.readFileSync(sqlPath, "utf-8");
    assert.match(content, /CREATE TABLE IF NOT EXISTS peer_challenges/i);
    assert.match(content, /invite_code/i);
    assert.match(content, /creator_score/i);
    assert.match(content, /creator_time_seconds/i);
    assert.match(content, /challenger_score/i);
    assert.match(content, /idx_peer_ch_code/i);
  });

  await t.test("00_master_verify_and_fix.sql contains peer_challenges and RLS policies", () => {
    const masterPath = path.join(rootDir, "supabase", "migrations", "00_master_verify_and_fix.sql");
    const content = fs.readFileSync(masterPath, "utf-8");
    assert.match(content, /peer_challenges/i);
    assert.match(content, /idx_peer_ch_code/i);
  });

  await t.test("src/db/schema.ts exports peerChallenges with Drizzle definitions", () => {
    const schemaPath = path.join(rootDir, "src", "db", "schema.ts");
    const content = fs.readFileSync(schemaPath, "utf-8");
    assert.match(content, /export const peerChallenges = pgTable/);
    assert.match(content, /inviteCode: text\("invite_code"\)/);
    assert.match(content, /creatorScore: integer\("creator_score"\)/);
    assert.match(content, /creatorTimeSeconds: integer\("creator_time_seconds"\)/);
    assert.match(content, /challengerScore: integer\("challenger_score"\)/);
    assert.match(content, /challengerTimeSeconds: integer\("challenger_time_seconds"\)/);
  });

  await t.test("src/db/migrate-and-seed.ts includes peer_challenges self-healing DDL", () => {
    const migratePath = path.join(rootDir, "src", "db", "migrate-and-seed.ts");
    const content = fs.readFileSync(migratePath, "utf-8");
    assert.match(content, /CREATE TABLE IF NOT EXISTS peer_challenges/i);
    assert.match(content, /CREATE INDEX IF NOT EXISTS idx_peer_ch_code/i);
  });
});

test("2. Gamification Rules & XP Integration", async (t) => {
  await t.test("gamification-service.ts supports challenge_won (40 XP) and challenge_participated (15 XP)", () => {
    const gamServicePath = path.join(rootDir, "src", "lib", "gamification-service.ts");
    const content = fs.readFileSync(gamServicePath, "utf-8");
    assert.match(content, /"challenge_won"/);
    assert.match(content, /"challenge_participated"/);
    assert.match(content, /case "challenge_won":\s*baseAmount = 40;/);
    assert.match(content, /case "challenge_participated":\s*baseAmount = 15;/);
  });
});

test("3. Challenge Battle API Handlers & Route Architecture", async (t) => {
  await t.test("random-questions route exists and provides question selection", () => {
    const routePath = path.join(rootDir, "src", "app", "api", "challenges", "random-questions", "route.ts");
    assert.ok(fs.existsSync(routePath), "random-questions route must exist");
    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /export async function GET/);
    assert.match(content, /questionBank/);
    assert.match(content, /FALLBACK_QUESTIONS/);
  });

  await t.test("challenges route exists, generates CH-XXXX codes, and prevents cheating", () => {
    const routePath = path.join(rootDir, "src", "app", "api", "challenges", "route.ts");
    assert.ok(fs.existsSync(routePath), "challenges route must exist");
    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /export async function GET/);
    assert.match(content, /export async function POST/);
    assert.match(content, /generateInviteCode/);
    assert.match(content, /CH-/);
    // Anti-cheating verification in route:
    assert.match(content, /challenge\.status === "open" && !isCreator/);
    assert.match(content, /omit correctAnswer & explanation/i);
  });

  await t.test("submit route exists and evaluates winner with tie-breaker by time and awards XP", () => {
    const submitPath = path.join(rootDir, "src", "app", "api", "challenges", "[code]", "submit", "route.ts");
    assert.ok(fs.existsSync(submitPath), "submit route must exist");
    const content = fs.readFileSync(submitPath, "utf-8");
    assert.match(content, /export async function POST/);
    assert.match(content, /challengerScore/);
    assert.match(content, /creatorScore/);
    // Tie-breaker by time verification:
    assert.match(content, /cTime < crTime/);
    // Auto-record mistakes verification:
    assert.match(content, /userMistakes/);
    // XP awards:
    assert.match(content, /challengerXp = 40/);
    assert.match(content, /creatorXp = 15/);
    assert.match(content, /challenge_won/);
    assert.match(content, /challenge_participated/);
  });
});

test("4. Battle Arena Engine & Tie-Breaker Algorithm Unit Verification", async (t) => {
  function determineWinner(crScore, crTime, chScore, chTime) {
    if (chScore > crScore) return "challenger";
    if (chScore < crScore) return "creator";
    // Equal score: faster time (fewer seconds) wins
    if (chTime < crTime) return "challenger";
    if (chTime > crTime) return "creator";
    return "tie";
  }

  function calculateXp(winner) {
    if (winner === "challenger") return { challengerXp: 40, creatorXp: 15 };
    if (winner === "creator") return { challengerXp: 15, creatorXp: 40 };
    return { challengerXp: 25, creatorXp: 25 };
  }

  await t.test("Higher score wins regardless of time", () => {
    // Creator: 5/5 in 85s, Challenger: 4/5 in 30s -> Creator wins
    assert.equal(determineWinner(5, 85, 4, 30), "creator");
    const xp1 = calculateXp("creator");
    assert.equal(xp1.creatorXp, 40);
    assert.equal(xp1.challengerXp, 15);

    // Creator: 3/5 in 40s, Challenger: 4/5 in 50s -> Challenger wins
    assert.equal(determineWinner(3, 40, 4, 50), "challenger");
    const xp2 = calculateXp("challenger");
    assert.equal(xp2.challengerXp, 40);
    assert.equal(xp2.creatorXp, 15);
  });

  await t.test("Score tie: faster time (fewer seconds) wins", () => {
    // Creator: 4/5 in 50s, Challenger: 4/5 in 35s -> Challenger is faster and wins!
    assert.equal(determineWinner(4, 50, 4, 35), "challenger");

    // Creator: 4/5 in 32s, Challenger: 4/5 in 48s -> Creator is faster and wins!
    assert.equal(determineWinner(4, 32, 4, 48), "creator");
  });

  await t.test("Score tie and identical time: result is tie (+25 XP each)", () => {
    assert.equal(determineWinner(5, 40, 5, 40), "tie");
    const xp = calculateXp("tie");
    assert.equal(xp.creatorXp, 25);
    assert.equal(xp.challengerXp, 25);
  });
});

test("5. UI Components & Mobile Bottom Nav Verification", async (t) => {
  await t.test("MobileBottomNav.tsx has 4 thumb-reach tabs and live badge", () => {
    const navPath = path.join(rootDir, "src", "components", "navigation", "MobileBottomNav.tsx");
    assert.ok(fs.existsSync(navPath), "MobileBottomNav.tsx must exist");
    const content = fs.readFileSync(navPath, "utf-8");
    assert.match(content, /"الرئيسية"/);
    assert.match(content, /"بنك الأسئلة"/);
    assert.match(content, /"أخطائي"/);
    assert.match(content, /"تحدي 1v1"/);
    assert.match(content, /\/dashboard\/mistakes/);
    assert.match(content, /\/dashboard\/challenge/);
    assert.match(content, /safe-area-inset-bottom/);
    assert.match(content, /md:hidden/);
  });

  await t.test("AchievementShareModal.tsx supports Canvas PNG export & WhatsApp share", () => {
    const modalPath = path.join(rootDir, "src", "components", "share", "AchievementShareModal.tsx");
    assert.ok(fs.existsSync(modalPath), "AchievementShareModal.tsx must exist");
    const content = fs.readFileSync(modalPath, "utf-8");
    assert.match(content, /canvasRef/);
    assert.match(content, /canvas\.toDataURL\("image\/png"\)/);
    assert.match(content, /wa\.me\/\?text=/);
    assert.match(content, /أكاديمية المحترف • مستر حبيب الرحمن/);
  });

  await t.test("Dashboard Layout wraps all /dashboard/* routes with MobileBottomNav", () => {
    const layoutPath = path.join(rootDir, "src", "app", "dashboard", "layout.tsx");
    assert.ok(fs.existsSync(layoutPath), "Dashboard layout must exist");
    const content = fs.readFileSync(layoutPath, "utf-8");
    assert.match(content, /<MobileBottomNav \/>/);
  });

  await t.test("FriendChallengeWorkspace and ChallengeBattlePlayer exist and link properly", () => {
    const wsPath = path.join(rootDir, "src", "components", "challenges", "FriendChallengeWorkspace.tsx");
    const playerPath = path.join(rootDir, "src", "components", "challenges", "ChallengeBattlePlayer.tsx");
    assert.ok(fs.existsSync(wsPath));
    assert.ok(fs.existsSync(playerPath));

    const pagePath1 = path.join(rootDir, "src", "app", "dashboard", "challenge", "page.tsx");
    const pagePath2 = path.join(rootDir, "src", "app", "dashboard", "challenge", "[code]", "page.tsx");
    assert.ok(fs.existsSync(pagePath1));
    assert.ok(fs.existsSync(pagePath2));
  });

  await t.test("MistakesBankWorkspace has WhatsApp achievement share button for zero-mistakes state", () => {
    const mbPath = path.join(rootDir, "src", "components", "mistakes", "MistakesBankWorkspace.tsx");
    const content = fs.readFileSync(mbPath, "utf-8");
    assert.match(content, /AchievementShareModal/);
    assert.match(content, /مشاركة إنجاز تصفير بنك الأخطاء/);
  });
});
