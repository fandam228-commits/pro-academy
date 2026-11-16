import json
import re

fpath = r"C:\Users\fanda\Documents\pro-academy\src\data\grammar-summaries-and-questions.ts"
with open(fpath, "r", encoding="utf-8") as f:
    text = f.read()

match = re.search(r"export const grammarPackages\s*:\s*Record<string,\s*GrammarTopicPackage>\s*=\s*(\{.*?\n\s*\});\n", text, re.DOTALL)
if match:
    data_str = match.group(1)
    data = json.loads(data_str)
    print(f"Loaded grammarPackages! Topics: {len(data)}")
    total_qs = 0
    opt_lens = {}
    pos_dist = {0: 0, 1: 0, 2: 0, 3: 0, "not_found": 0}
    for topic_id, topic in data.items():
        qs = topic.get("questions", [])
        total_qs += len(qs)
        for q in qs:
            opts = q.get("options", [])
            opt_lens[len(opts)] = opt_lens.get(len(opts), 0) + 1
            ca = q.get("correctAnswer", "")
            try:
                idx = opts.index(ca)
                pos_dist[idx] = pos_dist.get(idx, 0) + 1
            except ValueError:
                pos_dist["not_found"] += 1
    print(f"Total questions: {total_qs}")
    print(f"Option counts: {opt_lens}")
    print(f"Correct answer position distribution: {pos_dist}")
else:
    # let's find start and end
    start = text.find("export const grammarPackages: Record<string, GrammarTopicPackage> = {")
    end = text.find("export const getGrammarPackage =")
    if start != -1 and end != -1:
        json_part = text[start + len("export const grammarPackages: Record<string, GrammarTopicPackage> = "):end].strip()
        if json_part.endswith(";"):
            json_part = json_part[:-1].strip()
        data = json.loads(json_part)
        print(f"Loaded grammarPackages via substring! Topics: {len(data)}")
        total_qs = 0
        opt_lens = {}
        pos_dist = {0: 0, 1: 0, 2: 0, 3: 0, "not_found": 0}
        for topic_id, topic in data.items():
            qs = topic.get("questions", [])
            total_qs += len(qs)
            for q in qs:
                opts = q.get("options", [])
                opt_lens[len(opts)] = opt_lens.get(len(opts), 0) + 1
                ca = q.get("correctAnswer", "")
                try:
                    idx = opts.index(ca)
                    pos_dist[idx] = pos_dist.get(idx, 0) + 1
                except ValueError:
                    pos_dist["not_found"] += 1
        print(f"Total questions: {total_qs}")
        print(f"Option counts: {opt_lens}")
        print(f"Correct answer position distribution: {pos_dist}")
