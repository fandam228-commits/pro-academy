/**
 * Professional Academy – Global MCQ Answer Distribution Engine & Balancer
 * Ensures fair, balanced answer distributions (~25% for A, B, C, D)
 * Eliminates predictability, streaks (max streak <= 2), and repetitive cycles.
 * Strict Answer Accuracy & Question Stem Integrity Guaranteed.
 */

export const LABELS = ["A", "B", "C", "D"];

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function createPrng(seed = Date.now()) {
  let s = Math.abs(Math.floor(seed)) || 123456789;
  return function next() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalize(str) {
  return String(str || "").trim().toLowerCase();
}

/**
 * Generates a statistically balanced target letter sequence for N questions.
 * Guarantees:
 * 1. ~25% balance: count per letter = floor(N/4) + (remainder distributed)
 * 2. Max streak <= 2 (No AAA, BBB, CCC, DDD)
 * 3. Anti-cycle: No 2-pattern repeats (ABAB, CDCD) and No 4-pattern repeats (ABCDABCD)
 */
export function generateControlledBalancedSequence(count, options = {}) {
  if (count <= 0) return [];
  const rng = options.seed !== undefined ? createPrng(options.seed) : Math.random;
  const maxStreak = options.maxStreak || 2;

  const baseCount = Math.floor(count / 4);
  const remainder = count % 4;

  const targetCounts = {
    A: baseCount + (remainder >= 1 ? 1 : 0),
    B: baseCount + (remainder >= 2 ? 1 : 0),
    C: baseCount + (remainder >= 3 ? 1 : 0),
    D: baseCount,
  };

  const pool = [];
  for (const label of LABELS) {
    for (let i = 0; i < targetCounts[label]; i++) {
      pool.push(label);
    }
  }

  // Shuffle pool using Fisher-Yates with backtracking if constraint violated
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts++ < maxAttempts) {
    // Fisher-Yates shuffle
    const candidate = [...pool];
    for (let i = candidate.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
    }

    let valid = true;

    // 1. Check streak limit (no run > maxStreak)
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

    // 2. Check 2-cycle repeats (e.g. ABABAB)
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

    // 3. Check 4-cycle repeats (e.g. ABCDABCD)
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

  // Fallback: Greedy constructive builder with constraint checking
  const result = [];
  const remaining = { ...targetCounts };

  for (let i = 0; i < count; i++) {
    const candidates = LABELS.filter((l) => {
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

    const choice = candidates.length > 0
      ? candidates[Math.floor(rng() * candidates.length)]
      : LABELS.find((l) => remaining[l] > 0);

    result.push(choice);
    remaining[choice]--;
  }

  return result;
}

/**
 * Resolves the correct option text and current option index for a given question.
 */
export function resolveQuestionCorrectOption(question) {
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

  // 1. Numeric index (0..3)
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

  // 2. Letter (A, B, C, D)
  if (LABELS.includes(upper)) {
    const idx = LABELS.indexOf(upper);
    return {
      index: idx,
      label: upper,
      text: optTexts[idx],
      format: "letter",
      isLowercase: cleanCorrect === cleanCorrect.toLowerCase(),
    };
  }

  // 3. Exact text match
  const normCorrect = normalize(cleanCorrect);
  let matchedIdx = optTexts.findIndex((t) => normalize(t) === normCorrect);

  if (matchedIdx === -1) {
    // Check original option objects
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
 * Rebalances a single question by placing its correct option at targetLabel slot (A, B, C, or D).
 * Preserves questionText, options content, explanation, and updates references safely.
 */
export function rebalanceQuestion(question, targetLabel, options = {}) {
  const resolved = resolveQuestionCorrectOption(question);
  if (!resolved) {
    // Cannot safely rebalance without verified correct answer
    return question;
  }

  const targetIndex = LABELS.indexOf(targetLabel);
  if (targetIndex === -1) return question;

  const currentOpts = question.options;
  const correctRawOpt = currentOpts[resolved.index];

  // Distractors
  const distractors = currentOpts.filter((_, idx) => idx !== resolved.index);

  // Distractor permutation (either seeded or fixed rotation)
  const rng = options.seed !== undefined ? createPrng(options.seed) : Math.random;
  const shuffledDistractors = [...distractors];
  if (options.shuffleDistractors) {
    for (let i = shuffledDistractors.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledDistractors[i], shuffledDistractors[j]] = [shuffledDistractors[j], shuffledDistractors[i]];
    }
  }

  // Assemble new 4 options
  const newOptions = new Array(4);
  const isObjectOptions = typeof currentOpts[0] === "object" && currentOpts[0] !== null;

  // Set the correct option at targetIndex
  if (isObjectOptions) {
    const isLower = currentOpts[0].label && currentOpts[0].label === currentOpts[0].label.toLowerCase();
    const lbl = isLower ? targetLabel.toLowerCase() : targetLabel;
    newOptions[targetIndex] = {
      ...correctRawOpt,
      label: lbl,
      text: resolved.text,
    };
  } else {
    // String options - preserve prefix if original had it (must be followed by parenthesis, dot, colon, or hyphen)
    const origStr = String(correctRawOpt);
    if (/^[A-Da-d][\)\.\:\-]\s*/.test(origStr)) {
      const sep = origStr.match(/^[A-Da-d]([\)\.\:\-]\s*)/)[1];
      newOptions[targetIndex] = `${targetLabel}${sep}${resolved.text}`;
    } else {
      newOptions[targetIndex] = resolved.text;
    }
  }

  // Fill in the remaining 3 slots
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
        const sep = distStr.match(/^[A-Da-d]([\)\.\:\-]\s*)/)[1];
        newOptions[slot] = `${LABELS[slot]}${sep}${dText}`;
      } else {
        newOptions[slot] = dText;
      }
    }
  }

  // Clone question and update answer keys
  const updated = { ...question, options: newOptions };

  if (resolved.format === "numeric") {
    updated.correct = targetIndex;
  } else if (resolved.format === "letter") {
    updated.correctAnswer = resolved.isLowercase ? targetLabel.toLowerCase() : targetLabel;
  } else {
    // Format is "text" - text remains the same!
    // But if question also had correctAnswer formatted with letter prefix e.g. "a) ...", update it
    if (question.correctAnswer && /^[A-Da-d][\).\s]+/.test(String(question.correctAnswer))) {
      const sep = String(question.correctAnswer).match(/^[A-Da-d]([\).\s]+)/)[1];
      updated.correctAnswer = `${targetLabel}${sep}${resolved.text}`;
    }
  }

  return updated;
}

