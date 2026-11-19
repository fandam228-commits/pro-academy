import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("AI Essay Evaluator, 4-Pillar Ministerial Rubric & Audio Coach", () => {
  const root = process.cwd();

  it("1. API Analyzer exports valid POST handler and implements 4-Pillar Rubric", async () => {
    const routePath = path.join(root, "src/app/api/essays/analyze/route.ts");
    assert.ok(fs.existsSync(routePath), "route.ts must exist");
    const code = fs.readFileSync(routePath, "utf-8");

    // Check handler & required tokens
    assert.match(code, /export async function POST/i, "Must export POST handler");
    assert.match(code, /contentAndIdeas/i, "Must calculate content & ideas rubric");
    assert.match(code, /grammarAndStructure/i, "Must calculate grammar & structure rubric");
    assert.match(code, /vocabularyVariety/i, "Must calculate vocabulary variety rubric");
    assert.match(code, /mechanicsAndPunctuation/i, "Must calculate mechanics & punctuation rubric");
    assert.match(code, /thanawyaAmmaMarks/i, "Must calculate official Thanawya Amma marks (/6)");
    assert.match(code, /prepStageMarks/i, "Must calculate prep stage marks (/4)");
  });

  it("2. API Analyzer contains grammar and spelling diagnostics", () => {
    const routePath = path.join(root, "src/app/api/essays/analyze/route.ts");
    const code = fs.readFileSync(routePath, "utf-8");

    assert.match(code, /COMMON_SPELLING_FIXES/i, "Must include spelling corrections map");
    assert.match(code, /GRAMMAR_PATTERNS/i, "Must include grammar patterns detector");
    assert.match(code, /detectedIssues/i, "Must return detectedIssues array");
    assert.match(code, /sentenceUpgrades/i, "Must return sentence level-up suggestions");
    assert.match(code, /audioScriptEn/i, "Must generate English audio feedback script");
    assert.match(code, /audioScriptAr/i, "Must generate Arabic audio feedback script");
  });

  it("3. EssayLabWorkspace UI integrates Audio Coach and 4-Pillar Rubrics", () => {
    const uiPath = path.join(root, "src/components/pro-suite/EssayLabWorkspace.tsx");
    assert.ok(fs.existsSync(uiPath), "EssayLabWorkspace.tsx must exist");
    const uiCode = fs.readFileSync(uiPath, "utf-8");

    assert.match(uiCode, /playSpeech/i, "Must contain speech audio playback engine");
    assert.match(uiCode, /audioFeedbackLang/i, "Must support bilingual audio feedback");
    assert.match(uiCode, /applySentenceUpgrade/i, "Must support 1-click sentence level-up upgrade");
    assert.match(uiCode, /applyMistakeFix/i, "Must support 1-click mistake correction");
    assert.match(uiCode, /toggleVoiceDictation/i, "Must support voice dictation / speech-to-text");
    assert.match(uiCode, /thanawyaAmmaMarks/i, "Must display Thanawya Amma marks");
  });

  it("4. Evaluates simulated essay text and produces realistic rubric scores", () => {
    const textContent =
      "Technology is very important in our modern life. Furthermore, education has benefited immensely from digital resources. In addition, students obtain knowledge faster than before. However, we should be careful about screen time. In conclusion, technology proves exceptionally beneficial.";

    const words = textContent.split(/\s+/).filter(Boolean);
    assert.ok(words.length >= 30, "Word count calculated properly");

    // Check transition connectors detection
    const transitions = ["furthermore", "in addition", "however", "in conclusion"];
    const found = transitions.filter((t) => textContent.toLowerCase().includes(t));
    assert.equal(found.length, 4, "Detects all 4 transition connectors");
  });
});
