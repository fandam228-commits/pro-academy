import os
import re

project_root = r"C:\Users\fanda\Documents\pro-academy"

def check_smart_curriculum():
    fpath = os.path.join(project_root, "src", "data", "smart-curriculum-seed.ts")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # search for questions in smart-curriculum-seed
    matches = re.findall(r"\{\s*id:\s*[\"'](.*?)[\"'].*?options:\s*\[(.*?)\]", content, re.DOTALL)
    print(f"smart-curriculum-seed matches: {len(matches)}")
    for m in matches[:10]:
        opts = [o.strip() for o in m[1].split(",") if o.strip()]
        print(f"  ID: {m[0]}, options count: {len(opts)}, options: {opts[:4]}")

def check_grammar_summaries():
    fpath = os.path.join(project_root, "src", "data", "grammar-summaries-and-questions.ts")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    matches = re.findall(r"\{\s*id:\s*[\"'](.*?)[\"'].*?options:\s*\[(.*?)\]", content, re.DOTALL)
    print(f"grammar-summaries-and-questions matches: {len(matches)}")
    for m in matches[:10]:
        opts = [o.strip() for o in m[1].split(",") if o.strip()]
        print(f"  ID: {m[0]}, options count: {len(opts)}, options: {opts[:4]}")

check_smart_curriculum()
check_grammar_summaries()
