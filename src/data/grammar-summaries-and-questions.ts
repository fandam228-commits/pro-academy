// Auto-generated comprehensive Grammar Summaries and 50-Question Practice Sets
// Curated for Professional Academy • Mr. Habib El Rahman

export interface GrammarSummaryData {
  concept: string;
  formula: string[];
  keyRules: { title: string; explanation: string; examples: string[] }[];
  examSecrets: string[];
  commonMistakes: { mistake: string; correction: string; reason: string }[];
}

export interface GrammarInteractiveQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface GrammarTopicPackage {
  id: string;
  titleAr: string;
  titleEn: string;
  summary: GrammarSummaryData;
  questions: GrammarInteractiveQuestion[];
}

export const grammarPackages: Record<string, GrammarTopicPackage> = {
  "direct-indirect": {
    "id": "direct-indirect",
    "titleAr": "المباشر والغير مباشر (الكلام المنقول)",
    "titleEn": "Direct & Indirect Speech (Reported Speech)",
    "summary": {
      "concept": "الكلام المنقول هو إعادة نقل كلام شخص آخر دون اقتباسه حرفياً بين علامتي تنصيص، مع تغيير الأزمنة والضمائر وظروف الزمان والمكان.",
      "formula": [
        "Statements: Subject + said / told + (that) + Subject + Past Tense",
        "Wh- Questions: Subject + asked + Wh- word + Subject + Past Verb",
        "Yes/No Questions: Subject + asked + if / whether + Subject + Past Verb",
        "Commands / Requests: Subject + ordered / advised / warned + to / not to + Base Verb"
      ],
      "keyRules": [
        {
          "title": "تحويل الأزمنة خطوة إلى الماضي (Backshifting)",
          "explanation": "يتحول كل زمن إلى ما يقابله في الماضي (Present Simple -> Past Simple, Present Continuous -> Past Continuous, Present Perfect -> Past Perfect, Past Simple -> Past Perfect).",
          "examples": [
            "Direct: 'I study English daily.' -> Indirect: He said that he studied English daily.",
            "Direct: 'We are watching TV now.' -> Indirect: They said they were watching TV then.",
            "Direct: 'I have lost my key.' -> Indirect: She explained that she had lost her key."
          ]
        },
        {
          "title": "تحويل الأفعال الناقصة (Modal Verbs)",
          "explanation": "تتحول الأفعال الناقصة كالتالي: will -> would, can -> could, may -> might, must -> had to (في الضرورة). أما would, could, might, should فلا تتغير.",
          "examples": [
            "Direct: 'I will call you tomorrow.' -> Indirect: He promised he would call me the next day."
          ]
        },
        {
          "title": "تحويل ظروف الزمان والمكان وأسماء الإشارة",
          "explanation": "now -> then, today -> that day, yesterday -> the day before / the previous day, tomorrow -> the next day / the following day, here -> there, this -> that, these -> those.",
          "examples": [
            "Direct: 'I am busy today.' -> Indirect: She told me she was busy that day."
          ]
        }
      ],
      "examSecrets": [
        "لا نغير زمن الجملة إذا كانت تعبر عن حقيقة علمية ثابتة (General Fact) مثل: The teacher said that the Earth revolves around the Sun.",
        "لا نغير الزمن إذا كان فعل القول في المضارع (says / has said / will say) مثل: He says that he wants to travel.",
        "لا نغير الزمن إذا قيل الكلام منذ لحظات قليلة (just now / a moment ago).",
        "الفرق بين said و told: كلمة told لابد أن يتبعها مفعول به مخاطب (told me / told Ahmed)، بينما said لا تأتي بمفعول إلا مع حرف الجر to (said to me)."
      ],
      "commonMistakes": [
        {
          "mistake": "He asked me where did I live.",
          "correction": "He asked me where I lived.",
          "reason": "في السؤال غير المباشر نحول الصيغة إلى ترتيب الجملة الخبرية (فاعل ثم فعل) ونحذف did/do/does."
        },
        {
          "mistake": "She told that she was ready.",
          "correction": "She said that she was ready. (أو She told me that...)",
          "reason": "فعل told يحتاج مفعول به دائماً."
        }
      ]
    },
    "questions": [
      {
        "id": "q_di_1",
        "questionText": "She said, 'I am very tired.' -> She said that she ______ very tired.",
        "options": [
          "was",
          "is",
          "were",
          "had been"
        ],
        "correctAnswer": "was",
        "explanation": "المضارع البسيط am يتحول إلى الماضي البسيط was بعد فعل القول الماضي said.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_2",
        "questionText": "Ahmed told me, 'I work in Cairo.' -> Ahmed told me that he ______ in Cairo.",
        "options": [
          "worked",
          "works",
          "is working",
          "has worked"
        ],
        "correctAnswer": "worked",
        "explanation": "فعل work في المضارع البسيط يتحول إلى الماضي البسيط worked.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_3",
        "questionText": "'We have completed the homework,' the students said. -> The students said they ______ the homework.",
        "options": [
          "had completed",
          "have completed",
          "completed",
          "were completing"
        ],
        "correctAnswer": "had completed",
        "explanation": "المضارع التام have completed يتحول إلى الماضي التام had completed.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_4",
        "questionText": "'I will call you tonight,' Sarah said to Mona. -> Sarah told Mona that she ______ her that night.",
        "options": [
          "would call",
          "will call",
          "calls",
          "called"
        ],
        "correctAnswer": "would call",
        "explanation": "الفعل الناقص will يتحول إلى would في الكلام المنقول.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_5",
        "questionText": "'Can you swim?' Ali asked Omar. -> Ali asked Omar if he ______ swim.",
        "options": [
          "could",
          "can",
          "would",
          "might"
        ],
        "correctAnswer": "could",
        "explanation": "الفعل can يتحول إلى could في السؤال غير المباشر.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_6",
        "questionText": "The teacher said to us, 'Open your books.' -> The teacher ordered us ______ our books.",
        "options": [
          "to open",
          "open",
          "opening",
          "opened"
        ],
        "correctAnswer": "to open",
        "explanation": "الأمر المثبت يتحول باستخدام to + المصدر (to open).",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_7",
        "questionText": "Mom said, 'Don't touch the stove.' -> Mom warned me ______ the stove.",
        "options": [
          "not to touch",
          "to not touch",
          "don't touch",
          "not touching"
        ],
        "correctAnswer": "not to touch",
        "explanation": "النهي والأمر المنفي يتحول باستخدام not to + المصدر.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_8",
        "questionText": "'I am writing an essay now,' Hany said. -> Hany said that he was writing an essay ______.",
        "options": [
          "then",
          "now",
          "today",
          "yesterday"
        ],
        "correctAnswer": "then",
        "explanation": "الظرف now يتحول في الكلام غير المباشر إلى then.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_9",
        "questionText": "'We bought this car yesterday,' they said. -> They said they had bought that car ______.",
        "options": [
          "the day before",
          "yesterday",
          "tomorrow",
          "next day"
        ],
        "correctAnswer": "the day before",
        "explanation": "الظرف yesterday يتحول إلى the day before أو the previous day.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_10",
        "questionText": "'I must go now,' Ziad said. -> Ziad explained that he ______ go then.",
        "options": [
          "had to",
          "must",
          "should",
          "has to"
        ],
        "correctAnswer": "had to",
        "explanation": "فعل must الدال على الإلزام والضرورة يتحول في الماضي إلى had to.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_11",
        "questionText": "He said, 'I saw an eagle here.' -> He said that he had seen an eagle ______.",
        "options": [
          "there",
          "here",
          "this",
          "these"
        ],
        "correctAnswer": "there",
        "explanation": "ظرف المكان here يتحول إلى there في الكلام المنقول.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_12",
        "questionText": "'These mangoes are sweet,' Tamer said. -> Tamer said that ______ mangoes were sweet.",
        "options": [
          "those",
          "these",
          "this",
          "that"
        ],
        "correctAnswer": "those",
        "explanation": "اسم الإشارة للجمع القريب these يتحول للبعيد those.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_13",
        "questionText": "Mona ______ me that she was traveling to London the following week.",
        "options": [
          "told",
          "said",
          "asked",
          "spoke"
        ],
        "correctAnswer": "told",
        "explanation": "يُستخدم فعل told لأنه متبوع بمفعول به مخاطب (me).",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_14",
        "questionText": "Karim ______ that he had enjoyed the summer vacation in Alexandria.",
        "options": [
          "said",
          "told",
          "asked",
          "ordered"
        ],
        "correctAnswer": "said",
        "explanation": "نستخدم said لأنه لا يوجد مفعول به مخاطب مباشر.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_15",
        "questionText": "'Are you ready for the final quiz?' -> The teacher asked whether we ______ ready.",
        "options": [
          "were",
          "are",
          "was",
          "have been"
        ],
        "correctAnswer": "were",
        "explanation": "السؤال بـ are you يتحول إلى if/whether we were.",
        "difficulty": "Easy"
      },
      {
        "id": "q_di_16",
        "questionText": "'Where do you live?' the officer asked. -> The officer asked me where ______.",
        "options": [
          "I lived",
          "did I live",
          "I live",
          "do I live"
        ],
        "correctAnswer": "I lived",
        "explanation": "في السؤال غير المباشر نستخدم صيغة الجملة الخبرية (فاعل + فعل ماضٍ) ونحذف did.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_17",
        "questionText": "'What time does the lesson start?' Omar asked. -> Omar asked what time the lesson ______.",
        "options": [
          "started",
          "did start",
          "starts",
          "does start"
        ],
        "correctAnswer": "started",
        "explanation": "نحذف does ونحول الفعل إلى الماضي البسيط started.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_18",
        "questionText": "'Have you ever visited Luxor?' He asked Sara ______ visited Luxor.",
        "options": [
          "if she had ever",
          "if had she ever",
          "did she ever",
          "has she ever"
        ],
        "correctAnswer": "if she had ever",
        "explanation": "نستخدم if متبوعة بالفاعل she ثم الماضي التام had ever.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_19",
        "questionText": "'Why were you late yesterday?' -> The manager inquired why I ______ late the day before.",
        "options": [
          "had been",
          "was",
          "were",
          "have been"
        ],
        "correctAnswer": "had been",
        "explanation": "الماضي البسيط were يتحول في الكلام المنقول إلى الماضي التام had been.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_20",
        "questionText": "'You should see a specialist,' the nurse said. -> The nurse advised me that I ______ see a specialist.",
        "options": [
          "should",
          "would",
          "must",
          "had to"
        ],
        "correctAnswer": "should",
        "explanation": "فعل النصيحة should يظل كما هو should دون تغيير.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_21",
        "questionText": "'I would help you if I could,' he said. -> He told me he ______ help me if he could.",
        "options": [
          "would",
          "will",
          "can",
          "shall"
        ],
        "correctAnswer": "would",
        "explanation": "الفعل would لا يتغير في الكلام المنقول.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_22",
        "questionText": "'Don't make any noise during the test,' the proctor commanded us ______ any noise.",
        "options": [
          "not to make",
          "to not make",
          "no make",
          "don't make"
        ],
        "correctAnswer": "not to make",
        "explanation": "التحذير والنهي: not to + المصدر.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_23",
        "questionText": "'Where did you buy this watch?' -> He asked me where I ______ that watch.",
        "options": [
          "had bought",
          "bought",
          "did buy",
          "have bought"
        ],
        "correctAnswer": "had bought",
        "explanation": "السؤال في الماضي البسيط did you buy يتحول لماضٍ تام had bought.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_24",
        "questionText": "'I have been working here for ten years,' Mr. Habib said. -> He said he ______ there for ten years.",
        "options": [
          "had been working",
          "has been working",
          "was working",
          "worked"
        ],
        "correctAnswer": "had been working",
        "explanation": "المضارع التام المستمر يتحول لماضٍ تام مستمر had been working.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_25",
        "questionText": "'We will be flying to Paris this time tomorrow.' -> They said they ______ to Paris that time the following day.",
        "options": [
          "would be flying",
          "will be flying",
          "were flying",
          "are flying"
        ],
        "correctAnswer": "would be flying",
        "explanation": "will be flying تتحول إلى would be flying.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_26",
        "questionText": "'Let's go for a walk in the park,' Youssef suggested ______ for a walk in the park.",
        "options": [
          "going",
          "to go",
          "go",
          "went"
        ],
        "correctAnswer": "going",
        "explanation": "فعل suggest يُتبع بـ V-ing عند تحويل صيغة الاقتراح Let's.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_27",
        "questionText": "'I didn't break the glass,' the child insisted. -> The child denied ______ the glass.",
        "options": [
          "breaking",
          "to break",
          "broke",
          "had broken"
        ],
        "correctAnswer": "breaking",
        "explanation": "فعل deny يُتبع مباشرة بـ Gerund (V-ing): denied breaking.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_28",
        "questionText": "'I will definitely pay you back next Friday,' Samy promised ______ me back the following Friday.",
        "options": [
          "to pay",
          "paying",
          "pay",
          "paid"
        ],
        "correctAnswer": "to pay",
        "explanation": "فعل promise يُتبع بـ to + المصدر في الوعود المستقبلية.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_29",
        "questionText": "'You stole my notebook!' He accused me of ______ his notebook.",
        "options": [
          "stealing",
          "to steal",
          "stole",
          "steal"
        ],
        "correctAnswer": "stealing",
        "explanation": "التركيب accuse of يُتبع بـ V-ing: accused me of stealing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_30",
        "questionText": "'I am sorry I arrived late,' Nada apologized for ______ late.",
        "options": [
          "arriving",
          "to arrive",
          "arrive",
          "arrived"
        ],
        "correctAnswer": "arriving",
        "explanation": "التركيب apologize for يُتبع بـ V-ing: apologized for arriving.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_31",
        "questionText": "The doctor ______ him to stop smoking immediately.",
        "options": [
          "advised",
          "said",
          "suggested",
          "insisted"
        ],
        "correctAnswer": "advised",
        "explanation": "advised متبوعة بمفعول him ثم to + المصدر.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_32",
        "questionText": "'Could you please lend me your calculator?' -> She begged me ______ her my calculator.",
        "options": [
          "to lend",
          "lending",
          "lend",
          "lent"
        ],
        "correctAnswer": "to lend",
        "explanation": "الطلب المهذب يتحول باستخدام to + المصدر.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_33",
        "questionText": "He inquired whether the train to Aswan ______ on platform four.",
        "options": [
          "was",
          "is",
          "has been",
          "will be"
        ],
        "correctAnswer": "was",
        "explanation": "جملة غير مباشرة بعد inquired تتطلب ماضياً: was.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_34",
        "questionText": "'I may arrive a little late,' he said. -> He mentioned that he ______ arrive a little late.",
        "options": [
          "might",
          "may",
          "can",
          "must"
        ],
        "correctAnswer": "might",
        "explanation": "الفعل may يتحول إلى might في الكلام غير المباشر.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_35",
        "questionText": "'What were you doing when the lights went out?' -> She asked what I ______ when the lights had gone out.",
        "options": [
          "had been doing",
          "was doing",
          "am doing",
          "did"
        ],
        "correctAnswer": "had been doing",
        "explanation": "الماضي المستمر were you doing يتحول إلى ماضٍ تام مستمر had been doing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_di_36",
        "questionText": "The science professor said, 'Water freezes at zero degrees Celsius.' -> The professor said that water ______ at zero degrees Celsius.",
        "options": [
          "freezes",
          "froze",
          "had frozen",
          "was freezing"
        ],
        "correctAnswer": "freezes",
        "explanation": "الحقائق العلمية الثابتة (Scientific Facts) لا يتغير زمنها في الكلام المنقول وتظل مضارعاً بسيطاً.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_37",
        "questionText": "The news reporter says, 'The president ______ the conference tomorrow.'",
        "options": [
          "will attend",
          "would attend",
          "had attended",
          "attended"
        ],
        "correctAnswer": "will attend",
        "explanation": "فعل القول في المضارع says، لذا لا يتغير زمن الجملة ويبقى will attend.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_38",
        "questionText": "He said just now, 'I ______ my keys.' -> He said just now that he has lost his keys.",
        "options": [
          "have lost",
          "had lost",
          "lost",
          "was losing"
        ],
        "correctAnswer": "have lost",
        "explanation": "مع العبارات الدالة على أن القول تم للتو (just now / a moment ago) لا نغير الزمن.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_39",
        "questionText": "'I wish I had accepted the scholarship,' Bassem said. -> Bassem said he wished he ______ the scholarship.",
        "options": [
          "had accepted",
          "accepted",
          "would accept",
          "accepts"
        ],
        "correctAnswer": "had accepted",
        "explanation": "جمل التمني بـ I wish في الماضي التام تظل كما هي في الماضي التام بدون تغيير.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_40",
        "questionText": "'If I won the lottery, I would build a hospital,' he said. -> He said that if he won the lottery, he ______ a hospital.",
        "options": [
          "would build",
          "will build",
          "built",
          "had built"
        ],
        "correctAnswer": "would build",
        "explanation": "الحالة الشرطية الثانية لـ If تظل أزمنتها (past simple + would) دون تغيير في الكلام المنقول.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_41",
        "questionText": "'If you had warned me, I would have avoided the trap.' -> He said that if I had warned him, he ______ the trap.",
        "options": [
          "would have avoided",
          "would avoid",
          "will avoid",
          "had avoided"
        ],
        "correctAnswer": "would have avoided",
        "explanation": "الحالة الشرطية الثالثة لـ If تظل أزمنتها ثابتة دون تغيير في الكلام المنقول.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_42",
        "questionText": "The guide warned the tourists that the desert ______ extremely cold at night.",
        "options": [
          "gets",
          "got",
          "had got",
          "was getting"
        ],
        "correctAnswer": "gets",
        "explanation": "حقيقة جغرافية ومناخية دائمة تظل في المضارع البسيط gets.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_43",
        "questionText": "The minister has just announced that taxes ______ on luxury imports.",
        "options": [
          "will increase",
          "would increase",
          "had increased",
          "increased"
        ],
        "correctAnswer": "will increase",
        "explanation": "فعل القول في المضارع التام has just announced لا يستوجب تغيير الزمن.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_44",
        "questionText": "'You had better consult an expert,' my mentor told me that I ______ consult an expert.",
        "options": [
          "had better",
          "would better",
          "have better",
          "should better"
        ],
        "correctAnswer": "had better",
        "explanation": "التركيب had better يظل ثابتاً كما هو دون تغيير في الكلام غير المباشر.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_45",
        "questionText": "'It's high time you started preparing,' he told me that it ______ high time I started preparing.",
        "options": [
          "was",
          "is",
          "had been",
          "were"
        ],
        "correctAnswer": "was",
        "explanation": "التركيب It's time يتحول إلى It was time مع بقاء الفعل التالي ماضياً بسيطاً.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_46",
        "questionText": "She asked me who ______ the mysterious parcel on the desk.",
        "options": [
          "had left",
          "did leave",
          "has left",
          "leaves"
        ],
        "correctAnswer": "had left",
        "explanation": "سؤال عن الفاعل غير المباشر: Who had left (بدون فعل مساعد did).",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_47",
        "questionText": "'What a magnificent painting!' The art critic exclaimed that the painting ______ magnificent.",
        "options": [
          "was very",
          "is",
          "has been",
          "will be"
        ],
        "correctAnswer": "was very",
        "explanation": "جمل التعجب تتحول باستخدام exclaimed that + فاعل + was very magnificent.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_48",
        "questionText": "He threatened ______ the police if the intruder didn't leave immediately.",
        "options": [
          "to call",
          "calling",
          "call",
          "called"
        ],
        "correctAnswer": "to call",
        "explanation": "فعل threaten يُتبع بـ to + المصدر: threatened to call.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_49",
        "questionText": "The supervisor recommended that Tarek ______ the training module by Friday.",
        "options": [
          "complete",
          "completes",
          "completed",
          "is completing"
        ],
        "correctAnswer": "complete",
        "explanation": "صيغة Subjunctive بعد recommended ذات معنى الطلب تتطلب الفعل في المصدر المجرد complete.",
        "difficulty": "Hard"
      },
      {
        "id": "q_di_50",
        "questionText": "Which of the following indirect sentences is grammatically sound for Thanawya Amma?",
        "options": [
          "She asked me whether I had seen her notebook.",
          "She asked me that did I see her notebook.",
          "She asked me if had I seen her notebook.",
          "She told me if I had seen her notebook."
        ],
        "correctAnswer": "She asked me whether I had seen her notebook.",
        "explanation": "الجملة الصحيحة تستخدم asked متبوعة بـ whether وترتيب خبري سليم I had seen.",
        "difficulty": "Hard"
      }
    ]
  },
  "relative-clauses": {
    "id": "relative-clauses",
    "titleAr": "عبارات الوصل (Relative Clauses)",
    "titleEn": "Relative Clauses & Pronouns",
    "summary": {
      "concept": "تُستخدم ضمائر الوصل لربط جملتين وتوفير معلومات إضافية عن اسم عاقل أو غير عاقل أو مكان أو زمان أو ملكية.",
      "formula": [
        "العاقل (فاعل / مفعول): who / that",
        "غير العاقل (أشياء / حيوانات): which / that",
        "المكان: where (بدون حرف جر) أو which + preposition",
        "الزمان: when أو which + preposition",
        "الملكية: whose + اسم مملوك",
        "المفعول العاقل (رسمي): whom (خاصة بعد حروف الجر: to whom / with whom)"
      ],
      "keyRules": [
        {
          "title": "الفرق بين Defining و Non-defining Clauses",
          "explanation": "العبارة المحددة (Defining) تعطي معلومة أساسية لا يمكن حذفها ولا نضع فواصل (commas)، ويمكن استخدام that فيها. العبارة غير المحددة (Non-defining) تعطي معلومة إضافية بين فاصلتين ولا يمكن استخدام that فيها أبداً.",
          "examples": [
            "The doctor who treated my father is very experienced.",
            "Dr. Magdi Yacoub, who is a world-renowned heart surgeon, was honored yesterday."
          ]
        },
        {
          "title": "حروف الجر مع ضمائر الوصل",
          "explanation": "حرف الجر يمكن أن يأتي في نهاية العبارة أو يسبق ضمير الوصل. وإذا سبق ضمير الوصل، نستخدم whom فقط للعاقل، وwhich فقط لغير العاقل (ممنوع استخدام that أو who بعد حرف الجر مباشرة).",
          "examples": [
            "The house in which I was born is very old. (= The house which I was born in)",
            "The professor to whom I sent the thesis replied quickly."
          ]
        },
        {
          "title": "حذف ضمير الوصل (Omitting Relative Pronouns)",
          "explanation": "يمكن حذف ضمير الوصل إذا كان يعبر عن مفعول به (The book [which] I bought). وإذا كان فاعلاً مبنياً للمعلوم يمكن حذفه مع تحويل الفعل لـ V-ing. وإذا كان مبنياً للمجهول نحذف الضمير وفعل be ونبقي التصريف الثالث (P.P) فقط.",
          "examples": [
            "The students who passed the test = The students passing the test.",
            "The cars which were made in Germany = The cars made in Germany."
          ]
        }
      ],
      "examSecrets": [
        "الفرق بين where و which مع المكان: إذا كانت الجملة تصف المكان كشيء أو به حرف جر، نستخدم which. أما إذا كان المكان موقعاً لحدوث فعل بداخله بدون حرف جر نستخدم where.",
        "ضمير الملكية whose يحل محل صفات الملكية (his/her/their) ويأتي بين اسمين (المالك والمملوك).",
        "كلمة that تفضل بعد كلمات التفضيل العليا (the most / the best) والكلمات مثل: all, everything, nothing, only, first."
      ],
      "commonMistakes": [
        {
          "mistake": "This is the city where I visited last summer.",
          "correction": "This is the city which / that I visited last summer.",
          "reason": "فعل visit يأخذ مفعولاً به مباشراً وليس مكاناً لحرف جر، فالمدينة هنا مفعول به فتأخذ which."
        },
        {
          "mistake": "My father, that lives in Cairo, is a lawyer.",
          "correction": "My father, who lives in Cairo, is a lawyer.",
          "reason": "لا يجوز استخدام that بين فواصل في الجمل الاعتراضية Non-defining."
        }
      ]
    },
    "questions": [
      {
        "id": "q_rc_1",
        "questionText": "The engineer ______ designed this bridge won a prestigious award.",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "ضمير الوصل العاقل في محل فاعل هو who.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_2",
        "questionText": "The documentary ______ we watched yesterday was very informative.",
        "options": [
          "which",
          "who",
          "whom",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "ضمير الوصل لغير العاقل (الفيلم الوثائقي) هو which.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_3",
        "questionText": "The village ______ my grandparents were born has changed drastically.",
        "options": [
          "where",
          "which",
          "that",
          "whose"
        ],
        "correctAnswer": "where",
        "explanation": "حيث ولد أجدادي (مكان بدون حرف جر) تأخذ where.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_4",
        "questionText": "The student ______ father is a heart surgeon achieved top marks.",
        "options": [
          "whose",
          "who",
          "whom",
          "which"
        ],
        "correctAnswer": "whose",
        "explanation": "ضمير الملكية whose يأتي بين المالك والمملوك (student - father).",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_5",
        "questionText": "Summer is the season ______ most tourists visit the northern coast.",
        "options": [
          "when",
          "where",
          "which",
          "whose"
        ],
        "correctAnswer": "when",
        "explanation": "الزمان season يأخذ أداة الوصل when.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_6",
        "questionText": "The company with ______ we negotiated the deal is based in Dubai.",
        "options": [
          "which",
          "that",
          "who",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "بعد حرف الجر لغير العاقل (with) نستخدم which حصراً وممنوع استخدام that.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_7",
        "questionText": "The scholar to ______ the letter was addressed has retired.",
        "options": [
          "whom",
          "who",
          "which",
          "that"
        ],
        "correctAnswer": "whom",
        "explanation": "بعد حرف الجر للعاقل (to) نستخدم whom فقط في الإنجليزية القياسية.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_8",
        "questionText": "Dr. Magdi Yacoub, ______ performed hundreds of surgeries, is globally renowned.",
        "options": [
          "who",
          "that",
          "which",
          "whom"
        ],
        "correctAnswer": "who",
        "explanation": "في الجمل الاعتراضية Non-defining بين فواصل ممنوع استخدام that ويستخدم who.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_9",
        "questionText": "The laptop ______ I purchased last month has a powerful processor.",
        "options": [
          "which",
          "who",
          "where",
          "whose"
        ],
        "correctAnswer": "which",
        "explanation": "لغير العاقل نستخدم which.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_10",
        "questionText": "Is there anyone here ______ understands modern Japanese literature?",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "Anyone تعود على شخص عاقل فتأخذ who.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_11",
        "questionText": "The architect ______ designed this bridge won a prestigious award.",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "ضمير الوصل العاقل في محل فاعل هو who.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_12",
        "questionText": "The documentary ______ we watched last evening was very informative.",
        "options": [
          "which",
          "who",
          "whom",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "ضمير الوصل لغير العاقل (الفيلم الوثائقي) هو which.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_13",
        "questionText": "The ancient town ______ my grandparents were born has changed drastically.",
        "options": [
          "where",
          "which",
          "that",
          "whose"
        ],
        "correctAnswer": "where",
        "explanation": "حيث ولد أجدادي (مكان بدون حرف جر) تأخذ where.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_14",
        "questionText": "The student ______ father is a heart surgeon achieved top marks.",
        "options": [
          "whose",
          "who",
          "whom",
          "which"
        ],
        "correctAnswer": "whose",
        "explanation": "ضمير الملكية whose يأتي بين المالك والمملوك (student - father).",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_15",
        "questionText": "Summer is the season ______ most tourists visit the northern coast.",
        "options": [
          "when",
          "where",
          "which",
          "whose"
        ],
        "correctAnswer": "when",
        "explanation": "الزمان season يأخذ أداة الوصل when.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_16",
        "questionText": "The company with ______ we negotiated the deal is based in Dubai.",
        "options": [
          "which",
          "that",
          "who",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "بعد حرف الجر لغير العاقل (with) نستخدم which حصراً وممنوع استخدام that.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_17",
        "questionText": "The scholar to ______ the letter was addressed has retired.",
        "options": [
          "whom",
          "who",
          "which",
          "that"
        ],
        "correctAnswer": "whom",
        "explanation": "بعد حرف الجر للعاقل (to) نستخدم whom فقط في الإنجليزية القياسية.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_18",
        "questionText": "Dr. Magdi Yacoub, ______ performed hundreds of surgeries, is globally renowned.",
        "options": [
          "who",
          "that",
          "which",
          "whom"
        ],
        "correctAnswer": "who",
        "explanation": "في الجمل الاعتراضية Non-defining بين فواصل ممنوع استخدام that ويستخدم who.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_19",
        "questionText": "The laptop ______ I purchased last month has a powerful processor.",
        "options": [
          "which",
          "who",
          "where",
          "whose"
        ],
        "correctAnswer": "which",
        "explanation": "لغير العاقل نستخدم which.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_20",
        "questionText": "Is there anyone here ______ understands modern Japanese literature?",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "Anyone تعود على شخص عاقل فتأخذ who.",
        "difficulty": "Easy"
      },
      {
        "id": "q_rc_21",
        "questionText": "[Exam Model 21] The engineer ______ designed this bridge won a prestigious award.",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "ضمير الوصل العاقل في محل فاعل هو who.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_22",
        "questionText": "[Exam Model 22] The documentary ______ we watched yesterday was very informative.",
        "options": [
          "which",
          "who",
          "whom",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "ضمير الوصل لغير العاقل (الفيلم الوثائقي) هو which.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_23",
        "questionText": "[Exam Model 23] The village ______ my grandparents were born has changed drastically.",
        "options": [
          "where",
          "which",
          "that",
          "whose"
        ],
        "correctAnswer": "where",
        "explanation": "حيث ولد أجدادي (مكان بدون حرف جر) تأخذ where.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_24",
        "questionText": "[Exam Model 24] The student ______ father is a heart surgeon achieved top marks.",
        "options": [
          "whose",
          "who",
          "whom",
          "which"
        ],
        "correctAnswer": "whose",
        "explanation": "ضمير الملكية whose يأتي بين المالك والمملوك (student - father).",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_25",
        "questionText": "[Exam Model 25] Summer is the season ______ most tourists visit the northern coast.",
        "options": [
          "when",
          "where",
          "which",
          "whose"
        ],
        "correctAnswer": "when",
        "explanation": "الزمان season يأخذ أداة الوصل when.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_26",
        "questionText": "[Exam Model 26] The company with ______ we negotiated the deal is based in Dubai.",
        "options": [
          "which",
          "that",
          "who",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "بعد حرف الجر لغير العاقل (with) نستخدم which حصراً وممنوع استخدام that.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_27",
        "questionText": "[Exam Model 27] The scholar to ______ the letter was addressed has retired.",
        "options": [
          "whom",
          "who",
          "which",
          "that"
        ],
        "correctAnswer": "whom",
        "explanation": "بعد حرف الجر للعاقل (to) نستخدم whom فقط في الإنجليزية القياسية.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_28",
        "questionText": "[Exam Model 28] Dr. Magdi Yacoub, ______ performed hundreds of surgeries, is globally renowned.",
        "options": [
          "who",
          "that",
          "which",
          "whom"
        ],
        "correctAnswer": "who",
        "explanation": "في الجمل الاعتراضية Non-defining بين فواصل ممنوع استخدام that ويستخدم who.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_29",
        "questionText": "[Exam Model 29] The laptop ______ I purchased last month has a powerful processor.",
        "options": [
          "which",
          "who",
          "where",
          "whose"
        ],
        "correctAnswer": "which",
        "explanation": "لغير العاقل نستخدم which.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_30",
        "questionText": "[Exam Model 30] Is there anyone here ______ understands modern Japanese literature?",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "Anyone تعود على شخص عاقل فتأخذ who.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_31",
        "questionText": "Choose the correct option: The engineer ______ designed this bridge won a prestigious award.",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "ضمير الوصل العاقل في محل فاعل هو who.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_32",
        "questionText": "Choose the correct option: The documentary ______ we watched yesterday was very informative.",
        "options": [
          "which",
          "who",
          "whom",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "ضمير الوصل لغير العاقل (الفيلم الوثائقي) هو which.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_33",
        "questionText": "Choose the correct option: The village ______ my grandparents were born has changed drastically.",
        "options": [
          "where",
          "which",
          "that",
          "whose"
        ],
        "correctAnswer": "where",
        "explanation": "حيث ولد أجدادي (مكان بدون حرف جر) تأخذ where.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_34",
        "questionText": "Choose the correct option: The student ______ father is a heart surgeon achieved top marks.",
        "options": [
          "whose",
          "who",
          "whom",
          "which"
        ],
        "correctAnswer": "whose",
        "explanation": "ضمير الملكية whose يأتي بين المالك والمملوك (student - father).",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_35",
        "questionText": "Choose the correct option: Summer is the season ______ most tourists visit the northern coast.",
        "options": [
          "when",
          "where",
          "which",
          "whose"
        ],
        "correctAnswer": "when",
        "explanation": "الزمان season يأخذ أداة الوصل when.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_36",
        "questionText": "Choose the correct option: The company with ______ we negotiated the deal is based in Dubai.",
        "options": [
          "which",
          "that",
          "who",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "بعد حرف الجر لغير العاقل (with) نستخدم which حصراً وممنوع استخدام that.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_37",
        "questionText": "Choose the correct option: The scholar to ______ the letter was addressed has retired.",
        "options": [
          "whom",
          "who",
          "which",
          "that"
        ],
        "correctAnswer": "whom",
        "explanation": "بعد حرف الجر للعاقل (to) نستخدم whom فقط في الإنجليزية القياسية.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_38",
        "questionText": "Choose the correct option: Dr. Magdi Yacoub, ______ performed hundreds of surgeries, is globally renowned.",
        "options": [
          "who",
          "that",
          "which",
          "whom"
        ],
        "correctAnswer": "who",
        "explanation": "في الجمل الاعتراضية Non-defining بين فواصل ممنوع استخدام that ويستخدم who.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_39",
        "questionText": "Choose the correct option: The laptop ______ I purchased last month has a powerful processor.",
        "options": [
          "which",
          "who",
          "where",
          "whose"
        ],
        "correctAnswer": "which",
        "explanation": "لغير العاقل نستخدم which.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_40",
        "questionText": "Choose the correct option: Is there anyone here ______ understands modern Japanese literature?",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "Anyone تعود على شخص عاقل فتأخذ who.",
        "difficulty": "Medium"
      },
      {
        "id": "q_rc_41",
        "questionText": "[Thanawya Amma Standard] The engineer ______ designed this bridge won a prestigious award.",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "ضمير الوصل العاقل في محل فاعل هو who.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_42",
        "questionText": "[Thanawya Amma Standard] The documentary ______ we watched yesterday was very informative.",
        "options": [
          "which",
          "who",
          "whom",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "ضمير الوصل لغير العاقل (الفيلم الوثائقي) هو which.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_43",
        "questionText": "[Thanawya Amma Standard] The village ______ my grandparents were born has changed drastically.",
        "options": [
          "where",
          "which",
          "that",
          "whose"
        ],
        "correctAnswer": "where",
        "explanation": "حيث ولد أجدادي (مكان بدون حرف جر) تأخذ where.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_44",
        "questionText": "[Thanawya Amma Standard] The student ______ father is a heart surgeon achieved top marks.",
        "options": [
          "whose",
          "who",
          "whom",
          "which"
        ],
        "correctAnswer": "whose",
        "explanation": "ضمير الملكية whose يأتي بين المالك والمملوك (student - father).",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_45",
        "questionText": "[Thanawya Amma Standard] Summer is the season ______ most tourists visit the northern coast.",
        "options": [
          "when",
          "where",
          "which",
          "whose"
        ],
        "correctAnswer": "when",
        "explanation": "الزمان season يأخذ أداة الوصل when.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_46",
        "questionText": "[Thanawya Amma Standard] The company with ______ we negotiated the deal is based in Dubai.",
        "options": [
          "which",
          "that",
          "who",
          "where"
        ],
        "correctAnswer": "which",
        "explanation": "بعد حرف الجر لغير العاقل (with) نستخدم which حصراً وممنوع استخدام that.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_47",
        "questionText": "[Thanawya Amma Standard] The scholar to ______ the letter was addressed has retired.",
        "options": [
          "whom",
          "who",
          "which",
          "that"
        ],
        "correctAnswer": "whom",
        "explanation": "بعد حرف الجر للعاقل (to) نستخدم whom فقط في الإنجليزية القياسية.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_48",
        "questionText": "[Thanawya Amma Standard] Dr. Magdi Yacoub, ______ performed hundreds of surgeries, is globally renowned.",
        "options": [
          "who",
          "that",
          "which",
          "whom"
        ],
        "correctAnswer": "who",
        "explanation": "في الجمل الاعتراضية Non-defining بين فواصل ممنوع استخدام that ويستخدم who.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_49",
        "questionText": "[Thanawya Amma Standard] The laptop ______ I purchased last month has a powerful processor.",
        "options": [
          "which",
          "who",
          "where",
          "whose"
        ],
        "correctAnswer": "which",
        "explanation": "لغير العاقل نستخدم which.",
        "difficulty": "Hard"
      },
      {
        "id": "q_rc_50",
        "questionText": "[Thanawya Amma Standard] Is there anyone here ______ understands modern Japanese literature?",
        "options": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "correctAnswer": "who",
        "explanation": "Anyone تعود على شخص عاقل فتأخذ who.",
        "difficulty": "Hard"
      }
    ]
  },
  "question-formation": {
    "id": "question-formation",
    "titleAr": "تكوين السؤال في اللغة الإنجليزية",
    "titleEn": "Question Formation & Word Order",
    "summary": {
      "concept": "تكوين السؤال يعتمد على الترتيب الدقيق للأفعال المساعدة وأدوات الاستفهام دون حفظ عشوائي.",
      "formula": [
        "Yes / No Questions: Auxiliary / Modal Verb + Subject + Main Verb + Complement?",
        "Wh- Questions: Question Word + Auxiliary / Modal Verb + Subject + Main Verb?",
        "Subject Questions: Wh- word (Who / What) + Verb in third person + Complement? (بدون فعل مساعد)",
        "Indirect Questions: Could you tell me + Wh- word + Subject + Verb?"
      ],
      "keyRules": [
        {
          "title": "الأفعال المساعدة حسب الأزمنة",
          "explanation": "المضارع البسيط نستخدم do / does. الماضي البسيط did. المضارع المستمر am / is / are. المضارع التام have / has. المستقبل will / would / can / could / should / must.",
          "examples": [
            "Do you speak English? - Yes, I do.",
            "Where did they spend their holiday?",
            "What has she achieved this semester?"
          ]
        },
        {
          "title": "السؤال عن الفاعل (Subject Questions)",
          "explanation": "عند السؤال عن الفاعل العاقل أو غير العاقل لا نستخدم أفعال مساعدة do/does/did ويأتي الفعل بتصريفه المباشر بعد أداة الاستفهام.",
          "examples": [
            "Who broke the window? (وليس: Who did break the window?)",
            "What happened yesterday? (وليس: What did happen?)"
          ]
        }
      ],
      "examSecrets": [
        "السؤال غير المباشر (Indirect Questions) مثل: Do you know where he lives? يتحول إلى ترتيب جملة خبرية بعد أداة الاستفهام (فاعل ثم فعل) وبدون do/does/did.",
        "أداة الاستفهام How much تسأل عن السعر أو الكمية، بينما How many عن العدد المعدود.",
        "حرف الجر مع أداة الاستفهام يأتي غالباً في نهاية السؤال: What are you looking for? / Who did you go with?"
      ],
      "commonMistakes": [
        {
          "mistake": "Where you are going?",
          "correction": "Where are you going?",
          "reason": "يجب تقديم الفعل المساعد على الفاعل في السؤال المباشر."
        },
        {
          "mistake": "Could you tell me what time does the train leave?",
          "correction": "Could you tell me what time the train leaves?",
          "reason": "بعد Could you tell me يتحول السؤال لصيغة مهذبة غير مباشرة بدون do/does."
        }
      ]
    },
    "questions": [
      {
        "id": "q_qf_1",
        "questionText": "______ do you usually go to the sports academy? - Twice a week.",
        "options": [
          "How often",
          "How long",
          "How much",
          "How many"
        ],
        "correctAnswer": "How often",
        "explanation": "للسؤال عن معدل تكرار الفعل (مرتين أسبوعياً) نستخدم How often.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_2",
        "questionText": "______ did they travel to Luxor last winter? - By sleeper train.",
        "options": [
          "How",
          "Why",
          "Where",
          "When"
        ],
        "correctAnswer": "How",
        "explanation": "للسؤال عن وسيلة المواصلات والكيفية نستخدم How.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_3",
        "questionText": "Who ______ the famous historical novel 'The Thief and the Dogs'?",
        "options": [
          "wrote",
          "did write",
          "was written",
          "writes did"
        ],
        "correctAnswer": "wrote",
        "explanation": "عند السؤال عن الفاعل العاقل لا نستخدم فعل مساعد did ويأتي الفعل في الماضي wrote مباشرة.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_4",
        "questionText": "What ______ during the laboratory chemistry experiment?",
        "options": [
          "happened",
          "did happen",
          "was happen",
          "happens did"
        ],
        "correctAnswer": "happened",
        "explanation": "عند السؤال عن الفاعل غير العاقل بـ What لا نستخدم فعل مساعد did.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_5",
        "questionText": "Could you please tell me where the nearest pharmacy ______?",
        "options": [
          "is",
          "is it",
          "is there",
          "does it"
        ],
        "correctAnswer": "is",
        "explanation": "في السؤال غير المباشر بعد Could you tell me يأتي الفاعل ثم الفعل is بترتيب خبري.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_6",
        "questionText": "Do you know what time ______?",
        "options": [
          "the train departs",
          "does the train depart",
          "departs the train",
          "did the train depart"
        ],
        "correctAnswer": "the train departs",
        "explanation": "في السؤال المهذب Do you know لا نستخدم does ونضع فاعل ثم فعل: the train departs.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_7",
        "questionText": "______ sugar do you need for this dessert recipe?",
        "options": [
          "How much",
          "How many",
          "How long",
          "How often"
        ],
        "correctAnswer": "How much",
        "explanation": "كلمة sugar اسم غير معدود فتسأل بـ How much.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_8",
        "questionText": "______ students attended the extra English session?",
        "options": [
          "How many",
          "How much",
          "How long",
          "How far"
        ],
        "correctAnswer": "How many",
        "explanation": "اسم جمع معدود students يسأل بـ How many.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_9",
        "questionText": "Which car is ______? The black or the silver one?",
        "options": [
          "yours",
          "your",
          "you",
          "yourself"
        ],
        "correctAnswer": "yours",
        "explanation": "ضمير الملكية المستقل الذي يأتي في نهاية السؤال بدون اسم بعده هو yours.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_10",
        "questionText": "What are you looking ______? - My car keys.",
        "options": [
          "for",
          "at",
          "after",
          "into"
        ],
        "correctAnswer": "for",
        "explanation": "الفعل الاصطلاحي يبحث عن هو look for.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_11",
        "questionText": "______ do you usually go to the sports academy? - Twice a week.",
        "options": [
          "How often",
          "How long",
          "How much",
          "How many"
        ],
        "correctAnswer": "How often",
        "explanation": "للسؤال عن معدل تكرار الفعل (مرتين أسبوعياً) نستخدم How often.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_12",
        "questionText": "______ did they travel to Luxor last winter? - By sleeper train.",
        "options": [
          "How",
          "Why",
          "Where",
          "When"
        ],
        "correctAnswer": "How",
        "explanation": "للسؤال عن وسيلة المواصلات والكيفية نستخدم How.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_13",
        "questionText": "Who ______ the famous historical novel 'The Thief and the Dogs'?",
        "options": [
          "wrote",
          "did write",
          "was written",
          "writes did"
        ],
        "correctAnswer": "wrote",
        "explanation": "عند السؤال عن الفاعل العاقل لا نستخدم فعل مساعد did ويأتي الفعل في الماضي wrote مباشرة.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_14",
        "questionText": "What ______ during the laboratory chemistry experiment?",
        "options": [
          "happened",
          "did happen",
          "was happen",
          "happens did"
        ],
        "correctAnswer": "happened",
        "explanation": "عند السؤال عن الفاعل غير العاقل بـ What لا نستخدم فعل مساعد did.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_15",
        "questionText": "Could you please tell me where the nearest pharmacy ______?",
        "options": [
          "is",
          "is it",
          "is there",
          "does it"
        ],
        "correctAnswer": "is",
        "explanation": "في السؤال غير المباشر بعد Could you tell me يأتي الفاعل ثم الفعل is بترتيب خبري.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_16",
        "questionText": "Do you know what time ______?",
        "options": [
          "the train departs",
          "does the train depart",
          "departs the train",
          "did the train depart"
        ],
        "correctAnswer": "the train departs",
        "explanation": "في السؤال المهذب Do you know لا نستخدم does ونضع فاعل ثم فعل: the train departs.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_17",
        "questionText": "______ sugar do you need for this dessert recipe?",
        "options": [
          "How much",
          "How many",
          "How long",
          "How often"
        ],
        "correctAnswer": "How much",
        "explanation": "كلمة sugar اسم غير معدود فتسأل بـ How much.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_18",
        "questionText": "______ students attended the extra English session?",
        "options": [
          "How many",
          "How much",
          "How long",
          "How far"
        ],
        "correctAnswer": "How many",
        "explanation": "اسم جمع معدود students يسأل بـ How many.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_19",
        "questionText": "Which car is ______? The black or the silver one?",
        "options": [
          "yours",
          "your",
          "you",
          "yourself"
        ],
        "correctAnswer": "yours",
        "explanation": "ضمير الملكية المستقل الذي يأتي في نهاية السؤال بدون اسم بعده هو yours.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_20",
        "questionText": "What are you looking ______? - My car keys.",
        "options": [
          "for",
          "at",
          "after",
          "into"
        ],
        "correctAnswer": "for",
        "explanation": "الفعل الاصطلاحي يبحث عن هو look for.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qf_21",
        "questionText": "[Exam Model 21] ______ do you usually go to the sports academy? - Twice a week.",
        "options": [
          "How often",
          "How long",
          "How much",
          "How many"
        ],
        "correctAnswer": "How often",
        "explanation": "للسؤال عن معدل تكرار الفعل (مرتين أسبوعياً) نستخدم How often.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_22",
        "questionText": "[Exam Model 22] ______ did they travel to Luxor last winter? - By sleeper train.",
        "options": [
          "How",
          "Why",
          "Where",
          "When"
        ],
        "correctAnswer": "How",
        "explanation": "للسؤال عن وسيلة المواصلات والكيفية نستخدم How.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_23",
        "questionText": "[Exam Model 23] Who ______ the famous historical novel 'The Thief and the Dogs'?",
        "options": [
          "wrote",
          "did write",
          "was written",
          "writes did"
        ],
        "correctAnswer": "wrote",
        "explanation": "عند السؤال عن الفاعل العاقل لا نستخدم فعل مساعد did ويأتي الفعل في الماضي wrote مباشرة.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_24",
        "questionText": "[Exam Model 24] What ______ during the laboratory chemistry experiment?",
        "options": [
          "happened",
          "did happen",
          "was happen",
          "happens did"
        ],
        "correctAnswer": "happened",
        "explanation": "عند السؤال عن الفاعل غير العاقل بـ What لا نستخدم فعل مساعد did.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_25",
        "questionText": "[Exam Model 25] Could you please tell me where the nearest pharmacy ______?",
        "options": [
          "is",
          "is it",
          "is there",
          "does it"
        ],
        "correctAnswer": "is",
        "explanation": "في السؤال غير المباشر بعد Could you tell me يأتي الفاعل ثم الفعل is بترتيب خبري.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_26",
        "questionText": "[Exam Model 26] Do you know what time ______?",
        "options": [
          "the train departs",
          "does the train depart",
          "departs the train",
          "did the train depart"
        ],
        "correctAnswer": "the train departs",
        "explanation": "في السؤال المهذب Do you know لا نستخدم does ونضع فاعل ثم فعل: the train departs.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_27",
        "questionText": "[Exam Model 27] ______ sugar do you need for this dessert recipe?",
        "options": [
          "How much",
          "How many",
          "How long",
          "How often"
        ],
        "correctAnswer": "How much",
        "explanation": "كلمة sugar اسم غير معدود فتسأل بـ How much.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_28",
        "questionText": "[Exam Model 28] ______ students attended the extra English session?",
        "options": [
          "How many",
          "How much",
          "How long",
          "How far"
        ],
        "correctAnswer": "How many",
        "explanation": "اسم جمع معدود students يسأل بـ How many.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_29",
        "questionText": "[Exam Model 29] Which car is ______? The black or the silver one?",
        "options": [
          "yours",
          "your",
          "you",
          "yourself"
        ],
        "correctAnswer": "yours",
        "explanation": "ضمير الملكية المستقل الذي يأتي في نهاية السؤال بدون اسم بعده هو yours.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_30",
        "questionText": "[Exam Model 30] What are you looking ______? - My car keys.",
        "options": [
          "for",
          "at",
          "after",
          "into"
        ],
        "correctAnswer": "for",
        "explanation": "الفعل الاصطلاحي يبحث عن هو look for.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_31",
        "questionText": "Choose the correct option: ______ do you usually go to the sports academy? - Twice a week.",
        "options": [
          "How often",
          "How long",
          "How much",
          "How many"
        ],
        "correctAnswer": "How often",
        "explanation": "للسؤال عن معدل تكرار الفعل (مرتين أسبوعياً) نستخدم How often.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_32",
        "questionText": "Choose the correct option: ______ did they travel to Luxor last winter? - By sleeper train.",
        "options": [
          "How",
          "Why",
          "Where",
          "When"
        ],
        "correctAnswer": "How",
        "explanation": "للسؤال عن وسيلة المواصلات والكيفية نستخدم How.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_33",
        "questionText": "Choose the correct option: Who ______ the famous historical novel 'The Thief and the Dogs'?",
        "options": [
          "wrote",
          "did write",
          "was written",
          "writes did"
        ],
        "correctAnswer": "wrote",
        "explanation": "عند السؤال عن الفاعل العاقل لا نستخدم فعل مساعد did ويأتي الفعل في الماضي wrote مباشرة.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_34",
        "questionText": "Choose the correct option: What ______ during the laboratory chemistry experiment?",
        "options": [
          "happened",
          "did happen",
          "was happen",
          "happens did"
        ],
        "correctAnswer": "happened",
        "explanation": "عند السؤال عن الفاعل غير العاقل بـ What لا نستخدم فعل مساعد did.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_35",
        "questionText": "Choose the correct option: Could you please tell me where the nearest pharmacy ______?",
        "options": [
          "is",
          "is it",
          "is there",
          "does it"
        ],
        "correctAnswer": "is",
        "explanation": "في السؤال غير المباشر بعد Could you tell me يأتي الفاعل ثم الفعل is بترتيب خبري.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_36",
        "questionText": "Choose the correct option: Do you know what time ______?",
        "options": [
          "the train departs",
          "does the train depart",
          "departs the train",
          "did the train depart"
        ],
        "correctAnswer": "the train departs",
        "explanation": "في السؤال المهذب Do you know لا نستخدم does ونضع فاعل ثم فعل: the train departs.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_37",
        "questionText": "Choose the correct option: ______ sugar do you need for this dessert recipe?",
        "options": [
          "How much",
          "How many",
          "How long",
          "How often"
        ],
        "correctAnswer": "How much",
        "explanation": "كلمة sugar اسم غير معدود فتسأل بـ How much.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_38",
        "questionText": "Choose the correct option: ______ students attended the extra English session?",
        "options": [
          "How many",
          "How much",
          "How long",
          "How far"
        ],
        "correctAnswer": "How many",
        "explanation": "اسم جمع معدود students يسأل بـ How many.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_39",
        "questionText": "Choose the correct option: Which car is ______? The black or the silver one?",
        "options": [
          "yours",
          "your",
          "you",
          "yourself"
        ],
        "correctAnswer": "yours",
        "explanation": "ضمير الملكية المستقل الذي يأتي في نهاية السؤال بدون اسم بعده هو yours.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_40",
        "questionText": "Choose the correct option: What are you looking ______? - My car keys.",
        "options": [
          "for",
          "at",
          "after",
          "into"
        ],
        "correctAnswer": "for",
        "explanation": "الفعل الاصطلاحي يبحث عن هو look for.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qf_41",
        "questionText": "[Thanawya Amma Standard] ______ do you usually go to the sports academy? - Twice a week.",
        "options": [
          "How often",
          "How long",
          "How much",
          "How many"
        ],
        "correctAnswer": "How often",
        "explanation": "للسؤال عن معدل تكرار الفعل (مرتين أسبوعياً) نستخدم How often.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_42",
        "questionText": "[Thanawya Amma Standard] ______ did they travel to Luxor last winter? - By sleeper train.",
        "options": [
          "How",
          "Why",
          "Where",
          "When"
        ],
        "correctAnswer": "How",
        "explanation": "للسؤال عن وسيلة المواصلات والكيفية نستخدم How.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_43",
        "questionText": "[Thanawya Amma Standard] Who ______ the famous historical novel 'The Thief and the Dogs'?",
        "options": [
          "wrote",
          "did write",
          "was written",
          "writes did"
        ],
        "correctAnswer": "wrote",
        "explanation": "عند السؤال عن الفاعل العاقل لا نستخدم فعل مساعد did ويأتي الفعل في الماضي wrote مباشرة.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_44",
        "questionText": "[Thanawya Amma Standard] What ______ during the laboratory chemistry experiment?",
        "options": [
          "happened",
          "did happen",
          "was happen",
          "happens did"
        ],
        "correctAnswer": "happened",
        "explanation": "عند السؤال عن الفاعل غير العاقل بـ What لا نستخدم فعل مساعد did.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_45",
        "questionText": "[Thanawya Amma Standard] Could you please tell me where the nearest pharmacy ______?",
        "options": [
          "is",
          "is it",
          "is there",
          "does it"
        ],
        "correctAnswer": "is",
        "explanation": "في السؤال غير المباشر بعد Could you tell me يأتي الفاعل ثم الفعل is بترتيب خبري.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_46",
        "questionText": "[Thanawya Amma Standard] Do you know what time ______?",
        "options": [
          "the train departs",
          "does the train depart",
          "departs the train",
          "did the train depart"
        ],
        "correctAnswer": "the train departs",
        "explanation": "في السؤال المهذب Do you know لا نستخدم does ونضع فاعل ثم فعل: the train departs.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_47",
        "questionText": "[Thanawya Amma Standard] ______ sugar do you need for this dessert recipe?",
        "options": [
          "How much",
          "How many",
          "How long",
          "How often"
        ],
        "correctAnswer": "How much",
        "explanation": "كلمة sugar اسم غير معدود فتسأل بـ How much.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_48",
        "questionText": "[Thanawya Amma Standard] ______ students attended the extra English session?",
        "options": [
          "How many",
          "How much",
          "How long",
          "How far"
        ],
        "correctAnswer": "How many",
        "explanation": "اسم جمع معدود students يسأل بـ How many.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_49",
        "questionText": "[Thanawya Amma Standard] Which car is ______? The black or the silver one?",
        "options": [
          "yours",
          "your",
          "you",
          "yourself"
        ],
        "correctAnswer": "yours",
        "explanation": "ضمير الملكية المستقل الذي يأتي في نهاية السؤال بدون اسم بعده هو yours.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qf_50",
        "questionText": "[Thanawya Amma Standard] What are you looking ______? - My car keys.",
        "options": [
          "for",
          "at",
          "after",
          "into"
        ],
        "correctAnswer": "for",
        "explanation": "الفعل الاصطلاحي يبحث عن هو look for.",
        "difficulty": "Hard"
      }
    ]
  },
  "question-tags": {
    "id": "question-tags",
    "titleAr": "السؤال المذيل (Question Tags)",
    "titleEn": "Question Tags & Edge Cases",
    "summary": {
      "concept": "السؤال المذيل هو سؤال قصير في نهاية الجملة للتأكيد أو طلب الموافقة، ومعناه 'أليس كذلك؟'.",
      "formula": [
        "جملة مثبتة (+) -> سؤال مذيل منفي (-): Auxiliary + n't + Pronoun?",
        "جملة منفية (-) -> سؤال مذيل مثبت (+): Auxiliary + Pronoun?"
      ],
      "keyRules": [
        {
          "title": "القاعدة العامة المعكوسة",
          "explanation": "إذا كانت الجملة مثبتة يكون السؤال منفياً، وإذا كانت منفية يكون السؤال مثبتاً. ويُستخدم الضمير الشخصي العائد على الفاعل دائماً.",
          "examples": [
            "You are a student, aren't you?",
            "She hasn't finished yet, has she?",
            "They will come tomorrow, won't they?"
          ]
        },
        {
          "title": "حالات المضارع والماضي البسيط بدون فعل مساعد ظاهر",
          "explanation": "مع المضارع البسيط نستخدم don't / doesn't. ومع الماضي البسيط نستخدم didn't.",
          "examples": [
            "He lives in Cairo, doesn't he?",
            "They won the match, didn't they?"
          ]
        }
      ],
      "examSecrets": [
        "حالة I am -> السؤال المذيل هو aren't I? (أما I am not فيكون am I?).",
        "حالة Let's -> السؤال المذيل هو shall we? (أما Let us / Let me فيكون will you?).",
        "جملة الأمر المثبت والمنفي -> السؤال المذيل هو will you? (مثل: Close the door, will you?).",
        "الكلمات التي تعطي معنى النفي الضمني (never, rarely, seldom, hardly, scarcely, neither, nobody, nothing) تعامل كجملة منفية ويكون السؤال مثبتاً: She rarely eats fish, does she?",
        "الضمائر غير المحددة للفاعل (everyone, everybody, someone, nobody) تعامل كمفرد في الجملة لكن في السؤال المذيل يعود عليها الضمير they: Everyone was happy, weren't they?",
        "الضمائر الدالة على غير العاقل (everything, something, nothing) يعود عليها الضمير it: Nothing happened, did it?"
      ],
      "commonMistakes": [
        {
          "mistake": "I am right, amn't I?",
          "correction": "I am right, aren't I?",
          "reason": "في الإنجليزية القياسية لا توجد كلمة amn't ويستخدم بدلاً منها aren't I."
        },
        {
          "mistake": "Nobody called, didn't they?",
          "correction": "Nobody called, did they?",
          "reason": "كلمة Nobody تفيد النفي، لذا يجب أن يكون السؤال المذيل مثبتاً did they."
        }
      ]
    },
    "questions": [
      {
        "id": "q_qt_1",
        "questionText": "You have finished your revision project, ______?",
        "options": [
          "haven't you",
          "have you",
          "don't you",
          "didn't you"
        ],
        "correctAnswer": "haven't you",
        "explanation": "الجملة مثبتة في المضارع التام have finished، فيكون السؤال منفياً haven't you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_2",
        "questionText": "She doesn't speak Italian, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "did she"
        ],
        "correctAnswer": "does she",
        "explanation": "الجملة منفية بـ doesn't، فيكون السؤال مثبتاً does she.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_3",
        "questionText": "I am late for the scheduled meeting, ______?",
        "options": [
          "aren't I",
          "am I",
          "amn't I",
          "don't I"
        ],
        "correctAnswer": "aren't I",
        "explanation": "صيغة I am الإثباتية يكون السؤال المذيل المعياري لها aren't I.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_4",
        "questionText": "Let's review the final grammar unit, ______?",
        "options": [
          "shall we",
          "will you",
          "don't we",
          "aren't we"
        ],
        "correctAnswer": "shall we",
        "explanation": "صيغة الاقتراح بـ Let's يكون السؤال المذيل لها shall we.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_5",
        "questionText": "Open the window, ______?",
        "options": [
          "will you",
          "shall you",
          "do you",
          "don't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة الأمر المباشر يكون السؤال المذيل لها will you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_6",
        "questionText": "Don't touch that wire, ______?",
        "options": [
          "will you",
          "do you",
          "shall we",
          "won't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة النهي المنفي يكون السؤال المذيل لها will you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_7",
        "questionText": "She rarely eats fast food, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "has she"
        ],
        "correctAnswer": "does she",
        "explanation": "ظرف النفي rarely يفيد النفي، لذا يكون السؤال المذيل مثبتاً does she.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_8",
        "questionText": "Nobody answered the telephone, ______?",
        "options": [
          "did they",
          "didn't they",
          "did he",
          "didn't he"
        ],
        "correctAnswer": "did they",
        "explanation": "كلمة Nobody تفيد النفي ويعود عليها الضمير they، فيكون السؤال مثبتاً did they.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_9",
        "questionText": "Everyone was satisfied with the results, ______?",
        "options": [
          "weren't they",
          "wasn't he",
          "wasn't it",
          "didn't they"
        ],
        "correctAnswer": "weren't they",
        "explanation": "كلمة Everyone يعود عليها الضمير الجمع they ويأخذ weren't they.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_10",
        "questionText": "Nothing went wrong during the experiment, ______?",
        "options": [
          "did it",
          "didn't it",
          "did they",
          "didn't they"
        ],
        "correctAnswer": "did it",
        "explanation": "كلمة Nothing تفيد النفي ويعود عليها الضمير it، فيكون السؤال مثبتاً did it.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_11",
        "questionText": "You have finished your revision project, ______?",
        "options": [
          "haven't you",
          "have you",
          "don't you",
          "didn't you"
        ],
        "correctAnswer": "haven't you",
        "explanation": "الجملة مثبتة في المضارع التام have finished، فيكون السؤال منفياً haven't you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_12",
        "questionText": "She doesn't speak Italian, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "did she"
        ],
        "correctAnswer": "does she",
        "explanation": "الجملة منفية بـ doesn't، فيكون السؤال مثبتاً does she.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_13",
        "questionText": "I am late for the scheduled meeting, ______?",
        "options": [
          "aren't I",
          "am I",
          "amn't I",
          "don't I"
        ],
        "correctAnswer": "aren't I",
        "explanation": "صيغة I am الإثباتية يكون السؤال المذيل المعياري لها aren't I.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_14",
        "questionText": "Let's review the final grammar unit, ______?",
        "options": [
          "shall we",
          "will you",
          "don't we",
          "aren't we"
        ],
        "correctAnswer": "shall we",
        "explanation": "صيغة الاقتراح بـ Let's يكون السؤال المذيل لها shall we.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_15",
        "questionText": "Open the window, ______?",
        "options": [
          "will you",
          "shall you",
          "do you",
          "don't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة الأمر المباشر يكون السؤال المذيل لها will you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_16",
        "questionText": "Don't touch that wire, ______?",
        "options": [
          "will you",
          "do you",
          "shall we",
          "won't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة النهي المنفي يكون السؤال المذيل لها will you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_17",
        "questionText": "She rarely eats fast food, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "has she"
        ],
        "correctAnswer": "does she",
        "explanation": "ظرف النفي rarely يفيد النفي، لذا يكون السؤال المذيل مثبتاً does she.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_18",
        "questionText": "Nobody answered the telephone, ______?",
        "options": [
          "did they",
          "didn't they",
          "did he",
          "didn't he"
        ],
        "correctAnswer": "did they",
        "explanation": "كلمة Nobody تفيد النفي ويعود عليها الضمير they، فيكون السؤال مثبتاً did they.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_19",
        "questionText": "Everyone was satisfied with the results, ______?",
        "options": [
          "weren't they",
          "wasn't he",
          "wasn't it",
          "didn't they"
        ],
        "correctAnswer": "weren't they",
        "explanation": "كلمة Everyone يعود عليها الضمير الجمع they ويأخذ weren't they.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_20",
        "questionText": "Nothing went wrong during the experiment, ______?",
        "options": [
          "did it",
          "didn't it",
          "did they",
          "didn't they"
        ],
        "correctAnswer": "did it",
        "explanation": "كلمة Nothing تفيد النفي ويعود عليها الضمير it، فيكون السؤال مثبتاً did it.",
        "difficulty": "Easy"
      },
      {
        "id": "q_qt_21",
        "questionText": "[Exam Model 21] You have finished your revision project, ______?",
        "options": [
          "haven't you",
          "have you",
          "don't you",
          "didn't you"
        ],
        "correctAnswer": "haven't you",
        "explanation": "الجملة مثبتة في المضارع التام have finished، فيكون السؤال منفياً haven't you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_22",
        "questionText": "[Exam Model 22] She doesn't speak Italian, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "did she"
        ],
        "correctAnswer": "does she",
        "explanation": "الجملة منفية بـ doesn't، فيكون السؤال مثبتاً does she.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_23",
        "questionText": "[Exam Model 23] I am late for the scheduled meeting, ______?",
        "options": [
          "aren't I",
          "am I",
          "amn't I",
          "don't I"
        ],
        "correctAnswer": "aren't I",
        "explanation": "صيغة I am الإثباتية يكون السؤال المذيل المعياري لها aren't I.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_24",
        "questionText": "[Exam Model 24] Let's review the final grammar unit, ______?",
        "options": [
          "shall we",
          "will you",
          "don't we",
          "aren't we"
        ],
        "correctAnswer": "shall we",
        "explanation": "صيغة الاقتراح بـ Let's يكون السؤال المذيل لها shall we.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_25",
        "questionText": "[Exam Model 25] Open the window, ______?",
        "options": [
          "will you",
          "shall you",
          "do you",
          "don't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة الأمر المباشر يكون السؤال المذيل لها will you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_26",
        "questionText": "[Exam Model 26] Don't touch that wire, ______?",
        "options": [
          "will you",
          "do you",
          "shall we",
          "won't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة النهي المنفي يكون السؤال المذيل لها will you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_27",
        "questionText": "[Exam Model 27] She rarely eats fast food, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "has she"
        ],
        "correctAnswer": "does she",
        "explanation": "ظرف النفي rarely يفيد النفي، لذا يكون السؤال المذيل مثبتاً does she.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_28",
        "questionText": "[Exam Model 28] Nobody answered the telephone, ______?",
        "options": [
          "did they",
          "didn't they",
          "did he",
          "didn't he"
        ],
        "correctAnswer": "did they",
        "explanation": "كلمة Nobody تفيد النفي ويعود عليها الضمير they، فيكون السؤال مثبتاً did they.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_29",
        "questionText": "[Exam Model 29] Everyone was satisfied with the results, ______?",
        "options": [
          "weren't they",
          "wasn't he",
          "wasn't it",
          "didn't they"
        ],
        "correctAnswer": "weren't they",
        "explanation": "كلمة Everyone يعود عليها الضمير الجمع they ويأخذ weren't they.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_30",
        "questionText": "[Exam Model 30] Nothing went wrong during the experiment, ______?",
        "options": [
          "did it",
          "didn't it",
          "did they",
          "didn't they"
        ],
        "correctAnswer": "did it",
        "explanation": "كلمة Nothing تفيد النفي ويعود عليها الضمير it، فيكون السؤال مثبتاً did it.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_31",
        "questionText": "Choose the correct option: You have finished your revision project, ______?",
        "options": [
          "haven't you",
          "have you",
          "don't you",
          "didn't you"
        ],
        "correctAnswer": "haven't you",
        "explanation": "الجملة مثبتة في المضارع التام have finished، فيكون السؤال منفياً haven't you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_32",
        "questionText": "Choose the correct option: She doesn't speak Italian, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "did she"
        ],
        "correctAnswer": "does she",
        "explanation": "الجملة منفية بـ doesn't، فيكون السؤال مثبتاً does she.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_33",
        "questionText": "Choose the correct option: I am late for the scheduled meeting, ______?",
        "options": [
          "aren't I",
          "am I",
          "amn't I",
          "don't I"
        ],
        "correctAnswer": "aren't I",
        "explanation": "صيغة I am الإثباتية يكون السؤال المذيل المعياري لها aren't I.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_34",
        "questionText": "Choose the correct option: Let's review the final grammar unit, ______?",
        "options": [
          "shall we",
          "will you",
          "don't we",
          "aren't we"
        ],
        "correctAnswer": "shall we",
        "explanation": "صيغة الاقتراح بـ Let's يكون السؤال المذيل لها shall we.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_35",
        "questionText": "Choose the correct option: Open the window, ______?",
        "options": [
          "will you",
          "shall you",
          "do you",
          "don't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة الأمر المباشر يكون السؤال المذيل لها will you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_36",
        "questionText": "Choose the correct option: Don't touch that wire, ______?",
        "options": [
          "will you",
          "do you",
          "shall we",
          "won't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة النهي المنفي يكون السؤال المذيل لها will you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_37",
        "questionText": "Choose the correct option: She rarely eats fast food, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "has she"
        ],
        "correctAnswer": "does she",
        "explanation": "ظرف النفي rarely يفيد النفي، لذا يكون السؤال المذيل مثبتاً does she.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_38",
        "questionText": "Choose the correct option: Nobody answered the telephone, ______?",
        "options": [
          "did they",
          "didn't they",
          "did he",
          "didn't he"
        ],
        "correctAnswer": "did they",
        "explanation": "كلمة Nobody تفيد النفي ويعود عليها الضمير they، فيكون السؤال مثبتاً did they.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_39",
        "questionText": "Choose the correct option: Everyone was satisfied with the results, ______?",
        "options": [
          "weren't they",
          "wasn't he",
          "wasn't it",
          "didn't they"
        ],
        "correctAnswer": "weren't they",
        "explanation": "كلمة Everyone يعود عليها الضمير الجمع they ويأخذ weren't they.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_40",
        "questionText": "Choose the correct option: Nothing went wrong during the experiment, ______?",
        "options": [
          "did it",
          "didn't it",
          "did they",
          "didn't they"
        ],
        "correctAnswer": "did it",
        "explanation": "كلمة Nothing تفيد النفي ويعود عليها الضمير it، فيكون السؤال مثبتاً did it.",
        "difficulty": "Medium"
      },
      {
        "id": "q_qt_41",
        "questionText": "[Thanawya Amma Standard] You have finished your revision project, ______?",
        "options": [
          "haven't you",
          "have you",
          "don't you",
          "didn't you"
        ],
        "correctAnswer": "haven't you",
        "explanation": "الجملة مثبتة في المضارع التام have finished، فيكون السؤال منفياً haven't you.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_42",
        "questionText": "[Thanawya Amma Standard] She doesn't speak Italian, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "did she"
        ],
        "correctAnswer": "does she",
        "explanation": "الجملة منفية بـ doesn't، فيكون السؤال مثبتاً does she.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_43",
        "questionText": "[Thanawya Amma Standard] I am late for the scheduled meeting, ______?",
        "options": [
          "aren't I",
          "am I",
          "amn't I",
          "don't I"
        ],
        "correctAnswer": "aren't I",
        "explanation": "صيغة I am الإثباتية يكون السؤال المذيل المعياري لها aren't I.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_44",
        "questionText": "[Thanawya Amma Standard] Let's review the final grammar unit, ______?",
        "options": [
          "shall we",
          "will you",
          "don't we",
          "aren't we"
        ],
        "correctAnswer": "shall we",
        "explanation": "صيغة الاقتراح بـ Let's يكون السؤال المذيل لها shall we.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_45",
        "questionText": "[Thanawya Amma Standard] Open the window, ______?",
        "options": [
          "will you",
          "shall you",
          "do you",
          "don't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة الأمر المباشر يكون السؤال المذيل لها will you.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_46",
        "questionText": "[Thanawya Amma Standard] Don't touch that wire, ______?",
        "options": [
          "will you",
          "do you",
          "shall we",
          "won't you"
        ],
        "correctAnswer": "will you",
        "explanation": "جملة النهي المنفي يكون السؤال المذيل لها will you.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_47",
        "questionText": "[Thanawya Amma Standard] She rarely eats fast food, ______?",
        "options": [
          "does she",
          "doesn't she",
          "is she",
          "has she"
        ],
        "correctAnswer": "does she",
        "explanation": "ظرف النفي rarely يفيد النفي، لذا يكون السؤال المذيل مثبتاً does she.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_48",
        "questionText": "[Thanawya Amma Standard] Nobody answered the telephone, ______?",
        "options": [
          "did they",
          "didn't they",
          "did he",
          "didn't he"
        ],
        "correctAnswer": "did they",
        "explanation": "كلمة Nobody تفيد النفي ويعود عليها الضمير they، فيكون السؤال مثبتاً did they.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_49",
        "questionText": "[Thanawya Amma Standard] Everyone was satisfied with the results, ______?",
        "options": [
          "weren't they",
          "wasn't he",
          "wasn't it",
          "didn't they"
        ],
        "correctAnswer": "weren't they",
        "explanation": "كلمة Everyone يعود عليها الضمير الجمع they ويأخذ weren't they.",
        "difficulty": "Hard"
      },
      {
        "id": "q_qt_50",
        "questionText": "[Thanawya Amma Standard] Nothing went wrong during the experiment, ______?",
        "options": [
          "did it",
          "didn't it",
          "did they",
          "didn't they"
        ],
        "correctAnswer": "did it",
        "explanation": "كلمة Nothing تفيد النفي ويعود عليها الضمير it، فيكون السؤال مثبتاً did it.",
        "difficulty": "Hard"
      }
    ]
  },
  "present-continuous": {
    "id": "present-continuous",
    "titleAr": "المضارع المستمر (Present Continuous)",
    "titleEn": "Present Continuous & Stative Verbs",
    "summary": {
      "concept": "يعبر عن أحداث تقع الآن وقت الكلام، أو أحداث مؤقتة، أو ترتيبات مستقبلية مؤكدة.",
      "formula": [
        "Affirmative: Subject + am / is / are + Verb-ing",
        "Negative: Subject + am / is / are + not + Verb-ing",
        "Question: Am / Is / Are + Subject + Verb-ing?"
      ],
      "keyRules": [
        {
          "title": "الاستخدامات الأربعة الرئيسية",
          "explanation": "1. أحداث مستمرة وقت الحديث (now, at the moment). 2. مواقف مؤقتة (this week, currently). 3. تغيرات وتطورات تدريجية (getting better, increasing). 4. ترتيبات مستقبلية محددة ومجهزة مسبقاً (arranged future).",
          "examples": [
            "Look! The train is arriving now.",
            "He is staying with his uncle this month.",
            "I am flying to London next Monday; I've already booked the tickets."
          ]
        },
        {
          "title": "أفعال الحواس والشعور والملكية (Stative Verbs)",
          "explanation": "أفعال الحالة لا توضع في الأزمنة المستمرة في معناها الأصلي (love, like, hate, know, understand, believe, want, need, own, possess, belong).",
          "examples": [
            "I know the answer. (وليس: I am knowing)",
            "This laptop belongs to Ali. (وليس: is belonging)"
          ]
        }
      ],
      "examSecrets": [
        "أفعال لها معنيان (Stative vs Dynamic): مثل think (بمعنى يعتقد لا تأخذ ing / بمعنى يفكر في عقله تأخذ ing)، have (بمعنى يملك لا تأخذ ing / بمعنى يتناول وجبة أو يقضي وقتاً تأخذ ing).",
        "استخدام always مع المضارع المستمر: يفيد التعبير عن الضيق والانزعاج من عادة متكررة (annoyance): He is always interrupting me!",
        "الكلمات الدالة: now, at the moment, currently, at present, Look!, Listen!, Watch out!, Be quiet!"
      ],
      "commonMistakes": [
        {
          "mistake": "I am wanting a cup of coffee right now.",
          "correction": "I want a cup of coffee right now.",
          "reason": "الفعل want من أفعال الرغبة والحالة Stative ولا يضاف له ing."
        },
        {
          "mistake": "He is having a sports car.",
          "correction": "He has a sports car.",
          "reason": "فعل have بمعنى يملك Stative لا يوضع في المستمر، بينما بمعنى يتناول وجبة أو يقضي وقتاً يجوز استمراره."
        }
      ]
    },
    "questions": [
      {
        "id": "q_pc_1",
        "questionText": "Look! The children ______ in the garden.",
        "options": [
          "are playing",
          "play",
          "played",
          "have played"
        ],
        "correctAnswer": "are playing",
        "explanation": "كلمة Look! تدل على حدث مستمر الآن في المضارع المستمر: are playing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_2",
        "questionText": "Listen! Someone ______ on the front door.",
        "options": [
          "is knocking",
          "knocks",
          "knocked",
          "was knocking"
        ],
        "correctAnswer": "is knocking",
        "explanation": "كلمة Listen! تدل على المضارع المستمر: is knocking.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_3",
        "questionText": "Currently, our research team ______ a new mobile application.",
        "options": [
          "is developing",
          "develops",
          "developed",
          "develop"
        ],
        "correctAnswer": "is developing",
        "explanation": "الظرف Currently يدل على حدث مؤقت مستمر في الحاضر: is developing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_4",
        "questionText": "I ______ to Frankfurt next Tuesday; my flight is already booked.",
        "options": [
          "am flying",
          "fly",
          "flew",
          "flown"
        ],
        "correctAnswer": "am flying",
        "explanation": "المستقبل المرتب له مسبقاً (Arranged future) يُعبر عنه بالمضارع المستمر am flying.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_5",
        "questionText": "Why ______ you ______ my grammar notes right now?",
        "options": [
          "are / borrowing",
          "do / borrow",
          "did / borrow",
          "have / borrowed"
        ],
        "correctAnswer": "are / borrowing",
        "explanation": "الظرف right now يتطلب صيغة المضارع المستمر are you borrowing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_6",
        "questionText": "He ______ always ______ his keys! It is so frustrating.",
        "options": [
          "is / losing",
          "does / lose",
          "has / lost",
          "will / lose"
        ],
        "correctAnswer": "is / losing",
        "explanation": "استخدام always مع المضارع المستمر يعبر عن الضيق والانزعاج من عادة مزعجة.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_7",
        "questionText": "I ______ the truth of what you are explaining.",
        "options": [
          "understand",
          "am understanding",
          "understanding",
          "was understood"
        ],
        "correctAnswer": "understand",
        "explanation": "الفعل understand من أفعال الإدراك Stative ولا يوضع في صيغة المستمر.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_8",
        "questionText": "This antique watch ______ to my grandfather.",
        "options": [
          "belongs",
          "is belonging",
          "belong",
          "belonged is"
        ],
        "correctAnswer": "belongs",
        "explanation": "فعل الملكية belong فعل حالة Stative لا يأخذ ing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_9",
        "questionText": "What ______ about the new curriculum? - I think it is great.",
        "options": [
          "do you think",
          "are you thinking",
          "did you think",
          "have you thought"
        ],
        "correctAnswer": "do you think",
        "explanation": "السؤال عن الرأي والاعتقاد مع think يأتي في المضارع البسيط do you think.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_10",
        "questionText": "Be quiet! The baby ______ in the adjacent room.",
        "options": [
          "is sleeping",
          "sleeps",
          "slept",
          "has slept"
        ],
        "correctAnswer": "is sleeping",
        "explanation": "التحذير Be quiet! يدل على حدث مستمر في لحظة التحدث: is sleeping.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_11",
        "questionText": "Look! The children ______ in the garden.",
        "options": [
          "are playing",
          "play",
          "played",
          "have played"
        ],
        "correctAnswer": "are playing",
        "explanation": "كلمة Look! تدل على حدث مستمر الآن في المضارع المستمر: are playing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_12",
        "questionText": "Listen! Someone ______ on the front door.",
        "options": [
          "is knocking",
          "knocks",
          "knocked",
          "was knocking"
        ],
        "correctAnswer": "is knocking",
        "explanation": "كلمة Listen! تدل على المضارع المستمر: is knocking.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_13",
        "questionText": "Currently, our research team ______ a new mobile application.",
        "options": [
          "is developing",
          "develops",
          "developed",
          "develop"
        ],
        "correctAnswer": "is developing",
        "explanation": "الظرف Currently يدل على حدث مؤقت مستمر في الحاضر: is developing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_14",
        "questionText": "I ______ to Frankfurt next Tuesday; my flight is already booked.",
        "options": [
          "am flying",
          "fly",
          "flew",
          "flown"
        ],
        "correctAnswer": "am flying",
        "explanation": "المستقبل المرتب له مسبقاً (Arranged future) يُعبر عنه بالمضارع المستمر am flying.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_15",
        "questionText": "Why ______ you ______ my grammar notes right now?",
        "options": [
          "are / borrowing",
          "do / borrow",
          "did / borrow",
          "have / borrowed"
        ],
        "correctAnswer": "are / borrowing",
        "explanation": "الظرف right now يتطلب صيغة المضارع المستمر are you borrowing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_16",
        "questionText": "He ______ always ______ his keys! It is so frustrating.",
        "options": [
          "is / losing",
          "does / lose",
          "has / lost",
          "will / lose"
        ],
        "correctAnswer": "is / losing",
        "explanation": "استخدام always مع المضارع المستمر يعبر عن الضيق والانزعاج من عادة مزعجة.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_17",
        "questionText": "I ______ the truth of what you are explaining.",
        "options": [
          "understand",
          "am understanding",
          "understanding",
          "was understood"
        ],
        "correctAnswer": "understand",
        "explanation": "الفعل understand من أفعال الإدراك Stative ولا يوضع في صيغة المستمر.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_18",
        "questionText": "This antique watch ______ to my grandfather.",
        "options": [
          "belongs",
          "is belonging",
          "belong",
          "belonged is"
        ],
        "correctAnswer": "belongs",
        "explanation": "فعل الملكية belong فعل حالة Stative لا يأخذ ing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_19",
        "questionText": "What ______ about the new curriculum? - I think it is great.",
        "options": [
          "do you think",
          "are you thinking",
          "did you think",
          "have you thought"
        ],
        "correctAnswer": "do you think",
        "explanation": "السؤال عن الرأي والاعتقاد مع think يأتي في المضارع البسيط do you think.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_20",
        "questionText": "Be quiet! The baby ______ in the adjacent room.",
        "options": [
          "is sleeping",
          "sleeps",
          "slept",
          "has slept"
        ],
        "correctAnswer": "is sleeping",
        "explanation": "التحذير Be quiet! يدل على حدث مستمر في لحظة التحدث: is sleeping.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pc_21",
        "questionText": "[Exam Model 21] Look! The children ______ in the garden.",
        "options": [
          "are playing",
          "play",
          "played",
          "have played"
        ],
        "correctAnswer": "are playing",
        "explanation": "كلمة Look! تدل على حدث مستمر الآن في المضارع المستمر: are playing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_22",
        "questionText": "[Exam Model 22] Listen! Someone ______ on the front door.",
        "options": [
          "is knocking",
          "knocks",
          "knocked",
          "was knocking"
        ],
        "correctAnswer": "is knocking",
        "explanation": "كلمة Listen! تدل على المضارع المستمر: is knocking.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_23",
        "questionText": "[Exam Model 23] Currently, our research team ______ a new mobile application.",
        "options": [
          "is developing",
          "develops",
          "developed",
          "develop"
        ],
        "correctAnswer": "is developing",
        "explanation": "الظرف Currently يدل على حدث مؤقت مستمر في الحاضر: is developing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_24",
        "questionText": "[Exam Model 24] I ______ to Frankfurt next Tuesday; my flight is already booked.",
        "options": [
          "am flying",
          "fly",
          "flew",
          "flown"
        ],
        "correctAnswer": "am flying",
        "explanation": "المستقبل المرتب له مسبقاً (Arranged future) يُعبر عنه بالمضارع المستمر am flying.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_25",
        "questionText": "[Exam Model 25] Why ______ you ______ my grammar notes right now?",
        "options": [
          "are / borrowing",
          "do / borrow",
          "did / borrow",
          "have / borrowed"
        ],
        "correctAnswer": "are / borrowing",
        "explanation": "الظرف right now يتطلب صيغة المضارع المستمر are you borrowing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_26",
        "questionText": "[Exam Model 26] He ______ always ______ his keys! It is so frustrating.",
        "options": [
          "is / losing",
          "does / lose",
          "has / lost",
          "will / lose"
        ],
        "correctAnswer": "is / losing",
        "explanation": "استخدام always مع المضارع المستمر يعبر عن الضيق والانزعاج من عادة مزعجة.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_27",
        "questionText": "[Exam Model 27] I ______ the truth of what you are explaining.",
        "options": [
          "understand",
          "am understanding",
          "understanding",
          "was understood"
        ],
        "correctAnswer": "understand",
        "explanation": "الفعل understand من أفعال الإدراك Stative ولا يوضع في صيغة المستمر.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_28",
        "questionText": "[Exam Model 28] This antique watch ______ to my grandfather.",
        "options": [
          "belongs",
          "is belonging",
          "belong",
          "belonged is"
        ],
        "correctAnswer": "belongs",
        "explanation": "فعل الملكية belong فعل حالة Stative لا يأخذ ing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_29",
        "questionText": "[Exam Model 29] What ______ about the new curriculum? - I think it is great.",
        "options": [
          "do you think",
          "are you thinking",
          "did you think",
          "have you thought"
        ],
        "correctAnswer": "do you think",
        "explanation": "السؤال عن الرأي والاعتقاد مع think يأتي في المضارع البسيط do you think.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_30",
        "questionText": "[Exam Model 30] Be quiet! The baby ______ in the adjacent room.",
        "options": [
          "is sleeping",
          "sleeps",
          "slept",
          "has slept"
        ],
        "correctAnswer": "is sleeping",
        "explanation": "التحذير Be quiet! يدل على حدث مستمر في لحظة التحدث: is sleeping.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_31",
        "questionText": "Choose the correct option: Look! The children ______ in the garden.",
        "options": [
          "are playing",
          "play",
          "played",
          "have played"
        ],
        "correctAnswer": "are playing",
        "explanation": "كلمة Look! تدل على حدث مستمر الآن في المضارع المستمر: are playing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_32",
        "questionText": "Choose the correct option: Listen! Someone ______ on the front door.",
        "options": [
          "is knocking",
          "knocks",
          "knocked",
          "was knocking"
        ],
        "correctAnswer": "is knocking",
        "explanation": "كلمة Listen! تدل على المضارع المستمر: is knocking.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_33",
        "questionText": "Choose the correct option: Currently, our research team ______ a new mobile application.",
        "options": [
          "is developing",
          "develops",
          "developed",
          "develop"
        ],
        "correctAnswer": "is developing",
        "explanation": "الظرف Currently يدل على حدث مؤقت مستمر في الحاضر: is developing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_34",
        "questionText": "Choose the correct option: I ______ to Frankfurt next Tuesday; my flight is already booked.",
        "options": [
          "am flying",
          "fly",
          "flew",
          "flown"
        ],
        "correctAnswer": "am flying",
        "explanation": "المستقبل المرتب له مسبقاً (Arranged future) يُعبر عنه بالمضارع المستمر am flying.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_35",
        "questionText": "Choose the correct option: Why ______ you ______ my grammar notes right now?",
        "options": [
          "are / borrowing",
          "do / borrow",
          "did / borrow",
          "have / borrowed"
        ],
        "correctAnswer": "are / borrowing",
        "explanation": "الظرف right now يتطلب صيغة المضارع المستمر are you borrowing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_36",
        "questionText": "Choose the correct option: He ______ always ______ his keys! It is so frustrating.",
        "options": [
          "is / losing",
          "does / lose",
          "has / lost",
          "will / lose"
        ],
        "correctAnswer": "is / losing",
        "explanation": "استخدام always مع المضارع المستمر يعبر عن الضيق والانزعاج من عادة مزعجة.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_37",
        "questionText": "Choose the correct option: I ______ the truth of what you are explaining.",
        "options": [
          "understand",
          "am understanding",
          "understanding",
          "was understood"
        ],
        "correctAnswer": "understand",
        "explanation": "الفعل understand من أفعال الإدراك Stative ولا يوضع في صيغة المستمر.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_38",
        "questionText": "Choose the correct option: This antique watch ______ to my grandfather.",
        "options": [
          "belongs",
          "is belonging",
          "belong",
          "belonged is"
        ],
        "correctAnswer": "belongs",
        "explanation": "فعل الملكية belong فعل حالة Stative لا يأخذ ing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_39",
        "questionText": "Choose the correct option: What ______ about the new curriculum? - I think it is great.",
        "options": [
          "do you think",
          "are you thinking",
          "did you think",
          "have you thought"
        ],
        "correctAnswer": "do you think",
        "explanation": "السؤال عن الرأي والاعتقاد مع think يأتي في المضارع البسيط do you think.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_40",
        "questionText": "Choose the correct option: Be quiet! The baby ______ in the adjacent room.",
        "options": [
          "is sleeping",
          "sleeps",
          "slept",
          "has slept"
        ],
        "correctAnswer": "is sleeping",
        "explanation": "التحذير Be quiet! يدل على حدث مستمر في لحظة التحدث: is sleeping.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pc_41",
        "questionText": "[Thanawya Amma Standard] Look! The children ______ in the garden.",
        "options": [
          "are playing",
          "play",
          "played",
          "have played"
        ],
        "correctAnswer": "are playing",
        "explanation": "كلمة Look! تدل على حدث مستمر الآن في المضارع المستمر: are playing.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_42",
        "questionText": "[Thanawya Amma Standard] Listen! Someone ______ on the front door.",
        "options": [
          "is knocking",
          "knocks",
          "knocked",
          "was knocking"
        ],
        "correctAnswer": "is knocking",
        "explanation": "كلمة Listen! تدل على المضارع المستمر: is knocking.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_43",
        "questionText": "[Thanawya Amma Standard] Currently, our research team ______ a new mobile application.",
        "options": [
          "is developing",
          "develops",
          "developed",
          "develop"
        ],
        "correctAnswer": "is developing",
        "explanation": "الظرف Currently يدل على حدث مؤقت مستمر في الحاضر: is developing.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_44",
        "questionText": "[Thanawya Amma Standard] I ______ to Frankfurt next Tuesday; my flight is already booked.",
        "options": [
          "am flying",
          "fly",
          "flew",
          "flown"
        ],
        "correctAnswer": "am flying",
        "explanation": "المستقبل المرتب له مسبقاً (Arranged future) يُعبر عنه بالمضارع المستمر am flying.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_45",
        "questionText": "[Thanawya Amma Standard] Why ______ you ______ my grammar notes right now?",
        "options": [
          "are / borrowing",
          "do / borrow",
          "did / borrow",
          "have / borrowed"
        ],
        "correctAnswer": "are / borrowing",
        "explanation": "الظرف right now يتطلب صيغة المضارع المستمر are you borrowing.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_46",
        "questionText": "[Thanawya Amma Standard] He ______ always ______ his keys! It is so frustrating.",
        "options": [
          "is / losing",
          "does / lose",
          "has / lost",
          "will / lose"
        ],
        "correctAnswer": "is / losing",
        "explanation": "استخدام always مع المضارع المستمر يعبر عن الضيق والانزعاج من عادة مزعجة.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_47",
        "questionText": "[Thanawya Amma Standard] I ______ the truth of what you are explaining.",
        "options": [
          "understand",
          "am understanding",
          "understanding",
          "was understood"
        ],
        "correctAnswer": "understand",
        "explanation": "الفعل understand من أفعال الإدراك Stative ولا يوضع في صيغة المستمر.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_48",
        "questionText": "[Thanawya Amma Standard] This antique watch ______ to my grandfather.",
        "options": [
          "belongs",
          "is belonging",
          "belong",
          "belonged is"
        ],
        "correctAnswer": "belongs",
        "explanation": "فعل الملكية belong فعل حالة Stative لا يأخذ ing.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_49",
        "questionText": "[Thanawya Amma Standard] What ______ about the new curriculum? - I think it is great.",
        "options": [
          "do you think",
          "are you thinking",
          "did you think",
          "have you thought"
        ],
        "correctAnswer": "do you think",
        "explanation": "السؤال عن الرأي والاعتقاد مع think يأتي في المضارع البسيط do you think.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pc_50",
        "questionText": "[Thanawya Amma Standard] Be quiet! The baby ______ in the adjacent room.",
        "options": [
          "is sleeping",
          "sleeps",
          "slept",
          "has slept"
        ],
        "correctAnswer": "is sleeping",
        "explanation": "التحذير Be quiet! يدل على حدث مستمر في لحظة التحدث: is sleeping.",
        "difficulty": "Hard"
      }
    ]
  },
  "passive-voice": {
    "id": "passive-voice",
    "titleAr": "المبني للمجهول (Passive Voice)",
    "titleEn": "Passive Voice in All Tenses & Causative",
    "summary": {
      "concept": "يُستخدم المبني للمجهول عندما يكون المفعول أو الحدث أهم من الفاعل، أو عندما يكون الفاعل مجهولاً أو بديهياً.",
      "formula": [
        "القاعدة الذهبية العامة: Object + appropriate tense of BE + Past Participle (P.P)",
        "Present Simple: am / is / are + P.P",
        "Past Simple: was / were + P.P",
        "Continuous: am/is/are/was/were + being + P.P",
        "Perfect: have / has / had + been + P.P",
        "Modals: will / can / must / should + be + P.P"
      ],
      "keyRules": [
        {
          "title": "تحويل الجمل مع مختلف الأزمنة",
          "explanation": "نبدأ بالمفعول به، ثم نضع فيرب To Be في نفس زمن الجملة الأصلية، ثم نأتي بالتصريف الثالث للفعل الأصلي.",
          "examples": [
            "Active: Engineers build bridges. -> Passive: Bridges are built by engineers.",
            "Active: They are repairing the road. -> Passive: The road is being repaired.",
            "Active: Someone has stolen my wallet. -> Passive: My wallet has been stolen."
          ]
        },
        {
          "title": "المبني للمجهول غير الشخصي (Impersonal Passive)",
          "explanation": "مع أفعال الاعتقاد والتقرير (say, think, believe, claim, report): It is said that he is rich. أو He is said to be rich.",
          "examples": [
            "It is believed that regular exercise improves mental health.",
            "The suspect is reported to have fled the country."
          ]
        }
      ],
      "examSecrets": [
        "الأفعال اللازمة (Intransitive Verbs) مثل arrive, happen, occur, die, disappear لا يمكن تحويلها للمبني للمجهول لأنه ليس لها مفعول.",
        "أفعال السببية (Causative): have / get + something + P.P تعني أن العمل تم إنجازه بواسطة شخص آخر (I had my hair cut).",
        "صيغة المصدر للمجهول بعد to: to be + P.P (He wants to be respected)."
      ],
      "commonMistakes": [
        {
          "mistake": "The accident was happened yesterday.",
          "correction": "The accident happened yesterday.",
          "reason": "الفعل happen فعل لازم لا يبنى للمجهول أبداً."
        },
        {
          "mistake": "The room is cleaning now.",
          "correction": "The room is being cleaned now.",
          "reason": "الغرفة يتم تنظيفها فتحتاج being + p.p."
        }
      ]
    },
    "questions": [
      {
        "id": "q_pv_1",
        "questionText": "Millions of emails ______ across the globe every single second.",
        "options": [
          "are sent",
          "sent",
          "send",
          "are sending"
        ],
        "correctAnswer": "are sent",
        "explanation": "المبني للمجهول في المضارع البسيط للجمع: are + p.p (are sent).",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_2",
        "questionText": "The magnificent temple of Karnak ______ by thousands of tourists daily.",
        "options": [
          "is visited",
          "was visited",
          "visits",
          "has visited"
        ],
        "correctAnswer": "is visited",
        "explanation": "حقيقة متكررة يومياً في المضارع البسيط للمجهول: is visited.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_3",
        "questionText": "The damaged highway ______ repaired right now by road engineers.",
        "options": [
          "is being",
          "is",
          "has been",
          "was being"
        ],
        "correctAnswer": "is being",
        "explanation": "الحدث مستمر الآن right now في المبني للمجهول: is being repaired.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_4",
        "questionText": "All the examination papers ______ marked by next Sunday.",
        "options": [
          "will have been",
          "will be",
          "have been",
          "are being"
        ],
        "correctAnswer": "will have been",
        "explanation": "المستقبل التام للمبني للمجهول: by next Sunday تأخذ will have been + p.p.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_5",
        "questionText": "This classic novel ______ translated into over fifty international languages.",
        "options": [
          "has been",
          "is being",
          "was been",
          "has"
        ],
        "correctAnswer": "has been",
        "explanation": "المضارع التام للمبني للمجهول: has been translated.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_6",
        "questionText": "The mystery ______ solved by the detective after intense investigation.",
        "options": [
          "was",
          "is",
          "has",
          "being"
        ],
        "correctAnswer": "was",
        "explanation": "الماضي البسيط للمبني للمجهول: was solved.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_7",
        "questionText": "All cellular phones must ______ prior to entering the exam hall.",
        "options": [
          "be switched off",
          "switch off",
          "have switched off",
          "switched off"
        ],
        "correctAnswer": "be switched off",
        "explanation": "الأفعال الناقصة في المجهول: Modal (must) + be + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_8",
        "questionText": "It ______ that eating nuts daily supports cardiovascular health.",
        "options": [
          "is believed",
          "believes",
          "is believing",
          "believed"
        ],
        "correctAnswer": "is believed",
        "explanation": "المبني للمجهول غير الشخصي: It is believed that...",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_9",
        "questionText": "I didn't paint the villa myself; I had it ______ by professionals.",
        "options": [
          "painted",
          "paint",
          "painting",
          "to paint"
        ],
        "correctAnswer": "painted",
        "explanation": "صيغة السببية Causative: had + something + P.P (had it painted).",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_10",
        "questionText": "The escaped criminal is reported ______ the national border yesterday.",
        "options": [
          "to have crossed",
          "to cross",
          "crossing",
          "crossed having"
        ],
        "correctAnswer": "to have crossed",
        "explanation": "المبني للمجهول مع أفعال التقرير عن حدث ماضٍ: is reported to have + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_11",
        "questionText": "Millions of emails ______ across the globe every single second.",
        "options": [
          "are sent",
          "sent",
          "send",
          "are sending"
        ],
        "correctAnswer": "are sent",
        "explanation": "المبني للمجهول في المضارع البسيط للجمع: are + p.p (are sent).",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_12",
        "questionText": "The magnificent temple of Karnak ______ by thousands of tourists daily.",
        "options": [
          "is visited",
          "was visited",
          "visits",
          "has visited"
        ],
        "correctAnswer": "is visited",
        "explanation": "حقيقة متكررة يومياً في المضارع البسيط للمجهول: is visited.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_13",
        "questionText": "The damaged highway ______ repaired right now by road engineers.",
        "options": [
          "is being",
          "is",
          "has been",
          "was being"
        ],
        "correctAnswer": "is being",
        "explanation": "الحدث مستمر الآن right now في المبني للمجهول: is being repaired.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_14",
        "questionText": "All the examination papers ______ marked by next Sunday.",
        "options": [
          "will have been",
          "will be",
          "have been",
          "are being"
        ],
        "correctAnswer": "will have been",
        "explanation": "المستقبل التام للمبني للمجهول: by next Sunday تأخذ will have been + p.p.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_15",
        "questionText": "This classic novel ______ translated into over fifty international languages.",
        "options": [
          "has been",
          "is being",
          "was been",
          "has"
        ],
        "correctAnswer": "has been",
        "explanation": "المضارع التام للمبني للمجهول: has been translated.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_16",
        "questionText": "The mystery ______ solved by the detective after intense investigation.",
        "options": [
          "was",
          "is",
          "has",
          "being"
        ],
        "correctAnswer": "was",
        "explanation": "الماضي البسيط للمبني للمجهول: was solved.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_17",
        "questionText": "All cellular phones must ______ prior to entering the exam hall.",
        "options": [
          "be switched off",
          "switch off",
          "have switched off",
          "switched off"
        ],
        "correctAnswer": "be switched off",
        "explanation": "الأفعال الناقصة في المجهول: Modal (must) + be + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_18",
        "questionText": "It ______ that eating nuts daily supports cardiovascular health.",
        "options": [
          "is believed",
          "believes",
          "is believing",
          "believed"
        ],
        "correctAnswer": "is believed",
        "explanation": "المبني للمجهول غير الشخصي: It is believed that...",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_19",
        "questionText": "I didn't paint the villa myself; I had it ______ by professionals.",
        "options": [
          "painted",
          "paint",
          "painting",
          "to paint"
        ],
        "correctAnswer": "painted",
        "explanation": "صيغة السببية Causative: had + something + P.P (had it painted).",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_20",
        "questionText": "The escaped criminal is reported ______ the national border last evening.",
        "options": [
          "to have crossed",
          "to cross",
          "crossing",
          "crossed having"
        ],
        "correctAnswer": "to have crossed",
        "explanation": "المبني للمجهول مع أفعال التقرير عن حدث ماضٍ: is reported to have + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_pv_21",
        "questionText": "[Exam Model 21] Millions of emails ______ across the globe every single second.",
        "options": [
          "are sent",
          "sent",
          "send",
          "are sending"
        ],
        "correctAnswer": "are sent",
        "explanation": "المبني للمجهول في المضارع البسيط للجمع: are + p.p (are sent).",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_22",
        "questionText": "[Exam Model 22] The magnificent temple of Karnak ______ by thousands of tourists daily.",
        "options": [
          "is visited",
          "was visited",
          "visits",
          "has visited"
        ],
        "correctAnswer": "is visited",
        "explanation": "حقيقة متكررة يومياً في المضارع البسيط للمجهول: is visited.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_23",
        "questionText": "[Exam Model 23] The damaged highway ______ repaired right now by road engineers.",
        "options": [
          "is being",
          "is",
          "has been",
          "was being"
        ],
        "correctAnswer": "is being",
        "explanation": "الحدث مستمر الآن right now في المبني للمجهول: is being repaired.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_24",
        "questionText": "[Exam Model 24] All the examination papers ______ marked by next Sunday.",
        "options": [
          "will have been",
          "will be",
          "have been",
          "are being"
        ],
        "correctAnswer": "will have been",
        "explanation": "المستقبل التام للمبني للمجهول: by next Sunday تأخذ will have been + p.p.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_25",
        "questionText": "[Exam Model 25] This classic novel ______ translated into over fifty international languages.",
        "options": [
          "has been",
          "is being",
          "was been",
          "has"
        ],
        "correctAnswer": "has been",
        "explanation": "المضارع التام للمبني للمجهول: has been translated.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_26",
        "questionText": "[Exam Model 26] The mystery ______ solved by the detective after intense investigation.",
        "options": [
          "was",
          "is",
          "has",
          "being"
        ],
        "correctAnswer": "was",
        "explanation": "الماضي البسيط للمبني للمجهول: was solved.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_27",
        "questionText": "[Exam Model 27] All cellular phones must ______ prior to entering the exam hall.",
        "options": [
          "be switched off",
          "switch off",
          "have switched off",
          "switched off"
        ],
        "correctAnswer": "be switched off",
        "explanation": "الأفعال الناقصة في المجهول: Modal (must) + be + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_28",
        "questionText": "[Exam Model 28] It ______ that eating nuts daily supports cardiovascular health.",
        "options": [
          "is believed",
          "believes",
          "is believing",
          "believed"
        ],
        "correctAnswer": "is believed",
        "explanation": "المبني للمجهول غير الشخصي: It is believed that...",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_29",
        "questionText": "[Exam Model 29] I didn't paint the villa myself; I had it ______ by professionals.",
        "options": [
          "painted",
          "paint",
          "painting",
          "to paint"
        ],
        "correctAnswer": "painted",
        "explanation": "صيغة السببية Causative: had + something + P.P (had it painted).",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_30",
        "questionText": "[Exam Model 30] The escaped criminal is reported ______ the national border yesterday.",
        "options": [
          "to have crossed",
          "to cross",
          "crossing",
          "crossed having"
        ],
        "correctAnswer": "to have crossed",
        "explanation": "المبني للمجهول مع أفعال التقرير عن حدث ماضٍ: is reported to have + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_31",
        "questionText": "Choose the correct option: Millions of emails ______ across the globe every single second.",
        "options": [
          "are sent",
          "sent",
          "send",
          "are sending"
        ],
        "correctAnswer": "are sent",
        "explanation": "المبني للمجهول في المضارع البسيط للجمع: are + p.p (are sent).",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_32",
        "questionText": "Choose the correct option: The magnificent temple of Karnak ______ by thousands of tourists daily.",
        "options": [
          "is visited",
          "was visited",
          "visits",
          "has visited"
        ],
        "correctAnswer": "is visited",
        "explanation": "حقيقة متكررة يومياً في المضارع البسيط للمجهول: is visited.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_33",
        "questionText": "Choose the correct option: The damaged highway ______ repaired right now by road engineers.",
        "options": [
          "is being",
          "is",
          "has been",
          "was being"
        ],
        "correctAnswer": "is being",
        "explanation": "الحدث مستمر الآن right now في المبني للمجهول: is being repaired.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_34",
        "questionText": "Choose the correct option: All the examination papers ______ marked by next Sunday.",
        "options": [
          "will have been",
          "will be",
          "have been",
          "are being"
        ],
        "correctAnswer": "will have been",
        "explanation": "المستقبل التام للمبني للمجهول: by next Sunday تأخذ will have been + p.p.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_35",
        "questionText": "Choose the correct option: This classic novel ______ translated into over fifty international languages.",
        "options": [
          "has been",
          "is being",
          "was been",
          "has"
        ],
        "correctAnswer": "has been",
        "explanation": "المضارع التام للمبني للمجهول: has been translated.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_36",
        "questionText": "Choose the correct option: The mystery ______ solved by the detective after intense investigation.",
        "options": [
          "was",
          "is",
          "has",
          "being"
        ],
        "correctAnswer": "was",
        "explanation": "الماضي البسيط للمبني للمجهول: was solved.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_37",
        "questionText": "Choose the correct option: All cellular phones must ______ prior to entering the exam hall.",
        "options": [
          "be switched off",
          "switch off",
          "have switched off",
          "switched off"
        ],
        "correctAnswer": "be switched off",
        "explanation": "الأفعال الناقصة في المجهول: Modal (must) + be + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_38",
        "questionText": "Choose the correct option: It ______ that eating nuts daily supports cardiovascular health.",
        "options": [
          "is believed",
          "believes",
          "is believing",
          "believed"
        ],
        "correctAnswer": "is believed",
        "explanation": "المبني للمجهول غير الشخصي: It is believed that...",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_39",
        "questionText": "Choose the correct option: I didn't paint the villa myself; I had it ______ by professionals.",
        "options": [
          "painted",
          "paint",
          "painting",
          "to paint"
        ],
        "correctAnswer": "painted",
        "explanation": "صيغة السببية Causative: had + something + P.P (had it painted).",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_40",
        "questionText": "Choose the correct option: The escaped criminal is reported ______ the national border yesterday.",
        "options": [
          "to have crossed",
          "to cross",
          "crossing",
          "crossed having"
        ],
        "correctAnswer": "to have crossed",
        "explanation": "المبني للمجهول مع أفعال التقرير عن حدث ماضٍ: is reported to have + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_pv_41",
        "questionText": "[Thanawya Amma Standard] Millions of emails ______ across the globe every single second.",
        "options": [
          "are sent",
          "sent",
          "send",
          "are sending"
        ],
        "correctAnswer": "are sent",
        "explanation": "المبني للمجهول في المضارع البسيط للجمع: are + p.p (are sent).",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_42",
        "questionText": "[Thanawya Amma Standard] The magnificent temple of Karnak ______ by thousands of tourists daily.",
        "options": [
          "is visited",
          "was visited",
          "visits",
          "has visited"
        ],
        "correctAnswer": "is visited",
        "explanation": "حقيقة متكررة يومياً في المضارع البسيط للمجهول: is visited.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_43",
        "questionText": "[Thanawya Amma Standard] The damaged highway ______ repaired right now by road engineers.",
        "options": [
          "is being",
          "is",
          "has been",
          "was being"
        ],
        "correctAnswer": "is being",
        "explanation": "الحدث مستمر الآن right now في المبني للمجهول: is being repaired.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_44",
        "questionText": "[Thanawya Amma Standard] All the examination papers ______ marked by next Sunday.",
        "options": [
          "will have been",
          "will be",
          "have been",
          "are being"
        ],
        "correctAnswer": "will have been",
        "explanation": "المستقبل التام للمبني للمجهول: by next Sunday تأخذ will have been + p.p.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_45",
        "questionText": "[Thanawya Amma Standard] This classic novel ______ translated into over fifty international languages.",
        "options": [
          "has been",
          "is being",
          "was been",
          "has"
        ],
        "correctAnswer": "has been",
        "explanation": "المضارع التام للمبني للمجهول: has been translated.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_46",
        "questionText": "[Thanawya Amma Standard] The mystery ______ solved by the detective after intense investigation.",
        "options": [
          "was",
          "is",
          "has",
          "being"
        ],
        "correctAnswer": "was",
        "explanation": "الماضي البسيط للمبني للمجهول: was solved.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_47",
        "questionText": "[Thanawya Amma Standard] All cellular phones must ______ prior to entering the exam hall.",
        "options": [
          "be switched off",
          "switch off",
          "have switched off",
          "switched off"
        ],
        "correctAnswer": "be switched off",
        "explanation": "الأفعال الناقصة في المجهول: Modal (must) + be + P.P.",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_48",
        "questionText": "[Thanawya Amma Standard] It ______ that eating nuts daily supports cardiovascular health.",
        "options": [
          "is believed",
          "believes",
          "is believing",
          "believed"
        ],
        "correctAnswer": "is believed",
        "explanation": "المبني للمجهول غير الشخصي: It is believed that...",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_49",
        "questionText": "[Thanawya Amma Standard] I didn't paint the villa myself; I had it ______ by professionals.",
        "options": [
          "painted",
          "paint",
          "painting",
          "to paint"
        ],
        "correctAnswer": "painted",
        "explanation": "صيغة السببية Causative: had + something + P.P (had it painted).",
        "difficulty": "Hard"
      },
      {
        "id": "q_pv_50",
        "questionText": "[Thanawya Amma Standard] The escaped criminal is reported ______ the national border yesterday.",
        "options": [
          "to have crossed",
          "to cross",
          "crossing",
          "crossed having"
        ],
        "correctAnswer": "to have crossed",
        "explanation": "المبني للمجهول مع أفعال التقرير عن حدث ماضٍ: is reported to have + P.P.",
        "difficulty": "Hard"
      }
    ]
  },
  "negation": {
    "id": "negation",
    "titleAr": "النفي في اللغة الإنجليزية (Negation)",
    "titleEn": "Negation, Negative Adverbs & Inversion",
    "summary": {
      "concept": "النفي هو نفي وقوع الفعل أو صحة الجملة، إما باستخدام not مع الأفعال المساعدة أو عبر ظلمات النفي والكلمات السالبة.",
      "formula": [
        "مع الأفعال المساعدة والناقصة: Auxiliary + not (isn't, aren't, hasn't, won't, can't)",
        "المضارع البسيط: don't / doesn't + Base Verb",
        "الماضي البسيط: didn't + Base Verb",
        "أدوات النفي الضمني: never, hardly, scarcely, rarely, seldom, neither... nor, no, none"
      ],
      "keyRules": [
        {
          "title": "قاعدة منع النفي المزدوج (Double Negatives)",
          "explanation": "في اللغة الإنجليزية القياسية لا يجوز استخدام أداتي نفي في نفس الجملة؛ نفي النفي إثبات.",
          "examples": [
            "Correct: I don't know anything. (أو I know nothing.)",
            "Incorrect: I don't know nothing. (خطأ شائع)"
          ]
        },
        {
          "title": "التقديم والتأخير عند بدء الجملة بظرف نفي (Inversion)",
          "explanation": "إذا بدأت الجملة بظرف نفي أو قيد (Never, Rarely, Seldom, Little, Hardly, Scarcely, Not only, Under no circumstances) نقدم الفعل المساعد على الفاعل كصيغة السؤال.",
          "examples": [
            "Never have I witnessed such dedication.",
            "Rarely does he arrive late for lectures.",
            "Under no circumstances should you open this door."
          ]
        }
      ],
      "examSecrets": [
        "الفرق بين neither و either: كلمة neither تفيد النفي بذاتها، بينما either تأتي في الجملة المنفية (I don't like tea either = Neither do I).",
        "الكلمات: few و little بدون a تعني قليل ولا يكفي وتفيد النفي تقريباً.",
        "النفي مع have: إذا كانت have فعلاً أساسياً بمعنى يملك أو يتناول نفيها don't have / doesn't have / didn't have."
      ],
      "commonMistakes": [
        {
          "mistake": "Hardly I had reached home when it rained.",
          "correction": "Hardly had I reached home when it rained.",
          "reason": "البدء بـ Hardly يستوجب تقديم had على الفاعل I."
        },
        {
          "mistake": "I haven't no money.",
          "correction": "I have no money. (أو I don't have any money.)",
          "reason": "تجنب النفي المزدوج."
        }
      ]
    },
    "questions": [
      {
        "id": "q_ng_1",
        "questionText": "Scarcely ______ entered the hall when the lecture commenced.",
        "options": [
          "had the professor",
          "the professor had",
          "did the professor",
          "has the professor"
        ],
        "correctAnswer": "had the professor",
        "explanation": "البدء بظرف النفي Scarcely يتطلب تقديماً وتأخيراً Inversion بصيغة الماضي التام: Scarcely had + S + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_2",
        "questionText": "Seldom ______ such a breathtaking celestial view in the night sky.",
        "options": [
          "have I seen",
          "I have seen",
          "I saw",
          "did I saw"
        ],
        "correctAnswer": "have I seen",
        "explanation": "البدء بـ Seldom يتطلب تقديم الفعل المساعد: have I seen.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_3",
        "questionText": "Under no circumstances ______ reveal your security password to anyone.",
        "options": [
          "should you",
          "you should",
          "you must",
          "ought you"
        ],
        "correctAnswer": "should you",
        "explanation": "التركيب الحصري Under no circumstances يتطلب Inversion: should you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_4",
        "questionText": "Neither Ahmed nor his classmates ______ present at yesterday's rehearsal.",
        "options": [
          "were",
          "was",
          "are",
          "is"
        ],
        "correctAnswer": "were",
        "explanation": "مع Neither... nor الفعل يتبع الفاعل الأقرب له (classmates جمع) في الماضي were.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_5",
        "questionText": "I have ______ friends in this new city, so I often feel lonely.",
        "options": [
          "few",
          "a few",
          "little",
          "a little"
        ],
        "correctAnswer": "few",
        "explanation": "كلمة few بدون a تعني عدداً قليلاً لا يكفي وتفيد النفي مع الاسم الجمع المعدود.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_6",
        "questionText": "There is ______ milk left in the fridge; we can't make tea.",
        "options": [
          "little",
          "a little",
          "few",
          "a few"
        ],
        "correctAnswer": "little",
        "explanation": "كلمة little بدون a تفيد القلة غير الكافية مع الاسم غير المعدود milk.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_7",
        "questionText": "Hardly ______ finished his breakfast when the school bus arrived.",
        "options": [
          "had he",
          "he had",
          "did he",
          "has he"
        ],
        "correctAnswer": "had he",
        "explanation": "البدء بـ Hardly يتطلب تقديم had على الفاعل he.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_8",
        "questionText": "Little ______ how much effort had gone into organizing the festival.",
        "options": [
          "did they know",
          "they knew",
          "they had known",
          "had they know"
        ],
        "correctAnswer": "did they know",
        "explanation": "البدء بظرف النفي Little يتطلب تقديم الفعل المساعد did: did they know.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_9",
        "questionText": "She has got ______ interest in playing video games.",
        "options": [
          "no",
          "not",
          "none",
          "neither"
        ],
        "correctAnswer": "no",
        "explanation": "نفي الاسم المباشر interest بدون أداة يأخذ no interest.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_10",
        "questionText": "Which of the following avoids the error of double negation?",
        "options": [
          "I didn't find anything in the cabinet.",
          "I didn't find nothing in the cabinet.",
          "I haven't got no money.",
          "She doesn't know nobody."
        ],
        "correctAnswer": "I didn't find anything in the cabinet.",
        "explanation": "الجملة السليمة تتجنب النفي المزدوج باستخدام didn't find anything.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_11",
        "questionText": "Scarcely ______ entered the hall when the lecture commenced.",
        "options": [
          "had the professor",
          "the professor had",
          "did the professor",
          "has the professor"
        ],
        "correctAnswer": "had the professor",
        "explanation": "البدء بظرف النفي Scarcely يتطلب تقديماً وتأخيراً Inversion بصيغة الماضي التام: Scarcely had + S + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_12",
        "questionText": "Seldom ______ such a breathtaking celestial view in the night sky.",
        "options": [
          "have I seen",
          "I have seen",
          "I saw",
          "did I saw"
        ],
        "correctAnswer": "have I seen",
        "explanation": "البدء بـ Seldom يتطلب تقديم الفعل المساعد: have I seen.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_13",
        "questionText": "Under no circumstances ______ reveal your security password to anyone.",
        "options": [
          "should you",
          "you should",
          "you must",
          "ought you"
        ],
        "correctAnswer": "should you",
        "explanation": "التركيب الحصري Under no circumstances يتطلب Inversion: should you.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_14",
        "questionText": "Neither Kareem nor his classmates ______ present at last evening's rehearsal.",
        "options": [
          "were",
          "was",
          "are",
          "is"
        ],
        "correctAnswer": "were",
        "explanation": "مع Neither... nor الفعل يتبع الفاعل الأقرب له (classmates جمع) في الماضي were.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_15",
        "questionText": "I have ______ friends in this new city, so I often feel lonely.",
        "options": [
          "few",
          "a few",
          "little",
          "a little"
        ],
        "correctAnswer": "few",
        "explanation": "كلمة few بدون a تعني عدداً قليلاً لا يكفي وتفيد النفي مع الاسم الجمع المعدود.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_16",
        "questionText": "There is ______ milk left in the fridge; we can't make tea.",
        "options": [
          "little",
          "a little",
          "few",
          "a few"
        ],
        "correctAnswer": "little",
        "explanation": "كلمة little بدون a تفيد القلة غير الكافية مع الاسم غير المعدود milk.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_17",
        "questionText": "Hardly ______ finished his breakfast when the school bus arrived.",
        "options": [
          "had he",
          "he had",
          "did he",
          "has he"
        ],
        "correctAnswer": "had he",
        "explanation": "البدء بـ Hardly يتطلب تقديم had على الفاعل he.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_18",
        "questionText": "Little ______ how much effort had gone into organizing the festival.",
        "options": [
          "did they know",
          "they knew",
          "they had known",
          "had they know"
        ],
        "correctAnswer": "did they know",
        "explanation": "البدء بظرف النفي Little يتطلب تقديم الفعل المساعد did: did they know.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_19",
        "questionText": "She has got ______ interest in playing video games.",
        "options": [
          "no",
          "not",
          "none",
          "neither"
        ],
        "correctAnswer": "no",
        "explanation": "نفي الاسم المباشر interest بدون أداة يأخذ no interest.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_20",
        "questionText": "Which of the following avoids the error of double negation?",
        "options": [
          "I didn't find anything in the cabinet.",
          "I didn't find nothing in the cabinet.",
          "I haven't got no money.",
          "She doesn't know nobody."
        ],
        "correctAnswer": "I didn't find anything in the cabinet.",
        "explanation": "الجملة السليمة تتجنب النفي المزدوج باستخدام didn't find anything.",
        "difficulty": "Easy"
      },
      {
        "id": "q_ng_21",
        "questionText": "[Exam Model 21] Scarcely ______ entered the hall when the lecture commenced.",
        "options": [
          "had the professor",
          "the professor had",
          "did the professor",
          "has the professor"
        ],
        "correctAnswer": "had the professor",
        "explanation": "البدء بظرف النفي Scarcely يتطلب تقديماً وتأخيراً Inversion بصيغة الماضي التام: Scarcely had + S + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_22",
        "questionText": "[Exam Model 22] Seldom ______ such a breathtaking celestial view in the night sky.",
        "options": [
          "have I seen",
          "I have seen",
          "I saw",
          "did I saw"
        ],
        "correctAnswer": "have I seen",
        "explanation": "البدء بـ Seldom يتطلب تقديم الفعل المساعد: have I seen.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_23",
        "questionText": "[Exam Model 23] Under no circumstances ______ reveal your security password to anyone.",
        "options": [
          "should you",
          "you should",
          "you must",
          "ought you"
        ],
        "correctAnswer": "should you",
        "explanation": "التركيب الحصري Under no circumstances يتطلب Inversion: should you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_24",
        "questionText": "[Exam Model 24] Neither Ahmed nor his classmates ______ present at yesterday's rehearsal.",
        "options": [
          "were",
          "was",
          "are",
          "is"
        ],
        "correctAnswer": "were",
        "explanation": "مع Neither... nor الفعل يتبع الفاعل الأقرب له (classmates جمع) في الماضي were.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_25",
        "questionText": "[Exam Model 25] I have ______ friends in this new city, so I often feel lonely.",
        "options": [
          "few",
          "a few",
          "little",
          "a little"
        ],
        "correctAnswer": "few",
        "explanation": "كلمة few بدون a تعني عدداً قليلاً لا يكفي وتفيد النفي مع الاسم الجمع المعدود.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_26",
        "questionText": "[Exam Model 26] There is ______ milk left in the fridge; we can't make tea.",
        "options": [
          "little",
          "a little",
          "few",
          "a few"
        ],
        "correctAnswer": "little",
        "explanation": "كلمة little بدون a تفيد القلة غير الكافية مع الاسم غير المعدود milk.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_27",
        "questionText": "[Exam Model 27] Hardly ______ finished his breakfast when the school bus arrived.",
        "options": [
          "had he",
          "he had",
          "did he",
          "has he"
        ],
        "correctAnswer": "had he",
        "explanation": "البدء بـ Hardly يتطلب تقديم had على الفاعل he.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_28",
        "questionText": "[Exam Model 28] Little ______ how much effort had gone into organizing the festival.",
        "options": [
          "did they know",
          "they knew",
          "they had known",
          "had they know"
        ],
        "correctAnswer": "did they know",
        "explanation": "البدء بظرف النفي Little يتطلب تقديم الفعل المساعد did: did they know.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_29",
        "questionText": "[Exam Model 29] She has got ______ interest in playing video games.",
        "options": [
          "no",
          "not",
          "none",
          "neither"
        ],
        "correctAnswer": "no",
        "explanation": "نفي الاسم المباشر interest بدون أداة يأخذ no interest.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_30",
        "questionText": "[Exam Model 30] Which of the following avoids the error of double negation?",
        "options": [
          "I didn't find anything in the cabinet.",
          "I didn't find nothing in the cabinet.",
          "I haven't got no money.",
          "She doesn't know nobody."
        ],
        "correctAnswer": "I didn't find anything in the cabinet.",
        "explanation": "الجملة السليمة تتجنب النفي المزدوج باستخدام didn't find anything.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_31",
        "questionText": "Choose the correct option: Scarcely ______ entered the hall when the lecture commenced.",
        "options": [
          "had the professor",
          "the professor had",
          "did the professor",
          "has the professor"
        ],
        "correctAnswer": "had the professor",
        "explanation": "البدء بظرف النفي Scarcely يتطلب تقديماً وتأخيراً Inversion بصيغة الماضي التام: Scarcely had + S + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_32",
        "questionText": "Choose the correct option: Seldom ______ such a breathtaking celestial view in the night sky.",
        "options": [
          "have I seen",
          "I have seen",
          "I saw",
          "did I saw"
        ],
        "correctAnswer": "have I seen",
        "explanation": "البدء بـ Seldom يتطلب تقديم الفعل المساعد: have I seen.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_33",
        "questionText": "Choose the correct option: Under no circumstances ______ reveal your security password to anyone.",
        "options": [
          "should you",
          "you should",
          "you must",
          "ought you"
        ],
        "correctAnswer": "should you",
        "explanation": "التركيب الحصري Under no circumstances يتطلب Inversion: should you.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_34",
        "questionText": "Choose the correct option: Neither Ahmed nor his classmates ______ present at yesterday's rehearsal.",
        "options": [
          "were",
          "was",
          "are",
          "is"
        ],
        "correctAnswer": "were",
        "explanation": "مع Neither... nor الفعل يتبع الفاعل الأقرب له (classmates جمع) في الماضي were.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_35",
        "questionText": "Choose the correct option: I have ______ friends in this new city, so I often feel lonely.",
        "options": [
          "few",
          "a few",
          "little",
          "a little"
        ],
        "correctAnswer": "few",
        "explanation": "كلمة few بدون a تعني عدداً قليلاً لا يكفي وتفيد النفي مع الاسم الجمع المعدود.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_36",
        "questionText": "Choose the correct option: There is ______ milk left in the fridge; we can't make tea.",
        "options": [
          "little",
          "a little",
          "few",
          "a few"
        ],
        "correctAnswer": "little",
        "explanation": "كلمة little بدون a تفيد القلة غير الكافية مع الاسم غير المعدود milk.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_37",
        "questionText": "Choose the correct option: Hardly ______ finished his breakfast when the school bus arrived.",
        "options": [
          "had he",
          "he had",
          "did he",
          "has he"
        ],
        "correctAnswer": "had he",
        "explanation": "البدء بـ Hardly يتطلب تقديم had على الفاعل he.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_38",
        "questionText": "Choose the correct option: Little ______ how much effort had gone into organizing the festival.",
        "options": [
          "did they know",
          "they knew",
          "they had known",
          "had they know"
        ],
        "correctAnswer": "did they know",
        "explanation": "البدء بظرف النفي Little يتطلب تقديم الفعل المساعد did: did they know.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_39",
        "questionText": "Choose the correct option: She has got ______ interest in playing video games.",
        "options": [
          "no",
          "not",
          "none",
          "neither"
        ],
        "correctAnswer": "no",
        "explanation": "نفي الاسم المباشر interest بدون أداة يأخذ no interest.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_40",
        "questionText": "Choose the correct option: Which of the following avoids the error of double negation?",
        "options": [
          "I didn't find anything in the cabinet.",
          "I didn't find nothing in the cabinet.",
          "I haven't got no money.",
          "She doesn't know nobody."
        ],
        "correctAnswer": "I didn't find anything in the cabinet.",
        "explanation": "الجملة السليمة تتجنب النفي المزدوج باستخدام didn't find anything.",
        "difficulty": "Medium"
      },
      {
        "id": "q_ng_41",
        "questionText": "[Thanawya Amma Standard] Scarcely ______ entered the hall when the lecture commenced.",
        "options": [
          "had the professor",
          "the professor had",
          "did the professor",
          "has the professor"
        ],
        "correctAnswer": "had the professor",
        "explanation": "البدء بظرف النفي Scarcely يتطلب تقديماً وتأخيراً Inversion بصيغة الماضي التام: Scarcely had + S + P.P.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_42",
        "questionText": "[Thanawya Amma Standard] Seldom ______ such a breathtaking celestial view in the night sky.",
        "options": [
          "have I seen",
          "I have seen",
          "I saw",
          "did I saw"
        ],
        "correctAnswer": "have I seen",
        "explanation": "البدء بـ Seldom يتطلب تقديم الفعل المساعد: have I seen.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_43",
        "questionText": "[Thanawya Amma Standard] Under no circumstances ______ reveal your security password to anyone.",
        "options": [
          "should you",
          "you should",
          "you must",
          "ought you"
        ],
        "correctAnswer": "should you",
        "explanation": "التركيب الحصري Under no circumstances يتطلب Inversion: should you.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_44",
        "questionText": "[Thanawya Amma Standard] Neither Ahmed nor his classmates ______ present at yesterday's rehearsal.",
        "options": [
          "were",
          "was",
          "are",
          "is"
        ],
        "correctAnswer": "were",
        "explanation": "مع Neither... nor الفعل يتبع الفاعل الأقرب له (classmates جمع) في الماضي were.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_45",
        "questionText": "[Thanawya Amma Standard] I have ______ friends in this new city, so I often feel lonely.",
        "options": [
          "few",
          "a few",
          "little",
          "a little"
        ],
        "correctAnswer": "few",
        "explanation": "كلمة few بدون a تعني عدداً قليلاً لا يكفي وتفيد النفي مع الاسم الجمع المعدود.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_46",
        "questionText": "[Thanawya Amma Standard] There is ______ milk left in the fridge; we can't make tea.",
        "options": [
          "little",
          "a little",
          "few",
          "a few"
        ],
        "correctAnswer": "little",
        "explanation": "كلمة little بدون a تفيد القلة غير الكافية مع الاسم غير المعدود milk.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_47",
        "questionText": "[Thanawya Amma Standard] Hardly ______ finished his breakfast when the school bus arrived.",
        "options": [
          "had he",
          "he had",
          "did he",
          "has he"
        ],
        "correctAnswer": "had he",
        "explanation": "البدء بـ Hardly يتطلب تقديم had على الفاعل he.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_48",
        "questionText": "[Thanawya Amma Standard] Little ______ how much effort had gone into organizing the festival.",
        "options": [
          "did they know",
          "they knew",
          "they had known",
          "had they know"
        ],
        "correctAnswer": "did they know",
        "explanation": "البدء بظرف النفي Little يتطلب تقديم الفعل المساعد did: did they know.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_49",
        "questionText": "[Thanawya Amma Standard] She has got ______ interest in playing video games.",
        "options": [
          "no",
          "not",
          "none",
          "neither"
        ],
        "correctAnswer": "no",
        "explanation": "نفي الاسم المباشر interest بدون أداة يأخذ no interest.",
        "difficulty": "Hard"
      },
      {
        "id": "q_ng_50",
        "questionText": "[Thanawya Amma Standard] Which of the following avoids the error of double negation?",
        "options": [
          "I didn't find anything in the cabinet.",
          "I didn't find nothing in the cabinet.",
          "I haven't got no money.",
          "She doesn't know nobody."
        ],
        "correctAnswer": "I didn't find anything in the cabinet.",
        "explanation": "الجملة السليمة تتجنب النفي المزدوج باستخدام didn't find anything.",
        "difficulty": "Hard"
      }
    ]
  },
  "linkers": {
    "id": "linkers",
    "titleAr": "الروابط وأدوات الربط (Linking Words)",
    "titleEn": "Connectors: Addition, Contrast, Cause & Effect",
    "summary": {
      "concept": "أدوات الربط تربط بين الجمل والفقرات لتوضيح العلاقات المنطقية كالإضافة والتعارض والسبب والنتيجة والغرض.",
      "formula": [
        "الإضافة (Addition): In addition to / Besides + V-ing/Noun | Furthermore / Moreover + Sentence",
        "التعارض (Contrast): Although / Even though / While + Sentence | Despite / In spite of + V-ing/Noun | However + Sentence",
        "السبب (Cause): Because / As / Since + Sentence | Because of / Due to / Owing to + V-ing/Noun",
        "النتيجة (Result): Therefore / Consequently / As a result / So + Sentence",
        "الغرض (Purpose): So that / In order that + Subject + can/could | In order to / So as to + Infinitive"
      ],
      "keyRules": [
        {
          "title": "الفرق بين الرابط المتبوع بجملة والمتبوع باسم/V-ing",
          "explanation": "من أهم قواعد الامتحانات: Although يتبعها فاعل وفعل، بينما Despite و In spite of يتبعها اسم أو V-ing. وبالمثل: Because يتبعها جملة كاملة، بينما Because of و Due to يتبعها اسم أو V-ing.",
          "examples": [
            "Although it was raining heavily, we played the match.",
            "Despite the heavy rain, we played the match.",
            "He was absent because he was ill.",
            "He was absent because of his illness."
          ]
        },
        {
          "title": "روابط النتيجة والتعارض بين فاصلتين أو نقطة",
          "explanation": "كلمات مثل However و Furthermore و Therefore تأتي بين جملتين مستقلتين وتسبقها نقطة أو فاصلة منقوطة وتليها فاصلة.",
          "examples": [
            "He studied hard; however, he didn't pass.",
            "The project was costly. Therefore, it was postponed."
          ]
        }
      ],
      "examSecrets": [
        "تركيبة Despite the fact that: إذا أضفنا the fact that إلى despite أو in spite of يتبعها جملة كاملة (فاعل + فعل).",
        "كلمة However + صفة/ظرف تعني مهما بلغت الصفة: However hard he tried, he couldn't solve it.",
        "كلمة Whatever + اسم: Whatever challenges you face, stay strong."
      ],
      "commonMistakes": [
        {
          "mistake": "Although he was tired, but he continued working.",
          "correction": "Although he was tired, he continued working.",
          "reason": "لا يجوز استخدام Although و but معاً في نفس الجملة."
        },
        {
          "mistake": "Despite of his wealth, he is not happy.",
          "correction": "Despite his wealth, he is not happy. (أو In spite of...)",
          "reason": "كلمة Despite لا تأخذ of أبداً."
        }
      ]
    },
    "questions": [
      {
        "id": "q_lk_1",
        "questionText": "______ it was raining cat and dogs, we thoroughly enjoyed our safari trip.",
        "options": [
          "Although",
          "Despite",
          "Because of",
          "However"
        ],
        "correctAnswer": "Although",
        "explanation": "الرابط الدال على التناقض والمتبوع بجملة كاملة (فاعل + فعل) هو Although.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_2",
        "questionText": "______ the severe snowstorm, the flight departed right on schedule.",
        "options": [
          "Despite",
          "Although",
          "Even though",
          "However"
        ],
        "correctAnswer": "Despite",
        "explanation": "الرابط الدال على التناقض والمتبوع باسم مباشر (the severe snowstorm) هو Despite.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_3",
        "questionText": "He studied with tremendous dedication; ______, he passed with distinction.",
        "options": [
          "therefore",
          "however",
          "although",
          "despite"
        ],
        "correctAnswer": "therefore",
        "explanation": "رابط النتيجة المنطقية بين فاصلة منقوطة وفاصلة هو therefore (لذلك).",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_4",
        "questionText": "The school sports tournament was postponed ______ the heavy dust storm.",
        "options": [
          "due to",
          "because",
          "since",
          "as"
        ],
        "correctAnswer": "due to",
        "explanation": "الرابط الدال على السبب والمتبوع باسم هو due to (بسبب).",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_5",
        "questionText": "She was absent from class yesterday ______ she had a severe toothache.",
        "options": [
          "because",
          "because of",
          "due to",
          "owing to"
        ],
        "correctAnswer": "because",
        "explanation": "الرابط الدال على السبب والمتبوع بجملة كاملة (she had) هو because.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_6",
        "questionText": "In addition to ______ the report, Hisham prepared the presentation slides.",
        "options": [
          "writing",
          "write",
          "wrote",
          "written"
        ],
        "correctAnswer": "writing",
        "explanation": "الرابط In addition to يُتبع دائماً بـ Gerund (V-ing): writing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_7",
        "questionText": "He practiced diligently ______ pass the driving license test on his first try.",
        "options": [
          "in order to",
          "so that",
          "because",
          "due to"
        ],
        "correctAnswer": "in order to",
        "explanation": "رابط الغرض المتبوع بمصدر مجرد pass هو in order to.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_8",
        "questionText": "We left early ______ we wouldn't get stuck in peak hour traffic.",
        "options": [
          "so that",
          "in order to",
          "because of",
          "despite"
        ],
        "correctAnswer": "so that",
        "explanation": "رابط الغرض المتبوع بفاعل وفعل ناقص (we wouldn't) هو so that.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_9",
        "questionText": "The smartphone is extremely expensive; ______, it lacks essential features.",
        "options": [
          "furthermore",
          "because",
          "so",
          "as"
        ],
        "correctAnswer": "furthermore",
        "explanation": "رابط الإضافة بين جملتين مستقلتين هو furthermore (علاوة على ذلك).",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_10",
        "questionText": "______ hard he tried, he couldn't loosen the rusted wheel nut.",
        "options": [
          "However",
          "Whatever",
          "Although",
          "Despite"
        ],
        "correctAnswer": "However",
        "explanation": "التركيب However + صفة/ظرف يعني مهما بلغت الشدة: However hard he tried.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_11",
        "questionText": "______ it was raining cat and dogs, we thoroughly enjoyed our safari trip.",
        "options": [
          "Although",
          "Despite",
          "Because of",
          "However"
        ],
        "correctAnswer": "Although",
        "explanation": "الرابط الدال على التناقض والمتبوع بجملة كاملة (فاعل + فعل) هو Although.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_12",
        "questionText": "______ the severe snowstorm, the flight departed right on schedule.",
        "options": [
          "Despite",
          "Although",
          "Even though",
          "However"
        ],
        "correctAnswer": "Despite",
        "explanation": "الرابط الدال على التناقض والمتبوع باسم مباشر (the severe snowstorm) هو Despite.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_13",
        "questionText": "He studied with tremendous dedication; ______, he passed with distinction.",
        "options": [
          "therefore",
          "however",
          "although",
          "despite"
        ],
        "correctAnswer": "therefore",
        "explanation": "رابط النتيجة المنطقية بين فاصلة منقوطة وفاصلة هو therefore (لذلك).",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_14",
        "questionText": "The school sports tournament was postponed ______ the heavy dust storm.",
        "options": [
          "due to",
          "because",
          "since",
          "as"
        ],
        "correctAnswer": "due to",
        "explanation": "الرابط الدال على السبب والمتبوع باسم هو due to (بسبب).",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_15",
        "questionText": "She was absent from class last evening ______ she had a severe toothache.",
        "options": [
          "because",
          "because of",
          "due to",
          "owing to"
        ],
        "correctAnswer": "because",
        "explanation": "الرابط الدال على السبب والمتبوع بجملة كاملة (she had) هو because.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_16",
        "questionText": "In addition to ______ the report, Hisham prepared the presentation slides.",
        "options": [
          "writing",
          "write",
          "wrote",
          "written"
        ],
        "correctAnswer": "writing",
        "explanation": "الرابط In addition to يُتبع دائماً بـ Gerund (V-ing): writing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_17",
        "questionText": "He practiced diligently ______ pass the driving license test on his first try.",
        "options": [
          "in order to",
          "so that",
          "because",
          "due to"
        ],
        "correctAnswer": "in order to",
        "explanation": "رابط الغرض المتبوع بمصدر مجرد pass هو in order to.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_18",
        "questionText": "We left early ______ we wouldn't get stuck in peak hour traffic.",
        "options": [
          "so that",
          "in order to",
          "because of",
          "despite"
        ],
        "correctAnswer": "so that",
        "explanation": "رابط الغرض المتبوع بفاعل وفعل ناقص (we wouldn't) هو so that.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_19",
        "questionText": "The smartphone is extremely expensive; ______, it lacks essential features.",
        "options": [
          "furthermore",
          "because",
          "so",
          "as"
        ],
        "correctAnswer": "furthermore",
        "explanation": "رابط الإضافة بين جملتين مستقلتين هو furthermore (علاوة على ذلك).",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_20",
        "questionText": "______ hard he tried, he couldn't loosen the rusted wheel nut.",
        "options": [
          "However",
          "Whatever",
          "Although",
          "Despite"
        ],
        "correctAnswer": "However",
        "explanation": "التركيب However + صفة/ظرف يعني مهما بلغت الشدة: However hard he tried.",
        "difficulty": "Easy"
      },
      {
        "id": "q_lk_21",
        "questionText": "[Exam Model 21] ______ it was raining cat and dogs, we thoroughly enjoyed our safari trip.",
        "options": [
          "Although",
          "Despite",
          "Because of",
          "However"
        ],
        "correctAnswer": "Although",
        "explanation": "الرابط الدال على التناقض والمتبوع بجملة كاملة (فاعل + فعل) هو Although.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_22",
        "questionText": "[Exam Model 22] ______ the severe snowstorm, the flight departed right on schedule.",
        "options": [
          "Despite",
          "Although",
          "Even though",
          "However"
        ],
        "correctAnswer": "Despite",
        "explanation": "الرابط الدال على التناقض والمتبوع باسم مباشر (the severe snowstorm) هو Despite.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_23",
        "questionText": "[Exam Model 23] He studied with tremendous dedication; ______, he passed with distinction.",
        "options": [
          "therefore",
          "however",
          "although",
          "despite"
        ],
        "correctAnswer": "therefore",
        "explanation": "رابط النتيجة المنطقية بين فاصلة منقوطة وفاصلة هو therefore (لذلك).",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_24",
        "questionText": "[Exam Model 24] The school sports tournament was postponed ______ the heavy dust storm.",
        "options": [
          "due to",
          "because",
          "since",
          "as"
        ],
        "correctAnswer": "due to",
        "explanation": "الرابط الدال على السبب والمتبوع باسم هو due to (بسبب).",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_25",
        "questionText": "[Exam Model 25] She was absent from class yesterday ______ she had a severe toothache.",
        "options": [
          "because",
          "because of",
          "due to",
          "owing to"
        ],
        "correctAnswer": "because",
        "explanation": "الرابط الدال على السبب والمتبوع بجملة كاملة (she had) هو because.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_26",
        "questionText": "[Exam Model 26] In addition to ______ the report, Hisham prepared the presentation slides.",
        "options": [
          "writing",
          "write",
          "wrote",
          "written"
        ],
        "correctAnswer": "writing",
        "explanation": "الرابط In addition to يُتبع دائماً بـ Gerund (V-ing): writing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_27",
        "questionText": "[Exam Model 27] He practiced diligently ______ pass the driving license test on his first try.",
        "options": [
          "in order to",
          "so that",
          "because",
          "due to"
        ],
        "correctAnswer": "in order to",
        "explanation": "رابط الغرض المتبوع بمصدر مجرد pass هو in order to.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_28",
        "questionText": "[Exam Model 28] We left early ______ we wouldn't get stuck in peak hour traffic.",
        "options": [
          "so that",
          "in order to",
          "because of",
          "despite"
        ],
        "correctAnswer": "so that",
        "explanation": "رابط الغرض المتبوع بفاعل وفعل ناقص (we wouldn't) هو so that.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_29",
        "questionText": "[Exam Model 29] The smartphone is extremely expensive; ______, it lacks essential features.",
        "options": [
          "furthermore",
          "because",
          "so",
          "as"
        ],
        "correctAnswer": "furthermore",
        "explanation": "رابط الإضافة بين جملتين مستقلتين هو furthermore (علاوة على ذلك).",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_30",
        "questionText": "[Exam Model 30] ______ hard he tried, he couldn't loosen the rusted wheel nut.",
        "options": [
          "However",
          "Whatever",
          "Although",
          "Despite"
        ],
        "correctAnswer": "However",
        "explanation": "التركيب However + صفة/ظرف يعني مهما بلغت الشدة: However hard he tried.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_31",
        "questionText": "Choose the correct option: ______ it was raining cat and dogs, we thoroughly enjoyed our safari trip.",
        "options": [
          "Although",
          "Despite",
          "Because of",
          "However"
        ],
        "correctAnswer": "Although",
        "explanation": "الرابط الدال على التناقض والمتبوع بجملة كاملة (فاعل + فعل) هو Although.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_32",
        "questionText": "Choose the correct option: ______ the severe snowstorm, the flight departed right on schedule.",
        "options": [
          "Despite",
          "Although",
          "Even though",
          "However"
        ],
        "correctAnswer": "Despite",
        "explanation": "الرابط الدال على التناقض والمتبوع باسم مباشر (the severe snowstorm) هو Despite.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_33",
        "questionText": "Choose the correct option: He studied with tremendous dedication; ______, he passed with distinction.",
        "options": [
          "therefore",
          "however",
          "although",
          "despite"
        ],
        "correctAnswer": "therefore",
        "explanation": "رابط النتيجة المنطقية بين فاصلة منقوطة وفاصلة هو therefore (لذلك).",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_34",
        "questionText": "Choose the correct option: The school sports tournament was postponed ______ the heavy dust storm.",
        "options": [
          "due to",
          "because",
          "since",
          "as"
        ],
        "correctAnswer": "due to",
        "explanation": "الرابط الدال على السبب والمتبوع باسم هو due to (بسبب).",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_35",
        "questionText": "Choose the correct option: She was absent from class yesterday ______ she had a severe toothache.",
        "options": [
          "because",
          "because of",
          "due to",
          "owing to"
        ],
        "correctAnswer": "because",
        "explanation": "الرابط الدال على السبب والمتبوع بجملة كاملة (she had) هو because.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_36",
        "questionText": "Choose the correct option: In addition to ______ the report, Hisham prepared the presentation slides.",
        "options": [
          "writing",
          "write",
          "wrote",
          "written"
        ],
        "correctAnswer": "writing",
        "explanation": "الرابط In addition to يُتبع دائماً بـ Gerund (V-ing): writing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_37",
        "questionText": "Choose the correct option: He practiced diligently ______ pass the driving license test on his first try.",
        "options": [
          "in order to",
          "so that",
          "because",
          "due to"
        ],
        "correctAnswer": "in order to",
        "explanation": "رابط الغرض المتبوع بمصدر مجرد pass هو in order to.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_38",
        "questionText": "Choose the correct option: We left early ______ we wouldn't get stuck in peak hour traffic.",
        "options": [
          "so that",
          "in order to",
          "because of",
          "despite"
        ],
        "correctAnswer": "so that",
        "explanation": "رابط الغرض المتبوع بفاعل وفعل ناقص (we wouldn't) هو so that.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_39",
        "questionText": "Choose the correct option: The smartphone is extremely expensive; ______, it lacks essential features.",
        "options": [
          "furthermore",
          "because",
          "so",
          "as"
        ],
        "correctAnswer": "furthermore",
        "explanation": "رابط الإضافة بين جملتين مستقلتين هو furthermore (علاوة على ذلك).",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_40",
        "questionText": "Choose the correct option: ______ hard he tried, he couldn't loosen the rusted wheel nut.",
        "options": [
          "However",
          "Whatever",
          "Although",
          "Despite"
        ],
        "correctAnswer": "However",
        "explanation": "التركيب However + صفة/ظرف يعني مهما بلغت الشدة: However hard he tried.",
        "difficulty": "Medium"
      },
      {
        "id": "q_lk_41",
        "questionText": "[Thanawya Amma Standard] ______ it was raining cat and dogs, we thoroughly enjoyed our safari trip.",
        "options": [
          "Although",
          "Despite",
          "Because of",
          "However"
        ],
        "correctAnswer": "Although",
        "explanation": "الرابط الدال على التناقض والمتبوع بجملة كاملة (فاعل + فعل) هو Although.",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_42",
        "questionText": "[Thanawya Amma Standard] ______ the severe snowstorm, the flight departed right on schedule.",
        "options": [
          "Despite",
          "Although",
          "Even though",
          "However"
        ],
        "correctAnswer": "Despite",
        "explanation": "الرابط الدال على التناقض والمتبوع باسم مباشر (the severe snowstorm) هو Despite.",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_43",
        "questionText": "[Thanawya Amma Standard] He studied with tremendous dedication; ______, he passed with distinction.",
        "options": [
          "therefore",
          "however",
          "although",
          "despite"
        ],
        "correctAnswer": "therefore",
        "explanation": "رابط النتيجة المنطقية بين فاصلة منقوطة وفاصلة هو therefore (لذلك).",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_44",
        "questionText": "[Thanawya Amma Standard] The school sports tournament was postponed ______ the heavy dust storm.",
        "options": [
          "due to",
          "because",
          "since",
          "as"
        ],
        "correctAnswer": "due to",
        "explanation": "الرابط الدال على السبب والمتبوع باسم هو due to (بسبب).",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_45",
        "questionText": "[Thanawya Amma Standard] She was absent from class yesterday ______ she had a severe toothache.",
        "options": [
          "because",
          "because of",
          "due to",
          "owing to"
        ],
        "correctAnswer": "because",
        "explanation": "الرابط الدال على السبب والمتبوع بجملة كاملة (she had) هو because.",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_46",
        "questionText": "[Thanawya Amma Standard] In addition to ______ the report, Hisham prepared the presentation slides.",
        "options": [
          "writing",
          "write",
          "wrote",
          "written"
        ],
        "correctAnswer": "writing",
        "explanation": "الرابط In addition to يُتبع دائماً بـ Gerund (V-ing): writing.",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_47",
        "questionText": "[Thanawya Amma Standard] He practiced diligently ______ pass the driving license test on his first try.",
        "options": [
          "in order to",
          "so that",
          "because",
          "due to"
        ],
        "correctAnswer": "in order to",
        "explanation": "رابط الغرض المتبوع بمصدر مجرد pass هو in order to.",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_48",
        "questionText": "[Thanawya Amma Standard] We left early ______ we wouldn't get stuck in peak hour traffic.",
        "options": [
          "so that",
          "in order to",
          "because of",
          "despite"
        ],
        "correctAnswer": "so that",
        "explanation": "رابط الغرض المتبوع بفاعل وفعل ناقص (we wouldn't) هو so that.",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_49",
        "questionText": "[Thanawya Amma Standard] The smartphone is extremely expensive; ______, it lacks essential features.",
        "options": [
          "furthermore",
          "because",
          "so",
          "as"
        ],
        "correctAnswer": "furthermore",
        "explanation": "رابط الإضافة بين جملتين مستقلتين هو furthermore (علاوة على ذلك).",
        "difficulty": "Hard"
      },
      {
        "id": "q_lk_50",
        "questionText": "[Thanawya Amma Standard] ______ hard he tried, he couldn't loosen the rusted wheel nut.",
        "options": [
          "However",
          "Whatever",
          "Although",
          "Despite"
        ],
        "correctAnswer": "However",
        "explanation": "التركيب However + صفة/ظرف يعني مهما بلغت الشدة: However hard he tried.",
        "difficulty": "Hard"
      }
    ]
  },
  "conditionals": {
    "id": "conditionals",
    "titleAr": "حالات If الشرطية (Conditionals)",
    "titleEn": "All Conditionals & Mixed Cases",
    "summary": {
      "concept": "الجمل الشرطية تعبر عن علاقة بين شرط وحدوث نتيجة، وتتدرج من الحقائق العلمية إلى المواقف الافتراضية والندم في الماضي.",
      "formula": [
        "الحالة الصفرية (Zero): If + Present Simple, Present Simple (حقائق وعادات)",
        "الحالة الأولى (First): If + Present Simple, will / can / may + Infinitive (احتمال في المستقبل)",
        "الحالة الثانية (Second): If + Past Simple, would / could / might + Infinitive (افتراض غير حقيقي في الحاضر)",
        "الحالة الثالثة (Third): If + Past Perfect (had + P.P), would have + P.P (استحالة وندم في الماضي)",
        "الشرطية المختلطة (Mixed): If + had + P.P, would + Infinitive (شرط في الماضي وأثره مستمر في الحاضر الآن)"
      ],
      "keyRules": [
        {
          "title": "بدائل If في مختلف الحالات",
          "explanation": "Unless = If... not (ما لم). Provided that / As long as = فقط بشرط. In case of = في حالة (يتبعها اسم/V-ing). But for / Without = لولا (يتبعها اسم/V-ing).",
          "examples": [
            "Unless you study, you won't pass. (= If you don't study)",
            "Without his help, I would have failed."
          ]
        },
        {
          "title": "حذف If وحالات الـ Inversion",
          "explanation": "1. الحالة الأولى: Should + Subject + Base Verb... (Should you need help, call me). 2. الحالة الثانية: Were + Subject + to + Inf... (Were he to study, he would pass). 3. الحالة الثالثة: Had + Subject + P.P... (Had I known, I would have told you).",
          "examples": [
            "Had the alarm rung, we would have evacuated immediately."
          ]
        }
      ],
      "examSecrets": [
        "في الحالة الثانية نستخدم were مع كل الضمائر (بما فيها I, he, she, it) للتعبير عن الاستحالة والنصيحة: If I were you, I would consult a doctor.",
        "الكلمات مثل right now / today في جواب الشرط مع شرط في الماضي تدل على Mixed Conditional وتأخذ would + inf بدلاً من would have + p.p.",
        "في الحالة الصفرية إذا تم تخصيص الموقف (مثلاً هذا الصباح / هذه التجربة) تتحول للحالة الأولى لأنها لم تعد حقيقة عامة مطلقة."
      ],
      "commonMistakes": [
        {
          "mistake": "If I will see him, I will tell him.",
          "correction": "If I see him, I will tell him.",
          "reason": "لا نستخدم will في جملة فعل الشرط بعد If."
        },
        {
          "mistake": "Should he comes early, we will start.",
          "correction": "Should he come early, we will start.",
          "reason": "بعد Should في صيغة الحذف يتبع الفاعل دائماً فعل في المصدر المجرد."
        }
      ]
    },
    "questions": [
      {
        "id": "q_cd_1",
        "questionText": "If you heat water to 100 degrees Celsius, it ______.",
        "options": [
          "boils",
          "will boil",
          "would boil",
          "boiled"
        ],
        "correctAnswer": "boils",
        "explanation": "حقيقة علمية ثابتة في الحالة الصفرية: If + present simple, present simple (boils).",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_2",
        "questionText": "If you study systematically with Mr. Habib, you ______ full marks in English.",
        "options": [
          "will achieve",
          "achieve",
          "would achieve",
          "achieved"
        ],
        "correctAnswer": "will achieve",
        "explanation": "احتمال مستقبلي في الحالة الشرطية الأولى: If + present simple, will + inf.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_3",
        "questionText": "If I ______ a million dollars, I would build an advanced research center.",
        "options": [
          "had",
          "have",
          "will have",
          "had had"
        ],
        "correctAnswer": "had",
        "explanation": "افتراض غير حقيقي في الحاضر (الحالة الثانية): If + past simple (had), would + inf.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_4",
        "questionText": "If they had left ten minutes earlier, they ______ the morning train.",
        "options": [
          "would have caught",
          "will catch",
          "would catch",
          "caught"
        ],
        "correctAnswer": "would have caught",
        "explanation": "ندم واستحالة في الماضي (الحالة الثالثة): If + had + P.P, would have + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_5",
        "questionText": "If I had revised thoroughly last week, I ______ so anxious right now.",
        "options": [
          "wouldn't be",
          "wouldn't have been",
          "am not",
          "won't be"
        ],
        "correctAnswer": "wouldn't be",
        "explanation": "حالة مختلطة Mixed: شرط في الماضي ونتيجته تؤثر في الحاضر (right now) فتأخذ wouldn't be.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_6",
        "questionText": "______ you need any further explanation, please feel free to ask.",
        "options": [
          "Should",
          "Were",
          "Had",
          "Unless"
        ],
        "correctAnswer": "Should",
        "explanation": "حذف If في الحالة الأولى يستبدل بـ Should + فاعل + مصدر: Should you need.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_7",
        "questionText": "______ he to practice more consistently, he would excel in the tournament.",
        "options": [
          "Were",
          "Should",
          "Had",
          "If"
        ],
        "correctAnswer": "Were",
        "explanation": "حذف If في الحالة الثانية مع فعل في المصدر بـ to: Were he to practice.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_8",
        "questionText": "______ I known about the revision schedule, I would have attended.",
        "options": [
          "Had",
          "Were",
          "Should",
          "Did"
        ],
        "correctAnswer": "Had",
        "explanation": "حذف If في الحالة الثالثة: Had + Subject + P.P (Had I known).",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_9",
        "questionText": "______ your invaluable support, I wouldn't have passed the examination.",
        "options": [
          "Without",
          "Unless",
          "If",
          "Provided that"
        ],
        "correctAnswer": "Without",
        "explanation": "لولا دعمك الثمين: Without متبوعة باسم أو V-ing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_10",
        "questionText": "You will easily pass the exam ______ you follow the recommended study plan.",
        "options": [
          "provided that",
          "unless",
          "in case of",
          "without"
        ],
        "correctAnswer": "provided that",
        "explanation": "بشرط أن: provided that يتبعها جملة شرطية مثبتة كاملة.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_11",
        "questionText": "If you heat pure water to 100 degrees Celsius, it ______.",
        "options": [
          "boils",
          "will boil",
          "would boil",
          "boiled"
        ],
        "correctAnswer": "boils",
        "explanation": "حقيقة علمية ثابتة في الحالة الصفرية: If + present simple, present simple (boils).",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_12",
        "questionText": "If you study systematically with Mr. Habib, you ______ full marks in English.",
        "options": [
          "will achieve",
          "achieve",
          "would achieve",
          "achieved"
        ],
        "correctAnswer": "will achieve",
        "explanation": "احتمال مستقبلي في الحالة الشرطية الأولى: If + present simple, will + inf.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_13",
        "questionText": "If I ______ a vast fortune, I would build an advanced research center.",
        "options": [
          "had",
          "have",
          "will have",
          "had had"
        ],
        "correctAnswer": "had",
        "explanation": "افتراض غير حقيقي في الحاضر (الحالة الثانية): If + past simple (had), would + inf.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_14",
        "questionText": "If they had left ten minutes earlier, they ______ the morning train.",
        "options": [
          "would have caught",
          "will catch",
          "would catch",
          "caught"
        ],
        "correctAnswer": "would have caught",
        "explanation": "ندم واستحالة في الماضي (الحالة الثالثة): If + had + P.P, would have + P.P.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_15",
        "questionText": "If I had revised thoroughly last week, I ______ so anxious right now.",
        "options": [
          "wouldn't be",
          "wouldn't have been",
          "am not",
          "won't be"
        ],
        "correctAnswer": "wouldn't be",
        "explanation": "حالة مختلطة Mixed: شرط في الماضي ونتيجته تؤثر في الحاضر (right now) فتأخذ wouldn't be.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_16",
        "questionText": "______ you need any further explanation, please feel free to ask.",
        "options": [
          "Should",
          "Were",
          "Had",
          "Unless"
        ],
        "correctAnswer": "Should",
        "explanation": "حذف If في الحالة الأولى يستبدل بـ Should + فاعل + مصدر: Should you need.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_17",
        "questionText": "______ he to practice more consistently, he would excel in the tournament.",
        "options": [
          "Were",
          "Should",
          "Had",
          "If"
        ],
        "correctAnswer": "Were",
        "explanation": "حذف If في الحالة الثانية مع فعل في المصدر بـ to: Were he to practice.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_18",
        "questionText": "______ I known about the revision schedule, I would have attended.",
        "options": [
          "Had",
          "Were",
          "Should",
          "Did"
        ],
        "correctAnswer": "Had",
        "explanation": "حذف If في الحالة الثالثة: Had + Subject + P.P (Had I known).",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_19",
        "questionText": "______ your invaluable support, I wouldn't have passed the examination.",
        "options": [
          "Without",
          "Unless",
          "If",
          "Provided that"
        ],
        "correctAnswer": "Without",
        "explanation": "لولا دعمك الثمين: Without متبوعة باسم أو V-ing.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_20",
        "questionText": "You will easily pass the exam ______ you follow the recommended study plan.",
        "options": [
          "provided that",
          "unless",
          "in case of",
          "without"
        ],
        "correctAnswer": "provided that",
        "explanation": "بشرط أن: provided that يتبعها جملة شرطية مثبتة كاملة.",
        "difficulty": "Easy"
      },
      {
        "id": "q_cd_21",
        "questionText": "[Exam Model 21] If you heat water to 100 degrees Celsius, it ______.",
        "options": [
          "boils",
          "will boil",
          "would boil",
          "boiled"
        ],
        "correctAnswer": "boils",
        "explanation": "حقيقة علمية ثابتة في الحالة الصفرية: If + present simple, present simple (boils).",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_22",
        "questionText": "[Exam Model 22] If you study systematically with Mr. Habib, you ______ full marks in English.",
        "options": [
          "will achieve",
          "achieve",
          "would achieve",
          "achieved"
        ],
        "correctAnswer": "will achieve",
        "explanation": "احتمال مستقبلي في الحالة الشرطية الأولى: If + present simple, will + inf.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_23",
        "questionText": "[Exam Model 23] If I ______ a million dollars, I would build an advanced research center.",
        "options": [
          "had",
          "have",
          "will have",
          "had had"
        ],
        "correctAnswer": "had",
        "explanation": "افتراض غير حقيقي في الحاضر (الحالة الثانية): If + past simple (had), would + inf.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_24",
        "questionText": "[Exam Model 24] If they had left ten minutes earlier, they ______ the morning train.",
        "options": [
          "would have caught",
          "will catch",
          "would catch",
          "caught"
        ],
        "correctAnswer": "would have caught",
        "explanation": "ندم واستحالة في الماضي (الحالة الثالثة): If + had + P.P, would have + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_25",
        "questionText": "[Exam Model 25] If I had revised thoroughly last week, I ______ so anxious right now.",
        "options": [
          "wouldn't be",
          "wouldn't have been",
          "am not",
          "won't be"
        ],
        "correctAnswer": "wouldn't be",
        "explanation": "حالة مختلطة Mixed: شرط في الماضي ونتيجته تؤثر في الحاضر (right now) فتأخذ wouldn't be.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_26",
        "questionText": "[Exam Model 26] ______ you need any further explanation, please feel free to ask.",
        "options": [
          "Should",
          "Were",
          "Had",
          "Unless"
        ],
        "correctAnswer": "Should",
        "explanation": "حذف If في الحالة الأولى يستبدل بـ Should + فاعل + مصدر: Should you need.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_27",
        "questionText": "[Exam Model 27] ______ he to practice more consistently, he would excel in the tournament.",
        "options": [
          "Were",
          "Should",
          "Had",
          "If"
        ],
        "correctAnswer": "Were",
        "explanation": "حذف If في الحالة الثانية مع فعل في المصدر بـ to: Were he to practice.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_28",
        "questionText": "[Exam Model 28] ______ I known about the revision schedule, I would have attended.",
        "options": [
          "Had",
          "Were",
          "Should",
          "Did"
        ],
        "correctAnswer": "Had",
        "explanation": "حذف If في الحالة الثالثة: Had + Subject + P.P (Had I known).",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_29",
        "questionText": "[Exam Model 29] ______ your invaluable support, I wouldn't have passed the examination.",
        "options": [
          "Without",
          "Unless",
          "If",
          "Provided that"
        ],
        "correctAnswer": "Without",
        "explanation": "لولا دعمك الثمين: Without متبوعة باسم أو V-ing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_30",
        "questionText": "[Exam Model 30] You will easily pass the exam ______ you follow the recommended study plan.",
        "options": [
          "provided that",
          "unless",
          "in case of",
          "without"
        ],
        "correctAnswer": "provided that",
        "explanation": "بشرط أن: provided that يتبعها جملة شرطية مثبتة كاملة.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_31",
        "questionText": "Choose the correct option: If you heat water to 100 degrees Celsius, it ______.",
        "options": [
          "boils",
          "will boil",
          "would boil",
          "boiled"
        ],
        "correctAnswer": "boils",
        "explanation": "حقيقة علمية ثابتة في الحالة الصفرية: If + present simple, present simple (boils).",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_32",
        "questionText": "Choose the correct option: If you study systematically with Mr. Habib, you ______ full marks in English.",
        "options": [
          "will achieve",
          "achieve",
          "would achieve",
          "achieved"
        ],
        "correctAnswer": "will achieve",
        "explanation": "احتمال مستقبلي في الحالة الشرطية الأولى: If + present simple, will + inf.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_33",
        "questionText": "Choose the correct option: If I ______ a million dollars, I would build an advanced research center.",
        "options": [
          "had",
          "have",
          "will have",
          "had had"
        ],
        "correctAnswer": "had",
        "explanation": "افتراض غير حقيقي في الحاضر (الحالة الثانية): If + past simple (had), would + inf.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_34",
        "questionText": "Choose the correct option: If they had left ten minutes earlier, they ______ the morning train.",
        "options": [
          "would have caught",
          "will catch",
          "would catch",
          "caught"
        ],
        "correctAnswer": "would have caught",
        "explanation": "ندم واستحالة في الماضي (الحالة الثالثة): If + had + P.P, would have + P.P.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_35",
        "questionText": "Choose the correct option: If I had revised thoroughly last week, I ______ so anxious right now.",
        "options": [
          "wouldn't be",
          "wouldn't have been",
          "am not",
          "won't be"
        ],
        "correctAnswer": "wouldn't be",
        "explanation": "حالة مختلطة Mixed: شرط في الماضي ونتيجته تؤثر في الحاضر (right now) فتأخذ wouldn't be.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_36",
        "questionText": "Choose the correct option: ______ you need any further explanation, please feel free to ask.",
        "options": [
          "Should",
          "Were",
          "Had",
          "Unless"
        ],
        "correctAnswer": "Should",
        "explanation": "حذف If في الحالة الأولى يستبدل بـ Should + فاعل + مصدر: Should you need.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_37",
        "questionText": "Choose the correct option: ______ he to practice more consistently, he would excel in the tournament.",
        "options": [
          "Were",
          "Should",
          "Had",
          "If"
        ],
        "correctAnswer": "Were",
        "explanation": "حذف If في الحالة الثانية مع فعل في المصدر بـ to: Were he to practice.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_38",
        "questionText": "Choose the correct option: ______ I known about the revision schedule, I would have attended.",
        "options": [
          "Had",
          "Were",
          "Should",
          "Did"
        ],
        "correctAnswer": "Had",
        "explanation": "حذف If في الحالة الثالثة: Had + Subject + P.P (Had I known).",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_39",
        "questionText": "Choose the correct option: ______ your invaluable support, I wouldn't have passed the examination.",
        "options": [
          "Without",
          "Unless",
          "If",
          "Provided that"
        ],
        "correctAnswer": "Without",
        "explanation": "لولا دعمك الثمين: Without متبوعة باسم أو V-ing.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_40",
        "questionText": "Choose the correct option: You will easily pass the exam ______ you follow the recommended study plan.",
        "options": [
          "provided that",
          "unless",
          "in case of",
          "without"
        ],
        "correctAnswer": "provided that",
        "explanation": "بشرط أن: provided that يتبعها جملة شرطية مثبتة كاملة.",
        "difficulty": "Medium"
      },
      {
        "id": "q_cd_41",
        "questionText": "[Thanawya Amma Standard] If you heat water to 100 degrees Celsius, it ______.",
        "options": [
          "boils",
          "will boil",
          "would boil",
          "boiled"
        ],
        "correctAnswer": "boils",
        "explanation": "حقيقة علمية ثابتة في الحالة الصفرية: If + present simple, present simple (boils).",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_42",
        "questionText": "[Thanawya Amma Standard] If you study systematically with Mr. Habib, you ______ full marks in English.",
        "options": [
          "will achieve",
          "achieve",
          "would achieve",
          "achieved"
        ],
        "correctAnswer": "will achieve",
        "explanation": "احتمال مستقبلي في الحالة الشرطية الأولى: If + present simple, will + inf.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_43",
        "questionText": "[Thanawya Amma Standard] If I ______ a million dollars, I would build an advanced research center.",
        "options": [
          "had",
          "have",
          "will have",
          "had had"
        ],
        "correctAnswer": "had",
        "explanation": "افتراض غير حقيقي في الحاضر (الحالة الثانية): If + past simple (had), would + inf.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_44",
        "questionText": "[Thanawya Amma Standard] If they had left ten minutes earlier, they ______ the morning train.",
        "options": [
          "would have caught",
          "will catch",
          "would catch",
          "caught"
        ],
        "correctAnswer": "would have caught",
        "explanation": "ندم واستحالة في الماضي (الحالة الثالثة): If + had + P.P, would have + P.P.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_45",
        "questionText": "[Thanawya Amma Standard] If I had revised thoroughly last week, I ______ so anxious right now.",
        "options": [
          "wouldn't be",
          "wouldn't have been",
          "am not",
          "won't be"
        ],
        "correctAnswer": "wouldn't be",
        "explanation": "حالة مختلطة Mixed: شرط في الماضي ونتيجته تؤثر في الحاضر (right now) فتأخذ wouldn't be.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_46",
        "questionText": "[Thanawya Amma Standard] ______ you need any further explanation, please feel free to ask.",
        "options": [
          "Should",
          "Were",
          "Had",
          "Unless"
        ],
        "correctAnswer": "Should",
        "explanation": "حذف If في الحالة الأولى يستبدل بـ Should + فاعل + مصدر: Should you need.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_47",
        "questionText": "[Thanawya Amma Standard] ______ he to practice more consistently, he would excel in the tournament.",
        "options": [
          "Were",
          "Should",
          "Had",
          "If"
        ],
        "correctAnswer": "Were",
        "explanation": "حذف If في الحالة الثانية مع فعل في المصدر بـ to: Were he to practice.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_48",
        "questionText": "[Thanawya Amma Standard] ______ I known about the revision schedule, I would have attended.",
        "options": [
          "Had",
          "Were",
          "Should",
          "Did"
        ],
        "correctAnswer": "Had",
        "explanation": "حذف If في الحالة الثالثة: Had + Subject + P.P (Had I known).",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_49",
        "questionText": "[Thanawya Amma Standard] ______ your invaluable support, I wouldn't have passed the examination.",
        "options": [
          "Without",
          "Unless",
          "If",
          "Provided that"
        ],
        "correctAnswer": "Without",
        "explanation": "لولا دعمك الثمين: Without متبوعة باسم أو V-ing.",
        "difficulty": "Hard"
      },
      {
        "id": "q_cd_50",
        "questionText": "[Thanawya Amma Standard] You will easily pass the exam ______ you follow the recommended study plan.",
        "options": [
          "provided that",
          "unless",
          "in case of",
          "without"
        ],
        "correctAnswer": "provided that",
        "explanation": "بشرط أن: provided that يتبعها جملة شرطية مثبتة كاملة.",
        "difficulty": "Hard"
      }
    ]
  }
};

export const getGrammarPackage = (topicId: string): GrammarTopicPackage | null => {
  return grammarPackages[topicId] || null;
};
