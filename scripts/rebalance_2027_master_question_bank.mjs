import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  rebalanceQuestionSet,
  standardizeQuestionOptions,
  resolveQuestionCorrectOption,
  verifyQuestionIntegrity,
} from "../src/lib/mcq-balancer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const masterPath = path.resolve(__dirname, "../src/data/question-bank-2027-master.json");

const allQuestions = JSON.parse(fs.readFileSync(masterPath, "utf8"));
console.log(`Loaded ${allQuestions.length} questions from ${masterPath}`);

// Separate MCQs from non-MCQs
const mcqIndices = [];
const mcqQuestions = [];

allQuestions.forEach((q, idx) => {
  if (q.questionType === "mcq" || (Array.isArray(q.options) && q.options.length > 0)) {
    mcqIndices.push(idx);
    mcqQuestions.push(standardizeQuestionOptions(q));
  }
});

console.log(`Found ${mcqQuestions.length} MCQ questions to rebalance.`);

// Rebalance MCQs using the controlled psychometric balancer
const { rebalancedQuestions, stats } = rebalanceQuestionSet(mcqQuestions, {
  seed: 2027,
  shuffleDistractors: true,
  maxStreak: 2,
});

console.log("Rebalancing stats:", {
  total: stats.total,
  distributionBefore: stats.distributionBefore,
  distributionAfter: stats.distributionAfter,
  maxStreakAfter: stats.maxStreakAfter,
  integrityErrors: stats.integrityErrors,
});

if (stats.integrityErrors && stats.integrityErrors.length > 0) {
  console.error("Integrity errors encountered:", stats.integrityErrors);
  process.exit(1);
}

// Validate answer distribution and max streaks
console.log("Checking distribution criteria: maxStreakAfter <=", stats.maxStreakAfter);
if (stats.maxStreakAfter > 2) {
  console.error("Streak violation: maxStreakAfter is", stats.maxStreakAfter);
  process.exit(1);
}

// Check balanced distribution (~25% each)
for (const label of ["A", "B", "C", "D"]) {
  const count = stats.distributionAfter[label];
  const share = count / stats.rebalanced;
  console.log(`Label ${label}: ${count}/${stats.rebalanced} (${(share * 100).toFixed(1)}%)`);
  if (share < 0.18 || share > 0.35) {
    console.error(`Distribution skew for label ${label}: ${share}`);
    process.exit(1);
  }
}

// Put rebalanced questions back into allQuestions
mcqIndices.forEach((origIdx, i) => {
  allQuestions[origIdx] = rebalancedQuestions[i];
});

// Verify no question in allQuestions has options.length > 4
for (const q of allQuestions) {
  if (Array.isArray(q.options) && q.options.length > 4) {
    throw new Error(`Question ${q.id} still has > 4 options! Length: ${q.options.length}`);
  }
}

fs.writeFileSync(masterPath, JSON.stringify(allQuestions, null, 2), "utf8");
console.log(`Successfully updated and saved ${allQuestions.length} questions to ${masterPath}`);
