/**
 * PROFESSIONAL ACADEMY — SMART TRANSLATION EVALUATION ENGINE
 * Teacher: Mr. Habib El Rahman
 *
 * Implements the official 5-part pedagogical translation rubric:
 * 1. Meaning accuracy: 40%
 * 2. Grammar: 20%
 * 3. Vocabulary: 20%
 * 4. Sentence structure: 10%
 * 5. Spelling & punctuation: 10%
 *
 * Core Principles:
 * - NO exact string matching for written translations.
 * - Accept diverse valid lexical and structural alternatives.
 * - If evaluation is uncertain (borderline score 40% - 79%), mark for Teacher Review ('needs_review')
 *   instead of unfairly declaring it incorrect.
 */

export interface RubricBreakdown {
  meaning: number; // 0 - 40
  grammar: number; // 0 - 20
  vocab: number; // 0 - 20
  structure: number; // 0 - 10
  mechanics: number; // 0 - 10
  totalPercentage: number; // 0 - 100
}

export interface EvaluationResult {
  score: number; // Scaled to question marks
  maxMarks: number;
  percentage: number;
  isCorrect: boolean;
  status: "graded" | "needs_review";
  needsTeacherReview: boolean;
  rubric: RubricBreakdown;
  feedback: string;
  suggestedCorrection: string;
  modelAnswerUsed: string;
  errorsDetected: string[];
}

// -------------------------------------------------------------
// TEXT NORMALIZATION UTILITIES
// -------------------------------------------------------------

