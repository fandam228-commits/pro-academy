import json
import re
import os
import glob

rootDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

dialogue_issues = []
diag_files = glob.glob(os.path.join(rootDir, "src/data/dialogue-center/*.json"))

for df in diag_files:
    bname = os.path.basename(df)
    data = json.load(open(df, encoding="utf-8"))
    diags = data if isinstance(data, list) else data.get("dialogues", [])
    
    for d in diags:
        did = d.get("id", "Unknown")
        scenario = d.get("scenarioEn", "") or d.get("scenario", "") or d.get("context", "")
        
        # Check scenario
        if scenario:
            # Missing period or punctuation
            if not scenario.strip().endswith((".", "!", "?")):
                dialogue_issues.append({
                    "file": bname,
                    "id": did,
                    "target": "scenario",
                    "text": scenario,
                    "issue": "Scenario sentence missing terminal punctuation (period)"
                })
        
        # Check lines
        lines = d.get("lines", [])
        for i, l in enumerate(lines):
            speaker = l.get("speaker", "")
            text = l.get("text", "")
            arabic = l.get("arabic", "") or l.get("translation", "")
            
            # Check speaker name formatting
            if not speaker or speaker.islower():
                dialogue_issues.append({
                    "file": bname,
                    "id": did,
                    "target": f"line {i} speaker",
                    "text": speaker,
                    "issue": "Speaker name missing or uncapitalized"
                })
                
            # Check English punctuation
            if text and not text.strip().endswith((".", "?", "!", '."', '?"', '!"', "...", "…")):
                # Check if it has a blank placeholder like (1) .......
                if not re.search(r"(\.{3,}|_{2,}|\(\d\))", text):
                    dialogue_issues.append({
                        "file": bname,
                        "id": did,
                        "target": f"line {i} text",
                        "text": text,
                        "issue": "Line text missing end punctuation mark"
                    })

            # Check Arabic punctuation (e.g. English question mark in Arabic line)
            if arabic and re.search(r"[\u0600-\u06FF]+\s*\?", arabic):
                dialogue_issues.append({
                    "file": bname,
                    "id": did,
                    "target": f"line {i} arabic",
                    "text": arabic,
                    "issue": "Arabic translation uses Latin '?' instead of Arabic question mark '؟'"
                })

print(f"Dialogue Center Findings: {len(dialogue_issues)}")
for issue in dialogue_issues[:15]:
    print(f"[{issue['file']} / {issue['id']}] {issue['target']}: {issue['issue']}")
    print(f"  Snippet: {issue['text'][:60]}")
