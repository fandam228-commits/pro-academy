import json
import re

INPUT_FILE = "src/data/secondary-2027/sec2-bac-amaliqa-mcq-extracted.json"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    qs = json.load(f)

clean_qs = []
for q in qs:
    opts = q["options"]
    corr = q["correctAnswer"]
    stem = q["questionText"].strip()
    
    # Validation checks
    if len(opts) != 4 or len(set(opts)) != 4:
        continue
    if corr not in opts:
        continue
    if any(re.match(r'^\d+[\.\)]', o) for o in opts):
        continue
    if any(len(o.strip()) < 2 for o in opts):
        continue
    if any(o.strip().lower() in ["a", "b", "c", "d", "a.", "b.", "c.", "d."] for o in opts):
        continue
    if len(stem) < 15:
        continue
        
    clean_qs.append(q)

print(f"Cleaned El-Amaliqa questions: {len(clean_qs)} pristine questions retained out of {len(qs)}")

# Re-index IDs cleanly
for idx, q in enumerate(clean_qs):
    q["id"] = f"qb_2027_sec2_amaliqa_mcq_{idx+1:03d}"

with open(INPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(clean_qs, f, ensure_ascii=False, indent=2)

print(f"Saved pristine dataset to {INPUT_FILE}")
