import json
import os

OUTPUT_DIR = r"C:\Users\fanda\Documents\pro-academy\src\data\secondary-2027"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "sec2-bac-unit4-extracted.json")

unit4_data = {
    "curriculumMetadata": {
        "stage": "Secondary",
        "grade": "Second Year Egyptian Baccalaureate",
        "gradeCode": "sec_2_bac",
        "gradeAr": "الصف الثاني بكالوريا (البكالوريا المصرية)",
        "term": "First",
        "academicYear": "2026/2027",
        "unitNumber": 4,
        "unitTitleEn": "The Power of Choice",
        "unitTitleAr": "قوة الاختيار: الاستهلاك الرشيد والحد من هدر الطعام",
        "conceptEn": "Sustainable Consumption & Decision-Making",
        "conceptAr": "الاستهلاك المستدام، المسؤولية البيئية، وترشيد الموارد الأسرية",
        "sourceFile": "العمالقة_انجليزي_2_بكالوريا_الترم_الاول_2027_الجزء_الثاني_المتميزون.pdf",
        "publisher": "سلسلة العمالقة (Giants Books Series)",
        "pageRange": "Pages 209 - 276"
    },
    "keyBaccalaureateTerms": [
        {"term": "Sustainable Consumption", "meaningAr": "الاستهلاك الرشيد والمستدام"},
        {"term": "Food Waste Reduction", "meaningAr": "الحد من الهدر الغذائي في المنازل"},
        {"term": "Expiry & Safety Labels", "meaningAr": "ملصقات تواريخ الصلاحية والاستخدام الآمن"},
        {"term": "Formal Report Writing", "meaningAr": "كتابة التقارير الرسمية القائمة على استطلاعات الرأي"},
        {"term": "Present Perfect Aspect", "meaningAr": "المضارع التام البسيط والمستمر ودلالات الأثر والمدة"},
        {"term": "JRE (Justify - Reason - Evidence)", "meaningAr": "استراتيجية التبرير وذكر السبب والدليل"}
    ],
    "lessons": [
        {
            "lessonNumber": 1,
            "section": "Section A: Food Awareness",
            "sectionAr": "القسم أ: الوعي الغذائي والاستهلاك",
            "titleEn": "Food Waste in Egyptian Homes",
            "titleAr": "أسباب هدر الطعام في المنازل المصرية والحلول المستدامة",
            "pages": "209 - 222",
            "coreVocabulary": [
                {
                    "id": "u4_l1_core_01",
                    "word": "storage",
                    "pos": "n",
                    "meaningAr": "تخزين / حفظ المواد في مكان آمن",
                    "definitionEn": "keeping things in a safe, suitable place until they are needed",
                    "exampleEn": "Proper cold storage keeps perishable fruits and vegetables fresh for longer."
                },
                {
                    "id": "u4_l1_core_02",
                    "word": "confusion",
                    "pos": "n",
                    "meaningAr": "ارتباك وحيرة والتباس المفاهيم",
                    "definitionEn": "the state of being unable to understand something clearly",
                    "exampleEn": "Confusion between 'best before' and 'use by' dates leads to unnecessary food disposal."
                },
                {
                    "id": "u4_l1_core_03",
                    "word": "generosity",
                    "pos": "n",
                    "meaningAr": "الكرم وحسن الضيافة والعطاء",
                    "definitionEn": "the noble quality of being kind, welcoming, and willing to share generously with guests",
                    "exampleEn": "Hospitality and generosity are deeply cherished traditions in Egyptian family gatherings."
                },
                {
                    "id": "u4_l1_core_04",
                    "word": "recommendations",
                    "pos": "n",
                    "meaningAr": "توصيات ومقترحات إرشادية",
                    "definitionEn": "suggestions or pieces of advice on the best course of action",
                    "exampleEn": "The consumer agency published practical recommendations to curb grocery overbuying."
                },
                {
                    "id": "u4_l1_core_05",
                    "word": "reduce",
                    "pos": "v",
                    "meaningAr": "يُقلِّل / يخفّض الكمية أو الحجم",
                    "definitionEn": "to make something smaller, lower in amount, or less wasteful",
                    "exampleEn": "Families can reduce domestic waste by planning weekly meals in advance."
                },
                {
                    "id": "u4_l1_core_06",
                    "word": "leftover",
                    "pos": "n",
                    "meaningAr": "بقايا الطعام الصالحة للأكل",
                    "definitionEn": "food remaining uneaten after a meal that can be safely refrigerated and reused",
                    "exampleEn": "Creative recipes can turn dinner leftovers into delicious, wholesome lunches."
                },
                {
                    "id": "u4_l1_core_07",
                    "word": "significantly",
                    "pos": "adv",
                    "meaningAr": "بشكل ملحوظ وكبير ومؤثر",
                    "definitionEn": "in an important, measurable, or noteworthy manner",
                    "exampleEn": "Adopting smart shopping habits can significantly lower monthly household expenses."
                },
                {
                    "id": "u4_l1_core_08",
                    "word": "greenhouse gases",
                    "pos": "n",
                    "meaningAr": "غازات الاحتباس الحراري (الغازات الدفيئة)",
                    "definitionEn": "atmospheric gases like methane and carbon dioxide that trap thermal heat around Earth",
                    "exampleEn": "Rotting food in municipal landfills releases vast volumes of greenhouse gases."
                },
                {
                    "id": "u4_l1_core_09",
                    "word": "use by date",
                    "pos": "n",
                    "meaningAr": "تاريخ انتهاء الصلاحية الآمنة للاستهلاك",
                    "definitionEn": "the mandatory safety date indicating when food ceases to be safe for human consumption",
                    "exampleEn": "Never consume dairy products past their designated use by date."
                }
            ],
            "buildYourLanguage": [
                {"term": "consumption", "pos": "n", "meaningAr": "استهلاك الموارد والسلع"},
                {"term": "consumer", "pos": "n", "meaningAr": "المستهلك"},
                {"term": "address", "pos": "v", "meaningAr": "يعالج ويتصدى لقضية"},
                {"term": "perception", "pos": "n", "meaningAr": "إدراك وتصور ذهني"},
                {"term": "food waste", "pos": "n", "meaningAr": "هدر وإتلاف الأطعمة"},
                {"term": "survey", "pos": "n", "meaningAr": "استطلاع ومسح للرأي"},
                {"term": "poor storage", "pos": "n", "meaningAr": "سوء التخزين والحفظ"},
                {"term": "overbuying", "pos": "n", "meaningAr": "شراء سلع فائضة عن الحاجة"},
                {"term": "misunderstanding", "pos": "n", "meaningAr": "سوء فهم والتباس"},
                {"term": "facilities", "pos": "n", "meaningAr": "تجهيزات ومرافق حفظ"},
                {"term": "brand", "pos": "n", "meaningAr": "علامة تجارية موثوقة"},
                {"term": "discard", "pos": "v", "meaningAr": "يتخلص من ويلقي في المهملات"},
                {"term": "food label", "pos": "n", "meaningAr": "ملصق بيانات المكونات وتواريخ الصلاحية"},
                {"term": "purchase", "pos": "n/v", "meaningAr": "شراء / يشتري"},
                {"term": "festival", "pos": "n", "meaningAr": "مهرجان ومناسبة احتفالية"},
                {"term": "global", "pos": "adj", "meaningAr": "عالمي ودولي النطاق"},
                {"term": "responsible", "pos": "adj", "meaningAr": "مسؤول وواعٍ بالعواقب"},
                {"term": "environmental", "pos": "adj", "meaningAr": "بيئي ومحافظ على الطبيعة"},
                {"term": "noticeable", "pos": "adj", "meaningAr": "ملحوظ وجلي"},
                {"term": "refrigerator", "pos": "n", "meaningAr": "ثلاجة التبريد المنزلي"},
                {"term": "findings", "pos": "n", "meaningAr": "نتائج وخلاصات البحث العلمي"},
                {"term": "packages", "pos": "n", "meaningAr": "عبوات وأغلفة التعبئة"},
                {"term": "awareness", "pos": "n", "meaningAr": "وعي وإدراك مجتمعي"},
                {"term": "require", "pos": "v", "meaningAr": "يتطلب ويستلزم جهداً"},
                {"term": "recommend", "pos": "v", "meaningAr": "يوصي وينصح بتدبير معين"},
                {"term": "willing", "pos": "adj", "meaningAr": "مستعد ومبادر للتغيير"}
            ],
            "synonymsAntonyms": [
                {
                    "word": "reduce",
                    "meaningAr": "يقلل ويخفض",
                    "synonyms": ["decrease", "lessen", "diminish"],
                    "antonyms": ["increase", "raise", "expand"]
                },
                {
                    "word": "confusion",
                    "meaningAr": "ارتباك والتباس",
                    "synonyms": ["disorder", "uncertainty", "misunderstanding"],
                    "antonyms": ["clarity", "understanding", "certainty"]
                },
                {
                    "word": "generosity",
                    "meaningAr": "كرم وعطاء",
                    "synonyms": ["kindness", "charity", "liberality"],
                    "antonyms": ["stinginess", "selfishness", "greed"]
                },
                {
                    "word": "leftover",
                    "meaningAr": "بقايا متبقية",
                    "synonyms": ["remaining", "rest", "residue"],
                    "antonyms": ["entirety", "whole", "total"]
                },
                {
                    "word": "significantly",
                    "meaningAr": "بشكل ملحوظ وكبير",
                    "synonyms": ["considerably", "substantially", "remarkably"],
                    "antonyms": ["slightly", "minimally", "negligibly"]
                },
                {
                    "word": "noticeable",
                    "meaningAr": "ملحوظ وواضح",
                    "synonyms": ["evident", "obvious", "apparent"],
                    "antonyms": ["unnoticeable", "invisible", "imperceptible"]
                },
                {
                    "word": "purchase",
                    "meaningAr": "يشتري / شراء",
                    "synonyms": ["buy", "acquire", "obtain"],
                    "antonyms": ["sell", "return", "refund"]
                }
            ],
            "wordFamily": [
                {"verb": "waste", "noun": "waste", "adjective": "wasted", "meaningAr": "يهدر / هدر / مُهدَر"},
                {"verb": "consume", "noun": "consumption", "adjective": "consumable", "meaningAr": "يستهلك / استهلاك / قابل للاستهلاك"},
                {"verb": "confuse", "noun": "confusion", "adjective": "confused", "meaningAr": "يربك / ارتباك / مرتبك"},
                {"verb": "recommend", "noun": "recommendation", "adjective": "recommended", "meaningAr": "يوصي / توصية / موصى به"},
                {"verb": "reduce", "noun": "reduction", "adjective": "reduced", "meaningAr": "يخفض / خفض / مُخفَّض"},
                {"verb": "express", "noun": "expression", "adjective": "expressive", "meaningAr": "يعبر / تعبير / معبّر"},
                {"verb": "store", "noun": "storage", "adjective": "stored", "meaningAr": "يخزن / تخزين / مُخزَّن"},
                {"verb": "differ", "noun": "difference", "adjective": "different", "meaningAr": "يختلف / اختلاف / مختلف"}
            ],
            "collocations": [
                {"collocation": "express generosity", "meaningAr": "يعبر عن كرم الضيافة وعادات الجود"},
                {"collocation": "store food", "meaningAr": "يخزن الأطعمة بطريقة صحية"},
                {"collocation": "reduce food waste", "meaningAr": "يحد من هدر وإتلاف الطعام"},
                {"collocation": "build refrigeration facilities", "meaningAr": "ينشئ مرافق ومنشآت تبريد حديثة"},
                {"collocation": "within a few years", "meaningAr": "في غضون بضع سنوات وجيزة"},
                {"collocation": "go down significantly", "meaningAr": "ينخفض بمعدل كبير وملحوظ"},
                {"collocation": "understand the difference between", "meaningAr": "يفهم الفارق الدقيق بين الأمرين"},
                {"collocation": "make recommendations", "meaningAr": "يقدم توصيات وحلولاً عملية"},
                {"collocation": "'best before' date", "meaningAr": "تاريخ الجودة المثالية قبل"},
                {"collocation": "address a problem", "meaningAr": "يتصدى للمشكلة ويعالج جذورها"},
                {"collocation": "willing to", "meaningAr": "على أتم استعداد للمساهمة والتغيير"},
                {"collocation": "contribute to + V-ing", "meaningAr": "يساهم بفاعلية في تحقيق كذا"},
                {"collocation": "go bad", "meaningAr": "يفسد ويتلف (للأغذية)"},
                {"collocation": "throw away", "meaningAr": "يلقي في القمامة ويتخلص منه"}
            ],
            "languageNotes": [
                {
                    "item1": "storage (n)",
                    "meaning1Ar": "تخزين وحفظ مادي للمواد والأطعمة أو مساحة التخزين",
                    "item2": "preservation (n)",
                    "meaning2Ar": "صون وحفظ التراث أو حماية الآثار والبيئة من التدهور",
                    "example": "Good food storage avoids spoilage, while museum preservation safeguards antiquities."
                },
                {
                    "item1": "leftover (n)",
                    "meaning1Ar": "بقايا الطعام المتبقية بعد الانتهاء من الوجبة",
                    "item2": "surplus (n)",
                    "meaning2Ar": "فائض إنتاجي أو مالي زائد عن الاحتياج الكلي",
                    "example": "Don't discard edible leftovers; distribute agricultural surplus to communities in need."
                },
                {
                    "item1": "reduce (v)",
                    "meaning1Ar": "يُقلل شيئاً (فعل متعدٍ يتبعه مفعول به: reduce waste)",
                    "item2": "go down (v)",
                    "meaning2Ar": "ينخفض أو يهبط ذاتياً (فعل لازم لا يأخذ مفعولاً: prices go down)",
                    "example": "If consumers reduce consumption, food waste will go down significantly."
                },
                {
                    "item1": "tradition (n)",
                    "meaning1Ar": "تقليد مجتمعي وعادة متوارثة عبر الأجيال (like Ramadan banquets)",
                    "item2": "habit (n)",
                    "meaning2Ar": "عادة سلوكية فردية يمارسها الشخص تلقائياً في يومه",
                    "example": "Hospitality is an Egyptian tradition, while checking expiration labels is a smart habit."
                }
            ]
        }
    ],
    "grammarStructures": [
        {
            "id": "u4_gram_01",
            "titleEn": "Present Perfect Simple vs Present Perfect Continuous",
            "titleAr": "المضارع التام البسيط والمضارع التام المستمر",
            "explanation": "Present Perfect Simple (have/has + P.P.) emphasizes completion, result, or number of achievements. Present Perfect Continuous (have/has + been + V-ing) emphasizes duration, unbroken continuity, or physical evidence of recent activity.",
            "rules": [
                "Present Perfect Simple: Focuses on the finished outcome or how many times an action occurred. Example: 'Researchers have published three reports on food waste.'",
                "Present Perfect Continuous: Focuses on the activity itself and its duration over time. Example: 'It has been raining all day without stopping.'",
                "Stative verbs (know, believe, understand, belong) are used in the simple form, never continuous: 'I have known him for years.'"
            ],
            "keyLinkers": ["since", "for", "already", "yet", "just", "ever", "never", "recently", "lately", "all day", "all morning"]
        }
    ],
    "exercises": [
        {
            "id": "u4_ex_mcq_01",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "It ________ all day. It hasn't stopped.",
            "options": ["has been raining", "has rained", "had rained", "rained"],
            "correctAnswer": "has been raining",
            "explanation": "'Has been raining' highlights ongoing duration continuing into the present."
        },
        {
            "id": "u4_ex_mcq_02",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "Which sentence tells us that Tom is STILL working in the factory today?",
            "options": [
                "Tom worked in that factory for ten years.",
                "Tom used to work in that factory.",
                "Tom has worked in that factory for ten years.",
                "Tom was working in that factory."
            ],
            "correctAnswer": "Tom has worked in that factory for ten years.",
            "explanation": "The present perfect indicates an action that started in the past and continues into the present."
        },
        {
            "id": "u4_ex_mcq_03",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "Which sentence is grammatically correct?",
            "options": [
                "She has bought a jacket during the sale.",
                "She have bought a jacket during the sale.",
                "She has buy a jacket during the sale.",
                "She has buyed a jacket during the sale."
            ],
            "correctAnswer": "She has bought a jacket during the sale.",
            "explanation": "'She has bought' has correct auxiliary agreement and past participle form."
        },
        {
            "id": "u4_ex_mcq_04",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "Have you ________ fallen for a loss aversion marketing trick?",
            "options": ["ever", "never", "yet", "already"],
            "correctAnswer": "ever",
            "explanation": "'Ever' is used in interrogative present perfect questions inquiring about life experience."
        },
        {
            "id": "u4_ex_mcq_05",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "Shops ________ countdown clocks for years to pressure shoppers.",
            "options": [
                "have use countdown clocks",
                "have used countdown clocks",
                "has used countdown clocks",
                "have using countdown clocks"
            ],
            "correctAnswer": "have used countdown clocks",
            "explanation": "Plural subject 'Shops' + 'have' + past participle 'used'."
        },
        {
            "id": "u4_ex_mcq_06",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "Researchers ________ that food waste is very high in urban centers.",
            "options": ["has found", "have found", "have been finding", "found since"],
            "correctAnswer": "have found",
            "explanation": "Present perfect simple reporting a factual discovery."
        },
        {
            "id": "u4_ex_mcq_07",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "The municipal authority ________ the new recycling sorting bins yet.",
            "options": ["has not introduced", "have not introduced", "has not been introduced", "had not introduced"],
            "correctAnswer": "has not introduced",
            "explanation": "Singular subject + 'has not introduced' accompanied by the sentence-final adverb 'yet'."
        },
        {
            "id": "u4_ex_mcq_08",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "Some secondary schools in Cairo have ________ food education campaigns.",
            "options": ["already started", "yet started", "never started yet", "since started"],
            "correctAnswer": "already started",
            "explanation": "'Already' fits between auxiliary and past participle to indicate early completion."
        },
        {
            "id": "u4_ex_mcq_09",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "Food waste has become an increasingly urgent economic challenge ________ 2000.",
            "options": ["since", "for", "already", "ago"],
            "correctAnswer": "since",
            "explanation": "'Since' specifies the starting calendar point in time (since 2000)."
        },
        {
            "id": "u4_ex_mcq_10",
            "type": "mcq",
            "level": "Level 3 (Advanced Baccalaureate)",
            "questionText": "'The last time I saw her was a week ago.' This means:",
            "options": [
                "I haven't seen her for a week.",
                "I have seen her for a week.",
                "I haven't seen her since a week.",
                "I had seen her for a week ago."
            ],
            "correctAnswer": "I haven't seen her for a week.",
            "explanation": "'The last time ... was [duration] ago' transforms to negative present perfect + 'for [duration]'."
        }
    ],
    "correctTheFormExercises": [
        {
            "id": "u4_ctf_01",
            "sentence": "Researchers ________ (find) that bread waste is very high in Egyptian cities.",
            "targetWord": "find",
            "correctAnswer": "have found",
            "explanation": "Present perfect simple for research findings."
        },
        {
            "id": "u4_ctf_02",
            "sentence": "The company ________ (not / introduce) the new cold storage system yet.",
            "targetWord": "not / introduce",
            "correctAnswer": "has not introduced",
            "explanation": "Negative present perfect with 'yet'."
        },
        {
            "id": "u4_ctf_03",
            "sentence": "Some schools in Cairo have ________ (already / start) teaching food education.",
            "targetWord": "already / start",
            "correctAnswer": "already started",
            "explanation": "Adverb 'already' with past participle."
        },
        {
            "id": "u4_ctf_04",
            "sentence": "Food waste ________ (become) a bigger problem since 2000.",
            "targetWord": "become",
            "correctAnswer": "has become",
            "explanation": "Present perfect with 'since'."
        }
    ],
    "jreTrueFalseExercises": [
        {
            "id": "u4_jre_01",
            "passage": "In Egypt, one common cause of food waste is buying more food than a family can use. During Ramadan, some families may prepare or purchase a large amount of food to welcome guests and express generosity. Although generosity is a positive and valued tradition, poor planning can sometimes lead to more food being prepared than needed, resulting in edible leftovers being discarded.",
            "statement": "Food waste during social celebrations in Egypt is solely driven by selfish indifference.",
            "isTrue": False,
            "justification": "False. The passage explains that excess food preparation is often motivated by noble cultural values of hospitality and generosity, compounded by a lack of precise portion planning."
        },
        {
            "id": "u4_jre_02",
            "passage": "A major cause of food waste is consumer confusion about dates on food packages. Many people throw away food on or before its 'best before' date. However, 'best before' only means that taste or texture might change slightly — it does not mean the food is unsafe. The 'use by' date is the one that tells you when food is no longer safe to eat.",
            "statement": "Food that passes its 'best before' date becomes immediately hazardous and toxic to eat.",
            "isTrue": False,
            "justification": "False. The text explicitly clarifies that 'best before' indicates peak quality/taste, whereas only the 'use by' date signals safety expiration."
        }
    ]
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(unit4_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated Unit 4 dataset: {OUTPUT_FILE}")
print(f"  - Core vocabulary: {sum(len(l['coreVocabulary']) for l in unit4_data['lessons'])}")
print(f"  - Build vocabulary: {sum(len(l['buildYourLanguage']) for l in unit4_data['lessons'])}")
print(f"  - Synonyms/Antonyms: {sum(len(l['synonymsAntonyms']) for l in unit4_data['lessons'])}")
print(f"  - Collocations: {sum(len(l['collocations']) for l in unit4_data['lessons'])}")
print(f"  - Grammar structures: {len(unit4_data['grammarStructures'])}")
print(f"  - MCQs: {len(unit4_data['exercises'])}")
print(f"  - Correct the form: {len(unit4_data['correctTheFormExercises'])}")
print(f"  - JRE True/False: {len(unit4_data['jreTrueFalseExercises'])}")
