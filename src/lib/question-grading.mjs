/**
 * Safe Question Grading & Answer Evaluation Utilities
 * Handles missing/null/empty correct answers securely without throwing Runtime TypeError.
 */

export function normalizedAnswerSet(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x).trim().toLowerCase()).filter(Boolean).sort();
  } catch {
    return [];
  }
}

export function answersMatch(question, studentAnswer) {
  if (!question || question.correctAnswer == null) {
    return false;
  }
  const cleanCorrect = String(question.correctAnswer).trim();
  if (!cleanCorrect) {
    return false;
  }
  const cleanStudent = typeof studentAnswer === "string" ? studentAnswer.trim() : String(studentAnswer || "").trim();
  if (!cleanStudent) {
    return false;
  }
  if (question.questionType === "multi_select") {
    const expected = normalizedAnswerSet(cleanCorrect);
    const actual = normalizedAnswerSet(cleanStudent);
    return expected.length > 0 && expected.length === actual.length && expected.every((x, i) => x === actual[i]);
  }
  if (cleanStudent.toLowerCase() === cleanCorrect.toLowerCase()) {
    return true;
  }

  // Cross-match letter (A/B/C/D) against option text
  const LABELS = ["A", "B", "C", "D"];
  if (Array.isArray(question.options) && question.options.length >= 2) {
    const studentUpper = cleanStudent.toUpperCase();
    const correctUpper = cleanCorrect.toUpperCase();

    // Case 1: Student answered with letter, correctAnswer is text
    if (LABELS.includes(studentUpper)) {
      const idx = LABELS.indexOf(studentUpper);
      const chosenOpt = question.options[idx];
      if (chosenOpt) {
        const text = typeof chosenOpt === "object" ? chosenOpt.text : chosenOpt;
        if (String(text).trim().toLowerCase() === cleanCorrect.toLowerCase()) {
          return true;
        }
      }
    }

    // Case 2: Student answered with text, correctAnswer is letter
    if (LABELS.includes(correctUpper)) {
      const idx = LABELS.indexOf(correctUpper);
      const correctOpt = question.options[idx];
      if (correctOpt) {
        const text = typeof correctOpt === "object" ? correctOpt.text : correctOpt;
        if (String(text).trim().toLowerCase() === cleanStudent.toLowerCase()) {
          return true;
        }
      }
    }
  }

  return false;
}

export function isOptionCorrect(opt, correctAnswer, questionType) {
  if (!correctAnswer || opt == null) return false;
  const cleanOpt = String(opt).trim().toLowerCase();
  const cleanCorrect = String(correctAnswer).trim().toLowerCase();
  if (!cleanOpt || !cleanCorrect) return false;

  if (questionType === "multi_select") {
    try {
      const parsed = JSON.parse(correctAnswer);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim().toLowerCase()).includes(cleanOpt);
      }
    } catch {}
  }

  return cleanOpt === cleanCorrect;
}
