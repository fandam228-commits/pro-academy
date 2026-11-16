import re

fpath = r"C:\Users\fanda\Documents\pro-academy\src\data\grammar-summaries-and-questions.ts"
with open(fpath, "r", encoding="utf-8") as f:
    text = f.read()

# find all questions in grammar-summaries-and-questions.ts
blocks = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"questionText":\s*"([^"]+)",\s*"options":\s*\[(.*?)\]\s*,\s*"correctOptionIndex":\s*(\d+)', text, re.DOTALL)
print(f"Total grammar questions matched: {len(blocks)}")
counts = {}
ans_dist = {}
for qid, qtext, opts_str, cor_idx in blocks:
    opts = [o.strip(' "\n\r') for o in opts_str.split(",") if o.strip(' "\n\r')]
    counts[len(opts)] = counts.get(len(opts), 0) + 1
    ans_dist[cor_idx] = ans_dist.get(cor_idx, 0) + 1

print("Grammar questions option counts:", counts)
print("Grammar questions answer index dist:", ans_dist)
