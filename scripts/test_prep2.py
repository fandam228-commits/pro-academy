import re

with open('prep2.txt', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'---\s*PAGE\s*\d+\s*---', '', text)
text = re.sub(r'Professional\s*Prep\s*\d', '', text, flags=re.IGNORECASE)
text = re.sub(r'\(\s*([1-5])\s*\)', r'(\1)', text)
text = re.sub(r'Complete the following dialogue\s*:', '', text, flags=re.IGNORECASE)
text = re.sub(r'Finish the following dialogue\s*:', '', text, flags=re.IGNORECASE)

text = re.sub(r'(\d{1,2})\s*\n\s*\.', r'\n\1. ', text)
text = re.sub(r'3\.\.Maher', '3. Maher', text)
text = re.sub(r'\n\s*0\.\s*Ashraf', '\n10. Ashraf', text)
text = re.sub(r'\n\s*0\.\s*Khalid', '\n20. Khalid', text)
text = re.sub(r'\n\s*1\.\s*Rana', '\n11. Rana', text)
text = re.sub(r'\n\s*2\.\s*Tourist', '\n12. Tourist', text)
text = re.sub(r'\n\s*3\.\s*Receptionist', '\n13. Receptionist', text)
text = re.sub(r'\n\s*4\.\s*Hala', '\n14. Hala', text)
text = re.sub(r'\n\s*5\.\s*Aya', '\n15. Aya', text)
text = re.sub(r'\n\s*6\.\s*yas', '\n16. Yasser', text)
text = re.sub(r'\n\s*1\.\s*Youssif', '\n21. Youssif', text)
text = re.sub(r'\n\s*2\.\s*Basem', '\n22. Basem', text)
text = re.sub(r'\n\s*3\.\s*Ramy', '\n23. Ramy', text)
text = re.sub(r'\n\s*4\.\s*Ashraf', '\n24. Ashraf', text)

# Dalia replacement:
def fix_dalia(match):
    chunk = match.group(0)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson : (1) ........................................ ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson : (2) ........................................ ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\?', 'Salesperson : (3) ........................................ ?', chunk, count=1)
    chunk = re.sub(r'Salesperson\s*:\s*[\-\s\n]+\.', 'Salesperson : (4) ........................................ .', chunk, count=1)
    chunk = re.sub(r'Dalia\s*:\s*[\-\s\n]+\.', 'Dalia : (5) ........................................ .', chunk, count=1)
    return chunk

text = re.sub(r'17\.\s*Dalia wants to buy.*?(?=\n\s*18\.)', fix_dalia, text, flags=re.DOTALL)

chunks = re.split(r'\n\s*(?=\d{1,2}\s*[\.\)])', text)
chunks = [c.strip() for c in chunks if c.strip() and re.match(r'^\d{1,2}\s*[\.\)]', c.strip())]
print(f'Total chunks in Prep 2: {len(chunks)}')
for idx, c in enumerate(chunks):
    first_line = c.split('\n')[0]
    gaps = sorted(list(set(re.findall(r'\(([1-5])\)', c))))
    print(f'{idx+1}: {first_line[:50]} -> gaps: {gaps}')
