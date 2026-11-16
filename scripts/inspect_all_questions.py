import json
import os
import re

project_root = r"C:\Users\fanda\Documents\pro-academy"

def inspect_training_center():
    fpath = os.path.join(project_root, "src", "data", "training-center-extracted-questions.json")
    if not os.path.exists(fpath):
        print("training-center-extracted-questions.json not found")
        return
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n==================== Training Center Questions ({len(data)}) ====================")
    option_counts = {}
    answer_dist = {}
    bad_option_count_qs = []
    for q in data:
        opts = q.get("options", [])
        cnt = len(opts)
        option_counts[cnt] = option_counts.get(cnt, 0) + 1
        ans = q.get("correctAnswer", "")
        answer_dist[ans] = answer_dist.get(ans, 0) + 1
        if cnt != 4:
            bad_option_count_qs.append((q.get("id"), q.get("questionText", "")[:60], cnt, opts))
            
    print("Option counts distribution:", option_counts)
    print("Answer distribution (sample 10 keys):", list(answer_dist.items())[:10])
    print(f"Questions with != 4 options: {len(bad_option_count_qs)}")
    for item in bad_option_count_qs[:5]:
        print(f"  ID {item[0]}: count={item[2]} | {item[1]}")

def inspect_story_world():
    print(f"\n==================== Story World Questions ====================")
    sw_dir = os.path.join(project_root, "src", "data", "story-world")
    for f in os.listdir(sw_dir):
        if not f.endswith(".json"):
            continue
        with open(os.path.join(sw_dir, f), "r", encoding="utf-8") as fl:
            data = json.load(fl)
        stories = data if isinstance(data, list) else [data]
        for s in stories:
            total_mcqs = 0
            mcq_opt_counts = {}
            for ch in s.get("chapters", []):
                mcqs = ch.get("mcqQuestions", [])
                total_mcqs += len(mcqs)
                for q in mcqs:
                    opts = q.get("options", [])
                    cnt = len(opts)
                    mcq_opt_counts[cnt] = mcq_opt_counts.get(cnt, 0) + 1
            print(f"Story {s.get('id')} ({s.get('titleEn')}): {total_mcqs} mcqs, option counts: {mcq_opt_counts}")

def inspect_dialogues():
    print(f"\n==================== Dialogue Center ====================")
    dc_dir = os.path.join(project_root, "src", "data", "dialogue-center")
    if os.path.exists(dc_dir):
        for f in os.listdir(dc_dir):
            if f.endswith(".json"):
                with open(os.path.join(dc_dir, f), "r", encoding="utf-8") as fl:
                    data = json.load(fl)
                dialogues = data.get("dialogues", []) if isinstance(data, dict) else data
                print(f"File {f}: {len(dialogues)} dialogues")
                if dialogues:
                    sample = dialogues[0]
                    print("  Sample dialogue keys:", list(sample.keys()))
                    if "exchanges" in sample:
                        print("  Sample exchanges count:", len(sample["exchanges"]))
                    if "questions" in sample:
                        print("  Sample questions count:", len(sample["questions"]))

inspect_training_center()
inspect_story_world()
inspect_dialogues()
