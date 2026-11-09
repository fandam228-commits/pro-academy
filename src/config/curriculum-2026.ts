/**
 * Professional Academy — Official 2026/2027 Egyptian English Curriculum Specification
 * Aligned with Egyptian Ministry of Education & Technical Education (New Hello! & Connect Plus)
 * Grades: First Preparatory to Third Secondary (6 Units + 2 Reviews + Story Corner per grade)
 */

export interface CurriculumUnitSpec {
  unitNumber: number;
  type: "unit" | "review";
  titleAr: string;
  titleEn: string;
  concept?: string;
  part?: "Part One" | "Part Two";
  reviewScope?: string;
  descriptionAr: string;
  descriptionEn: string;
  grammarTopicAr?: string;
  grammarTopicEn?: string;
  readingTopicAr?: string;
  readingTopicEn?: string;
  orderIndex: number;
}

export interface CurriculumStorySpec {
  titleAr: string;
  titleEn: string;
  author: string;
  isConfirmed: boolean;
  statusNoteAr: string;
  descriptionAr: string;
  descriptionEn: string;
  coverImage: string;
  chaptersCount: number;
  sampleChapters: {
    chapterNumber: number;
    titleAr: string;
    titleEn: string;
    summaryAr: string;
    summaryEn: string;
  }[];
}

export interface CurriculumGradeSpec {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  stage: "Preparatory" | "Secondary";
  descriptionAr: string;
  descriptionEn: string;
  courseId: string;
  units: CurriculumUnitSpec[];
  story: CurriculumStorySpec;
}

