/**
 * Professional Academy – Smart Shuffle Engine & Question Intelligence
 * 
 * 1. 4-Option Standardizer (Enforces exact A, B, C, D without duplicates or empty options)
 * 2. Statistically Balanced Answer Distribution (~25% each, max 2 consecutive runs, anti-cycle)
 * 3. Client Payload Hardening (Zero answer key leakage)
 * 4. Secure Server-Side Grading
 */

export const LABELS = ["A", "B", "C", "D"];

/**
 * Validates and standardizes options to exactly 4 distinct, non-empty options.
 * Returns null if the question is invalid or cannot be verified.
 */
export function validateAndStandardizeFourOptions(question) {
  if (!question || !question.questionText || !question.questionText.trim()) {
    return null;
  }

  const rawOptions = question.options;
  if (!rawOptions || !Array.isArray(rawOptions)) {
    return null;
  }

  const cleaned = [];
  const seenTexts = new Set();

  for (let i = 0; i < rawOptions.length; i++) {
    const item = rawOptions[i];
    let text = "";
    let originalLabel = LABELS[i] || "";

    if (typeof item === "string") {
      text = item.trim();
    } else if (item && typeof item === "object") {
      text = String(item.text || item.label || "").trim();
      if (item.label && typeof item.label === "string") {
        originalLabel = item.label.trim().toUpperCase();
      }
    }

    if (!text) continue;

    const normText = text.toLowerCase();
    if (seenTexts.has(normText)) {
      continue; // Duplicate option text
    }
    seenTexts.add(normText);

    cleaned.push({
      originalLabel: originalLabel || LABELS[cleaned.length] || "",
      text,
    });
  }

  // Must have EXACTLY 4 distinct options
  if (cleaned.length !== 4) {
    return null;
  }

  // Verify that the correct answer matches one of the 4 options
  const rawCorrect = String(question.correctAnswer || "").trim();
  if (!rawCorrect) {
    return null;
  }

  let matchedCorrectIndex = -1;
  const rawCorrectUpper = rawCorrect.toUpperCase();

  // Try matching by letter (A, B, C, D)
  if (LABELS.includes(rawCorrectUpper)) {
    matchedCorrectIndex = cleaned.findIndex(
      (opt, idx) => opt.originalLabel === rawCorrectUpper || idx === LABELS.indexOf(rawCorrectUpper)
    );
  }

  // If not matched by letter, try matching by exact text (case-insensitive)
  if (matchedCorrectIndex === -1) {
    const rawLower = rawCorrect.toLowerCase();
    matchedCorrectIndex = cleaned.findIndex((opt) => opt.text.toLowerCase() === rawLower);
  }

  if (matchedCorrectIndex === -1) {
    return null; // Correct answer cannot be verified among options
  }

  return {
    ...question,
    options: cleaned.map((opt, i) => ({ label: LABELS[i], text: opt.text })),
    correctIndex: matchedCorrectIndex,
    correctText: cleaned[matchedCorrectIndex].text,
  };
}

/**
 * Generates a balanced sequence of target correct letters for N questions.
 * Ensures:
 * - ~25% balance for each letter (A, B, C, D)
 * - Maximum run of 2 consecutive identical letters (never 3 in a row)
 * - No predictable repeating 4-letter cycle (e.g. A, B, C, D, A, B, C, D)
 */
export function generateBalancedTargetLetters(count) {
  if (count <= 0) return [];

  const baseCount = Math.floor(count / 4);
  let remainder = count % 4;

  const pool = [];
  for (const label of LABELS) {
    const c = baseCount + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    for (let i = 0; i < c; i++) {
      pool.push(label);
    }
  }

  // Permute pool with constraints
  let attempts = 0;
  const maxAttempts = 500;

  while (attempts++ < maxAttempts) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    let valid = true;

    // Check no 3 consecutive identical letters
    for (let i = 2; i < shuffled.length; i++) {
      if (shuffled[i] === shuffled[i - 1] && shuffled[i] === shuffled[i - 2]) {
        valid = false;
        break;
      }
    }

    // Check no repeating 4-cycle across 8 items
    if (valid && shuffled.length >= 8) {
      for (let i = 4; i < shuffled.length; i++) {
        if (
          shuffled[i] === shuffled[i - 4] &&
          shuffled[i - 1] === shuffled[i - 5] &&
          shuffled[i - 2] === shuffled[i - 6] &&
          shuffled[i - 3] === shuffled[i - 7]
        ) {
          valid = false;
          break;
        }
      }
    }

    if (valid) {
      return shuffled;
    }
  }

  // Fallback: deterministic safe distribution
  const result = [];
  const remainingCounts = { A: 0, B: 0, C: 0, D: 0 };
  for (const p of pool) remainingCounts[p]++;

  for (let i = 0; i < count; i++) {
    const candidates = LABELS.filter((l) => {
      if (remainingCounts[l] <= 0) return false;
      if (i >= 2 && result[i - 1] === l && result[i - 2] === l) return false;
      return true;
    });

    const choice = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : LABELS.find((l) => remainingCounts[l] > 0);

    result.push(choice);
    remainingCounts[choice]--;
  }

  return result;
}

