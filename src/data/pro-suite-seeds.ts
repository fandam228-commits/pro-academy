// ==============================================================================
// Seed Data: Pro Suite Expansion Pack
// Platform: Professional Academy — Mr. Habib El Rahman
// ==============================================================================

export interface AccessVoucherSeed {
  id: string;
  code: string;
  gradeLevel: string;
  accessScope: "full_month" | "single_unit" | "exam_pack";
  targetUnitId?: string;
  durationDays: number;
  isUsed: boolean;
  batchLabel: string;
}

export interface EssayTopicSeed {
  id: string;
  gradeLevel: string;
  titleEn: string;
  titleAr: string;
  minWords: number;
  ideaBankAr: string[];
  helperVocab: { word: string; meaningAr: string }[];
  modelEssay: string;
}

export interface VocabCardSeed {
  id: string;
  gradeLevel: string;
  unitName: string;
  word: string;
  partOfSpeech: string;
  meaningAr: string;
  exampleEn: string;
  synonyms: string[];
}

export interface MockExamSeed {
  id: string;
  title: string;
  gradeLevel: string;
  durationMinutes: number;
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
    }>;
    passage: {
      title: string;
      text: string;
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
    translation: Array<{
      id: string;
      number: number;
      direction: "en_to_ar" | "ar_to_en";
      sourceText: string;
      options: string[];
      correctAnswer: string;
      trapExplanation: string;
      points: number;
    }>;
    novel: Array<{
      id: string;
      number: number;
      questionEn: string;
      modelAnswerEn: string;
      explanationAr: string;
      points: number;
    }>;
    essay: {
      id: string;
      promptEn: string;
      promptAr: string;
      minWords: number;
      maxScore: number;
      rubricPoints: string[];
    };
  };
}

// 1. SEED ACCESS VOUCHERS
export const SEED_ACCESS_VOUCHERS: AccessVoucherSeed[] = [
  {
    id: "v-001",
    code: "PRO-8492-XK",
    gradeLevel: "3rd_sec",
    accessScope: "full_month",
    durationDays: 30,
    isUsed: false,
    batchLabel: "دفعة التأسيس الأولى 2027",
  },
  {
    id: "v-002",
    code: "PRO-2027-EG",
    gradeLevel: "3rd_sec",
    accessScope: "full_month",
    durationDays: 30,
    isUsed: false,
    batchLabel: "كروت كفر الزيات - أوائل الثانوية",
  },
  {
    id: "v-003",
    code: "PRO-UNIT-01",
    gradeLevel: "3rd_sec",
    accessScope: "single_unit",
    targetUnitId: "u_sec_3_1",
    durationDays: 14,
    isUsed: false,
    batchLabel: "كارت الوحدة الأولى - Read all about it",
  },
  {
    id: "v-004",
    code: "PRO-EXAM-99",
    gradeLevel: "3rd_sec",
    accessScope: "exam_pack",
    durationDays: 60,
    isUsed: false,
    batchLabel: "باقة بنك الامتحانات الشاملة",
  },
  {
    id: "v-005",
    code: "PRO-PREP-33",
    gradeLevel: "3rd_prep",
    accessScope: "full_month",
    durationDays: 30,
    isUsed: false,
    batchLabel: "كروت الشهادة الإعدادية - تيرم أول",
  },
];

