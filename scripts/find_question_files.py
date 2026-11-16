import os
import glob
import json

project_root = r"C:\Users\fanda\Documents\pro-academy"

print("=== Scanning for JSON files in src/data/ ===")
for root, dirs, files in os.walk(os.path.join(project_root, "src")):
    for f in files:
        if f.endswith(".json") or f.endswith(".ts") or f.endswith(".tsx"):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, project_root)
            if any(k in f.lower() for k in ["question", "exam", "quiz", "training", "dialogue", "story", "vocab"]):
                print(rel_path)
