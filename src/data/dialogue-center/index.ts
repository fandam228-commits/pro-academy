import prep1Dialogues from './prep1-dialogues.json';
import prep2Dialogues from './prep2-dialogues.json';
import prep3Dialogues from './prep3-dialogues.json';
import prep3RevisionDialogues from './prep3-revision-dialogues.json';
import prep3RevisionStrategy from './prep3-revision-strategy.json';

export type DialogueGrade = 'prep_1' | 'prep_2' | 'prep_3' | 'prep_3_revision';

export interface DialogueGapAnswer {
  primary: string;
  alternatives: string[];
  isTeacherApproved: boolean;
  notes?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  gapNumber?: number | null; // 1, 2, 3, 4, 5
  isQuestion?: boolean;
  cue?: string;
}

export interface DialogueItem {
  id: string;
  grade: DialogueGrade;
  gradeLabelAr: string;
  gradeLabelEn: string;
  dialogueNumber: number;
  title: string;
  governorate?: string | null;
  governorateAr?: string | null;
  year?: number | null;
  speakers: string[];
  lines: DialogueLine[];
  approvedAnswers: Record<string, DialogueGapAnswer>;
  published?: boolean;
}

export interface RevisionStrategyRule {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  explanationAr: string;
  examples: Array<{
    question: string;
    answer: string;
    noteAr?: string;
  }>;
}

export interface AuxiliaryVerbCategory {
  category: string;
  verbs: string[];
  ruleAr: string;
}

export interface CommonPhrase {
  situationAr: string;
  english: string;
  reply: string;
}

export interface DialogueRevisionStrategy {
  titleAr: string;
  titleEn: string;
  author: string;
  examSpecs: {
    totalExamMarks: number;
    dialogueQuestion: string;
    dialogueMarks: number;
    gapsCount: number;
    gapRequirement: string;
  };
  goldenRules: Array<{
    step: number;
    ruleAr: string;
    ruleEn: string;
  }>;
  questionTypes: {
    closedQuestions: {
      nameAr: string;
      characteristicsAr: string[];
      auxiliaryVerbs: {
        verbToBe: string[];
        verbToDo: string[];
        verbToHave: string[];
        modalVerbs: string[];
      };
      formationSteps: string[];
      formationExamples: Array<{ statement: string; question: string }>;
      pronounTable: Array<{ question: string; answer: string }>;
      pronounExample?: { statement: string; question: string };
    };
    openQuestions: {
      nameAr: string;
      characteristicsAr: string[];
      formula: string;
      formulaExample?: Record<string, string>;
      formationSteps: string[];
      formationExamples: Array<{ statement: string; question: string }>;
      primaryWhWords: Array<{ word: string; meaningAr: string; exampleQ?: string; exampleA?: string }>;
      derivedHowWords?: Array<{ word: string; meaningAr: string; exampleQ?: string; exampleA?: string }>;
      commonDialogueQuestions?: Array<{ en: string; ar: string }>;
    };
  };
  [key: string]: any;
}

export const ALL_DIALOGUES: DialogueItem[] = [
  ...(prep1Dialogues as DialogueItem[]),
  ...(prep2Dialogues as DialogueItem[]),
  ...(prep3Dialogues as DialogueItem[]),
  ...(prep3RevisionDialogues as DialogueItem[]),
];

export function getAllDialogues(): DialogueItem[] {
  return ALL_DIALOGUES;
}

export function getDialoguesByGrade(grade: DialogueGrade): DialogueItem[] {
  return ALL_DIALOGUES.filter((d) => d.grade === grade);
}

export function getDialogueById(id: string): DialogueItem | undefined {
  return ALL_DIALOGUES.find((d) => d.id === id);
}

export function getRevisionStrategy(): DialogueRevisionStrategy {
  return prep3RevisionStrategy as unknown as DialogueRevisionStrategy;
}

export function generateRandomExam(grade: DialogueGrade): DialogueItem {
  const list = getDialoguesByGrade(grade);
  if (!list.length) {
    return ALL_DIALOGUES[0];
  }
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

export function evaluateStudentAnswer(
  studentInput: string,
  approvedAnswer: DialogueGapAnswer
): {
  isCorrect: boolean;
  score: number; // 0 or 1
  matchedWith?: string;
  feedbackAr: string;
} {
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .replace(/\s+/g, ' ');

  const cleanedStudent = normalize(studentInput);
  if (!cleanedStudent) {
    return {
      isCorrect: false,
      score: 0,
      feedbackAr: 'لم يتم إدخال إجابة',
    };
  }

  const primaryClean = normalize(approvedAnswer.primary);
  if (cleanedStudent === primaryClean) {
    return {
      isCorrect: true,
      score: 1,
      matchedWith: approvedAnswer.primary,
      feedbackAr: 'إجابة نموذجية ممتازة!',
    };
  }

  // Check approved alternatives
  for (const alt of approvedAnswer.alternatives) {
    if (cleanedStudent === normalize(alt)) {
      return {
        isCorrect: true,
        score: 1,
        matchedWith: alt,
        feedbackAr: 'إجابة صحيحة ومقبولة وزارياً!',
      };
    }
  }

  // Soft fuzzy keyword match if at least 75% of key tokens match
  const studentTokens = cleanedStudent.split(' ');
  const primaryTokens = primaryClean.split(' ');
  if (primaryTokens.length >= 3 && studentTokens.length >= 2) {
    const matchedCount = primaryTokens.filter((t) => studentTokens.includes(t)).length;
    const ratio = matchedCount / primaryTokens.length;
    if (ratio >= 0.75) {
      return {
        isCorrect: true,
        score: 1,
        matchedWith: approvedAnswer.primary,
        feedbackAr: 'إجابة صحيحة وصياغة جيدة!',
      };
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedbackAr: 'إجابة غير دقيقة، راجع الإجابة النموذجية المعتمدة.',
  };
}
