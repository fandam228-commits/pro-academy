import { CURRICULUM_2026_GRADES } from "../config/curriculum-2026.ts";
import type {
  CurriculumGradeSpec,
  CurriculumUnitSpec,
} from "../config/curriculum-2026.ts";

export interface WordItem {
  word: string;
  partOfSpeech: string;
  arabicMeaning: string;
  definitionEn: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  phrasalVerbs?: string[];
  wordFormations?: { verb?: string; noun?: string; adjective?: string; adverb?: string };
  exampleSentences: string[];
}

export interface GrammarRuleItem {
  ruleTitleAr: string;
  ruleTitleEn: string;
  detailedExplanationAr: string;
  detailedExplanationEn: string;
  usages: string[];
  sentenceStructures: { form: string; rule: string; example: string }[];
  solvedExamples: { sentence: string; explanation: string }[];
  similarRulesComparison: { ruleA: string; ruleB: string; distinction: string }[];
  commonMistakes: { incorrect: string; correct: string; why: string }[];
  interactiveExercises: {
    id: string;
    type: "mcq" | "rewrite" | "correct_mistake";
    prompt: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export interface WritingSkillItem {
  type: "paragraph" | "essay" | "email" | "formal_informal";
  titleAr: string;
  titleEn: string;
  guidelines: string[];
  writingVocabulary: string[];
  usefulExpressions: { category: string; expressions: string[] }[];
  templates: { title: string; templateText: string; structureBreakdown: string[] }[];
  modelAnswers: { topic: string; modelText: string; commentary: string }[];
  guidedPractice: { prompt: string; hints: string[]; stepByStepGuide: string[] };
  independentPracticePrompt: string;
  assessmentCriteria: { criterion: string; maxScore: number; description: string }[];
}

export interface StoryChapterItem {
  chapterNumber: number;
  titleAr: string;
  titleEn: string;
  explanation: string;
  videoUrl?: string;
  pdfUrl?: string;
  vocabulary: { word: string; meaningAr: string; definitionEn: string; example: string }[];
  characters: { name: string; role: string; descriptionAr: string; traits: string[] }[];
  events: { order: number; titleAr: string; titleEn: string; description: string }[];
  importantQuotes: { quote: string; speaker: string; listener: string; situation: string; significance: string }[];
  questionsAndAnswers: { question: string; answer: string; type: "critical_thinking" | "factual" }[];
  mcqQuestions: { question: string; options: string[]; correctAnswer: string; explanation: string }[];
  // 10 Activatable Sections for Baccalaureate:
  chapterSummary?: string;
  openEndedQuestions?: { question: string; sampleGuideline: string }[];
  criticalThinkingQuestions?: { question: string; prompt: string }[];
  jreActivities?: { title: string; instructions: string }[];
  interactiveTestQuizId?: string;
}

export interface CurriculumSeedGrade {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  stage: "Preparatory" | "Secondary";
  descriptionAr: string;
  descriptionEn: string;
  courseId: string;
  story: {
    titleAr: string;
    titleEn: string;
    author: string;
    descriptionAr: string;
    descriptionEn: string;
    coverImage: string;
    chapters: StoryChapterItem[];
  };
  units: {
    unitNumber: number;
    type: "unit" | "review";
    titleAr: string;
    titleEn: string;
    reviewScope?: string;
    descriptionAr: string;
    descriptionEn: string;
    orderIndex: number;
    sections: {
      sectionType:
        | "vocabulary"
        | "grammar"
        | "section_a"
        | "section_b"
        | "reading"
        | "listening"
        | "speaking"
        | "writing"
        | "exercises"
        | "interactive_test"
        | "video_lessons"
        | "mixed_review"
        | "comprehensive_test";
      titleAr: string;
      titleEn: string;
      videoUrl?: string;
      pdfUrl?: string;
      quizId?: string;
      contentData: any;
    }[];
  }[];
}

/**
 * Builds rich unit sections for each unit spec
 */
function buildUnitSections(gradeCode: string, unit: CurriculumUnitSpec) {
  if (unit.type === "review") {
    return [
      {
        sectionType: "mixed_review" as const,
        titleAr: `ملخص ومراجعة مجمعة — ${unit.titleAr}`,
        titleEn: `Consolidated Review — ${unit.titleEn}`,
        contentData: {
          scope: unit.reviewScope,
          summaryPoints: [
            "مراجعة المفردات والتراكيب اللغوية الأساسية والمتلازمات.",
            "مقارنات القواعد اللغوية والفروق الدقيقة وأزمنة الأفعال.",
            "فنون كتابة المقال والفقرة والربط اللغوي (Cohesive Devices).",
          ],
        },
      },
      {
        sectionType: "comprehensive_test" as const,
        titleAr: `امتحان شامل تفاعلي (${unit.reviewScope})`,
        titleEn: `Comprehensive Interactive Exam (${unit.reviewScope})`,
        quizId: `quiz_rev_${gradeCode}_${unit.orderIndex}`,
        contentData: {
          durationMinutes: 45,
          totalPoints: 100,
          passPercentage: 60,
        },
      },
    ];
  }

  // Core Unit Sections
  if (gradeCode === "sec_2_bac") {
    const concept = unit.concept || "Global Citizenship & Well-being";
    return [
      {
        sectionType: "vocabulary" as const,
        titleAr: `المفردات وتراكيب المفهوم (${concept}) — ${unit.titleAr}`,
        titleEn: `Concept & Vocabulary Drill (${concept}) — ${unit.titleEn}`,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        pdfUrl: `/pdfs/sec_2_bac-u${unit.unitNumber}-vocab.pdf`,
        contentData: {
          concept,
          part: unit.part || "Part One",
          words: [
            {
              word: "Well-being",
              partOfSpeech: "noun",
              arabicMeaning: "الرفاهية وجودة الحياة الشاملة",
              definitionEn: "The state of being comfortable, healthy, or happy.",
              synonyms: ["welfare", "health", "prosperity"],
              antonyms: ["misery", "deprivation"],
              collocations: ["physical well-being", "promote well-being", "sense of well-being"],
              wordFormations: { noun: "well-being" },
              exampleSentences: [
                "Maintaining a balanced lifestyle contributes directly to emotional and physical well-being.",
                "Modern schools design holistic environments to enhance student well-being.",
              ],
            },
            {
              word: "Consumption",
              partOfSpeech: "noun",
              arabicMeaning: "الاستهلاك والأنماط الاستهلاكية",
              definitionEn: "The using up of a resource, or the purchase and use of goods and services.",
              synonyms: ["utilization", "expenditure", "depletion"],
              antonyms: ["conservation", "preservation"],
              collocations: ["conspicuous consumption", "energy consumption", "sustainable consumption"],
              wordFormations: { verb: "consume", noun: "consumer / consumption", adjective: "consumable" },
              exampleSentences: [
                "Responsible consumption is essential for preserving planetary resources for future generations.",
                "Understanding the drivers behind consumer choices helps combat invisible consumption habits.",
              ],
            },
            {
              word: "Belonging",
              partOfSpeech: "noun",
              arabicMeaning: "الانتماء والشعور بالارتباط الاجتماعي",
              definitionEn: "An affinity for a place, group, or situation; feeling accepted and valued.",
              synonyms: ["inclusion", "connectedness", "affinity"],
              antonyms: ["alienation", "isolation"],
              collocations: ["sense of belonging", "community belonging", "foster belonging"],
              wordFormations: { verb: "belong", noun: "belonging" },
              exampleSentences: [
                "A strong sense of belonging within a school community enhances academic performance and confidence.",
                "Inclusive initiatives ensure every member feels valued in circles of belonging.",
              ],
            },
            {
              word: "Resilience",
              partOfSpeech: "noun",
              arabicMeaning: "المرونة النفسية والقدرة على مواجهة التحديات",
              definitionEn: "The ability to recover quickly from illness, change, or misfortune.",
              synonyms: ["toughness", "adaptability", "endurance"],
              antonyms: ["fragility", "vulnerability"],
              collocations: ["build resilience", "emotional resilience", "community resilience"],
              wordFormations: { noun: "resilience", adjective: "resilient", adverb: "resiliently" },
              exampleSentences: [
                "Developing personal resilience empowers young adults to navigate an increasingly complex world.",
                "Echoes of the past teach us that societies endure through collective resilience.",
              ],
            },
          ],
        },
      },
      {
        sectionType: "grammar" as const,
        titleAr: `القواعد والتراكيب اللغوية (Grammar & Structures) — ${unit.grammarTopicAr || unit.titleAr}`,
        titleEn: `Grammar & Language Structures — ${unit.grammarTopicEn || unit.titleEn}`,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        pdfUrl: `/pdfs/sec_2_bac-u${unit.unitNumber}-grammar.pdf`,
        contentData: {
          ruleTitleAr: unit.grammarTopicAr || `قواعد ${unit.titleAr}`,
          ruleTitleEn: unit.grammarTopicEn || `Grammar: ${unit.titleEn}`,
          detailedExplanationAr: `شرح متقدم وتفصيلي لقواعد وتراكيب ${unit.grammarTopicAr || unit.titleAr} في إطار معايير البكالوريا المصرية، مع التركيز على الفروق الدقيقة والدلالات السياقية.`,
          detailedExplanationEn: `Advanced linguistic breakdown of ${unit.grammarTopicEn || unit.titleEn} meeting Egyptian Baccalaureate specifications with focus on pragmatic nuances and register distinctions.`,
          usages: [
            "تطبيق التراكيب اللغوية المتقدمة في التعبير عن الآراء المعقدة.",
            "الربط المحكم بين الأفكار في النصوص التحليلية والمقالية.",
            "التعامل مع الصيغ الاستثنائية ونماذج أسئلة امتحانات البكالوريا الرسمية.",
          ],
          sentenceStructures: [
            {
              form: "Affirmative (الإثبات المتقدم)",
              rule: "Subject + Advanced Modal / Perfect Construction + Complement",
              example: "Critical evaluation of historical records has enabled historians to uncover neglected narratives.",
            },
            {
              form: "Negative & Inversion (النفي وتقديم الفعل)",
              rule: "Negative Adverbial + Auxiliary + Subject + Main Verb...",
              example: "Rarely do modern consumers pause to reflect upon the hidden ecological cost of fast fashion.",
            },
          ],
          solvedExamples: [
            {
              sentence: "Had they recognized the severity of the greenhouse effect earlier, swift mitigations would have been implemented.",
              explanation: "حالة شرطية ثالثة متقدمة بحذف If واستخدام Inversion (Had + Subject + P.P) لبيان الافتراض المعاكس لما حدث في الماضي.",
            },
          ],
          similarRulesComparison: [
            {
              ruleA: "Inversion for Emphasis (تقديم الفعل للتأكيد)",
              ruleB: "Standard Affirmative Syntax (التركيب الطبيعي)",
              distinction: "تقديم الظروف المنفية (Seldom, Rarely, Scarcely) يضفي أسلوباً بلاغياً رسمياً مناسباً لكتابة المقال الأكاديمي.",
            },
          ],
          commonMistakes: [
            {
              incorrect: "Rarely we see such profound transformations in consumption patterns.",
              correct: "Rarely do we see such profound transformations in consumption patterns.",
              why: "عند بدء الجملة بظرف منفي مثل Rarely يلزم تقديم الفعل المساعد على الفاعل (Inversion).",
            },
          ],
          interactiveExercises: [
            {
              id: `q_sec_2_bac_u${unit.unitNumber}_1`,
              type: "mcq",
              prompt: `Select the sentence exhibiting flawless structural inversion relevant to ${unit.titleEn}:`,
              options: [
                "Seldom have individuals demonstrated such resilience in complex crises.",
                "Seldom individuals have demonstrated such resilience.",
                "Seldom did individuals demonstrated such resilience.",
                "Seldom individuals demonstrated resilience.",
              ],
              correctAnswer: "Seldom have individuals demonstrated such resilience in complex crises.",
              explanation: "Inversion requires: Negative adverbial + auxiliary (have) + subject (individuals) + past participle (demonstrated).",
            },
          ],
        },
      },
      {
        sectionType: "section_a" as const,
        titleAr: `القسم (Section A): استكشاف المفهوم وسياق التعلم`,
        titleEn: `Section A: Explorations & Context (${concept})`,
        contentData: {
          concept,
          part: unit.part || "Part One",
          unitTitle: unit.titleEn,
          thematicFocus: `In-depth exploration of ${concept} and its core cultural and global intersections.`,
          explorationPassages: [
            {
              subtitle: `Contextual Foundation: ${unit.titleEn}`,
              text: `Contemporary discourse increasingly emphasizes how ${concept.toLowerCase()} shapes our societal choices. Exploring this domain enables students to develop nuanced frameworks for evaluating everyday decisions and long-term implications.`,
            },
          ],
        },
      },
      {
        sectionType: "section_b" as const,
        titleAr: `القسم (Section B): التفكير النقدي والاستخدام العملي`,
        titleEn: `Section B: Critical Engagement & In-Use Language`,
        contentData: {
          concept,
          discussionPrompts: [
            `How does the concept of ${concept} manifest in everyday Egyptian life and future career aspirations?`,
            `Analyze the tension between individual desires and collective responsibilities within ${unit.titleEn}.`,
          ],
          collocationsInUse: [
            { phrase: "foster deep engagement", usage: "To cultivate meaningful and sustained interaction with the topic." },
            { phrase: "navigate complexities", usage: "To deal successfully with challenging situations." },
          ],
        },
      },
      {
        sectionType: "reading" as const,
        titleAr: `مهارات القراءة والتحليل النصي (Reading Comprehension)`,
        titleEn: `Reading Comprehension Passage & Analysis`,
        contentData: {
          passageTitle: `${unit.titleEn}: Critical Perspectives`,
          textType: "Expository / Analytical Article",
          passageContent: `In examining ${unit.titleEn.toLowerCase()}, educators and scholars underscore the profound impact of ${concept.toLowerCase()} on contemporary youth. As technological and social paradigms shift, the necessity for critical discernment becomes indisputable. Through rigorous inquiry, learners distinguish superficial impressions from substantive realities, constructing reasoned arguments grounded in verifiable evidence.`,
          comprehensionQuestions: [
            {
              question: "What central thesis does the text advance regarding the modern significance of this theme?",
              guideline: "Students should identify that critical discernment and substantive analysis are vital in evaluating contemporary shifts.",
            },
            {
              question: "Infer the contextual nuance of 'substantive realities' as utilized in the final sentence.",
              guideline: "Refers to well-founded, verifiable facts rather than fleeting, superficial perceptions.",
            },
          ],
        },
      },
      {
        sectionType: "listening" as const,
        titleAr: `مهارات الاستماع والتمييز الصوتي (Listening Skills)`,
        titleEn: `Listening Skills & Auditory Drills`,
        contentData: {
          audioModule: `Official Baccalaureate Audio: Dialogue on ${unit.titleEn}`,
          audioDuration: "6 mins",
          scriptSummary: `A moderated dialogue between two academic researchers examining the real-world implications of ${concept.toLowerCase()}.`,
          auditoryTasks: [
            "Identify the speaker's main tone (analytical, cautionary, or optimistic).",
            "Transcribe key collocations and note transition markers used by both speakers.",
          ],
        },
      },
      {
        sectionType: "speaking" as const,
        titleAr: `مهارات المحادثة والتعبير الشفهي (Speaking & Discussion)`,
        titleEn: `Speaking Activities & Discussion Prompts`,
        contentData: {
          pairedSpeakingTask: `With a peer, debate the motion: 'Prioritizing ${concept.toLowerCase()} is the most critical foundation for 21st-century youth success.'`,
          framework: [
            "State your stance clearly using assertive academic registers (e.g., 'From my vantage point...', 'Evidence overwhelmingly suggests...').",
            "Acknowledge the counter-argument respectfully ('While it could be argued that...', 'Admittedly...').",
            "Conclude with a synthesizing statement.",
          ],
        },
      },
      {
        sectionType: "writing" as const,
        titleAr: `مهارات الكتابة والمقال الأكاديمي (Academic Writing)`,
        titleEn: `Academic Writing & Composition`,
        pdfUrl: `/pdfs/sec_2_bac-u${unit.unitNumber}-writing.pdf`,
        contentData: {
          type: "essay",
          titleAr: `فنون كتابة المقال الأكاديمي حول: ${unit.titleAr}`,
          titleEn: `Academic Writing: Exploring ${unit.titleEn}`,
          guidelines: [
            "صياغة جملة افتتاحية قوية (Hook) ترتبط بالمفهوم العام.",
            "تطوير فرضية المقال (Thesis Statement) بوضوح في الفقرة التمهيدية.",
            "استخدام أدوات الربط والـ Inversion والتراكيب المتقدمة لتعزيز رصانة الأسلوب.",
          ],
          modelAnswers: [
            {
              topic: `The Strategic Imperative of ${unit.titleEn} in the 21st Century`,
              modelText: `In an era defined by rapid technological and social transformations, ${unit.titleEn} emerges as an indispensable cornerstone of human flourishing. First and foremost, addressing ${concept.toLowerCase()} enables individuals to navigate complex environments with intellectual resilience. Furthermore, collaborative initiatives demonstrate that societal progress is inherently tied to shared civic responsibility. In conclusion, dedicating intellectual rigor to this field guarantees a prosperous and enlightened future for upcoming generations.`,
              commentary: "Exemplifies Baccalaureate standards with advanced cohesion, academic vocabulary, and balanced thematic argumentation.",
            },
          ],
        },
      },
      {
        sectionType: "exercises" as const,
        titleAr: `تدريبات وتمارين متنوعة (Practice Drills)`,
        titleEn: `Practice Drills & Applied Exercises`,
        contentData: {
          exerciseSets: [
            {
              category: "Lexical & Collocation Drills",
              totalQuestions: 10,
              focus: `Applying target vocabulary and prepositions for ${unit.titleEn}.`,
            },
            {
              category: "Advanced Structural Transformations",
              totalQuestions: 10,
              focus: `Sentence rewriting, inversion, and conditional mastery.`,
            },
          ],
        },
      },
      {
        sectionType: "interactive_test" as const,
        titleAr: `الامتحان التفاعلي للوحدة (Unit Interactive Test)`,
        titleEn: `Unit Interactive Assessment`,
        quizId: `quiz_sec_2_bac_u${unit.unitNumber}`,
        contentData: {
          durationMinutes: 30,
          totalPoints: 50,
          passPercentage: 60,
          skillsAssessed: ["Vocabulary & Collocations", "Grammar & Inversion", "Reading Comprehension", "Writing Mechanics"],
        },
      },
      {
        sectionType: "video_lessons" as const,
        titleAr: `شروحات الفيديو مع مستر حبيب الرحمن (Video Lessons)`,
        titleEn: `Video Lessons with Mr. Habib El Rahman`,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        contentData: {
          instructor: "Mr. Habib El Rahman",
          seriesTitle: `Second Year Egyptian Baccalaureate Master Class 2026/2027`,
          lectureTitle: `${unit.titleEn} — الشرح الكامل والشامل مع حل التمارين`,
          duration: "45 mins",
        },
      },
    ];
  }

  // Core Unit Sections for other grades
  return [
    {
      sectionType: "vocabulary" as const,
      titleAr: `الكلمات والمفردات اللغوية (Vocabulary) — ${unit.titleAr}`,
      titleEn: `Vocabulary & Lexical Drill — ${unit.titleEn}`,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      pdfUrl: `/pdfs/${gradeCode}-u${unit.unitNumber}-vocab.pdf`,
      contentData: {
        words: [
          {
            word: "Innovation",
            partOfSpeech: "noun",
            arabicMeaning: "ابتكار / تجديد إبداعي",
            definitionEn: "The action or process of introducing new ideas, devices, or methods.",
            synonyms: ["breakthrough", "novelty", "advancement"],
            antonyms: ["tradition", "stagnation"],
            collocations: ["technological innovation", "encourage innovation", "foster innovation"],
            phrasalVerbs: ["come up with innovative ideas"],
            wordFormations: { verb: "innovate", noun: "innovation / innovator", adjective: "innovative" },
            exampleSentences: [
              "Technological innovation plays a pivotal role in Egypt's sustainable development.",
              "Our school curriculum encourages scientific innovation among students.",
            ],
          },
          {
            word: "Resilience",
            partOfSpeech: "noun",
            arabicMeaning: "مرونة وقدرة على الصمود وتخطي الصعاب",
            definitionEn: "The capacity to withstand or recover quickly from difficulties; toughness.",
            synonyms: ["toughness", "endurance", "perseverance"],
            antonyms: ["fragility", "vulnerability"],
            collocations: ["build resilience", "emotional resilience", "economic resilience"],
            wordFormations: { noun: "resilience", adjective: "resilient", adverb: "resiliently" },
            exampleSentences: [
              "Students demonstrated extraordinary resilience throughout the examination period.",
              "Healthcare workers showed remarkable resilience in emergency situations.",
            ],
          },
          {
            word: "Sustainable",
            partOfSpeech: "adjective",
            arabicMeaning: "مستدام / صديق للبيئة وطويل الأمد",
            definitionEn: "Able to be maintained at a certain rate or level without exhausting natural resources.",
            synonyms: ["eco-friendly", "renewable", "viable"],
            antonyms: ["unsustainable", "depleting"],
            collocations: ["sustainable development", "sustainable energy", "sustainable practices"],
            wordFormations: { verb: "sustain", noun: "sustainability", adjective: "sustainable" },
            exampleSentences: [
              "Egypt is actively investing in sustainable solar and wind energy projects.",
              "Sustainable living requires reducing single-use plastics and conserving water.",
            ],
          },
          {
            word: "Collaborate",
            partOfSpeech: "verb",
            arabicMeaning: "يتعاون وينسق الجهود",
            definitionEn: "To work jointly on an activity, especially to produce or create something.",
            synonyms: ["cooperate", "team up", "partner"],
            antonyms: ["compete", "oppose"],
            collocations: ["collaborate on a project", "collaborate with peers", "closely collaborate"],
            wordFormations: { verb: "collaborate", noun: "collaboration / collaborator", adjective: "collaborative" },
            exampleSentences: [
              "Teachers and students collaborate to create engaging digital presentations.",
              "International researchers collaborate to protect endangered marine species.",
            ],
          },
        ],
      },
    },
    {
      sectionType: "grammar" as const,
      titleAr: `شرح القواعد اللغوية (Grammar) — ${unit.grammarTopicAr || unit.titleAr}`,
      titleEn: `Grammar Focus — ${unit.grammarTopicEn || unit.titleEn}`,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      pdfUrl: `/pdfs/${gradeCode}-u${unit.unitNumber}-grammar.pdf`,
      contentData: {
        ruleTitleAr: unit.grammarTopicAr || `قواعد ${unit.titleAr}`,
        ruleTitleEn: unit.grammarTopicEn || `Grammar: ${unit.titleEn}`,
        detailedExplanationAr: `شرح تفصيلي شامل لقاعدة ${unit.grammarTopicAr || unit.titleAr} مع بيان صياغة الإثبات والنفي والاستفهام واستخداماتها الامتحانية.`,
        detailedExplanationEn: `In-depth structural breakdown of ${unit.grammarTopicEn || unit.titleEn} covering affirmative, negative, interrogative, and exam-level edge cases.`,
        usages: [
          "التعبير عن الأحداث المرتبطة بسياق الوحدة بدقة لغوية.",
          "التمييز بين الحالات المتشابهة لتفادي أخطاء الاختيار من متعدد.",
          "التطبيق في كتابة المقال والترجمة الاحترافية.",
        ],
        sentenceStructures: [
          {
            form: "Affirmative (الإثبات)",
            rule: "Subject + Target Verb Form + Object / Complement",
            example: "The dedicated healthcare team has been working tirelessly to save the patient.",
          },
          {
            form: "Negative (النفي)",
            rule: "Subject + Auxiliary Verb + Not + Main Verb",
            example: "They have not completed the environmental audit yet.",
          },
          {
            form: "Question (الاستفهام)",
            rule: "Question Word + Auxiliary + Subject + Main Verb...?",
            example: "How long has Egypt been developing modern renewable energy stations?",
          },
        ],
        solvedExamples: [
          {
            sentence: "She has been reading the digital novel for three hours and is still on chapter 4.",
            explanation: "استخدمنا المضارع التام المستمر (has been reading) لأن الحدث بدأ في الماضي ومستمر حتى اللحظة الحالية مع ذكر المدة (for three hours).",
          },
          {
            sentence: "By the time the bell rang, the students had submitted their answers.",
            explanation: "استخدمنا الماضي التام (had submitted) لأنه الحدث الأسبق وقوعاً قبل رنين الجرس (rang).",
          },
        ],
        similarRulesComparison: [
          {
            ruleA: "Present Perfect Simple (المضارع التام البسيط)",
            ruleB: "Present Perfect Continuous (المضارع التام المستمر)",
            distinction: "البسيط يركز على اكتمال الحدث وعدد المرات والنتيجة الحالية، بينما المستمر يركز على استمرار الحدث وطول مدته الزمنية دون اشتراط اكتماله.",
          },
        ],
        commonMistakes: [
          {
            incorrect: "I am living here since 2020.",
            correct: "I have been living / have lived here since 2020.",
            why: "وجود since مع نقطة زمنية يتطلب زمناً تاماً وليس مضارعاً مستمراً عادياً.",
          },
          {
            incorrect: "He didn't finished his homework yet.",
            correct: "He hasn't finished his homework yet.",
            why: "كلمة yet في نهاية الجملة المنفية تأتي مع المضارع التام المنفي.",
          },
        ],
        interactiveExercises: [
          {
            id: `q_${gradeCode}_u${unit.unitNumber}_1`,
            type: "mcq",
            prompt: `Choose the correct option reflecting ${unit.grammarTopicEn || "the grammar rule"}:`,
            options: [
              "has been developing",
              "was developed",
              "is develop",
              "had developing",
            ],
            correctAnswer: "has been developing",
            explanation: "The context indicates an ongoing action starting in the past and continuing up to the present.",
          },
          {
            id: `q_${gradeCode}_u${unit.unitNumber}_2`,
            type: "correct_mistake",
            prompt: "Correct the underlined error: 'He has write three letters this morning.'",
            correctAnswer: "written",
            explanation: "The auxiliary 'has' requires the past participle (p.p) of the main verb: write -> wrote -> written.",
          },
        ],
      },
    },
    {
      sectionType: "writing" as const,
      titleAr: `مهارات الكتابة والتعبير (Writing Skills) — ${unit.titleAr}`,
      titleEn: `Writing Skills & Academic Expression — ${unit.titleEn}`,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      pdfUrl: `/pdfs/${gradeCode}-u${unit.unitNumber}-writing.pdf`,
      contentData: {
        type: "essay",
        titleAr: `فنون كتابة المقال الأكاديمي حول: ${unit.titleAr}`,
        titleEn: `Academic Writing: Exploring ${unit.titleEn}`,
        guidelines: [
          "صياغة جملة افتتاحية قوية (Hook) تجذب انتباه القارئ.",
          "كتابة فرضية المقال (Thesis Statement) بوضوح في الفقرة التمهيدية.",
          "تطوير فقرات متن المقال (Body Paragraphs) بأمثلة وشواهد وإحصائيات.",
          "استخدام أدوات الربط (Transition Words) لضمان انسيابية الأفكار.",
          "إعادة صياغة الفرضية في الخاتمة دون تكرار حرفي وتقديم توصية ختامية.",
        ],
        writingVocabulary: [
          "Furthermore",
          "Consequently",
          "In addition to",
          "On the contrary",
          "To sum up",
          "It is universally acknowledged that",
        ],
        usefulExpressions: [
          {
            category: "Introducing Main Points",
            expressions: ["First and foremost", "It is worth mentioning that", "A major contributing factor is"],
          },
          {
            category: "Expressing Contrast",
            expressions: ["However", "On the other hand", "While it is true that... yet..."],
          },
          {
            category: "Concluding",
            expressions: ["In conclusion", "Taking everything into account", "To recap the fundamental points"],
          },
        ],
        templates: [
          {
            title: "Standard Five-Paragraph Essay Template",
            templateText: "Introduction (Hook + Context + Thesis) -> Body Paragraph 1 (Topic sentence + Supporting evidence) -> Body Paragraph 2 (Counterargument or extension) -> Body Paragraph 3 (Real-world application) -> Conclusion (Restate thesis + Final thought).",
            structureBreakdown: ["Introduction", "Body 1", "Body 2", "Body 3", "Conclusion"],
          },
        ],
        modelAnswers: [
          {
            topic: `The Vital Role of ${unit.titleEn} in Modern Society`,
            modelText: `In an era defined by rapid technological and social transformations, ${unit.titleEn} emerges as an indispensable cornerstone of progress. First and foremost, embracing thoughtful practices enables individuals and institutions to overcome contemporary obstacles. Furthermore, collaborative initiatives demonstrate that collective resilience leads to long-term prosperity. In conclusion, investing dedication and intellectual rigor into this field guarantees a brighter, more sustainable future for upcoming generations.`,
            commentary: "A well-structured academic essay showcasing thesis clarity, varied lexical resources, and cohesive paragraph transitions.",
          },
        ],
        assessmentCriteria: [
          { criterion: "Task Achievement & Relevance", maxScore: 5, description: "Directly addresses the prompt with developed arguments." },
          { criterion: "Coherence & Cohesion", maxScore: 5, description: "Logical sequencing and effective linking words." },
          { criterion: "Lexical Resource", maxScore: 5, description: "Wide range of vocabulary with accurate collocations." },
          { criterion: "Grammatical Accuracy", maxScore: 5, description: "Varied sentence structures with minimal error rate." },
        ],
      },
    },
  ];
}

/**
 * Maps CurriculumGradeSpec into complete CurriculumSeedGrade
 */
function mapGradeSpecToSeed(spec: CurriculumGradeSpec): CurriculumSeedGrade {
  // Build Story chapters
  const storyChapters: StoryChapterItem[] = spec.story.sampleChapters.map((ch) => {
    if (spec.code === "sec_2_bac") {
      return {
        chapterNumber: ch.chapterNumber,
        titleAr: ch.titleAr,
        titleEn: ch.titleEn,
        explanation: ch.summaryAr,
        chapterSummary: ch.summaryAr,
        vocabulary: [
          { word: "Expedition", meaningAr: "بعثة استكشافية علمية", definitionEn: "A journey undertaken by a group of people with a particular purpose, especially that of exploration, scientific research, or war.", example: "The members of the expedition prepared themselves for the perils of South America." },
          { word: "Plateau", meaningAr: "هضبة مرتفعة منعزلة", definitionEn: "An area of relatively level high ground.", example: "The red cliffs of the volcanic plateau towered over the surrounding Amazonian jungle." },
          { word: "Prehistoric", meaningAr: "ما قبل التاريخ / كائنات غابرة", definitionEn: "Belonging to or existing in times before recorded history.", example: "Challenger claimed to have found living prehistoric creatures surviving in isolation." },
          { word: "Skepticism", meaningAr: "الشك العلمي والتمحيص", definitionEn: "A skeptical attitude; doubt as to the truth of something.", example: "Professor Summerlee regarded Challenger's claims with outspoken scientific skepticism." },
        ],
        characters: [
          { name: "Professor George Edward Challenger", role: "Leader & Zoologist", descriptionAr: "عالم حيوان عبقري ذو بنية هائلة وعزيمة حديدية لا تلين، أعلن للعالم عن اكتشاف الهضبة المنعزلة.", traits: ["Brilliant", "Fierce", "Dominant", "Unyielding"] },
          { name: "Edward Malone", role: "Journalist & Narrator", descriptionAr: "مراسل صحيفة الديلي غازيت، يسعى وراء مغامرة كبرى لإثبات شجاعته ويسجل وقائع الرحلة يوماً بيوم.", traits: ["Courageous", "Inquisitive", "Loyal", "Keen Observer"] },
          { name: "Lord John Roxton", role: "Sportsman & Explorer", descriptionAr: "مستكشف أرستقراطي بارع وشجاع، خبير بمجاهل الأمازون ويقود الجانب الميداني لحماية البعثة.", traits: ["Fearless", "Chivalrous", "Resourceful"] },
          { name: "Professor Summerlee", role: "Anatomist & Skeptic", descriptionAr: "عالم تشريح دقيق ومتشكك يرافق البعثة لتوثيق الأدلة العلمية وفحص صحة مزاعم تشالنجر بحيادية.", traits: ["Analytical", "Skeptical", "Meticulous"] },
        ],
        events: [
          { order: 1, titleAr: "الحدث الافتتاحي للفصل", titleEn: "Inciting Narrative Development", description: ch.summaryAr },
          { order: 2, titleAr: "المواجهة والاكتشاف", titleEn: "Key Discovery & Encounter", description: "تصاعد أحداث الاستكشاف والمواجهة الميدانية بين أعضاء البعثة وتحديات الهضبة." },
        ],
        importantQuotes: [
          {
            quote: "There are heroism and adventure waiting for any man who has the courage to seek them.",
            speaker: "Edward Malone",
            listener: "Himself / Gladys",
            situation: "Reflecting on his aspiration to undertake a great quest.",
            significance: "Establishes Malone's primary motivation for joining the perilous South American expedition.",
          },
          {
            quote: "I tell you that the thing is real, and the scientific world shall know it!",
            speaker: "Professor Challenger",
            listener: "The Scientific Meeting",
            situation: "Defending his South American discoveries before hostile academics.",
            significance: "Demonstrates Challenger's unwavering conviction against institutional skepticism.",
          },
        ],
        questionsAndAnswers: [
          {
            question: "How does Arthur Conan Doyle contrast the personalities of Challenger and Summerlee?",
            answer: "Challenger represents intuitive, passionate assertion, while Summerlee embodies methodical, unyielding scientific skepticism.",
            type: "critical_thinking",
          },
        ],
        mcqQuestions: [
          {
            question: "What primary narrative function does Edward Malone serve in this chapter?",
            options: [
              "The objective first-person chronicler of the expedition's trials",
              "The antagonist opposing Professor Challenger",
              "A minor spectator with no active involvement",
              "The financial sponsor of the South American voyage",
            ],
            correctAnswer: "The objective first-person chronicler of the expedition's trials",
            explanation: "Malone acts as the reader's eyes and ears, recording events with journalistic detail.",
          },
        ],
        openEndedQuestions: [
          {
            question: `Analyze the thematic significance of Chapter ${ch.chapterNumber} in advancing the novel's central conflict between scientific discovery and public skepticism.`,
            sampleGuideline: "[Teacher Ready Placeholder] Expect students to cite textual evidence regarding character motives and environmental descriptions.",
          },
        ],
        criticalThinkingQuestions: [
          {
            question: "To what extent does Malone's desire to impress Gladys influence his judgment when confronting existential danger?",
            prompt: "Reflect on how personal motivations intersect with professional duty in adventure literature.",
          },
        ],
        jreActivities: [
          {
            title: "Daily Gazette Special Correspondent Dispatch",
            instructions: `Draft a 200-word breaking news report as Edward Malone describing the events of Chapter ${ch.chapterNumber} for London readers.`,
          },
          {
            title: "Scientific Debate Role-play",
            instructions: "Enact a dialogue between Challenger and Summerlee debating the biological plausibility of the creatures observed.",
          },
        ],
        interactiveTestQuizId: `quiz_chapter_sec_2_bac_${ch.chapterNumber}`,
      };
    }

    return {
      chapterNumber: ch.chapterNumber,
      titleAr: ch.titleAr,
      titleEn: ch.titleEn,
      explanation: ch.summaryAr,
      vocabulary: [
        { word: "Perseverance", meaningAr: "المثابرة والإصرار", definitionEn: "Persistence in doing something despite difficulty.", example: "Their perseverance led to triumphant success." },
        { word: "Courage", meaningAr: "الشجاعة والبسالة", definitionEn: "The ability to do something that frightens one.", example: "He faced the maritime storm with steadfast courage." },
        { word: "Integrity", meaningAr: "النزاهة والأمانة الأخلاقية", definitionEn: "The quality of being honest and having strong moral principles.", example: "Edmond acted with unyielding integrity throughout his life." },
      ],
      characters: [
        { name: "The Protagonist", role: "Central Figure", descriptionAr: "الشخصية الرئيسية في الرواية التي تخوض الصراع وتواجه التحديات بشجاعة ونبل.", traits: ["Brave", "Determined", "Thoughtful"] },
        { name: "The Mentor", role: "Wise Counselor", descriptionAr: "الشخصية الحكيمة التي توجه البطل وتنصحه في أصعب المواقف.", traits: ["Wise", "Patient", "Guiding"] },
      ],
      events: [
        { order: 1, titleAr: "بداية الرحلة والتحدي", titleEn: "The Inciting Incident", description: ch.summaryAr },
        { order: 2, titleAr: "المواجهة والدروس المستفادة", titleEn: "Climax & Resolution", description: "تجاوز العقبات بالتضامن والحكمة والتخطيط المدروس." },
      ],
      importantQuotes: [
        {
          quote: "A man can be destroyed but not defeated.",
          speaker: "Santiago",
          listener: "Himself / Manolin",
          situation: "Enduring the relentless sea battle.",
          significance: "The quintessential affirmation of human spiritual triumph over physical adversity.",
        },
      ],
      questionsAndAnswers: [
        {
          question: "How does the author use the central setting to reflect the protagonist's inner conflict?",
          answer: "The vast, unforgiving setting acts as a mirror to the character's solitude, resilience, and ultimate moral triumph.",
          type: "critical_thinking",
        },
      ],
      mcqQuestions: [
        {
          question: "What is the primary moral message conveyed in this chapter?",
          options: [
            "True dignity comes from perseverance and moral integrity",
            "Material wealth is more important than honor",
            "Giving up early prevents hardship",
            "Solitude is always preferable to cooperation",
          ],
          correctAnswer: "True dignity comes from perseverance and moral integrity",
          explanation: "The chapter emphasizes spiritual endurance and standing firm against overwhelming odds.",
        },
      ],
    };
  });

  // Build units
  const seedUnits = spec.units.map((u) => ({
    unitNumber: u.unitNumber,
    type: u.type,
    titleAr: u.titleAr,
    titleEn: u.titleEn,
    reviewScope: u.reviewScope,
    descriptionAr: u.descriptionAr,
    descriptionEn: u.descriptionEn,
    orderIndex: u.orderIndex,
    sections: buildUnitSections(spec.code, u),
  }));

  return {
    id: spec.id,
    code: spec.code,
    titleAr: spec.titleAr,
    titleEn: spec.titleEn,
    stage: spec.stage,
    descriptionAr: spec.descriptionAr,
    descriptionEn: spec.descriptionEn,
    courseId: spec.courseId,
    story: {
      titleAr: spec.story.titleAr,
      titleEn: spec.story.titleEn,
      author: spec.story.author,
      descriptionAr: spec.story.descriptionAr,
      descriptionEn: spec.story.descriptionEn,
      coverImage: spec.story.coverImage,
      chapters: storyChapters,
    },
    units: seedUnits,
  };
}

export const SMART_CURRICULUM_SEEDS: CurriculumSeedGrade[] = CURRICULUM_2026_GRADES.map(mapGradeSpecToSeed);
