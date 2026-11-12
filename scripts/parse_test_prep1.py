import re
import json

with open('prep1.txt', encoding='utf-8') as f:
    text = f.read()

# Normalization
text = re.sub(r'---\s*PAGE\s*\d+\s*---', '', text)
text = re.sub(r'Professional\s*Prep\s*\d', '', text, flags=re.IGNORECASE)
text = re.sub(r'\(\s*([1-5])\s*\)', r'(\1)', text)
text = re.sub(r'Finish the following dialogue\s*:', '', text, flags=re.IGNORECASE)
text = re.sub(r'23\.\s*\.Nour', '23. Nour', text)
text = re.sub(r'\n0\.Nahla', '\n20. Nahla', text)

chunks = re.split(r'\n(?=\d{1,2}\s*[\.\)])', text)
chunks = [c.strip() for c in chunks if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]

print("Total chunks in Prep 1:", len(chunks))

def parse_lines(chunk):
    lines_raw = chunk.split('\n')
    header = lines_raw[0].strip()
    
    # Extract title
    title_match = re.search(r'^\d{1,2}\s*[\.\)]\s*(.*)', header)
    title = title_match.group(1).strip() if title_match else header
    
    # Lines parsing
    body = '\n'.join(lines_raw[1:])
    # Split by speaker pattern: e.g. "Hany :" or "Ali :"
    raw_turns = re.split(r'\n(?=[A-Za-z0-9\s]+[\:\;])', '\n' + body)
    dialogue_lines = []
    speakers = []
    
    for turn in raw_turns:
        turn = turn.strip()
        if not turn:
            continue
        col_pos = turn.find(':')
        if col_pos == -1:
            col_pos = turn.find(';')
        if col_pos != -1:
            spk = turn[:col_pos].strip()
            # clean speaker
            spk = re.sub(r'^[0-9\.\s]+', '', spk).strip()
            if spk and len(spk) < 30 and not any(w in spk.lower() for w in ['page', 'prep']):
                if spk not in speakers:
                    speakers.append(spk)
                txt = turn[col_pos+1:].strip()
                # Clean multiple dots/whitespace
                txt = re.sub(r'[\.\…]{3,}', '....................', txt)
                txt = re.sub(r'\s+', ' ', txt)
                
                # Check gap
                m = re.search(r'\(([1-5])\)', txt)
                gap_num = int(m.group(1)) if m else None
                is_q = '?' in txt
                
                dialogue_lines.append({
                    "speaker": spk,
                    "text": txt,
                    "gapNumber": gap_num,
                    "isQuestion": is_q
                })
        else:
            if dialogue_lines:
                dialogue_lines[-1]["text"] += " " + turn

    return title, speakers, dialogue_lines

for idx, c in enumerate(chunks[:5]):
    title, speakers, d_lines = parse_lines(c)
    print(f"\n--- DIALOGUE {idx+1}: {title} ---")
    print(f"Speakers: {speakers}")
    for l in d_lines:
        print(f"  {l['speaker']}: {l['text']} (Gap: {l['gapNumber']}, Q: {l['isQuestion']})")
