import json
import re
import os

rootDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# =========================================================================
# 1. FIX DIALOGUE CENTER FILES
# =========================================================================

def fix_dialogues():
    print("--- Fixing Dialogue Center ---")
    
    # 1. Prep 1 Dialogues
    p1_file = os.path.join(rootDir, "src/data/dialogue-center/prep1-dialogues.json")
    if os.path.exists(p1_file):
        p1_data = json.load(open(p1_file, encoding="utf-8"))
        for d in p1_data:
            did = d.get("id")
            # Fix dlg_prep1_19 (Omar)
            if did == "dlg_prep1_19":
                if len(d.get("lines", [])) > 0:
                    d["lines"][0]["text"] = re.sub(r"\s*\?\s*O\s*$", "?", d["lines"][0]["text"])
                for l in d.get("lines", []):
                    if l.get("speaker") == "mar":
                        l["speaker"] = "Omar"
            
            # Fix dlg_prep1_22 (Ali)
            if did == "dlg_prep1_22":
                if len(d.get("lines", [])) > 0:
                    d["lines"][0]["text"] = re.sub(r"\s*\?\s*A\s*$", "?", d["lines"][0]["text"])
                for l in d.get("lines", []):
                    if l.get("speaker") == "li":
                        l["speaker"] = "Ali"
            
            # Fix dlg_prep1_05 line 5 trailing 'Mazen:'
            if did == "dlg_prep1_05":
                for l in d.get("lines", []):
                    l["text"] = re.sub(r"\s*Mazen:\s*$", "", l.get("text", ""))

            # Fix dlg_prep1_16 line 6 trailing '? A'
            if did == "dlg_prep1_16":
                for l in d.get("lines", []):
                    l["text"] = re.sub(r"\s*\?\s*A\s*$", "?", l.get("text", ""))

            # Fix dlg_prep1_21 line 6 trailing 'Sal'
            if did == "dlg_prep1_21":
                for l in d.get("lines", []):
                    l["text"] = re.sub(r"\s*Sal\s*$", "", l.get("text", ""))

            # Clean spaces before question marks in all lines
            for l in d.get("lines", []):
                l["text"] = re.sub(r"\s+\?", "?", l.get("text", ""))

        with open(p1_file, "w", encoding="utf-8") as f:
            json.dump(p1_data, f, indent=2, ensure_ascii=False)
        print("  Updated prep1-dialogues.json")

    # 2. Prep 2 Dialogues
    p2_file = os.path.join(rootDir, "src/data/dialogue-center/prep2-dialogues.json")
    if os.path.exists(p2_file):
        p2_data = json.load(open(p2_file, encoding="utf-8"))
        for d in p2_data:
            did = d.get("id")
            # Fix dlg_prep2_25 (Ashraf)
            if did == "dlg_prep2_25":
                if len(d.get("lines", [])) > 0:
                    d["lines"][0]["text"] = re.sub(r"\s*\?\s*Ash\s*$", "?", d["lines"][0]["text"])
                for l in d.get("lines", []):
                    if l.get("speaker") == "raf":
                        l["speaker"] = "Ashraf"

            # Fix speaker names OIa -> Ola, Sarny -> Samy
            for l in d.get("lines", []):
                if l.get("speaker") == "OIa":
                    l["speaker"] = "Ola"
                elif l.get("speaker") == "Sarny":
                    l["speaker"] = "Samy"
                l["text"] = re.sub(r"\s+\?", "?", l.get("text", ""))

        with open(p2_file, "w", encoding="utf-8") as f:
            json.dump(p2_data, f, indent=2, ensure_ascii=False)
        print("  Updated prep2-dialogues.json")

    # 3. Prep 3 Dialogues
    p3_file = os.path.join(rootDir, "src/data/dialogue-center/prep3-dialogues.json")
    if os.path.exists(p3_file):
        p3_data = json.load(open(p3_file, encoding="utf-8"))
        for d in p3_data:
            did = d.get("id")
            # Fix dlg_prep3_15 (Mariam)
            if did == "dlg_prep3_15":
                for l in d.get("lines", []):
                    if l.get("speaker") == "ariam":
                        l["speaker"] = "Mariam"

            # Fix dlg_prep3_19 (Fareeda)
            if did == "dlg_prep3_19":
                for l in d.get("lines", []):
                    if l.get("speaker") == "reeda":
                        l["speaker"] = "Fareeda"

            for l in d.get("lines", []):
                l["text"] = re.sub(r"\s+\?", "?", l.get("text", ""))

        with open(p3_file, "w", encoding="utf-8") as f:
            json.dump(p3_data, f, indent=2, ensure_ascii=False)
        print("  Updated prep3-dialogues.json")


