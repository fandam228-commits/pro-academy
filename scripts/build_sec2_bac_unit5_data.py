import json
import os

OUTPUT_DIR = r"C:\Users\fanda\Documents\pro-academy\src\data\secondary-2027"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "sec2-bac-unit5-extracted.json")

unit5_data = {
    "curriculumMetadata": {
        "stage": "Secondary",
        "grade": "Second Year Egyptian Baccalaureate",
        "gradeCode": "sec_2_bac",
        "gradeAr": "الصف الثاني بكالوريا (البكالوريا المصرية)",
        "term": "First",
        "academicYear": "2026/2027",
        "unitNumber": 5,
        "unitTitleEn": "The Greenhouse Effect",
        "unitTitleAr": "الانحباس الحراري: مشاركة الكوكب والاستدامة البيئية",
        "conceptEn": "Sharing the Planet & Climate Resilience",
        "conceptAr": "مشاركة الكوكب، التغير المناخي، الطاقة المتجددة، والعدالة البيئية",
        "sourceFile": "العمالقة_انجليزي_2_بكالوريا_الترم_الاول_2027_الجزء_الثالث_المتميزون.pdf",
        "publisher": "سلسلة العمالقة (Giants Books Series)",
        "pageRange": "Pages 287 - 346"
    },
    "keyBaccalaureateTerms": [
        {"term": "The Greenhouse Effect", "meaningAr": "ظاهرة الانحباس الحراري للغازات الدفيئة"},
        {"term": "Climate Resilience", "meaningAr": "المرونة المناخية والتكيف البيئي"},
        {"term": "Ocean Acidification", "meaningAr": "تحمض المحيطات وتآكل الشعاب المرجانية"},
        {"term": "Coral Bleaching", "meaningAr": "ابيضاض الشعاب المرجانية وفقدان لونها"},
        {"term": "Scientific Consensus", "meaningAr": "الإجماع العلمي الدولي"},
        {"term": "Cause & Effect Connectors", "meaningAr": "روابط السبب والنتيجة (Because of, Owing to, Consequently)"},
        {"term": "Adverb Positions & Degree", "meaningAr": "مواضع الظروف ودرجات التوكيد والتكرار"}
    ],
    "lessons": [
        {
            "lessonNumber": 1,
            "section": "Section A: Planet in Crisis",
            "sectionAr": "القسم أ: كوكب في أزمة مناخية",
            "titleEn": "Global Warming, Greenhouse Gases & Ecosystems",
            "titleAr": "الاحترار العالمي والغازات الدفيئة والأنظمة البيئية",
            "pages": "287 - 315",
            "coreVocabulary": [
                {
                    "id": "u5_l1_core_01",
                    "word": "greenhouse effect",
                    "pos": "n",
                    "meaningAr": "ظاهرة الاحتباس الحراري",
                    "definitionEn": "the process in which atmospheric gases trap heat and warm the Earth's surface",
                    "exampleEn": "The enhanced greenhouse effect is accelerating global climate instability."
                },
                {
                    "id": "u5_l1_core_02",
                    "word": "intensity",
                    "pos": "n",
                    "meaningAr": "شدة / قوة وعنف العاصفة أو الظاهرة",
                    "definitionEn": "the measurable strength, force, or extreme degree of a natural phenomenon",
                    "exampleEn": "As the storm approached the coast, its wind intensity increased dangerously."
                },
                {
                    "id": "u5_l1_core_03",
                    "word": "alarming rate",
                    "pos": "n",
                    "meaningAr": "معدل مخيف / وتيرة مقلقة للغاية",
                    "definitionEn": "a speed or frequency that causes intense worry or fear",
                    "exampleEn": "Endangered polar species are declining at an alarming rate due to habitat loss."
                },
                {
                    "id": "u5_l1_core_04",
                    "word": "biodiversity",
                    "pos": "n",
                    "meaningAr": "التنوع الحيوي والبيولوجي",
                    "definitionEn": "the variety of plant and animal life in a particular habitat or worldwide",
                    "exampleEn": "Conserving rainforests protects irreplaceable global biodiversity."
                },
                {
                    "id": "u5_l1_core_05",
                    "word": "acidification",
                    "pos": "n",
                    "meaningAr": "التحمض (تحمض مياه البحار)",
                    "definitionEn": "the process of becoming more acidic through absorbed chemical compounds",
                    "exampleEn": "Ocean acidification weakens marine shells and damages delicate coral systems."
                },
                {
                    "id": "u5_l1_core_06",
                    "word": "coral bleaching",
                    "pos": "n",
                    "meaningAr": "ابيضاض الشعاب المرجانية وموتها",
                    "definitionEn": "the whitening of corals caused by the expulsion of symbiotic algae under thermal stress",
                    "exampleEn": "Warmer sea temperatures in the Red Sea trigger severe coral bleaching."
                },
                {
                    "id": "u5_l1_core_07",
                    "word": "consensus",
                    "pos": "n",
                    "meaningAr": "إجماع وتوافق علمي مشترك",
                    "definitionEn": "a widely accepted general agreement among scientists or experts",
                    "exampleEn": "There is an overwhelming scientific consensus on anthropogenic global warming."
                },
                {
                    "id": "u5_l1_core_08",
                    "word": "fertile",
                    "pos": "adj",
                    "meaningAr": "خصب / صالح لإنتاج زراعي وفير",
                    "definitionEn": "land or soil capable of producing abundant vegetation or rich crops",
                    "exampleEn": "The Nile Delta has historically provided exceptionally fertile agricultural land."
                },
                {
                    "id": "u5_l1_core_09",
                    "word": "emissions",
                    "pos": "n",
                    "meaningAr": "انبعاثات غازية وصناعية",
                    "definitionEn": "substances, especially harmful gases, released into the atmosphere",
                    "exampleEn": "Strict industrial regulations aim to slash carbon dioxide emissions."
                },
                {
                    "id": "u5_l1_core_10",
                    "word": "sustainability",
                    "pos": "n",
                    "meaningAr": "الاستدامة والحفاظ على الموارد للأجيال",
                    "definitionEn": "the quality of not being harmful to the environment or depleting natural resources",
                    "exampleEn": "Transitioning to solar power guarantees long-term energy sustainability."
                }
            ],
            "buildYourLanguage": [
                {"term": "efficiency", "pos": "n", "meaningAr": "كفاءة وترشيد استهلاك الطاقة"},
                {"term": "initiative", "pos": "n", "meaningAr": "مبادرة بيئية ومجتمعية"},
                {"term": "renewable energy", "pos": "n", "meaningAr": "طاقة متجددة ونظيفة (شمسية ورياح)"},
                {"term": "recycling", "pos": "n", "meaningAr": "إعادة تدوير المخلفات"},
                {"term": "drought", "pos": "n", "meaningAr": "جفاف وشح مائي"},
                {"term": "glaciers", "pos": "n", "meaningAr": "أنهار وجبال جليدية قطبية"},
                {"term": "melting ice", "pos": "n", "meaningAr": "ذوبان الكتل الجليدية"},
                {"term": "rising sea level", "pos": "n", "meaningAr": "ارتفاع منسوب مياه البحر"},
                {"term": "fraction", "pos": "n", "meaningAr": "كسر أو نسبة ضئيلة"},
                {"term": "barren", "pos": "adj", "meaningAr": "أرض قاحلة وغير صالحة للزراعة"},
                {"term": "coastal flooding", "pos": "n", "meaningAr": "فيضانات وغمر ساحلي"}
            ],
            "synonymsAntonyms": [
                {
                    "word": "fertile",
                    "meaningAr": "خصب ومنتج",
                    "synonyms": ["productive", "fruitful", "rich"],
                    "antonyms": ["barren", "infertile", "arid"]
                },
                {
                    "word": "intensity",
                    "meaningAr": "شدة وقوة",
                    "synonyms": ["strength", "power", "severity"],
                    "antonyms": ["mildness", "calmness", "weakness"]
                },
                {
                    "word": "sustainability",
                    "meaningAr": "استدامة",
                    "synonyms": ["continuity", "durability", "viability"],
                    "antonyms": ["exhaustion", "depletion", "instability"]
                },
                {
                    "word": "emissions",
                    "meaningAr": "انبعاثات",
                    "synonyms": ["releases", "discharges", "exhaust"],
                    "antonyms": ["absorption", "containment", "intake"]
                }
            ],
            "collocations": [
                {"collocation": "alarming rate", "meaningAr": "بمعدل مخيف ومقلق للغاية"},
                {"collocation": "scientific consensus", "meaningAr": "إجماع علمي واسع النطاق"},
                {"collocation": "coastal flooding", "meaningAr": "فيضانات وغمر المناطق الساحلية المنخفضة"},
                {"collocation": "rising sea levels", "meaningAr": "ارتفاع مستويات مياه البحار والمحيطات"},
                {"collocation": "renewable energy sources", "meaningAr": "مصادر الطاقة المتجددة والصديقة للبيئة"},
                {"collocation": "water efficiency", "meaningAr": "كفاءة استخدام وترشيد المياه"}
            ]
        }
    ],
    "grammarStructures": [
        {
            "id": "u5_gram_01",
            "titleEn": "Connectors of Cause, Reason and Result",
            "titleAr": "روابط السبب والنتيجة (Cause, Reason and Result)",
            "explanation": "Mastering the structural difference between connectors followed by complete clauses (subject + verb) versus those followed by nouns or gerunds (-ing), and sentence-level conjunctive adverbs.",
            "categories": [
                {
                    "type": "Cause Followed by Clause",
                    "connectors": ["because", "since", "as"],
                    "rule": "Because / Since / As + Subject + Verb",
                    "example": "Because the planet is warming rapidly, polar glaciers are melting faster than ever."
                },
                {
                    "type": "Cause Followed by Noun / V-ing",
                    "connectors": ["because of", "due to", "owing to", "thanks to"],
                    "rule": "Because of / Due to / Owing to / Thanks to + Noun Phrase / V-ing",
                    "example": "Due to the persistent drought, farmers lost a significant portion of their crop yield."
                },
                {
                    "type": "Result Connectors & Conjunctive Adverbs",
                    "connectors": ["therefore", "consequently", "as a result", "leads to"],
                    "rule": "Clause 1; therefore / consequently / as a result, Clause 2. (or: leads to + Noun/V-ing)",
                    "example": "The factory slashed emissions; consequently, local air quality noticeably improved."
                }
            ]
        },
        {
            "id": "u5_gram_02",
            "titleEn": "Adverbs: Types, Modification and Positions in Sentences",
            "titleAr": "الظروف: أنواعها ومواضعها الدقيقة في الجملة الإنجليزية",
            "explanation": "Adverbs modify verbs, adjectives, or entire clauses. Sentence adverbs (undoubtedly, unfortunately, regrettably) sit at the start followed by a comma; adverbs of degree (extremely, noticeably, completely) sit before the adjective; adverbs of frequency sit before main verbs and after 'be'.",
            "examples": [
                "Unfortunately, the coastal conference was postponed due to torrential storms.",
                "Renewable energy will gradually replace fossil fuels over the coming decade.",
                "Artificial intelligence is noticeably transforming environmental monitoring."
            ]
        }
    ],
    "exercises": [
        {
            "id": "u5_ex_mcq_01",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "The greenhouse effect helps warm the Earth when gases in the atmosphere trap heat. What does greenhouse effect mean?",
            "options": [
                "The process in which gases trap heat and warm the Earth.",
                "The process by which plants release oxygen into the air.",
                "The movement of warm water currents through the oceans.",
                "The reduction of pollution caused by renewable energy."
            ],
            "correctAnswer": "The process in which gases trap heat and warm the Earth.",
            "explanation": "The greenhouse effect is thermal entrapment by atmospheric gases."
        },
        {
            "id": "u5_ex_mcq_02",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "As the storm approached the coast, its intensity increased. Which situation is the clearest example of increasing 'intensity'?",
            "options": [
                "A storm moves from one country to another.",
                "A storm lasts for fewer hours than expected.",
                "A storm changes direction before reaching the coast.",
                "A storm becomes much stronger and more destructive."
            ],
            "correctAnswer": "A storm becomes much stronger and more destructive.",
            "explanation": "Increasing intensity signifies growing strength, force, and severity."
        },
        {
            "id": "u5_ex_mcq_03",
            "type": "mcq",
            "level": "Level 1 (Foundation)",
            "questionText": "Protecting forests helps maintain ________ by providing habitats for diverse species.",
            "options": ["acidification", "biodiversity", "bleaching", "intensity"],
            "correctAnswer": "biodiversity",
            "explanation": "Biodiversity is the richness of biological species within ecosystems."
        },
        {
            "id": "u5_ex_mcq_04",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "________ the driver's careful action, the catastrophic collision was avoided.",
            "options": ["Because", "Since", "Thanks to", "Therefore"],
            "correctAnswer": "Thanks to",
            "explanation": "'Thanks to + noun phrase' expresses a positive cause/credit."
        },
        {
            "id": "u5_ex_mcq_05",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "The roads were flooded ________ it had rained heavily all night.",
            "options": ["as a result", "because", "owing to", "due to"],
            "correctAnswer": "because",
            "explanation": "'Because' is followed by a full explanatory clause ('it had rained heavily all night')."
        },
        {
            "id": "u5_ex_mcq_06",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "Which sentence is grammatically correct?",
            "options": [
                "Due the drought, farmers have lost their crops.",
                "Due to the drought, farmers have lost their crops.",
                "Due to of the drought, farmers have lost their crops.",
                "Because the drought, farmers have lost their crops."
            ],
            "correctAnswer": "Due to the drought, farmers have lost their crops.",
            "explanation": "'Due to' + noun phrase ('the drought')."
        },
        {
            "id": "u5_ex_mcq_07",
            "type": "mcq",
            "level": "Level 2 (Intermediate)",
            "questionText": "The factory reduced its emissions; ________, urban air quality improved.",
            "options": ["because of", "consequently", "because", "as a result of"],
            "correctAnswer": "consequently",
            "explanation": "Conjunctive adverb preceded by a semicolon and followed by a comma indicating result."
        },
        {
            "id": "u5_ex_mcq_08",
            "type": "mcq",
            "level": "Level 3 (Advanced Baccalaureate)",
            "questionText": "Renewable energy will ________ reduce our dependence on fossil oil over the coming decade.",
            "options": ["gradual", "gradually", "gradient", "graduate"],
            "correctAnswer": "gradually",
            "explanation": "Adverb of manner modifying the verb 'reduce'."
        },
        {
            "id": "u5_ex_mcq_09",
            "type": "mcq",
            "level": "Level 3 (Advanced Baccalaureate)",
            "questionText": "________, the outdoor environmental conference was cancelled due to unexpected stormy weather.",
            "options": ["Clear", "Fortunate", "Honest", "Unfortunately"],
            "correctAnswer": "Unfortunately",
            "explanation": "Sentence adverb modifying the entire proposition and expressing regret."
        },
        {
            "id": "u5_ex_mcq_10",
            "type": "mcq",
            "level": "Level 3 (Advanced Baccalaureate)",
            "questionText": "Farmers prefer fertile soil because it can support rich crops. The underlined adjective is closest in meaning to:",
            "options": ["barren", "infertile", "dry", "productive"],
            "correctAnswer": "productive",
            "explanation": "Fertile land is highly productive and fruitful."
        }
    ],
    "correctTheFormExercises": [
        {
            "id": "u5_ctf_01",
            "sentence": "The school launched a green initiative to improve energy ________ (efficient).",
            "targetWord": "efficient",
            "correctAnswer": "efficiency",
            "explanation": "Noun form required."
        },
        {
            "id": "u5_ctf_02",
            "sentence": "Strict regulations have helped lower toxic ________ (emit) from factories.",
            "targetWord": "emit",
            "correctAnswer": "emissions",
            "explanation": "Plural noun form required."
        },
        {
            "id": "u5_ctf_03",
            "sentence": "Investing in clean public transit supports the long-term ________ (sustain) of cities.",
            "targetWord": "sustain",
            "correctAnswer": "sustainability",
            "explanation": "Noun form required."
        }
    ],
    "jreTrueFalseExercises": [
        {
            "id": "u5_jre_01",
            "passage": "Scientists have reached an overwhelming consensus that human industrial emissions are the primary driving force behind contemporary global warming and ocean acidification. Without coordinated international reduction of greenhouse gases, global temperatures will continue to rise at an alarming rate.",
            "statement": "There is deep scientific disagreement and no consensus regarding human responsibility for global warming.",
            "isTrue": False,
            "justification": "False. The text confirms an overwhelming scientific consensus affirming human industrial activity as the primary driver of global warming."
        },
        {
            "id": "u5_jre_02",
            "passage": "Coral reefs provide vital marine habitats supporting over a quarter of all ocean biodiversity. When ocean waters remain unusually warm for extended periods, corals expel their symbiotic algae, resulting in coral bleaching and eventual reef mortality.",
            "statement": "Coral bleaching is triggered when sea temperatures become unusually warm over prolonged periods.",
            "isTrue": True,
            "justification": "True. The text directly links prolonged elevated seawater temperatures to the thermal stress causing coral bleaching."
        }
    ]
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(unit5_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated Unit 5 dataset: {OUTPUT_FILE}")
print(f"  - Core vocabulary: {sum(len(l['coreVocabulary']) for l in unit5_data['lessons'])}")
print(f"  - Build vocabulary: {sum(len(l['buildYourLanguage']) for l in unit5_data['lessons'])}")
print(f"  - Synonyms/Antonyms: {sum(len(l['synonymsAntonyms']) for l in unit5_data['lessons'])}")
print(f"  - Collocations: {sum(len(l['collocations']) for l in unit5_data['lessons'])}")
print(f"  - Grammar structures: {len(unit5_data['grammarStructures'])}")
print(f"  - MCQs: {len(unit5_data['exercises'])}")
print(f"  - Correct the form: {len(unit5_data['correctTheFormExercises'])}")
print(f"  - JRE True/False: {len(unit5_data['jreTrueFalseExercises'])}")
