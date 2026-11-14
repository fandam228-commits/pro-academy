export type GradeCode =
  | "prep_1"
  | "prep_2"
  | "prep_3"
  | "sec_1"
  | "sec_2"
  | "sec_3";

export type TermCode = "first" | "second" | "full_year";

export type TableType =
  | "core"
  | "extra"
  | "synonyms_antonyms"
  | "prepositions_expressions";

export interface CoreVocabularyItem {
  id: string;
  word: string;
  pos: string; // 'n', 'v', 'adj', 'adv', 'phr'
  meaningAr: string;
  definitionEn?: string;
  exampleEn?: string;
  gradeCode: GradeCode;
  gradeLabelEn: string;
  gradeLabelAr: string;
  term: TermCode;
  unitNumber: number;
  unitTitleEn: string;
  unitTitleAr: string;
  lessonNumber?: string;
  sourceFile: string;
  sourcePage: number;
  isCore: true;
}

export interface ExtraVocabularyItem {
  id: string;
  word: string;
  pos: string;
  meaningAr: string;
  definitionEn?: string;
  exampleEn?: string;
  gradeCode: GradeCode;
  gradeLabelEn: string;
  gradeLabelAr: string;
  term: TermCode;
  unitNumber: number;
  unitTitleEn: string;
  unitTitleAr: string;
  sourceBook: string;
  sourcePage: number;
  isCore: false;
}

export interface SynonymAntonymItem {
  id: string;
  mainWord: string;
  meaningAr: string;
  synonyms: string[];
  antonyms: string[];
  relatedWords?: string[];
  exampleEn?: string;
  gradeCode: GradeCode;
  term: TermCode;
  unitNumber: number;
  unitTitleEn: string;
  sourceFile: string;
  sourcePage: number;
}

export type ExpressionType =
  | "Verb + Preposition"
  | "Adjective + Preposition"
  | "Noun + Preposition"
  | "Phrasal Verb"
  | "Collocation"
  | "Fixed Expression"
  | "Idiom"
  | "Word Pattern";

export interface PrepositionExpressionItem {
  id: string;
  expression: string;
  expressionType: ExpressionType;
  meaningAr: string;
  exampleEn?: string;
  gradeCode: GradeCode;
  term: TermCode;
  unitNumber: number;
  unitTitleEn: string;
  lessonNumber?: string;
  sourceBook: string;
  sourcePage: number;
}

export interface VocabularyBankMetadata {
  totalCore: number;
  totalExtra: number;
  totalSynonymsAntonyms: number;
  totalExpressions: number;
  lastUpdated: string;
}
