import json
import re
import os
import glob
from collections import defaultdict

rootDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Advanced linguistic rules and patterns
TYPO_PATTERNS = [
    (r"\btheswimming\b", "the swimming", "Merged words 'theswimming'"),
    (r"\bthecorner\b", "the corner", "Merged words 'thecorner'"),
    (r"\bthebank\b", "the bank", "Merged words 'thebank'"),
    (r"\bofmy\b", "of my", "Merged words 'ofmy'"),
    (r"\binmy\b", "in my", "Merged words 'inmy'"),
    (r"\bonmy\b", "on my", "Merged words 'onmy'"),
    (r"\batmy\b", "at my", "Merged words 'atmy'"),
    (r"\btolearn\b", "to learn", "Merged words 'tolearn'"),
    (r"\btogo\b", "to go", "Merged words 'togo'"),
    (r"\bisn’t\s*\.", "isn't.", "Space before period after contraction"),
    (r"\bdoesn’t\s*\.", "doesn't.", "Space before period after contraction"),
    (r"\bdidn’t\s*\.", "didn't.", "Space before period after contraction"),
    (r"\bwasn’t\s*\.", "wasn't.", "Space before period after contraction"),
    (r"\bweren’t\s*\.", "weren't.", "Space before period after contraction"),
    (r"\bhasn’t\s*\.", "hasn't.", "Space before period after contraction"),
    (r"\bhaven’t\s*\.", "haven't.", "Space before period after contraction"),
    (r"\bteh\b", "the", "Typo 'teh'"),
    (r"\brecieve\b", "receive", "Typo 'recieve'"),
    (r"\brecieved\b", "received", "Typo 'recieved'"),
    (r"\brecieving\b", "receiving", "Typo 'recieving'"),
    (r"\bseperate\b", "separate", "Typo 'seperate'"),
    (r"\bseperated\b", "separated", "Typo 'seperated'"),
    (r"\bgrammer\b", "grammar", "Typo 'grammer'"),
    (r"\bdefinately\b", "definitely", "Typo 'definately'"),
    (r"\boccured\b", "occurred", "Typo 'occured'"),
    (r"\buntill\b", "until", "Typo 'untill'"),
    (r"\btruely\b", "truly", "Typo 'truely'"),
    (r"\bpronounciation\b", "pronunciation", "Typo 'pronounciation'"),
    (r"\bsuccesful\b", "successful", "Typo 'succesful'"),
    (r"\benviroment\b", "environment", "Typo 'enviroment'"),
    (r"\bgoverment\b", "government", "Typo 'goverment'"),
    (r"\bneccessary\b", "necessary", "Typo 'neccessary'"),
    (r"\bprefered\b", "preferred", "Typo 'prefered'"),
    (r"\bwritting\b", "writing", "Typo 'writting'"),
    (r"\bdiffrent\b", "different", "Typo 'diffrent'"),
    (r"\bbeutiful\b", "beautiful", "Typo 'beutiful'"),
    (r"\bfavrite\b", "favorite", "Typo 'favrite'"),
    (r"\blanguge\b", "language", "Typo 'languge'"),
    (r"\bchose\b(?=\s+as\s+participle)", "chosen", "Wrong verb form"),
    (r"\bcar\s+s\s+my\s+father\b", "my father's car", "Malformed possessive"),
    (r"\bmy\s+father\s+s\s+car\b", "my father's car", "Separated possessive 's'"),
    (r"\bThe\s+legs’\s+chair\b", "The legs of the chair", "Inanimate possessive apostrophe-s"),
    (r"\bLegs’\s+the\s+chair\b", "The legs of the chair", "Inanimate possessive apostrophe-s"),
]

