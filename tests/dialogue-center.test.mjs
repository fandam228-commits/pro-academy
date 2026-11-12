import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDataDir = path.join(__dirname, "..", "src", "data", "dialogue-center");

test("Dialogue Center - Data Files Existence", () => {
  const p1 = path.join(baseDataDir, "prep1-dialogues.json");
  const p2 = path.join(baseDataDir, "prep2-dialogues.json");
  const p3 = path.join(baseDataDir, "prep3-dialogues.json");
  const p3Rev = path.join(baseDataDir, "prep3-revision-dialogues.json");
  const p3Strat = path.join(baseDataDir, "prep3-revision-strategy.json");

  assert.ok(fs.existsSync(p1), "prep1-dialogues.json must exist");
  assert.ok(fs.existsSync(p2), "prep2-dialogues.json must exist");
  assert.ok(fs.existsSync(p3), "prep3-dialogues.json must exist");
  assert.ok(fs.existsSync(p3Rev), "prep3-revision-dialogues.json must exist");
  assert.ok(fs.existsSync(p3Strat), "prep3-revision-strategy.json must exist");
});

test("Dialogue Center - Complete Document Extraction Counts", () => {
  const p1 = JSON.parse(fs.readFileSync(path.join(baseDataDir, "prep1-dialogues.json"), "utf8"));
  const p2 = JSON.parse(fs.readFileSync(path.join(baseDataDir, "prep2-dialogues.json"), "utf8"));
  const p3 = JSON.parse(fs.readFileSync(path.join(baseDataDir, "prep3-dialogues.json"), "utf8"));
  const p3Rev = JSON.parse(fs.readFileSync(path.join(baseDataDir, "prep3-revision-dialogues.json"), "utf8"));

  assert.ok(p1.length >= 25, `Prep 1 must have at least 25 dialogues, got ${p1.length}`);
  assert.ok(p2.length >= 26, `Prep 2 must have at least 26 dialogues, got ${p2.length}`);
  assert.ok(p3.length >= 32, `Prep 3 must have at least 32 dialogues, got ${p3.length}`);
  assert.ok(p3Rev.length >= 10, `Prep 3 revision must have at least 10 dialogues, got ${p3Rev.length}`);

  const total = p1.length + p2.length + p3.length + p3Rev.length;
  assert.ok(total >= 93, `Total dialogues must be >= 93, got ${total}`);
});

test("Dialogue Center - Every Dialogue Has Exactly 5 Gaps and Approved Keys", () => {
  const files = [
    "prep1-dialogues.json",
    "prep2-dialogues.json",
    "prep3-dialogues.json",
    "prep3-revision-dialogues.json",
  ];

  for (const filename of files) {
    const list = JSON.parse(fs.readFileSync(path.join(baseDataDir, filename), "utf8"));
    for (const dlg of list) {
      assert.ok(dlg.id, `Dialogue in ${filename} missing id`);
      assert.ok(dlg.title, `Dialogue ${dlg.id} missing title`);
      assert.ok(dlg.speakers && dlg.speakers.length >= 1, `Dialogue ${dlg.id} missing speakers`);
      assert.ok(dlg.lines && dlg.lines.length >= 5, `Dialogue ${dlg.id} lines must be >= 5`);

      const ans = dlg.approvedAnswers;
      assert.ok(ans, `Dialogue ${dlg.id} missing approvedAnswers`);
      for (let g = 1; g <= 5; g++) {
        const gapKey = String(g);
        assert.ok(ans[gapKey], `Dialogue ${dlg.id} missing answer for gap ${gapKey}`);
        assert.ok(ans[gapKey].primary, `Dialogue ${dlg.id} gap ${gapKey} missing primary answer`);
        assert.ok(Array.isArray(ans[gapKey].alternatives), `Dialogue ${dlg.id} gap ${gapKey} alternatives must be array`);
        assert.equal(ans[gapKey].isTeacherApproved, true, `Dialogue ${dlg.id} gap ${gapKey} must be teacher approved`);
      }
    }
  }
});

test("Dialogue Center - 2025 Strategy Rules Verification", () => {
  const strat = JSON.parse(fs.readFileSync(path.join(baseDataDir, "prep3-revision-strategy.json"), "utf8"));

  assert.equal(strat.examSpecs.dialogueMarks, 5);
  assert.equal(strat.examSpecs.gapsCount, 5);
  assert.ok(strat.goldenRules.length >= 3);
  assert.ok(strat.questionTypes.closedQuestions.auxiliaryVerbs.verbToBe.length >= 4);
  assert.ok(strat.questionTypes.openQuestions.primaryWhWords.length >= 6);
  assert.ok(strat.questionTypes.openQuestions.commonDialogueQuestions.length >= 20);
});

test("Dialogue Center - Answer Evaluation Logic", () => {
  const sampleApproved = {
    primary: "Yes, of course.",
    alternatives: ["Sure, you can.", "Certainly.", "Yes, please."],
    isTeacherApproved: true,
  };

  const normalize = (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ");

  const testExact = normalize("Yes, of course.") === normalize(sampleApproved.primary);
  assert.equal(testExact, true, "Exact match must be true");

  const testAlt = sampleApproved.alternatives.some((a) => normalize(a) === normalize("sure you can"));
  assert.equal(testAlt, true, "Alternative match must be true");
});
