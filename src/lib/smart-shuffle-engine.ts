/**
 * Professional Academy – Smart Shuffle Engine & Question Intelligence
 */

export const LABELS = ["A", "B", "C", "D"] as const;
export type OptionLabel = (typeof LABELS)[number];

export interface StandardQuestion {
  id: string;
  questionNumber?: number | string;
  originalOrder?: number;
  questionText: string;
  options: any;
  correctAnswer: string;
  explanation?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  validationStatus?: string | null;
}

export interface ClientShuffledQuestion {
  id: string;
  questionNumber: number | string;
  questionText: string;
  options: { label: OptionLabel; text: string }[];
  topic: string;
  difficulty: string;
}

export interface QuestionShuffleSecret {
  questionId: string;
  correctVisualLabel: OptionLabel;
  trueCorrectAnswer: string;
  explanation: string;
  optionMap: Record<string, string>;
}

export interface ExamAttemptSession {
  clientQuestions: ClientShuffledQuestion[];
  secrets: Record<string, QuestionShuffleSecret>;
  totalQuestions: number;
}

export interface ExamGradeResult {
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  detailedResults: Array<{
    questionId: string;
    studentAnswer: string | null;
    correctAnswer: string;
    correctAnswerText: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

/**
 * Validates and standardizes options to exactly 4 distinct, non-empty options.
 */
export function validateAndStandardizeFourOptions(question: any): any | null {
  if (!question || !question.questionText || !question.questionText.trim()) {
    return null;
  }

  const rawOptions = question.options;
  if (!rawOptions || !Array.isArray(rawOptions)) {
    return null;
  }

  const cleaned: { originalLabel: string; text: string }[] = [];
  const seenTexts = new Set<string>();

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
      continue;
    }
    seenTexts.add(normText);

    cleaned.push({
      originalLabel: originalLabel || LABELS[cleaned.length] || "",
      text,
    });
  }

  if (cleaned.length !== 4) {
    return null;
  }

  const rawCorrect = String(question.correctAnswer || "").trim();
  if (!rawCorrect) {
    return null;
  }

  let matchedCorrectIndex = -1;
  const rawCorrectUpper = rawCorrect.toUpperCase();

  if (LABELS.includes(rawCorrectUpper as any)) {
    matchedCorrectIndex = cleaned.findIndex(
      (opt, idx) => opt.originalLabel === rawCorrectUpper || idx === LABELS.indexOf(rawCorrectUpper as any)
    );
  }

  if (matchedCorrectIndex === -1) {
    const rawLower = rawCorrect.toLowerCase();
    matchedCorrectIndex = cleaned.findIndex((opt) => opt.text.toLowerCase() === rawLower);
  }

  if (matchedCorrectIndex === -1) {
    return null;
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
 */
export function generateBalancedTargetLetters(count: number): OptionLabel[] {
  if (count <= 0) return [];

  const baseCount = Math.floor(count / 4);
  let remainder = count % 4;

  const pool: OptionLabel[] = [];
  for (const label of LABELS) {
    const c = baseCount + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    for (let i = 0; i < c; i++) {
      pool.push(label);
    }
  }

  let attempts = 0;
  const maxAttempts = 500;

  while (attempts++ < maxAttempts) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    let valid = true;

    for (let i = 2; i < shuffled.length; i++) {
      if (shuffled[i] === shuffled[i - 1] && shuffled[i] === shuffled[i - 2]) {
        valid = false;
        break;
      }
    }

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

  const result: OptionLabel[] = [];
  const remainingCounts: Record<OptionLabel, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const p of pool) remainingCounts[p]++;

  for (let i = 0; i < count; i++) {
    const candidates = (LABELS as readonly OptionLabel[]).filter((l) => {
      if (remainingCounts[l] <= 0) return false;
      if (i >= 2 && result[i - 1] === l && result[i - 2] === l) return false;
      return true;
    });

    const choice = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : (LABELS as readonly OptionLabel[]).find((l) => remainingCounts[l] > 0)!;

    result.push(choice);
    remainingCounts[choice]--;
  }

  return result;
}

/**
 * Creates an independent shuffled exam attempt for a set of questions.
 */
export function createExamAttemptSession(questions: any[]): ExamAttemptSession {
  const verifiedQuestions: any[] = [];

  for (const q of questions) {
    const verified = validateAndStandardizeFourOptions(q);
    if (verified) {
      verifiedQuestions.push(verified);
    }
  }

  const targetLetters = generateBalancedTargetLetters(verifiedQuestions.length);

  const clientQuestions: ClientShuffledQuestion[] = [];
  const secrets: Record<string, QuestionShuffleSecret> = {};

  for (let i = 0; i < verifiedQuestions.length; i++) {
    const q = verifiedQuestions[i];
    const targetCorrectLabel = targetLetters[i];
    const targetCorrectIndex = LABELS.indexOf(targetCorrectLabel);

    const correctOpt = q.options[q.correctIndex];
    const distractorOpts = q.options
      .filter((_: any, idx: number) => idx !== q.correctIndex)
      .sort(() => Math.random() - 0.5);

    const shuffledOptions: Array<{ label: OptionLabel; text: string }> = new Array(4);
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

    clientQuestions.push({
      id: q.id,
      questionNumber: q.questionNumber || i + 1,
      questionText: q.questionText,
      options: shuffledOptions,
      topic: q.topic || "General",
      difficulty: q.difficulty || "Medium",
    });

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
export function gradeExamAttempt(
  secrets: Record<string, QuestionShuffleSecret>,
  studentAnswers: Record<string, string> = {}
): ExamGradeResult {
  let correctCount = 0;
  const detailedResults: any[] = [];
  const qIds = Object.keys(secrets);

  for (const qId of qIds) {
    const secret = secrets[qId];
    if (!secret) continue;

    const rawGiven = studentAnswers[qId];
    const givenTrimmed = rawGiven ? String(rawGiven).trim() : "";
    const givenUpper = givenTrimmed.toUpperCase();

    let isCorrect = false;

    if (LABELS.includes(givenUpper as any)) {
      isCorrect = givenUpper === secret.correctVisualLabel;
    } else if (givenTrimmed) {
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
