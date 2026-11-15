import re
import json

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
    for k in known_speakers:
        if k.lower() == spk.lower() or k.lower().endswith(spk.lower()) or spk.lower().endswith(k.lower()):
            return k
    return spk

def parse_chunk_into_lines(chunk):
    raw_lines = [l.strip() for l in chunk.split('\n') if l.strip()]
    if not raw_lines:
        return "", [], []
    
    header = raw_lines[0]
    title_m = re.search(r'^\d{1,2}\s*[\.\)\-]\s*(.*)', header)
    title = title_m.group(1).strip() if title_m else header
    
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
    
    return title, speakers, dialogue_lines

# Test Prep 2
with open('prep2.txt', encoding='utf-8') as f:
    p2 = clean_base_text(f.read())

p2 = re.sub(r'3\.\.Maher', '3. Maher', p2)
p2 = re.sub(r'9\s*[\-\.]\s*Ayman', '9. Ayman', p2)
p2 = re.sub(r'1\s*\n\s*0\s*\n\s*\.\s*Ashraf', '10. Ashraf', p2)
p2 = re.sub(r'\n\s*0\.\s*Ashraf', '\n10. Ashraf', p2)
p2 = re.sub(r'\n\s*0\.\s*Khalid', '\n20. Khalid', p2)
p2 = re.sub(r'\n\s*1\.\s*Rana', '\n11. Rana', p2)
p2 = re.sub(r'\n\s*2\.\s*Tourist', '\n12. Tourist', p2)
p2 = re.sub(r'\n\s*3\.\s*Receptionist', '\n13. Receptionist', p2)
p2 = re.sub(r'\n\s*4\.\s*Hala', '\n14. Hala', p2)
p2 = re.sub(r'\n\s*5\.\s*Aya', '\n15. Aya', p2)
p2 = re.sub(r'\n\s*6\.\s*yas', '\n16. Yasser', p2)
p2 = re.sub(r'\n\s*1\.\s*Youssif', '\n21. Youssif', p2)
p2 = re.sub(r'\n\s*2\.\s*Basem', '\n22. Basem', p2)
p2 = re.sub(r'\n\s*3\.\s*Ramy', '\n23. Ramy', p2)
p2 = re.sub(r'\n\s*4\.\s*Ashraf', '\n24. Ashraf', p2)

# Fix Dialogue 6 missing colons
p2 = re.sub(r'Nader\s*\n\s*\(3\)', 'Nader: (3)', p2)
p2 = re.sub(r'Yasser\s+That’s very kind', 'Yasser: That’s very kind', p2)
p2 = re.sub(r'Nader\s*\n\s*\(4\)', 'Nader: (4)', p2)
p2 = re.sub(r'Yasser\s+No\. I don’t', 'Yasser: No. I don’t', p2)
p2 = re.sub(r'Nader\s+I hope your', 'Nader: I hope your', p2)
p2 = re.sub(r'Yasser\s*\n\s*\(5\)', 'Yasser: (5)', p2)

# Fix Dialogue 8 duplicate (2)
d8_m = re.search(r'8\.Nada is asking Ola.*?(?=9\.Ayman)', p2, re.DOTALL)
if d8_m:
    d8_orig = d8_m.group(0)
    d8_fixed = d8_orig.replace('Nada : (2).............................................................................................?', 'Nada : (2) ........................................ ?')
    # replace second (2) with (3)
    d8_fixed = re.sub(r'Nada\s*\:\s*\(2\).*?\?', 'Nada : (3) ........................................ ?', d8_fixed, count=1)
    p2 = p2.replace(d8_orig, d8_fixed)

def fix_dalia(match):
    chunk = match.group(0)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson: (1) .................... ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson: (2) .................... ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson: (3) .................... ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\.', 'Salesperson: (4) .................... .', chunk, count=1)
    chunk = re.sub(r'Dalia\s*:\s*[\-\s\n]+\.', 'Dalia: (5) .................... .', chunk, count=1)
    return chunk

p2 = re.sub(r'17\.\s*Dalia wants to buy.*?(?=\n\s*18\.)', fix_dalia, p2, flags=re.DOTALL)

chunks2 = re.split(r'\n\s*(?=\d{1,2}\s*[\.\)])', p2)
chunks2 = [c.strip() for c in chunks2 if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]

print(f"\nParsed {len(chunks2)} Prep 2 dialogues:")
for idx, c in enumerate(chunks2):
    title, spk, lines = parse_chunk_into_lines(c)
    gaps = [l["gapNumber"] for l in lines if l["gapNumber"]]
    print(f"  #{idx+1}: {title[:40]} | Spk: {spk} | Gaps found: {gaps}")
