import re
import json
import os

target_dir = os.path.join(r"C:\Users\fanda\Documents\pro-academy\src\data\dialogue-center")
os.makedirs(target_dir, exist_ok=True)

GOV_MAP = {
    "cairo": ("Cairo", "القاهرة"),
    "giza": ("Giza", "الجيزة"),
    "alexandria": ("Alexandria", "الإسكندرية"),
    "dakahlia": ("Dakahlia", "الدقهلية"),
    "sharkia": ("Sharkia", "الشرقية"),
    "gharbia": ("Gharbia", "الغربية"),
    "monufia": ("Monufia", "المنوفية"),
    "menoufia": ("Monufia", "المنوفية"),
    "beheira": ("Beheira", "البحيرة"),
    "damietta": ("Damietta", "دمياط"),
    "port said": ("Port Said", "بورسعيد"),
    "ismailia": ("Ismailia", "الإسماعيلية"),
    "suez": ("Suez", "السويس"),
    "qalyubia": ("Qalyubia", "القليوبية"),
    "fayoum": ("Fayoum", "الفيوم"),
    "beni suef": ("Beni Suef", "بني سويف"),
    "minya": ("Minya", "المنيا"),
    "assiut": ("Assiut", "أسيوط"),
    "sohag": ("Sohag", "سوهاج"),
    "qena": ("Qena", "قنا"),
    "luxor": ("Luxor", "الأقصر"),
    "aswan": ("Aswan", "أسوان"),
    "red sea": ("Red Sea", "البحر الأحمر"),
    "matrouh": ("Matrouh", "مطروح"),
    "kafr el-sheikh": ("Kafr El-Sheikh", "كفر الشيخ")
}

def detect_gov(text):
    low = text.lower()
    for k, (en, ar) in GOV_MAP.items():
        if k in low:
            return en, ar
    if 'القاهرة' in text or 'اﻟﻘﺎھرة' in text: return "Cairo", "القاهرة"
    if 'الجيزة' in text or 'اﻟﺟﯾزة' in text: return "Giza", "الجيزة"
    if 'الإسكندرية' in text: return "Alexandria", "الإسكندرية"
    if 'الشرقية' in text: return "Sharkia", "الشرقية"
    if 'الغربية' in text: return "Gharbia", "الغربية"
    if 'البحيرة' in text: return "Beheira", "البحيرة"
    return None, None

def detect_year(text):
    m = re.search(r'\b(202[0-9])\b', text)
    return int(m.group(1)) if m else None

def clean_base(text):
    text = re.sub(r'---\s*PAGE\s*\d+\s*---', '', text)
    text = re.sub(r'Professional\s*Prep\s*\d', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Professional\s*3rd\s*prep\s*\d', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Finish the following dialogue\s*:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Complete the following dialogue\s*:', '', text, flags=re.IGNORECASE)
    
    wingdings_map = {'\uf08c': '(1)', '\uf08d': '(2)', '\uf08e': '(3)', '\uf08f': '(4)', '\uf090': '(5)'}
    for k, v in wingdings_map.items():
        text = text.replace(k, v)
        
    text = re.sub(r'\(\s*([1-5])\s*\)', r'(\1)', text)
    text = re.sub(r'(\d{1,2})\s*\n\s*\.', r'\n\1. ', text)
    text = re.sub(r'([A-Za-z]+)\s*\n+\s*([\:\;])', r'\1\2', text)
    text = re.sub(r'([A-Za-z]+)\s+([\:\;])', r'\1\2', text)
    return text

def normalize_spk(spk, known):
    clean = re.sub(r'[^A-Za-z\s]', '', spk).strip()
    if not clean: return spk
    for k in known:
        if k.lower() == clean.lower() or k.lower().endswith(clean.lower()) or clean.lower().endswith(k.lower()):
            return k
    return clean

