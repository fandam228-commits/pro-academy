import json
import re
import os
import glob
from collections import defaultdict

# Common English spelling mistakes / typos dictionary
COMMON_TYPOS = {
    r"\bteh\b": "the",
    r"\brecieve\b": "receive",
    r"\brecieved\b": "received",
    r"\brecieving\b": "receiving",
    r"\bseperate\b": "separate",
    r"\bseperated\b": "separated",
    r"\bdefinately\b": "definitely",
    r"\boccured\b": "occurred",
    r"\boccuring\b": "occurring",
    r"\buntill\b": "until",
    r"\bgrammer\b": "grammar",
    r"\balot\b": "a lot",
    r"\btruely\b": "truly",
    r"\bpronounciation\b": "pronunciation",
    r"\bsuccesful\b": "successful",
    r"\bsuccesfully\b": "successfully",
    r"\breponsible\b": "responsible",
    r"\benviroment\b": "environment",
    r"\bgoverment\b": "government",
    r"\bbecouse\b": "because",
    r"\bbecuse\b": "because",
    r"\bwether\b": "whether",
    r"\btommorow\b": "tomorrow",
    r"\btommorrow\b": "tomorrow",
    r"\bcomming\b": "coming",
    r"\bbeleive\b": "believe",
    r"\bacheive\b": "achieve",
    r"\bforegin\b": "foreign",
    r"\bfreind\b": "friend",
    r"\bneccessary\b": "necessary",
    r"\bnecesary\b": "necessary",
    r"\bnoticable\b": "noticeable",
    r"\bprefered\b": "preferred",
    r"\brefered\b": "referred",
    r"\bsimilarily\b": "similarly",
    r"\bsurprize\b": "surprise",
    r"\btemperture\b": "temperature",
    r"\bthier\b": "their",
    r"\bwritting\b": "writing",
    r"\bwriten\b": "written",
    r"\baccross\b": "across",
    r"\bdiffrent\b": "different",
    r"\bbeutiful\b": "beautiful",
    r"\bintresting\b": "interesting",
    r"\bfavrite\b": "favorite",
    r"\bfavorit\b": "favorite",
    r"\blanguge\b": "language",
    r"\bschooll\b": "school",
    r"\bstuding\b": "studying",
    r"\bplayng\b": "playing",
    r"\bwatchng\b": "watching",
    r"\balways\s+use\s+to\b": "always used to",
    r"\bdid\s+went\b": "did go",
    r"\bdid\s+saw\b": "did see",
    r"\bdoes\s+has\b": "does have",
    r"\bcan\s+able\s+to\b": "is able to / can",
}

ARABIC_OCR_ISSUES = [
    (r"[\u0000-\u0008\u000B\u000C\u000E-\u001F]", "Control characters"),
    (r"[A-Za-z]+[\u0600-\u06FF]+", "Mixed Latin and Arabic characters inside word"),
    (r"[\u0600-\u06FF]+[A-Za-z]+", "Mixed Arabic and Latin characters inside word"),
    (r"[\u0600-\u06FF]+\s*[\?]\s*$", "English question mark (?) at end of Arabic sentence instead of (؟)"),
]