def scan_text(text, location, is_question=False):
    findings = []
    if not text or not isinstance(text, str):
        return findings

    t = text.strip()
    if not t:
        return findings

    # Check known typos and glued words
    for pat, fix, desc in TYPO_PATTERNS:
        m = re.search(pat, t, re.IGNORECASE)
        if m:
            findings.append({
                "location": location,
                "type": "Spelling / Lexical Error",
                "severity": "High",
                "matched": m.group(0),
                "description": desc,
                "suggestion": fix,
                "snippet": t[max(0, m.start()-15):min(len(t), m.end()+15)]
            })

    # Check leading / trailing quotation glitches from OCR
    if re.match(r"^[\”\“\"\']\s*[\”\“\"\']", t):
        findings.append({
            "location": location,
            "type": "OCR Typography Glitch",
            "severity": "Medium",
            "matched": t[:5],
            "description": "Double or mismatched leading quotation marks",
            "suggestion": "Clean leading quotation marks",
            "snippet": t[:30]
        })

    # Check orphaned closing quote at the beginning
    if t.startswith("”") or t.startswith("’"):
        findings.append({
            "location": location,
            "type": "OCR Typography Glitch",
            "severity": "Medium",
            "matched": t[0],
            "description": "Orphaned closing quotation/apostrophe at sentence start",
            "suggestion": "Remove orphaned mark or replace with opening quote",
            "snippet": t[:30]
        })

    # Check lowercase question stems (English)
    if is_question and t[0].isalpha() and t[0].islower() and ord(t[0]) < 128:
        findings.append({
            "location": location,
            "type": "Capitalization",
            "severity": "Medium",
            "matched": t[0],
            "description": f"Sentence starts with lowercase letter '{t[0]}'",
            "suggestion": f"Capitalize to '{t[0].upper()}'",
            "snippet": t[:30]
        })

    # Check lowercase pronoun 'i'
    m_i = re.search(r"(?:^|\s)(i)(?=[\s,;\.\?!]|$)", t)
    if m_i:
        findings.append({
            "location": location,
            "type": "Grammar / Capitalization",
            "severity": "Medium",
            "matched": "i",
            "description": "Lowercase 'i' used as subject pronoun",
            "suggestion": "Capitalize to 'I'",
            "snippet": t[max(0, m_i.start()-10):min(len(t), m_i.end()+10)]
        })

    # Check unspaced punctuation
    m_unspaced = re.search(r"([a-zA-Z]{3,})([,\.?!])([a-zA-Z]{3,})", t)
    if m_unspaced and not m_unspaced.group(2) == "." and not "http" in t:
        findings.append({
            "location": location,
            "type": "Typography",
            "severity": "Low",
            "matched": m_unspaced.group(0),
            "description": f"Missing space after punctuation '{m_unspaced.group(2)}'",
            "suggestion": f"{m_unspaced.group(1)}{m_unspaced.group(2)} {m_unspaced.group(3)}",
            "snippet": t[max(0, m_unspaced.start()-5):min(len(t), m_unspaced.end()+5)]
        })

    # Check for direct question missing question mark
    if is_question:
        interrogative_match = re.match(r"^(Who|What|Where|When|Why|How|Which|Whose|Whom|Can|Could|Would|Will|Should|Shall|Do|Does|Did|Is|Are|Was|Were|Have|Has|Had)\b", t, re.IGNORECASE)
        # Avoid sentence completion prompts ending in dots or blanks e.g. "Which of the following is ... ?"
        is_blank_completion = bool(re.search(r"(\.{2,}|_{2,})\s*$", t))
        if interrogative_match and not is_blank_completion:
            if t.endswith("."):
                findings.append({
                    "location": location,
                    "type": "Punctuation Error",
                    "severity": "Medium",
                    "matched": t[-1],
                    "description": "Direct interrogative question ends with a period instead of a question mark",
                    "suggestion": "Replace period with '?'",
                    "snippet": t[-25:]
                })
            elif not t.endswith("?"):
                findings.append({
                    "location": location,
                    "type": "Punctuation Error",
                    "severity": "Medium",
                    "matched": t[-1],
                    "description": "Direct interrogative question missing terminal question mark",
                    "suggestion": "Append '?' to the question",
                    "snippet": t[-25:]
                })

    return findings

