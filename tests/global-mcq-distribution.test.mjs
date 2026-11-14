import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  LABELS,
  resolveQuestionCorrectOption,
  rebalanceQuestion,
  rebalanceQuestionSet,
  verifyQuestionIntegrity,
  generateControlledBalancedSequence,
} from "../src/lib/mcq-balancer.mjs";
import { answersMatch, isOptionCorrect } from "../src/lib/question-grading.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Global MCQ Answer Distribution Audit & Rebalancing Suite", async (t) => {
  await t.test("1. Grammar Summaries & Practice Sets (450 Questions) Balance & Zero Streaks", async () => {
    const grammarFile = path.join(rootDir, "src/data/grammar-summaries-and-questions.ts");
    assert.ok(fs.existsSync(grammarFile), "File must exist");

    const content = fs.readFileSync(grammarFile, "utf-8");
    const qMatches = content.match(/\{\s*"id":\s*"q_[^"]+",[\s\S]*?"difficulty":\s*"[^"]+"\s*\}/g);
    assert.ok(qMatches && qMatches.length === 450, `Must have exactly 450 grammar questions, found ${qMatches?.length}`);

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    const sequence = [];

    for (const m of qMatches) {
      const q = eval("(" + m + ")");
      const res = resolveQuestionCorrectOption(q);
      assert.ok(res, `Question ${q.id} must have resolvable correct answer`);
      counts[res.label]++;
      sequence.push(res.label);

      // Check option count
      assert.equal(q.options.length, 4, `Question ${q.id} must have 4 options`);
      // Check grading correctness
      assert.equal(answersMatch(q, q.correctAnswer), true, `Question ${q.id} must match correct answer`);
    }

    // Verify each option is between 20% and 30% of total (balanced ~25%)
    for (const l of LABELS) {
      const pct = (counts[l] / 450) * 100;
      assert.ok(pct >= 20 && pct <= 30, `Option ${l} percentage ${pct.toFixed(1)}% must be between 20% and 30%`);
    }

    // Verify ZERO streaks >= 3
    for (let i = 2; i < sequence.length; i++) {
      const isRun3 = sequence[i] === sequence[i - 1] && sequence[i] === sequence[i - 2];
      assert.equal(isRun3, false, `Run of 3 found at index ${i}: ${sequence.slice(i - 2, i + 1)}`);
    }
  });

  await t.test("2. Adaptive Placement Test (48 Questions across 3 Tracks) Balance & Zero Streaks", async () => {
    const pFile = path.join(rootDir, "src/components/AdaptivePlacementTest.tsx");
    assert.ok(fs.existsSync(pFile));

    const content = fs.readFileSync(pFile, "utf-8");
    const trackNames = ["cefrGlobalQuestions", "prepStageQuestions", "secondaryStageQuestions"];

    for (const varName of trackNames) {
      const regex = new RegExp(`const\\s+${varName}:\\s*PlacementQuestion\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];\\r?\\n`);
      const match = content.match(regex);
      assert.ok(match, `Track ${varName} must exist`);

      const rawBlock = match[1];
      const qMatches = rawBlock.match(/\{\s*id:\s*"[^"]+",[\s\S]*?explanationEn:\s*"[^"]*",?\s*\}/g);
      assert.ok(qMatches && qMatches.length >= 14, `Track ${varName} must have at least 14 questions`);

      const trackCounts = { A: 0, B: 0, C: 0, D: 0 };
      const trackSeq = [];

      for (const m of qMatches) {
        const idMatch = m.match(/id:\s*"([^"]+)"/);
        const optMatch = m.match(/options:\s*\[([\s\S]*?)\]/);
        const corrMatch = m.match(/correct:\s*(\d+)/);

        assert.ok(idMatch && optMatch && corrMatch);
        const options = eval("[" + optMatch[1] + "]");
        const correct = parseInt(corrMatch[1]);

        assert.equal(options.length, 4);
        assert.ok(correct >= 0 && correct <= 3);

        const label = LABELS[correct];
        trackCounts[label]++;
        trackSeq.push(label);
      }

      // Check that each option is represented (no 0 counts)
      for (const l of LABELS) {
        assert.ok(trackCounts[l] >= 2, `Track ${varName} must have at least 2 ${l}'s, got ${trackCounts[l]}`);
      }

      // Zero streaks of 3
      for (let i = 2; i < trackSeq.length; i++) {
        const isRun3 = trackSeq[i] === trackSeq[i - 1] && trackSeq[i] === trackSeq[i - 2];
        assert.equal(isRun3, false, `Streak of 3 found in ${varName} at ${i}`);
      }
    }
  });

  await t.test("3. Story World MCQs (Prep 3, Sec 1, Sec 2, Sec 3) Balance & Zero Streaks", async () => {
    const stories = ["prep3-story.json", "sec1-story.json", "sec2-story.json", "sec3-story.json"];

    for (const sf of stories) {
      const sPath = path.join(rootDir, "src/data/story-world", sf);
      const data = JSON.parse(fs.readFileSync(sPath, "utf-8"));
      const mcqs = (data.chapters || []).flatMap(c => c.mcqQuestions || []);
      assert.ok(mcqs.length >= 10, `Story ${sf} must have at least 10 MCQs`);

      const counts = { A: 0, B: 0, C: 0, D: 0 };
      const seq = [];

      for (const q of mcqs) {
        const res = resolveQuestionCorrectOption(q);
        assert.ok(res, `Question ${q.id} must be resolvable`);
        counts[res.label]++;
        seq.push(res.label);

        // Verify grading
        assert.equal(answersMatch(q, q.correctAnswer), true);
      }

      // Check balance
      for (const l of LABELS) {
        assert.ok(counts[l] >= 2, `Story ${sf} must have at least 2 ${l}'s, got ${counts[l]}`);
      }

      // Check zero streaks of 3
      for (let i = 2; i < seq.length; i++) {
        assert.notEqual(seq[i] === seq[i - 1] && seq[i] === seq[i - 2], true);
      }
    }
  });

  await t.test("4. Safe Answer Matching (Text vs Letter & Case Insensitivity)", () => {
    const sampleQ = {
      id: "q_match_test",
      questionText: "What is the capital of Egypt?",
      options: ["Alexandria", "Cairo", "Giza", "Luxor"],
      correctAnswer: "Cairo", // Option B
    };

    // Text match exact
    assert.equal(answersMatch(sampleQ, "Cairo"), true);
    // Text match case-insensitive
    assert.equal(answersMatch(sampleQ, "cairo"), true);
    // Letter match
    assert.equal(answersMatch(sampleQ, "B"), true);
    assert.equal(answersMatch(sampleQ, "b"), true);
    // Wrong text & letter
    assert.equal(answersMatch(sampleQ, "Alexandria"), false);
    assert.equal(answersMatch(sampleQ, "A"), false);
    assert.equal(answersMatch(sampleQ, "C"), false);
  });

  await t.test("5. Integrity Rule: Stem & Option Texts are strictly invariant", () => {
    const originalQ = {
      id: "integrity_check",
      questionText: "The scientist made an important discovery.",
      options: ["groundbreaking", "trivial", "insignificant", "minor"],
      correctAnswer: "groundbreaking",
      explanation: "Groundbreaking means innovative and important.",
    };

    const rebalanced = rebalanceQuestion(originalQ, "C");
    const check = verifyQuestionIntegrity(originalQ, rebalanced);

    assert.equal(check.valid, true);
    assert.equal(rebalanced.questionText, originalQ.questionText);
    assert.equal(rebalanced.options[2], "groundbreaking");
    assert.equal(rebalanced.explanation, originalQ.explanation);
  });
});
