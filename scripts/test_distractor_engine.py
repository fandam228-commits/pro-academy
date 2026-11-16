import json
import re
import random

input_path = r"C:\Users\fanda\Documents\pro-academy\src\data\training-center-extracted-questions.json"
with open(input_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

# Helper for clean text
def clean_opt_text(text):
    text = re.sub(r'^[a-d]\)\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[\t\n\r]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# Helper pools for distractors
PREPOSITIONS = ['at', 'in', 'on', 'by', 'for', 'with', 'from', 'to', 'into', 'under', 'about', 'between']
PRONOUNS = ['who', 'whom', 'which', 'that', 'whose', 'where', 'when', 'what']
TAGS = ["isn't it", "doesn't he", "didn't they", "haven't you", "aren't they", "won't you", "can't we", "could he"]
AUX_VERBS = ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could']
MODALS = ['must', 'should', 'can', 'could', 'may', 'might', 'ought to', 'would']
COMPARATIVES = ['more', 'most', 'better', 'best', 'as', 'than', 'less', 'least', 'higher', 'highest']

def infer_category_and_distractors(opts, stem, topic):
    # Determine best category pool
    lower_opts = [o.lower() for o in opts]
    if any(p in lower_opts for p in PREPOSITIONS) or 'preposition' in topic.lower():
        pool = PREPOSITIONS
    elif any(p in lower_opts for p in PRONOUNS) or 'relative' in topic.lower():
        pool = PRONOUNS
    elif any("'" in o or "n't" in o for o in opts) or 'tag' in topic.lower() or stem.rstrip().endswith('?'):
        pool = TAGS
    elif any(m in lower_opts for m in MODALS) or 'modal' in topic.lower():
        pool = MODALS
    elif any(c in lower_opts for c in COMPARATIVES) or 'comparative' in topic.lower():
        pool = COMPARATIVES
    else:
        pool = AUX_VERBS
    
    extra = [p for p in pool if p.lower() not in lower_opts]
    return extra

print("Helper defined successfully.")
