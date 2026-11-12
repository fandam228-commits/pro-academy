import re
import json
import os

target_dir = os.path.join(r"C:\Users\fanda\Documents\pro-academy\src\data\dialogue-center")
os.makedirs(target_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. LOAD PREP 3 REVISION (Already 100% verified)
# -------------------------------------------------------------
print("Checking Prep 3 revision files...")
rev_strategy_path = os.path.join(target_dir, "prep3-revision-strategy.json")
rev_dlg_path = os.path.join(target_dir, "prep3-revision-dialogues.json")
if os.path.exists(rev_strategy_path) and os.path.exists(rev_dlg_path):
    print("Prep 3 revision strategy and dialogues are already present.")
else:
    print("Warning: revision files missing, will seed.")

# -------------------------------------------------------------
# 2. PARSE AND ASSEMBLE ALL PREPARATORY DIALOGUES
# -------------------------------------------------------------

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
        return "", "", [], []
    
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
    
    return title, header, speakers, dialogue_lines

print("Parser engine compiled.")