def check_text(text, context="", is_question_stem=False):
    issues = []
    if not text or not isinstance(text, str):
        return issues
    
    clean_text = text.strip()
    if not clean_text:
        return issues

    # 1. Punctuation checks
    # Double question marks, double commas, etc.
    if re.search(r"(\?\?|!!|,,|;;)", clean_text):
        m = re.search(r"(\?\?|!!|,,|;;)", clean_text)
        issues.append({
            "severity": "Low",
            "category": "Punctuation",
            "rule": "repeated_punctuation",
            "snippet": m.group(0),
            "message": f"Repeated punctuation marks: '{m.group(0)}'",
            "context": context,
            "suggestion": f"Replace with a single punctuation mark '{m.group(0)[0]}'"
        })

    # Space before punctuation (e.g., "word ?" or "word .")
    # (Except when preceded by an ellipsis "..." or blank ".....")
    m_space = re.search(r"(\w)\s+([,\?!;:])(?!\w)", clean_text)
    if m_space:
        issues.append({
            "severity": "Low",
            "category": "Typography",
            "rule": "space_before_punctuation",
            "snippet": clean_text[max(0, m_space.start()-4):min(len(clean_text), m_space.end()+4)],
            "message": f"Unwanted whitespace before punctuation '{m_space.group(2)}'",
            "context": context,
            "suggestion": f"Remove space: '{m_space.group(1)}{m_space.group(2)}'"
        })

    # 2. English Capitalization
    if is_question_stem:
        # First letter should be capitalized if English
        if clean_text[0].isalpha() and clean_text[0].islower() and ord(clean_text[0]) < 128:
            issues.append({
                "severity": "Medium",
                "category": "Capitalization",
                "rule": "initial_lowercase",
                "snippet": clean_text[:25],
                "message": f"Question stem starts with lowercase letter '{clean_text[0]}'",
                "context": context,
                "suggestion": f"Capitalize first letter to '{clean_text[0].upper()}'"
            })

    # Lowercase standalone 'i' pronoun
    m_i = re.search(r"(?:^|\s)(i)(?=[\s,;\.\?!]|$)", clean_text)
    if m_i:
        issues.append({
            "severity": "Medium",
            "category": "Capitalization",
            "rule": "lowercase_i_pronoun",
            "snippet": clean_text[max(0, m_i.start()-10):min(len(clean_text), m_i.end()+10)],
            "message": "Lowercase 'i' used as pronoun instead of uppercase 'I'",
            "context": context,
            "suggestion": "Capitalize to 'I'"
        })

    # 3. Spelling & Grammar Typos
    for pattern, correct in COMMON_TYPOS.items():
        found = re.search(pattern, clean_text, re.IGNORECASE)
        if found:
            issues.append({
                "severity": "High",
                "category": "Spelling",
                "rule": "common_typo",
                "snippet": clean_text[max(0, found.start()-10):min(len(clean_text), found.end()+10)],
                "message": f"Spelling typo '{found.group(0)}'",
                "context": context,
                "suggestion": f"Change to '{correct}'"
            })

    # 4. Interrogative question mark check
    if is_question_stem:
        interrogatives = r"^(Who|What|Where|When|Why|How|Which|Whose|Whom|Can|Could|Would|Will|Should|Shall|Do|Does|Did|Is|Are|Was|Were|Have|Has|Had)\b"
        if re.match(interrogatives, clean_text, re.IGNORECASE):
            # If it's a completion prompt ending with dots, don't flag as missing '?'
            is_completion = bool(re.search(r"(\.{3,}|_{2,})\s*$", clean_text))
            if clean_text.endswith(".") and not is_completion:
                issues.append({
                    "severity": "Medium",
                    "category": "Punctuation",
                    "rule": "interrogative_ends_with_period",
                    "snippet": clean_text[-20:],
                    "message": "Direct question ends with a period (.) instead of a question mark (?)",
                    "context": context,
                    "suggestion": "Change terminal period to '?'"
                })
            elif not clean_text.endswith("?") and not is_completion:
                issues.append({
                    "severity": "Medium",
                    "category": "Punctuation",
                    "rule": "interrogative_missing_question_mark",
                    "snippet": clean_text[-20:],
                    "message": "Direct question has no punctuation at the end (missing '?')",
                    "context": context,
                    "suggestion": "Add '?' at the end of the question"
                })

    # 5. Arabic checks
    for pat, desc in ARABIC_OCR_ISSUES:
        found = re.search(pat, clean_text)
        if found:
            issues.append({
                "severity": "Medium",
                "category": "Arabic Orthography / OCR",
                "rule": "arabic_issue",
                "snippet": clean_text[max(0, found.start()-10):min(len(clean_text), found.end()+10)],
                "message": f"Arabic orthography issue: {desc}",
                "context": context,
                "suggestion": "Review and replace with standard Arabic spelling / punctuation"
            })

    return issues