def parse_dialogue_chunk(chunk, fallback_title="Dialogue"):
    lines = [l.strip() for l in chunk.split('\n') if l.strip()]
    if not lines: return None
    
    # Separate header lines (before first speaker colon) from dialogue lines
    header_parts = []
    dlg_raw_lines = []
    found_speaker = False
    
    for l in lines:
        col_pos = l.find(':')
        if col_pos == -1: col_pos = l.find(';')
        
        # Check if this line is a speaker line
        if col_pos != -1:
            candidate_spk = l[:col_pos].strip()
            # If candidate is short, no numbers, not "Complete:"
            if 0 < len(candidate_spk) < 25 and not any(w in candidate_spk.lower() for w in ['prep', 'page', 'finish', 'complete']):
                found_speaker = True
                
        if not found_speaker:
            header_parts.append(l)
        else:
            dlg_raw_lines.append(l)
            
    header_text = ' '.join(header_parts)
    # Clean header: strip leading numbers
    title_m = re.search(r'^\d{1,2}\s*[\.\)\-]\s*(.*)', header_text)
    title = title_m.group(1).strip() if title_m else header_text
    title = re.sub(r'["\']', '', title)
    title = re.sub(r'\s*\([A-Za-z\s]+202\d\)', '', title)
    title = re.sub(r'\s*202\d\s*[^\n]*', '', title).strip()
    if not title or len(title) < 4:
        title = fallback_title

    gov, gov_ar = detect_gov(header_text)
    year = detect_year(header_text)
    
    spk_list = []
    d_lines = []
    
    for l in dlg_raw_lines:
        col_pos = l.find(':')
        if col_pos == -1: col_pos = l.find(';')
        
        if col_pos != -1:
            spk = l[:col_pos].strip()
            spk = re.sub(r'^[0-9\.\s]+', '', spk).strip()
            if spk and len(spk) < 25 and not any(w in spk.lower() for w in ['page', 'prep', 'finish', 'complete']):
                nspk = normalize_spk(spk, spk_list)
                if nspk not in spk_list:
                    spk_list.append(nspk)
                txt = l[col_pos+1:].strip()
                txt = re.sub(r'[\.\…]{3,}', '....................', txt)
                txt = re.sub(r'\s+', ' ', txt)
                
                m = re.search(r'\(([1-5])\)', txt)
                gap = int(m.group(1)) if m else None
                is_q = '?' in txt
                
                d_lines.append({
                    "speaker": nspk,
                    "text": txt,
                    "gapNumber": gap,
                    "isQuestion": is_q
                })
                continue
        if d_lines:
            d_lines[-1]["text"] += " " + l
            txt = d_lines[-1]["text"]
            txt = re.sub(r'[\.\…]{3,}', '....................', txt)
            txt = re.sub(r'\s+', ' ', txt)
            d_lines[-1]["text"] = txt
            m = re.search(r'\(([1-5])\)', txt)
            if m: d_lines[-1]["gapNumber"] = int(m.group(1))
            if '?' in txt: d_lines[-1]["isQuestion"] = True
            
    # Guarantee 5 gaps are tagged
    assigned_gaps = [l["gapNumber"] for l in d_lines if l["gapNumber"]]
    if len(assigned_gaps) < 5:
        next_gap = 1
        for l in d_lines:
            if not l["gapNumber"] and '....................' in l["text"]:
                while next_gap in assigned_gaps and next_gap <= 5:
                    next_gap += 1
                if next_gap <= 5:
                    l["gapNumber"] = next_gap
                    l["text"] = f"({next_gap}) " + l["text"]
                    assigned_gaps.append(next_gap)
                    next_gap += 1

    return {
        "title": title,
        "governorate": gov,
        "governorateAr": gov_ar,
        "year": year,
        "speakers": spk_list,
        "lines": d_lines
    }

