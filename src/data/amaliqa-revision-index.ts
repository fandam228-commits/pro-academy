/**
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
  amaliqa_sec2_bac_exam1: {
  "id": "amaliqa_sec2_bac_exam1",
  "title": "النموذج الاسترشادي التفاعلي لسلسلة العمالقة — الصف الثاني الثانوي (البكالوريا المصرية 2027)",
  "grade": "الصف الثاني الثانوي (البكالوريا 2027)",
  "stage": "المرحلة الثانوية والبكالوريا",
  "term": "الفصل الدراسي الأول",
  "durationMinutes": 45,
  "totalMarks": 25,
  "passingMarks": 15,
  "questions": [
    {
      "id": "qb_2027_sec2_amaliqa_mcq_001",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Expecting every student to achieve perfect results without making mistakes is",
      "options": [
        "selective",
        "neutral",
        "objective",
        "unrealistic"
      ],
      "correctAnswer": "unrealistic",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_002",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "1 know Hany slightly from work; he is only alan",
      "options": [
        "companion",
        "friend",
        "relative",
        "acquaintance"
      ],
      "correctAnswer": "friend",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_003",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Early experiences can the way children think about themselves.",
      "options": [
        "publish",
        "ignore",
        "shape",
        "erase"
      ],
      "correctAnswer": "publish",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_004",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Young children can be particularly to criticism from adults.",
      "options": [
        "resistant",
        "indifferent",
        "sensitive",
        "unaffected"
      ],
      "correctAnswer": "indifferent",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_005",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Better training can reduce the between workers' skills and job requirements.",
      "options": [
        "agreement",
        "gap",
        "connection",
        "similarity"
      ],
      "correctAnswer": "connection",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_006",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Students may feel pressure before important exams.",
      "options": [
        "moderate",
        "gentle",
        "mild",
        "intense"
      ],
      "correctAnswer": "mild",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_007",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Regular exercise helps people good physical and mental health.",
      "options": [
        "maintain",
        "lose",
        "weaken",
        "damage"
      ],
      "correctAnswer": "damage",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_008",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Chips, sugary cereals, and packaged snacks are common examples of",
      "options": [
        "natural products",
        "mindful consumption",
        "social connection",
        "processed food"
      ],
      "correctAnswer": "natural products",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_009",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Keeping a daily journal can help teenagers in their lives.",
      "options": [
        "increase anxiety stress d. make problems",
        "sources 49. Deep breathing and good time management can help students during exams.",
        "avoid all responsibilities",
        "pressure c. manage"
      ],
      "correctAnswer": "pressure c. manage",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_010",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "The book I bought is interesting.",
      "options": [
        "When",
        "whose",
        "whom",
        "that"
      ],
      "correctAnswer": "whose",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_011",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "My father always donates and helps charities and poor people,.....is kind of him.",
      "options": [
        "whom",
        "who",
        "which",
        "that"
      ],
      "correctAnswer": "which",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_012",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Monday is the day which I meet my friends.",
      "options": [
        "at",
        "by",
        "in",
        "on"
      ],
      "correctAnswer": "at",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_013",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "I don't know the person with I was chatting.",
      "options": [
        "who",
        "whom",
        "which",
        "that"
      ],
      "correctAnswer": "who",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_014",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Which of the following sentences contains a relative clause?",
      "options": [
        "The book that you gave me is interesting.",
        "He runs faster than me.",
        "I don't know where she lives.",
        "She went home when she was tired."
      ],
      "correctAnswer": "I don't know where she lives.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_015",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "The article showed clear bias by praising side and unfairly criticizing the other.",
      "options": [
        "A way of avoiding personal opinions completely.",
        "A process of checking information before publishing it.",
        "A method of presenting several opinions equally.",
        "A tendency to support or oppose someone or something unfairly."
      ],
      "correctAnswer": "A tendency to support or oppose someone or something unfairly.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_016",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Ignoring students' opinions and making every decision for them can be disempowering.",
      "options": [
        "Encouraging people to quickly from setbacks.",
        "Giving people control their choices. more over own",
        "more",
        "Making people feel less capable or less able to influence decisions."
      ],
      "correctAnswer": "more",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_017",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "What is the speaker's main purpose in this text?",
      "options": [
        "To explain how social media platforms like TikTok work.",
        "To advertise the benefits of video gaming for teenagers.",
        "To describe the problems of time and suggest to find healthy balance. screen ways a",
        "To prove that screens are completely harmful and should be banned."
      ],
      "correctAnswer": "To prove that screens are completely harmful and should be banned.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_018",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "According to the speaker, the most important message about screen use is",
      "options": [
        "screens are essential, so we should not worry about them.",
        "balance between screen use and offline activities is crucial",
        "only social media is harmful, while gaming is always beneficial",
        "the goal is to eliminate time completely screen"
      ],
      "correctAnswer": "screens are essential, so we should not worry about them.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_019",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "The teacher increased student engagement by allowing everyone to take part in a",
      "options": [
        "A student leaves the activity before it begins.",
        "A student sits silently without following the lesson.",
        "A learner copies notes without thinking about their meaning.",
        "A group actively discusses ideas and participates in completing a project."
      ],
      "correctAnswer": "A student sits silently without following the lesson.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_020",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Moving to a new school required considerable flexibility because Salma had to adjust to",
      "options": [
        "The ability to adapt easily to new situations.",
        "The refusal to change established habits.",
        "The tendency to avoid unfamiliar experiences.",
        "The ability to control other people's choices."
      ],
      "correctAnswer": "The ability to adapt easily to new situations.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_021",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Social media has become an importantarena for public discussion and sharing",
      "options": [
        "A rule that limits public communication.",
        "A method used to prevent social interaction.",
        "A private opinion that cannot be discussed.",
        "A place situation where particular activity takes place. or a"
      ],
      "correctAnswer": "A rule that limits public communication.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_022",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "According to the text, what has caused the \"movement crisis\" among young people?",
      "options": [
        "Screen time and academic pressure",
        "Parents not encouraging sport",
        "Lack of sports facilities in schools",
        "The cost of sports equipment"
      ],
      "correctAnswer": "Lack of sports facilities in schools",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_023",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Despite several objections, the manager insisted that everyone follow the new safety",
      "options": [
        "A customer repeatedly demands that faulty product be replaced. a",
        "A student quietly accepts a decision he dislikes.",
        "A manager changes his opinion after hearing another suggestion.",
        "A teacher casually suggests that students revise at home."
      ],
      "correctAnswer": "A teacher casually suggests that students revise at home.",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_024",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Some students may when lessons move faster than they can follow.",
      "options": [
        "finish early",
        "relax completely",
        "struggle to keep up",
        "work independently"
      ],
      "correctAnswer": "relax completely",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    },
    {
      "id": "qb_2027_sec2_amaliqa_mcq_025",
      "type": "mcq",
      "category": "Vocabulary",
      "question": "Every helped the cyclist gain more speed on the flat road.",
      "options": [
        "pedal stroke",
        "hand movement",
        "stop",
        "brake pull"
      ],
      "correctAnswer": "hand movement",
      "explanationAr": "الإجابة الصحيحة وفقاً لسياق منهج البكالوريا للعمالقة (Unit 1).",
      "ruleReference": "Unit 1: Living Well in a Complex World - Contextual Vocabulary & Concepts",
      "optionsCount": 4
    }
  ]
},
};
