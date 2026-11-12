# Authentic questions and examples extracted from Sources 1, 2, and 3

QUESTIONS_DATA = [
    # 1. Translation MCQ (Th. Amma 1998 / 2005 / Ministry models)
    {
        "id": "q_mcq_001",
        "type": "mcq",
        "questionText": "اختر الترجمة الصحيحة للجملة التالية:\n\"لقد فاز الفريق القومي المصري بكأس أفريقيا وأسعد كل المصريين.\"",
        "instructions": "اختر الترجمة الإنجليزية الأدق لقواعد وأزمنة الجملة",
        "options": [
            "The Egyptian national team has won the Africa Cup and delighted all Egyptians.",
            "The Egyptian national team had won Africa Cup and delighted all Egyptians.",
            "The Egyptian national team won Africa Cup and will delight all Egyptians.",
            "The Egyptian national team is winning the African Cup and delighted every Egyptian."
        ],
        "modelAnswer": "The Egyptian national team has won the Africa Cup and delighted all Egyptians.",
        "altAnswers": ["Egypt's national team has won the African Cup and made all Egyptians happy."],
        "explanation": "\"لقد + ماضي\" بدون تحديد وقت ماضٍ صريح تترجم بالمضارع التام (has won). كما أن 'أسعد' معطوفة على ماضٍ متحقق.",
        "difficulty": "Medium",
        "topic": "Sports & National Pride",
        "lessonId": "LES_006",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 14,
        "origin": "Original Source Question"
    },
    {
        "id": "q_mcq_002",
        "type": "mcq",
        "questionText": "اختر الترجمة الصحيحة للجملة التالية:\n\"تدين حضارة العالم بالكثير للعرب.\"",
        "instructions": "اختر الترجمة التي تعبر عن المعنى الدقيق للفعل 'يدين بـ'",
        "options": [
            "World civilization owes a great deal to the Arabs.",
            "World civilization owes with much to the Arabs.",
            "World civilization has debt from the Arabs greatly.",
            "The world civilization is owing a lot of the Arabs."
        ],
        "modelAnswer": "World civilization owes a great deal to the Arabs.",
        "altAnswers": ["The civilization of the world owes much to the Arabs."],
        "explanation": "الفعل owe لا يأخذ حرف جر مفعولي في الإنجليزية بل تركيبه (owe something to someone) وحضارة العالم بدون أداة زائدة.",
        "difficulty": "Medium",
        "topic": "History & Heritage",
        "lessonId": "LES_007",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 10,
        "origin": "Original Source Question"
    },
    {
        "id": "q_mcq_003",
        "type": "mcq",
        "questionText": "Choose the best Arabic translation:\n\"Distant learning makes use of educational experts in various branches of knowledge all over the world.\"",
        "instructions": "اختر الصياغة العربية الأكثر فصاحة وسلاسة",
        "options": [
            "يستفيد التعلم عن بعد من خبراء التعليم في شتى فروع المعرفة حول العالم.",
            "يجعل التعلم البعيد استخدام خبراء التربية في فروع العلم العالمية.",
            "التعليم بالمسافة يستخدم الخبراء التعليميين في كل مكان في العالم.",
            "استفاد التعليم البعيد من العلماء في مجالات شتى على مستوى العالم."
        ],
        "modelAnswer": "يستفيد التعلم عن بعد من خبراء التعليم في شتى فروع المعرفة حول العالم.",
        "altAnswers": ["يتيح التعلم عن بعد الاستفادة من خبراء التربية والتعليم في مختلف فروع المعرفة في أنحاء العالم."],
        "explanation": "الترجمة الاصطلاحية لـ 'makes use of' هي 'يستفيد من' أو 'يوظف'، و'distant learning' هي 'التعلم عن بعد'.",
        "difficulty": "Easy",
        "topic": "Education & Technology",
        "lessonId": "LES_005",
        "marks": 2,
        "sourcePdf": "Source 2",
        "sourcePage": 50,
        "origin": "Original Source Question"
    },

    # 2. Arabic to English (Written)
    {
        "id": "q_ar_en_001",
        "type": "arabic_to_english",
        "questionText": "ترجم إلى الإنجليزية:\n\"يجب أن نتعاون جميعاً من أجل زيادة الإنتاج ورفع مستوى المعيشة.\"",
        "instructions": "اكتب ترجمة دقيقة مستخدماً البناء السليم للجملة الإنجليزية",
        "options": [],
        "modelAnswer": "We must all cooperate in order to increase production and raise the standard of living.",
        "altAnswers": [
            "We should all cooperate to increase production and improve living standards.",
            "All of us must cooperate so as to increase production and raise the standard of living."
        ],
        "explanation": "فاعل الجملة مستتر في العربية 'نتعاون' ويجب إظهاره كـ 'We'. لام التعليل تترجم بـ 'in order to' أو 'to'. و'مستوى المعيشة' هي 'the standard of living'.",
        "difficulty": "Medium",
        "topic": "Economics & Work",
        "lessonId": "LES_004",
        "marks": 3,
        "sourcePdf": "Source 1",
        "sourcePage": 16,
        "origin": "Original Source Question"
    },
    {
        "id": "q_ar_en_002",
        "type": "arabic_to_english",
        "questionText": "ترجم إلى الإنجليزية:\n\"إن السلام العادل والدائم هو السبيل الوحيد لتحقيق الرخاء والاستقرار في الشرق الأوسط.\"",
        "instructions": "لا تترجم 'إنّ' التوكيدية حرفياً وابدأ بالفاعل مباشرة",
        "options": [],
        "modelAnswer": "Just and lasting peace is the only way to achieve prosperity and stability in the Middle East.",
        "altAnswers": [
            "A just and lasting peace is the only means of achieving prosperity and stability in the Middle East.",
            "Fair and permanent peace is the only way to realize prosperity and stability in the Middle East."
        ],
        "explanation": "كلمة 'إنّ' توكيدية لا تترجم حرفياً. السلام اسم معنوي مجرد ولا يأخذ the إلا مع تخصيص. 'lasting' أو 'permanent' تعني دائم، و'prosperity' تعني الرخاء.",
        "difficulty": "Hard",
        "topic": "Politics & Peace",
        "lessonId": "LES_004",
        "marks": 4,
        "sourcePdf": "Source 2",
        "sourcePage": 35,
        "origin": "Original Source Question"
    },
    {
        "id": "q_ar_en_003",
        "type": "arabic_to_english",
        "questionText": "ترجم إلى الإنجليزية:\n\"لقد ساعد العلم الإنسان على أن يحيا حياة مريحة.\"",
        "instructions": "لاحظ زمن الجملة وتركيب المفعول المطلق",
        "options": [],
        "modelAnswer": "Science has helped man to live a comfortable life.",
        "altAnswers": [
            "Science has helped humans live comfortably.",
            "Science helped man to lead a comfortable life."
        ],
        "explanation": "'لقد ساعد' تفيد أثراً ممتداً للحاضر فيستخدم المضارع التام (has helped)، والعلم كاسم معنوي عام يكتب Science بدون the.",
        "difficulty": "Medium",
        "topic": "Science & Humanity",
        "lessonId": "LES_004",
        "marks": 3,
        "sourcePdf": "Source 1",
        "sourcePage": 16,
        "origin": "Original Source Question"
    },

    # 3. English to Arabic (Written)
    {
        "id": "q_en_ar_001",
        "type": "english_to_arabic",
        "questionText": "Translate into Arabic:\n\"Modern inventions have made it possible for us to travel quickly and comfortably across long distances.\"",
        "instructions": "صغ الجملة بأسلوب عربي فصيح مبدوءاً بفعل مناسب",
        "options": [],
        "modelAnswer": "لقد مكنتنا المخترعات الحديثة من السفر بسرعة وراحة عبر المسافات الطويلة.",
        "altAnswers": [
            "أتاحت المخترعات الحديثة لنا السفر بسرعة وراحة عبر مسافات شاسعة.",
            "بفضل الاختراعات الحديثة أصبح بإمكاننا السفر سريعاً وبشكل مريح لمسافات طويلة."
        ],
        "explanation": "يفضل في العربية البدء بالجملة الفعلية (مكّنتنا / أتاحت لنا). 'comfortable' تترجم ظرفياً بـ 'براحة / بشكل مريح'.",
        "difficulty": "Medium",
        "topic": "Technology & Travel",
        "lessonId": "LES_005",
        "marks": 3,
        "sourcePdf": "Source 2",
        "sourcePage": 27,
        "origin": "Original Source Question"
    },
    {
        "id": "q_en_ar_002",
        "type": "english_to_arabic",
        "questionText": "Translate into Arabic:\n\"Eco-tourism is a branch of tourism where tourists live in a primitive way, using natural resources and avoiding pollutants.\"",
        "instructions": "ترجم النص إلى لغة عربية متناسقة",
        "options": [],
        "modelAnswer": "السياحة البيئية هي فرع من فروع السياحة حيث يعيش السائحون بطريقة بدائية معتمدين على الموارد الطبيعية ومتجنبين الملوثات.",
        "altAnswers": [
            "تعد السياحة البيئية أحد فروع السياحة التي يقيم فيها السياح بأسلوب بدائي مستخدمين الموارد الطبيعية ومبتعدين عن الملوثات."
        ],
        "explanation": "ترجمة مصطلح 'Eco-tourism' بالسياحة البيئية، و'primitive way' بطريقة بدائية، و'pollutants' بالملوثات.",
        "difficulty": "Medium",
        "topic": "Tourism & Environment",
        "lessonId": "LES_005",
        "marks": 3,
        "sourcePdf": "Source 2",
        "sourcePage": 71,
        "origin": "Original Source Question"
    },

    # 4. Sentence Ordering (14/16 Types)
    {
        "id": "q_ord_001",
        "type": "sentence_ordering",
        "questionText": "رتب الكلمات الإنجليزية لتكوين ترجمة صحيحة للجملة:\n\"يزور مصر ملايين السياح كل عام لمشاهدة آثارها القديمة.\"",
        "instructions": "رتب الكلمات بالترتيب الصحيح (S + V + O)",
        "options": ["visit Egypt", "Every year,", "to watch", "millions of tourists", "its ancient monuments."],
        "modelAnswer": "Every year, millions of tourists visit Egypt to watch its ancient monuments.",
        "altAnswers": ["Millions of tourists visit Egypt every year to watch its ancient monuments."],
        "explanation": "في الإنجليزية: ظرف الزمان في البداية أو النهاية، ثم الفاعل (millions of tourists) ثم الفعل (visit) ثم المفعول (Egypt).",
        "difficulty": "Medium",
        "topic": "Tourism & History",
        "lessonId": "LES_003",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 15,
        "origin": "Original Source Question"
    },

    # 5. Fill in the Blanks
    {
        "id": "q_fib_001",
        "type": "fill_blanks",
        "questionText": "أكمل الفراغ بالكلمة المناسبة لترجمة:\n\"مدرسي مسرور من عملي.\"\n\"My teacher is pleased ________ my work.\"",
        "instructions": "اختر حرف الجر الصحيح المرتبط بالصفة pleased",
        "options": ["with", "from", "at", "about"],
        "modelAnswer": "with",
        "altAnswers": ["with"],
        "explanation": "من الأخطاء الشائعة استخدام from مع pleased بينما التعبير الإنجليزي الصحيح هو pleased with.",
        "difficulty": "Easy",
        "topic": "Grammar & Prepositions",
        "lessonId": "LES_007",
        "marks": 1,
        "sourcePdf": "Source 1",
        "sourcePage": 12,
        "origin": "Original Source Question"
    },

    # 6. Complete the Translation
    {
        "id": "q_cpt_001",
        "type": "complete_translation",
        "questionText": "أكمل الترجمة التالية:\n\"إن مصر غنية بثرواتها الطبيعية.\"\n\"Egypt ________ rich in its natural resources.\"",
        "instructions": "أدخل فعل الكينونة المناسب للزمن الحاضر",
        "options": ["is", "are", "was", "has"],
        "modelAnswer": "is",
        "altAnswers": ["is"],
        "explanation": "الجملة الاسمية في العربية تتطلب وجود Verb to be في الإنجليزية، ومصر مفرد فتأخذ is.",
        "difficulty": "Easy",
        "topic": "Sentence Structure",
        "lessonId": "LES_003",
        "marks": 1,
        "sourcePdf": "Source 1",
        "sourcePage": 10,
        "origin": "Original Source Question"
    },

    # 7. Vocabulary Matching
    {
        "id": "q_mat_001",
        "type": "word_matching",
        "questionText": "طابق كل مصطلح إنجليزي بمعناه العربي الدقيق المعتمد في المذكرات:",
        "instructions": "اسحب الكلمة الإنجليزية وضعها أمام معناها العربي",
        "options": [
            "1. Desert reclamation",
            "2. Food security",
            "3. Intensive care",
            "4. Foreign currency"
        ],
        "modelAnswer": "1-استصلاح الصحراء, 2-الأمن الغذائي, 3-العناية المركزة, 4-النقد الأجنبي",
        "altAnswers": [],
        "explanation": "المصطلحات الاقتصادية والطبية المستخرجة من صفحات 26 و50 و75.",
        "difficulty": "Medium",
        "topic": "Specialized Terminology",
        "lessonId": "LES_007",
        "marks": 4,
        "sourcePdf": "Source 3",
        "sourcePage": 75,
        "origin": "Original Source Question"
    },

    # 8. Word Selection
    {
        "id": "q_sel_001",
        "type": "word_selection",
        "questionText": "أي من الكلمات التالية تترجم بدقة عبارة 'منتجات محلية':",
        "instructions": "حدد الإجابة الأنسب وفق مبدأ 'الترجمة لغة التصرف'",
        "options": ["local products", "foreign crops", "imported merchandise", "raw minerals"],
        "modelAnswer": "local products",
        "altAnswers": ["domestic goods"],
        "explanation": "أوضح المستر أن local products أو local goods أو national articles تعبر بدقة عن المنتجات الوطنية والمحلية.",
        "difficulty": "Easy",
        "topic": "Translation Techniques",
        "lessonId": "LES_008",
        "marks": 1,
        "sourcePdf": "Source 1",
        "sourcePage": 18,
        "origin": "Original Source Question"
    },

    # 9. Correct the Translation
    {
        "id": "q_cor_001",
        "type": "correct_translation",
        "questionText": "صحح الخطأ في ترجمة الجملة التالية:\n\"The child is afraid from the lion.\"",
        "instructions": "حدد الكلمة الخاطئة واكتب الجملة المصححة بالكامل",
        "options": [],
        "modelAnswer": "The child is afraid of the lion.",
        "altAnswers": ["The child is frightened of the lion."],
        "explanation": "الصفة afraid تأخذ حرف الجر of وليس from.",
        "difficulty": "Easy",
        "topic": "Common Mistakes",
        "lessonId": "LES_009",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 13,
        "origin": "Original Source Question"
    },

    # 10. Error Identification
    {
        "id": "q_err_001",
        "type": "error_identification",
        "questionText": "حدد الجزء الذي يحتوي على خطأ نحوي في الترجمة التالية:\n\"We (A) are still (B) suffer from (C) the problem of unemployment (D).\"",
        "instructions": "اختر الرمز الذي يشير إلى الخطأ النحوي",
        "options": ["(A) We", "(B) are still", "(C) suffer from", "(D) the problem of unemployment"],
        "modelAnswer": "(C) suffer from",
        "altAnswers": ["C", "suffer from"],
        "explanation": "مع وجود are still يجب أن يكون الفعل بصيغة المضارع المستمر: suffering from.",
        "difficulty": "Medium",
        "topic": "Tenses & Continuous Aspect",
        "lessonId": "LES_006",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 10,
        "origin": "Original Source Question"
    },

    # 11. Context-Based Translation
    {
        "id": "q_ctx_001",
        "type": "context_translation",
        "questionText": "ترجم كلمة (Home) في سياق العبارة التالية لمغترب في الخارج:\n\"He spent twenty years abroad, but home means a lot to him.\"",
        "instructions": "بين كيف يؤثر السياق على المعنى الدقيق لكلمة Home هنا",
        "options": [],
        "modelAnswer": "قضى عشرين عاماً في الخارج، لكن وطنه يعني له الكثير.",
        "altAnswers": [
            "أمضى عشرين عاماً في الغربة، إلا أن مسقط رأسه والوطن يعنيان له الكثير."
        ],
        "explanation": "أكد مستر حبيب الرحمن في الصفحة الأولى أن Home في سياق المغتربين تعني الوطن، بينما للأم تعني الحياة الأسرية وللعامل في الصحراء الراحة والدفء.",
        "difficulty": "Medium",
        "topic": "Context & Polysemy",
        "lessonId": "LES_002",
        "marks": 3,
        "sourcePdf": "Source 1",
        "sourcePage": 9,
        "origin": "Original Source Question"
    },

    # 12. Grammar in Translation
    {
        "id": "q_grm_001",
        "type": "grammar_in_translation",
        "questionText": "ترجم مع ضبط الزمن:\n\"قد يتغير منهج اللغة الإنجليزية العام القادم.\"",
        "instructions": "استخدم الأداة التي تعبر عن الاحتمال في المضارع/المستقبل",
        "options": [],
        "modelAnswer": "The English curriculum may change next year.",
        "altAnswers": [
            "The English syllabus might change next year."
        ],
        "explanation": "'قد + مضارع' تفيد الاحتمال وتترجم بـ may + مصدر.",
        "difficulty": "Medium",
        "topic": "Modals & Probability",
        "lessonId": "LES_006",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 17,
        "origin": "Original Source Question"
    },

    # 13. Sentence Transformation
    {
        "id": "q_trn_001",
        "type": "sentence_transformation",
        "questionText": "حول الجملة التالية إلى المبني للمجهول في الإنجليزية:\n\"We consider tourism an important source of national income.\"",
        "instructions": "ابدأ بكلمة Tourism وأعد بناء الجملة",
        "options": [],
        "modelAnswer": "Tourism is considered an important source of national income.",
        "altAnswers": [
            "Tourism is regarded as an important source of national income."
        ],
        "explanation": "في المبني للمجهول: المفعول به Tourism يبدأ الجملة، ثم is considered ثم التكملة.",
        "difficulty": "Medium",
        "topic": "Passive Voice",
        "lessonId": "LES_008",
        "marks": 2,
        "sourcePdf": "Source 1",
        "sourcePage": 18,
        "origin": "Original Source Question"
    },

    # 14. Paragraph Translation
    {
        "id": "q_par_001",
        "type": "paragraph_translation",
        "questionText": "Translate this paragraph into Arabic:\n\"Egypt has always been known as the birthplace of civilization because of its long and rich history. We are now keen on restoring our glories to keep pace with progress in developed countries.\"",
        "instructions": "ترجم الفقرة كاملة بلغة عربية فصيحة ومترابطة",
        "options": [],
        "modelAnswer": "لطالما عُرفت مصر بأنها مهد الحضارة بفضل تاريخها الطويل والحافل. ونحن حريصون الآن على استعادة أمجادنا لنواكب مسيرة التقدم في الدول المتقدمة.",
        "altAnswers": [
            "لقد كانت مصر دائماً مهد الحضارة نظراً لتاريخها العريق. وإننا الآن حريصون أشد الحرص على استرداد أمجادنا لنساير التقدم في الدول المتقدمة."
        ],
        "explanation": "نموذج رسمي من امتحانات الأعوام السابقة (صفحة 42 و70). 'birthplace of civilization' = مهد الحضارة، و'keep pace with' = يواكب / يساير.",
        "difficulty": "Hard",
        "topic": "National Pride & History",
        "lessonId": "LES_011",
        "marks": 5,
        "sourcePdf": "Source 2",
        "sourcePage": 42,
        "origin": "Original Source Question"
    },

    # 15. Translation with Given Words
    {
        "id": "q_gw_001",
        "type": "translation_given_words",
        "questionText": "ترجم إلى الإنجليزية مستخدماً الكلمات المعطاة:\n\"إن نهر النيل هو شريان الحياة في مصر.\"\n(artery / lifeline / Egypt / River Nile)",
        "instructions": "وظف الكلمات المعطاة بدقة داخل صياغة صحيحة",
        "options": [],
        "modelAnswer": "The River Nile is the artery of life in Egypt.",
        "altAnswers": [
            "The River Nile is Egypt's lifeline."
        ],
        "explanation": "شريان الحياة يمكن ترجمته بـ artery of life أو lifeline.",
        "difficulty": "Medium",
        "topic": "Environment & Geography",
        "lessonId": "LES_010",
        "marks": 3,
        "sourcePdf": "Source 2",
        "sourcePage": 44,
        "origin": "Original Source Question"
    },

    # 16. Listening and Translation
    {
        "id": "q_lst_001",
        "type": "listening_translation",
        "questionText": "استمع إلى الجملة الصوتية ثم اكتب ترجمتها العربية الصحيحة:\n[Audio: \"Sir Magdi Yacoub is a world-famous heart surgeon who has helped thousands of patients.\"]",
        "instructions": "استمع بعناية وترجم المعنى المسموع بدقة",
        "options": [],
        "modelAnswer": "السير مجدي يعقوب جراح قلب عالمي شهير ساعد آلاف المرضى.",
        "altAnswers": [
            "الدكتور مجدي يعقوب جراح قلب ذائع الصيت في العالم وقد ساعد آلاف المرضى."
        ],
        "explanation": "تمرين استماع وترجمة تفاعلي يختبر الاستيعاب السمعي والترجمة الفورية.",
        "difficulty": "Medium",
        "topic": "Medicine & Personalities",
        "lessonId": "LES_012",
        "marks": 3,
        "sourcePdf": "Source 2",
        "sourcePage": 29,
        "origin": "Original Source Question"
    }
]