def audit_options(options, q_id, q_text):
    issues = []
    if not options or not isinstance(options, list):
        return issues
    
    clean_opts = []
    for opt in options:
        if isinstance(opt, dict):
            clean_opts.append(opt.get("text", ""))
        else:
            t = str(opt)
            t = re.sub(r"^[a-dA-D][\)\.\:\-]\s*", "", t)
            clean_opts.append(t.strip())

    # 1. Duplicate options
    seen = {}
    for idx, opt in enumerate(clean_opts):
        lower = opt.strip().lower()
        if lower in seen:
            issues.append({
                "severity": "High",
                "category": "Option Integrity",
                "rule": "duplicate_option",
                "snippet": f"Option {idx}: '{opt}' vs Option {seen[lower]}: '{clean_opts[seen[lower]]}'",
                "message": f"Duplicate option detected: '{opt}'",
                "context": f"{q_id} Options",
                "suggestion": "Replace duplicate distractor with a valid alternative"
            })
        seen[lower] = idx

    # 2. Inconsistent trailing punctuation
    has_period = [o.endswith(".") for o in clean_opts if o]
    if any(has_period) and not all(has_period) and len(has_period) == 4:
        issues.append({
            "severity": "Low",
            "category": "Option Consistency",
            "rule": "mixed_trailing_periods",
            "snippet": str(clean_opts),
            "message": "Inconsistent trailing period across options (some end with '.', others don't)",
            "context": f"{q_id} Options",
            "suggestion": "Harmonize options by removing trailing periods for word/phrase options"
        })

    # 3. Capitalization consistency across options
    # Check if some start with uppercase and some with lowercase when they are all letters
    starts_upper = [o[0].isupper() for o in clean_opts if o and o[0].isalpha()]
    if any(starts_upper) and not all(starts_upper) and len(starts_upper) == 4:
        issues.append({
            "severity": "Low",
            "category": "Option Consistency",
            "rule": "mixed_capitalization",
            "snippet": str(clean_opts),
            "message": "Mixed capitalization across options (some start capitalized, some lowercase)",
            "context": f"{q_id} Options",
            "suggestion": "Standardize options to uniform case (lowercase for mid-sentence gaps, capitalized for full sentences)"
        })

    # Check each option's text
    for idx, opt in enumerate(clean_opts):
        opt_issues = check_text(opt, context=f"{q_id} opt[{idx}]", is_question_stem=False)
        issues.extend(opt_issues)

    return issues

