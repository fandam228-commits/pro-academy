import re
import json
import os

target_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'dialogue-center')
os.makedirs(target_dir, exist_ok=True)

# Helper for governorate mapping
GOV_MAP = {
    "cairo": ("Cairo", "القاهرة"),
    "giza": ("Giza", "الجيزة"),
    "alexandria": ("Alexandria", "الإسكندرية"),
    "alex": ("Alexandria", "الإسكندرية"),
    "dakahlia": ("Dakahlia", "الدقهلية"),
    "sharkia": ("Sharkia", "الشرقية"),
    "gharbia": ("Gharbia", "الغربية"),
    "monufia": ("Monufia", "المنوفية"),
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
    "new valley": ("New Valley", "الوادي الجديد"),
    "north sinai": ("North Sinai", "شمال سيناء"),
    "south sinai": ("South Sinai", "جنوب سيناء")
}

def detect_gov_and_year(header_text):
    gov = None
    gov_ar = None
    year = None

    y_match = re.search(r'\b(202[0-9])\b', header_text)
    if y_match:
        year = int(y_match.group(1))

    low = header_text.lower()
    for k, (en, ar) in GOV_MAP.items():
        if k in low:
            gov = en
            gov_ar = ar
            break
    
    if not gov:
        # Arabic gov names
        if 'القاهرة' in header_text or 'اﻟﻘﺎھرة' in header_text:
            gov = "Cairo"
            gov_ar = "القاهرة"
        elif 'الجيزة' in header_text or 'اﻟﺟﯾزة' in header_text:
            gov = "Giza"
            gov_ar = "الجيزة"
        elif 'الإسكندرية' in header_text:
            gov = "Alexandria"
            gov_ar = "الإسكندرية"
        elif 'الشرقية' in header_text:
            gov = "Sharkia"
            gov_ar = "الشرقية"
        elif 'الغربية' in header_text:
            gov = "Gharbia"
            gov_ar = "الغربية"
        elif 'البحيرة' in header_text:
            gov = "Beheira"
            gov_ar = "البحيرة"

    return gov, gov_ar, year

def parse_dialogue_chunk(chunk, grade, dlg_idx):
    lines_raw = chunk.split('\n')
    header = lines_raw[0].strip()
    
    # Clean header: strip leading number e.g. "1. Two students..." -> "Two students..."
    title_match = re.search(r'^\d{1,2}\s*[\.\)]\s*(.*)', header)
    title = title_match.group(1).strip() if title_match else header
    # Clean trailing quotes or gov tags
    title = re.sub(r'["\']', '', title)
    title = re.sub(r'\s*\([A-Za-z\s]+202\d\)', '', title)
    title = re.sub(r'\s*202\d\s*[^\n]*', '', title).strip()

    gov, gov_ar, year = detect_gov_and_year(header)

    # Process remaining lines
    dialogue_lines = []
    speakers_set = []

    current_speaker = None
    current_text = ""

    # Join lines and look for "Speaker : text"
    body_text = '\n'.join(lines_raw[1:])
    # Normalize colons e.g. "Hana :" or "Hana:" or "Hana ;"
    line_matches = re.split(r'\n(?=[A-Za-z0-9\s]+[\:\;])', '\n' + body_text)

    for item in line_matches:
        item = item.strip()
        if not item:
            continue
        col_idx = -1
        for sep in [':', ';']:
            pos = item.find(sep)
            if pos != -1 and (col_idx == -1 or pos < col_idx):
                col_idx = pos
        
        if col_idx != -1:
            spk = item[:col_idx].strip()
            # Clean speaker name: remove numbers or stray punctuation
            spk = re.sub(r'^[0-9\.\s]+', '', spk).strip()
            if spk and len(spk) < 30 and not any(w in spk.lower() for w in ['page', 'prep', 'finish', 'complete']):
                if spk not in speakers_set:
                    speakers_set.append(spk)
                txt = item[col_idx+1:].strip()
                # Clean dots/underscores
                txt = re.sub(r'\s+', ' ', txt)
                
                # Check for gap
                gap_match = re.search(r'\(([1-5])\)', txt)
                gap_num = int(gap_match.group(1)) if gap_match else None
                is_q = '?' in txt

                dialogue_lines.append({
                    "speaker": spk,
                    "text": txt,
                    "gapNumber": gap_num,
                    "isQuestion": is_q
                })
        else:
            # Continuation of previous line or stray note
            if dialogue_lines:
                dialogue_lines[-1]["text"] += " " + item

    # Clean lines text and gaps
    final_lines = []
    for dl in dialogue_lines:
        txt = dl["text"].strip()
        gap = dl.get("gapNumber")
        is_q = dl.get("isQuestion", False)
        
        # Check gap again
        m = re.search(r'\(([1-5])\)', txt)
        if m:
            gap = int(m.group(1))
            is_q = '?' in txt
        
        final_lines.append({
            "speaker": dl["speaker"],
            "text": txt,
            "gapNumber": gap,
            "isQuestion": is_q
        })

    return {
        "title": title,
        "governorate": gov,
        "governorateAr": gov_ar,
        "year": year,
        "speakers": speakers_set,
        "lines": final_lines
    }

print("Helper defined successfully.")