# =========================================================================
# 2. FIX TRAINING CENTER EXTRACTED QUESTIONS
# =========================================================================

SPECIFIC_STEM_FIXES = {
    "TRQ-0014": {
        "questionText": "Are you able to speak English?",
        "options": ["Are able", "Would", "Can", "Could"],
        "correctAnswer": "a",
        "explanation": "We use 'Are you able to' to express ability in the present."
    },
    "TRQ-0071": {
        "questionText": "This is the right address, ______?",
        "options": ["isn't it", "doesn't it", "is it", "wasn't it"],
        "correctAnswer": "a",
        "explanation": "Question tag for 'This is...' with positive statement takes 'isn't it?'."
    },
    "TRQ-0081": {
        "questionText": "She arrived ______ the office very late.",
        "options": ["at", "to", "in", "on"],
        "correctAnswer": "a",
        "explanation": "We use 'arrive at' for specific buildings or places like offices, stations, and schools."
    },
    "TRQ-0190": {
        "questionText": "Where's your mother? — She ______ to the swimming pool.",
        "options": ["has gone", "is going", "has been", "goes"],
        "correctAnswer": "a",
        "explanation": "'Has gone' means she went there and hasn't returned yet."
    },
    "TRQ-0199": {
        "questionText": "What's the colour of the car? — Well, it is ______.",
        "options": ["my father's car", "the car of my father", "car of my father", "father's my car"],
        "correctAnswer": "a",
        "explanation": "We use the possessive 's ('my father's car') for people."
    },
    "TRQ-0212": {
        "questionText": "You don't mind if she comes with us, ______ you?",
        "options": ["do", "don't", "will", "mind"],
        "correctAnswer": "a",
        "explanation": "Negative statement 'You don't mind...' takes positive tag 'do you?'."
    },
    "TRQ-0407": {
        "questionText": "She can type well, can't she? — Yes, she ______.",
        "options": ["can", "is", "does", "could"],
        "correctAnswer": "a",
        "explanation": "Short answer confirming modal 'can'."
    },
    "TRQ-0408": {
        "questionText": "She knows how to type well, doesn't she? — Yes, she ______.",
        "options": ["does", "is", "can", "knows"],
        "correctAnswer": "a",
        "explanation": "Short answer with auxiliary 'does' for present simple."
    },
    "TRQ-0409": {
        "questionText": "She can't type well, can she? — No, she ______.",
        "options": ["can't", "doesn't", "isn't", "couldn't"],
        "correctAnswer": "a",
        "explanation": "Short answer with modal 'can't'."
    },
    "TRQ-0421": {
        "questionText": "How long have you ______ waiting?",
        "options": ["been", "being", "be", "were"],
        "correctAnswer": "a",
        "explanation": "Present perfect continuous formula: have/has + been + v-ing."
    },
    "TRQ-0602": {
        "questionText": "I can see the girls, but ______ is your sister?",
        "options": ["which", "who", "whose", "whom"],
        "correctAnswer": "a",
        "explanation": "We use 'which' when choosing among a specific, limited set of people or items."
    },
    "TRQ-0713": {
        "questionText": "Do you like working with other girls or by ______?",
        "options": ["yourself", "yourselves", "you", "your"],
        "correctAnswer": "a",
        "explanation": "'By yourself' means alone / on your own."
    },
    "TRQ-0714": {
        "questionText": "Did you go to London on ______ own?",
        "options": ["your", "you", "yours", "yourself"],
        "correctAnswer": "a",
        "explanation": "Idiomatic expression 'on your own' means by yourself."
    },
    "TRQ-0740": {
        "questionText": "How long have you been in hospital? — ... six o'clock.",
        "options": ["Since", "For", "Ago", "In"],
        "correctAnswer": "a",
        "explanation": "We use 'Since' with a specific point in time (six o'clock)."
    },
    "TRQ-0785": {
        "questionText": "I'll never finish ______ this new dictionary.",
        "options": ["compiling", "to compile", "compile", "compiled"],
        "correctAnswer": "a",
        "explanation": "The verb 'finish' is followed by a gerund (v-ing)."
    },
    "TRQ-0859": {
        "questionText": "Why did you challenge him ______ a fight?",
        "options": ["to", "for", "with", "against"],
        "correctAnswer": "a",
        "explanation": "Collocation: 'challenge someone to a fight'."
    },
    "TRQ-0860": {
        "questionText": "I don't understand her. Can you make ______ what she's saying?",
        "options": ["out", "up", "off", "for"],
        "correctAnswer": "a",
        "explanation": "Phrasal verb 'make out' means to hear, see, or understand clearly."
    },
    "TRQ-0885": {
        "questionText": "The poor woman has fainted. Wait till she comes ______.",
        "options": ["round", "to", "out", "over"],
        "correctAnswer": "a",
        "explanation": "Phrasal verb 'come round' or 'come to' means to regain consciousness."
    }
}

