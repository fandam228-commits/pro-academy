import glob
import json
import random

story_files = glob.glob(r"C:\Users\fanda\Documents\pro-academy\src\data\story-world\*.json")

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

# First collect all MCQs to know total and distribute across all stories
all_mcqs = []
for sf in story_files:
    with open(sf, "r", encoding="utf-8") as f:
        data = json.load(f)
    stories = data if isinstance(data, list) else [data]
    for s in stories:
        for ch in s.get("chapters", []):
            for q in ch.get("mcqQuestions", []):
                all_mcqs.append(q)

total_mcqs = len(all_mcqs)
print(f"Total Story World MCQs: {total_mcqs}")
targets = generate_balanced_targets(total_mcqs, max_consecutive=2, seed=777)

# Now apply targets sequentially
target_counter = 0
global_pos = {0: 0, 1: 0, 2: 0, 3: 0}

for sf in story_files:
    with open(sf, "r", encoding="utf-8") as f:
        data = json.load(f)
    stories = data if isinstance(data, list) else [data]
    for s in stories:
        for ch in s.get("chapters", []):
            for q in ch.get("mcqQuestions", []):
                target_idx = targets[target_counter]
                target_counter += 1
                
                opts = q.get("options", [])
                ca = q.get("correctAnswer")
                assert len(opts) == 4, f"Story question has {len(opts)} options: {q.get('question')}"
                assert ca in opts, f"Correct answer {ca} not in options: {opts}"
                
                distractors = [o for o in opts if o != ca]
                rng_d = random.Random(target_counter * 31)
                rng_d.shuffle(distractors)
                
                new_opts = [None] * 4
                new_opts[target_idx] = ca
                d_i = 0
                for i in range(4):
                    if new_opts[i] is None:
                        new_opts[i] = distractors[d_i]
                        d_i += 1
                
                assert len(new_opts) == 4
                assert new_opts[target_idx] == ca
                assert set(new_opts) == set(opts)
                
                q["options"] = new_opts
                global_pos[target_idx] += 1

    with open(sf, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully rebalanced all Story World MCQs! Position distribution: {global_pos}")
