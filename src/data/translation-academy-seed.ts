/**
 * PROFESSIONAL ACADEMY — TRANSLATION ACADEMY SEED DATA
 * Teacher: Mr. Habib El Rahman
 * Tagline: "Think in English. Translate with Confidence." / "فكر بالإنجليزية.. وترجم بثقة"
 * Initial Active Stage: First Secondary — First Term (قابل للتوسع لكافة الصفوف)
 */

export interface SeedTranslationRule {
  id: string;
  titleAr: string;
  titleEn: string;
  ruleAr: string;
  ruleEn: string;
  examples: Array<{ ar: string; en: string; note?: string }>;
}

export interface SeedTranslationVocab {
  id: string;
  en: string;
  ar: string;
  ipa?: string;
  pos?: string;
  exampleEn: string;
  exampleAr: string;
}

export interface SeedSolvedExample {
  id: string;
  sourceText: string;
  targetText: string;
  direction: "ar_to_en" | "en_to_ar";
  steps: string[];
  notesAr: string;
  notesEn: string;
}

export interface SeedCommonMistake {
  id: string;
  wrongSentence: string;
  correctSentence: string;
  explanationAr: string;
  explanationEn: string;
}

export interface SeedTranslationQuestion {
  id: string;
  questionType: string;
  questionText: string;
  instructions: string;
  options?: any;
  correctAnswer: string;
  alternativeAnswers?: string[];
  explanation: string;
  marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
  topic?: string;
  source?: string;
  audioUrl?: string;
}

export interface SeedTranslationLesson {
  id: string;
  moduleId: string;
  orderIndex: number;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  videoUrl?: string;
  videoDuration: string;
  pdfUrl?: string;
  rules: SeedTranslationRule[];
  vocabulary: SeedTranslationVocab[];
  solvedExamples: SeedSolvedExample[];
  commonMistakes: SeedCommonMistake[];
  questions: SeedTranslationQuestion[];
}

export interface SeedTranslationModule {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  grade: string;
  term: string;
  orderIndex: number;
  icon: string;
  lessons: SeedTranslationLesson[];
}

