import json
import os

target_dir = r"C:\Users\fanda\Documents\pro-academy\src\data\dialogue-center"
files = [
    ("prep1-dialogues.json", 25),
    ("prep2-dialogues.json", 27),
    ("prep3-dialogues.json", 32),
    ("prep3-revision-dialogues.json", 10),
]

total_dialogues = 0
total_gaps = 0

for filename, expected_count in files:
    filepath = os.path.join(target_dir, filename)
    assert os.path.exists(filepath), f"Missing {filename}"
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)
    print(f"File {filename}: {len(data)} dialogues (Expected at least {expected_count})")
    assert len(data) >= expected_count, f"Count mismatch in {filename}: {len(data)} < {expected_count}"
    
    for idx, dlg in enumerate(data):
        assert dlg.get("id"), f"Missing id in {filename} #{idx}"
        assert dlg.get("title"), f"Missing title in {filename} #{idx}"
        assert dlg.get("lines"), f"Missing lines in {filename} #{idx}"
        assert dlg.get("approvedAnswers"), f"Missing approvedAnswers in {filename} #{idx}"
        
        # Check that answers exist for keys 1..5
        ans = dlg["approvedAnswers"]
        for g in ["1", "2", "3", "4", "5"]:
            assert g in ans, f"Missing gap {g} in {filename} dlg {dlg['id']}"
            assert ans[g].get("primary"), f"Missing primary in gap {g} in {filename} dlg {dlg['id']}"
            total_gaps += 1
            
        total_dialogues += 1

print("\n=======================================================")
print(f"VERIFICATION PASSED 100%!")
print(f"Total Authentic Dialogues: {total_dialogues}")
print(f"Total Evaluated Gaps: {total_gaps}")
print("=======================================================")
