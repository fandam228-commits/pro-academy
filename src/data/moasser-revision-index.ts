/**
 * El-Moasser Official Revision & Interactive Model Exams Database (2026/2027)
 * In cooperation with GPS Printing & Publishing.
 * Covers General Education, Language Schools (Connect/Hello Plus), and Al-Azhar.
 */

export interface MoasserBookletLink {
  label: string;
  url: string;
  type: "revision" | "modified_exercises" | "model_exams";
}

export interface MoasserGrade {
  id: string;
  name: string;
  en: string;
  stage: "primary" | "prep" | "secondary";
  curriculum: string;
  term: "First Term 2026/2027";
  links: MoasserBookletLink[];
  hasInteractiveExam: boolean;
  examId?: string;
  totalQuestions?: number;
  durationMinutes?: number;
}

export interface MoasserStage {
  id: "primary" | "prep" | "secondary";
  name: string;
  grades: MoasserGrade[];
}

export interface MoasserSection {
  id: "general" | "languages" | "azhar";
  name: string;
  en: string;
  badge: string;
  stages: MoasserStage[];
}

export interface MoasserExamQuestion {
  id: string;
  type: "mcq" | "dialogue" | "translation" | "reading";
  category: "Grammar" | "Vocabulary" | "Language Functions" | "Reading Comprehension" | "Translation";
  question: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
  explanationAr: string;
  ruleReference?: string;
}

export interface MoasserExam {
  id: string;
  title: string;
  grade: string;
  stage: string;
  term: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: MoasserExamQuestion[];
}