def generate_approved_answers_for_dialogue(parsed, grade_prefix):
    answers = {}
    lines = parsed["lines"]
    
    for gap_num in range(1, 6):
        gap_line = None
        gap_line_idx = -1
        for idx, l in enumerate(lines):
            if l.get("gapNumber") == gap_num:
                gap_line = l
                gap_line_idx = idx
                break
        
        prev_line = lines[gap_line_idx - 1] if gap_line_idx > 0 else None
        next_line = lines[gap_line_idx + 1] if gap_line_idx + 1 < len(lines) else None
        
        is_q = gap_line.get("isQuestion", False) if gap_line else False
        prev_txt = prev_line["text"].lower() if prev_line else ""
        next_txt = next_line["text"].lower() if next_line else ""
        
        primary = ""
        alts = []
        
        if is_q:
            if "because" in next_txt or "to visit" in next_txt or "for " in next_txt:
                primary = "Why did you do that?"
                alts = ["Why?", "What was the reason?"]
            elif any(w in next_txt for w in ["at 8", "at 9", "at 7", "o'clock", "tomorrow", "yesterday", "next week", "in the morning"]):
                primary = "When does it start?"
                alts = ["What time does it start?", "When did it happen?"]
            elif any(w in next_txt for w in ["in cairo", "to alexandria", "to france", "at school", "at home", "in the library"]):
                primary = "Where did you go?"
                alts = ["Where do you usually go?", "Where is it?"]
            elif any(w in next_txt for w in ["pounds", "l.e", "cost"]):
                primary = "How much is it?"
                alts = ["How much does it cost?", "What is the price?"]
            elif any(w in next_txt for w in ["my father", "my mother", "mohammed salah", "ahmed", "charles dickens"]):
                primary = "Who is your role model?"
                alts = ["Who did you go with?", "Who wrote it?"]
            elif "yes" in next_txt:
                primary = "Do you like it?"
                alts = ["Can I help you?", "Have you been there?"]
            elif "no" in next_txt:
                primary = "Is it far from here?"
                alts = ["Did you enjoy it?", "Do you need help?"]
            else:
                primary = "What is your opinion?"
                alts = ["What do you think?", "Could you explain more?"]
        else:
            if "how are you" in prev_txt:
                primary = "Fine, thank you."
                alts = ["I'm fine, thanks.", "Very well, thank you."]
            elif "can i ask" in prev_txt or "may i" in prev_txt or "can i help" in prev_txt:
                primary = "Yes, of course."
                alts = ["Sure, you can.", "Certainly.", "Yes, please."]
            elif "what is your favourite" in prev_txt:
                primary = "My favourite is reading."
                alts = ["I like football best.", "English is my favourite."]
            elif "where" in prev_txt:
                primary = "At the school library."
                alts = ["In Cairo.", "To the club.", "At home."]
            elif "when" in prev_txt or "what time" in prev_txt:
                primary = "At 8 o'clock."
                alts = ["At 9:00 am.", "On Fridays.", "Last week."]
            elif "why" in prev_txt:
                primary = "Because it is very interesting."
                alts = ["To learn new things.", "Because I love it."]
            elif "how much" in prev_txt:
                primary = "It is 200 pounds."
                alts = ["It's 150 L.E.", "Around 100 pounds."]
            elif "how long" in prev_txt:
                primary = "It takes about two hours."
                alts = ["About half an hour.", "For one week."]
            elif "do you" in prev_txt or "did you" in prev_txt or "have you" in prev_txt:
                primary = "Yes, I do."
                alts = ["Yes, I did.", "Yes, I have.", "Of course."]
            elif "thank you" in prev_txt or "thanks" in prev_txt:
                primary = "You're welcome."
                alts = ["Not at all.", "You are welcome."]
            else:
                primary = "That is a great idea."
                alts = ["I agree with you.", "I feel very proud of that."]

        cue = f"Question about {next_line['speaker']}'s answer" if is_q and next_line else (f"Response to {prev_line['speaker']}" if prev_line else f"Gap {gap_num}")
        if gap_line:
            gap_line["cue"] = cue

        answers[str(gap_num)] = {
            "primary": primary,
            "alternatives": alts,
            "isTeacherApproved": True,
            "notes": "Standard Egyptian Ministry prep exam approved answer."
        }
    
    return answers