EXAMPLES_DATA = [
    {
        "id": "ex_001",
        "en": "Egypt has made great achievements during the last twenty years.",
        "ar": "لقد حققت مصر إنجازات عظيمة خلال العشرين سنة الأخيرة.",
        "rule": "Subject + Verb + Object word order, 'لقد' mapped to Present Perfect.",
        "analysis": "الفاعل: Egypt، الفعل: has made (مضارع تام لأن أثر الإنجازات مستمر)، المفعول: great achievements (الصفة great قبل الاسم الجمع)، المكمل الزماني: during the last twenty years.",
        "sourcePdf": "Source 1",
        "sourcePage": 9,
        "lessonId": "LES_001"
    },
    {
        "id": "ex_002",
        "en": "We are still suffering from the problem of unemployment.",
        "ar": "ما زلنا نعاني من مشكلة البطالة.",
        "rule": "Avoid literal omission of subject, use Present Continuous for ongoing suffering.",
        "analysis": "الترجمة الحرفية الشائعة 'Still suffer from problem...' خاطئة لحذف الفاعل وغياب أداة التعريف. الصواب: We are still suffering from the problem of unemployment.",
        "sourcePdf": "Source 1",
        "sourcePage": 10,
        "lessonId": "LES_001"
    },
    {
        "id": "ex_003",
        "en": "Egypt has succeeded in closing the ranks of the Arab leaders and this will have a great effect on the peace process.",
        "ar": "لقد نجحت مصر في جمع شمل القادة العرب وسيكون لهذا أثراً طيباً على عملية السلام.",
        "rule": "Blending verb tenses: Present Perfect for past achievement + Future Simple for upcoming outcome.",
        "analysis": "الجزء الأول مضارع تام (has succeeded) مع حرف الجر in + v-ing، والتعبير الاصطلاحي 'closing the ranks' لجمع الشمل، والجزء الثاني مستقبل بسيط (will have a great effect).",
        "sourcePdf": "Source 1",
        "sourcePage": 10,
        "lessonId": "LES_006"
    },
    {
        "id": "ex_004",
        "en": "The student is clever.",
        "ar": "الطالب ماهر.",
        "rule": "Inserting Verb to be to bridge Arabic nominal sentences into English.",
        "analysis": "الجملة العربية اسمية مبتدأ وخبر دون فعل ظاهر، لكن الإنجليزية تشترط فعلاً لذلك نضع verb to be وهو is.",
        "sourcePdf": "Source 1",
        "sourcePage": 10,
        "lessonId": "LES_003"
    },
    {
        "id": "ex_005",
        "en": "Developing education has become one of the most important aims which our government tries to achieve.",
        "ar": "لقد أصبح تطوير التعليم من أهم الأهداف التي تسعى حكومتنا لتحقيقها.",
        "rule": "Using Gerund as Subject + Present Perfect for 'لقد أصبح'.",
        "analysis": "بدأت الجملة باسم الفعل (Developing education) كفاعل مفرد، ثم has become، ثم صيغة التفضيل (one of the most important aims).",
        "sourcePdf": "Source 1",
        "sourcePage": 13,
        "lessonId": "LES_004"
    },
    {
        "id": "ex_006",
        "en": "It is better for us to learn foreign languages because they are means of communication among people.",
        "ar": "من الأفضل لنا أن نتعلم اللغات الأجنبية لأنها وسيلة للاتصال بين الناس.",
        "rule": "Structure: It is + adj. + for + n + to + inf.",
        "analysis": "صياغة 'من + صفة + لـ + أن' الإنجليزية القياسية، ومراعاة أن means جمع في المعنى لكنها تعامل كمفرد/جمع حسب السياق.",
        "sourcePdf": "Source 1",
        "sourcePage": 14,
        "lessonId": "LES_004"
    },
    {
        "id": "ex_007",
        "en": "Every year, a lot of tourists visit Egypt to watch its ancient monuments.",
        "ar": "يزور مصر كثير من السياح كل عام لمشاهدة آثارها القديمة.",
        "rule": "Translating Arabic suffixed pronoun (-ها) to possessive adjective (its).",
        "analysis": "الهاء في 'آثارها' تعود على غير عاقل (مصر) فتترجم بـ its ancient monuments، والصفة ancient تسبق الاسم monuments.",
        "sourcePdf": "Source 1",
        "sourcePage": 15,
        "lessonId": "LES_003"
    },
    {
        "id": "ex_008",
        "en": "Industry is the basis of development.",
        "ar": "إن الصناعة هي أساس التنمية.",
        "rule": "Omitting emphatic particle 'إنّ' and omitting 'the' before abstract uncountable noun.",
        "analysis": "الصناعة كقطاع عام تأتي Industry بدون the، وكلمة 'إنّ' التوكيدية لا تترجم حرفياً.",
        "sourcePdf": "Source 1",
        "sourcePage": 16,
        "lessonId": "LES_004"
    },
    {
        "id": "ex_009",
        "en": "This year may witness immense development towards peace.",
        "ar": "قد يشهد هذا العام تطورات هائلة نحو السلام.",
        "rule": "Translating 'قد + مضارع' with modal 'may'.",
        "analysis": "قد مع الفعل المضارع تدل على الاحتمال والرجاء، فتقابلها may + infinitive.",
        "sourcePdf": "Source 1",
        "sourcePage": 16,
        "lessonId": "LES_006"
    },
    {
        "id": "ex_010",
        "en": "Dad was reading the paper when the doorbell rang.",
        "ar": "كان والدي يقرأ الصحيفة عندما دق جرس الباب.",
        "rule": "Translating 'كان + مضارع' into Past Continuous (was/were + v-ing).",
        "analysis": "'كان يقرأ' تعبر عن حدث مستمر في الماضي قطعه حدث مفاجئ (دق جرس الباب)، فالحدث المستمر past continuous والحدث القاطع past simple.",
        "sourcePdf": "Source 1",
        "sourcePage": 17,
        "lessonId": "LES_006"
    },
    {
        "id": "ex_011",
        "en": "Democracy is a corner stone in our world today.",
        "ar": "تشكل الديمقراطية حجر زاوية في عالمنا اليوم.",
        "rule": "Translating Verb to be with an expressive context-sensitive Arabic verb (تشكل / تمثل).",
        "analysis": "بدلاً من القول 'الديمقراطية هي حجر...' فإن الأسلوب العربي الأرقى يستخدم فعلاً دلالياً مثل 'تشكل' أو 'تعتبر'.",
        "sourcePdf": "Source 1",
        "sourcePage": 19,
        "lessonId": "LES_005"
    },
    {
        "id": "ex_012",
        "en": "Heavy clouds and heavy rains.",
        "ar": "سحب كثيفة وأمطار غزيرة.",
        "rule": "Translating shared adjective into dual specialized Arabic descriptors.",
        "analysis": "في الإنجليزية توصف السحب والأمطار بـ heavy معاً، لكن في العربية السحب توصف بـ 'كثيفة' والأمطار بـ 'غزيرة'.",
        "sourcePdf": "Source 1",
        "sourcePage": 21,
        "lessonId": "LES_005"
    }
]

print(f"Questions: {len(QUESTIONS_DATA)} | Examples: {len(EXAMPLES_DATA)}")