def run_full_audit():
    rootDir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    all_issues = []
    stats = {
        "files_scanned": 0,
        "questions_scanned": 0,
        "options_scanned": 0,
        "story_chapters_scanned": 0,
        "dialogues_scanned": 0,
        "by_severity": defaultdict(int),
        "by_category": defaultdict(int),
    }

    # 1. Training Center Extracted Questions (894 questions)
    tc_file = os.path.join(rootDir, "src/data/training-center-extracted-questions.json")
    if os.path.exists(tc_file):
        stats["files_scanned"] += 1
        tc_data = json.load(open(tc_file, encoding="utf-8"))
        for q in tc_data:
            stats["questions_scanned"] += 1
            q_id = q.get("id", "Unknown")
            q_text = q.get("questionText", "")
            all_issues.extend(check_text(q_text, context=f"TC [{q_id}] stem", is_question_stem=True))
            opts = q.get("options", [])
            stats["options_scanned"] += len(opts)
            all_issues.extend(audit_options(opts, f"TC [{q_id}]", q_text))

    # 2. Secondary 2027 Master Questions
    m2027_file = os.path.join(rootDir, "src/data/question-bank-2027-master.json")
    if os.path.exists(m2027_file):
        stats["files_scanned"] += 1
        m2027_data = json.load(open(m2027_file, encoding="utf-8"))
        for q in m2027_data:
            stats["questions_scanned"] += 1
            q_id = q.get("id", "Unknown")
            q_text = q.get("questionText", "")
            all_issues.extend(check_text(q_text, context=f"Master2027 [{q_id}] stem", is_question_stem=True))
            opts = q.get("options", [])
            stats["options_scanned"] += len(opts)
            all_issues.extend(audit_options(opts, f"Master2027 [{q_id}]", q_text))

    # 3. Translation Questions
    tr_file = os.path.join(rootDir, "src/data/translation-questions-complete.json")
    if os.path.exists(tr_file):
        stats["files_scanned"] += 1
        tr_data = json.load(open(tr_file, encoding="utf-8"))
        for q in tr_data:
            stats["questions_scanned"] += 1
            q_id = q.get("id", "Unknown")
            q_text = q.get("questionText", "")
            all_issues.extend(check_text(q_text, context=f"Translation [{q_id}] stem", is_question_stem=True))
            opts = q.get("options", [])
            stats["options_scanned"] += len(opts)
            all_issues.extend(audit_options(opts, f"Translation [{q_id}]", q_text))

    # 4. Story World Files
    story_files = glob.glob(os.path.join(rootDir, "src/data/story-world/*.json"))
    for sf in story_files:
        stats["files_scanned"] += 1
        s_data = json.load(open(sf, encoding="utf-8"))
        basename = os.path.basename(sf)
        items = s_data if isinstance(s_data, list) else [s_data]
        for it in items:
            for ch in it.get("chapters", []):
                stats["story_chapters_scanned"] += 1
                ch_title = ch.get("titleEn", "")
                # MCQs
                for q in ch.get("mcqQuestions", []):
                    stats["questions_scanned"] += 1
                    q_id = q.get("id", "Unknown")
                    q_text = q.get("questionText", "")
                    all_issues.extend(check_text(q_text, context=f"{basename} [{q_id}] stem", is_question_stem=True))
                    opts = q.get("options", [])
                    stats["options_scanned"] += len(opts)
                    all_issues.extend(audit_options(opts, f"{basename} [{q_id}]", q_text))
                
                # Q&A questions
                for qa in ch.get("questionsAndAnswers", []):
                    stats["questions_scanned"] += 1
                    all_issues.extend(check_text(qa.get("questionEn", ""), context=f"{basename} ch[{ch_title}] QA En", is_question_stem=True))
                    all_issues.extend(check_text(qa.get("questionAr", ""), context=f"{basename} ch[{ch_title}] QA Ar", is_question_stem=False))
                    all_issues.extend(check_text(qa.get("answerEn", ""), context=f"{basename} ch[{ch_title}] QA Ans En", is_question_stem=False))
                    all_issues.extend(check_text(qa.get("answerAr", ""), context=f"{basename} ch[{ch_title}] QA Ans Ar", is_question_stem=False))

                # Homework questions
                for hw in ch.get("homeworkQuestions", []):
                    stats["questions_scanned"] += 1
                    all_issues.extend(check_text(hw.get("questionEn", ""), context=f"{basename} ch[{ch_title}] HW En", is_question_stem=True))

    # 5. Grammar Summaries & Questions (.ts file)
    grammar_file = os.path.join(rootDir, "src/data/grammar-summaries-and-questions.ts")
    if os.path.exists(grammar_file):
        stats["files_scanned"] += 1
        content = open(grammar_file, encoding="utf-8").read()
        # Extract question blocks: question: "...", options: [...], correctAnswer: ...
        q_matches = re.finditer(r'id:\s*[\'"]([^\'"]+)[\'"].*?question:\s*[\'"]([^\'"]+)[\'"].*?options:\s*\[(.*?)\]', content, re.DOTALL)
        for m in q_matches:
            stats["questions_scanned"] += 1
            q_id = m.group(1)
            q_text = m.group(2)
            raw_opts = m.group(3)
            opts = re.findall(r'[\'"]([^\'"]*)[\'"]', raw_opts)
            stats["options_scanned"] += len(opts)
            all_issues.extend(check_text(q_text, context=f"Grammar [{q_id}] stem", is_question_stem=True))
            all_issues.extend(audit_options(opts, f"Grammar [{q_id}]", q_text))

    # Calculate stats
    for issue in all_issues:
        stats["by_severity"][issue["severity"]] += 1
        stats["by_category"][issue["category"]] += 1

    return all_issues, stats

if __name__ == "__main__":
    issues, stats = run_full_audit()
    print("=== LINGUISTIC & ORTHOGRAPHIC AUDIT SUMMARY ===")
    print(f"Files scanned: {stats['files_scanned']}")
    print(f"Questions scanned: {stats['questions_scanned']}")
    print(f"Options scanned: {stats['options_scanned']}")
    print(f"Total issues found: {len(issues)}")
    print("\nIssues by Severity:")
    for sev, cnt in sorted(stats["by_severity"].items()):
        print(f"  {sev}: {cnt}")
    print("\nIssues by Category:")
    for cat, cnt in sorted(stats["by_category"].items()):
        print(f"  {cat}: {cnt}")

    # Output top 30 issues as sample
    print("\n=== SAMPLE ISSUES (First 35) ===")
    for i, issue in enumerate(issues[:35]):
        print(f"{i+1}. [{issue['severity']}] [{issue['category']}] {issue['context']}")
        print(f"   Snippet: {issue['snippet']}")
        print(f"   Message: {issue['message']}")
        print(f"   Suggestion: {issue['suggestion']}")
        print()

    # Save complete findings to JSON
    out_json = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "linguistic_audit_findings.json"))
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({"stats": stats, "issues": issues}, f, indent=2, ensure_ascii=False)
    print(f"Full report saved to {out_json}")