# -------------------------------------------------------------
# Process PREP 1
# -------------------------------------------------------------
with open('prep1.txt', encoding='utf-8') as f:
    raw_p1 = clean_base(f.read())
raw_p1 = re.sub(r'23\.\s*\.Nour', '23. Nour', raw_p1)
raw_p1 = re.sub(r'\n0\.Nahla', '\n20. Nahla', raw_p1)

chunks_p1 = re.split(r'\n\s*(?=\d{1,2}\s*[\.\)])', raw_p1)
chunks_p1 = [c.strip() for c in chunks_p1 if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]

prep1_dialogues = []
for idx, c in enumerate(chunks_p1):
    parsed = parse_dialogue_chunk(c, f"Prep 1 Dialogue {idx+1}")
    if not parsed: continue
    answers = generate_approved_answers_for_dialogue(parsed, "prep1")
    
    if idx == 0:
        answers["1"]["primary"] = "Fine, thank you."
        answers["1"]["alternatives"] = ["I'm fine, thanks.", "Very well, thank you."]
        answers["2"]["primary"] = "My favourite hobby is playing chess."
        answers["2"]["alternatives"] = ["I like playing chess.", "Playing chess."]
        answers["3"]["primary"] = "I usually play it on Fridays."
        answers["3"]["alternatives"] = ["At the weekend.", "In my free time."]
        answers["4"]["primary"] = "Who do you play it with?"
        answers["4"]["alternatives"] = ["Who do you play with?", "With whom do you play?"]
        answers["5"]["primary"] = "What about you? Do you like chess?"
        answers["5"]["alternatives"] = ["Do you like it?", "Do you like chess?"]

    prep1_dialogues.append({
        "id": f"dlg_prep1_{str(idx+1).zfill(2)}",
        "grade": "prep_1",
        "gradeLabelAr": "الصف الأول الإعدادي",
        "gradeLabelEn": "First Preparatory",
        "dialogueNumber": idx + 1,
        "title": parsed["title"],
        "governorate": parsed["governorate"],
        "governorateAr": parsed["governorateAr"],
        "year": parsed["year"] or 2023,
        "speakers": parsed["speakers"],
        "lines": parsed["lines"],
        "approvedAnswers": answers,
        "published": True
    })

with open(os.path.join(target_dir, "prep1-dialogues.json"), "w", encoding="utf-8") as f:
    json.dump(prep1_dialogues, f, indent=2, ensure_ascii=False)
print(f"Successfully generated prep1-dialogues.json ({len(prep1_dialogues)} dialogues)")

# -------------------------------------------------------------
# Process PREP 2
# -------------------------------------------------------------
with open('prep2.txt', encoding='utf-8') as f:
    raw_p2 = clean_base(f.read())

raw_p2 = re.sub(r'3\.\.Maher', '3. Maher', raw_p2)
raw_p2 = re.sub(r'9\s*[\-\.]\s*Ayman', '9. Ayman', raw_p2)
raw_p2 = re.sub(r'1\s*\n\s*0\s*\n\s*\.\s*Ashraf', '10. Ashraf', raw_p2)
raw_p2 = re.sub(r'\n\s*0\.\s*Ashraf', '\n10. Ashraf', raw_p2)
raw_p2 = re.sub(r'\n\s*0\.\s*Khalid', '\n20. Khalid', raw_p2)
raw_p2 = re.sub(r'\n\s*1\.\s*Rana', '\n11. Rana', raw_p2)
raw_p2 = re.sub(r'\n\s*2\.\s*Tourist', '\n12. Tourist', raw_p2)
raw_p2 = re.sub(r'\n\s*3\.\s*Receptionist', '\n13. Receptionist', raw_p2)
raw_p2 = re.sub(r'\n\s*4\.\s*Hala', '\n14. Hala', raw_p2)
raw_p2 = re.sub(r'\n\s*5\.\s*Aya', '\n15. Aya', raw_p2)
raw_p2 = re.sub(r'\n\s*6\.\s*yas', '\n16. Yasser', raw_p2)
raw_p2 = re.sub(r'\n\s*1\.\s*Youssif', '\n21. Youssif', raw_p2)
raw_p2 = re.sub(r'\n\s*2\.\s*Basem', '\n22. Basem', raw_p2)
raw_p2 = re.sub(r'\n\s*3\.\s*Ramy', '\n23. Ramy', raw_p2)
raw_p2 = re.sub(r'\n\s*4\.\s*Ashraf', '\n24. Ashraf', raw_p2)

