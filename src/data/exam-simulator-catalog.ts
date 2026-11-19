/**
 * Official Ministry Exam Simulator Catalog (2026/2027)
 * Professional Academy — Mr. Habib El Rahman
 *
 * Full-length timed simulation exams with exact ministerial specifications,
 * marks distribution, reading comprehension passages, literature, and essay prompts.
 */

import { SEED_MOCK_EXAM } from "./pro-suite-seeds.ts";

export interface MockExamDefinition {
  id: string;
  title: string;
  stage: "Secondary" | "Preparatory";
  gradeLevel: "3rd_sec" | "2nd_sec" | "1st_sec" | "3rd_prep";
  gradeLabelAr: string;
  term: "first" | "second";
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  sections: {
    mcq: Array<{
      id: string;
      number: number;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      points: number;
      domain?: string;
    }>;
    passage?: {
      title: string;
      content?: string;
      text?: string;
      questions: Array<{
        id: string;
        number: number;
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        points: number;
      }>;
    };
    translation?: Array<{
      id: string;
      number: number;
      direction: "en_to_ar" | "ar_to_en";
      sourceText: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }>;
    novel?: Array<{
      id: string;
      number: number;
      questionEn: string;
      questionAr?: string;
      modelAnswer?: string;
      modelAnswerEn?: string;
      explanationAr?: string;
      points: number;
    }>;
    essay?: {
      id?: string;
      promptEn: string;
      promptAr: string;
      minWords: number;
      points?: number;
      maxScore?: number;
      rubricHint?: string;
      rubricPoints?: string[];
    };
  };
}

// 1. THIRD SECONDARY (Thanawya Amma — 50 Marks — 180 Minutes)
export const EXAM_SEC3_MINISTRY: MockExamDefinition = {
  ...SEED_MOCK_EXAM,
  id: "mock_sec3_national_1",
  stage: "Secondary",
  gradeLevel: "3rd_sec",
  gradeLabelAr: "الصف الثالث الثانوي (الشهادة الثانوية العامة)",
  term: "first",
  totalMarks: 50,
  durationMinutes: 180,
  isPublished: true,
};