export const TRANSLATION_MODULES_SEED: SeedTranslationModule[] = [
  // ==========================================
  // MODULE 1: Translation Basics
  // ==========================================
  {
    id: "tm_sec1_t1_mod1",
    code: "mod_basics",
    titleAr: "أساسيات الترجمة وتكوين الجملة",
    titleEn: "Translation Basics & Sentence Structure",
    descriptionAr: "إتقان بنية الجملة باللغتين الإنجليزية والعربية، أدوات التعريف والتنكير، وترتيب الصفة والموصوف.",
    descriptionEn: "Master sentence structure differences between English and Arabic, definite/indefinite articles, and adjective order.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 1,
    icon: "Layers",
    lessons: [
      {
        id: "tl_m1_l1",
        moduleId: "tm_sec1_t1_mod1",
        orderIndex: 1,
        titleAr: "بنية الجملة البسيطة (S + V + O) مقابل الجملة الاسمية والفعلية",
        titleEn: "Simple Sentence Structure (S + V + O) vs Arabic Nominal/Verbal Sentences",
        summaryAr: "في الإنجليزية يجب أن تبدأ الجملة بالفاعل (Subject) إلا في صيغة الأمر، بينما العربية تقبل الجملة الاسمية والفعلية.",
        summaryEn: "English sentences strictly require a subject first, unlike Arabic which allows verbal and nominal beginnings.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "18 mins",
        pdfUrl: "/curriculum/translation_basics_lesson1.pdf",
        rules: [
          {
            id: "r_m1_l1_1",
            titleAr: "قاعدة الفاعل الإلزامي في الإنجليزية",
            titleEn: "Mandatory Subject in English Sentences",
            ruleAr: "الجملة الإنجليزية الخبرية تبدأ دائماً بفاعل صريح (اسم أو ضمير)، بينما في العربية يمكن أن يكون الفاعل ضميراً مستتراً.",
            ruleEn: "An English declarative sentence must begin with an overt subject (noun or pronoun). Arabic verbs can embed implied subjects.",
            examples: [
              { ar: "يلعب أحمد كرة القدم كل جمعة.", en: "Ahmed plays football every Friday.", note: "بدأنا بالفاعل Ahmed بالإنجليزية." },
              { ar: "ذهبنا إلى المتحف المصري أمس.", en: "We went to the Egyptian Museum yesterday.", note: "الضمير 'نا' في ذهبنا تحول إلى 'We' كفاعل مستقل." }
            ]
          },
          {
            id: "r_m1_l1_2",
            titleAr: "الصفة تسبق الموصوف في الإنجليزية",
            titleEn: "Adjectives Precede Nouns in English",
            ruleAr: "في الإنجليزية توضع الصفة دائماً قبل الاسم الموصوف ولا تجمع الصفة، على عكس العربية.",
            ruleEn: "In English, adjectives precede nouns and do not take plural forms.",
            examples: [
              { ar: "مشاريع قومية عملاقة", en: "Giant national projects", note: "الصفات (Giant / national) سبقت الاسم (projects)." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m1_1", en: "Achieve", ar: "يحقق / ينجز", ipa: "/əˈtʃiːv/", pos: "verb", exampleEn: "Youth can achieve great progress.", exampleAr: "يستطيع الشباب تحقيق تقدم عظيم." },
          { id: "v_m1_2", en: "Development", ar: "تنمية / تطوير", ipa: "/dɪˈvel.əp.mənt/", pos: "noun", exampleEn: "Sustainable development is a national goal.", exampleAr: "التنمية المستدامة هدف قومي." },
          { id: "v_m1_3", en: "Ambition", ar: "طموح", ipa: "/æmˈbɪʃ.n/", pos: "noun", exampleEn: "Ambition drives young people forward.", exampleAr: "يدفع الطموح الشباب إلى الأمام." }
        ],
        solvedExamples: [
          {
            id: "se_m1_1",
            direction: "ar_to_en",
            sourceText: "يلعب التعليم دوراً حيوياً في بناء شخصية الطالب.",
            targetText: "Education plays a vital role in building the student's personality.",
            steps: [
              "1. تحديد الفاعل: التعليم = Education (بدون the لأنها اسم مجرد)",
              "2. تحديد الفعل والزمن: يلعب دوراً = plays a role (مضارع بسيط - حقيقة)",
              "3. إدخال الصفة قبل الموصوف: دوراً حيوياً = a vital role",
              "4. الجار والمجرور: في بناء = in building (بعد حرف الجر يأتي gerund)"
            ],
            notesAr: "لاحظ أن 'التعليم' كمعنى عام لا يأخذ 'the' في اللغة الإنجليزية.",
            notesEn: "Abstract uncountable nouns used in a general sense take no definite article."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m1_1",
            wrongSentence: "Plays education a vital role.",
            correctSentence: "Education plays a vital role.",
            explanationAr: "خطأ فادح: بدء الجملة الإنجليزية بفعل (Verb) كترجمة للجملة الفعلية العربية. الصحيح البدء بالفاعل.",
            explanationEn: "English declarative sentences cannot start with a verb."
          },
          {
            id: "cm_m1_2",
            wrongSentence: "Projects nationals",
            correctSentence: "National projects",
            explanationAr: "في الإنجليزية الصفة تسبق الاسم ولا تجمع بإضافة s.",
            explanationEn: "Adjectives precede nouns and never take plural 's'."
          }
        ],
        questions: [
          // 1. MCQ
          {
            id: "tq_101",
            questionType: "mcq",
            questionText: "اختر الترجمة الصحيحة: 'تبذل الحكومة جهوداً عظيمة لتطوير التعليم والصحة.'",
            instructions: "اختر الترجمة الأدق لغوياً ونحوياً من بين الخيارات المعطاة.",
            options: [
              "The government exerts great efforts to develop education and health.",
              "Exerts the government efforts great to developing education and health.",
              "The government makes efforts great for development education and health.",
              "Government is exerting great effort to develops the education and health."
            ],
            correctAnswer: "The government exerts great efforts to develop education and health.",
            explanation: "تبدأ الجملة بالفاعل (The government) ثم الفعل المناسب (exerts) والصفة تسبق الموصوف (great efforts) وتستخدم to بعدها المصدر (to develop).",
            marks: 2,
            difficulty: "Medium",
            topic: "Sentence Structure",
            source: "Ministry Exam First Secondary 2024"
          },
          // 2. Arabic to English Text Input
          {
            id: "tq_102",
            questionType: "ar_to_en_text",
            questionText: "ترجم إلى الإنجليزية: 'الشباب هم عماد الأمة وأملها في مستقبل مشرق.'",
            instructions: "اكتب ترجمتك باللغة الإنجليزية مراعياً الدقة اللغوية وترتيب الجملة السليم.",
            correctAnswer: "Youth are the backbone of the nation and its hope for a bright future.",
            alternativeAnswers: [
              "Young people are the pillar of the nation and its hope for a bright future.",
              "Youth are the backbone of the nation and their hope for a bright future.",
              "Young people are the cornerstone of the nation and its hope for a bright future.",
              "Youth represent the backbone of the nation and its hope for a promising future."
            ],
            explanation: "كلمة 'الشباب' تترجم Youth أو Young people، و'عماد' تترجم backbone أو pillar أو cornerstone، و'مستقبل مشرق' تعني a bright future أو a promising future.",
            marks: 3,
            difficulty: "Medium",
            topic: "Arabic to English Translation"
          },
          // 3. Sentence Ordering
          {
            id: "tq_103",
            questionType: "sentence_ordering",
            questionText: "رتب الكلمات الإنجليزية التالية لتكوين ترجمة سليمة للجملة: 'القراءة تغذي العقل وتوسع المدارك.'",
            instructions: "رتب عناصر الجملة بالسحب والإفلات أو النقر بالترتيب الصحيح.",
            options: ["Reading", "feeds", "the mind", "and", "broadens", "one's horizons."],
            correctAnswer: "Reading feeds the mind and broadens one's horizons.",
            alternativeAnswers: [
              "Reading feeds the mind and broadens horizons."
            ],
            explanation: "الترتيب الإنجليزي القياسي: Subject (Reading) + Verb (feeds) + Object (the mind) + conjunction (and) + Verb 2 (broadens) + Object 2 (one's horizons).",
            marks: 2,
            difficulty: "Easy",
            topic: "Sentence Ordering"
          },
          // 4. Word Matching
          {
            id: "tq_104",
            questionType: "word_matching",
            questionText: "طابق الكلمة الإنجليزية بمقابلها العربي الأدق في سياق الترجمة:",
            instructions: "صل كل مصطلح بما يقابله في المعنى.",
            options: [
              { en: "Backbone", ar: "عماد / ركيزة أساسية" },
              { en: "Vital role", ar: "دور حيوي" },
              { en: "Sustainable", ar: "مستدام" },
              { en: "Exert efforts", ar: "يبذل جهوداً" }
            ],
            correctAnswer: "Backbone:عماد / ركيزة أساسية|Vital role:دور حيوي|Sustainable:مستدام|Exert efforts:يبذل جهوداً",
            explanation: "هذه المتلازمات شائعة جداً في نصوص الترجمة الرسمية للمرحلة الثانوية.",
            marks: 2,
            difficulty: "Easy",
            topic: "Vocabulary Matching"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 2: Vocabulary in Context
  // ==========================================
  {
    id: "tm_sec1_t1_mod2",
    code: "mod_vocab_context",
    titleAr: "المفردات والمتلازمات في السياق",
    titleEn: "Vocabulary & Collocations in Context",
    descriptionAr: "فهم الكلمات متعددة المعاني، المتلازمات اللفظية القوية، وحروف الجر الخاصة بالترجمة.",
    descriptionEn: "Master polysemous words, powerful collocations, and prepositional accuracy in translation.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 2,
    icon: "BookOpen",
    lessons: [
      {
        id: "tl_m2_l1",
        moduleId: "tm_sec1_t1_mod2",
        orderIndex: 1,
        titleAr: "المتلازمات اللفظية وأثرها في احترافية الترجمة",
        titleEn: "Collocations & Natural Word Pairings in Translation",
        summaryAr: "المتلازمات اللفظية (Collocations) هي كلمات تجتمع معاً بشكل طبيعي. استخدام المتلازمة الصحيحة يفرق بين المترجم المبتدئ والمحترف.",
        summaryEn: "Collocations are natural word pairings. Choosing the precise collocation makes translations sound authentic and professional.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "16 mins",
        pdfUrl: "/curriculum/translation_collocations.pdf",
        rules: [
          {
            id: "r_m2_l1_1",
            titleAr: "أفعال تتلازم مع أسماء محددة (Make vs Do vs Pay)",
            titleEn: "Verb-Noun Collocations",
            ruleAr: "لا تترجم حرفياً: 'يبذل جهداً' = make an effort / exert effort، 'يولي اهتماماً' = pay attention، 'يقترف خطأ' = make a mistake.",
            ruleEn: "Never translate literally. Collocations dictate which verb pairs naturally with which noun.",
            examples: [
              { ar: "يجب أن نولي اهتماماً كبيراً بالتعليم.", en: "We must pay great attention to education.", note: "نستخدم pay attention وليس give attention." },
              { ar: "حقق منتخبنا إنجازاً باهراً.", en: "Our national team made a remarkable achievement.", note: "نستخدم make an achievement أو achieve success." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m2_1", en: "Pay attention to", ar: "يولي اهتماماً لـ", ipa: "/peɪ əˈten.ʃn/", pos: "phrase", exampleEn: "Schools pay attention to moral values.", exampleAr: "تولي المدارس اهتماماً بالقيم الأخلاقية." },
          { id: "v_m2_2", en: "Take measures", ar: "يتخذ إجراءات / تدابير", ipa: "/teɪk ˈmeʒ.əz/", pos: "phrase", exampleEn: "The ministry took strict measures against cheating.", exampleAr: "اتخذت الوزارة تدابير صارمة ضد الغش." }
        ],
        solvedExamples: [
          {
            id: "se_m2_1",
            direction: "ar_to_en",
            sourceText: "اتخذت الدولة إجراءات حاسمة لمواجهة غلاء الأسعار.",
            targetText: "The state took decisive measures to confront high prices.",
            steps: [
              "1. الدولة = The state / The government",
              "2. اتخذت إجراءات = took measures",
              "3. حاسمة (صفة تسبق measures) = decisive / strict",
              "4. لمواجهة غلاء الأسعار = to confront high prices / rising prices"
            ],
            notesAr: "نستخدم الفعل take مع measures.",
            notesEn: "We pair 'take' with 'measures' as standard English collocation."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m2_1",
            wrongSentence: "The government made measures.",
            correctSentence: "The government took measures.",
            explanationAr: "مع كلمة measures نستخدم take وليس make.",
            explanationEn: "The natural collocation is 'take measures', not 'make measures'."
          }
        ],
        questions: [
          // 5. Fill in the blanks
          {
            id: "tq_201",
            questionType: "fill_blanks",
            questionText: "أكمل الفراغ بالكلمة المناسبة لتكتمل الترجمة الصحيحة: 'يجب على المواطنين أن يلعبوا دوراً إيجابياً في حماية البيئة.'\n\nCitizens must [blank] a positive role in protecting the environment.",
            instructions: "اكتب الكلمة المناسبة في الفراغ.",
            correctAnswer: "play",
            alternativeAnswers: ["play"],
            explanation: "المتلازمة الصحيحة لـ 'يلعب دوراً' هي 'play a role'.",
            marks: 1,
            difficulty: "Easy",
            topic: "Collocations"
          },
          // 6. Word Selection
          {
            id: "tq_202",
            questionType: "word_selection",
            questionText: "اختر الفعل المتلازم الصحيح مع الكلمة المذكورة: '____ attention to'",
            instructions: "اختر الكلمة الأكثر ملاءمة للسياق.",
            options: ["Pay", "Give", "Do", "Make"],
            correctAnswer: "Pay",
            explanation: "في اللغة الإنجليزية يقال 'pay attention to' للدلالة على توجيه الاهتمام والتركيز.",
            marks: 1,
            difficulty: "Easy",
            topic: "Collocations"
          },
          // 7. Error Correction
          {
            id: "tq_203",
            questionType: "error_correction",
            questionText: "اكتشف الخطأ وصححه في الترجمة التالية: 'We should do our best to make progress.' -> 'We should do our best to do progress.'",
            instructions: "اكتب الكلمة المصححة فقط أو الجملة المصححة بالكامل.",
            correctAnswer: "make progress",
            alternativeAnswers: [
              "make",
              "We should do our best to make progress."
            ],
            explanation: "كلمة progress تتلازم مع الفعل make وليس do (يقال: make progress = يحرز تقدماً).",
            marks: 2,
            difficulty: "Medium",
            topic: "Error Correction"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 3: Grammar in Translation
  // ==========================================
  {
    id: "tm_sec1_t1_mod3",
    code: "mod_grammar_trans",
    titleAr: "القواعد اللغوية كأداة ترجمة",
    titleEn: "Grammar Tools for Accurate Translation",
    descriptionAr: "التعامل مع الأزمنة الإنجليزية، المبني للمجهول، الجمل الشرطية، وأفعال المودال.",
    descriptionEn: "Handling English tenses, passive voice transformations, conditionals, and modals in translation.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 3,
    icon: "Cpu",
    lessons: [
      {
        id: "tl_m3_l1",
        moduleId: "tm_sec1_t1_mod3",
        orderIndex: 1,
        titleAr: "ترجمة المبني للمجهول (Passive Voice) وصيغ (تم / أُنشئ / بُني)",
        titleEn: "Translating Passive Voice & Arabic Equivalents (تم / أُنشئ)",
        summaryAr: "اللغة الإنجليزية تميل لاستخدام المبني للمجهول في الأخبار والتقارير العلمية أكثر من العربية التي تفضل المبني للمعلوم أو صياغات مثل (تم + المصدر).",
        summaryEn: "English frequently employs the passive in academic/news registers, while Arabic often shifts to active or 'تم + verbal noun'.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "20 mins",
        pdfUrl: "/curriculum/translation_grammar_passive.pdf",
        rules: [
          {
            id: "r_m3_l1_1",
            titleAr: "ترجمة 'تم + المصدر' إلى المبني للمجهول الإنجليزي",
            titleEn: "Translating 'تم + Verbal Noun' to English Passive",
            ruleAr: "عندما تجد في النص العربي عبارات مثل 'تم إنشاء' أو 'تم توقيع الاتفاقية'، تترجم بالإنجليزية إلى صيغة المجهول المناسبة لزمن الحدث (is/was/has been + P.P).",
            ruleEn: "Arabic 'تم + noun' indicates a completed action where the agent is omitted or deemphasized, translating directly into English Passive (be + past participle).",
            examples: [
              { ar: "تم افتتاح المتحف المصري الكبير رسمياً.", en: "The Grand Egyptian Museum was officially inaugurated.", note: "تم افتتاح = was inaugurated (ماضي بسيط مجهول)." },
              { ar: "تم تنفيذ العديد من المشروعات التنموية في سيناء.", en: "Many developmental projects have been implemented in Sinai.", note: "حدث له أثر في الحاضر = Present Perfect Passive (have been implemented)." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m3_1", en: "Inaugurate", ar: "يفتتح رسمياً / يدشن", ipa: "/ɪˈnɔː.ɡjə.reɪt/", pos: "verb", exampleEn: "The new bridge was inaugurated yesterday.", exampleAr: "تم افتتاح الجسر الجديد بالأمس." },
          { id: "v_m3_2", en: "Implement", ar: "يطبق / ينفذ", ipa: "/ˈɪm.plɪ.ment/", pos: "verb", exampleEn: "New safety rules will be implemented next month.", exampleAr: "سيتم تطبيق قواعد السلامة الجديدة الشهر القادم." }
        ],
        solvedExamples: [
          {
            id: "se_m3_1",
            direction: "ar_to_en",
            sourceText: "تم توقيع اتفاقيات تعاون مشترك بين مصر وعدة دول أفريقية.",
            targetText: "Joint cooperation agreements were signed between Egypt and several African countries.",
            steps: [
              "1. الفاعل المفعول (نائب الفاعل): اتفاقيات تعاون مشترك = Joint cooperation agreements",
              "2. زمن الحدث: تم توقيع = were signed (ماضي مجهول)",
              "3. المكملات: بين مصر وعدة دول أفريقية = between Egypt and several African countries"
            ],
            notesAr: "لا تترجم 'تم' حرفياً كفعل 'completed'، بل اجعل الفعل الرئيسي مجهولاً.",
            notesEn: "Never translate 'تم' as 'was completed'. Instead turn the following verb into passive voice."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m3_1",
            wrongSentence: "Completed the opening of the museum.",
            correctSentence: "The museum was opened / inaugurated.",
            explanationAr: "خطأ ترجمة 'تم' كفعل مستقل Completed. الصحيح تحويل الجملة إلى passive.",
            explanationEn: "Do not translate 'تم' literally."
          }
        ],
        questions: [
          // 8. Complete the translation
          {
            id: "tq_301",
            questionType: "complete_translation",
            questionText: "أكمل الترجمة التالية: 'تم بناء السد العالي لحماية مصر من الفيضان والجفاف.'\n\nThe High Dam was [blank] to protect Egypt from floods and drought.",
            instructions: "اكتب الكلمة أو العبارة الناقصة لاستكمال الترجمة.",
            correctAnswer: "built",
            alternativeAnswers: ["constructed", "erected"],
            explanation: "صيغة المجهول في الماضي البسيط: was + P.P (built أو constructed).",
            marks: 1,
            difficulty: "Easy",
            topic: "Passive Voice"
          },
          // 9. Sentence Transformation
          {
            id: "tq_302",
            questionType: "sentence_transformation",
            questionText: "أعد صياغة الجملة الإنجليزية التالية لتبدأ بـ (The new administrative capital): 'Engineers are building the new administrative capital with state-of-the-art technologies.'",
            instructions: "حول الجملة إلى صيغة المبني للمجهول (Passive Voice) مع الحفاظ التام على المعنى.",
            correctAnswer: "The new administrative capital is being built with state-of-the-art technologies.",
            alternativeAnswers: [
              "The new administrative capital is being constructed with state-of-the-art technologies.",
              "The new administrative capital is being built by engineers with state-of-the-art technologies."
            ],
            explanation: "زمن المضارع المستمر في المجهول يتكون من: is/are + being + P.P.",
            marks: 2,
            difficulty: "Hard",
            topic: "Sentence Transformation"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 4: Arabic to English Translation
  // ==========================================
  {
    id: "tm_sec1_t1_mod4",
    code: "mod_ar_to_en",
    titleAr: "الترجمة من العربية إلى الإنجليزية",
    titleEn: "Arabic to English Translation Mastery",
    descriptionAr: "التعامل مع أدوات التوكيد العربية (إن، قد، لقد)، المفعول المطلق، والمصطلحات الحضارية.",
    descriptionEn: "Master Arabic emphatic particles (Inna, Qad, Laqad), cognate accusatives, and cultural expressions.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 4,
    icon: "ArrowRightLeft",
    lessons: [
      {
        id: "tl_m4_l1",
        moduleId: "tm_sec1_t1_mod4",
        orderIndex: 1,
        titleAr: "أسرار ترجمة أدوات التوكيد العربية (إنّ، قد، لقد، لا شك أن)",
        titleEn: "Translating Arabic Emphatic Markers (Inna, Qad, Laqad, Undoubtedly)",
        summaryAr: "أدوات التوكيد العربية مثل (إنّ) لا تترجم حرفياً بكلمة معينة بل تعبر عنها نبرة الجملة أو ظروف مثل (Indeed, Undoubtedly, Certainly). أما (لقد + ماضي) فغالباً تترجم بمضارع تام (Present Perfect).",
        summaryEn: "Arabic intensifiers like 'Inna' and 'Laqad' require contextual rendering rather than word-for-word translation.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "22 mins",
        pdfUrl: "/curriculum/translation_ar_to_en_emphatics.pdf",
        rules: [
          {
            id: "r_m4_l1_1",
            titleAr: "ترجمة 'لقد + فعل ماضٍ'",
            titleEn: "Translating 'Laqad + Past Verb'",
            ruleAr: "إذا جاءت (لقد + ماضٍ) بدون تحديد زمن في الماضي، تترجم عادة إلى مضارع تام (have/has + P.P) لأن الحدث اكتمل وله أثر حاضر. أما إذا حُدد وقت الماضي (أمس، العام الماضي) فتترجم لماضٍ بسيط.",
            ruleEn: "When 'Laqad + past' has no explicit past timeframe, translate into the Present Perfect. If a specific past time is given, use the Past Simple.",
            examples: [
              { ar: "لقد حققت مصر طفرة كبيرة في مجال الطاقة.", en: "Egypt has achieved a great leap in the field of energy.", note: "مضارع تام لأن التأثير ممتد للحاضر ولم يحدد وقت ماضي." },
              { ar: "لقد فاز فريقنا بالبطولة العام الماضي.", en: "Our team won the championship last year.", note: "ماضي بسيط لوجود 'العام الماضي' (last year)." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m4_1", en: "Undoubtedly", ar: "مما لا شك فيه / بلا ريب", ipa: "/ʌnˈdaʊ.tɪd.li/", pos: "adverb", exampleEn: "Undoubtedly, peace leads to prosperity.", exampleAr: "مما لا شك فيه أن السلام يؤدي إلى الرخاء." },
          { id: "v_m4_2", en: "Remarkable leap", ar: "طفرة ملحوظة / وثبة كبيرة", ipa: "/rɪˈmɑː.kə.bəl liːp/", pos: "phrase", exampleEn: "Technology has witnessed a remarkable leap.", exampleAr: "شهدت التكنولوجيا طفرة ملحوظة." }
        ],
        solvedExamples: [
          {
            id: "se_m4_1",
            direction: "ar_to_en",
            sourceText: "إن القراءة هي مفتاح المعرفة وطريق التقدم لأي أمة.",
            targetText: "Reading is the key to knowledge and the path to progress for any nation.",
            steps: [
              "1. تجاهل 'إن' الحرفية، فالفعل 'is' كافٍ لربط الجملة الإنجليزية.",
              "2. القراءة = Reading (اسم gerund بدون the لأنه عام).",
              "3. مفتاح المعرفة = the key to knowledge (لاحظ حرف الجر to مع key).",
              "4. طريق التقدم = the path to progress."
            ],
            notesAr: "لاحظ استخدام حرف الجر to بعد key (مفتاح لـ) وليس of.",
            notesEn: "We say 'the key to knowledge', not 'key of knowledge'."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m4_1",
            wrongSentence: "That reading is key of knowledge.",
            correctSentence: "Reading is the key to knowledge.",
            explanationAr: "خطأ فادح: ترجمة 'إنّ' بـ That في بداية الجملة. 'إنّ' التوكيدية لا تترجم بـ That.",
            explanationEn: "Never translate initial Arabic 'Inna' with 'That'."
          }
        ],
        questions: [
          // 10. Context-Based Translation
          {
            id: "tq_401",
            questionType: "context_translation",
            questionText: "في سياق مقال عن التنمية المستدامة، ترجم الجملة التالية بدقة: 'لقد بات من الضروري ترشيد استهلاك المياه والكهرباء.'",
            instructions: "اختر أو اكتب الترجمة التي تراعي الصياغة الرسمية السياقية.",
            correctAnswer: "It has become necessary to rationalize the consumption of water and electricity.",
            alternativeAnswers: [
              "It is now essential to rationalize water and electricity consumption.",
              "It has become essential to rationalize the use of water and electricity.",
              "Rationalizing water and electricity consumption has become necessary."
            ],
            explanation: "عبارة 'بات من الضروري' تترجم إلى It has become necessary أو It is now essential، وكلمة 'ترشيد استهلاك' تعني rationalize consumption.",
            marks: 3,
            difficulty: "Medium",
            topic: "Contextual Translation"
          },
          // 11. Translation using given words
          {
            id: "tq_402",
            questionType: "translation_given_words",
            questionText: "ترجم الجملة التالية باستخدام الكلمات المعطاة: 'تسعى الدولة جاهدة لجذب الاستثمارات الأجنبية.'\n\nالكلمات المقترحة: [strives / attract / foreign investments / state]",
            instructions: "وظف الكلمات المعطاة في صياغة جملة إنجليزية سليمة نحوياً ومعنوياً.",
            correctAnswer: "The state strives hard to attract foreign investments.",
            alternativeAnswers: [
              "The state strives to attract foreign investments.",
              "The state is striving to attract foreign investment.",
              "The government strives to attract foreign investments."
            ],
            explanation: "تسعى جاهدة = strives hard / strives diligently، جذب الاستثمارات الأجنبية = attract foreign investments.",
            marks: 2,
            difficulty: "Medium",
            topic: "Given Words Translation"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 5: English to Arabic Translation
  // ==========================================
  {
    id: "tm_sec1_t1_mod5",
    code: "mod_en_to_ar",
    titleAr: "الترجمة من الإنجليزية إلى العربية",
    titleEn: "English to Arabic Translation Artistry",
    descriptionAr: "تحويل الجمل الإنجليزية إلى أسلوب عربي فصيح ورصين وتجنب الترجمة الحرفية الركيكة.",
    descriptionEn: "Crafting elegant, idiomatic Arabic prose from English source texts without literal awkwardness.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 5,
    icon: "Sparkles",
    lessons: [
      {
        id: "tl_m5_l1",
        moduleId: "tm_sec1_t1_mod5",
        orderIndex: 1,
        titleAr: "الصياغة العربية الفصيحة وتفضيل الجملة الفعلية",
        titleEn: "Idiomatic Arabic Phrasing & Verbal Sentence Preference",
        summaryAr: "اللغة العربية تعشق الحركة والبدء بالفعل عند الترجمة، بينما الإنجليزية تبدأ دائماً باسم. حول الجملة الإنجليزية إلى جملة فعلية عربية فصيحة لتبدو الترجمة طبيعية وغير مترجمة.",
        summaryEn: "Arabic stylistically favors verbal sentences over nominal ones. Starting with an expressive Arabic verb creates authentic prose.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "17 mins",
        pdfUrl: "/curriculum/translation_en_to_ar_phrasing.pdf",
        rules: [
          {
            id: "r_m5_l1_1",
            titleAr: "البدء بالفعل عند الترجمة للعربية الفصحى",
            titleEn: "Starting with a Verb in Arabic",
            ruleAr: "عند ترجمة جملة مثل 'Scientists agree that...', الأفضل عربياً قول: 'يتفق العلماء على أن...' بدلاً من 'العلماء يتفقون على أن...'.",
            ruleEn: "In standard Arabic, placing the verb before the subject sounds more natural and eloquent.",
            examples: [
              { en: "Modern technology has revolutionized daily communication.", ar: "أحدثت التكنولوجيا الحديثة ثورة في التواصل اليومي.", note: "بدأنا بالفعل 'أحدثت' بدلاً من 'التكنولوجيا الحديثة أحدثت'." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m5_1", en: "Revolutionize", ar: "يُحدث ثورة في / يغير جذرياً", ipa: "/ˌrev.əˈluː.ʃən.aɪz/", pos: "verb", exampleEn: "AI will revolutionize education.", exampleAr: "سيحدث الذكاء الاصطناعي ثورة في التعليم." },
          { id: "v_m5_2", en: "Prosperity", ar: "رخاء / ازدهار", ipa: "/prɒsˈper.ə.ti/", pos: "noun", exampleEn: "Peace is essential for economic prosperity.", exampleAr: "السلام ضروري للازدهار الاقتصادي." }
        ],
        solvedExamples: [
          {
            id: "se_m5_1",
            direction: "en_to_ar",
            sourceText: "Tourism plays an essential role in bolstering national income.",
            targetText: "تلعب السياحة دوراً أساسياً في تعزيز الدخل القومي.",
            steps: [
              "1. البدء بالفعل العربي: تلعب السياحة",
              "2. الصفة والموصوف: دوراً أساسياً (an essential role)",
              "3. ترجمة bolster: تعزيز / دعم / تنمية",
              "4. national income: الدخل القومي"
            ],
            notesAr: "كلمة bolster تعني يعزز أو يدعم.",
            notesEn: "'Bolster' translates to 'تعزيز' or 'دعم'."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m5_1",
            wrongSentence: "السياحة هي تلعب دور ضروري في عمل الدخل القومي عالي.",
            correctSentence: "تلعب السياحة دوراً أساسياً في تعزيز الدخل القومي.",
            explanationAr: "تجنب الترجمة الحرفية الركيكة وإقحام ضمائر الفصل دون داعٍ.",
            explanationEn: "Avoid clumsy literal translation into Arabic."
          }
        ],
        questions: [
          // 12. English to Arabic text input
          {
            id: "tq_501",
            questionType: "en_to_ar_text",
            questionText: "ترجم إلى العربية بأسلوب فصيح ورصين:\n\n'Great projects implemented by Egypt aim to provide decent job opportunities for youth.'",
            instructions: "اكتب ترجمتك باللغة العربية الفصحى.",
            correctAnswer: "تهدف المشروعات الكبرى التي تنفذها مصر إلى توفير فرص عمل كريمة للشباب.",
            alternativeAnswers: [
              "تهدف المشاريع العملاقة التي تنفذها مصر إلى توفير فرص عمل لائقة للشباب.",
              "تهدف المشروعات الكبيرة التي تنفذها مصر إلى توفير فرص عمل مناسبة للشباب.",
              "إن المشروعات الكبرى التي تنفذها مصر تهدف إلى توفير فرص عمل كريمة للشباب."
            ],
            explanation: "نبدأ بالفعل العربي 'تهدف'، و'decent job opportunities' تعني 'فرص عمل كريمة / لائقة'.",
            marks: 3,
            difficulty: "Medium",
            topic: "English to Arabic Translation"
          },
          // 13. Listening and Translation
          {
            id: "tq_502",
            questionType: "listening_translation",
            questionText: "استمع إلى الجملة الصوتية ثم اكتب ترجمتها العربية الصحيحة:",
            instructions: "اضغط على زر التشغيل للاستماع للجملة ثم اكتب ترجمتها.",
            correctAnswer: "التعليم هو السلاح الأقوى لتغيير العالم.",
            alternativeAnswers: [
              "التعليم هو أقوى سلاح لتغيير العالم.",
              "إن التعليم هو أقوى سلاح يمكن استخدامه لتغيير العالم."
            ],
            explanation: "الجملة المنطوقة هي مقولة نيلسون مانديلا الشهيرة: 'Education is the most powerful weapon which you can use to change the world.'",
            marks: 3,
            difficulty: "Medium",
            topic: "Listening Translation",
            audioUrl: "https://actions.google.com/sounds/v1/speech/quote_mandela.mp3"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 6: Sentence Translation
  // ==========================================
  {
    id: "tm_sec1_t1_mod6",
    code: "mod_sentences",
    titleAr: "ترجمة الجمل في مجالات الحياة المختلفة",
    titleEn: "Field-Specific Sentence Translation",
    descriptionAr: "ترجمة جمل متخصصة في العلوم، الاقتصاد، المشروعات القومية، الذكاء الاصطناعي، والبيئة.",
    descriptionEn: "Domain-specific sentence translation covering sciences, economy, national projects, AI, and green initiatives.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 6,
    icon: "Compass",
    lessons: [
      {
        id: "tl_m6_l1",
        moduleId: "tm_sec1_t1_mod6",
        orderIndex: 1,
        titleAr: "جمل الذكاء الاصطناعي والتطور الرقمي",
        titleEn: "Artificial Intelligence & Digital Transformation Sentences",
        summaryAr: "المصطلحات التقنية الحديثة وكيفية صياغتها بدقة مثل: التحول الرقمي، الأمن السيبراني، والخوارزميات.",
        summaryEn: "Modern technology terminology: Digital transformation, Cybersecurity, and Algorithms.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "19 mins",
        pdfUrl: "/curriculum/translation_ai_sentences.pdf",
        rules: [
          {
            id: "r_m6_l1_1",
            titleAr: "ترجمة المصطلحات التقنية المركبة",
            titleEn: "Translating Compound Technical Terms",
            ruleAr: "الأسماء المركبة التقنية تترجم بالإنجليزية بإيراد المضاف إليه كصفة سابقة للاسم: 'الأمن السيبراني' = Cybersecurity، 'التحول الرقمي' = Digital transformation.",
            ruleEn: "In compound terms, adjectives or modifying nouns precede the head noun in English.",
            examples: [
              { ar: "يساهم التحول الرقمي في تبسيط الإجراءات الحكومية.", en: "Digital transformation contributes to simplifying governmental procedures.", note: "contribute to يأتي بعدها gerund (-ing)." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m6_1", en: "Digital transformation", ar: "التحول الرقمي", ipa: "/ˈdɪdʒ.ɪ.təl træns.fəˈmeɪ.ʃən/", pos: "noun", exampleEn: "Digital transformation enhances efficiency.", exampleAr: "يعزز التحول الرقمي الكفاءة." },
          { id: "v_m6_2", en: "Cybersecurity", ar: "الأمن السيبراني", ipa: "/ˈsaɪ.bə.sɪˌkjʊə.rə.ti/", pos: "noun", exampleEn: "Cybersecurity is essential for data protection.", exampleAr: "الأمن السيبراني ضروري لحماية البيانات." }
        ],
        solvedExamples: [
          {
            id: "se_m6_1",
            direction: "ar_to_en",
            sourceText: "أصبح الذكاء الاصطناعي جزءاً لا يتجزأ من حياتنا المعاصرة.",
            targetText: "Artificial intelligence has become an integral part of our modern life.",
            steps: [
              "1. الذكاء الاصطناعي = Artificial intelligence (AI)",
              "2. أصبح = has become (مضارع تام - أثره حاضر)",
              "3. جزءاً لا يتجزأ = an integral part of",
              "4. حياتنا المعاصرة = our modern life / contemporary life"
            ],
            notesAr: "متلازمة 'جزء لا يتجزأ' تترجم دائماً an integral part of.",
            notesEn: "'Integral part of' is the exact idiomatic equivalent of 'جزء لا يتجزأ'."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m6_1",
            wrongSentence: "Artificial intelligence became part cannot be divided.",
            correctSentence: "Artificial intelligence has become an integral part of our lives.",
            explanationAr: "خطأ ترجمة 'لا يتجزأ' حرفياً. المصطلح الفصيح هو integral part.",
            explanationEn: "Use the idiom 'integral part', not literal 'cannot be divided'."
          }
        ],
        questions: [
          {
            id: "tq_601",
            questionType: "mcq",
            questionText: "اختر الترجمة الصحيحة: 'يمثل التغير المناخي تهديداً خطيراً للأمن الغذائي العالمي.'",
            instructions: "اختر الإجابة الأدق علمياً ولغوياً.",
            options: [
              "Climate change represents a serious threat to global food security.",
              "The weather change represent a dangerous threat to food security world.",
              "Climate changes represents serious threat for global food security.",
              "Climate changing represents a seriously threaten to food security."
            ],
            correctAnswer: "Climate change represents a serious threat to global food security.",
            explanation: "التغير المناخي = Climate change (مفرد لا يعد)، تهديد خطير = a serious threat، الأمن الغذائي العالمي = global food security.",
            marks: 2,
            difficulty: "Medium",
            topic: "Environmental Translation"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 7: Paragraph Translation
  // ==========================================
  {
    id: "tm_sec1_t1_mod7",
    code: "mod_paragraphs",
    titleAr: "ترجمة الفقرات المتكاملة وأدوات الربط",
    titleEn: "Paragraph Translation & Cohesive Devices",
    descriptionAr: "ترجمة فقرات كاملة متماسكة، استخدام الروابط البلاغية وعلامات الترقيم السليمة.",
    descriptionEn: "Translating multi-sentence cohesive passages, discourse markers, and punctuation rules.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 7,
    icon: "FileSpreadsheet",
    lessons: [
      {
        id: "tl_m7_l1",
        moduleId: "tm_sec1_t1_mod7",
        orderIndex: 1,
        titleAr: "روابط التماسك النصي (Cohesive Devices) في ترجمة الفقرة",
        titleEn: "Discourse Markers & Linking Devices in Paragraph Translation",
        summaryAr: "الفقرة ليست مجرد جمل متفرقة، بل نسيج متكامل يربطه روابط مثل: بالإضافة إلى ذلك (Moreover / Furthermore)، وعلى النقيض (In contrast)، وبالتالي (Consequently).",
        summaryEn: "A translated paragraph must flow organically through linking words such as 'Moreover', 'Consequently', and 'In contrast'.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "25 mins",
        pdfUrl: "/curriculum/translation_paragraphs_linking.pdf",
        rules: [
          {
            id: "r_m7_l1_1",
            titleAr: "توظيف أدوات الربط وعلامات الترقيم",
            titleEn: "Punctuation with Linking Words",
            ruleAr: "الروابط في بداية الجملة يتبعها دائماً فاصلة (Comma): Moreover, / However, / Consequently,.",
            ruleEn: "Sentence starters like 'Moreover', 'However', and 'Therefore' must be followed by a comma.",
            examples: [
              { ar: "علاوة على ذلك، يجب تشجيع الاستثمار.", en: "Furthermore, investment must be encouraged.", note: "فاصلة بعد Furthermore." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m7_1", en: "Consequently", ar: "ونتيجة لذلك / بناءً عليه", ipa: "/ˈkɒn.sɪ.kwənt.li/", pos: "adverb", exampleEn: "Consequently, productivity increased.", exampleAr: "ونتيجة لذلك، زادت الإنتاجية." },
          { id: "v_m7_2", en: "Furthermore", ar: "علاوة على ذلك / فضلاً عن ذلك", ipa: "/ˌfɜː.ðəˈmɔːr/", pos: "adverb", exampleEn: "Furthermore, new laws were enacted.", exampleAr: "علاوة على ذلك، تم سن قوانين جديدة." }
        ],
        solvedExamples: [
          {
            id: "se_m7_1",
            direction: "ar_to_en",
            sourceText: "يواجه العالم اليوم تحديات بيئية جسيمة، وعلى رأسها الاحتباس الحراري. لذلك، بات لزاماً على كافة الدول التعاون معاً للحد من الانبعاثات الكربونية.",
            targetText: "Today, the world faces severe environmental challenges, chief among which is global warming. Therefore, it has become imperative for all nations to cooperate to reduce carbon emissions.",
            steps: [
              "1. تقسيم الفقرة إلى فكرتين متكاملتين.",
              "2. ترجمة 'على رأسها': chief among which / primarily.",
              "3. أداة الربط 'لذلك': Therefore, / Consequently, متبوعة بفاصلة.",
              "4. 'بات لزاماً': it has become imperative."
            ],
            notesAr: "كلمة imperative تعني حتمياً أو لازماً بشكل عاجل.",
            notesEn: "'Imperative' carries urgency and necessity."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m7_1",
            wrongSentence: "Consequently education improved.",
            correctSentence: "Consequently, education improved.",
            explanationAr: "إهمال الفاصلة بعد الرابط في بداية الجملة ينقص علامات الترقيم.",
            explanationEn: "Missing comma after introductory conjunctive adverbs."
          }
        ],
        questions: [
          // 14. Paragraph Translation
          {
            id: "tq_701",
            questionType: "paragraph_translation",
            questionText: "ترجم الفقرة التالية إلى اللغة الإنجليزية ترجمة متماسكة وسليمة:\n\n'تولي مصر اهتماماً بالغاً بقطاع الشباب، وتسعى لتأهيلهم لمتطلبات سوق العمل الحديث. ومن ثم، أطلقت الحكومة العديد من المبادرات الرقمية لتنمية مهاراتهم التكنولوجية.'",
            instructions: "ترجم الفقرة كاملة مع مراعاة علامات الترقيم والروابط المنطقية.",
            correctAnswer: "Egypt pays great attention to the youth sector and seeks to qualify them for modern labor market requirements. Hence, the government has launched numerous digital initiatives to develop their technological skills.",
            alternativeAnswers: [
              "Egypt attaches great importance to the youth sector and strives to qualify them for the requirements of the modern job market. Consequently, the government has launched several digital initiatives to develop their technological skills.",
              "Egypt pays great attention to youth and aims to prepare them for modern labor market demands. Therefore, the government launched many digital initiatives to enhance their technical skills."
            ],
            explanation: "تولي اهتماماً بالغاً = pays great attention to / attaches great importance to. سوق العمل = labor market / job market. ومن ثم = Hence, / Consequently,. مبادرات رقمية = digital initiatives.",
            marks: 5,
            difficulty: "Hard",
            topic: "Paragraph Translation"
          }
        ]
      }
    ]
  },

  // ==========================================
  // MODULE 8: Exam Translation Practice
  // ==========================================
  {
    id: "tm_sec1_t1_mod8",
    code: "mod_exams",
    titleAr: "تدريبات ونماذج امتحانات الوزارة والبوكليت",
    titleEn: "Ministry Exam Models & Final Practice",
    descriptionAr: "تدريب عملي على نماذج امتحانات الثانوية العامة والأول الثانوي، تدريب تحت وقت محدد ونظام البوكليت الحديث.",
    descriptionEn: "Authentic Ministry practice tests, timed exam simulations, and modern Egyptian booklet models.",
    grade: "First Secondary",
    term: "First Term",
    orderIndex: 8,
    icon: "Award",
    lessons: [
      {
        id: "tl_m8_l1",
        moduleId: "tm_sec1_t1_mod8",
        orderIndex: 1,
        titleAr: "استراتيجيات التعامل مع أسئلة الترجمة الاختيارية (MCQ Strategies)",
        titleEn: "Exam Elimination & Verification Strategies for Translation MCQ",
        summaryAr: "كيف تكتشف الكلمة الفخ (Trick word) في أسئلة الترجمة بنظام الاختيار من متعدد: فحص الفاعل، نفي أو إثبات الفعل، حروف الجر، والمفردات المتشابهة في النطق (homophones).",
        summaryEn: "Techniques for eliminating distractor options in Ministry MCQ translation questions.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoDuration: "24 mins",
        pdfUrl: "/curriculum/translation_exam_strategies.pdf",
        rules: [
          {
            id: "r_m8_l1_1",
            titleAr: "طريقة الاستبعاد الذكي (Smart Elimination)",
            titleEn: "Smart Elimination Method",
            ruleAr: "قارن الخيارات الأربعة سطراً بسطر وحدد الكلمات المختلفة؛ ستجد أن ثلاث خيارات تحتوي على أخطاء دقيقة في حرف جر أو تصريف فعل أو عكس المعنى.",
            ruleEn: "Compare the four options word-by-word; three options will contain subtle traps in tense, prepositions, or opposite meanings.",
            examples: [
              { ar: "مثال فخ: Economic vs Economical", en: "Economic = اقتصادي (متعلق بعلم الاقتصاد)، Economical = مقتصد / موفر.", note: "الخلط بينهما شائع جداً في الامتحانات." }
            ]
          }
        ],
        vocabulary: [
          { id: "v_m8_1", en: "Economic growth", ar: "النمو الاقتصادي", ipa: "/ˌiː.kəˈnɒm.ɪk ɡrəʊθ/", pos: "phrase", exampleEn: "Economic growth improves living standards.", exampleAr: "يحسن النمو الاقتصادي مستويات المعيشة." },
          { id: "v_m8_2", en: "Self-reliance", ar: "الاعتماد على النفس / الاكتفاء الذاتي", ipa: "/ˌself.rɪˈlaɪ.əns/", pos: "noun", exampleEn: "Youth should be trained in self-reliance.", exampleAr: "ينبغي تدريب الشباب على الاعتماد على النفس." }
        ],
        solvedExamples: [
          {
            id: "se_m8_1",
            direction: "ar_to_en",
            sourceText: "يجب علينا جميعاً التكاتف من أجل القضاء على الأمية والبطالة.",
            targetText: "All of us must join hands to eradicate illiteracy and unemployment.",
            steps: [
              "1. يجب علينا جميعاً = All of us must / We all should",
              "2. يتكاتف = join hands / cooperate",
              "3. القضاء على = eradicate / eliminate / wipe out",
              "4. الأمية والبطالة = illiteracy and unemployment"
            ],
            notesAr: "متلازمة join hands تعني يتكاتف.",
            notesEn: "'Join hands' is an idiomatic synonym for 'cooperate'."
          }
        ],
        commonMistakes: [
          {
            id: "cm_m8_1",
            wrongSentence: "Join hands to dead illiteracy.",
            correctSentence: "Join hands to eradicate illiteracy.",
            explanationAr: "خطأ فادح في ترجمة القضاء على بـ dead. الصحيح eradicate أو eliminate.",
            explanationEn: "Use 'eradicate' or 'eliminate' for wiping out social problems."
          }
        ],
        questions: [
          {
            id: "tq_801",
            questionType: "mcq",
            questionText: "اختر الترجمة الإنجليزية الصحيحة للجملة: 'إن حب الوطن والتضحية من أجله واجب مقدس على كل مواطن مخلص.'",
            instructions: "اختر الإجابة الصحيحة بالاستبعاد الدقيق.",
            options: [
              "Patriotism and sacrifice for one's homeland is a sacred duty for every loyal citizen.",
              "Loving country and dead for it are holy work for every citizen loyalty.",
              "Patriotism and sacrificing for homeland are sacred obligation on citizen loyal.",
              "The love of homeland and sacrifice for it is a scary duty for each citizen."
            ],
            correctAnswer: "Patriotism and sacrifice for one's homeland is a sacred duty for every loyal citizen.",
            explanation: "حب الوطن = Patriotism، التضحية من أجله = sacrifice for one's homeland، واجب مقدس = a sacred duty، مواطن مخلص = a loyal citizen.",
            marks: 2,
            difficulty: "Hard",
            topic: "Exam MCQ"
          },
          {
            id: "tq_802",
            questionType: "ar_to_en_text",
            questionText: "امتحان شامل - ترجم إلى الإنجليزية: 'التعليم الجيد والاستثمار في البشر هما الضمان الحقيقي لمستقبل أفضل للأجيال القادمة.'",
            instructions: "اكتب ترجمة نموذجية محكمة.",
            correctAnswer: "Quality education and investing in human capital are the real guarantee for a better future for coming generations.",
            alternativeAnswers: [
              "Good education and investing in human capital are the true guarantee for a better future for future generations.",
              "Quality education and human investment are the real guarantee of a better future for next generations.",
              "Good education and investment in people are the real guarantee for a better future for future generations."
            ],
            explanation: "التعليم الجيد = Quality education، الاستثمار في البشر = investing in human capital / investment in people، الضمان الحقيقي = the real guarantee، الأجيال القادمة = coming generations / future generations.",
            marks: 4,
            difficulty: "Hard",
            topic: "Final Exam Model"
          }
        ]
      }
    ]
  }
];

export const SAMPLE_TRANSLATION_EXAMS = [
  {
    id: "te_first_sec_term1_final",
    moduleId: "tm_sec1_t1_mod8",
    titleAr: "الامتحان الشامل لأكاديمية الترجمة — الصف الأول الثانوي (الترم الأول)",
    titleEn: "Translation Academy Comprehensive Exam — First Secondary (Term 1)",
    grade: "First Secondary",
    term: "First Term",
    timeLimitMinutes: 30,
    passingScore: 60,
    questionIds: [
      "tq_101",
      "tq_102",
      "tq_103",
      "tq_201",
      "tq_301",
      "tq_401",
      "tq_501",
      "tq_601",
      "tq_701",
      "tq_801",
      "tq_802"
    ],
    isPublished: true
  }
];