export const CURRICULUM_2026_GRADES: CurriculumGradeSpec[] = [
  // =========================================================================
  // 1. FIRST PREPARATORY (الصف الأول الإعدادي)
  // =========================================================================
  {
    id: "grade_prep_1",
    code: "prep_1",
    titleAr: "الصف الأول الإعدادي",
    titleEn: "First Preparatory",
    stage: "Preparatory",
    descriptionAr: "المنهج المطور للغة الإنجليزية 2026/2027: 6 وحدات ومراجعتين وقصة الفصل الدراسي السحري (The Magic Classroom).",
    descriptionEn: "First Preparatory 2026/2027 syllabus: 6 Units, 2 Reviews, and The Magic Classroom story.",
    courseId: "crs_prep_1",
    units: [
      {
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: الحياة في عالم رقمي",
        titleEn: "Unit 1: Life in a Digital World",
        descriptionAr: "التعامل الذكي مع التكنولوجيا، ومفردات الإنترنت والتطبيقات، وقواعد المضارع البسيط والمستمر.",
        descriptionEn: "Digital life, internet vocabulary, and present simple vs continuous rules.",
        grammarTopicAr: "المضارع البسيط والمضارع المستمر والتعبير عن العادات",
        grammarTopicEn: "Present Simple & Present Continuous",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        titleAr: "الوحدة الثانية: تعلم كيف تتعلم",
        titleEn: "Unit 2: Learn How to Learn",
        descriptionAr: "استراتيجيات المذاكرة الفعالة وتنظيم الوقت، وأفعال المصدر والجيراند (Gerund & Infinitive).",
        descriptionEn: "Study strategies, learning habits, verbs followed by -ing and infinitives.",
        grammarTopicAr: "أفعال المصدر والاسم المشتق (Gerunds & Infinitives)",
        grammarTopicEn: "Gerunds vs Infinitives",
        orderIndex: 2,
      },
      {
        unitNumber: 3,
        type: "unit",
        titleAr: "الوحدة الثالثة: القدوة الحسنة",
        titleEn: "Unit 3: Role Models",
        descriptionAr: "الشخصيات الملهمة في تاريخ مصر والعالم، وصفات القادة، وقواعد زمن الماضي البسيط والماضي المستمر.",
        descriptionEn: "Inspiring figures, leadership traits, and past simple vs continuous narratives.",
        grammarTopicAr: "الماضي البسيط والماضي المستمر وأدوات الربط (When / While)",
        grammarTopicEn: "Past Simple & Past Continuous with When/While",
        orderIndex: 3,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الأولى (Units 1–3) — الأول الإعدادي",
        titleEn: "Review 1 (Units 1–3) — First Preparatory",
        reviewScope: "Units 1–3",
        descriptionAr: "مراجعة مجمعة شاملة على الكلمات والقواعد والمهارات للوحدات 1 و 2 و 3 مع امتحان مجمع.",
        descriptionEn: "Consolidated review of Units 1–3 with comprehensive test.",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        titleAr: "الوحدة الرابعة: خيارات ذكية",
        titleEn: "Unit 4: Smart Choices",
        descriptionAr: "اتخاذ القرارات المالية والصحية الرشيدة، وقواعد المقارنة والتفضيل (Comparatives & Superlatives).",
        descriptionEn: "Financial literacy, healthy choices, and comparative/superlative structures.",
        grammarTopicAr: "صيغ المقارنة والتفضيل بين الصفات القصيرة والطويلة",
        grammarTopicEn: "Comparative & Superlative Adjectives",
        orderIndex: 5,
      },
      {
        unitNumber: 5,
        type: "unit",
        titleAr: "الوحدة الخامسة: أحلام المستقبل",
        titleEn: "Unit 5: Future Dreams",
        descriptionAr: "وظائف المستقبل، الذكاء الاصطناعي، وأشكال التعبير عن المستقبل (will / going to / present continuous).",
        descriptionEn: "Future careers, AI developments, and expressing the future in English.",
        grammarTopicAr: "أشكال المستقبل (Will vs Going to vs Present Continuous)",
        grammarTopicEn: "Future Forms (Will, Going to, Present Continuous)",
        orderIndex: 6,
      },
      {
        unitNumber: 6,
        type: "unit",
        titleAr: "الوحدة السادسة: مواطنون عالميون",
        titleEn: "Unit 6: Global Citizens",
        descriptionAr: "المسؤولية المجتمعية والبيئية، الثقافات المشتركة، والأفعال الناقصة للالتزام والنصيحة (Must / Should).",
        descriptionEn: "Social responsibility, eco-citizenship, and modals of obligation/advice.",
        grammarTopicAr: "الأفعال الناقصة للإلزام والنصيحة (Must, Have to, Should)",
        grammarTopicEn: "Modals of Obligation & Recommendation",
        orderIndex: 7,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الثانية والنهائية (Units 4–6) — الأول الإعدادي",
        titleEn: "Review 2 (Units 4–6) — First Preparatory",
        reviewScope: "Units 4–6",
        descriptionAr: "مراجعة ختامية على الوحدات 4 و 5 و 6 مع اختبار شامل للترم.",
        descriptionEn: "Final comprehensive review and term test for Units 4–6.",
        orderIndex: 8,
      },
    ],
    story: {
      titleAr: "الفصل الدراسي السحري (The Magic Classroom)",
      titleEn: "The Magic Classroom",
      author: "Ministry of Education",
      isConfirmed: true,
      statusNoteAr: "القصة المعتمدة رسمياً للصف الأول الإعدادي",
      descriptionAr: "مغامرة تربوية شائقة داخل فصل دراسي مبتكر يكتشف فيه الطلاب متعة التعلم والعمل الجماعي وحل المشكلات غير التقليدية.",
      descriptionEn: "An engaging educational adventure highlighting collaborative problem solving and modern learning.",
      coverImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 4,
      sampleChapters: [
        {
          chapterNumber: 1,
          titleAr: "الفصل الأول: الباب الغامض في نهاية الممر",
          titleEn: "Chapter 1: The Mysterious Doorway",
          summaryAr: "يصل زياد ومريم إلى المدرسة في أول أيام العام ليلحظا باباً غير معتاد يحمل لافتة مضيئة تدعوهم لتجربة تعليمية مختلفة كلياً.",
          summaryEn: "Ziad and Mariam discover an unusual glowing classroom door leading to interactive learning wonders.",
        },
        {
          chapterNumber: 2,
          titleAr: "الفصل الثاني: السفر عبر الزمن والأماكن",
          titleEn: "Chapter 2: Virtual Horizons",
          summaryAr: "يتحول الفصل الذكي إلى بيئات تاريخية وعلمية تفاعلية تتطلب من الطلاب تطبيق المفردات والمفاهيم باللغة الإنجليزية لاجتياز التحدي.",
          summaryEn: "The interactive classroom transforms into historical and scientific realms where teamwork unlocks clues.",
        },
      ],
    },
  },

  // =========================================================================
  // 2. SECOND PREPARATORY (الصف الثاني الإعدادي)
  // =========================================================================
  {
    id: "grade_prep_2",
    code: "prep_2",
    titleAr: "الصف الثاني الإعدادي",
    titleEn: "Second Preparatory",
    stage: "Preparatory",
    descriptionAr: "المنهج المطور للغة الإنجليزية 2026/2027: 6 وحدات ومراجعتين (جيل ألفا، الأثر الرقمي، مواجهة التحديات).",
    descriptionEn: "Second Preparatory 2026/2027 syllabus: 6 Units, 2 Reviews, Gen Alpha, Digital Footprints & Innovations.",
    courseId: "crs_prep_2",
    units: [
      {
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: جيل ألفا",
        titleEn: "Unit 1: Gen Alpha",
        descriptionAr: "جيل الألفية والتواصل الذكي، التغيرات المجتمعية، وقواعد المقارنة وصيغ المضارع التام.",
        descriptionEn: "Gen Alpha culture, digital childhood, and present perfect fundamentals.",
        grammarTopicAr: "المضارع التام مع (Just, Already, Yet)",
        grammarTopicEn: "Present Perfect with Just, Already, Yet",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        titleAr: "الوحدة الثانية: أثري الرقمي",
        titleEn: "Unit 2: My Digital Footprint",
        descriptionAr: "الأمان السيبراني، الخصوصية على الإنترنت، والجمل الشرطية (Zero & First Conditionals).",
        descriptionEn: "Cyber safety, online privacy, and zero & first conditionals.",
        grammarTopicAr: "الحالة الصفرية والأولى من If الشرطية",
        grammarTopicEn: "Zero & First Conditional Clauses",
        orderIndex: 2,
      },
      {
        unitNumber: 3,
        type: "unit",
        titleAr: "الوحدة الثالثة: مواجهة التحديات",
        titleEn: "Unit 3: Facing Challenges",
        descriptionAr: "تحديات المراهقين وتخطي العقبات، الإصرار والنجاح، وقواعد الماضي التام البسيط.",
        descriptionEn: "Overcoming adversity, resilience, and past perfect simple introductions.",
        grammarTopicAr: "الماضي التام وأدوات الربط الزمنية (Before / After / By the time)",
        grammarTopicEn: "Past Perfect with Time Conjunctions",
        orderIndex: 3,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الأولى (Units 1–3) — الثاني الإعدادي",
        titleEn: "Review 1 (Units 1–3) — Second Preparatory",
        reviewScope: "Units 1–3",
        descriptionAr: "مراجعة شاملة على الوحدات 1 و 2 و 3 وحل تدريبات القواعد والكلمات.",
        descriptionEn: "Comprehensive review of Units 1–3 with grammar mastery drills.",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        titleAr: "الوحدة الرابعة: الفن والتعبير",
        titleEn: "Unit 4: Art and Expression",
        descriptionAr: "الفنون التشكيلية، الموسيقى، التعبير عن المشاعر، والمبني للمجهول في المضارع والماضي البسيط.",
        descriptionEn: "Visual arts, music, creative expression, and present/past passive voice.",
        grammarTopicAr: "المبني للمجهول (Passive Voice: Present & Past Simple)",
        grammarTopicEn: "Passive Voice in Present & Past Simple",
        orderIndex: 5,
      },
      {
        unitNumber: 5,
        type: "unit",
        titleAr: "الوحدة الخامسة: حول العالم",
        titleEn: "Unit 5: Around the World",
        descriptionAr: "معالم العالم، السياحة البيئية، الثقافات المتنوعة، وأدوات الوصل (Who, Which, Where, Whose).",
        descriptionEn: "Global wonders, ecotourism, cultural appreciation, and relative pronouns.",
        grammarTopicAr: "ضمائر الوصل (Relative Clauses: Who, Which, Where, Whose)",
        grammarTopicEn: "Defining Relative Clauses",
        orderIndex: 6,
      },
      {
        unitNumber: 6,
        type: "unit",
        titleAr: "الوحدة السادسة: المبتكرون الصغار",
        titleEn: "Unit 6: Young Innovators",
        descriptionAr: "الاختراعات الشبابية، ريادة الأعمال، وحل المشكلات، والحالة الشرطية الثانية (Second Conditional).",
        descriptionEn: "Youth inventions, scientific curiosity, and second conditional sentences.",
        grammarTopicAr: "الحالة الشرطية الثانية والتعبير عن المواقف التخيلية (If I were you)",
        grammarTopicEn: "Second Conditional & Hypothetical Situations",
        orderIndex: 7,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الثانية والنهائية (Units 4–6) — الثاني الإعدادي",
        titleEn: "Review 2 (Units 4–6) — Second Preparatory",
        reviewScope: "Units 4–6",
        descriptionAr: "مراجعة ختامية على الوحدات 4 و 5 و 6 مع تدريبات مجمعة وامتحان شامل.",
        descriptionEn: "Final review of Units 4–6 and comprehensive assessment.",
        orderIndex: 8,
      },
    ],
    story: {
      titleAr: "قصة الصف الثاني الإعدادي (قيد التحقق من الكتاب الرسمي)",
      titleEn: "Second Prep Story (To Be Confirmed)",
      author: "وزارة التربية والتعليم",
      isConfirmed: false,
      statusNoteAr: "متروكة دون اعتماد اسم نهائي لحين التحقق والمطابقة مع الكتاب الرسمي للوزارة كما طلبت التعليمات",
      descriptionAr: "سيتم إدراج القصة المقررة فور استلام ونشر الطبعة الرسمية المعتمدة لكتاب الوزارة للعام 2026/2027.",
      descriptionEn: "Official story will be finalized upon release of the verified official Ministry textbook print.",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 0,
      sampleChapters: [],
    },
  },

  // =========================================================================
  // 3. THIRD PREPARATORY (الصف الثالث الإعدادي - الشهادة الإعدادية)
  // =========================================================================
  {
    id: "grade_prep_3",
    code: "prep_3",
    titleAr: "الصف الثالث الإعدادي (الشهادة الإعدادية)",
    titleEn: "Third Preparatory",
    stage: "Preparatory",
    descriptionAr: "المنهج المطور للشهادة الإعدادية 2026/2027: 6 وحدات ومراجعتين وقصة مشروع حديقة المدرسة (The School Garden Project).",
    descriptionEn: "Third Preparatory Baccalaureate Foundation 2026/2027: 6 Units, 2 Reviews, and The School Garden Project.",
    courseId: "crs_prep_3",
    units: [
      {
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: الهوية الشخصية",
        titleEn: "Unit 1: Personal Identity",
        descriptionAr: "بناء الشخصية والقيم، الثقة بالنفس، ومراجعة أزمنة المضارع والماضي وصياغة الأسئلة.",
        descriptionEn: "Values, self-esteem, character building, and tense contrast mastery.",
        grammarTopicAr: "المضارع التام مع (For & Since) ومقارنته بالماضي البسيط",
        grammarTopicEn: "Present Perfect (Since/For) vs Past Simple",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        titleAr: "الوحدة الثانية: التواصل مع العائلة والأصدقاء",
        titleEn: "Unit 2: Communication with Family and Friends",
        descriptionAr: "العلاقات الإنسانية والتواصل الإيجابي، والصفات المنتهية بـ -ed و -ing، وقواعد Both / Either / Neither.",
        descriptionEn: "Family bonds, interpersonal relations, adjectives ending in -ed/-ing, and correlative conjunctions.",
        grammarTopicAr: "أدوات التوزيع والربط (Both...and, Either...or, Neither...nor, None of)",
        grammarTopicEn: "Both, Either, Neither, and None",
        orderIndex: 2,
      },
      {
        unitNumber: 3,
        type: "unit",
        titleAr: "الوحدة الثالثة: الذكاء الاصطناعي",
        titleEn: "Unit 3: Artificial Intelligence",
        descriptionAr: "تطبيقات الذكاء الاصطناعي في التعليم والطب، والأفعال التقريرية وأزمنة المستقبل المعقدة.",
        descriptionEn: "AI applications in daily life, ethics of automation, and future arrangements.",
        grammarTopicAr: "المستقبل المستمر وصيغ التنبؤ بالأدلة",
        grammarTopicEn: "Future Continuous & Evidential Predictions",
        orderIndex: 3,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الأولى (Units 1–3) — الثالث الإعدادي",
        titleEn: "Review 1 (Units 1–3) — Third Preparatory",
        reviewScope: "Units 1–3",
        descriptionAr: "مراجعة شاملة لمنتصف الفصل الدراسي للشهادة الإعدادية تشمل الكلمات، القواعد، وحل المحادثات.",
        descriptionEn: "Mid-term comprehensive review: vocab, grammar, dialogues & reading comprehension.",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        titleAr: "الوحدة الرابعة: وقت الشاشات",
        titleEn: "Unit 4: Screen Time",
        descriptionAr: "إدارة الوقت والصحة النفسية في عصر السوشيال ميديا، والأفعال الناقصة للاستنتاج (Must / Can't / Might be).",
        descriptionEn: "Digital wellness, managing screen addiction, and modals of deduction.",
        grammarTopicAr: "أفعال الاستنتاج في المضارع والماضي (Must have, Can't have, Might have)",
        grammarTopicEn: "Modals of Deduction (Present & Past)",
        orderIndex: 5,
      },
      {
        unitNumber: 5,
        type: "unit",
        titleAr: "الوحدة الخامسة: التفكير التصميمي",
        titleEn: "Unit 5: Design Thinking",
        descriptionAr: "مهارات الابتكار، خطوات التفكير التصميمي، والمبني للمجهول في مختلف الأزمنة (Passive Mastery).",
        descriptionEn: "Creative problem-solving steps, innovation frameworks, and comprehensive passive structures.",
        grammarTopicAr: "المبني للمجهول مع الأفعال التامة والأفعال الناقصة",
        grammarTopicEn: "Passive Voice in Perfect Tenses & Modals",
        orderIndex: 6,
      },
      {
        unitNumber: 6,
        type: "unit",
        titleAr: "الوحدة السادسة: لماذا نحب القصص",
        titleEn: "Unit 6: Why We Love Stories",
        descriptionAr: "فن السرد الأدبي، تأثير الروايات على العقول، والكلام المباشر وغير المباشر (Reported Speech).",
        descriptionEn: "The power of storytelling, narrative techniques, and reported speech rules.",
        grammarTopicAr: "الكلام المنقول غير المباشر في الجمل الخبرية والأسئلة (Reported Speech)",
        grammarTopicEn: "Reported Statements and Questions",
        orderIndex: 7,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الثانية والنهائية (Units 4–6) — الثالث الإعدادي",
        titleEn: "Review 2 (Units 4–6) — Third Preparatory",
        reviewScope: "Units 4–6",
        descriptionAr: "المراجعة النهائية لامتحان الشهادة الإعدادية: حل امتحانات المحافظات وتدريبات مجمعة.",
        descriptionEn: "Final exam booster for Third Prep students: Governorates exam models & full mock test.",
        orderIndex: 8,
      },
    ],
    story: {
      titleAr: "مشروع حديقة المدرسة (The School Garden Project)",
      titleEn: "The School Garden Project",
      author: "Ministry of Education",
      isConfirmed: true,
      statusNoteAr: "القصة المعتمدة رسمياً للصف الثالث الإعدادي",
      descriptionAr: "قصة ملهمة لمجموعة من طلاب الشهادة الإعدادية يحولون فناء مدرستهم المهمل إلى واحة زراعية مستدامة، متغلبين على التحديات والنزاعات بالتعاون والعلم.",
      descriptionEn: "An inspiring novella about students transforming an abandoned courtyard into a thriving sustainable eco-garden.",
      coverImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 4,
      sampleChapters: [
        {
          chapterNumber: 1,
          titleAr: "الفصل الأول: البقعة المهملة والفكرة الوليدة",
          titleEn: "Chapter 1: The Barren Corner",
          summaryAr: "يجتمع يوسف وندى مع معلم الأحياء في نهاية الفصل الدراسي ليقترحوا تحويل الزاوية المهجورة في فناء المدرسة إلى حديقة نباتات عضوية.",
          summaryEn: "Youssef and Nada propose transforming the neglected school corner into an organic green sanctuary.",
        },
        {
          chapterNumber: 2,
          titleAr: "الفصل الثاني: عقبات التربة ونظام الري الذكي",
          titleEn: "Chapter 2: Water Scarcity & Smart Irrigation",
          summaryAr: "يواجه الفريق نقص المياه وملوحة التربة، فيصممون بالتعاون مع أستاذ الفيزياء نظام ري بالتنقيط يعمل بالطاقة الشمسية.",
          summaryEn: "Facing poor soil and water scarcity, the team designs a recycled solar-powered drip irrigation system.",
        },
      ],
    },
  },

  // =========================================================================
  // 4. FIRST SECONDARY (الصف الأول الثانوي)
  // =========================================================================
  {
    id: "grade_sec_1",
    code: "sec_1",
    titleAr: "الصف الأول الثانوي",
    titleEn: "First Secondary",
    stage: "Secondary",
    descriptionAr: "منهج الصف الأول الثانوي المطور 2026/2027: 6 وحدات ومراجعتين وقصة العجوز والبحر (The Old Man and the Sea) لإرنست همنغواي.",
    descriptionEn: "First Secondary 2026/2027 syllabus: 6 Units, 2 Reviews, and Ernest Hemingway's The Old Man and the Sea.",
    courseId: "crs_sec_1",
    units: [
      {
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: تراث مصر",
        titleEn: "Unit 1: Egypt's Heritage",
        descriptionAr: "الحضارة المصرية والآثار القديمة، الحفاظ على الهوية الوطنية، وقواعد الماضي البسيط والماضي المستمر واعتاد أن (used to).",
        descriptionEn: "Egyptian heritage preservation, national identity, past habits (used to / would), and past narrative tenses.",
        grammarTopicAr: "الماضي البسيط والتعبير عن العادات السابقة (Past Simple & Used to / Would)",
        grammarTopicEn: "Past Simple, Past Continuous & Past Habits (Used to)",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        titleAr: "الوحدة الثانية: أيدٍ تساعد، قلوب ترعى",
        titleEn: "Unit 2: Hands Help, Hearts Care",
        descriptionAr: "العمل التطوعي والخيري، التبرع بالدم والرعاية الصحية، وزمن المضارع التام والمضارع التام المستمر.",
        descriptionEn: "Volunteering, community care, blood donation, and present perfect vs present perfect continuous.",
        grammarTopicAr: "المضارع التام البسيط والمضارع التام المستمر (Present Perfect Simple & Continuous)",
        grammarTopicEn: "Present Perfect Simple vs Present Perfect Continuous",
        orderIndex: 2,
      },
      {
        unitNumber: 3,
        type: "unit",
        titleAr: "الوحدة الثالثة: الحقيقة مقابل الأكاذيب",
        titleEn: "Unit 3: Truth Vs. Lies",
        descriptionAr: "مكافحة التضليل والشائعات على وسائل التواصل، التفكير النقدي، وأزمنة الماضي التام والماضي التام المستمر.",
        descriptionEn: "Fact checking, media literacy, rumors, and past perfect simple vs past perfect continuous.",
        grammarTopicAr: "الماضي التام والماضي التام المستمر والروابط الزمنية (Having + p.p, No sooner)",
        grammarTopicEn: "Past Perfect Simple & Past Perfect Continuous with Inversions",
        orderIndex: 3,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الأولى (Units 1–3) — الأول الثانوي",
        titleEn: "Review 1 (Units 1–3) — First Secondary",
        reviewScope: "Units 1–3",
        descriptionAr: "مراجعة شاملة للوحدات 1 إلى 3: تراث مصر، التطوع، ومكافحة الشائعات، مع امتحان تقييم نصفي.",
        descriptionEn: "Mid-term consolidated review of Units 1–3 with comprehensive exam.",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        titleAr: "الوحدة الرابعة: ادخر وتألق",
        titleEn: "Unit 4: Save and Shine",
        descriptionAr: "الثقافة المالية والاستثمار للشباب، وأدوات النكرة والمعرفة والأسماء المعدودة وغير المعدودة (Articles & Quantifiers).",
        descriptionEn: "Youth financial literacy, smart investments, countable/uncountable nouns, and definite/indefinite articles.",
        grammarTopicAr: "الأسماء المعدودة وغير المعدودة وأدوات التعريف (A, An, The, Quantifiers: Much, Many, Little, Few)",
        grammarTopicEn: "Countable & Uncountable Nouns and Articles",
        orderIndex: 5,
      },
      {
        unitNumber: 5,
        type: "unit",
        titleAr: "الوحدة الخامسة: استخدام التكنولوجيا في المدارس",
        titleEn: "Unit 5: Using Technology at Schools",
        descriptionAr: "التحول الرقمي في التعليم المصري، بنك المعرفة والشاشات الذكية، وأشكال التعبير عن المستقبل.",
        descriptionEn: "EdTech in Egyptian schools, interactive tablets, and the full spectrum of future forms.",
        grammarTopicAr: "أشكال المستقبل (Will, Going to, Present Continuous, Future Perfect)",
        grammarTopicEn: "Advanced Future Forms & Future Perfect",
        orderIndex: 6,
      },
      {
        unitNumber: 6,
        type: "unit",
        titleAr: "الوحدة السادسة: البحث عن وظيفة",
        titleEn: "Unit 6: Job Hunting",
        descriptionAr: "سوق العمل، كتابة السيرة الذاتية (CV)، مقابلات العمل، والأفعال المتعدية وحروف الجر (Phrasal Verbs).",
        descriptionEn: "The modern job market, professional CV writing, interview skills, and transitive/intransitive phrasal verbs.",
        grammarTopicAr: "الأفعال الاصطلاحية وحروف الجر الخاصة (Separable & Inseparable Phrasal Verbs)",
        grammarTopicEn: "Phrasal Verbs & Dependent Prepositions",
        orderIndex: 7,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الثانية والنهائية (Units 4–6) — الأول الثانوي",
        titleEn: "Review 2 (Units 4–6) — First Secondary",
        reviewScope: "Units 4–6",
        descriptionAr: "مراجعة ختامية لمنهج الصف الأول الثانوي كاملاً مع نماذج امتحانات مطابقة للمواصفات الامتحانية.",
        descriptionEn: "Final revision of Units 4–6 with full mock examination conforming to ministry specifications.",
        orderIndex: 8,
      },
    ],
    story: {
      titleAr: "العجوز والبحر (The Old Man and the Sea)",
      titleEn: "The Old Man and the Sea",
      author: "Ernest Hemingway",
      isConfirmed: true,
      statusNoteAr: "الرواية المقررة رسمياً للصف الأول الثانوي",
      descriptionAr: "تحفة إرنست همنغواي الحائزة على نوبل: صراع الصياد الكوبي العجوز سانتياغو في عرض البحر مع سمكة المارلين العملاقة، ودروس الصمود والكرامة والانتصار الروحي.",
      descriptionEn: "Ernest Hemingway's Nobel prize-winning masterpiece of endurance, dignity, and Santiago's epic maritime struggle.",
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 4,
      sampleChapters: [
        {
          chapterNumber: 1,
          titleAr: "الفصل الأول: أربعة وثمانون يوماً في عرض البحر",
          titleEn: "Chapter 1: Eighty-Four Days at Sea",
          summaryAr: "يمر الصياد العجوز سانتياغو بأربعة وثمانين يوماً دون صيد سمكة واحدة، لكنه يرفض اليأس ويحظى بوفاء ومحبة الصبي مانولين.",
          summaryEn: "Santiago's eighty-four day streak without a fish, his enduring bond with young Manolin, and his preparations.",
        },
        {
          chapterNumber: 2,
          titleAr: "الفصل الثاني: الصيد العظيم والمارلين العملاق",
          titleEn: "Chapter 2: The Great Marlin Takes the Bait",
          summaryAr: "يبحر سانتياغو منفرداً إلى المياه العميقة في تيار الخليج حيث تعلق بصنارته سمكة مارلين أضخم من قاربه، لتبدأ معركة الصبر والكرامة.",
          summaryEn: "Far out in the Gulf Stream, a massive marlin bites Santiago's line, beginning a grueling two-day test of strength.",
        },
      ],
    },
  },

  // =========================================================================
  // 5. SECOND SECONDARY (الصف الثاني الثانوي)
  // =========================================================================
  {
    id: "grade_sec_2",
    code: "sec_2",
    titleAr: "الصف الثاني الثانوي",
    titleEn: "Second Secondary",
    stage: "Secondary",
    descriptionAr: "منهج الصف الثاني الثانوي المطور 2026/2027: 6 وحدات ومراجعتين ورواية حول العالم في ثمانين يوماً (Around the World in Eighty Days).",
    descriptionEn: "Second Secondary 2026/2027 syllabus: 6 Units, 2 Reviews, and Jules Verne's Around the World in Eighty Days.",
    courseId: "crs_sec_2",
    units: [
      {
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: التعاون المصري الأفريقي",
        titleEn: "Unit 1: Egypt-Africa Cooperation",
        descriptionAr: "الروابط التاريخية والاقتصادية مع القارة الأفريقية، مشروعات النقل والتجارة، وقواعد الإلزام والضرورة (Must / Have to / Needn't).",
        descriptionEn: "Pan-African trade, infrastructure projects, and modals of necessity, obligation, and prohibition.",
        grammarTopicAr: "أفعال الضرورة والإلزام والمنع (Necessity, Obligation & Prohibition)",
        grammarTopicEn: "Modals of Necessity (Must, Have to, Needn't, Mustn't)",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        titleAr: "الوحدة الثانية: الشركات الناشئة ورواد الأعمال الشباب",
        titleEn: "Unit 2: Startups & Young Entrepreneurs",
        descriptionAr: "اقتصاد المعرفة، تأسيس الشركات الناشئة، دراسات الجدوى، وقواعد صيغ المقارنة المتقدمة (Double Comparatives).",
        descriptionEn: "Entrepreneurship, venture capital, incubators, and advanced comparative structures (the more... the more).",
        grammarTopicAr: "المقارنات المتدرجة والمزدوجة (The more..., the more... & Progressive Comparatives)",
        grammarTopicEn: "Advanced Comparison Structures",
        orderIndex: 2,
      },
      {
        unitNumber: 3,
        type: "unit",
        titleAr: "الوحدة الثالثة: أهداف التنمية المستدامة (SDG)",
        titleEn: "Unit 3: Sustainable Development Goals (SDG)",
        descriptionAr: "أهداف الأمم المتحدة 2030، الطاقة النظيفة ومكافحة الفقر والجوع، وأزمنة المستقبل التام والمستقبل المستمر.",
        descriptionEn: "UN 2030 Agenda, clean energy, zero hunger, future perfect and future continuous tenses.",
        grammarTopicAr: "المستقبل التام والمستقبل المستمر (Future Perfect & Future Continuous)",
        grammarTopicEn: "Future Perfect vs Future Continuous",
        orderIndex: 3,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الأولى (Units 1–3) — الثاني الثانوي",
        titleEn: "Review 1 (Units 1–3) — Second Secondary",
        reviewScope: "Units 1–3",
        descriptionAr: "مراجعة مجمعة شاملة على الوحدات 1 إلى 3 مع حل امتحانات متدرجة الصعوبة.",
        descriptionEn: "Mid-term consolidated review of Units 1–3 with progressive challenge tests.",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        titleAr: "الوحدة الرابعة: الكوارث الطبيعية",
        titleEn: "Unit 4: Natural Disasters",
        descriptionAr: "الزلازل والأعاصير والتغير المناخي، الاستجابة السريعة للطوارئ، وقواعد الكلام المنقول والأسئلة غير المباشرة.",
        descriptionEn: "Earthquakes, tsunamis, disaster relief, reported statements, and indirect questions.",
        grammarTopicAr: "الكلام المنقول وأوامر ونواهي الكلام غير المباشر (Reported Speech: Statements, Orders & Requests)",
        grammarTopicEn: "Reported Speech with Reporting Verbs",
        orderIndex: 5,
      },
      {
        unitNumber: 5,
        type: "unit",
        titleAr: "الوحدة الخامسة: التضليل والتلاعب الإعلامي",
        titleEn: "Unit 5: Media Manipulation",
        descriptionAr: "الدعاية المضللة، التزييف العميق (Deepfake)، خوارزميات التوصية، وأدوات الاستنتاج والتمني والندم (Wish / If only).",
        descriptionEn: "Algorithmic bias, deepfake detection, critical thinking, deduction, and wishes/regrets.",
        grammarTopicAr: "التعبير عن الأمنيات والندم (Wish & If only in Present, Past, and Future)",
        grammarTopicEn: "Wishes and Regrets (Wish / If Only)",
        orderIndex: 6,
      },
      {
        unitNumber: 6,
        type: "unit",
        titleAr: "الوحدة السادسة: المهارات الشخصية والمهارات المهنية",
        titleEn: "Unit 6: Soft Skills Vs. Hard Skills",
        descriptionAr: "سوق العمل الحديث، العمل الجماعي والتفاوض والبرمجة، وجميع حالات If الشرطية وبدائلها (Conditionals & Alternatives).",
        descriptionEn: "Workplace dynamics, technical acumen vs interpersonal mastery, and all conditional clauses & alternatives.",
        grammarTopicAr: "الحالات الشرطية الأربع وبدائل If (Unless, In case of, But for, Were, Had, Should)",
        grammarTopicEn: "Conditionals (0, 1, 2, 3) & Alternatives to If",
        orderIndex: 7,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الثانية والنهائية (Units 4–6) — الثاني الثانوي",
        titleEn: "Review 2 (Units 4–6) — Second Secondary",
        reviewScope: "Units 4–6",
        descriptionAr: "المراجعة الشاملة لختام العام الدراسي الثاني الثانوي مع نماذج امتحانات متكاملة.",
        descriptionEn: "Final end-of-year review of Units 4–6 with full standardized mock exams.",
        orderIndex: 8,
      },
    ],
    story: {
      titleAr: "حول العالم في ثمانين يوماً (Around the World in Eighty Days)",
      titleEn: "Around the World in Eighty Days",
      author: "Jules Verne",
      isConfirmed: true,
      statusNoteAr: "الرواية المقررة رسمياً للصف الثاني الثانوي",
      descriptionAr: "رواية الخيال والمغامرة الشهيرة لجول فيرن: رهان فيلياس فوج المثير لقطع العالم في 80 يوماً برفقة خادمه باسبارتو ومطاردة المحقق فيكس.",
      descriptionEn: "Jules Verne's timeless classic: Phileas Fogg's 80-day global voyage with Passepartout and Detective Fix.",
      coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 4,
      sampleChapters: [
        {
          chapterNumber: 1,
          titleAr: "الفصل الأول: رهان نادي الإصلاح بلندن",
          titleEn: "Chapter 1: The Reform Club Wager",
          summaryAr: "يدخل فيلياس فوج في رهان بمبلغ عشرين ألف جنيه إسترليني لإثبات إمكانية الدوران حول الأرض في 80 يوماً فقط بفضل التقدم التكنولوجي.",
          summaryEn: "Phileas Fogg wagers £20,000 at the Reform Club that he can circumnavigate the globe in precisely 80 days.",
        },
        {
          chapterNumber: 2,
          titleAr: "الفصل الثاني: السفر عبر السويس والهند ومطاردة فيكس",
          titleEn: "Chapter 2: Through Suez and the Indian Jungles",
          summaryAr: "يعبر فوج وباسبارتو قناة السويس بالباخرة مونغوليا حيث يظنه المحقق فيكس سارق بنك إنجلترا، ثم ينقذون الأميرة أودا في الهند.",
          summaryEn: "Traveling via Suez where Fix suspects Fogg, the travelers rescue Aouda in India using an elephant.",
        },
      ],
    },
  },

  // =========================================================================
  // 6. THIRD SECONDARY (الصف الثالث الثانوي - الشهادة الثانوية العامة)
  // =========================================================================
  {
    id: "grade_sec_3",
    code: "sec_3",
    titleAr: "الصف الثالث الثانوي (الشهادة الثانوية العامة)",
    titleEn: "Third Secondary (Baccalaureate)",
    stage: "Secondary",
    descriptionAr: "المنهج الرسمي المعتمد للثانوية العامة 2026/2027 مع مستر حبيب الرحمن: 6 وحدات، مراجعتين شاملتين، ورواية كونت دي مونت كريستو (The Count of Monte Cristo).",
    descriptionEn: "Official Thanawya Amma 2026/2027 curriculum: 6 Units, 2 Reviews, and Alexandre Dumas's The Count of Monte Cristo.",
    courseId: "crs_sec_3",
    units: [
      {
        unitNumber: 1,
        type: "unit",
        titleAr: "الوحدة الأولى: داخل عالم الرعاية الصحية (Inside the World of Care)",
        titleEn: "Unit 1: Inside the World of Care",
        descriptionAr: "الكوادر الطبية والتمريض، غرف الطوارئ، التضحية الإنسانية، مع إتقان قواعد المضارع التام البسيط والمستمر، وفنون كتابة المقال الأكاديمي.",
        descriptionEn: "Healthcare professions, emergency response, hospital dynamics, present perfect simple vs continuous, and reflective blog writing.",
        grammarTopicAr: "المضارع التام البسيط والمضارع التام المستمر (Present Perfect Simple vs Present Perfect Continuous)",
        grammarTopicEn: "Present Perfect Simple vs Present Perfect Continuous",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        titleAr: "الوحدة الثانية: قوة الآلات (The Power of Machines)",
        titleEn: "Unit 2: The Power of Machines",
        descriptionAr: "الآلات في مصر بين الماضي والحاضر، الأتمتة والروبوتات، وسرد أزمنة الماضي البسيط والماضي المستمر والماضي التام.",
        descriptionEn: "Machines in Egypt past and present, automation risks, past tenses contrast, and narrative sequencing.",
        grammarTopicAr: "أزمنة الماضي السردية (Past Simple, Past Continuous & Past Perfect)",
        grammarTopicEn: "Past Narrative Tenses (Simple, Continuous, Perfect)",
        orderIndex: 2,
      },
      {
        unitNumber: 3,
        type: "unit",
        titleAr: "الوحدة الثالثة: احمِ الطبيعة، احمِ المستقبل (Protect Nature, Protect Future)",
        titleEn: "Unit 3: Protect Nature, Protect Future",
        descriptionAr: "الاستدامة، الطاقة المتجددة، تقليل البصمة الكربونية، والصفات والظروف والصفات المركبة (Adjectives, Adverbs & Compounds).",
        descriptionEn: "Biodiversity, renewable energy, eco-sustainability, comparative idioms, compound adjectives and adverbs.",
        grammarTopicAr: "الصفات والظروف والصفات المركبة (Compound Adjectives, Adverbs & Degree Modifiers)",
        grammarTopicEn: "Adjectives, Compound Adjectives & Adverbs",
        orderIndex: 3,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الشاملة الأولى (Units 1–3) — الثانوية العامة",
        titleEn: "Review 1 (Units 1–3) — Thanawya Amma",
        reviewScope: "Units 1–3",
        descriptionAr: "مراجعة كبرى لنصف المنهج: الرعاية الطبية، الآلات والتكنولوجيا، والبيئة، مع امتحان شامل مطابق لمواصفات البوكليت.",
        descriptionEn: "Major Thanawya Amma mid-year review covering Units 1–3 with standard Baccalaureate booklet exam.",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        titleAr: "الوحدة الرابعة: الحياة البحرية (Marine Life)",
        titleEn: "Unit 4: Marine Life",
        descriptionAr: "الشعاب المرجانية بالبحر الأحمر، حماية المحيطات من التلوث البلاستيكي، وأفعال المصدر والجيراند وأفعال السببية (Causative Verbs).",
        descriptionEn: "Red Sea coral reefs, marine conservation, plastics hazard, gerunds/infinitives with meaning shift, and causative verbs.",
        grammarTopicAr: "أفعال المصدر والجيراند وتغيير المعنى وأفعال السببية (Gerunds, Infinitives & Causative Have/Get)",
        grammarTopicEn: "Verbs with -ing / to-infinitive & Causatives",
        orderIndex: 5,
      },
      {
        unitNumber: 5,
        type: "unit",
        titleAr: "الوحدة الخامسة: من العضلات إلى عقلية التطور (From Muscles to Mindset)",
        titleEn: "Unit 5: From Muscles to Mindset",
        descriptionAr: "اللياقة البدنية، الصحة العقلية، عقلية النمو (Growth Mindset)، وأدوات التوزيع والضمائر غير المحددة (Quantifiers & Determiners).",
        descriptionEn: "Physical resilience, cognitive growth mindset, nutrition, determiners, quantifiers, and article mastery.",
        grammarTopicAr: "المحددات وأدوات التجزئة (Each, Every, All, Half, Either, Neither, Both)",
        grammarTopicEn: "Determiners, Distributives & Quantifiers",
        orderIndex: 6,
      },
      {
        unitNumber: 6,
        type: "unit",
        titleAr: "الوحدة السادسة: لنقضِ وقتاً ممتعاً معاً! (Let's Hang Out!)",
        titleEn: "Unit 6: Let's Hang Out!",
        descriptionAr: "الأنشطة الترفيهية، الصداقة، التوازن بين المذاكرة والترويح عن النفس، والمبني للمجهول المتقدم في كافة التراكيب.",
        descriptionEn: "Social life, leisure balance, youth culture, advanced passive constructions, and impersonal passive (It is said that...).",
        grammarTopicAr: "المبني للمجهول المتقدم والتركيب غير الشخصي (Advanced Passive & Impersonal Structures)",
        grammarTopicEn: "Advanced Passive Voice & Impersonal Reporting",
        orderIndex: 7,
      },
      {
        unitNumber: 0,
        type: "review",
        titleAr: "المراجعة الشاملة الثانية والنهائية (Units 4–6) — الثانوية العامة",
        titleEn: "Review 2 (Units 4–6) — Thanawya Amma",
        reviewScope: "Units 4–6",
        descriptionAr: "المراجعة الختامية الكبرى للثانوية العامة: مراجعة شاملة لجميع القواعد والكلمات مع نماذج امتحانات البوكليت الرسمية.",
        descriptionEn: "Final Thanawya Amma mega revision covering all grammar, translation, and vocabulary with official booklet tests.",
        orderIndex: 8,
      },
    ],
    story: {
      titleAr: "كونت دي مونت كريستو (The Count of Monte Cristo)",
      titleEn: "The Count of Monte Cristo",
      author: "Alexandre Dumas",
      isConfirmed: true,
      statusNoteAr: "الرواية المقررة رسمياً للشهادة الثانوية العامة 2026/2027",
      descriptionAr: "ملحمة ألكسندر دوما الخالدة: قصة البحار الشاب إدموند دانتيس الذي تعرض لمؤامرة غادرة وزُجّ به في سجن قلعة إيف المظلم، ليعود متخفياً بشخصية الكونت الغامض ساعياً لتحقيق العدالة ونصرة المظلومين.",
      descriptionEn: "Alexandre Dumas's literary epic of betrayal, wrongful imprisonment in Château d'If, hidden treasure, and Edmond Dantès's quest for ultimate justice.",
      coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 6,
      sampleChapters: [
        {
          chapterNumber: 1,
          titleAr: "الفصل الأول: وصول السفينة فرعون والمؤامرة الغادرة",
          titleEn: "Chapter 1: The Arrival of The Pharaon & The Betrayal",
          summaryAr: "يعود البحار الشهم إدموند دانتيس إلى مرسيليا كقبطان جديد للسفينة فرعون ومستعداً للزواج من حبيبته مرسيدس، لكن غيرة دانجلارس وفرناند تدفعهما لكتابة رسالة وشاية كاذبة تتهمه بالخيانة لصالح نابليون بونابرت.",
          summaryEn: "Young honest sailor Edmond Dantès returns to Marseille as the new captain, but jealous rivals frame him as a Bonapartist conspirator.",
        },
        {
          chapterNumber: 2,
          titleAr: "الفصل الثاني: قلعة إيف ولقاء الأب فاريا الحكيم",
          titleEn: "Chapter 2: The Château d'If & The Wise Abbé Faria",
          summaryAr: "يُلقى بدانتيس في زنزانة قلعة إيف الانفرادية لسنوات طويلة دون محاكمة، حتى يلتقي بالسجين الإيطالي الحكيم الأب فاريا الذي يعلمه اللغات والعلوم ويكشف له سر كنز جزيرة مونت كريستو الأسطوري.",
          summaryEn: "In the dreaded island prison of Château d'If, Dantès meets the brilliant Abbé Faria who educates him and reveals the secret island treasure.",
        },
        {
          chapterNumber: 3,
          titleAr: "الفصل الثالث: الهروب المثير واستعادة الكنز",
          titleEn: "Chapter 3: The Daring Escape & The Treasure Unearthed",
          summaryAr: "بعد وفاة الأب فاريا، يختبئ دانتيس في كفن القس ويلقى به في البحر، لينجو بأعجوبة ويصل إلى جزيرة مونت كريستو الصخرية ليكتشف كهف الذهب والمجوهرات الخيالية.",
          summaryEn: "Sewn inside Faria's burial sack and hurled into the sea, Edmond escapes, swims to safety, and claims the inexhaustible treasure of Monte Cristo.",
        },
        {
          chapterNumber: 4,
          titleAr: "الفصل الرابع: ظهور الكونت الغامض في باريس",
          titleEn: "Chapter 4: The Count Arrives in Parisian High Society",
          summaryAr: "يظهر دانتيس في صالونات باريس ككونت فاحش الثراء وغامض يثير دهشة الجميع، ويبدأ في كشف الحقائق ومكافأة من وقفوا بجانب والده والقصاص العادل ممن ظلموه.",
          summaryEn: "Reinvented as the enigmatic, fabulously wealthy Count of Monte Cristo, Edmond maneuvers through Parisian society executing justice with mathematical precision.",
        },
      ],
    },
  },

  // =========================================================================
  // 7. SECOND YEAR EGYPTIAN BACCALAUREATE (تانية بكالوريا - البكالوريا المصرية)
  // =========================================================================
  {
    id: "grade_sec_2_bac",
    code: "sec_2_bac",
    titleAr: "تانية بكالوريا (Second Year Egyptian Baccalaureate)",
    titleEn: "Second Year Egyptian Baccalaureate",
    stage: "Secondary",
    descriptionAr: "منهج البكالوريا المصرية المعتمد 2026/2027: 10 وحدات دراسية موزعة على جزأين، 5 مراجعات توطيدية (Consolidation Reviews)، وقصة العالم المفقود (The Lost World) لآرثر كونان دويل.",
    descriptionEn: "Official 2026/2027 Egyptian Baccalaureate Syllabus: 10 Units, 5 Consolidation Reviews, and Arthur Conan Doyle's 'The Lost World'.",
    courseId: "crs_sec_2_bac",
    units: [
      // PART ONE:
      {
        unitNumber: 1,
        type: "unit",
        part: "Part One",
        concept: "Well-being",
        titleAr: "الوحدة الأولى: العيش بشكل جيد في عالم معقد (Living Well in a Complex World)",
        titleEn: "Unit 1: Living Well in a Complex World",
        descriptionAr: "المفهوم الأساسي: الرفاهية وجودة الحياة (Well-being). دراسة العادات الصحية، إدارة الضغوط اليومية، التوازن البدني والنفسي، وتراكيب اللغة المتقدمة.",
        descriptionEn: "Concept: Well-being. Healthy living, stress management, mental-physical balance, and structures for lifestyle discourse.",
        grammarTopicAr: "قواعد وتراكيب جودة الحياة (Language Structures: Living Well)",
        grammarTopicEn: "Language Structures & Well-being",
        readingTopicAr: "نصوص القراءة: أنماط الحياة الصحية وإدارة الضغوط المعاصرة",
        readingTopicEn: "Reading: Holistic Well-being in a Complex World",
        orderIndex: 1,
      },
      {
        unitNumber: 2,
        type: "unit",
        part: "Part One",
        concept: "Experiences",
        titleAr: "الوحدة الثانية: وقت الفراغ والترويح (Leisure Time)",
        titleEn: "Unit 2: Leisure Time",
        descriptionAr: "المفهوم الأساسي: التجارب والخبرات (Experiences). استثمار أوقات الفراغ، الأنشطة الإبداعية، واكتساب المهارات والخبرات المتنوعة.",
        descriptionEn: "Concept: Experiences. Productive recreation, creative leisure, experiential learning, and linguistic expression of experiences.",
        grammarTopicAr: "تراكيب التعبير عن الخبرات والتجارب الحياتية",
        grammarTopicEn: "Structures for Experiences & Leisure",
        readingTopicAr: "نصوص القراءة: ثقافة وقت الفراغ والأنشطة الإثرائية",
        readingTopicEn: "Reading: Enriching Leisure Pursuits",
        orderIndex: 2,
      },
      {
        unitNumber: 0,
        type: "review",
        part: "Part One",
        titleAr: "المراجعة التوطيدية أ (Consolidation Review A — Units 1–2)",
        titleEn: "Consolidation Review A (Units 1–2)",
        reviewScope: "Units 1–2",
        descriptionAr: "مراجعة توطيدية شاملة تغطي مفاهيم وتراكيب الوحدتين 1 و 2 (Well-being & Experiences) مع تمارين وتطبيقات واختبار تقييمي.",
        descriptionEn: "Comprehensive Consolidation Review A covering Units 1–2 (Well-being & Experiences) with interactive test.",
        orderIndex: 3,
      },
      {
        unitNumber: 3,
        type: "unit",
        part: "Part One",
        concept: "Identity",
        titleAr: "الوحدة الثالثة: أصداء من الماضي (Echoes of the Past)",
        titleEn: "Unit 3: Echoes of the Past",
        descriptionAr: "المفهوم الأساسي: الهوية والتاريخ (Identity). استكشاف التراث الثقافي والحضاري وأثر الماضي في بناء الهوية الفردية والوطنية.",
        descriptionEn: "Concept: Identity. Cultural heritage, historical perspectives, and how past echoes shape contemporary individual and national identity.",
        grammarTopicAr: "أزمنة السرد والتعبير عن التراث والهوية التاريخية",
        grammarTopicEn: "Narrative Structures & Historical Identity",
        readingTopicAr: "نصوص القراءة: المعالم التاريخية والتراث الإنساني الخالد",
        readingTopicEn: "Reading: Historical Legacies & Cultural Memory",
        orderIndex: 4,
      },
      {
        unitNumber: 4,
        type: "unit",
        part: "Part One",
        concept: "Consumption and Choice",
        titleAr: "الوحدة الرابعة: قوة الاختيار (The Power of Choice)",
        titleEn: "Unit 4: The Power of Choice",
        descriptionAr: "المفهوم الأساسي: الاستهلاك والاختيار الرشيد (Consumption and Choice). اتخاذ القرارات الواعية في عالم مليء بالخيارات، وسلوكيات المستهلك المسؤول.",
        descriptionEn: "Concept: Consumption and Choice. Conscious consumer decisions, behavioral economics, and the transformative power of informed choices.",
        grammarTopicAr: "صيغ التعبير عن الخيارات والقرارات والنتائج الشرطية",
        grammarTopicEn: "Language Structures for Choice, Modals & Decision Making",
        readingTopicAr: "نصوص القراءة: سيكولوجية اتخاذ القرار وسلوكيات الاستهلاك",
        readingTopicEn: "Reading: Consumer Psychology & The Decision Process",
        orderIndex: 5,
      },
      {
        unitNumber: 0,
        type: "review",
        part: "Part One",
        titleAr: "المراجعة التوطيدية ب (Consolidation Review B — Units 3–4)",
        titleEn: "Consolidation Review B (Units 3–4)",
        reviewScope: "Units 3–4",
        descriptionAr: "مراجعة توطيدية شاملة تغطي الوحدتين 3 و 4 (Identity & Consumption and Choice) مع تدريبات لغوية وامتحان شامل.",
        descriptionEn: "Consolidation Review B covering Units 3–4 with comprehensive language drills.",
        orderIndex: 6,
      },
      {
        unitNumber: 5,
        type: "unit",
        part: "Part One",
        concept: "Sharing the Planet",
        titleAr: "الوحدة الخامسة: ظاهرة الاحتباس الحراري (The Greenhouse Effect)",
        titleEn: "Unit 5: The Greenhouse Effect",
        descriptionAr: "المفهوم الأساسي: كوكبنا المشترك (Sharing the Planet). التغير المناخي، الطاقة المتجددة، والاستدامة البيئية ومسؤوليتنا لحماية الأرض.",
        descriptionEn: "Concept: Sharing the Planet. Climate change, ecological stewardship, global warming, and environmental action.",
        grammarTopicAr: "التراكيب السببية وتحليل الظواهر البيئية والعلمية",
        grammarTopicEn: "Cause & Effect Structures in Environmental Discourse",
        readingTopicAr: "نصوص القراءة: علوم المناخ وحلول الطاقة النظيفة المستدامة",
        readingTopicEn: "Reading: Climate Science & Sustainable Green Solutions",
        orderIndex: 7,
      },

      // PART TWO:
      {
        unitNumber: 6,
        type: "unit",
        part: "Part Two",
        concept: "A World for All",
        titleAr: "الوحدة السادسة: الفضاء الذي نتشاركه (The Space We Share)",
        titleEn: "Unit 6: The Space We Share",
        descriptionAr: "المفهوم الأساسي: عالم يسع الجميع (A World for All). التعايش السلمي، الشمولية، والمدن والمساحات العامة المشتركة وتنوع الثقافات.",
        descriptionEn: "Concept: A World for All. Coexistence, inclusive communities, cultural pluralism, and shared public spaces.",
        grammarTopicAr: "تراكيب الشمولية والتعايش المجتمعي (Inclusive & Cooperative Structures)",
        grammarTopicEn: "Language Structures for Social Inclusion & Coexistence",
        readingTopicAr: "نصوص القراءة: المدن المستدامة والمجتمعات الدامجة",
        readingTopicEn: "Reading: Shared Urban Spaces & Inclusive Communities",
        orderIndex: 8,
      },
      {
        unitNumber: 0,
        type: "review",
        part: "Part Two",
        titleAr: "المراجعة التوطيدية ج (Consolidation Review C — Units 5–6)",
        titleEn: "Consolidation Review C (Units 5–6)",
        reviewScope: "Units 5–6",
        descriptionAr: "مراجعة توطيدية تغطي الوحدتين 5 و 6 (Sharing the Planet & A World for All) وتتضمن تقييماً نصفياً متكاملاً.",
        descriptionEn: "Consolidation Review C covering Units 5–6 with integrated evaluation.",
        orderIndex: 9,
      },
      {
        unitNumber: 7,
        type: "unit",
        part: "Part Two",
        concept: "Passion & Purpose",
        titleAr: "الوحدة السابعة: اكتشاف شغفك (Discovering Your Passion)",
        titleEn: "Unit 7: Discovering Your Passion",
        descriptionAr: "المفهوم الأساسي: الشغف والهدف (Passion & Purpose). التعرف على الذات، استكشاف المواهب، والتخطيط المستقبلي لتحقيق الطموحات.",
        descriptionEn: "Concept: Passion & Purpose. Self-discovery, pursuing creative and academic passions, and future goal setting.",
        grammarTopicAr: "صيغ التعبير عن الأهداف والتطلعات المستقبلية",
        grammarTopicEn: "Language Structures for Goals, Intentions & Purpose",
        readingTopicAr: "نصوص القراءة: قصص ملهمة لرواد اكتشفوا شغفهم وحققوا إنجازات استثنائية",
        readingTopicEn: "Reading: Visionaries Who Pursued Their Lifelong Passions",
        orderIndex: 10,
      },
      {
        unitNumber: 8,
        type: "unit",
        part: "Part Two",
        concept: "Identity Across Time",
        titleAr: "الوحدة الثامنة: مسارات نحو التقدم (Pathways to Progress)",
        titleEn: "Unit 8: Pathways to Progress",
        descriptionAr: "المفهوم الأساسي: الهوية عبر الزمن (Identity Across Time). مسيرة الحضارة الإنسانية والتطور التكنولوجي وتأثير الابتكار في ارتقاء المجتمعات.",
        descriptionEn: "Concept: Identity Across Time. Evolutionary milestones, human innovation, and the trajectory of progress.",
        grammarTopicAr: "تراكيب التتابع الزمني والمقارنة التاريخية",
        grammarTopicEn: "Chronological Sequencing & Discourse of Progress",
        readingTopicAr: "نصوص القراءة: محطات فارقة في تاريخ التقدم العلمي والصناعي",
        readingTopicEn: "Reading: Landmark Innovations & Pathways to Progress",
        orderIndex: 11,
      },
      {
        unitNumber: 0,
        type: "review",
        part: "Part Two",
        titleAr: "المراجعة التوطيدية د (Consolidation Review D — Units 7–8)",
        titleEn: "Consolidation Review D (Units 7–8)",
        reviewScope: "Units 7–8",
        descriptionAr: "مراجعة توطيدية شاملة تغطي الوحدتين 7 و 8 (Passion & Purpose & Pathways to Progress).",
        descriptionEn: "Consolidation Review D covering Units 7–8.",
        orderIndex: 12,
      },
      {
        unitNumber: 9,
        type: "unit",
        part: "Part Two",
        concept: "Belonging & Well-being",
        titleAr: "الوحدة التاسعة: دوائر الانتماء (Circles of Belonging)",
        titleEn: "Unit 9: Circles of Belonging",
        descriptionAr: "المفهوم الأساسي: الانتماء والرفاهية النفسية (Belonging & Well-being). الروابط الأسرية والاجتماعية، والشعور بالدعم والقبول وأثره على الصحة النفسية.",
        descriptionEn: "Concept: Belonging & Well-being. Social connection, empathetic communities, and the psychological impact of belonging.",
        grammarTopicAr: "تراكيب العلاقات الإنسانية والانتماء الاجتماعي والتواصل التعاطفي",
        grammarTopicEn: "Language Structures for Social Bonds & Empathy",
        readingTopicAr: "نصوص القراءة: قوة الدعم المجتمعي والروابط الإنسانية",
        readingTopicEn: "Reading: Communities of Care & Circles of Belonging",
        orderIndex: 13,
      },
      {
        unitNumber: 10,
        type: "unit",
        part: "Part Two",
        concept: "Invisible Consumption",
        titleAr: "الوحدة العاشرة: ما وراء الشراء (Behind the Buy)",
        titleEn: "Unit 10: Behind the Buy",
        descriptionAr: "المفهوم الأساسي: الاستهلاك غير المرئي (Invisible Consumption). الآثار البيئية والاقتصادية غير الظاهرة وراء عمليات الشراء وسلاسل الإمداد العالمية.",
        descriptionEn: "Concept: Invisible Consumption. Uncovering supply chains, digital transactions, and the hidden footprint of consumerism.",
        grammarTopicAr: "صيغ المبني للمجهول والسببية والتحليل النقدي (Passive, Causative & Critical Analysis)",
        grammarTopicEn: "Passive & Causative Structures in Analytical Discourse",
        readingTopicAr: "نصوص القراءة: السلاسل اللوجستية الخفية والاستهلاك الرقمي المعاصر",
        readingTopicEn: "Reading: The Hidden Realities Behind Global Consumption",
        orderIndex: 14,
      },
      {
        unitNumber: 0,
        type: "review",
        part: "Part Two",
        titleAr: "المراجعة التوطيدية هـ (Consolidation Review E — Units 9–10)",
        titleEn: "Consolidation Review E (Units 9–10)",
        reviewScope: "Units 9–10",
        descriptionAr: "المراجعة التوطيدية الختامية للمنهج كامل تغطي الوحدتين 9 و 10 مع نموذج امتحان تجريبي رسمي للبكالوريا.",
        descriptionEn: "Final Consolidation Review E covering Units 9–10 with full official Baccalaureate practice exam.",
        orderIndex: 15,
      },
    ],
    story: {
      titleAr: "العالم المفقود (The Lost World)",
      titleEn: "The Lost World",
      author: "Arthur Conan Doyle",
      isConfirmed: true,
      statusNoteAr: "الرواية المقررة رسمياً لطلاب البكالوريا المصرية للعام الدراسي 2026/2027",
      descriptionAr: "رواية المغامرة والخيال العلمي الكلاسيكية للسير آرثر كونان دويل: رحلة البروفيسور تشالنجر والصحفي إدوارد مالون إلى هضبة نائية بأمريكا الجنوبية حيث لا تزال ديناصورات ما قبل التاريخ حية.",
      descriptionEn: "Sir Arthur Conan Doyle's timeless adventure classic: Professor Challenger and journalist Edward Malone's expedition to an uncharted prehistoric plateau in South America.",
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      chaptersCount: 10,
      sampleChapters: [
        {
          chapterNumber: 1,
          titleAr: "الفصل الأول: حلم المغامرة (A Dream of Adventure)",
          titleEn: "Chapter 1: A Dream of Adventure",
          summaryAr: "يبحث الصحفي الشاب إدوارد مالون عن مهمة صحفية خطيرة ليثبت شجاعته لحبيبته جلاديس، ويكلفه محرر صحيفة ديلي جازيت بمقابلة البروفيسور تشالنجر غريب الأطوار والمعادي للصحفيين.",
          summaryEn: "Young journalist Edward Malone seeks a heroic adventure to win Gladys's love, accepting an assignment to interview the notoriously hostile Professor Challenger.",
        },
        {
          chapterNumber: 2,
          titleAr: "الفصل الثاني: سر البروفيسور تشالنجر (Professor Challenger's Secret)",
          titleEn: "Chapter 2: Professor Challenger's Secret",
          summaryAr: "يقابل مالون البروفيسور تشالنجر الذي يطلعه على رسومات وعينات ومذكرات المستكشف الراحل مابل وايت التي تثبت وجود كائنات ما قبل التاريخ على قيد الحياة في هضبة معزولة بأمريكا الجنوبية.",
          summaryEn: "Challenger reveals the sketchbooks and evidence of the late Maple White, proving prehistoric creatures still survive on an isolated plateau.",
        },
        {
          chapterNumber: 3,
          titleAr: "الفصل الثالث: اختيار أعضاء البعثة الاستكشافية (The Expedition Is Chosen)",
          titleEn: "Chapter 3: The Expedition Is Chosen",
          summaryAr: "في اجتماع معهد علم الحيوان بلندن، يعلن تشالنجر عن البعثة للتحقق من ادعاءاته، وينضم إليه البروفيسور المتشكك سمرلي، والصياد والمغامر اللورد جون روكستون، والصحفي مالون كشاهد عيان.",
          summaryEn: "At a scientific meeting, a team is chosen to verify Challenger's claims: skeptical Professor Summerlee, adventurer Lord John Roxton, and Malone.",
        },
        {
          chapterNumber: 4,
          titleAr: "الفصل الرابع: التوغل في المجهول (Into the Unknown)",
          titleEn: "Chapter 4: Into the Unknown",
          summaryAr: "تسافر البعثة عبر نهر الأمازون والغابات المطيرة الكثيفة وصولاً إلى سفوح الهضبة البركانية الشاهقة المحاطة بالجروف الصخرية العمودية المنيعة.",
          summaryEn: "The expedition navigates the Amazon and tributary rivers, arriving at the sheer, impenetrable cliffs of the towering volcanic plateau.",
        },
        {
          chapterNumber: 5,
          titleAr: "الفصل الخامس: الوقوع في فخ العالم المفقود (Trapped in the Lost World)",
          titleEn: "Chapter 5: Trapped in the Lost World",
          summaryAr: "تسقط البعثة شجرة صنوبر ضخمة لتكون جسراً عبر الهوة للوصول إلى الهضبة، لكن الدليل الخائن جوميز يلقي بالشجرة في الهاوية انتقاماً، ليصبح المستكشفون الأربعة محاصرين في العالم المفقود.",
          summaryEn: "After bridging the chasm with a felled tree, vengeful native guide Gomez destroys the bridge, trapping the four men on the prehistoric plateau.",
        },
        {
          chapterNumber: 6,
          titleAr: "الفصل السادس: مغامرة مالون الليلية (Malone's Night Adventure)",
          titleEn: "Chapter 6: Malone's Night Adventure",
          summaryAr: "يخرج مالون ليلاً لاستكشاف الهضبة ويكتشف مستنقع البتيروداكتيل والديناصورات المفترسة، وينجو بأعجوبة من مطاردة آكل لحوم مرعب ليعود ويجد المخيم مدمراً ورفاقه مفقودين.",
          summaryEn: "Malone scouts the plateau at night, discovering the pterodactyl swamp and barely escaping a ferocious predator, only to return to an abandoned camp.",
        },
        {
          chapterNumber: 7,
          titleAr: "الفصل السابع: أسرى عند رجال القردة (Prisoners of the Ape-Men)",
          titleEn: "Chapter 7: Prisoners of the Ape-Men",
          summaryAr: "يقع تشالنجر وسمرلي وروكستون أسرى في قبضة قبيلة بدائية من رجال القردة، ويقود مالون واللورد روكستون خطة إنقاذ جريئة مستعينين بالأسلحة النارية والتحالف مع قبيلة الهنود الحمر.",
          summaryEn: "Challenger and Summerlee are captured by fierce ape-men; Malone and Roxton launch a rescue with firearms and ally with indigenous Accala warriors.",
        },
        {
          chapterNumber: 8,
          titleAr: "الفصل الثامن: معركة الهضبة (The Battle for the Plateau)",
          titleEn: "Chapter 8: The Battle for the Plateau",
          summaryAr: "تندلع معركة ملحمية حاسمة بين رجال القردة والهنود الحمر بمساعدة بنادق اللورد روكستون وتشالنجر، ويتحقق النصر وتستقر السيطرة على الهضبة.",
          summaryEn: "A decisive battle takes place between the ape-men and the native tribe, ending in victory thanks to the expedition's modern rifles.",
        },
        {
          chapterNumber: 9,
          titleAr: "الفصل التاسع: الطريق الخفي نحو الوطن (The Hidden Way Home)",
          titleEn: "Chapter 9: The Hidden Way Home",
          summaryAr: "يكشف زعيم الهنود الامتنان للبعثة ويدلهم على ممر كهفي سري يخترق جدار الهضبة الصخري، وينجح المستكشفون في الهبوط والعودة إلى الحضارة وبحوزتهم أدلة قاطعة.",
          summaryEn: "A grateful native youth delivers a secret map of an underground tunnel through the cliff wall, allowing the four adventurers to escape.",
        },
        {
          chapterNumber: 10,
          titleAr: "الفصل العاشر: الدليل أمام العالم (Proof Before the World)",
          titleEn: "Chapter 10: Proof Before the World",
          summaryAr: "في قاعة الملكة بلندن، يواجه تشالنجر شكوك العلماء بإطلاق زاحف بتيروداكتيل حي أمام الحشود المذهولة ليرسخ الحقيقة العلمية وسط تصفيق وذهول العالم.",
          summaryEn: "Before a crowded London scientific assembly, Challenger unleashes a live pterodactyl to stun the skeptics and prove their triumphant discovery.",
        },
      ],
    },
  },
];

