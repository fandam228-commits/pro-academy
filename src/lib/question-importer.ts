/**
 * Multi-Format Question Importer Engine
 * Parses questions from:
 * 1. Pipe format: Question | Option1,Option2,Option3,Option4 | CorrectAnswer
 * 2. Excel / Google Sheets: Tab-separated lines (\t)
 * 3. Standard CSV: Comma-separated (with quotes support)
 * 4. Semicolon format: Semicolon-separated lines (;)
 * 5. Word / Exam papers: Numbered multi-line Q&A with A/B/C/D and Answer: X
 */

export interface QuestionImportItem {
  questionText: string;
  options: string[];
  correctAnswer: string;
  domainCategory?: "Vocabulary" | "Grammar" | "Reading" | "Writing" | "Listening";
  questionType?: string;
  stage?: string;
  grade?: string;
  curriculum?: string;
  term?: string;
  unit?: string;
  lesson?: string;
  section?: string | null;
  difficulty?: "Easy" | "Medium" | "Hard";
  topic?: string;
  grammarTopic?: string | null;
  source?: string;
  explanation?: string;
  points?: number;
}

export interface ParseResult {
  items: QuestionImportItem[];
  errors: string[];
  warnings: string[];
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, ""));
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, ""));
  return result.filter((p) => p.length > 0);
}

function resolveCorrectAnswer(corr: string, opts: string[]): string {
  const cleanCorr = (corr || "").trim();
  if (!cleanCorr) return opts[0] || "";

  // Check if corr is a letter (A, B, C, D)
  const letterMatch = cleanCorr.match(/^[A-Da-d]$/);
  if (letterMatch && opts.length > 0) {
    const idx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
    if (opts[idx]) return opts[idx];
  }

  // Check if corr is an index (1, 2, 3, 4)
  const numMatch = cleanCorr.match(/^[1-9]$/);
  if (numMatch && opts.length > 0) {
    const idx = parseInt(numMatch[0], 10) - 1;
    if (opts[idx]) return opts[idx];
  }

  // Check if corr matches one of the options (case-insensitive)
  const existing = opts.find((o) => o.toLowerCase() === cleanCorr.toLowerCase());
  if (existing) return existing;

  // If options exist but correct answer is not among them, add it to options so question is valid
  if (opts.length > 0 && !opts.includes(cleanCorr)) {
    opts.push(cleanCorr);
  }

  return cleanCorr;
}

function inferDomain(qText: string): "Grammar" | "Vocabulary" {
  const lower = qText.toLowerCase();
  const grammarKeywords = [
    " had ",
    " if ",
    " would ",
    " could ",
    " which ",
    " whom ",
    " whose ",
    " tense",
    " passive",
    " modal",
    " hardly ",
    " scarcely ",
    " no sooner ",
    " unless ",
    " although ",
    " despite ",
    " neither ",
    " either ",
  ];
  return grammarKeywords.some((kw) => lower.includes(kw)) ? "Grammar" : "Vocabulary";
}