def audit_options_list(options, location):
    findings = []
    if not options or not isinstance(options, list):
        return findings

    texts = []
    for opt in options:
        if isinstance(opt, dict):
            texts.append(opt.get("text", "").strip())
        else:
            t = str(opt).strip()
            t = re.sub(r"^[a-dA-D][\)\.\:\-]\s*", "", t)
            texts.append(t)

    # 1. Exact duplicate or casing-only duplicate options
    seen = {}
    for i, txt in enumerate(texts):
        low = txt.lower()
        if low in seen:
            findings.append({
                "location": location,
                "type": "Option Defect (Duplicate)",
                "severity": "Critical",
                "matched": f"'{txt}' & '{texts[seen[low]]}'",
                "description": f"Option {i} duplicates Option {seen[low]} (differing only by case or identical)",
                "suggestion": "Provide a distinct, plausible distracter",
                "snippet": str(texts)
            })
        seen[low] = i

    # 2. Casing inconsistency: single-word options where some start lowercase and some uppercase
    is_alpha_single = [bool(re.match(r"^[a-zA-Z]+$", t)) for t in texts]
    if all(is_alpha_single) and len(texts) == 4:
        uppers = [t[0].isupper() for t in texts]
        if any(uppers) and not all(uppers):
            findings.append({
                "location": location,
                "type": "Option Formatting Inconsistency",
                "severity": "Low",
                "matched": str(texts),
                "description": "Single-word options have mixed capitalization (some uppercase, some lowercase)",
                "suggestion": "Harmonize to uniform lowercase (if sentence gap) or uppercase (if standalone)",
                "snippet": str(texts)
            })

    # 3. Check each option for typos
    for idx, txt in enumerate(texts):
        opt_findings = scan_text(txt, f"{location} [opt {idx}]", is_question=False)
        findings.extend(opt_findings)

    return findings