// 2. FIRST SECONDARY (New Hello — 40 Marks — 120 Minutes)
export const EXAM_SEC1_MINISTRY: MockExamDefinition = {
  id: "mock_sec1_national_1",
  title: "نموذج امتحان الصف الأول الثانوي الشامل وفق المواصفات الوزارية 2026/2027",
  stage: "Secondary",
  gradeLevel: "1st_sec",
  gradeLabelAr: "الصف الأول الثانوي (ترم أول)",
  term: "first",
  durationMinutes: 120,
  totalMarks: 40,
  isPublished: true,
  sections: {
    mcq: [
      {
        id: "sec1_mcq_1",
        number: 1,
        question: "Ancient Egyptian monuments are famous for their __________; they have stood strong for thousands of years.",
        options: ["durability", "fragility", "omission", "temporary"],
        correctAnswer: "durability",
        explanation: "durability تعني متانة وقوة التحمل وهو ما يميز الآثار المصرية القديمة.",
        points: 1,
        domain: "Vocabulary",
      },
      {
        id: "sec1_mcq_2",
        number: 2,
        question: "While the archaeologists __________ near Luxor, they discovered a hidden chamber.",
        options: ["were excavating", "excavated", "had excavated", "have excavated"],
        correctAnswer: "were excavating",
        explanation: "قاعدة While يتبعها ماضي مستمر (were excavating) للحدث الطويل الذي قطعه حدث آخر.",
        points: 1,
        domain: "Grammar",
      },
      {
        id: "sec1_mcq_3",
        number: 3,
        question: "Ecotourism is designed to support the local __________ and protect natural wildlife.",
        options: ["community", "pollution", "hazard", "threat"],
        correctAnswer: "community",
        explanation: "المجتمع المحلي (local community) هو المستفيد الأساسي من السياحة البيئية.",
        points: 1,
        domain: "Vocabulary",
      },
      {
        id: "sec1_mcq_4",
        number: 4,
        question: "I haven't visited my grandparents' village __________ last year's summer vacation.",
        options: ["since", "for", "ago", "yet"],
        correctAnswer: "since",
        explanation: "since يأتي بعدها نقطة زمنية محددة في الماضي (last year's summer vacation).",
        points: 1,
        domain: "Grammar",
      },
      {
        id: "sec1_mcq_5",
        number: 5,
        question: "Which of the following is punctuated correctly?",
        options: [
          "Although ancient Egypt was powerful, its people respected nature.",
          "Although ancient Egypt was powerful its people respected nature.",
          "Although, ancient Egypt was powerful its people respected nature.",
          "Although ancient Egypt was powerful; its people respected nature",
        ],
        correctAnswer: "Although ancient Egypt was powerful, its people respected nature.",
        explanation: "عندما تبدأ الجملة برابط تناقض تبعي (Although)، يجب وضع فاصلة (comma) بعد شبه الجملة التابعة.",
        points: 1,
        domain: "Writing Skills",
      },
    ],
    passage: {
      title: "Sustainable Architecture in Ancient & Modern Egypt",
      content:
        "Long before the advent of modern environmental science, ancient Egyptian master builders incorporated principles of sustainable design into their architectural marvels. Thick mud-brick walls absorbed the scorching desert heat during the daytime and radiated stored warmth throughout cool desert nights, achieving natural thermal regulation without mechanical expenditure. Furthermore, building alignments utilized the prevailing northward breeze to cool residential palaces and granaries.\n\nToday, modern Egyptian engineers in the New Administrative Capital and New Alamein City are revitalizing these time-tested heritage techniques alongside cutting-edge solar panels and smart water recycling systems. By fusing sustainable heritage with state-of-the-art green technologies, Egypt is actively shaping an eco-friendly architectural renaissance for future generations.",
      questions: [
        {
          id: "sec1_pass_1",
          number: 6,
          question: "The primary purpose of using thick mud-brick walls in ancient Egyptian construction was to __________.",
          options: [
            "regulate indoor temperatures naturally across day and night",
            "prevent enemies from climbing the outer fortifications",
            "store grain reserves during heavy river flooding",
            "provide extra space for decorative hieroglyphic reliefs",
          ],
          correctAnswer: "regulate indoor temperatures naturally across day and night",
          explanation: "ذكرت القطعة بوضوح أن الجدران الطينية السميكة تمتص حرارة النهار وتشعها ليلاً لتحقيق التوازن الحراري.",
          points: 2,
        },
        {
          id: "sec1_pass_2",
          number: 7,
          question: "Modern Egyptian architectural projects are distinguished by __________.",
          options: [
            "blending ancient green concepts with advanced solar and water recycling systems",
            "strictly duplicating historic pharaonic materials without modern alterations",
            "abandoning desert construction in favor of crowded coastal valleys",
            "relying solely on non-renewable energy resources",
          ],
          correctAnswer: "blending ancient green concepts with advanced solar and water recycling systems",
          explanation: "المشاريع المصرية الحديثة تجمع بين عبقرية التراث المعماري وأنظمة الطاقة المتجددة.",
          points: 2,
        },
      ],
    },
    translation: [
      {
        id: "sec1_trans_1",
        number: 8,
        direction: "en_to_ar",
        sourceText: "Preserving historical heritage instills national pride and connects younger generations with their civilizational roots.",
        options: [
          "إن الحفاظ على التراث التاريخي يغرس الفخر الوطني ويربط الأجيال الصاعدة بجذورها الحضارية.",
          "إن تدمير التراث التاريخي يمنع الفخر الوطني ويقطع صلة الأجيال المعاصرة بجذورها.",
          "يعتبر التراث التاريخي عبئاً اقتصادياً يمنع الأجيال الشابة من التطور الحضاري السريع.",
          "إن الحفاظ على التاريخ يتطلب التخلي عن الفخر الوطني والتركيز على العولمة فقط.",
        ],
        correctAnswer: "إن الحفاظ على التراث التاريخي يغرس الفخر الوطني ويربط الأجيال الصاعدة بجذورها الحضارية.",
        points: 2,
      },
      {
        id: "sec1_trans_2",
        number: 9,
        direction: "ar_to_en",
        sourceText: "تسعى مصر جاهدة لتطوير التعليم وبناء جيل قادر على المنافسة في سوق العمل العالمي.",
        options: [
          "Egypt strives hard to develop education and build a generation capable of competing in the global labor market.",
          "Egypt avoids developing education because it cannot compete in any labor market.",
          "Egypt stopped building generations who compete in the local market.",
          "Egypt strives to neglect schools and reduce competition worldwide.",
        ],
        correctAnswer: "Egypt strives hard to develop education and build a generation capable of competing in the global labor market.",
        points: 2,
      },
    ],
    novel: [
      {
        id: "sec1_novel_1",
        number: 10,
        questionEn: "In 'The Old Man and the Sea', Santiago asserts: 'Man is not made for defeat.' How did his perseverance reflect this philosophy?",
        questionAr: "في رواية العجوز والبحر، يؤكد سانتياجو أن الإنسان لم يُخلق للهزيمة. كيف عكست عزيمته هذه الفلسفة؟",
        modelAnswer:
          "Santiago proved that true human greatness lies in relentless determination and dignity. Despite 84 days without catching a fish, he never surrendered his hope or self-respect.",
        points: 2,
      },
    ],
    essay: {
      promptEn: "Write an essay of about 150 words on: 'How Youth Can Contribute to Egypt's Sustainable Development.'",
      promptAr: "اكتب مقالاً من حوالي 150 كلمة عن: كيفية مساهمة الشباب في التنمية المستدامة بمصر.",
      minWords: 120,
      points: 4,
      rubricHint: "Introduce role of youth, provide 2 concrete areas (science & digital transformation), conclude with patriotic call to action.",
    },
  },
};

