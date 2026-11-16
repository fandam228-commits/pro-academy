import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  standardizeQuestionOptions,
  rebalanceQuestionSet,
} from "../src/lib/mcq-balancer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, "../src/data/training-center-extracted-questions.json");

const allQuestions = JSON.parse(fs.readFileSync(filePath, "utf8"));
console.log(`Loaded ${allQuestions.length} training center questions.`);

// 1. Standardize ALL questions so no question has options.length > 4
let standardizedCount = 0;
const standardizedAll = allQuestions.map((q) => {
  if (Array.isArray(q.options) && q.options.length > 4) {
    standardizedCount++;
    return standardizeQuestionOptions(q);
  }
  return q;
});
console.log(`Standardized ${standardizedCount} questions that exceeded 4 options.`);

// 2. Identify published verified questions with 4 options to rebalance
const targetIndices = [];
const targetQuestions = [];

standardizedAll.forEach((q, idx) => {
  if (q.isPublished && q.validationStatus === "complete_verified" && Array.isArray(q.options) && q.options.length === 4) {
    targetIndices.push(idx);
    targetQuestions.push(q);
  }
});

console.log(`Found ${targetQuestions.length} verified questions to rebalance.`);

// 3. Rebalance
const { rebalancedQuestions, stats } = rebalanceQuestionSet(targetQuestions, {
  seed: 2027,
  shuffleDistractors: true,
  maxStreak: 2,
});

console.log("Rebalancing stats:", {
  total: stats.total,
  rebalanced: stats.rebalanced,
  distributionBefore: stats.distributionBefore,
  distributionAfter: stats.distributionAfter,
  maxStreakAfter: stats.maxStreakAfter,
  errorsCount: stats.integrityErrors.length,
});

if (stats.integrityErrors.length > 0) {
  console.error("Integrity errors found:", stats.integrityErrors);
  process.exit(1);
}

if (stats.maxStreakAfter > 2) {
  console.error("Max streak violated! Streak:", stats.maxStreakAfter);
  process.exit(1);
}

// 4. Merge back
targetIndices.forEach((origIdx, i) => {
  standardizedAll[origIdx] = rebalancedQuestions[i];
});

// 5. Assert: zero questions with options.length > 4
for (const q of standardizedAll) {
  if (Array.isArray(q.options) && q.options.length > 4) {
    throw new Error(`Question ${q.id} still has ${q.options.length} options!`);
  }
}

fs.writeFileSync(filePath, JSON.stringify(standardizedAll, null, 2), "utf8");
console.log(`Successfully standardized and rebalanced ${standardizedAll.length} questions in ${filePath}`);
