import os
import re

project_root = r"C:\Users\fanda\Documents\pro-academy"

files_to_check = [
    os.path.join(project_root, "src", "data", "smart-curriculum-seed.ts"),
    os.path.join(project_root, "src", "data", "grammar-summaries-and-questions.ts"),
    os.path.join(project_root, "src", "lib", "question-importer.ts"),
]

for fpath in files_to_check:
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        print(f"File: {os.path.basename(fpath)}")
        has_mcq = "mcq" in content.lower()
        has_options = "options" in content.lower()
        has_correct = "correctanswer" in content.lower()
        print(f"  has_mcq={has_mcq}, has_options={has_options}, has_correct={has_correct}")
