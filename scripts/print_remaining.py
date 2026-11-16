import json

data = json.load(open("deep_linguistic_findings.json", encoding="utf-8"))
for i, f in enumerate(data["findings"]):
    print(f"{i+1}. [{f['severity']}] [{f['type']}] {f['location']}")
    print(f"   Snippet: {f['snippet']}")
    print(f"   Issue: {f['description']} -> Fix: {f['suggestion']}")
