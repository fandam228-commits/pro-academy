import json
import re

data = json.load(open('src/data/training-center-extracted-questions.json', encoding='utf-8'))

truncated = []
glued_numbers = []
glued_words = []
broken_quotes = []

for q in data:
    stem = q.get('questionText', '').strip()
    qid = q.get('id')
    
    # 1. Truncated stem start (starts with lowercase or short prepositional fragment)
    if re.match(r'^[a-z]', stem):
        truncated.append((qid, stem))
    elif re.match(r'^(him|her|them|me|us)\b', stem, re.IGNORECASE):
        truncated.append((qid, stem))
    elif re.match(r'^(been|done|gone|seen|taken)\b', stem, re.IGNORECASE):
        truncated.append((qid, stem))
        
    # 2. Glued question numbers like '11. ', '12. ', '... ? 13.'
    if re.search(r'\b\d{1,2}\.\s+[A-Z]', stem):
        glued_numbers.append((qid, stem))

    # 3. Broken quote artifacts like '“ ', '” “', '”' at start
    if stem.startswith('”') or stem.startswith('” “') or stem.startswith('’'):
        broken_quotes.append((qid, stem))

    # 4. Glued words like 'theswimming', 'Where’syour', etc.
    if re.search(r'[a-zA-Z]{3,}[’\'](?:s|re|ve|ll|d)[a-zA-Z]{3,}', stem):
        glued_words.append((qid, stem))

print(f"Truncated fragments: {len(truncated)}")
for qid, s in truncated[:15]:
    print(f"  {qid}: {s[:60]}")

print(f"\nGlued numbers from adjacent questions: {len(glued_numbers)}")
for qid, s in glued_numbers[:15]:
    print(f"  {qid}: {s[:60]}")

print(f"\nBroken quotes at start: {len(broken_quotes)}")
for qid, s in broken_quotes[:15]:
    print(f"  {qid}: {s[:60]}")

print(f"\nGlued contraction words (e.g. Where’syour): {len(glued_words)}")
for qid, s in glued_words[:15]:
    print(f"  {qid}: {s[:60]}")
