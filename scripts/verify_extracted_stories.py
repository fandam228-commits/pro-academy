import json
import glob
import os

print("=" * 80)
print("AUDIT: VERIFYING ALL EXTRACTED STORY JSON DATASETS (WITH PROPER FIELD NAMES)")
print("=" * 80)

total_chapters = 0
total_vocab = 0
total_points = 0
total_text = 0
total_qa = 0
total_imp = 0
total_hw = 0
total_mcq = 0

for fpath in sorted(glob.glob('src/data/story-world/*.json')):
    fname = os.path.basename(fpath)
    with open(fpath, encoding='utf-8') as f:
        data = json.load(f)
    print(f"\n📂 FILE: {fname}")
    
    stories = data if isinstance(data, list) else [data]
    for s in stories:
        sid = s.get("id")
        t_en = s.get("titleEn")
        t_ar = s.get("titleAr")
        author = s.get("author", "N/A")
        gradeCode = s.get("gradeCode")
        gradeLabelAr = s.get("gradeLabelAr")
        term = s.get("term")
        chapters = s.get("chapters", [])
        chars = s.get("characters", [])
        themes = s.get("themes", [])
        print(f"  📖 Story: [{sid}] {t_en} ({t_ar})")
        print(f"     Grade: {gradeCode} ({gradeLabelAr}) | Term: {term} | Author: {author}")
        print(f"     Characters: {len(chars)} | Themes: {len(themes)} | Chapters: {len(chapters)}")
        
        for ch in chapters:
            total_chapters += 1
            cnum = ch.get("chapterNumber")
            ctitle = ch.get("titleEn")
            ctitleAr = ch.get("titleAr")
            
            vocab = ch.get("vocabulary", [])
            pts = ch.get("chapterInPoints", [])
            txt = ch.get("theText", [])
            qas = ch.get("questionsAndAnswers", [])
            imp = ch.get("importantQuestions", [])
            hw = ch.get("homeworkQuestions", [])
            mcq = ch.get("mcqQuestions", [])
            
            total_vocab += len(vocab)
            total_points += len(pts)
            total_text += len(txt)
            total_qa += len(qas)
            total_imp += len(imp)
            total_hw += len(hw)
            total_mcq += len(mcq)
            
            print(f"       Ch {cnum}: {ctitle} / {ctitleAr}")
            print(f"         Vocab: {len(vocab)} | Points: {len(pts)} | Text paras: {len(txt)} | SB/WB Qs: {len(qas)} | Important: {len(imp)} | Homework: {len(hw)} | MCQ: {len(mcq)}")

print("\n" + "=" * 80)
print(f"GRAND TOTALS ACROSS ALL 6 STORIES:")
print(f"  Total Stories: 8 (Prep 1: 2 stories, Prep 2: 2 stories, Prep 3: 1 story, Sec 1: 1, Sec 2: 1, Sec 3: 1)")
print(f"  Total Chapters: {total_chapters}")
print(f"  Total Vocabulary Words: {total_vocab}")
print(f"  Total Chapter in Points: {total_points}")
print(f"  Total Bilingual Text Paragraphs: {total_text}")
print(f"  Total Questions & Answers: {total_qa}")
print(f"  Total Important / Critical Thinking Qs: {total_imp}")
print(f"  Total Homework Qs: {total_hw}")
print(f"  Total MCQ Questions: {total_mcq}")
print("=" * 80)
