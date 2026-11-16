import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { rebalanceQuestionSet } from "../src/lib/mcq-balancer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Rebalance Training Center Extracted Questions
const tcPath = path.join(rootDir, "src/data/training-center-extracted-questions.json");
const tcQuestions = JSON.parse(fs.readFileSync(tcPath, "utf8"));
const tcResult = rebalanceQuestionSet(tcQuestions, { seed: 42, maxStreak: 2 });
console.log("Training Center Rebalanced:", tcResult.stats);
fs.writeFileSync(tcPath, JSON.stringify(tcResult.rebalancedQuestions, null, 2), "utf8");

// 2. Stories: load from HEAD to preserve all comicScenes, characterReferences, themes, etc.
const storiesToRebalance = [
  { file: "prep3-story.json", seed: 104 },
  { file: "sec1-story.json", seed: 102 },
  { file: "sec2-story.json", seed: 103 },
  { file: "sec3-story.json", seed: 101 },
];

for (const item of storiesToRebalance) {
  const relPath = `src/data/story-world/${item.file}`;
  const raw = execSync(`git show HEAD:${relPath}`, { cwd: rootDir, encoding: "utf8" });
  const data = JSON.parse(raw);

  // Collect all MCQs
  const allMcqs = [];
  const map = [];
  (data.chapters || []).forEach((ch, chIdx) => {
    (ch.mcqQuestions || []).forEach((q, qIdx) => {
      allMcqs.push(q);
      map.push({ chIdx, qIdx });
    });
  });

  if (allMcqs.length > 0) {
    const res = rebalanceQuestionSet(allMcqs, { seed: item.seed, maxStreak: 2 });
    console.log(`${item.file}: rebalanced ${allMcqs.length} MCQs ->`, res.stats);

    res.rebalancedQuestions.forEach((q, i) => {
      const { chIdx, qIdx } = map[i];
      data.chapters[chIdx].mcqQuestions[qIdx] = q;
    });
  }

  const outPath = path.join(rootDir, relPath);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
}

console.log("Story world rebalanced cleanly with full comic scenes and character references intact.");
