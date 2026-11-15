import re
import json
import os

target_dir = os.path.join(r"C:\Users\fanda\Documents\pro-academy\src\data\dialogue-center")
os.makedirs(target_dir, exist_ok=True)

GOV_MAP = {
    "cairo": ("Cairo", "القاهرة"),
    "giza": ("Giza", "الجيزة"),
    "alexandria": ("Alexandria", "الإسكندرية"),
    "alex": ("Alexandria", "الإسكندرية"),
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
    "new valley": ("New Valley", "الوادي الجديد"),
    "north sinai": ("North Sinai", "شمال سيناء"),
    "south sinai": ("South Sinai", "جنوب سيناء"),
    "kafr el-sheikh": ("Kafr El-Sheikh", "كفر الشيخ")
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

def clean_base_text(text):
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

def normalize_speaker(spk, known_speakers):
    spk_clean = re.sub(r'[^A-Za-z\s]', '', spk).strip()
    if not spk_clean:
        return spk
    for k in known_speakers:
        if k.lower() == spk_clean.lower() or k.lower().endswith(spk_clean.lower()) or spk_clean.lower().endswith(k.lower()):
            return k
    return spk_clean

def parse_chunk_into_lines(chunk):
    raw_lines = [l.strip() for l in chunk.split('\n') if l.strip()]
    if not raw_lines:
        return "", [], []
    
    header = raw_lines[0]
    title_m = re.search(r'^\d{1,2}\s*[\.\)\-]\s*(.*)', header)
    title = title_m.group(1).strip() if title_m else header
    title = re.sub(r'["\']', '', title)
    title = re.sub(r'\s*\([A-Za-z\s]+202\d\)', '', title)
    title = re.sub(r'\s*202\d\s*[^\n]*', '', title).strip()
    
    body_lines = raw_lines[1:]
    dialogue_lines = []
    speakers = []
    
    for l in body_lines:
        col_pos = l.find(':')
        if col_pos == -1:
            col_pos = l.find(';')
        
        if col_pos != -1:
            spk = l[:col_pos].strip()
            spk = re.sub(r'^[0-9\.\s]+', '', spk).strip()
            if spk and len(spk) < 25 and not any(w in spk.lower() for w in ['page', 'prep', 'finish', 'complete']):
                norm_spk = normalize_speaker(spk, speakers)
                if norm_spk not in speakers:
                    speakers.append(norm_spk)
                txt = l[col_pos+1:].strip()
                txt = re.sub(r'[\.\…]{3,}', '....................', txt)
                txt = re.sub(r'\s+', ' ', txt)
                
                m = re.search(r'\(([1-5])\)', txt)
                gap = int(m.group(1)) if m else None
                is_q = '?' in txt
                
                dialogue_lines.append({
                    "speaker": norm_spk,
                    "text": txt,
                    "gapNumber": gap,
                    "isQuestion": is_q
                })
                continue
        
        # Continuation line
        if dialogue_lines:
            dialogue_lines[-1]["text"] += " " + l
            txt = dialogue_lines[-1]["text"]
            txt = re.sub(r'[\.\…]{3,}', '....................', txt)
            txt = re.sub(r'\s+', ' ', txt)
            dialogue_lines[-1]["text"] = txt
            m = re.search(r'\(([1-5])\)', txt)
            if m:
                dialogue_lines[-1]["gapNumber"] = int(m.group(1))
            if '?' in txt:
                dialogue_lines[-1]["isQuestion"] = True
    
    # Second pass: ensure exactly gaps 1 to 5 are ordered and cues generated
    # Also fix any missing gap numbers if sequential
    return title, header, speakers, dialogue_lines

print("Core parser ready.")