/**
 * Creates an independent shuffled exam attempt for a set of questions.
 * Strips all answer keys from clientQuestions.
 * Returns secrets for server-side grading.
 */
export function createExamAttemptSession(questions) {
  const verifiedQuestions = [];

  for (const q of questions) {
    const verified = validateAndStandardizeFourOptions(q);
    if (verified) {
      verifiedQuestions.push(verified);
    }
  }

  const targetLetters = generateBalancedTargetLetters(verifiedQuestions.length);

  const clientQuestions = [];
  const secrets = {};

  for (let i = 0; i < verifiedQuestions.length; i++) {
    const q = verifiedQuestions[i];
    const targetCorrectLabel = targetLetters[i];
    const targetCorrectIndex = LABELS.indexOf(targetCorrectLabel);

    const correctOpt = q.options[q.correctIndex];
    const distractorOpts = q.options
      .filter((_, idx) => idx !== q.correctIndex)
      .sort(() => Math.random() - 0.5);

    // Build shuffled options array of length 4
    const shuffledOptions = new Array(4);
    shuffledOptions[targetCorrectIndex] = {
      label: targetCorrectLabel,
      text: correctOpt.text,
    };

    let distractorIdx = 0;
    for (let slot = 0; slot < 4; slot++) {
      if (slot === targetCorrectIndex) continue;
      shuffledOptions[slot] = {
        label: LABELS[slot],
        text: distractorOpts[distractorIdx++].text,
      };
    }

    // Client question without correct answer or hints
    clientQuestions.push({
      id: q.id,
      questionNumber: q.questionNumber || i + 1,
      questionText: q.questionText,
      options: shuffledOptions,
      topic: q.topic || "General",
      difficulty: q.difficulty || "Medium",
    });

    // Server secret map
    secrets[q.id] = {
      questionId: q.id,
      correctVisualLabel: targetCorrectLabel,
      trueCorrectAnswer: correctOpt.text,
      explanation: q.explanation || `Grammar / Context rule for ${q.topic || "English"}`,
      optionMap: Object.fromEntries(shuffledOptions.map((o) => [o.label, o.text])),
    };
  }

  return {
    clientQuestions,
    secrets,
    totalQuestions: clientQuestions.length,
  };
}

/**
 * Evaluates student answers against server secrets.
 */
export function gradeExamAttempt(secrets, studentAnswers = {}) {
  let correctCount = 0;
  const detailedResults = [];
  const qIds = Object.keys(secrets);

  for (const qId of qIds) {
    const secret = secrets[qId];
    if (!secret) continue;

    const rawGiven = studentAnswers[qId];
    const givenTrimmed = rawGiven ? String(rawGiven).trim() : "";
    const givenUpper = givenTrimmed.toUpperCase();

    let isCorrect = false;

    // Check if student submitted visual label (A, B, C, D)
    if (LABELS.includes(givenUpper)) {
      isCorrect = givenUpper === secret.correctVisualLabel;
    } else if (givenTrimmed) {
      // Check if student submitted full option text
      isCorrect = givenTrimmed.toLowerCase() === secret.trueCorrectAnswer.toLowerCase();
    }

    if (isCorrect) {
      correctCount++;
    }

    detailedResults.push({
      questionId: qId,
      studentAnswer: givenTrimmed || null,
      correctAnswer: secret.correctVisualLabel,
      correctAnswerText: secret.trueCorrectAnswer,
      isCorrect,
      explanation: secret.explanation,
    });
  }

  const total = qIds.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100 * 100) / 100 : 0;
  const passed = percentage >= 60;

  return {
    score: correctCount,
    totalScore: total,
    percentage,
    passed,
    detailedResults,
  };
}