// 2. SEED ESSAY TOPICS
export const SEED_ESSAY_TOPICS: EssayTopicSeed[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    gradeLevel: "3rd_sec",
    titleEn: "The Role of Youth in Sustainable Development and National Megaprojects",
    titleAr: "دور الشباب في التنمية المستدامة والمشروعات القومية الكبرى",
    minWords: 180,
    ideaBankAr: [
      "الشباب هم العمود الفقري لأي نهضة تنموية بفضل طاقتهم وإبداعهم وقدرتهم على التكيف السريع.",
      "المشروعات القومية في مصر (العاصمة الإدارية، محطات الطاقة المتجددة، استصلاح الأراضي، وحياة كريمة) تفتح آفاقاً غير مسبوقة للكوادر الشابة.",
      "دور التحول الرقمي والتكنولوجيا الخضراء وريادة الأعمال في تعزيز نمو الاقتصاد المستدام.",
      "واجب الدولة والمجتمع في توفير بيئة تعليمية ومهنية متقدمة تمكن الشباب من المنافسة الدولية.",
    ],
    helperVocab: [
      { word: "cornerstone", meaningAr: "حجر زاوية / ركيزة أساسية" },
      { word: "sustainable development", meaningAr: "التنمية المستدامة" },
      { word: "megaprojects", meaningAr: "المشروعات القومية العملاقة" },
      { word: "entrepreneurship", meaningAr: "ريادة الأعمال" },
      { word: "pave the way", meaningAr: "يمهد الطريق نحو النجاح" },
      { word: "digital transformation", meaningAr: "التحول الرقمي" },
      { word: "unwavering determination", meaningAr: "عزيمة لا تلين" },
    ],
    modelEssay:
      "Youth represent the driving force and heartbeat of any thriving nation. In modern Egypt, young citizens constitute more than sixty percent of the population, transforming them into an indispensable cornerstone for sustainable development. First and foremost, national megaprojects such as the New Administrative Capital, renewable energy stations in Benban, and the monumental Hayah Karima initiative offer unprecedented horizons for young professionals, engineers, and digital innovators. Furthermore, the advent of digital transformation has motivated countless youth to embrace entrepreneurship, establishing green startups that resolve pressing societal issues while bolstering national economic resilience. In addition to technical competencies, youth bring enthusiastic energy and an innovative mindset necessary to confront global challenges such as climate change and resource scarcity. Consequently, investing in high-quality technical education and vocational training is an imperative national priority. By equipping the upcoming generation with modern linguistic, scientific, and leadership tools, Egypt guarantees that its ambitious Vision 2030 will not only be realized, but also surpassed. In conclusion, empowered youth combined with national vision are the definitive guarantee of an inspiring and self-sufficient future.",
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    gradeLevel: "3rd_sec",
    titleEn: "Artificial Intelligence in Modern Education: Opportunities and Ethical Challenges",
    titleAr: "الذكاء الاصطناعي في التعليم الحديث: الفرص الواعدة والتحديات الأخلاقية",
    minWords: 180,
    ideaBankAr: [
      "تخصيص مسارات التعلم التكيفي لكل طالب حسب وتيرته وسرعة استيعابه.",
      "توفير بيئات تدريب افتراضية ومعلمين أذكياء متاحين على مدار الساعة.",
      "خطر الاعتماد السلبي المفرط وتراجع مهارات التفكير التحليلي والأصالة الفكرية.",
      "ضرورة الحفاظ على النزاهة الأكاديمية والخصوصية ووضع أطر أخلاقية حاسمة.",
    ],
    helperVocab: [
      { word: "personalized learning", meaningAr: "التعلم المخصص وفق حاجة الطالب" },
      { word: "unprecedented revolution", meaningAr: "ثورة تعليمية غير مسبوقة" },
      { word: "critical thinking", meaningAr: "التفكير النقدي والتحليلي" },
      { word: "academic integrity", meaningAr: "النزاهة والأمانة الأكاديمية" },
      { word: "double-edged sword", meaningAr: "سلاح ذو حدين" },
      { word: "ethical boundaries", meaningAr: "الحدود والضوابط الأخلاقية" },
      { word: "cognitive growth", meaningAr: "النمو المعرفي والذهني" },
    ],
    modelEssay:
      "Artificial intelligence has sparked an unprecedented revolution across the global educational landscape. As intelligent algorithms integrate into daily classroom routines, they present tremendous educational opportunities paired with complex ethical dilemmas. On the positive side, AI-powered systems facilitate truly personalized learning. Students no longer have to adhere strictly to a uniform pace; rather, adaptive learning platforms analyze individual weaknesses, generating tailored explanations and targeted drills to ensure complete subject mastery. Moreover, round-the-clock intelligent tutoring democratizes access to exceptional academic support regardless of geographic or financial constraints. On the other hand, artificial intelligence remains a genuine double-edged sword. Over-reliance on automated generative tools can severely undermine genuine critical thinking, analytical reasoning, and originality. When learners delegate essay writing and problem solving to algorithms, their organic cognitive growth is inevitably compromised. Furthermore, preserving academic integrity and protecting sensitive personal data require robust legislative frameworks and proactive institutional monitoring. In conclusion, artificial intelligence should be embraced not as a replacement for human educators, but as a powerful catalyst to augment student potential within strictly guided ethical boundaries.",
  },
];

