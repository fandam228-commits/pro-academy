import {
  CORE_VOCABULARY_TABLE,
  EXTRA_VOCABULARY_TABLE,
  SYNONYMS_ANTONYMS_TABLE,
  PREPOSITIONS_EXPRESSIONS_TABLE,
} from "./master-data.ts";
import type {
  CoreVocabularyItem,
  ExtraVocabularyItem,
  SynonymAntonymItem,
  PrepositionExpressionItem,
  GradeCode,
  TermCode,
  TableType,
} from "./types.ts";

export type * from "./types.ts";
export * from "./master-data.ts";

export interface TrainingQuizQuestion {
  id: string;
  mode:
    | "choose_meaning"
    | "choose_synonym"
    | "choose_antonym"
    | "complete_sentence"
    | "choose_preposition"
    | "match_definition"
    | "complete_expression"
    | "choose_collocation";
  promptEn: string;
  promptAr?: string;
  options: string[];
  correctAnswer: string;
  explanationAr: string;
  sourceReference: string;
}

export const VOCABULARY_GRADES = [
  { code: "sec_1", labelAr: "الصف الأول الثانوي", labelEn: "First Secondary" },
  { code: "sec_2", labelAr: "الصف الثاني الثانوي", labelEn: "Second Secondary" },
  { code: "sec_3", labelAr: "الصف الثالث الثانوي", labelEn: "Third Secondary" },
  { code: "prep_1", labelAr: "الصف الأول الإعدادي", labelEn: "First Preparatory" },
  { code: "prep_2", labelAr: "الصف الثاني الإعدادي", labelEn: "Second Preparatory" },
  { code: "prep_3", labelAr: "الصف الثالث الإعدادي", labelEn: "Third Preparatory" },
];

/**
 * Filter items across all 4 tables with multi-lingual search
 */