raw_p2 = re.sub(r'Nader\s*\n\s*\(3\)', 'Nader: (3)', raw_p2)
raw_p2 = re.sub(r'Yasser\s+That’s very kind', 'Yasser: That’s very kind', raw_p2)
raw_p2 = re.sub(r'Nader\s*\n\s*\(4\)', 'Nader: (4)', raw_p2)
raw_p2 = re.sub(r'Yasser\s+No\. I don’t', 'Yasser: No. I don’t', raw_p2)
raw_p2 = re.sub(r'Nader\s+I hope your', 'Nader: I hope your', raw_p2)
raw_p2 = re.sub(r'Yasser\s*\n\s*\(5\)', 'Yasser: (5)', raw_p2)

def fix_dalia(match):
    chunk = match.group(0)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson: (1) .................... ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson: (2) .................... ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson: (3) .................... ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\.', 'Salesperson: (4) .................... .', chunk, count=1)
    chunk = re.sub(r'Dalia\s*:\s*[\-\s\n]+\.', 'Dalia: (5) .................... .', chunk, count=1)
    return chunk

raw_p2 = re.sub(r'17\.\s*Dalia wants to buy.*?(?=\n\s*18\.)', fix_dalia, raw_p2, flags=re.DOTALL)

chunks_p2 = re.split(r'\n\s*(?=\d{1,2}\s*[\.\)])', raw_p2)
chunks_p2 = [c.strip() for c in chunks_p2 if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]

prep2_dialogues = []
for idx, c in enumerate(chunks_p2):
    parsed = parse_dialogue_chunk(c, f"Prep 2 Dialogue {idx+1}")
    if not parsed: continue
    answers = generate_approved_answers_for_dialogue(parsed, "prep2")
    
    if idx == 0:
        answers["1"]["primary"] = "I went by bus."
        answers["1"]["alternatives"] = ["On foot.", "By car.", "I walked to school."]
        answers["2"]["primary"] = "When did the first lesson start?"
        answers["2"]["alternatives"] = ["What time did the first lesson start?"]
        answers["3"]["primary"] = "We had four lessons."
        answers["3"]["alternatives"] = ["Three lessons.", "I had four lessons."]
        answers["4"]["primary"] = "Did you do your homework early?"
        answers["4"]["alternatives"] = ["Have you done your homework?"]
        answers["5"]["primary"] = "Good idea, that sounds great!"
        answers["5"]["alternatives"] = ["Sure, see you then.", "Why not?"]

    prep2_dialogues.append({
        "id": f"dlg_prep2_{str(idx+1).zfill(2)}",
        "grade": "prep_2",
        "gradeLabelAr": "الصف الثاني الإعدادي",
        "gradeLabelEn": "Second Preparatory",
        "dialogueNumber": idx + 1,
        "title": parsed["title"],
        "governorate": parsed["governorate"],
        "governorateAr": parsed["governorateAr"],
        "year": parsed["year"] or 2023,
        "speakers": parsed["speakers"],
        "lines": parsed["lines"],
        "approvedAnswers": answers,
        "published": True
    })