/**
 * Returns units for a given grade code or title
 */
export function getCurriculumUnits(gradeIdentifier: string): CurriculumUnitSpec[] {
  const norm = (gradeIdentifier || "").toLowerCase().trim();
  const exact = CURRICULUM_2026_GRADES.find(
    (g) => g.code.toLowerCase() === norm || g.id.toLowerCase() === norm
  );
  if (exact) return exact.units;

  // Fallback by stage name matching
  if (norm.includes("sec_2_bac") || norm.includes("تانية بكالوريا") || norm.includes("بكالوريا") || norm.includes("baccalaureate") || norm.includes("second year egyptian baccalaureate")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_2_bac")!.units;
  }
  if (norm.includes("third secondary") || norm.includes("sec_3") || norm.includes("ثالثة ثانوي") || norm.includes("ثانوية عامة")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_3")!.units;
  }
  if (norm.includes("second secondary") || norm.includes("sec_2") || norm.includes("تانية ثانوي")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_2")!.units;
  }
  if (norm.includes("first secondary") || norm.includes("sec_1") || norm.includes("أولى ثانوي")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_1")!.units;
  }
  if (norm.includes("third prep") || norm.includes("prep_3") || norm.includes("ثالثة إعدادي") || norm.includes("إعدادية")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "prep_3")!.units;
  }
  if (norm.includes("second prep") || norm.includes("prep_2") || norm.includes("تانية إعدادي")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "prep_2")!.units;
  }
  if (norm.includes("first prep") || norm.includes("prep_1") || norm.includes("أولى إعدادي")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "prep_1")!.units;
  }

  // Default to Third Secondary
  return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_3")!.units;
}

/**
 * Returns story specification for a given grade
 */
export function getCurriculumStory(gradeIdentifier: string): CurriculumStorySpec {
  const norm = (gradeIdentifier || "").toLowerCase().trim();
  const exact = CURRICULUM_2026_GRADES.find(
    (g) => g.code.toLowerCase() === norm || g.id.toLowerCase() === norm
  );
  if (exact) return exact.story;

  if (norm.includes("sec_2_bac") || norm.includes("تانية بكالوريا") || norm.includes("بكالوريا") || norm.includes("baccalaureate") || norm.includes("second year egyptian baccalaureate")) {
    return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_2_bac")!.story;
  }
  return CURRICULUM_2026_GRADES.find((g) => g.code === "sec_3")!.story;
}
