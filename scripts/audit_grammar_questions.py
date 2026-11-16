import re
import json

path = "src/data/grammar-summaries-and-questions.ts"
content = open(path, encoding="utf-8").read()

q_matches = re.finditer(
    r'id:\s*[\'"]([^\'"]+)[\'"].*?question:\s*[\'"]([^\'"]+)[\'"].*?options:\s*\[(.*?)\]',
    content,
    re.DOTALL
)

findings = []
count = 0

for m in q_matches:
    count += 1
    qid = m.group(1)
    qtext = m.group(2)
    raw_opts = m.group(3)
    opts = re.findall(r'[\'"]([^\'"]*)[\'"]', raw_opts)

    # 1. Check stem
    # Missing blank indicator or ends abruptly
    if qtext.startswith(" ") or qtext.endswith(" "):
        findings.append({
            "qid": qid,
            "field": "stem",
            "issue": "Extraneous leading/trailing space",
            "text": repr(qtext)
        })

    # Lowercase start
    if qtext and qtext[0].islower() and qtext[0].isalpha():
        findings.append({
            "qid": qid,
            "field": "stem",
            "issue": f"Stem starts with lowercase '{qtext[0]}'",
            "text": qtext[:30]
        })

    # Double punctuation
    if re.search(r"(\?\?|!!|,,|;;)", qtext):
        findings.append({
            "qid": qid,
            "field": "stem",
            "issue": "Repeated punctuation",
            "text": qtext
        })

    # 2. Check options
    seen = {}
    for idx, opt in enumerate(opts):
        low = opt.strip().lower()
        if low in seen:
            findings.append({
                "qid": qid,
                "field": f"opt[{idx}]",
                "issue": f"Duplicate option '{opt}' with opt[{seen[low]}]",
                "text": str(opts)
            })
        seen[low] = idx

        # Space before punctuation in option
        if re.search(r"\w\s+([,\.\?!;:])", opt):
            findings.append({
                "qid": qid,
                "field": f"opt[{idx}]",
                "issue": "Unwanted space before punctuation in option",
                "text": opt
            })

print(f"Scanned {count} Grammar questions. Findings: {len(findings)}")
for f in findings:
    print(f"[{f['qid']}] {f['field']}: {f['issue']}")
    print(f"   {f['text']}")