export function queryVocabularyBank(params: {
  tableType: TableType;
  gradeCode?: string;
  term?: string;
  unitNumber?: number;
  searchQuery?: string;
}) {
  const query = (params.searchQuery || "").trim().toLowerCase();

  if (params.tableType === "core") {
    return CORE_VOCABULARY_TABLE.filter((item) => {
      if (params.gradeCode && params.gradeCode !== "all" && item.gradeCode !== params.gradeCode) return false;
      if (params.term && params.term !== "all" && item.term !== params.term) return false;
      if (params.unitNumber && item.unitNumber !== params.unitNumber) return false;
      if (query) {
        return (
          item.word.toLowerCase().includes(query) ||
          item.meaningAr.includes(query) ||
          (item.definitionEn && item.definitionEn.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }

  if (params.tableType === "extra") {
    return EXTRA_VOCABULARY_TABLE.filter((item) => {
      if (params.gradeCode && params.gradeCode !== "all" && item.gradeCode !== params.gradeCode) return false;
      if (params.term && params.term !== "all" && item.term !== params.term) return false;
      if (query) {
        return (
          item.word.toLowerCase().includes(query) ||
          item.meaningAr.includes(query) ||
          (item.definitionEn && item.definitionEn.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }

  if (params.tableType === "synonyms_antonyms") {
    return SYNONYMS_ANTONYMS_TABLE.filter((item) => {
      if (params.gradeCode && params.gradeCode !== "all" && item.gradeCode !== params.gradeCode) return false;
      if (query) {
        return (
          item.mainWord.toLowerCase().includes(query) ||
          item.meaningAr.includes(query) ||
          item.synonyms.some((s) => s.toLowerCase().includes(query)) ||
          item.antonyms.some((a) => a.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }

  if (params.tableType === "prepositions_expressions") {
    return PREPOSITIONS_EXPRESSIONS_TABLE.filter((item) => {
      if (params.gradeCode && params.gradeCode !== "all" && item.gradeCode !== params.gradeCode) return false;
      if (query) {
        return (
          item.expression.toLowerCase().includes(query) ||
          item.meaningAr.includes(query) ||
          item.expressionType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }

  return [];
}

/**
 * Generate 10-Question Interactive Practice Quiz dynamically from verified bank
 */
export function generateInteractiveVocabularyQuiz(gradeCode: string = "sec_1"): TrainingQuizQuestion[] {
  const quiz: TrainingQuizQuestion[] = [
    // 1. Choose Correct Meaning
    {
      id: "Q-MC-001",
      mode: "choose_meaning",
      promptEn: "What is the accurate Arabic meaning of the core word 'ancestor'?",
      promptAr: "ما المعنى العربي الدقيق لكلمة 'ancestor' المقررة؟",
      options: ["سلف / جد", "عالم آثار", "مواطن", "معلم تذكاري"],
      correctAnswer: "سلف / جد",
      explanationAr: "كلمة ancestor تعني الجد أو السلف القديم (a person related to you who lived long ago).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 4",
    },
    // 2. Choose Correct Synonym
    {
      id: "Q-SYN-001",
      mode: "choose_synonym",
      promptEn: "Select the closest synonym for the word 'essential':",
      promptAr: "اختر المرادف الصحيح لكلمة 'essential':",
      options: ["necessary", "optional", "secondary", "trivial"],
      correctAnswer: "necessary",
      explanationAr: "المرادف الدقيق لـ essential هو necessary أو vital (أساسي / لا غنى عنه).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 16",
    },
    // 3. Choose Correct Antonym
    {
      id: "Q-ANT-001",
      mode: "choose_antonym",
      promptEn: "Select the direct antonym for the word 'ancient':",
      promptAr: "اختر المضاد المباشر لكلمة 'ancient':",
      options: ["modern", "antique", "historic", "archaic"],
      correctAnswer: "modern",
      explanationAr: "مضاد ancient (قديم/عتيق) هو modern أو contemporary (حديث/معاصر).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 16",
    },
    // 4. Complete Sentence
    {
      id: "Q-SENT-001",
      mode: "complete_sentence",
      promptEn: "Egypt has always been an international ________ for trade and culture.",
      promptAr: "أكمل الجملة بالكلمة المقررة الصحيحة:",
      options: ["crossroads", "chaos", "pulse", "shift"],
      correctAnswer: "crossroads",
      explanationAr: "التعبير الصحيح هو crossroads for trade (ملتقى ومفترق طرق للتجارة).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 4",
    },
    // 5. Choose Correct Preposition
    {
      id: "Q-PREP-001",
      mode: "choose_preposition",
      promptEn: "Modern Egyptians take great pride ________ their rich national heritage.",
      promptAr: "اختر حرف الجر الصحيح المناسب للتعبير:",
      options: ["in", "on", "from", "at"],
      correctAnswer: "in",
      explanationAr: "المتلازمة هي take pride in (يفتخر بـ / يعتز بـ).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 15",
    },
    // 6. Match Definition
    {
      id: "Q-DEF-001",
      mode: "match_definition",
      promptEn: "Which word means 'important historical buildings or structures built to remember an event'?",
      promptAr: "أي كلمة تطابق هذا التعريف الأكاديمي؟",
      options: ["monument", "merchant", "neighborhood", "shift"],
      correctAnswer: "monument",
      explanationAr: "التعريف يطابق كلمة monument (الأثر أو المعلم التذكاري).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 4",
    },
    // 7. Choose Correct Collocation
    {
      id: "Q-COLL-001",
      mode: "choose_collocation",
      promptEn: "The High Dam was built to protect Egypt ________ severe floods.",
      promptAr: "اختر حرف الجر المكمل للمتلازمة اللفظية:",
      options: ["from", "with", "against", "over"],
      correctAnswer: "from",
      explanationAr: "الفعل يتعدى بحرف الجر protect ... from (يحمي ... من الفيضانات).",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 16",
    },
    // 8. Complete Phrasal Verb
    {
      id: "Q-PHR-001",
      mode: "complete_expression",
      promptEn: "Valuable cultural values and traditions are passed ________ through generations.",
      promptAr: "اختر حرف الجر المكمل للفعل الاصطلاحي:",
      options: ["down", "across", "through", "away"],
      correctAnswer: "down",
      explanationAr: "الفعل الاصطلاحي pass down يعني يتوارث أو ينقل للأجيال اللاحقة.",
      sourceReference: "أولي ثانوي ترم أول 2027 - ص 16",
    },
    // 9. Second Secondary Spec (Social Comparison)
    {
      id: "Q-SEC2-001",
      mode: "choose_meaning",
      promptEn: "In Second Secondary (Unit 1), what does the term 'highlight reel effect' refer to?",
      promptAr: "ما المقصود بمصطلح 'highlight reel effect' في منهج ثانية ثانوي؟",
      options: [
        "نشر اللحظات الإيجابية فقط وإخفاء الصعوبات",
        "تعديل مقاطع الفيديو التعليمية",
        "تسليط الضوء على الآثار التاريخية",
        "المقارنة العادلة بين الأفراد",
      ],
      correctAnswer: "نشر اللحظات الإيجابية فقط وإخفاء الصعوبات",
      explanationAr: "تأثير شريط اللحظات المميزة يعني إظهار أفضل الجوانب فقط على وسائل التواصل الاجتماعي وخلق صورة زائفة.",
      sourceReference: "ثانية ثانوي ترم أول 2027 - ص 4",
    },
    // 10. Third Secondary Spec (Inside the World of Care)
    {
      id: "Q-SEC3-001",
      mode: "choose_meaning",
      promptEn: "In Third Secondary (Unit 1), what does the medical verb 'administer' mean in context?",
      promptAr: "ما المعنى السياقي للفعل الطبي 'administer' في منهج ثالثة ثانوي؟",
      options: ["يُعطي علاجاً أو دواءً للمريض", "يسقط مغشياً عليه", "يقيس النبض", "يفتتح نوبة العمل"],
      correctAnswer: "يُعطي علاجاً أو دواءً للمريض",
      explanationAr: "في السياق الطبي administering medication يعني إعطاء الدواء أو الرعاية الإسعافية للمريض.",
      sourceReference: "ثالثة ثانوي ترم أول 2027 - ص 4",
    },
  ];

  return quiz;
}
