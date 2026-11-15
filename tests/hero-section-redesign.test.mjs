import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Hero Section Redesign: Verifies Minimal, Spiritual & Educational Elements", () => {
  const heroPath = path.join(rootDir, "src", "components", "home", "ModernHomePage.tsx");
  assert.ok(fs.existsSync(heroPath), "ModernHomePage.tsx must exist");
  const content = fs.readFileSync(heroPath, "utf-8");

  // 1. Central Duaa (العنصر المركزي البارز)
  assert.ok(
    content.includes("اللَّهُمَّ عَلِّمْنَا مَا يَنْفَعُنَا، وَانْفَعْنَا بِمَا عَلَّمْتَنَا") ||
    content.includes("اللهم علّمنا ما ينفعنا، وانفعنا بما علّمتنا"),
    "Hero Section must prominently feature the Duaa"
  );

  // 2. Author signature beneath the Duaa
  assert.ok(
    content.includes("مستر حبيب الرحمن"),
    "Hero Section must feature 'مستر حبيب الرحمن' beneath the Duaa"
  );

  // 3. Main Brand Title & Educational Motto
  assert.ok(
    content.includes("Professional Academy"),
    "Hero Section must feature 'Professional Academy' as the main heading"
  );
  assert.ok(content.includes("Learn"), "Hero Section must include 'Learn'");
  assert.ok(content.includes("Think"), "Hero Section must include 'Think'");
  assert.ok(content.includes("Achieve"), "Hero Section must include 'Achieve'");

  // 4. Short focused description only
  assert.ok(
    content.includes("رحلتك نحو التميز في اللغة الإنجليزية تبدأ من هنا"),
    "Hero Section must feature the short description only"
  );

  // 5. Old lengthy marketing text must be removed
  assert.equal(
    content.includes("اتعلم الإنجليزي بذكاء مع مستر حبيب الرحمن"),
    false,
    "Old marketing headline 'اتعلم الإنجليزي بذكاء مع مستر حبيب الرحمن' must be removed"
  );
  assert.equal(
    content.includes("شرح مبسط، ومراجعة مكثفة، وتدريب تفاعلي"),
    false,
    "Old lengthy marketing paragraph must be removed"
  );

  // 6. Single clear primary action button without clutter
  assert.ok(
    content.includes("ابدأ رحلتك التعليمية"),
    "Hero Section must feature the clear single action button 'ابدأ رحلتك التعليمية'"
  );
  assert.ok(
    content.includes("courses-selection"),
    "Hero Section button must connect to courses selection"
  );
});