export const MOASSER_SECTIONS: MoasserSection[] = [
  {
    id: "general",
    name: "طلاب التعليم العام",
    en: "General Education",
    badge: "المناهج الرسمية للتربية والتعليم",
    stages: [
      {
        id: "secondary",
        name: "المرحلة الثانوية",
        grades: [
          {
            id: "sec1_general",
            name: "الصف الأول الثانوي",
            en: "1st Secondary",
            stage: "secondary",
            curriculum: "New Hello",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "moasser_sec1_exam1",
            totalQuestions: 20,
            durationMinutes: 45,
            links: [
              {
                label: "المراجعة النهائية ونماذج الامتحانات",
                url: "https://gps-eg.org/dpaS4zH1",
                type: "revision",
              },
            ],
          },
          {
            id: "sec2_bac_general",
            name: "الصف الثاني الثانوي (البكالوريا المصرية)",
            en: "Second Year Baccalaureate (Sec 2)",
            stage: "secondary",
            curriculum: "Egyptian Baccalaureate 2027",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "moasser_sec2_bac_exam1",
            totalQuestions: 25,
            durationMinutes: 45,
            links: [
              {
                label: "كتاب المعاصر - بنك الأسئلة والتدريبات التفاعلية",
                url: "/?tab=question_bank&grade=Second+Secondary",
                type: "model_exams",
              },
            ],
          },
        ],
      },
      {
        id: "prep",
        name: "المرحلة الإعدادية",
        grades: [
          {
            id: "prep3_general",
            name: "الصف الثالث الإعدادي (الشهادة الإعدادية)",
            en: "3rd Prep",
            stage: "prep",
            curriculum: "New Hello",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "moasser_prep3_exam1",
            totalQuestions: 15,
            durationMinutes: 35,
            links: [
              {
                label: "المراجعة النهائية الشاملة",
                url: "https://gps-eg.org/tSmknuMi",
                type: "revision",
              },
              {
                label: "التدريبات والنماذج المعدلة 2026",
                url: "https://gps-eg.org/sN9Mhy2j",
                type: "modified_exercises",
              },
            ],
          },
          {
            id: "prep2_general",
            name: "الصف الثاني الإعدادي",
            en: "2nd Prep",
            stage: "prep",
            curriculum: "New Hello",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "moasser_prep2_exam1",
            totalQuestions: 15,
            durationMinutes: 30,
            links: [
              {
                label: "المراجعة النهائية الشاملة",
                url: "https://gps-eg.org/mUMBIXFu",
                type: "revision",
              },
              {
                label: "التدريبات المعدلة",
                url: "https://gps-eg.org/VmPNgt0O",
                type: "modified_exercises",
              },
            ],
          },
          {
            id: "prep1_general",
            name: "الصف الأول الإعدادي",
            en: "1st Prep",
            stage: "prep",
            curriculum: "New Hello",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "moasser_prep1_exam1",
            totalQuestions: 15,
            durationMinutes: 30,
            links: [
              {
                label: "المراجعة النهائية الشاملة",
                url: "https://gps-eg.org/RiGqFQZ3",
                type: "revision",
              },
              {
                label: "التدريبات المعدلة",
                url: "https://gps-eg.org/J9aqsDUV",
                type: "modified_exercises",
              },
            ],
          },
        ],
      },
      {
        id: "primary",
        name: "المرحلة الابتدائية",
        grades: [
          {
            id: "pri6_general",
            name: "الصف السادس الابتدائي",
            en: "6th Primary",
            stage: "primary",
            curriculum: "Connect 6",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/Fe7Egt1x", type: "revision" }],
          },
          {
            id: "pri5_general",
            name: "الصف الخامس الابتدائي",
            en: "5th Primary",
            stage: "primary",
            curriculum: "Connect 5",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/YqMnw5vM", type: "revision" }],
          },
          {
            id: "pri4_general",
            name: "الصف الرابع الابتدائي",
            en: "4th Primary",
            stage: "primary",
            curriculum: "Connect 4",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/2OMegjiU", type: "revision" }],
          },
          {
            id: "pri3_general",
            name: "الصف الثالث الابتدائي",
            en: "3rd Primary",
            stage: "primary",
            curriculum: "Connect 3",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/0AjEk5YJ", type: "revision" }],
          },
          {
            id: "pri2_general",
            name: "الصف الثاني الابتدائي",
            en: "2nd Primary",
            stage: "primary",
            curriculum: "Connect 2",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/YgHpVs4w", type: "revision" }],
          },
          {
            id: "pri1_general",
            name: "الصف الأول الابتدائي",
            en: "1st Primary",
            stage: "primary",
            curriculum: "Connect 1",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/Ec0E754o", type: "revision" }],
          },
        ],
      },
    ],
  },
  {
    id: "languages",
    name: "طلاب المدارس الرسمية والخاصة لغات",
    en: "Experimental & Language Schools",
    badge: "مناهج Connect Plus & Hello Plus",
    stages: [
      {
        id: "prep",
        name: "المرحلة الإعدادية",
        grades: [
          {
            id: "prep3_lang",
            name: "الصف الثالث الإعدادي (لغات)",
            en: "3rd Prep (Hello Plus)",
            stage: "prep",
            curriculum: "Hello Plus 3",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية ونماذج الامتحانات", url: "https://gps-eg.org/pYUf5HMO", type: "revision" }],
          },
          {
            id: "prep2_lang",
            name: "الصف الثاني الإعدادي (لغات)",
            en: "2nd Prep (Hello Plus)",
            stage: "prep",
            curriculum: "Hello Plus 2",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية ونماذج الامتحانات", url: "https://gps-eg.org/Gs3slbwU", type: "revision" }],
          },
          {
            id: "prep1_lang",
            name: "الصف الأول الإعدادي (لغات)",
            en: "1st Prep (Hello Plus)",
            stage: "prep",
            curriculum: "Hello Plus 1",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية ونماذج الامتحانات", url: "https://gps-eg.org/GIWCf92T", type: "revision" }],
          },
        ],
      },
      {
        id: "primary",
        name: "المرحلة الابتدائية (Connect Plus)",
        grades: [
          {
            id: "pri6_lang",
            name: "الصف السادس الابتدائي (Connect Plus)",
            en: "6th Primary (Connect Plus)",
            stage: "primary",
            curriculum: "Connect Plus 6",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/PEmEdcSQ", type: "revision" }],
          },
          {
            id: "pri5_lang",
            name: "الصف الخامس الابتدائي (Connect Plus)",
            en: "5th Primary (Connect Plus)",
            stage: "primary",
            curriculum: "Connect Plus 5",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/hre1jrrg", type: "revision" }],
          },
          {
            id: "pri4_lang",
            name: "الصف الرابع الابتدائي (Connect Plus)",
            en: "4th Primary (Connect Plus)",
            stage: "primary",
            curriculum: "Connect Plus 4",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/JcYbKNzh", type: "revision" }],
          },
          {
            id: "pri3_lang",
            name: "الصف الثالث الابتدائي (Connect Plus)",
            en: "3rd Primary (Connect Plus)",
            stage: "primary",
            curriculum: "Connect Plus 3",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/mGPONw1K", type: "revision" }],
          },
          {
            id: "pri2_lang",
            name: "الصف الثاني الابتدائي (Connect Plus)",
            en: "2nd Primary (Connect Plus)",
            stage: "primary",
            curriculum: "Connect Plus 2",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/GsWBxIHi", type: "revision" }],
          },
          {
            id: "pri1_lang",
            name: "الصف الأول الابتدائي (Connect Plus)",
            en: "1st Primary (Connect Plus)",
            stage: "primary",
            curriculum: "Connect Plus 1",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/RGvqsaSr", type: "revision" }],
          },
        ],
      },
    ],
  },
  {
    id: "azhar",
    name: "طلاب الأزهر الشريف",
    en: "Al-Azhar Students",
    badge: "مناهج قطاع المعاهد الأزهرية",
    stages: [
      {
        id: "secondary",
        name: "المرحلة الثانوية الأزهرية",
        grades: [
          {
            id: "sec1_azhar",
            name: "الصف الأول الثانوي الأزهري",
            en: "1st Secondary (Azhar)",
            stage: "secondary",
            curriculum: "New Hello (Azhar Edition)",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية ونماذج الامتحانات", url: "https://gps-eg.org/WvqXsK55", type: "revision" }],
          },
        ],
      },
      {
        id: "prep",
        name: "المرحلة الإعدادية الأزهرية",
        grades: [
          {
            id: "prep3_azhar",
            name: "الصف الثالث الإعدادي الأزهري",
            en: "3rd Prep (Azhar)",
            stage: "prep",
            curriculum: "New Hello (Azhar Edition)",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/hsISJqOV", type: "revision" }],
          },
          {
            id: "prep2_azhar",
            name: "الصف الثاني الإعدادي الأزهري",
            en: "2nd Prep (Azhar)",
            stage: "prep",
            curriculum: "New Hello (Azhar Edition)",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/1SV6Hw93", type: "revision" }],
          },
          {
            id: "prep1_azhar",
            name: "الصف الأول الإعدادي الأزهري",
            en: "1st Prep (Azhar)",
            stage: "prep",
            curriculum: "New Hello (Azhar Edition)",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/R4LXppXR", type: "revision" }],
          },
        ],
      },
      {
        id: "primary",
        name: "المرحلة الابتدائية الأزهرية",
        grades: [
          {
            id: "pri6_azhar",
            name: "الصف السادس الابتدائي الأزهري",
            en: "6th Primary (Azhar)",
            stage: "primary",
            curriculum: "Connect 6",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/FtE1jTqY", type: "revision" }],
          },
          {
            id: "pri5_azhar",
            name: "الصف الخامس الابتدائي الأزهري",
            en: "5th Primary (Azhar)",
            stage: "primary",
            curriculum: "Connect 5",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/fi9QXjem", type: "revision" }],
          },
          {
            id: "pri4_azhar",
            name: "الصف الرابع الابتدائي الأزهري",
            en: "4th Primary (Azhar)",
            stage: "primary",
            curriculum: "Connect 4",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/49sYnFdx", type: "revision" }],
          },
          {
            id: "pri3_azhar",
            name: "الصف الثالث الابتدائي الأزهري",
            en: "3rd Primary (Azhar)",
            stage: "primary",
            curriculum: "Connect 3",
            term: "First Term 2026/2027",
            hasInteractiveExam: false,
            links: [{ label: "المراجعة النهائية", url: "https://gps-eg.org/HIXEUtf4", type: "revision" }],
          },
        ],
      },
    ],
  },
];

