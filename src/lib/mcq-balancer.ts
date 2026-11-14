/**
 * Professional Academy – Global MCQ Answer Distribution Engine & Balancer
 * Ensures fair, balanced answer distributions (~25% for A, B, C, D)
 * Eliminates predictability, streaks (max streak <= 2), and repetitive cycles.
 * Strict Answer Accuracy & Question Stem Integrity Guaranteed.
 */

export const LABELS = ["A", "B", "C", "D"] as const;
export type OptionLabel = (typeof LABELS)[number];

export interface RebalanceOptions {
  seed?: number;
  maxStreak?: number;
  shuffleDistractors?: boolean;
}

export interface RebalanceStats {
  total: number;
  rebalanced: number;
  unchanged: number;
  distributionBefore: Record<OptionLabel, number>;
  distributionAfter: Record<OptionLabel, number>;
  maxStreakAfter: number;
  integrityErrors: Array<{ id: string; errors: string[] }>;
}

export interface RebalanceResult<T = any> {
  rebalancedQuestions: T[];
  stats: RebalanceStats;
}

export interface IntegrityResult {
  valid: boolean;
  errors: string[];
}

export interface ResolvedOption {
  index: number;
  label: OptionLabel;
  text: string;
  format: "numeric" | "letter" | "text";
  isLowercase?: boolean;
}

function createPrng(seed: number = Date.now()) {
  let s = Math.abs(Math.floor(seed)) || 123456789;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalize(str: any): string {
  return String(str || "").trim().toLowerCase();
}

/**
 * Generates a statistically balanced target letter sequence for N questions.
 */
export function generateControlledBalancedSequence(
  count: number,
  options: RebalanceOptions = {}
): OptionLabel[] {
  if (count <= 0) return [];
  const rng = options.seed !== undefined ? createPrng(options.seed) : Math.random;
  const maxStreak = options.maxStreak || 2;

  const baseCount = Math.floor(count / 4);
  const remainder = count % 4;

  const targetCounts: Record<OptionLabel, number> = {
    A: baseCount + (remainder >= 1 ? 1 : 0),
    B: baseCount + (remainder >= 2 ? 1 : 0),
    C: baseCount + (remainder >= 3 ? 1 : 0),
    D: baseCount,
  };

  const pool: OptionLabel[] = [];
  for (const label of LABELS) {
    for (let i = 0; i < targetCounts[label]; i++) {
      pool.push(label);
    }
  }

  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts++ < maxAttempts) {
    const candidate = [...pool];
    for (let i = candidate.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
    }

    let valid = true;

    for (let i = maxStreak; i < candidate.length; i++) {
      let allMatch = true;
      for (let k = 1; k <= maxStreak; k++) {
        if (candidate[i] !== candidate[i - k]) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        valid = false;
        break;
      }
    }

    if (valid && candidate.length >= 6) {
      for (let i = 5; i < candidate.length; i++) {
        if (
          candidate[i] === candidate[i - 2] &&
          candidate[i - 2] === candidate[i - 4] &&
          candidate[i - 1] === candidate[i - 3] &&
          candidate[i - 3] === candidate[i - 5]
        ) {
          valid = false;
          break;
        }
      }
    }

    if (valid && candidate.length >= 8) {
      for (let i = 7; i < candidate.length; i++) {
        if (
          candidate[i] === candidate[i - 4] &&
          candidate[i - 1] === candidate[i - 5] &&
          candidate[i - 2] === candidate[i - 6] &&
          candidate[i - 3] === candidate[i - 7]
        ) {
          valid = false;
          break;
        }
      }
    }

    if (valid) {
      return candidate;
    }
  }

  const result: OptionLabel[] = [];
  const remaining = { ...targetCounts };

  for (let i = 0; i < count; i++) {
    const candidates = (LABELS as readonly OptionLabel[]).filter((l) => {
      if (remaining[l] <= 0) return false;
      if (i >= maxStreak) {
        let isStreak = true;
        for (let k = 1; k <= maxStreak; k++) {
          if (result[i - k] !== l) {
            isStreak = false;
            break;
          }
        }
        if (isStreak) return false;
      }
      return true;
    });

    const choice =
      candidates.length > 0
        ? candidates[Math.floor(rng() * candidates.length)]
        : (LABELS as readonly OptionLabel[]).find((l) => remaining[l] > 0)!;

    result.push(choice);
    remaining[choice]--;
  }

  return result;
}

/**
 * Resolves the correct option text and current option index for a given question.
 */
