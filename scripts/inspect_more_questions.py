import json
import os
import re

project_root = r"C:\Users\fanda\Documents\pro-academy"

def inspect_translation_questions():
    fpath = os.path.join(project_root, "src", "data", "translation-questions-complete.json")
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"\n==================== Translation Questions ({len(data)}) ====================")
        opt_counts = {}
        for q in data:
            opts = q.get("options", [])
            opt_counts[len(opts)] = opt_counts.get(len(opts), 0) + 1
        print("Translation question option counts:", opt_counts)
        sample = data[0] if data else {}
        print("Sample translation question:", {k: sample[k] for k in ["id", "questionType", "options", "correctAnswer"] if k in sample})

def inspect_grammar_questions():
    fpath = os.path.join(project_root, "src", "data", "grammar-summaries-and-questions.ts")
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        print(f"\n==================== Grammar Summaries & Questions ({len(content)} bytes) ====================")
        # Search for questions / options in the ts file
        q_matches = re.findall(r"options\s*:\s*\[(.*?)\]", content, re.DOTALL)
        print(f"Total options arrays in grammar file: {len(q_matches)}")
        lens = [len(m.split(",")) for m in q_matches]
        from collections import Counter
        print("Grammar question option counts:", Counter(lens))

def inspect_story_world_deep():
    print(f"\n==================== Story World All Questions Deep ====================")
    sw_dir = os.path.join(project_root, "src", "data", "story-world")
    for f in os.listdir(sw_dir):
        if not f.endswith(".json"):
            continue
        with open(os.path.join(sw_dir, f), "r", encoding="utf-8") as fl:
            data = json.load(fl)
        stories = data if isinstance(data, list) else [data]
        for s in stories:
            for ch in s.get("chapters", []):
                for q_key in ["questionsAndAnswers", "importantQuestions", "homeworkQuestions", "mcqQuestions"]:
                    qs = ch.get(q_key, [])
                    if qs:
                        has_opts = any("options" in q for q in qs)
                        sample = qs[0]
                        print(f"Story {s.get('id')} Ch {ch.get('chapterNumber')} {q_key}: {len(qs)} items, hasOptions={has_opts}")
                        if has_opts:
                            opt_lens = [len(q.get("options", [])) for q in qs if "options" in q]
                            print(f"    Options count dist: {set(opt_lens)}")

inspect_translation_questions()
inspect_grammar_questions()
inspect_story_world_deep()