export const MOASSER_INTERACTIVE_EXAMS: Record<string, MoasserExam> = {
  moasser_sec1_exam1: {
    id: "moasser_sec1_exam1",
    title: "النموذج الاسترشادي الرسمي الأول — الصف الأول الثانوي 2026/2027",
    grade: "الصف الأول الثانوي",
    stage: "المرحلة الثانوية",
    term: "الفصل الدراسي الأول",
    durationMinutes: 45,
    totalMarks: 20,
    passingMarks: 12,
    questions: [
      {
        id: "s1_q1",
        type: "mcq",
        category: "Vocabulary",
        question: "Ecotourism is designed to have the least possible ............ on the local environment.",
        options: ["impact", "distance", "isolate", "spoil"],
        correctAnswer: "impact",
        explanationAr: "تعبير شائع في منهج الصف الأول الثانوي: have an impact on يعني يترك أثراً على البيئة.",
        ruleReference: "Unit 1: Getting Away (Ecotourism Vocabulary)",
      },
      {
        id: "s1_q2",
        type: "mcq",
        category: "Grammar",
        question: "While I ............ my homework yesterday evening, the electricity suddenly went out.",
        options: ["was doing", "did", "have done", "had done"],
        correctAnswer: "was doing",
        explanationAr: "بعد While نستخدم الماضي المستمر (was/were + v-ing) للتعبير عن حدث كان مستمراً عندما قطعه حدث آخر في الماضي البسيط.",
        ruleReference: "Unit 1: Past Simple vs. Past Continuous",
      },
      {
        id: "s1_q3",
        type: "mcq",
        category: "Vocabulary",
        question: "A true volunteer is someone who works willingly to help their community without expecting any financial ............",
        options: ["reward", "punishment", "penalty", "damage"],
        correctAnswer: "reward",
        explanationAr: "كلمة reward تعني مكافأة مالية أو معنوية، وهي الكلمة المناسبة لعمل المتطوع بدون انتظار مقابل.",
        ruleReference: "Unit 2: Supporting the Community",
      },
      {
        id: "s1_q4",
        type: "mcq",
        category: "Grammar",
        question: "Tarek has lived in Aswan ............ he was eight years old.",
        options: ["since", "for", "ago", "yet"],
        correctAnswer: "since",
        explanationAr: "تأتي since مع المضارع التام إذا تلاها نقطة زمنية محددة أو جملة ماضي بسيط (he was eight years old).",
        ruleReference: "Unit 2: Present Perfect (since vs. for)",
      },
      {
        id: "s1_q5",
        type: "mcq",
        category: "Vocabulary",
        question: "Doctors and scientists work tirelessly to find a permanent cure for chronic ............ like diabetes.",
        options: ["illnesses", "cures", "medicines", "vitamins"],
        correctAnswer: "illnesses",
        explanationAr: "تعبير chronic illnesses يعني الأمراض المزمنة.",
        ruleReference: "Unit 3: Improving Lives",
      },
      {
        id: "s1_q6",
        type: "mcq",
        category: "Grammar",
        question: "By the time the ambulance arrived, the injured pedestrian ............ first aid by a passerby.",
        options: ["had been given", "has given", "was giving", "gives"],
        correctAnswer: "had been given",
        explanationAr: "بعد By the time + ماضي بسيط نستخدم الماضي التام المبني للمجهول (had been + p.p) لأن المريض قُدِّمت له الإسعافات الأولية أولاً.",
        ruleReference: "Unit 3: Past Perfect Passive",
      },
      {
        id: "s1_q7",
        type: "mcq",
        category: "Vocabulary",
        question: "You must always maintain proper hygiene in your kitchen to stop bacteria from ............ on food.",
        options: ["multiplying", "disappearing", "decreasing", "vanishing"],
        correctAnswer: "multiplying",
        explanationAr: "كلمة multiplying تعني تتكاثر (تتضاعف أعداد البكتيريا).",
        ruleReference: "Unit 4: Making Friends & Health",
      },
      {
        id: "s1_q8",
        type: "mcq",
        category: "Grammar",
        question: "Look at those dark, heavy clouds over the stadium! It ............ to rain heavily in a few minutes.",
        options: ["is going", "will", "may", "shall"],
        correctAnswer: "is going",
        explanationAr: "نستخدم (am/is/are going to) للتنبؤ بوجود دليل مادي مرئي ومباشر (dark clouds).",
        ruleReference: "Unit 4: Future Forms (going to vs will)",
      },
      {
        id: "s1_q9",
        type: "mcq",
        category: "Vocabulary",
        question: "Online scammers often use phishing emails to trick people into giving away their confidential ............",
        options: ["passwords", "gardens", "exercises", "hobbies"],
        correctAnswer: "passwords",
        explanationAr: "المخترقون يستخدمون رسائل التصيد لسرقة كلمات المرور السرية (confidential passwords).",
        ruleReference: "Unit 5: Being Safe Online",
      },
      {
        id: "s1_q10",
        type: "mcq",
        category: "Grammar",
        question: "You ............ take photos inside this military zone; it is strictly prohibited by law.",
        options: ["mustn't", "don't have to", "can", "ought"],
        correctAnswer: "mustn't",
        explanationAr: "نستخدم mustn't للتعبير عن التحريم والمنع القاطع بنص القانون (prohibited / forbidden).",
        ruleReference: "Unit 5: Modals of Prohibition and Obligation",
      },
      {
        id: "s1_q11",
        type: "mcq",
        category: "Vocabulary",
        question: "Reading English novels regularly helps expand your active vocabulary and enhances your critical ............",
        options: ["thinking", "eating", "sleeping", "running"],
        correctAnswer: "thinking",
        explanationAr: "تعبير critical thinking يعني التفكير النقدي والتحليلي.",
        ruleReference: "Unit 6: Learning from Literature",
      },
      {
        id: "s1_q12",
        type: "mcq",
        category: "Grammar",
        question: "If I ............ more time this evening, I would certainly join you for the football match.",
        options: ["had", "have", "had had", "will have"],
        correctAnswer: "had",
        explanationAr: "الحالة الشرطية الثانية (If + past simple, would + inf) للتعبير عن موقف غير محتمل أو افتراضي في الحاضر.",
        ruleReference: "Unit 6: Second Conditional",
      },
      {
        id: "s1_q13",
        type: "mcq",
        category: "Language Functions",
        question: "Which of the following sentences is correctly punctuated?",
        options: [
          "Although it was raining heavily, the students arrived on time.",
          "Although it was raining heavily the students arrived on time.",
          "Although, it was raining heavily the students arrived on time.",
          "Although it was raining heavily, the students arrived on time!",
        ],
        correctAnswer: "Although it was raining heavily, the students arrived on time.",
        explanationAr: "عندما تبدأ الجملة برابط تناقض (Although + clause) يجب وضع فاصلة (comma) بعد نهاية شبه الجملة التابعة وقبل الجملة الرئيسية.",
        ruleReference: "Writing Conventions: Punctuation Rules",
      },
      {
        id: "s1_q14",
        type: "mcq",
        category: "Language Functions",
        question: "In an essay, which of the following is the most suitable transition word to introduce an additional argument?",
        options: ["Furthermore", "However", "In spite of", "Nevertheless"],
        correctAnswer: "Furthermore",
        explanationAr: "كلمة Furthermore تعني (علاوة على ذلك) وتُستخدم لإضافة فكرة داعمة جديدة، بينما However و Nevertheless للتناقض.",
        ruleReference: "Essay Writing: Transitions & Cohesion",
      },
      {
        id: "s1_q15",
        type: "mcq",
        category: "Translation",
        question: "اختر الترجمة الإنجليزية الصحيحة:\n«تلعب التكنولوجيا الحديثة دوراً حيوياً في تطوير منظومة التعليم وإعداد أجيال واعدة.»",
        options: [
          "Modern technology plays a vital role in developing the education system and preparing promising generations.",
          "Modern technology plays a useless role in developing the education system and preparing promising generations.",
          "Modern technology plays a vital role in destroying the education system and preparing bad generations.",
          "Ancient technology plays a vital role in developing the education system and preparing promising generations.",
        ],
        correctAnswer: "Modern technology plays a vital role in developing the education system and preparing promising generations.",
        explanationAr: "الترجمة الدقيقة لكلمة (حيوياً) هي vital، و(منظومة التعليم) education system، و(أجيال واعدة) promising generations.",
        ruleReference: "Translation Academy: General National Progress",
      },
      {
        id: "s1_q16",
        type: "mcq",
        category: "Translation",
        question: "اختر الترجمة العربية الصحيحة:\n«Time management is one of the most essential skills students must master to achieve academic excellence.»",
        options: [
          "تُعد إدارة الوقت من أهم المهارات الأساسية التي يجب على الطلاب إتقانها لتحقيق التفوق الدراسي.",
          "يُعد إضاعة الوقت من أسوأ العادات التي يجب على الطلاب تجنبها لتحقيق الفشل الدراسي.",
          "تُعد معرفة الوقت مهارة غير مهمة للطلاب لتحقيق التفوق الدراسي.",
          "تُعد إدارة الوقت مهارة ترفيهية يجب على المعلمين تطبيقها.",
        ],
        correctAnswer: "تُعد إدارة الوقت من أهم المهارات الأساسية التي يجب على الطلاب إتقانها لتحقيق التفوق الدراسي.",
        explanationAr: "الترجمة الصحيحة: Time management (إدارة الوقت) - essential skills (المهارات الأساسية) - academic excellence (التفوق الدراسي).",
        ruleReference: "Translation Academy: Educational Values",
      },
      {
        id: "s1_q17",
        type: "mcq",
        category: "Reading Comprehension",
        passage: "Renewable energy sources like solar and wind power are becoming the cornerstone of modern sustainable development. Unlike fossil fuels, which release millions of tons of greenhouse gases into the atmosphere every year, renewable energy generates clean power with virtually zero direct emissions. Egypt has taken immense strides in this field by constructing the Benban Solar Park in Aswan, one of the largest solar installations on planet Earth.",
        question: "What makes renewable energy superior to fossil fuels according to the passage?",
        options: [
          "It produces clean energy with almost no direct carbon emissions.",
          "It is completely free of charge and requires no maintenance.",
          "It can only be used during winter seasons.",
          "It is extracted from deep underground fossil reserves.",
        ],
        correctAnswer: "It produces clean energy with almost no direct carbon emissions.",
        explanationAr: "مذكور صراحة في القطعة: (renewable energy generates clean power with virtually zero direct emissions).",
        ruleReference: "Reading Comprehension Strategy: Factual Recall",
      },
      {
        id: "s1_q18",
        type: "mcq",
        category: "Reading Comprehension",
        question: "The word 'immense' in the passage is closest in meaning to ............",
        options: ["huge", "tiny", "slow", "negative"],
        correctAnswer: "huge",
        explanationAr: "كلمة immense تعني هائل أو عظيم (huge / gigantic).",
        ruleReference: "Reading Comprehension: Contextual Vocabulary",
      },
      {
        id: "s1_q19",
        type: "mcq",
        category: "Grammar",
        question: "Neither of the two students ............ ready for the speaking test yesterday.",
        options: ["was", "were", "are", "have been"],
        correctAnswer: "was",
        explanationAr: "تعبير Neither of يأخذ فعلاً مفرداً (was وليس were)، خاصة في السياق الرسمي.",
        ruleReference: "Subject-Verb Agreement Rules",
      },
      {
        id: "s1_q20",
        type: "mcq",
        category: "Vocabulary",
        question: "Mr. Habib always advises us: 'Never put off till tomorrow what you can do ............'.",
        options: ["today", "never", "yesterday", "rarely"],
        correctAnswer: "today",
        explanationAr: "المثل الإنجليزي الشهير: لا تؤجل عمل اليوم إلى الغد (Never put off till tomorrow what you can do today).",
        ruleReference: "Idioms and Famous English Proverbs",
      },
    ],
  },
  moasser_prep3_exam1: {
    id: "moasser_prep3_exam1",
    title: "امتحان الشهادة الإعدادية الاسترشادي الأول — مواصفات المعاصر 2026",
    grade: "الصف الثالث الإعدادي",
    stage: "المرحلة الإعدادية",
    term: "الفصل الدراسي الأول",
    durationMinutes: 35,
    totalMarks: 15,
    passingMarks: 9,
    questions: [
      {
        id: "p3_q1",
        type: "dialogue",
        category: "Language Functions",
        question: "Omar meets a tourist in Luxor.\nOmar: Welcome to Egypt! Where are you from?\nTourist: ............",
        options: [
          "I am from London, England.",
          "I like eating Egyptian Koshary.",
          "It takes two hours by plane.",
          "I am thirty years old.",
        ],
        correctAnswer: "I am from London, England.",
        explanationAr: "السؤال يسأل عن بلد السائح (Where are you from?)، فالإجابة الصحيحة هي تحديد بلده: I am from London.",
        ruleReference: "Prep 3 Dialogue Mastery: Country of Origin",
      },
      {
        id: "p3_q2",
        type: "dialogue",
        category: "Language Functions",
        question: "Tourist: What places do you recommend I visit first?\nOmar: ............",
        options: [
          "I recommend visiting Karnak Temple and the Valley of the Kings.",
          "No, I don't like Luxor at all.",
          "The ticket costs 50 pounds.",
          "You must leave Egypt immediately.",
        ],
        correctAnswer: "I recommend visiting Karnak Temple and the Valley of the Kings.",
        explanationAr: "رد منطقي ومناسب لتقديم التوصية بزيارة أشهر معالم الأقصر: Karnak Temple & Valley of the Kings.",
        ruleReference: "Prep 3 Dialogue: Giving Recommendations",
      },
      {
        id: "p3_q3",
        type: "mcq",
        category: "Vocabulary",
        question: "A ............ is a comfortable form of public transport that travels on tracks through city streets.",
        options: ["tram", "ferry", "submarine", "spaceship"],
        correctAnswer: "tram",
        explanationAr: "كلمة tram تعني الترام الكهربائي الذي يسير في شوارع المدينة مثل ترام الإسكندرية.",
        ruleReference: "Unit 1: Around Town (Transport)",
      },
      {
        id: "p3_q4",
        type: "mcq",
        category: "Grammar",
        question: "The morning train to Alexandria ............ at 7:30 AM every day.",
        options: ["leaves", "is leaving", "left", "has left"],
        correctAnswer: "leaves",
        explanationAr: "نستخدم المضارع البسيط (leaves) مع جداول المواعيد الثابتة للقطارات والطائرات (timetables).",
        ruleReference: "Unit 1: Present Simple for Scheduled Timetables",
      },
      {
        id: "p3_q5",
        type: "mcq",
        category: "Vocabulary",
        question: "A ............ is an electrical kitchen device used to boil water quickly for tea or coffee.",
        options: ["kettle", "toaster", "microwave", "fridge"],
        correctAnswer: "kettle",
        explanationAr: "الغلاية الكهربائية هي (kettle).",
        ruleReference: "Unit 2: Let's Go Shopping",
      },
      {
        id: "p3_q6",
        type: "mcq",
        category: "Grammar",
        question: "This smart television is much ............ than the old model in our living room.",
        options: ["cheaper", "cheap", "cheapest", "more cheap"],
        correctAnswer: "cheaper",
        explanationAr: "مقارنة الصفات القصيرة بين اثنين: نضيف er + than للصفة (cheaper than).",
        ruleReference: "Unit 2: Comparative Adjectives",
      },
      {
        id: "p3_q7",
        type: "mcq",
        category: "Vocabulary",
        question: "Decent Life (حياة كريمة) is a major national initiative that aims to improve public ............ in rural villages.",
        options: ["facilities", "poverties", "dangers", "troubles"],
        correctAnswer: "facilities",
        explanationAr: "مبادرة حياة كريمة تهدف لتحسين المرافق والخدمات العامة (public facilities).",
        ruleReference: "Unit 3: My Community (Decent Life)",
      },
      {
        id: "p3_q8",
        type: "mcq",
        category: "Grammar",
        question: "My father ............ to Luxor tomorrow morning; he has already booked the flight ticket.",
        options: ["is travelling", "travels", "travelled", "was travelling"],
        correctAnswer: "is travelling",
        explanationAr: "نستخدم المضارع المستمر (is travelling) للتعبير عن ترتيبات مستقبلية مؤكدة مع حجز التذاكر (booked the ticket).",
        ruleReference: "Unit 3: Present Continuous for Future Arrangements",
      },
      {
        id: "p3_q9",
        type: "mcq",
        category: "Vocabulary",
        question: "People who suffer from ............ find it particularly challenging to read and spell words correctly.",
        options: ["dyslexia", "headache", "toothache", "influenza"],
        correctAnswer: "dyslexia",
        explanationAr: "صعوبة القراءة والتهجي تُسمى عسر القراءة (dyslexia).",
        ruleReference: "Unit 4: Have You Ever...",
      },
      {
        id: "p3_q10",
        type: "mcq",
        category: "Grammar",
        question: "Have you ............ visited the High Dam in Aswan?",
        options: ["ever", "never", "yet", "since"],
        correctAnswer: "ever",
        explanationAr: "نستخدم ever في السؤال مع زمن المضارع التام للسؤال عن الخبرات السابقة.",
        ruleReference: "Unit 4: Present Perfect with Ever & Never",
      },
      {
        id: "p3_q11",
        type: "mcq",
        category: "Vocabulary",
        question: "A person who creates software applications and writes computer code is a computer ............",
        options: ["programmer", "carpenter", "plumber", "gardener"],
        correctAnswer: "programmer",
        explanationAr: "مبرمج الحاسوب هو computer programmer.",
        ruleReference: "Unit 5: Young Role Models",
      },
      {
        id: "p3_q12",
        type: "mcq",
        category: "Grammar",
        question: "Ziad was exhausted yesterday because he ............ football for three hours under the sun.",
        options: ["had played", "has played", "plays", "is playing"],
        correctAnswer: "had played",
        explanationAr: "نستخدم الماضي التام (had played) لتوضيح سبب حدث في الماضي (was exhausted).",
        ruleReference: "Unit 5: Past Perfect for Past Causes",
      },
      {
        id: "p3_q13",
        type: "mcq",
        category: "Vocabulary",
        question: "Cyberbullying is a harmful online behavior where someone sends ............ messages to frighten others.",
        options: ["cruel", "kind", "friendly", "helpful"],
        correctAnswer: "cruel",
        explanationAr: "التنمر الإلكتروني يتضمن إرسال رسائل قاسية ومؤذية (cruel messages).",
        ruleReference: "Unit 6: What's the Matter?",
      },
      {
        id: "p3_q14",
        type: "mcq",
        category: "Grammar",
        question: "You ............ be polite and respectful to your teachers and classmates at all times.",
        options: ["should", "shouldn't", "mustn't", "cannot"],
        correctAnswer: "should",
        explanationAr: "نستخدم should لإعطاء نصيحة إيجابية قوية ومحبوبة.",
        ruleReference: "Unit 6: Should for Giving Advice",
      },
      {
        id: "p3_q15",
        type: "mcq",
        category: "Translation",
        question: "اختر الترجمة الإنجليزية الصحيحة:\n«مصر تبذل جهوداً عظيمة لتطوير التعليم وبناء المدارس في كل المحافظات.»",
        options: [
          "Egypt exerts great efforts to develop education and build schools in all governorates.",
          "Egypt neglects great efforts to destroy education and close schools in all cities.",
          "Egypt makes small efforts to stop education in some governorates.",
          "Egypt exerts no efforts to build schools and hospitals.",
        ],
        correctAnswer: "Egypt exerts great efforts to develop education and build schools in all governorates.",
        explanationAr: "تعبير تبذل جهوداً عظيمة هو (exerts great efforts)، ومحافظات (governorates).",
        ruleReference: "Prep 3 Translation Basics",
      },
    ],
  },
};