export function resolveQuestionCorrectOption(question: any): ResolvedOption | null {
  const options = question.options;
  if (!options || !Array.isArray(options) || options.length !== 4) {
    return null;
  }

  const optTexts = options.map((opt) => {
    if (typeof opt === "string") {
      const match = opt.match(/^[A-Da-d][\)\.\:\-]\s*(.*)$/);
      return match ? match[1].trim() : opt.trim();
    } else if (opt && typeof opt === "object") {
      return String(opt.text || opt.label || "").trim();
    }
    return String(opt || "").trim();
  });

  const rawCorrect = question.correctAnswer ?? question.modelAnswer ?? question.correct;
  if (rawCorrect === undefined || rawCorrect === null) {
    return null;
  }

  if (typeof rawCorrect === "number" && rawCorrect >= 0 && rawCorrect < 4) {
    return {
      index: rawCorrect,
      label: LABELS[rawCorrect],
      text: optTexts[rawCorrect],
      format: "numeric",
    };
  }

  const cleanCorrect = String(rawCorrect).trim();
  const upper = cleanCorrect.toUpperCase();

  if ((LABELS as readonly string[]).includes(upper)) {
    const idx = (LABELS as readonly string[]).indexOf(upper);
    return {
      index: idx,
      label: upper as OptionLabel,
      text: optTexts[idx],
      format: "letter",
      isLowercase: cleanCorrect === cleanCorrect.toLowerCase(),
    };
  }

  const normCorrect = normalize(cleanCorrect);
  let matchedIdx = optTexts.findIndex((t) => normalize(t) === normCorrect);

  if (matchedIdx === -1) {
    matchedIdx = options.findIndex((opt) => {
      if (typeof opt === "object") {
        return normalize(opt.text) === normCorrect || normalize(opt.label) === normCorrect;
      }
      return normalize(opt) === normCorrect;
    });
  }

  if (matchedIdx !== -1) {
    return {
      index: matchedIdx,
      label: LABELS[matchedIdx],
      text: optTexts[matchedIdx],
      format: "text",
    };
  }

  return null;
}

/**
 * Rebalances a single question by placing its correct option at targetLabel slot.
 */
export function rebalanceQuestion<T = any>(
  question: T,
  targetLabel: OptionLabel,
  options: RebalanceOptions = {}
): T {
  const resolved = resolveQuestionCorrectOption(question);
  if (!resolved) {
    return question;
  }

  const targetIndex = LABELS.indexOf(targetLabel);
  if (targetIndex === -1) return question;

  const currentOpts = (question as any).options;
  const correctRawOpt = currentOpts[resolved.index];
  const distractors = currentOpts.filter((_: any, idx: number) => idx !== resolved.index);

  const rng = options.seed !== undefined ? createPrng(options.seed) : Math.random;
  const shuffledDistractors = [...distractors];
  if (options.shuffleDistractors) {
    for (let i = shuffledDistractors.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledDistractors[i], shuffledDistractors[j]] = [shuffledDistractors[j], shuffledDistractors[i]];
    }
  }

  const newOptions = new Array(4);
  const isObjectOptions = typeof currentOpts[0] === "object" && currentOpts[0] !== null;

  if (isObjectOptions) {
    const isLower = currentOpts[0].label && currentOpts[0].label === currentOpts[0].label.toLowerCase();
    const lbl = isLower ? targetLabel.toLowerCase() : targetLabel;
    newOptions[targetIndex] = {
      ...correctRawOpt,
      label: lbl,
      text: resolved.text,
    };
  } else {
    const origStr = String(correctRawOpt);
    if (/^[A-Da-d][\)\.\:\-]\s*/.test(origStr)) {
      const sep = origStr.match(/^[A-Da-d]([\)\.\:\-]\s*)/)![1];
      newOptions[targetIndex] = `${targetLabel}${sep}${resolved.text}`;
    } else {
      newOptions[targetIndex] = resolved.text;
    }
  }

  let dIdx = 0;
  for (let slot = 0; slot < 4; slot++) {
    if (slot === targetIndex) continue;
    const distractor = shuffledDistractors[dIdx++];
    const dText = typeof distractor === "object" ? distractor.text : distractor;

    if (isObjectOptions) {
      const isLower = currentOpts[0].label && currentOpts[0].label === currentOpts[0].label.toLowerCase();
      const slotLabel = isLower ? LABELS[slot].toLowerCase() : LABELS[slot];
      newOptions[slot] = {
        ...distractor,
        label: slotLabel,
        text: dText,
      };
    } else {
      const distStr = String(distractor);
      if (/^[A-Da-d][\)\.\:\-]\s*/.test(distStr)) {
        const sep = distStr.match(/^[A-Da-d]([\)\.\:\-]\s*)/)![1];
        newOptions[slot] = `${LABELS[slot]}${sep}${dText}`;
      } else {
        newOptions[slot] = dText;
      }
    }
  }

  const updated: any = { ...question, options: newOptions };

  if (resolved.format === "numeric") {
    updated.correct = targetIndex;
  } else if (resolved.format === "letter") {
    updated.correctAnswer = resolved.isLowercase ? targetLabel.toLowerCase() : targetLabel;
  } else {
    if ((question as any).correctAnswer && /^[A-Da-d][\)\.\:\-]\s*/.test(String((question as any).correctAnswer))) {
      const sep = String((question as any).correctAnswer).match(/^[A-Da-d]([\)\.\:\-]\s*)/)![1];
      updated.correctAnswer = `${targetLabel}${sep}${resolved.text}`;
    }
  }

  return updated;
}

