import json

TC_FILE = "src/data/training-center-extracted-questions.json"
AMALIQA_FILE = "src/data/secondary-2027/sec2-bac-amaliqa-mcq-extracted.json"

with open(TC_FILE, "r", encoding="utf-8") as f:
    tc_questions = json.load(f)

# Filter out previously merged Amaliqa questions to start clean
tc_questions = [q for q in tc_questions if not q.get("id", "").startswith("TRQ-SEC2-AML-")]
print(f"Base Training Center questions before Amaliqa merge: {len(tc_questions)}")

with open(AMALIQA_FILE, "r", encoding="utf-8") as f:
    amaliqa_qs = json.load(f)

labels = ["a", "b", "c", "d"]
added_count = 0
next_order = len(tc_questions) + 1

for q in amaliqa_qs:
    stem = q["questionText"].strip()
    opts_list = q["options"]
    correct_text = q["correctAnswer"]
    
    formatted_options = []
    correct_letter = "a"
    
    for idx, opt in enumerate(opts_list[:4]):
        lbl = labels[idx]
        formatted_options.append({
            "label": lbl,
            "text": str(opt)
        })
        if str(opt).strip() == str(correct_text).strip():
            correct_letter = lbl
            
    tc_item = {
        "id": f"TRQ-SEC2-AML-{added_count+1:04d}",
        "originalOrder": next_order,
        "questionNumber": str(next_order),
        "sourceDocument": q["source"],
        "sourcePage": q.get("page", 1),
        "questionText": stem,
        "rawText": stem,
        "options": formatted_options,
        "optionsCount": 4,
        "correctAnswer": correct_letter,
        "correctAnswerText": correct_text,
        "explanation": q.get("explanation", ""),
        "validationStatus": "complete_verified",
        "isPublished": True,
        "unit": q.get("unit", "Unit 1"),
        "lesson": q.get("lesson", ""),
        "topic": q.get("topic", "Contextual Vocabulary"),
        "grade": "Second Secondary (Baccalaureate)",
        "gradeLevel": "Second Secondary (Baccalaureate)",
        "stage": "Secondary",
        "term": "First",
        "domainCategory": q.get("domainCategory", "Vocabulary"),
        "curriculum": "Baccalaureate"
    }
    
    tc_questions.append(tc_item)
    next_order += 1
    added_count += 1

print(f"Appended {added_count} El-Amaliqa questions.")
print(f"Total TC questions now: {len(tc_questions)}")

with open(TC_FILE, "w", encoding="utf-8") as f:
    json.dump(tc_questions, f, ensure_ascii=False, indent=2)

print("Saved updated Training Center questions.")