def full_deep_scan():
    all_findings = []
    category_counts = defaultdict(int)
    severity_counts = defaultdict(int)

    # 1. Training Center Extracted Questions (894 questions)
    tc_path = os.path.join(rootDir, "src/data/training-center-extracted-questions.json")
    if os.path.exists(tc_path):
        questions = json.load(open(tc_path, encoding="utf-8"))
        for q in questions:
            qid = q.get("id", "Unknown")
            q_stem = q.get("questionText", "")
            f1 = scan_text(q_stem, f"Training Center ({qid})", is_question=True)
            all_findings.extend(f1)
            f2 = audit_options_list(q.get("options", []), f"Training Center ({qid})")
            all_findings.extend(f2)

    # 2. Question Bank 2027 Master (55 questions)
    qb_path = os.path.join(rootDir, "src/data/question-bank-2027-master.json")
    if os.path.exists(qb_path):
        questions = json.load(open(qb_path, encoding="utf-8"))
        for q in questions:
            qid = q.get("id", "Unknown")
            q_stem = q.get("questionText", "")
            f1 = scan_text(q_stem, f"Master 2027 ({qid})", is_question=True)
            all_findings.extend(f1)
            f2 = audit_options_list(q.get("options", []), f"Master 2027 ({qid})")
            all_findings.extend(f2)

    # 3. Secondary 2027 Units (Units 1, 2, 3)
    sec_units = glob.glob(os.path.join(rootDir, "src/data/secondary-2027/*.json"))
    for sf in sec_units:
        bname = os.path.basename(sf)
        u_data = json.load(open(sf, encoding="utf-8"))
        for sec in u_data.get("sections", []):
            sec_title = sec.get("titleEn", "")
            for q in sec.get("questions", []):
                qid = q.get("id", "Unknown")
                q_stem = q.get("questionText", "")
                f1 = scan_text(q_stem, f"{bname} > {sec_title} ({qid})", is_question=True)
                all_findings.extend(f1)
                f2 = audit_options_list(q.get("options", []), f"{bname} > {sec_title} ({qid})")
                all_findings.extend(f2)

    # 4. Dialogue Center Dialogues
    diag_files = glob.glob(os.path.join(rootDir, "src/data/dialogue-center/*.json"))
    for df in diag_files:
        bname = os.path.basename(df)
        d_data = json.load(open(df, encoding="utf-8"))
        diags = d_data if isinstance(d_data, list) else d_data.get("dialogues", [])
        for d in diags:
            did = d.get("id", "Unknown")
            title = d.get("titleEn", "") or d.get("title", "")
            scenario = d.get("scenarioEn", "") or d.get("context", "")
            all_findings.extend(scan_text(scenario, f"{bname} ({did}) Scenario", is_question=False))
            for line in d.get("lines", []):
                speaker = line.get("speaker", "")
                text = line.get("text", "")
                all_findings.extend(scan_text(text, f"{bname} ({did}) {speaker}", is_question=False))

    # 5. Story World Files
    story_files = glob.glob(os.path.join(rootDir, "src/data/story-world/*.json"))
    for sf in story_files:
        bname = os.path.basename(sf)
        if "backup" in sf:
            continue
        s_data = json.load(open(sf, encoding="utf-8"))
        items = s_data if isinstance(s_data, list) else [s_data]
        for it in items:
            for ch in it.get("chapters", []):
                ch_title = ch.get("titleEn", "")
                for q in ch.get("mcqQuestions", []):
                    qid = q.get("id", "Unknown")
                    q_stem = q.get("questionText", "")
                    all_findings.extend(scan_text(q_stem, f"{bname} > {ch_title} ({qid})", is_question=True))
                    all_findings.extend(audit_options_list(q.get("options", []), f"{bname} > {ch_title} ({qid})"))
                for qa in ch.get("questionsAndAnswers", []):
                    all_findings.extend(scan_text(qa.get("questionEn", ""), f"{bname} > {ch_title} QA", is_question=True))
                    all_findings.extend(scan_text(qa.get("answerEn", ""), f"{bname} > {ch_title} QA Ans", is_question=False))
                for hw in ch.get("homeworkQuestions", []):
                    all_findings.extend(scan_text(hw.get("questionEn", ""), f"{bname} > {ch_title} HW", is_question=True))

    # 6. Translation Files
    tr_path = os.path.join(rootDir, "src/data/translation-questions-complete.json")
    if os.path.exists(tr_path):
        tr_data = json.load(open(tr_path, encoding="utf-8"))
        for q in tr_data:
            qid = q.get("id", "Unknown")
            q_stem = q.get("questionText", "")
            all_findings.extend(scan_text(q_stem, f"Translation ({qid})", is_question=True))
            all_findings.extend(audit_options_list(q.get("options", []), f"Translation ({qid})"))

    # 7. Grammar Summaries & Questions
    gr_path = os.path.join(rootDir, "src/data/grammar-summaries-and-questions.ts")
    if os.path.exists(gr_path):
        content = open(gr_path, encoding="utf-8").read()
        q_matches = re.finditer(r'id:\s*[\'"]([^\'"]+)[\'"].*?question:\s*[\'"]([^\'"]+)[\'"].*?options:\s*\[(.*?)\]', content, re.DOTALL)
        for m in q_matches:
            qid = m.group(1)
            q_text = m.group(2)
            raw_opts = m.group(3)
            opts = re.findall(r'[\'"]([^\'"]*)[\'"]', raw_opts)
            all_findings.extend(scan_text(q_text, f"Grammar Package ({qid})", is_question=True))
            all_findings.extend(audit_options_list(opts, f"Grammar Package ({qid})"))

    for f in all_findings:
        category_counts[f["type"]] += 1
        severity_counts[f["severity"]] += 1

    return all_findings, category_counts, severity_counts

if __name__ == "__main__":
    findings, cats, sevs = full_deep_scan()
    print("=== DEEP LINGUISTIC AUDIT ACROSS ALL CURRICULA ===")
    print(f"Total Findings: {len(findings)}")
    print("\nBy Severity:")
    for s, c in sorted(sevs.items()):
        print(f"  {s}: {c}")
    print("\nBy Category:")
    for cat, c in sorted(cats.items()):
        print(f"  {cat}: {c}")

    report_path = os.path.join(rootDir, "deep_linguistic_findings.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({"total": len(findings), "severity": sevs, "category": cats, "findings": findings}, f, indent=2, ensure_ascii=False)
    print(f"\nSaved full findings to {report_path}")