export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove harakat / tashkeel
    .replace(/[إأآا]/g, "ا") // normalize alef
    .replace(/ة/g, "ه") // normalize taa marbuta
    .replace(/ى/g, "ي") // normalize alef maqsura
    .replace(/[.,!?;:()[\]{}"'«»\-]/g, " ") // replace punctuation with space
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const ENGLISH_CONTRACTIONS: Record<string, string> = {
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "won't": "will not",
  "wouldn't": "would not",
  "can't": "cannot",
  "couldn't": "could not",
  "shouldn't": "should not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "hasn't": "has not",
  "haven't": "have not",
  "hadn't": "had not",
  "it's": "it is",
  "that's": "that is",
  "there's": "there is",
  "they're": "they are",
  "we're": "we are",
  "you're": "you are",
  "i'm": "i am",
  "i've": "i have",
  "we've": "we have",
  "they've": "they have",
  "i'll": "i will",
  "we'll": "we will",
  "they'll": "they will",
};

export function expandContractions(text: string): string {
  let expanded = text;
  for (const [contraction, replacement] of Object.entries(ENGLISH_CONTRACTIONS)) {
    const reg = new RegExp(`\\b${contraction}\\b`, "gi");
    expanded = expanded.replace(reg, replacement);
  }
  return expanded;
}

export function normalizeEnglish(text: string): string {
  if (!text) return "";
  const expanded = expandContractions(text);
  return expanded
    .replace(/[.,!?;:()[\]{}"'\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function tokenizeWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

// -------------------------------------------------------------
// SIMILARITY METRICS (Jaccard & Levenshtein)
// -------------------------------------------------------------

export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

export function stringSimilarity(s1: string, s2: string): number {
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length < s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;
  const dist = levenshteinDistance(longer, shorter);
  return (longer.length - dist) / longer.length;
}

// -------------------------------------------------------------
// RUBRIC EVALUATION LOGIC FOR WRITTEN TRANSLATION
// -------------------------------------------------------------

const ENGLISH_STOPWORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "it", "this", "that", "these", "those",
]);

const ARABIC_STOPWORDS = new Set([
  "في", "من", "عن", "علي", "الي", "مع", "بين", "هذا", "هذه", "ذلك", "تلك",
  "ان", "انما", "كان", "كانت", "يكون", "تكون", "قد", "لقد", "هو", "هي", "هم",
]);

function extractKeywords(tokens: string[], isArabic: boolean): Set<string> {
  const stopSet = isArabic ? ARABIC_STOPWORDS : ENGLISH_STOPWORDS;
  return new Set(tokens.filter((w) => w.length > 2 && !stopSet.has(w)));
}

function evaluateWrittenTranslation(
  studentInput: string,
  modelAnswer: string,
  alternatives: string[] = [],
  isArabicTarget: boolean = false
): {
  rubric: RubricBreakdown;
  bestModel: string;
  errorsDetected: string[];
} {
  const allCandidates = [modelAnswer, ...alternatives].filter(Boolean);
  const normalize = isArabicTarget ? normalizeArabic : normalizeEnglish;

  const cleanStudent = normalize(studentInput);
  const studentTokens = tokenizeWords(cleanStudent);
  const studentKeywords = extractKeywords(studentTokens, isArabicTarget);

  let bestRubric: RubricBreakdown = {
    meaning: 0,
    grammar: 0,
    vocab: 0,
    structure: 0,
    mechanics: 0,
    totalPercentage: 0,
  };
  let bestCandidate = modelAnswer;
  let bestErrors: string[] = [];

  for (const candidate of allCandidates) {
    const cleanCand = normalize(candidate);
    const candTokens = tokenizeWords(cleanCand);
    const candKeywords = extractKeywords(candTokens, isArabicTarget);

    // 1. EXACT / VERY CLOSE MATCH SHORTCUT
    if (cleanStudent === cleanCand) {
      return {
        rubric: {
          meaning: 40,
          grammar: 20,
          vocab: 20,
          structure: 10,
          mechanics: 10,
          totalPercentage: 100,
        },
        bestModel: candidate,
        errorsDetected: [],
      };
    }

    const errors: string[] = [];

    // 2. Meaning Accuracy (40%)
    // Check keyword recall and overall similarity
    const keywordJaccard = jaccardSimilarity(studentKeywords, candKeywords);
    const charSim = stringSimilarity(cleanStudent, cleanCand);
    const meaningScoreRaw = 0.65 * keywordJaccard + 0.35 * charSim;
    const meaning = Math.round(Math.min(40, Math.max(0, meaningScoreRaw * 40)));

    if (keywordJaccard < 0.6) {
      errors.push(
        isArabicTarget
          ? "نقص في نقل بعض المعاني والمفاهيم الرئيسية للنص الأصلي."
          : "Some key semantic concepts from the source text are missing or altered."
      );
    }

    // 3. Grammar (20%)
    let grammar = 20;
    if (!isArabicTarget) {
      // English grammar checks
      // Check subject-verb agreement basic patterns (e.g., 'they plays', 'he play')
      if (/\b(he|she|it|the government|the state)\s+([a-z]+[^s])\b/i.test(studentInput) &&
          !/\b(can|will|must|should|could|would|may|might|did|does|do)\b/i.test(studentInput)) {
        // Potential missing 3rd person 's'
        const match = studentInput.match(/\b(he|she|it|the government|the state)\s+([a-z]+)\b/i);
        if (match && !["is", "was", "has", "can", "will"].includes(match[2].toLowerCase()) && !match[2].endsWith("s") && !match[2].endsWith("ed")) {
          grammar -= 4;
          errors.push(`Check third-person singular verb agreement: '${match[0]}'.`);
        }
      }
      // Check double past (e.g. 'did went', 'was went')
      if (/\b(did|does|do)\s+[a-z]+(ed|went|saw|came)\b/i.test(studentInput)) {
        grammar -= 5;
        errors.push("Avoid past tense after auxiliary 'did' / 'do'.");
      }
      // Missing auxiliary in passive
      if (candidate.includes("was ") || candidate.includes("were ") || candidate.includes("been ")) {
        if (!studentInput.includes("was ") && !studentInput.includes("were ") && !studentInput.includes("been ") && !studentInput.includes("is ") && !studentInput.includes("are ")) {
          grammar -= 5;
          errors.push("Passive voice construction appears incomplete (missing 'be' auxiliary).");
        }
      }
    } else {
      // Arabic grammar check: basic verbal agreement
      if (candidate.startsWith("تهدف") && studentInput.startsWith("يهدف المشروعات")) {
        grammar -= 4;
        errors.push("تذكير الفعل مع جمع غير العاقل (المشروعات تهدف وليس يهدف).");
      }
    }
    grammar = Math.max(5, Math.min(20, grammar));

    // 4. Vocabulary (20%)
    let vocab = 20;
    let missingKeywordsCount = 0;
    for (const kw of candKeywords) {
      if (!studentKeywords.has(kw)) {
        missingKeywordsCount++;
      }
    }
    const missingRatio = candKeywords.size > 0 ? missingKeywordsCount / candKeywords.size : 0;
    vocab = Math.round(20 * (1 - missingRatio * 0.7));
    vocab = Math.max(5, Math.min(20, vocab));
    if (missingRatio > 0.4) {
      errors.push(
        isArabicTarget
          ? "استخدام مفردات غير دقيقة أو غياب بعض المصطلحات المحورية."
          : "Some key vocabulary terms or idiomatic collocations were not properly represented."
      );
    }

    // 5. Sentence Structure (10%)
    let structure = 10;
    if (!isArabicTarget) {
      // English sentence structure: check if starts with verb improperly
      const firstWord = studentTokens[0] || "";
      const commonVerbs = ["play", "plays", "makes", "make", "achieve", "aims", "seek", "seeks", "exert", "exerts"];
      if (commonVerbs.includes(firstWord.toLowerCase())) {
        structure -= 5;
        errors.push("English sentences must begin with a subject, not a verb (S + V + O).");
      }
      // Adjective after noun check (e.g. 'projects nationals')
      if (/\bprojects\s+(nationals|giants|importants)\b/i.test(studentInput)) {
        structure -= 4;
        errors.push("Adjectives must precede nouns in English (e.g. 'national projects').");
      }
    }
    structure = Math.max(3, Math.min(10, structure));

    // 6. Mechanics & Punctuation (10%)
    let mechanics = 10;
    const trimmedRaw = studentInput.trim();
    if (!isArabicTarget) {
      // Check capital letter at start of sentence
      if (trimmedRaw.length > 0 && trimmedRaw[0] !== trimmedRaw[0].toUpperCase()) {
        mechanics -= 2;
        errors.push("Start sentences with a capital letter.");
      }
      // Check ending punctuation
      if (trimmedRaw.length > 0 && !/[.!?]$/.test(trimmedRaw)) {
        mechanics -= 2;
        errors.push("End sentence with proper punctuation (period/full stop).");
      }
    } else {
      if (trimmedRaw.length > 0 && !/[.!؟]$/.test(trimmedRaw)) {
        mechanics -= 2;
      }
    }
    mechanics = Math.max(3, Math.min(10, mechanics));

    const totalPercentage = meaning + grammar + vocab + structure + mechanics;

    if (totalPercentage > bestRubric.totalPercentage) {
      bestRubric = {
        meaning,
        grammar,
        vocab,
        structure,
        mechanics,
        totalPercentage,
      };
      bestCandidate = candidate;
      bestErrors = errors;
    }
  }

  return {
    rubric: bestRubric,
    bestModel: bestCandidate,
    errorsDetected: bestErrors,
  };
}

// -------------------------------------------------------------
// MAIN EVALUATION DISPATCHER
// -------------------------------------------------------------

export function evaluateQuestion(
  questionType: string,
  studentAnswer: any,
  correctAnswer: string,
  alternativeAnswers: string[] = [],
  options: any = null,
  marks: number = 1
): EvaluationResult {
  const cleanStudent = typeof studentAnswer === "string" ? studentAnswer.trim() : String(studentAnswer || "").trim();

  // Handle empty submission
  if (!cleanStudent) {
    return {
      score: 0,
      maxMarks: marks,
      percentage: 0,
      isCorrect: false,
      status: "graded",
      needsTeacherReview: false,
      rubric: { meaning: 0, grammar: 0, vocab: 0, structure: 0, mechanics: 0, totalPercentage: 0 },
      feedback: "لم يتم تقديم إجابة. يرجى كتابة ترجمتك للمتابعة.",
      suggestedCorrection: correctAnswer,
      modelAnswerUsed: correctAnswer,
      errorsDetected: ["No answer provided."],
    };
  }

  // OBJECTIVE TYPES: MCQ, Word Matching, Word Selection, Sentence Ordering, Fill in Blanks
  if (questionType === "mcq" || questionType === "word_selection") {
    const isMatch = cleanStudent.toLowerCase() === correctAnswer.trim().toLowerCase();
    const score = isMatch ? marks : 0;
    return {
      score,
      maxMarks: marks,
      percentage: isMatch ? 100 : 0,
      isCorrect: isMatch,
      status: "graded",
      needsTeacherReview: false,
      rubric: isMatch
        ? { meaning: 40, grammar: 20, vocab: 20, structure: 10, mechanics: 10, totalPercentage: 100 }
        : { meaning: 0, grammar: 0, vocab: 0, structure: 0, mechanics: 0, totalPercentage: 0 },
      feedback: isMatch
        ? "إجابة صحيحة واختيار دقيق ومطابق للقواعد!"
        : "إجابة غير صحيحة. راجع التفسير التعليمي لمعرفة سبب استبعاد هذا الخيار.",
      suggestedCorrection: correctAnswer,
      modelAnswerUsed: correctAnswer,
      errorsDetected: isMatch ? [] : ["Incorrect option selected."],
    };
  }

  if (questionType === "sentence_ordering") {
    const normStudent = normalizeEnglish(cleanStudent);
    const normCorrect = normalizeEnglish(correctAnswer);
    const isMatch = normStudent === normCorrect || (alternativeAnswers || []).some((alt) => normalizeEnglish(alt) === normStudent);
    return {
      score: isMatch ? marks : 0,
      maxMarks: marks,
      percentage: isMatch ? 100 : 0,
      isCorrect: isMatch,
      status: "graded",
      needsTeacherReview: false,
      rubric: isMatch
        ? { meaning: 40, grammar: 20, vocab: 20, structure: 10, mechanics: 10, totalPercentage: 100 }
        : { meaning: 15, grammar: 5, vocab: 10, structure: 0, mechanics: 0, totalPercentage: 30 },
      feedback: isMatch
        ? "ترتيب سليم ومنطقي 100% للجملة الإنجليزية!"
        : "ترتيب الكلمات غير صحيح. تذكر دائماً قاعدة (الفاعل + الفعل + المفعول).",
      suggestedCorrection: correctAnswer,
      modelAnswerUsed: correctAnswer,
      errorsDetected: isMatch ? [] : ["Incorrect word order."],
    };
  }

  if (questionType === "word_matching") {
    // Expecting "A:1|B:2|..." or exact matching pairs
    const isMatch = cleanStudent.toLowerCase() === correctAnswer.trim().toLowerCase();
    return {
      score: isMatch ? marks : 0,
      maxMarks: marks,
      percentage: isMatch ? 100 : 0,
      isCorrect: isMatch,
      status: "graded",
      needsTeacherReview: false,
      rubric: isMatch
        ? { meaning: 40, grammar: 20, vocab: 20, structure: 10, mechanics: 10, totalPercentage: 100 }
        : { meaning: 0, grammar: 0, vocab: 0, structure: 0, mechanics: 0, totalPercentage: 0 },
      feedback: isMatch ? "تطابق دقيق وصحيح لجميع المصطلحات!" : "توجد أخطاء في مطابقة بعض المصطلحات.",
      suggestedCorrection: correctAnswer,
      modelAnswerUsed: correctAnswer,
      errorsDetected: isMatch ? [] : ["Mismatched vocabulary pairs."],
    };
  }

  if (questionType === "fill_blanks" || questionType === "complete_translation") {
    const normStudent = normalizeEnglish(cleanStudent);
    const validAnswers = [correctAnswer, ...(alternativeAnswers || [])].map((a) => normalizeEnglish(a));
    const isMatch = validAnswers.includes(normStudent);
    return {
      score: isMatch ? marks : 0,
      maxMarks: marks,
      percentage: isMatch ? 100 : 0,
      isCorrect: isMatch,
      status: "graded",
      needsTeacherReview: false,
      rubric: isMatch
        ? { meaning: 40, grammar: 20, vocab: 20, structure: 10, mechanics: 10, totalPercentage: 100 }
        : { meaning: 10, grammar: 0, vocab: 5, structure: 0, mechanics: 0, totalPercentage: 15 },
      feedback: isMatch
        ? "استكمال دقيق ومتلائم تماماً مع السياق النحوي والمعنوي!"
        : "الكلمة غير دقيقة في هذا السياق.",
      suggestedCorrection: correctAnswer,
      modelAnswerUsed: correctAnswer,
      errorsDetected: isMatch ? [] : ["Incorrect completion word."],
    };
  }

  // WRITTEN TRANSLATION TYPES:
  // ar_to_en_text, en_to_ar_text, error_correction, context_translation, sentence_transformation, paragraph_translation, translation_given_words, listening_translation
  const isArabicTarget = questionType === "en_to_ar_text" || (questionType === "listening_translation" && /[\u0600-\u06FF]/.test(correctAnswer));

  const { rubric, bestModel, errorsDetected } = evaluateWrittenTranslation(
    cleanStudent,
    correctAnswer,
    alternativeAnswers,
    isArabicTarget
  );

  const percentage = rubric.totalPercentage;
  const scaledScore = Math.round((percentage / 100) * marks * 10) / 10;
  const isCorrect = percentage >= 75;

  // CRITICAL REQUIREMENT:
  // If evaluation is uncertain (borderline score 40% - 74% or length deviation with high semantics),
  // flag for Teacher Review instead of declaring it incorrect!
  const needsTeacherReview = percentage >= 40 && percentage < 78;
  const status: "graded" | "needs_review" = needsTeacherReview ? "needs_review" : "graded";

  let feedback = "";
  if (percentage >= 85) {
    feedback = "ترجمة ممتازة ورصينة، تعكس فهماً عميقاً لأصول الصياغة وقواعد اللغة!";
  } else if (percentage >= 70) {
    feedback = "ترجمة جيدة جداً وناجحة في نقل المعنى الأساسي، مع بعض الملاحظات البسيطة المدونة أدناه.";
  } else if (needsTeacherReview) {
    feedback = "محاولة جيدة لنقل المعنى! تم تحويل إجابتك تلقائياً إلى معلمك (المستر حبيب) لمراجعتها ومنحك أفضل تقدير أكاديمي مستحق.";
  } else {
    feedback = "الترجمة بحاجة إلى مراجعة وتدقيق في القواعد والمفردات المستخدمة. قارن إجابتك بالنموذج الإرشادي أدناه.";
  }

  return {
    score: scaledScore,
    maxMarks: marks,
    percentage,
    isCorrect,
    status,
    needsTeacherReview,
    rubric,
    feedback,
    suggestedCorrection: bestModel,
    modelAnswerUsed: bestModel,
    errorsDetected,
  };
}