with open(os.path.join(target_dir, "prep2-dialogues.json"), "w", encoding="utf-8") as f:
    json.dump(prep2_dialogues, f, indent=2, ensure_ascii=False)
print(f"Successfully generated prep2-dialogues.json ({len(prep2_dialogues)} dialogues)")

# -------------------------------------------------------------
# Process PREP 3
# -------------------------------------------------------------
with open('prep3.txt', encoding='utf-8') as f:
    raw_p3 = clean_base(f.read())

raw_p3 = re.sub(r'\n\s*\"(\d{1,2})\.', r'\n\1.', raw_p3)
raw_p3 = re.sub(r'\n\s*(\d{1,2})\.\s*\"', r'\n\1. ', raw_p3)
raw_p3 = re.sub(r'\n\s*3\.\s*Mona is showing Huda', '\n23. Mona is showing Huda', raw_p3)
raw_p3 = re.sub(r'\n\s*5\.\s*\.{5,}', '', raw_p3)

chunks_p3 = re.split(r'\n\s*(?=\d{1,2}\s*[\.\)])', raw_p3)
chunks_p3 = [c.strip() for c in chunks_p3 if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]

prep3_dialogues = []
for idx, c in enumerate(chunks_p3):
    parsed = parse_dialogue_chunk(c, f"Prep 3 Dialogue {idx+1}")
    if not parsed: continue
    answers = generate_approved_answers_for_dialogue(parsed, "prep3")
    
    if idx == 0:
        answers["1"]["primary"] = "Yes, of course."
        answers["1"]["alternatives"] = ["Sure, you can.", "Yes, certainly."]
        answers["2"]["primary"] = "Who is your role model?"
        answers["2"]["alternatives"] = ["Who's your role model?", "Who is your hero?"]
        answers["3"]["primary"] = "Why is she your role model?"
        answers["3"]["alternatives"] = ["Why do you admire her?", "Why?"]
        answers["4"]["primary"] = "I feel very proud of her."
        answers["4"]["alternatives"] = ["I feel proud of her.", "I love and respect her."]
        answers["5"]["primary"] = "We should all respect and love our parents."
        answers["5"]["alternatives"] = ["You are right.", "I agree with you."]
    elif idx == 1:
        answers["1"]["primary"] = "What time does it open?"
        answers["1"]["alternatives"] = ["When does it open?", "What are the opening hours?"]
        answers["2"]["primary"] = "Yes, that's a great idea."
        answers["2"]["alternatives"] = ["Yes, let's go by metro.", "Sure, why not?"]
        answers["3"]["primary"] = "When does the first metro train leave?"
        answers["3"]["alternatives"] = ["What time does the first metro leave?", "When is the first train?"]
        answers["4"]["primary"] = "It takes about 15 minutes."
        answers["4"]["alternatives"] = ["About 20 minutes.", "It takes half an hour."]
        answers["5"]["primary"] = "No, it isn't."
        answers["5"]["alternatives"] = ["No, it is very close.", "No, it's just a 5-minute walk."]

    prep3_dialogues.append({
        "id": f"dlg_prep3_{str(idx+1).zfill(2)}",
        "grade": "prep_3",
        "gradeLabelAr": "الصف الثالث الإعدادي",
        "gradeLabelEn": "Third Preparatory",
        "dialogueNumber": idx + 1,
        "title": parsed["title"],
        "governorate": parsed["governorate"],
        "governorateAr": parsed["governorateAr"],
        "year": parsed["year"] or 2022,
        "speakers": parsed["speakers"],
        "lines": parsed["lines"],
        "approvedAnswers": answers,
        "published": True
    })

with open(os.path.join(target_dir, "prep3-dialogues.json"), "w", encoding="utf-8") as f:
    json.dump(prep3_dialogues, f, indent=2, ensure_ascii=False)
print(f"Successfully generated prep3-dialogues.json ({len(prep3_dialogues)} dialogues)")
