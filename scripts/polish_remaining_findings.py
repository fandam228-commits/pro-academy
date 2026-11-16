import json
import re
import os

rootDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
tc_file = os.path.join(rootDir, "src/data/training-center-extracted-questions.json")
questions = json.load(open(tc_file, encoding="utf-8"))

for q in questions:
    qid = q.get("id")
    stem = q.get("questionText", "")

    # TRQ-0138: Fix missing space after comma
    if qid == "TRQ-0138":
        q["questionText"] = re.sub(r",([^\s])", r", \1", stem)

    # TRQ-0152: Fix options for legs of chair
    if qid == "TRQ-0152":
        q["questionText"] = "______ are broken."
        q["options"] = [
            {"label": "a", "text": "The legs of the chair"},
            {"label": "b", "text": "The chair legs"},
            {"label": "c", "text": "The chair's legs"},
            {"label": "d", "text": "The legs of chair"}
        ]
        q["correctAnswer"] = "a"
        q["explanation"] = "For inanimate objects, we generally use the 'of' pattern (the legs of the chair)."

    # TRQ-0781: Fix space before period
    if qid == "TRQ-0781":
        q["questionText"] = re.sub(r"\s+\.", ".", stem)

    # Standardize casing for mid-sentence gap options
    # If the stem has a blank (____ or ....) that is NOT at the start of a sentence,
    # and all options are single words (not proper nouns), lowercase them!
    has_mid_blank = bool(re.search(r"\w.*(\.{3,}|_{2,})", q.get("questionText", "")))
    proper_nouns = {"Egypt", "Cairo", "English", "Arabic", "London", "France", "Monday", "Friday", "Sunday"}
    opts = q.get("options", [])
    if has_mid_blank and isinstance(opts, list) and len(opts) == 4:
        all_single_words = all(isinstance(o, dict) and re.match(r"^[a-zA-Z]+$", o.get("text", "").strip()) for o in opts)
        if all_single_words:
            has_proper = any(o.get("text", "").strip() in proper_nouns for o in opts)
            if not has_proper:
                # Lowercase all options
                for o in opts:
                    o["text"] = o["text"].lower()

with open(tc_file, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print("Polishing complete.")
