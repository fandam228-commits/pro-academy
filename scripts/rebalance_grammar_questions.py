import json
import random
import re

fpath = r"C:\Users\fanda\Documents\pro-academy\src\data\grammar-summaries-and-questions.ts"
with open(fpath, "r", encoding="utf-8") as f:
    text = f.read()

start_kw = "export const grammarPackages: Record<string, GrammarTopicPackage> = "
start = text.find(start_kw)
end = text.find("export const getGrammarPackage =")
prefix = text[:start + len(start_kw)]
suffix = text[end:]

middle = text[start + len(start_kw):end].strip()
if middle.endswith(";"):
    middle = middle[:-1].strip()

data = json.loads(middle)

def generate_balanced_targets(total, max_consecutive=2, seed=42):
    rng = random.Random(seed)
    base = total // 4
    rem = total % 4
    counts = [base] * 4
    for i in range(rem):
        counts[i] += 1
    items = []
    for idx, c in enumerate(counts):
        items.extend([idx] * c)
    for _ in range(5000):
        rng.shuffle(items)
        ok = True
        consec = 1
        for i in range(1, len(items)):
            if items[i] == items[i-1]:
                consec += 1
                if consec > max_consecutive:
                    ok = False
                    break
            else:
                consec = 1
        if ok:
            return items
    return items

global_pos_counts = {0: 0, 1: 0, 2: 0, 3: 0}
pkg_idx = 0
for topic_id, pkg in data.items():
    pkg_idx += 1
    qs = pkg.get("questions", [])
    targets = generate_balanced_targets(len(qs), max_consecutive=2, seed=1000 + pkg_idx * 73)
    for q, target_idx in zip(qs, targets):
        opts = q.get("options", [])
        ca = q.get("correctAnswer")
        assert len(opts) == 4, f"Expected 4 options in {q['id']}, found {len(opts)}"
        assert ca in opts, f"Correct answer {ca} not in options of {q['id']}"
        # remove correct answer from distractor pool
        distractors = [o for o in opts if o != ca]
        rng_inner = random.Random(abs(hash(q["id"])) % 10000)
        rng_inner.shuffle(distractors)
        
        # build new 4 options with ca at target_idx
        new_opts = [None] * 4
        new_opts[target_idx] = ca
        d_idx = 0
        for i in range(4):
            if new_opts[i] is None:
                new_opts[i] = distractors[d_idx]
                d_idx += 1
        
        assert len(new_opts) == 4
        assert new_opts[target_idx] == ca
        assert set(new_opts) == set(opts)
        
        q["options"] = new_opts
        global_pos_counts[target_idx] += 1

print("Rebalanced Grammar Questions! Global position distribution:", global_pos_counts)

new_json = json.dumps(data, indent=2, ensure_ascii=False)
new_content = prefix + new_json + ";\n\n" + suffix
with open(fpath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated grammar-summaries-and-questions.ts successfully!")