// 3. SEED VOCABULARY FLASHCARDS (3rd Secondary Units 1 & 2)
export const SEED_VOCAB_CARDS: VocabCardSeed[] = [
  {
    id: "v1000000-0000-0000-0000-000000000001",
    gradeLevel: "3rd_sec",
    unitName: "Unit 1: Read all about it",
    word: "piracy",
    partOfSpeech: "noun",
    meaningAr: "القرصنة الإلكترونية أو الأدبية",
    exampleEn: "Digital piracy violates intellectual property and deprives authors of their rights.",
    synonyms: ["copyright infringement", "bootlegging", "theft"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000002",
    gradeLevel: "3rd_sec",
    unitName: "Unit 1: Read all about it",
    word: "casualty",
    partOfSpeech: "noun",
    meaningAr: "ضحية أو مصاب في حادث أو معركة",
    exampleEn: "The severe road accident resulted in no human casualties thanks to safety airbags.",
    synonyms: ["victim", "fatality", "loss"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000003",
    gradeLevel: "3rd_sec",
    unitName: "Unit 1: Read all about it",
    word: "compensate",
    partOfSpeech: "verb",
    meaningAr: "يعوّض مالياً أو معنوياً عن خسارة",
    exampleEn: "The insurance enterprise promised to compensate the factory owner for the damage.",
    synonyms: ["reimburse", "repay", "make up for"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000004",
    gradeLevel: "3rd_sec",
    unitName: "Unit 1: Read all about it",
    word: "investigate",
    partOfSpeech: "verb",
    meaningAr: "يتحرى أو يحقق في ملابسات قضية",
    exampleEn: "Detectives were dispatched to investigate the cause of the sudden power failure.",
    synonyms: ["examine", "probe", "inspect"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000005",
    gradeLevel: "3rd_sec",
    unitName: "Unit 1: Read all about it",
    word: "spin",
    partOfSpeech: "noun / verb",
    meaningAr: "توجيه / تحريف المعنى لإبراز جانب محدد",
    exampleEn: "Tabloid editors often put a positive spin on controversial celebrity news.",
    synonyms: ["bias", "slant", "twist"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000006",
    gradeLevel: "3rd_sec",
    unitName: "Unit 1: Read all about it",
    word: "omission",
    partOfSpeech: "noun",
    meaningAr: "إغفال أو حذف متعمد للمعلومات",
    exampleEn: "Bias by omission occurs when journalists intentionally leave out crucial facts.",
    synonyms: ["exclusion", "deletion", "neglect"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000007",
    gradeLevel: "3rd_sec",
    unitName: "Unit 2: Her story",
    word: "prejudice",
    partOfSpeech: "noun",
    meaningAr: "التحيز غير العادل أو التعصب المسبق",
    exampleEn: "Dr. Aisha Abd El-Rahman challenged academic prejudice against female authors.",
    synonyms: ["bias", "discrimination", "preconception"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000008",
    gradeLevel: "3rd_sec",
    unitName: "Unit 2: Her story",
    word: "stereotype",
    partOfSpeech: "noun",
    meaningAr: "صورة نمطية أو فكرة قولبية جامدة",
    exampleEn: "We must discard the outdated stereotype that girls cannot excel in physics.",
    synonyms: ["conventional image", "cliché", "label"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000009",
    gradeLevel: "3rd_sec",
    unitName: "Unit 2: Her story",
    word: "contribution",
    partOfSpeech: "noun",
    meaningAr: "إسهام أو مشاركة فعالة",
    exampleEn: "Scientists made an invaluable contribution to the development of new vaccines.",
    synonyms: ["input", "donation", "addition"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000010",
    gradeLevel: "3rd_sec",
    unitName: "Unit 2: Her story",
    word: "pharmacist",
    partOfSpeech: "noun",
    meaningAr: "صيدلي متخصص في تحضير وتوزيع الدواء",
    exampleEn: "The pharmacist explained the exact dosage schedule to the elderly patient.",
    synonyms: ["chemist", "druggist", "apothecary"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000011",
    gradeLevel: "3rd_sec",
    unitName: "Unit 2: Her story",
    word: "inspire",
    partOfSpeech: "verb",
    meaningAr: "يُلهم أو يبث الحماس في نفوس الآخرين",
    exampleEn: "Mr. Habib El Rahman aims to inspire all students to attain full marks in English.",
    synonyms: ["motivate", "encourage", "stimulate"],
  },
  {
    id: "v1000000-0000-0000-0000-000000000012",
    gradeLevel: "3rd_sec",
    unitName: "Unit 2: Her story",
    word: "overcome",
    partOfSpeech: "verb",
    meaningAr: "يتغلب على الصعاب أو العقبات",
    exampleEn: "With perseverance and continuous practice, any learner can overcome grammar pitfalls.",
    synonyms: ["conquer", "defeat", "surmount"],
  },
];

// 4. SEED FULL MOCK EXAM FOR 3RD SECONDARY
export const SEED_MOCK_EXAM: MockExamSeed = {
  id: "m1000000-0000-0000-0000-000000000001",
  title: "نموذج امتحان الثانوية العامة الشامل التجريبي — مستر حبيب الرحمن 2026/2027",
  gradeLevel: "3rd_sec",
  durationMinutes: 180,
  isPublished: true,
  sections: {
    mcq: [
      {
        id: "mcq_1",
        number: 1,
        question: "A true journalist must avoid bias by __________, such as leaving out key arguments of one party.",
        options: ["spin", "omission", "placement", "fabrication"],
        correctAnswer: "omission",
        explanation: "Bias by omission يعني التحيز عن طريق الحذف والإغفال المتعمد لبعض الحقائق الهامة.",
        points: 1,
      },
      {
        id: "mcq_2",
        number: 2,
        question: "By the time the ambulance arrived at the scene, the injured passengers __________ first aid.",
        options: ["had received", "have received", "are receiving", "received"],
        correctAnswer: "had received",
        explanation: "الحدث الأسبق في الماضي قبل 'arrived' يكون في زمن الماضي التام Past Perfect.",
        points: 1,
      },
      {
        id: "mcq_3",
        number: 3,
        question: "Dr. Aisha Abd El-Rahman's impressive career helped defy conventional gender __________.",
        options: ["stereotypes", "innovations", "monuments", "sanctions"],
        correctAnswer: "stereotypes",
        explanation: "Gender stereotypes تعني الصور النمطية القولبية المرتبطة بالنوع الاجتماعي.",
        points: 1,
      },
      {
        id: "mcq_4",
        number: 4,
        question: "I remember __________ that scenic film at the cinema five years ago; it was unforgettable.",
        options: ["to watch", "watching", "watched", "watch"],
        correctAnswer: "watching",
        explanation: "الفعل remember متبوعاً بـ gerund (-ing) يعني تذكر حدث تم بالفعل في الماضي.",
        points: 1,
      },
    ],
    passage: {
      title: "The Architecture of Deep Sleep and Memory Consolidation",
      text: "Sleep is not merely a passive state of rest; rather, it is a dynamic biological process essential for human survival and intellectual vitality. Contemporary neuroscience reveals that during the slow-wave phase of deep sleep, the human brain actively consolidates memories formed throughout the day. Synaptic connections are refined, and redundant neural noise is systematically pruned. Furthermore, chronic sleep deprivation severely impairs the prefrontal cortex, reducing cognitive agility and emotional resilience. For students striving for academic mastery, consistent sleep hygiene is just as indispensable as active studying.",
      questions: [
        {
          id: "pas_1",
          number: 5,
          question: "What is the primary function of slow-wave deep sleep discussed in the text?",
          options: [
            "Consolidating memory and pruning redundant noise",
            "Stopping all brain neural activities",
            "Generating subconscious dream scenarios",
            "Increasing immediate emotional reactions",
          ],
          correctAnswer: "Consolidating memory and pruning redundant noise",
          explanation: "القطعة تنص صراحة: 'actively consolidates memories formed throughout the day ... redundant neural noise is systematically pruned'.",
          points: 2,
        },
        {
          id: "pas_2",
          number: 6,
          question: "The word 'pruned' in paragraph 1 is closest in meaning to:",
          options: ["trimmed and removed", "expanded exponentially", "memorized verbatim", "celebrated"],
          correctAnswer: "trimmed and removed",
          explanation: "Prune يعني يقلم أو يزيل الزوائد والضوضاء العصبية غير الضرورية.",
          points: 2,
        },
      ],
    },
    translation: [
      {
        id: "tr_1",
        number: 7,
        direction: "en_to_ar",
        sourceText: "Sustainable economic progress relies on empowering creative youth and establishing green projects.",
        options: [
          "يعتمد التقدم الاقتصادي المستدام على تمكين الشباب المبدع وتأسيس المشروعات الخضراء.",
          "يعتمد التقدم الاقتصادي المؤقت على تهميش الشباب وتأسيس مشروعات مربحة.",
          "يقوم النمو التجاري السريع على توظيف العمالة القديمة والمصانع التقليدية.",
          "يتطلب الركود الاقتصادي تشجيع الابتكار الأخضر وتجاهل التنمية المستدامة.",
        ],
        correctAnswer: "يعتمد التقدم الاقتصادي المستدام على تمكين الشباب المبدع وتأسيس المشروعات الخضراء.",
        trapExplanation: "الترجمة الصحيحة والدقيقة لـ 'Sustainable economic progress' هي 'التقدم الاقتصادي المستدام'.",
        points: 2,
      },
      {
        id: "tr_2",
        number: 8,
        direction: "ar_to_en",
        sourceText: "يجب علينا غرس قيم التسامح والأمانة الأكاديمية في نفوس الأجيال الصاعدة.",
        options: [
          "We must instill the values of tolerance and academic integrity in rising generations.",
          "We have to ignore the concepts of tolerance and personal pride in old people.",
          "We must eliminate ethical values and academic dishonesty among young learners.",
          "We should punish students who believe in tolerance and historical truth.",
        ],
        correctAnswer: "We must instill the values of tolerance and academic integrity in rising generations.",
        trapExplanation: "الفعل 'غرس' يُترجم إلى 'instill'، و'الأمانة الأكاديمية' هي 'academic integrity'.",
        points: 2,
      },
    ],
    novel: [
      {
        id: "nov_1",
        number: 9,
        questionEn: "Why did Pip feel guilty after bringing the food and file to the escaped convict in the marshes?",
        modelAnswerEn:
          "Pip was profoundly fond of Joe Gargery, who treated him with pure warmth and sincerity. Pip felt that stealing the file and meat pie from Joe's forge and pantry was a despicable betrayal of Joe's trust, torturing his moral conscience.",
        explanationAr:
          "شعر بيب بالذنب الشديد لأنه سرق من جو جارجري، الشخص الوحيد الذي عامله بحب ولطف، وشعر أن سرقة المبرد وفطيرة اللحم خيانة لثقة جو.",
        points: 2,
      },
    ],
    essay: {
      id: "ess_1",
      promptEn: "Write an essay of about 180 words on: 'How Can Modern Students Harness Digital Technology Responsibly?'",
      promptAr: "اكتب مقالاً من حوالي 180 كلمة حول: كيف يمكن للطلاب المعاصرين توظيف التكنولوجيا الرقمية بمسؤولية؟",
      minWords: 180,
      maxScore: 4,
      rubricPoints: [
        "Clear thesis statement & introductory paragraph",
        "Two balanced body paragraphs with logical transition connectors",
        "Rich academic vocabulary & accurate sentence structures",
        "Concise conclusion summarizing key insights",
      ],
    },
  },
};
