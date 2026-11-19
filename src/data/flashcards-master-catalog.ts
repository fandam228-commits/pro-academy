/**
 * Unified Flashcards Master Catalog
 * Professional Academy — Mr. Habib El Rahman
 *
 * Bridges the Core Vocabulary Bank, Synonyms & Antonyms, Prepositions,
 * and Thanaweya Amma Vocabulary into standardized flashcards.
 */

import {
  CORE_VOCABULARY_TABLE,
  SYNONYMS_ANTONYMS_TABLE,
  PREPOSITIONS_EXPRESSIONS_TABLE,
} from "./vocabulary-master-bank/master-data.ts";
import { SEED_VOCAB_CARDS } from "./pro-suite-seeds.ts";

export interface UnifiedFlashcard {
  id: string;
  word: string;
  gradeLevel: "sec_1" | "sec_2" | "sec_3" | "prep_3" | "all";
  gradeLabelAr: string;
  unitName: string;
  partOfSpeech: string;
  meaningAr: string;
  definitionEn: string;
  exampleEn: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  category: "core" | "synonyms" | "prepositions";
}

// 1. Build cards from Core Vocabulary Table
const coreCards: UnifiedFlashcard[] = CORE_VOCABULARY_TABLE.map((item) => ({
  id: `fc_${item.id.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`,
  word: item.word,
  gradeLevel: (item.gradeCode as any) || "sec_1",
  gradeLabelAr: item.gradeLabelAr || "الصف الأول الثانوي",
  unitName: `Unit ${item.unitNumber}: ${item.unitTitleEn}`,
  partOfSpeech: item.pos === "n" ? "Noun (اسم)" : item.pos === "v" ? "Verb (فعل)" : item.pos === "adj" ? "Adjective (صفة)" : "Adverb (ظرف)",
  meaningAr: item.meaningAr,
  definitionEn: item.definitionEn || "",
  exampleEn: item.exampleEn || "",
  synonyms: [],
  antonyms: [],
  collocations: [],
  category: "core",
}));

// 2. Build cards from Synonyms & Antonyms Table
const synonymCards: UnifiedFlashcard[] = SYNONYMS_ANTONYMS_TABLE.map((item) => ({
  id: `fc_${item.id.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`,
  word: item.mainWord,
  gradeLevel: (item.gradeCode as any) || "sec_1",
  gradeLabelAr: item.gradeCode === "sec_1" ? "الصف الأول الثانوي" : item.gradeCode === "sec_2" ? "الصف الثاني الثانوي" : "الصف الثالث الثانوي",
  unitName: `Unit ${item.unitNumber}`,
  partOfSpeech: "Synonyms & Antonyms (مترادفات ومتضادات)",
  meaningAr: item.meaningAr,
  definitionEn: `Key ministerial synonyms and antonyms pair`,
  exampleEn: `Synonyms: ${item.synonyms.join(", ")} | Antonyms: ${item.antonyms.join(", ")}`,
  synonyms: item.synonyms,
  antonyms: item.antonyms,
  collocations: [],
  category: "synonyms",
}));

// 3. Build cards from Prepositions & Collocations Table
const prepCards: UnifiedFlashcard[] = PREPOSITIONS_EXPRESSIONS_TABLE.map((item) => ({
  id: `fc_${item.id.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`,
  word: item.expression,
  gradeLevel: (item.gradeCode as any) || "sec_1",
  gradeLabelAr: item.gradeCode === "sec_1" ? "الصف الأول الثانوي" : item.gradeCode === "sec_2" ? "الصف الثاني الثانوي" : "الصف الثالث الثانوي",
  unitName: `Unit ${item.unitNumber}`,
  partOfSpeech: item.expressionType || "Expression / Preposition (تعبير / حرف جر)",
  meaningAr: item.meaningAr,
  definitionEn: "Collocation & Idiomatic Usage",
  exampleEn: item.exampleEn || "",
  synonyms: [],
  antonyms: [],
  collocations: [item.expression],
  category: "prepositions",
}));

// 4. Build cards from Seed Vocab Cards (3rd Secondary)
const seedCards: UnifiedFlashcard[] = SEED_VOCAB_CARDS.map((item) => ({
  id: `fc_seed_${item.id.replace(/[^a-z0-9_-]/g, "_")}`,
  word: item.word,
  gradeLevel: "sec_3",
  gradeLabelAr: "الصف الثالث الثانوي",
  unitName: item.unitName,
  partOfSpeech: item.partOfSpeech === "noun" ? "Noun (اسم)" : item.partOfSpeech === "verb" ? "Verb (فعل)" : "Adjective (صفة)",
  meaningAr: item.meaningAr,
  definitionEn: "",
  exampleEn: item.exampleEn,
  synonyms: item.synonyms,
  antonyms: [],
  collocations: [],
  category: "core",
}));

export const MASTER_FLASHCARDS_CATALOG: UnifiedFlashcard[] = [
  ...coreCards,
  ...seedCards,
  ...synonymCards,
  ...prepCards,
];