export function parseQuestions(
  rawText: string,
  defaultMeta: Partial<QuestionImportItem> = {}
): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsedItems: QuestionImportItem[] = [];

  const trimmed = (rawText || "").trim();
  if (!trimmed) {
    return {
      items: [],
      errors: ["حقل إدخال الأسئلة فارغ تماماً. يرجى لصق أو كتابة الأسئلة المطلوب استيرادها."],
      warnings: [],
    };
  }

  // 1. Try Word / Numbered Exam Multi-line format first
  const hasWordPattern = /(?:[A-Da-d][\)\.]\s+|Answer[\s:\-]+|Ans[\s:\-]+|الإجابة[\s:\-]+)/i.test(trimmed);
  const isSingleLineTable = trimmed.includes("|") || trimmed.includes("\t");

  if (hasWordPattern && !isSingleLineTable) {
    // Split by double newline or numbered question pattern
    const blocks = trimmed.split(/\n\s*\n|\n(?=\s*\d+[\.\-\)])/g).map((b) => b.trim()).filter(Boolean);

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      let qText = "";
      const opts: { key: string; text: string }[] = [];
      let rawCorr = "";

      for (const line of lines) {
        const ansMatch = line.match(/^(?:Answer|Ans|Correct|الإجابة|الحل|Correct Answer)[\s:\-]+(.*)$/i);
        const optMatch = line.match(/^([A-Da-d])[\)\.\-:\s]+(.*)$/);
        const qNumMatch = line.match(/^\d+[\.\-\)]\s*(.*)$/);

        if (ansMatch) {
          rawCorr = ansMatch[1].trim();
        } else if (optMatch) {
          opts.push({ key: optMatch[1].toUpperCase(), text: optMatch[2].trim() });
        } else if (!qText) {
          qText = qNumMatch ? qNumMatch[1].trim() : line;
        } else {
          qText += " " + line;
        }
      }

      const flatOpts = opts.map((o) => o.text);
      const corr = resolveCorrectAnswer(rawCorr, flatOpts);

      if (!qText) {
        errors.push(`كتلة السؤال #${i + 1}: لم يتم التعرف على نص السؤال.`);
        continue;
      }

      if (!corr && flatOpts.length === 0) {
        errors.push(`السؤال "${qText.slice(0, 30)}...": لم يتم العثور على إجابة صحيحة أو خيارات.`);
        continue;
      }

      const finalCorr = corr || flatOpts[0] || "";

      parsedItems.push({
        questionText: qText,
        options: flatOpts,
        correctAnswer: finalCorr,
        domainCategory: defaultMeta.domainCategory || inferDomain(qText),
        grammarTopic: defaultMeta.grammarTopic || (inferDomain(qText) === "Grammar" ? "Tense" : null),
        difficulty: defaultMeta.difficulty || "Medium",
        stage: defaultMeta.stage || "Secondary",
        grade: defaultMeta.grade || "Third Secondary (Baccalaureate)",
        curriculum: defaultMeta.curriculum || "Ministry",
        term: defaultMeta.term || "First",
        unit: defaultMeta.unit || "Unit 1",
        lesson: defaultMeta.lesson || "Lesson 1",
        section: defaultMeta.section || null,
        source: defaultMeta.source || "Word Document Import",
        topic: defaultMeta.topic || "General Practice",
        explanation: defaultMeta.explanation || "Imported from Word exam paper",
        points: defaultMeta.points || 10,
      });
    }

    if (parsedItems.length > 0) {
      return { items: parsedItems, errors, warnings };
    }
  }

  // 2. Line-by-line parsing: Pipe (|), Tab (\t), Semicolon (;), or CSV (,)
  const lines = trimmed.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    let parts: string[] = [];

    if (line.includes("|")) {
      parts = line.split("|").map((p) => p.trim());
    } else if (line.includes("\t")) {
      parts = line.split("\t").map((p) => p.trim());
    } else if (line.includes(";")) {
      parts = line.split(";").map((p) => p.trim());
    } else if (line.includes(",")) {
      parts = splitCsvLine(line);
    } else {
      errors.push(`سطر ${idx + 1}: لا يحتوي على فاصل معروف (| أو Tab أو فاصلة منقوطة ; أو فاصلة CSV): "${line.slice(0, 35)}..."`);
      continue;
    }

    if (parts.length < 2) {
      errors.push(`سطر ${idx + 1}: عدد الحقول غير كافٍ (يجب أن يحتوي على سؤال وإجابة على الأقل): "${line.slice(0, 35)}..."`);
      continue;
    }

    let qText = parts[0];
    let opts: string[] = [];
    let rawCorr = "";

    // Clean question number if present e.g. "1. What is..."
    qText = qText.replace(/^\d+[\.\-\)]\s*/, "").trim();

    if (parts.length === 2) {
      // Question | Correct Answer (open / complete)
      rawCorr = parts[1];
      opts = [];
    } else if (parts.length === 3) {
      // Question | Options comma-separated | Correct Answer
      opts = parts[1].split(/[,،]/).map((o) => o.trim()).filter(Boolean);
      rawCorr = parts[2];
    } else {
      // parts.length >= 4:
      // Question | Option1 | Option2 | Option3 [| Option4] | Correct Answer
      rawCorr = parts[parts.length - 1];
      opts = parts.slice(1, parts.length - 1);
    }

    if (!qText) {
      errors.push(`سطر ${idx + 1}: نص السؤال فارغ.`);
      continue;
    }

    const corr = resolveCorrectAnswer(rawCorr, opts);

    if (!corr && opts.length === 0) {
      errors.push(`سطر ${idx + 1}: السؤال "${qText.slice(0, 25)}..." لا يحتوي على إجابة صحيحة.`);
      continue;
    }

    parsedItems.push({
      questionText: qText,
      options: opts,
      correctAnswer: corr || opts[0] || "",
      domainCategory: defaultMeta.domainCategory || inferDomain(qText),
      grammarTopic: defaultMeta.grammarTopic || (inferDomain(qText) === "Grammar" ? "Tense" : null),
      difficulty: defaultMeta.difficulty || "Medium",
      stage: defaultMeta.stage || "Secondary",
      grade: defaultMeta.grade || "Third Secondary (Baccalaureate)",
      curriculum: defaultMeta.curriculum || "Ministry",
      term: defaultMeta.term || "First",
      unit: defaultMeta.unit || "Unit 1",
      lesson: defaultMeta.lesson || "Lesson 1",
      section: defaultMeta.section || null,
      source: defaultMeta.source || "Bulk File Import",
      topic: defaultMeta.topic || "General Practice",
      explanation: defaultMeta.explanation || "Imported question",
      points: defaultMeta.points || 10,
    });
  }

  return { items: parsedItems, errors, warnings };
}