// 3. THIRD PREP (الشهادة الإعدادية — 30 Marks — 90 Minutes)
export const EXAM_PREP3_MINISTRY: MockExamDefinition = {
  id: "mock_prep3_national_1",
  title: "نموذج امتحان الشهادة الإعدادية الشامل الرسمي — مستر حبيب الرحمن 2026/2027",
  stage: "Preparatory",
  gradeLevel: "3rd_prep",
  gradeLabelAr: "الصف الثالث الإعدادي (الشهادة الإعدادية)",
  term: "first",
  durationMinutes: 90,
  totalMarks: 30,
  isPublished: true,
  sections: {
    mcq: [
      {
        id: "prep3_mcq_1",
        number: 1,
        question: "A __________ is a vehicle that travels on rails in city streets.",
        options: ["tram", "ferry", "submarine", "lorry"],
        correctAnswer: "tram",
        explanation: "الترام (tram) هو وسيلة مواصلات تسير على قضبان في شوارع المدينة مثل ترام الإسكندرية.",
        points: 1,
        domain: "Vocabulary",
      },
      {
        id: "prep3_mcq_2",
        number: 2,
        question: "The museum __________ at 9:00 AM every single morning according to the official timetable.",
        options: ["opens", "opened", "will open", "is opening"],
        correctAnswer: "opens",
        explanation: "جداول المواعيد والقطارات والمتاحف يُعبر عنها بالمضارع البسيط (Present Simple: opens).",
        points: 1,
        domain: "Grammar",
      },
      {
        id: "prep3_mcq_3",
        number: 3,
        question: "Our city has wonderful botanical __________ where rare trees and flowers are protected.",
        options: ["gardens", "factories", "monuments", "deserts"],
        correctAnswer: "gardens",
        explanation: "الحدائق النباتية (botanical gardens) لحماية النباتات والزهور النادرة مثل حديقة الأورمان.",
        points: 1,
        domain: "Vocabulary",
      },
      {
        id: "prep3_mcq_4",
        number: 4,
        question: "Hany is very tired because he has __________ walking around the exhibition for three hours.",
        options: ["been", "be", "being", "was"],
        correctAnswer: "been",
        explanation: "زمن المضارع التام المستمر: has been + v-ing للتعبير عن حدث استمر لفترة وما زال أثره واضحاً.",
        points: 1,
        domain: "Grammar",
      },
    ],
    passage: {
      title: "Ismailia: The Garden City",
      content:
        "Ismailia is a charming Egyptian city situated along the Suez Canal. It is widely famous for its peace, clean streets, and vast green spaces. Visitors love Lake Timsah where families enjoy sailing and swimming. The city also features magnificent historic buildings built in the nineteenth century with French and European architectural styles. Its sweet mangoes are celebrated nationwide as the finest in Egypt.",
      questions: [
        {
          id: "prep3_pass_1",
          number: 5,
          question: "Lake Timsah in Ismailia is especially popular for __________.",
          options: [
            "swimming and family sailing trips",
            "building desert factories",
            "harvesting wheat in winter",
            "landing cargo aircraft",
          ],
          correctAnswer: "swimming and family sailing trips",
          explanation: "ذكرت القطعة بوضوح أن العائلات تستمتع بالإبحار والسباحة في بحيرة التمساح.",
          points: 2,
        },
      ],
    },
    translation: [
      {
        id: "prep3_trans_1",
        number: 6,
        direction: "en_to_ar",
        sourceText: "Public transport helps reduce traffic congestion and air pollution in large cities.",
        options: [
          "تساعد وسائل النقل العام في تقليل الازدحام المروري وتلوث الهواء في المدن الكبرى.",
          "تزيد السيارات الخاصة من نظافة الهواء وتقلل حوادث الطرق في كل العواصم.",
          "إن وسائل المواصلات العامة ممنوعة في المدن الكبرى لتجنب الزحام.",
          "تساعد المصانع الكبيرة في تحسين حركة المرور وتنقية الهواء.",
        ],
        correctAnswer: "تساعد وسائل النقل العام في تقليل الازدحام المروري وتلوث الهواء في المدن الكبرى.",
        points: 2,
      },
    ],
    essay: {
      promptEn: "Write a short paragraph of about 110 words about: 'A Visit to an Egyptian Tourist City.'",
      promptAr: "اكتب فقرة من حوالي 110 كلمة عن: زيارة إلى مدينة سياحية مصرية.",
      minWords: 90,
      points: 4,
      rubricHint: "Name the city, describe what you did, and give reasons why tourists should visit it.",
    },
  },
};

export const MASTER_MOCK_EXAMS_REGISTRY: MockExamDefinition[] = [
  EXAM_SEC3_MINISTRY,
  EXAM_SEC1_MINISTRY,
  EXAM_PREP3_MINISTRY,
];