/**
 * Rebalances a collection of questions.
 */
export function rebalanceQuestionSet<T = any>(
  questions: T[],
  options: RebalanceOptions = {}
): RebalanceResult<T> {
  const validIndices: number[] = [];
  const sequence: OptionLabel[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const resolved = resolveQuestionCorrectOption(q);
    if (resolved) {
      validIndices.push(i);
      sequence.push(resolved.label);
    }
  }

  const targetSequence = generateControlledBalancedSequence(validIndices.length, options);
  const rebalancedQuestions = [...questions];
  const distributionBefore: Record<OptionLabel, number> = { A: 0, B: 0, C: 0, D: 0 };
  const distributionAfter: Record<OptionLabel, number> = { A: 0, B: 0, C: 0, D: 0 };
  const integrityErrors: Array<{ id: string; errors: string[] }> = [];

  for (let k = 0; k < validIndices.length; k++) {
    const qIndex = validIndices[k];
    const originalQ = questions[qIndex];
    const targetLabel = targetSequence[k];

    const prevResolved = resolveQuestionCorrectOption(originalQ)!;
    distributionBefore[prevResolved.label]++;

    const rebalancedQ = rebalanceQuestion(originalQ, targetLabel, {
      seed: options.seed ? options.seed + k : undefined,
      shuffleDistractors: options.shuffleDistractors ?? true,
    });

    const newResolved = resolveQuestionCorrectOption(rebalancedQ)!;
    distributionAfter[newResolved.label]++;

    const integrity = verifyQuestionIntegrity(originalQ, rebalancedQ);
    if (!integrity.valid) {
      integrityErrors.push({ id: (originalQ as any).id || `q_${qIndex}`, errors: integrity.errors });
    }

    rebalancedQuestions[qIndex] = rebalancedQ;
  }

  let maxStreakAfter = 0;
  let currentStreak = 0;
  let currentLabel: OptionLabel | null = null;
  for (const label of targetSequence) {
    if (label === currentLabel) {
      currentStreak++;
    } else {
      currentStreak = 1;
      currentLabel = label;
    }
    if (currentStreak > maxStreakAfter) maxStreakAfter = currentStreak;
  }

  return {
    rebalancedQuestions,
    stats: {
      total: questions.length,
      rebalanced: validIndices.length,
      unchanged: questions.length - validIndices.length,
      distributionBefore,
      distributionAfter,
      maxStreakAfter,
      integrityErrors,
    },
  };
}

/**
 * Verifies question integrity.
 */
export function verifyQuestionIntegrity(originalQ: any, rebalancedQ: any): IntegrityResult {
  const errors: string[] = [];

  const origStem = (originalQ.questionText || originalQ.question || originalQ.prompt || "").trim();
  const rebalStem = (rebalancedQ.questionText || rebalancedQ.question || rebalancedQ.prompt || "").trim();

  if (origStem !== rebalStem) {
    errors.push("Question stem was modified");
  }

  const origResolved = resolveQuestionCorrectOption(originalQ);
  const rebalResolved = resolveQuestionCorrectOption(rebalancedQ);

  if (!origResolved) {
    errors.push("Original question correct answer could not be resolved");
  }
  if (!rebalResolved) {
    errors.push("Rebalanced question correct answer could not be resolved");
  }

  if (origResolved && rebalResolved) {
    if (normalize(origResolved.text) !== normalize(rebalResolved.text)) {
      errors.push(
        `Correct answer text changed! Original: '${origResolved.text}', Rebalanced: '${rebalResolved.text}'`
      );
    }
  }

  const getTexts = (opts: any[]) =>
    opts.map((o) => (typeof o === "object" ? o.text : o)).map(normalize).sort();

  const origOptions = getTexts(originalQ.options || []);
  const rebalOptions = getTexts(rebalancedQ.options || []);

  if (JSON.stringify(origOptions) !== JSON.stringify(rebalOptions)) {
    errors.push("Option text set was altered");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