def fix_training_center():
    print("--- Fixing Training Center Questions ---")
    tc_file = os.path.join(rootDir, "src/data/training-center-extracted-questions.json")
    questions = json.load(open(tc_file, encoding="utf-8"))
    
    interrogatives = r"^(Who|What|Where|When|Why|How|Which|Whose|Whom|Can|Could|Would|Will|Should|Do|Does|Did|Is|Are|Was|Were|Have|Has|Had)\b"
    
    fixed_count = 0
    for q in questions:
        qid = q.get("id")
        
        # 1. Apply specific stem and options fixes
        if qid in SPECIFIC_STEM_FIXES:
            fix = SPECIFIC_STEM_FIXES[qid]
            q["questionText"] = fix["questionText"]
            # Convert options to object array format
            q["options"] = [{"label": ["a", "b", "c", "d"][i], "text": fix["options"][i]} for i in range(4)]
            q["correctAnswer"] = fix["correctAnswer"]
            q["explanation"] = fix["explanation"]
            fixed_count += 1
            continue

        # 2. General stem cleanups
        stem = q.get("questionText", "").strip()

        # Remove leading OCR artifacts like ” “ or ”
        stem = re.sub(r"^[\”\“\"\']\s*", "", stem)

        # Fix capitalization of first character if English letter
        if stem and stem[0].islower() and stem[0].isalpha() and ord(stem[0]) < 128:
            stem = stem[0].upper() + stem[1:]

        # Convert direct questions ending with period to question mark
        # (avoid blanks like ______ or .....)
        if re.match(interrogatives, stem, re.IGNORECASE):
            if stem.endswith(".") and not re.search(r"(\.{3,}|_{2,})\s*$", stem):
                stem = re.sub(r"\.\s*$", "?", stem)
            elif not stem.endswith("?") and not re.search(r"(\.{3,}|_{2,})\s*$", stem):
                stem = stem + "?"

        # Fix space before punctuation
        stem = re.sub(r"(\w)\s+([,\?!;:])(?!\w)", r"\1\2", stem)

        q["questionText"] = stem

        # 3. Clean options
        opts = q.get("options", [])
        if isinstance(opts, list):
            cleaned_opts = []
            for o in opts:
                txt = o.get("text", "") if isinstance(o, dict) else str(o)
                # Strip trailing period from short options
                if len(txt.split()) <= 3 and txt.endswith("."):
                    txt = txt[:-1].strip()
                # Remove unwanted space before punctuation in option
                txt = re.sub(r"(\w)\s+([,\?!;:])(?!\w)", r"\1\2", txt)
                
                if isinstance(o, dict):
                    cleaned_opts.append({**o, "text": txt})
                else:
                    cleaned_opts.append(txt)
            q["options"] = cleaned_opts

    with open(tc_file, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"  Updated {len(questions)} Training Center questions ({fixed_count} specific fixes applied).")

if __name__ == "__main__":
    fix_dialogues()
    fix_training_center()
    print("Linguistic corrections script finished.")
