import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { rebalanceQuestionSet } from "../src/lib/mcq-balancer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const elmoasserPath = path.resolve(__dirname, "../src/data/secondary-2027/sec2-bac-elmoasser-mcq-extracted.json");
const amaliqaPath = path.resolve(__dirname, "../src/data/secondary-2027/sec2-bac-amaliqa-mcq-extracted.json");
const moasserIndexPath = path.resolve(__dirname, "../src/data/moasser-revision-index.ts");
const amaliqaIndexPath = path.resolve(__dirname, "../src/data/amaliqa-revision-index.ts");

const elmoasser = JSON.parse(fs.readFileSync(elmoasserPath, "utf8"));
const amaliqa = JSON.parse(fs.readFileSync(amaliqaPath, "utf8"));

// 1. Rebalance 25 for El-Moasser Sec 2 Baccalaureate
const elmSample = elmoasser.slice(0, 25).map((q) => ({
  id: q.id,
  type: "mcq",
  category: q.domainCategory || "Vocabulary",
  question: q.questionText,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanationAr: q.explanation || "الإجابة النموذجية طبقاً لمنهج البكالوريا 2027 (كتاب المعاصر).",
  ruleReference: `${q.unit || "Unit 1"}: ${q.lesson || "Living Well in a Complex World"}`,
}));
const { rebalancedQuestions: elmRebalanced, stats: elmStats } = rebalanceQuestionSet(elmSample, {
  seed: 2027,
  shuffleDistractors: true,
  maxStreak: 2,
});
console.log("El-Moasser Exam Stats:", elmStats.distributionAfter, "maxStreak:", elmStats.maxStreakAfter);

// 2. Rebalance 25 for El-Amaliqa Sec 2 Baccalaureate
const amlSample = amaliqa.slice(0, 25).map((q) => ({
  id: q.id,
  type: "mcq",
  category: q.domainCategory || "Vocabulary",
  question: q.questionText,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanationAr: q.explanation || "الإجابة النموذجية طبقاً لمنهج البكالوريا 2027 (سلسلة العمالقة).",
  ruleReference: `${q.unit || "Unit 1"}: ${q.lesson || "Contextual Vocabulary & Concepts"}`,
}));
const { rebalancedQuestions: amlRebalanced, stats: amlStats } = rebalanceQuestionSet(amlSample, {
  seed: 2027,
  shuffleDistractors: true,
  maxStreak: 2,
});
console.log("El-Amaliqa Exam Stats:", amlStats.distributionAfter, "maxStreak:", amlStats.maxStreakAfter);

// 3. Update moasser-revision-index.ts if moasser_sec2_bac_exam1 not present
let moasserCode = fs.readFileSync(moasserIndexPath, "utf8");
if (!moasserCode.includes("moasser_sec2_bac_exam1:")) {
  const moasserExamObj = {
    id: "moasser_sec2_bac_exam1",
    title: "النموذج الاسترشادي التفاعلي — الصف الثاني الثانوي (البكالوريا المصرية 2027)",
    grade: "الصف الثاني الثانوي (البكالوريا 2027)",
    stage: "المرحلة الثانوية",
    term: "الفصل الدراسي الأول",
    durationMinutes: 45,
    totalMarks: 25,
    passingMarks: 15,
    questions: elmRebalanced,
  };

  const lastBraceIdx = moasserCode.lastIndexOf("};");
  if (lastBraceIdx !== -1) {
    const formatted = `  moasser_sec2_bac_exam1: ${JSON.stringify(moasserExamObj, null, 2)},\n};\n`;
    moasserCode = moasserCode.slice(0, lastBraceIdx) + formatted;
    fs.writeFileSync(moasserIndexPath, moasserCode, "utf8");
    console.log("Added moasser_sec2_bac_exam1 to moasser-revision-index.ts");
  }
}

// 4. Create amaliqa-revision-index.ts
const amaliqaIndexContent = `/**
 * El-Amaliqa (سلسلة العمالقة) Official Revision & Interactive Model Exams (2026/2027)
 * In cooperation with Giants Books Series.
 * Conforming to the latest Egyptian Baccalaureate & Secondary Specifications 2027.
 */

import type { MoasserSection, MoasserExam } from "./moasser-revision-index.ts";

export const AMALIQA_SECTIONS: MoasserSection[] = [
  {
    id: "general",
    name: "طلاب البكالوريا والتعليم العام (سلسلة العمالقة 2027)",
    en: "Egyptian Baccalaureate & General — Giants Series 2027",
    badge: "سلسلة العمالقة الرسمية 2027",
    stages: [
      {
        id: "secondary",
        name: "المرحلة الثانوية والبكالوريا",
        grades: [
          {
            id: "amaliqa_sec1_general",
            name: "الصف الأول الثانوي (سلسلة العمالقة)",
            en: "1st Secondary — El-Amaliqa New Hello",
            stage: "secondary",
            curriculum: "New Hello 2027",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [
              {
                label: "كتاب العمالقة - الصف الأول الثانوي الترم الأول 2027",
                url: "/?tab=question_bank&grade=First+Secondary",
                type: "revision",
              },
            ],
          },
          {
            id: "amaliqa_sec2_bac",
            name: "الصف الثاني الثانوي (البكالوريا المصرية 2027)",
            en: "Second Year Baccalaureate (Sec 2) — Giants Series",
            stage: "secondary",
            curriculum: "Egyptian Baccalaureate 2027",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "amaliqa_sec2_bac_exam1",
            totalQuestions: 25,
            durationMinutes: 45,
            links: [
              {
                label: "كتاب العمالقة - الجزء الأول: Living Well in a Complex World",
                url: "/?tab=question_bank&grade=Second+Secondary&search=Unit+1",
                type: "revision",
              },
              {
                label: "كتاب العمالقة - الجزء الثاني: Leisure Time & Experiences",
                url: "/?tab=question_bank&grade=Second+Secondary&search=Unit+2",
                type: "revision",
              },
              {
                label: "كتاب العمالقة - الجزء الثالث: Echoes of the Past & Advanced Structures",
                url: "/?tab=question_bank&grade=Second+Secondary&search=Unit+3",
                type: "revision",
              },
              {
                label: "بنك أسئلة وتدريبات العمالقة التفاعلية (111 سؤال أصلي)",
                url: "/?tab=question_bank&grade=Second+Secondary&source=العمالقة",
                type: "model_exams",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const AMALIQA_INTERACTIVE_EXAMS: Record<string, MoasserExam> = {
  amaliqa_sec2_bac_exam1: ${JSON.stringify(
    {
      id: "amaliqa_sec2_bac_exam1",
      title: "النموذج الاسترشادي التفاعلي لسلسلة العمالقة — الصف الثاني الثانوي (البكالوريا المصرية 2027)",
      grade: "الصف الثاني الثانوي (البكالوريا 2027)",
      stage: "المرحلة الثانوية والبكالوريا",
      term: "الفصل الدراسي الأول",
      durationMinutes: 45,
      totalMarks: 25,
      passingMarks: 15,
      questions: amlRebalanced,
    },
    null,
    2
  )},
};
`;

fs.writeFileSync(amaliqaIndexPath, amaliqaIndexContent, "utf8");
console.log("Successfully generated src/data/amaliqa-revision-index.ts!");