/**
 * Rebalances a collection of questions.
 */
export function rebalanceQuestionSet(questions, options = {}) {
  const validIndices = [];
  const sequence = [];

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
  const distributionBefore = { A: 0, B: 0, C: 0, D: 0 };
  const distributionAfter = { A: 0, B: 0, C: 0, D: 0 };
  const integrityErrors = [];

  for (let k = 0; k < validIndices.length; k++) {
    const qIndex = validIndices[k];
    const originalQ = questions[qIndex];
    const targetLabel = targetSequence[k];

    const prevResolved = resolveQuestionCorrectOption(originalQ);
    distributionBefore[prevResolved.label]++;

    const rebalancedQ = rebalanceQuestion(originalQ, targetLabel, {
      seed: options.seed ? options.seed + k : undefined,
      shuffleDistractors: options.shuffleDistractors ?? true,
    });

    const newResolved = resolveQuestionCorrectOption(rebalancedQ);
    distributionAfter[newResolved.label]++;

    // Verify integrity
    const integrity = verifyQuestionIntegrity(originalQ, rebalancedQ);
    if (!integrity.valid) {
      integrityErrors.push({ id: originalQ.id || `q_${qIndex}`, errors: integrity.errors });
    }

    rebalancedQuestions[qIndex] = rebalancedQ;
  }

  // Calculate streaks after
  let maxStreakAfter = 0;
  let currentStreak = 0;
  let currentLabel = null;
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
 * Verifies that question text is untouched, option texts are an exact permutation,
 * and the correct option text in the rebalanced question is identical to original.
 */
export function verifyQuestionIntegrity(originalQ, rebalancedQ) {
  const errors = [];

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

  // Check that options set is an exact permutation
  const getTexts = (opts) =>
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
