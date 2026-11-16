import json

fpath = r"C:\Users\fanda\Documents\pro-academy\src\data\translation-questions-complete.json"
with open(fpath, "r", encoding="utf-8") as f:
    questions = json.load(f)

for q in questions:
    qid = q.get("id")
    if qid == "q_mcq_001":
        # target index 1
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [opts[0], ca, opts[1], opts[2]]
        assert q["options"][1] == ca
    elif qid == "q_mcq_002":
        # target index 2
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [opts[0], opts[1], ca, opts[2]]
        assert q["options"][2] == ca
    elif qid == "q_mcq_003":
        # target index 3
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [opts[0], opts[1], opts[2], ca]
        assert q["options"][3] == ca
    elif qid == "q_fib_001":
        # target index 0
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [ca, opts[0], opts[1], opts[2]]
        assert q["options"][0] == ca
    elif qid == "q_cpt_001":
        # target index 2
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [opts[0], opts[1], ca, opts[2]]
        assert q["options"][2] == ca
    elif qid == "q_sel_001":
        # target index 3
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [opts[0], opts[1], opts[2], ca]
        assert q["options"][3] == ca
    elif qid == "q_err_001":
        # target index 1
        ca = q["modelAnswer"]
        opts = [o for o in q["options"] if o != ca]
        q["options"] = [opts[0], ca, opts[1], opts[2]]
        assert q["options"][1] == ca
    elif qid == "q_ord_001":
        # Exactly 4 ordered chunks
        q["options"] = [
            "Every year,",
            "millions of tourists",
            "visit Egypt",
            "to watch its ancient monuments."
        ]

with open(fpath, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print("Updated translation-questions-complete.json successfully!")
