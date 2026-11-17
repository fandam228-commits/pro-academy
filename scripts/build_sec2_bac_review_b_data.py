import json
import os

OUTPUT_DIR = r"C:\Users\fanda\Documents\pro-academy\src\data\secondary-2027"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "sec2-bac-review-b-extracted.json")

review_b_data = {
    "curriculumMetadata": {
        "stage": "Secondary",
        "grade": "Second Year Egyptian Baccalaureate",
        "gradeCode": "sec_2_bac",
        "gradeAr": "الصف الثاني بكالوريا (البكالوريا المصرية)",
        "term": "First",
        "academicYear": "2026/2027",
        "type": "consolidation_review",
        "reviewCode": "review_b",
        "reviewTitleEn": "Consolidation Review B (Units 3 & 4)",
        "reviewTitleAr": "المراجعة التوطيدية الشاملة (ب) - الوحدتان الثالثة والرابعة",
        "coveredUnits": [
            "Unit 3: Echoes of the Past (Identity, Heritage & Concession Clauses)",
            "Unit 4: The Power of Choice (Food Waste, Consumer Decisions & Present Perfect)"
        ],
        "pageRange": "Pages 277 - 286",
        "sourceFile": "العمالقة_انجليزي_2_بكالوريا_الترم_الاول_2027_الجزء_الثالث_المتميزون.pdf"
    },
    "exercises": [
        {
            "id": "revb_mcq_01",
            "type": "mcq",
            "questionText": "Curators must make careful decisions about how to display artefacts because:",
            "options": [
                "a single museum cannot include every historical narrative simultaneously.",
                "all old artefacts are identical in size and shape.",
                "modern visitors are not interested in ancient heritage.",
                "historical documents cannot be scanned or digitized."
            ],
            "correctAnswer": "a single museum cannot include every historical narrative simultaneously.",
            "explanation": "Museum curation requires thoughtful selection to present coherent cultural narratives."
        },
        {
            "id": "revb_mcq_02",
            "type": "mcq",
            "questionText": "A chronological display in a historical exhibition arranges objects:",
            "options": [
                "according to the order in which historical events or periods occurred.",
                "in a completely random order without dates.",
                "based solely on the financial cost of each object.",
                "according to the modern artist who renovated the frame."
            ],
            "correctAnswer": "according to the order in which historical events or periods occurred.",
            "explanation": "Chronological order follows the historical timeline from earliest to latest."
        },
        {
            "id": "revb_mcq_03",
            "type": "mcq",
            "questionText": "Which sentence correctly demonstrates the present perfect continuous aspect?",
            "options": [
                "Researchers have been studying food waste patterns in Cairo for several months.",
                "Researchers have study food waste patterns in Cairo for several months.",
                "Researchers are studied food waste patterns in Cairo for several months.",
                "Researchers had study food waste patterns in Cairo for several months."
            ],
            "correctAnswer": "Researchers have been studying food waste patterns in Cairo for several months.",
            "explanation": "'Have been studying' indicates unbroken ongoing duration extending to the present."
        },
        {
            "id": "revb_mcq_04",
            "type": "mcq",
            "questionText": "'The new signs have made the historical exhibition more ________ (access) to international visitors.' The correct word form is:",
            "options": ["accessible", "accessibly", "accessibility", "accessing"],
            "correctAnswer": "accessible",
            "explanation": "Adjective required after 'more': 'accessible'."
        },
        {
            "id": "revb_mcq_05",
            "type": "mcq",
            "questionText": "'Museums play a vital role in the ________ (preserve) of national heritage.' The correct word form is:",
            "options": ["preservation", "preserved", "preservative", "preserving"],
            "correctAnswer": "preservation",
            "explanation": "Noun required after definite article 'the': 'preservation'."
        },
        {
            "id": "revb_mcq_06",
            "type": "mcq",
            "questionText": "'Visitors should examine the ________ (accurate) of online historical claims before sharing them.' The correct word form is:",
            "options": ["accuracy", "accurately", "accurate", "accurating"],
            "correctAnswer": "accuracy",
            "explanation": "Noun required after 'the': 'accuracy'."
        }
    ],
    "jreTrueFalseExercises": [
        {
            "id": "revb_jre_01",
            "passage": "Historical sites can preserve shared memories and connect people with the achievements and values of earlier generations. They are not built simply to impress visitors with their vast, enormous scale, but to serve as living sites of memory where cultural identity is commemorated.",
            "statement": "Sites of memory can help communities understand their identity and heritage.",
            "isTrue": True,
            "justification": "True. The text affirms that historical sites connect people with their heritage and civilizational values."
        },
        {
            "id": "revb_jre_02",
            "passage": "Museums cannot display every object from the past. Curators choose, organize, and explain particular artifacts to create a clear, meaningful historical narrative.",
            "statement": "Museums present every surviving artefact without making any choices.",
            "isTrue": False,
            "justification": "False. Space and narrative constraints necessitate careful curation and selective presentation."
        },
        {
            "id": "revb_jre_03",
            "passage": "A chronological display arranges objects according to the order in which historical events or dynasties occurred, allowing visitors to trace the rise and fall of civilizations over time.",
            "statement": "A chronological display presents objects in a random order.",
            "isTrue": False,
            "justification": "False. Chronological displays follow sequential historical order rather than random placement."
        },
        {
            "id": "revb_jre_04",
            "passage": "Food is often wasted because people buy more than they need, store perishable items badly, or misunderstand date labels.",
            "statement": "Poor planning and storage can increase food waste.",
            "isTrue": True,
            "justification": "True. The text cites overbuying, improper refrigeration, and label confusion as primary drivers of waste."
        }
    ]
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(review_b_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated Consolidation Review B dataset: {OUTPUT_FILE}")
print(f"  - MCQs: {len(review_b_data['exercises'])}")
print(f"  - JRE True/False: {len(review_b_data['jreTrueFalseExercises'])}")
