import re

with open('prep3.txt', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'---\s*PAGE\s*\d+\s*---', '', text)
text = re.sub(r'Professional\s*Prep\s*\d', '', text, flags=re.IGNORECASE)
text = re.sub(r'Professional\s*3rd\s*prep\s*\d', '', text, flags=re.IGNORECASE)
text = re.sub(r'Finish the following dialogue\s*:', '', text, flags=re.IGNORECASE)

wingdings_map = {'\uf08c': '(1)', '\uf08d': '(2)', '\uf08e': '(3)', '\uf08f': '(4)', '\uf090': '(5)'}
for k, v in wingdings_map.items():
    text = text.replace(k, v)

text = re.sub(r'\(\s*([1-5])\s*\)', r'(\1)', text)
text = re.sub(r'\n\s*\"(\d{1,2})\.', r'\n\1.', text)
text = re.sub(r'\n\s*(\d{1,2})\.\s*\"', r'\n\1. ', text)
text = re.sub(r'\n\s*3\.\s*Mona is showing Huda', '\n23. Mona is showing Huda', text)
text = re.sub(r'\n\s*5\.\s*\.{5,}', '', text)

chunks = re.split(r'\n\s*(?=\d{1,2}\s*[\.\)])', text)
chunks = [c.strip() for c in chunks if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]
print(f'Total chunks in Prep 3: {len(chunks)}')
for idx, c in enumerate(chunks):
    first_line = c.split('\n')[0]
    gaps = sorted(list(set(re.findall(r'\(([1-5])\)', c))))
    print(f'{idx+1}: {first_line[:50]} -> gaps: {gaps}')
