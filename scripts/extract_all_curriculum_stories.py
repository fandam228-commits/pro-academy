"""
Full Extraction Pipeline for all 6 Educational Stories
Extracts:
1. Sec 3: The Count of Monte Cristo (6 Chapters)
2. Sec 2: The Lost World (5 Chapters)
3. Sec 1: The Old Man and the Sea (6 Chapters)
4. Prep 3: The School Garden Project (6 Chapters)
5. Prep 2: The Little Inventor (3 Ch) + The Adventure of the Hidden Island (3 Ch)
6. Prep 1: The Magic Classroom (3 Ch) + The Dream Team (3 Ch)
"""

import os
import re
import json
import docx

upload_dir = r"C:\Users\fanda\.gemini\antigravity\brain\9e49d30e-0f2a-4ab8-8f0f-f12ca9606afd\.user_uploaded"
output_dir = r"C:\Users\fanda\Documents\pro-academy\src\data\story-world"
os.makedirs(output_dir, exist_ok=True)

def clean(text):
    if not text:
        return ""
    return text.replace('\u200e', '').replace('\u200f', '').replace('\ufeff', '').strip()

def has_arabic(text):
    return bool(re.search(r'[\u0600-\u06FF]', text))

def has_english(text):
    return bool(re.search(r'[a-zA-Z]', text))

def is_header_or_page(line):
    l = line.lower()
    if "mr. habib el rahman" in l or "01006468384" in l:
        return True
    if "professional" in l and ("novel" in l or "english" in l or "story" in l):
        return True
    if re.match(r'^[_\-\s\d\(\)\|]+$', line):
        return True
    return False

def get_lines(fname):
    fpath = os.path.join(upload_dir, fname)
    doc = docx.Document(fpath)
    raw = [clean(p.text) for p in doc.paragraphs if clean(p.text)]
    return [l for l in raw if not is_header_or_page(l)]

# ==============================================================================
# 1. PARSE SEC 3: THE COUNT OF MONTE CRISTO
# ==============================================================================
def parse_sec3():
    lines = get_lines("media_1794587867252_dfae8da0.docx")
    
    story = {
        "id": "story_sec_3_monte_cristo",
        "gradeCode": "sec_3",
        "gradeLabelAr": "الصف الثالث الثانوي",
        "gradeLabelEn": "Third Secondary",
        "term": "first",
        "termLabelAr": "الفصل الدراسي الأول 2026/2027",
        "termLabelEn": "First Term 2026/2027",
        "titleAr": "كونت دي مونت كريستو",
        "titleEn": "The Count of Monte Cristo",
        "author": "Alexandre Dumas (ألكسندر دوما)",
        "aboutAuthorEn": "Alexandre Dumas (1802-1870) was a French writer whose works have been translated into many languages and who is one of the most widely read French authors.",
        "aboutAuthorAr": "ألكسندر دوما (1802-1870) كاتب فرنسي شهير، تُرجمت أعماله إلى لغات عديدة، ويُعد من أكثر الكتاب الفرنسيين قراءة في العالم.",
        "coverImage": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "الرواية المقررة رسميًا لشهادة الثانوية العامة 2026/2027: ملحمة العدالة والظلم، الخيانة والانتقام، وتغير المصائر الإنسانية بالصبر والمعرفة.",
        "descriptionEn": "Official Third Secondary 2026/2027 novel: an epic tale of justice, betrayal, wrongful imprisonment, and the transformative power of wisdom and mercy.",
        "plotSummaryEn": "The Count of Monte Cristo is the story of a young and honest sailor named Edmond Dantés. He returns to Marseille to marry his fiancée Mercédés, but he is betrayed by jealous men: Danglars, Fernand, and Villefort. They accuse him of being a spy, and he is sent to prison in the dark Chateau d'If. In prison, he meets the wise Abbé Faria who educates him and reveals the secret treasure of Monte Cristo. After 14 years, Edmond escapes, recovers the vast fortune, and returns as the Count of Monte Cristo to reward the good and punish the treacherous.",
        "plotSummaryAr": "تحكي الرواية قصة البحار الشاب الصادق إدموند دانتيس الذي يعود إلى مارسيليا ليتزوج خطيبته مرسيدس، لكنه يتعرض لخيانة خبيثة من رجال تملؤهم الغيرة: دانجلار وفرناند وفيلفور، فيتآمرون عليه ويسجنونه ظلماً في سجن شاتو ديف الرهيب. في السجن يلتقي بالأب فاريا الحكيم الذي يعلمه العلوم واللغات ويكشف له سر كنز مونت كريستو الأسطوري. بعد 14 عاماً يهرب إدموند بجرأة، ويعثر على الكنز، ويعود بشخصية كونت مونت كريستو ليحقق العدالة ويكافئ الأوفياء.",
        "characters": [
            {
                "name": "Edmond Dantés (إدموند دانتس)",
                "role": "The Protagonist / The Count of Monte Cristo",
                "roleAr": "البطل الرئيسي / كونت مونت كريستو",
                "descriptionEn": "A young, innocent sailor promoted to captain of the Pharaon and unjustly imprisoned. He transforms into the wise, powerful Count of Monte Cristo seeking justice.",
                "descriptionAr": "بحار شاب بريء ومخلص أصبح قائداً لسفينة الفرعون، تعرض لظلم مروع وسجن دون محاكمة، وتحول بالمعرفة والصبر إلى كونت مونت كريستو لتحقيق العدالة.",
                "isMain": True
            },
            {
                "name": "Mercédés (مرسيدس)",
                "role": "Edmond's Betrothed",
                "roleAr": "خطيبة إدموند والحب الحقيقي له",
                "descriptionEn": "Edmond's true love who pleaded desperately for his freedom and remained faithfully devoted to his memory.",
                "descriptionAr": "خطيبة إدموند وحبه الصادق، حاولت بكل قوتها إثبات براءته وظلت وفية له ولذكراه.",
                "isMain": True
            },
            {
                "name": "Fernand Mondego (فرناند مونديجو)",
                "role": "Edmond's Jealous Rival",
                "roleAr": "منافس إدموند والصديق المزيف",
                "descriptionEn": "A fisherman from Catalonia who passionately loved Mercédés and conspired with Danglars to frame Edmond for treason out of bitter envy.",
                "descriptionAr": "صياد من كاتالونيا كان يحب مرسيدس بجنون، وخان إدموند وسلم الرسالة الكاذبة للمدعي العام بدافع الغيرة.",
                "isMain": True
            },
            {
                "name": "Danglars (دانجلار)",
                "role": "The Greedy Purser",
                "roleAr": "أمين صندوق السفينة الطماع والمحرض",
                "descriptionEn": "The purser of the Pharaon who bitterly envied Edmond's promotion to captain and masterminded the false letter of denunciation.",
                "descriptionAr": "أمين صندوق السفينة الذي حسد إدموند على الترقية لقيادة السفينة ودبّر الرسالة الكاذبة لاتهامه بالتجسس.",
                "isMain": True
            },
            {
                "name": "Gérard de Villefort (جيرارد دو فيلفور)",
                "role": "The Corrupt Deputy Prosecutor",
                "roleAr": "نائب المدعي العام الطموح والفاسد",
                "descriptionEn": "An ambitious prosecutor who discovered the traitorous letter was addressed to his own Bonapartist father, so he burned it and sacrificed innocent Edmond to protect his career.",
                "descriptionAr": "نائب المدعي العام الذي أرسل إدموند إلى سجن شاتو ديف دون محاكمة ليحمي مستقبله ويخفي أن الرسالة موجهة إلى والده البونابرتي.",
                "isMain": True
            },
            {
                "name": "Abbé Faria (الأب فاريا)",
                "role": "The Wise Priest & Mentor",
                "roleAr": "الكاهن الحكيم ومعلم إدموند الروحي",
                "descriptionEn": "An elderly priest and brilliant scholar imprisoned for political reasons. He taught Edmond sciences, languages, and philosophy, and gave him the secret map to the Monte Cristo treasure.",
                "descriptionAr": "كاهن وعالم حكيم التقى بإدموند في السجن، حول الزنزانة إلى مدرسة وعلّمه اللغات والعلوم، وأهداه خريطة كنز مونت كريستو قبل وفاته.",
                "isMain": True
            },
            {
                "name": "Gaspard Caderousse (كادروس)",
                "role": "The Cowardly Neighbor",
                "roleAr": "جار إدموند الجبان والأنانى",
                "descriptionEn": "Edmond's neighbor who witnessed the conspiracy but stayed cowardly silent out of selfishness and greed.",
                "descriptionAr": "جار إدموند الذي شهد تدبير المؤامرة وظل صامتاً بدافع الجبن والأنانية.",
                "isMain": False
            },
            {
                "name": "Maximilien Morrel (ماكسيميليان موريل)",
                "role": "The Honorable Son of Morrel",
                "roleAr": "الابن الوفي لصاحب السفينة موريل",
                "descriptionEn": "The noble, loyal son of Edmond's old employer Monsieur Morrel, representing honor, hope, and true friendship.",
                "descriptionAr": "الابن النبيل والشريف لرب عمل إدموند السيد موريل، الذي يكافئه إدموند لاحقاً بثروته.",
                "isMain": False
            }
        ],
        "themes": [
            {
                "themeEn": "Justice and Injustice",
                "themeAr": "العدل والظلم",
                "descriptionEn": "The story exposes the harsh reality of corruption and false accusations, illustrating that earthly justice is often compromised by ambition, yet ultimate divine justice prevails.",
                "descriptionAr": "توضح الرواية خطورة الفساد والظلم عندما يُسجن البريء دون محاكمة، وتؤكد أن العدالة الحقيقية تتطلب الحكمة والضمير الحي."
            },
            {
                "themeEn": "Revenge vs. Mercy",
                "themeAr": "الانتقام مقابل الرحمة",
                "descriptionEn": "Edmond learns that relentless vengeance can consume the human soul, and that true peace comes from wisdom, justice, and forgiveness.",
                "descriptionAr": "يتعلم إدموند أن نار الانتقام قد تلتهم الروح وتؤذي الأبرياء، وأن العظمة الحقيقية تكمن في ضبط النفس والرحمة والتسامح."
            },
            {
                "themeEn": "Power of Knowledge",
                "themeAr": "قوة المعرفة والتعليم",
                "descriptionEn": "In the dark Chateau d'If, Abbé Faria transforms Edmond from an uneducated sailor into an enlightened scholar armed with wisdom, showing that the mind can never be imprisoned.",
                "descriptionAr": "حوّل الأب فاريا سجن شاتو ديف إلى منارة علم، وأثبت لإدموند أن الإنسان قد يفقد حريته الجسدية ولكن لا يجب أن يفقد عقله، فالمعرفة هي القوة الحقيقية."
            },
            {
                "themeEn": "Hope and Resilience",
                "themeAr": "الأمل والصمود الإنساني",
                "descriptionEn": "Through 14 years of darkness, Edmond endures through faith, patience, and purpose, moving from deep despair to fulfilling an extraordinary destiny.",
                "descriptionAr": "رغم 14 عاماً من السجن والظلام، لم يفقد إدموند الأمل، وبفضل الصبر والعزيمة تحول من سجين يائس إلى رجل ذي قدر ومكانة عظيمة."
            }
        ],
        "chapters": []
    }

    chap_defs = [
        (1, "The Arrival at Marseilles", "الوصول لمرسيليا", "arrival at marseilles"),
        (2, "A Treacherous Plot", "مؤامرة خبيثة", "treacherous plot"),
        (3, "Betrayal and Arrest", "الخيانة والاعتقال", "betrayal and arrest"),
        (4, "The Prison of Chateau d'If", "سجن شاتو ديف", "prison of chateau"),
        (5, "A Ray of Hope", "شعاع أمل", "ray of hone"),
        (6, "The Secret of the Treasure", "سر الكنز", "secret of the treasure")
    ]
    
    c_indices = []
    last_idx = 0
    for cnum, ten, tar, key in chap_defs:
        f_idx = -1
        for i in range(last_idx, len(lines)):
            if len(lines[i]) > 40:
                continue
            norm = lines[i].lower().replace(" ", "").replace("'", "").replace("’", "")
            if key.replace(" ", "") in norm:
                f_idx = i
                last_idx = i + 20
                break
        c_indices.append((cnum, ten, tar, f_idx))
        
    for k in range(len(c_indices)):
        cnum, ten, tar, start_idx = c_indices[k]
        end_idx = c_indices[k+1][3] if k+1 < len(c_indices) else len(lines)
        chap_lines = lines[start_idx:end_idx]
        
        vocab = []
        points = []
        text_paras = []
        qa_list = []
        hw_list = []
        
        section = "intro"
        curr_en_text = ""
        
        for line in chap_lines:
            ll = line.lower().replace('‘', "'").replace('’', "'")
            if any(line.startswith(pfx) for pfx in ["©", "@", "•", "®"]) and (section == "intro" or section == "points"):
                section = "points"
            elif any(s in ll for s in ["edmond dantés stood", "celebration of edmond", "the night of edmond", "sentinel in the middle of", "dark sentinel", "the days passed quickly", "had lost his only friend", "lost his only friend"]):
                section = "text"
            elif "questions & answers" in ll or "أسئلة الكتاب المدرسي" in line or ("questions" in ll and "homework" not in ll and "points" not in ll and len(line) < 40):
                section = "qa"
                continue
            elif "homework" in ll or "واجب منزلي" in line or (line.strip() in ["واجب", "الواجب"]) or "امتحانات المحافظات" in line:
                section = "homework"
                continue

            if section == "intro":
                l_clean = line.replace('‘', '').replace('’', '').replace('|', ' ')
                words = re.findall(r'([a-zA-Z\s\(\)\.\,\'-]+?)\s+([\u0600-\u06FF\s/]+)', l_clean)
                for w_en, w_ar in words:
                    w_en = w_en.strip()
                    w_ar = w_ar.strip()
                    if len(w_en) > 2 and len(w_ar) > 1 and not is_header_or_page(w_en) and "chapter" not in w_en.lower():
                        vocab.append({"word": w_en, "meaningAr": w_ar})
            elif section == "points":
                if any(line.startswith(pfx) for pfx in ["©", "@", "•", "®"]):
                    if has_english(line):
                        clean_pt = re.sub(r'^[©@•®\d\.\s\(\)]+', '', line).strip()
                        points.append({"en": clean_pt, "ar": ""})
                    elif has_arabic(line) and points:
                        points[-1]["ar"] = line.strip()
                elif has_arabic(line) and points and not points[-1]["ar"]:
                    points[-1]["ar"] = line.strip()
            elif section == "text":
                if has_english(line) and not has_arabic(line):
                    curr_en_text = line
                elif has_arabic(line):
                    if curr_en_text:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": curr_en_text,
                            "paragraphAr": line
                        })
                        curr_en_text = ""
                    else:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": "",
                            "paragraphAr": line
                        })
                elif has_english(line) and has_arabic(line):
                    text_paras.append({
                        "order": len(text_paras) + 1,
                        "paragraphEn": line,
                        "paragraphAr": line
                    })
            elif section == "qa":
                if ("?" in line or "؟" in line) and len(line) > 10:
                    qa_list.append({
                        "id": f"sec3_ch{cnum}_qa_{len(qa_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "sb_wb"
                    })
                elif qa_list and not qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] = line
                elif qa_list and qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] += "\n" + line
            elif section == "homework":
                if len(line) > 10:
                    hw_list.append({
                        "id": f"sec3_ch{cnum}_hw_{len(hw_list)+1}",
                        "question": line,
                        "answer": "تحليل أدبي ونقدي يعبر فيه الطالب عن رؤيته للشخصيات والأحداث وفق توجيهات د. حبيب الرحمن.",
                        "type": "homework"
                    })

        clean_vocab = []
        seen = set()
        for v in vocab:
            k_v = v["word"].lower().strip()
            if k_v not in seen and len(k_v) > 2:
                seen.add(k_v)
                clean_vocab.append(v)
                
        chap_obj = {
            "id": f"sc_sec_3_ch_{cnum}",
            "chapterNumber": cnum,
            "titleEn": ten,
            "titleAr": tar,
            "term": "first",
            "summaryEn": points[0]["en"] if points else f"Chapter {cnum}: {ten}",
            "summaryAr": points[0]["ar"] if points else f"الفصل {cnum}: {tar}",
            "chapterInPoints": points,
            "vocabulary": clean_vocab,
            "theText": text_paras,
            "questionsAndAnswers": qa_list,
            "importantQuestions": [q for q in qa_list if any(kw in q["question"].lower() for kw in ["why", "how", "compare", "symbolize", "explain"])],
            "homeworkQuestions": hw_list,
            "mcqQuestions": [
                {
                    "id": f"mcq_sec3_ch{cnum}_1",
                    "question": f"What is the central focus of Chapter {cnum} ({ten})?",
                    "options": [
                        points[0]["en"] if points else "Edmond Dantés faces a critical test of loyalty and courage",
                        "Edmond decides to leave France forever without facing his enemies",
                        "The Pharaon ship is sold to a foreign country",
                        "Villefort resigns from his position as deputy prosecutor"
                    ],
                    "correctAnswer": points[0]["en"] if points else "Edmond Dantés faces a critical test of loyalty and courage",
                    "explanation": "Edmond's journey reflects moral resilience and enduring faith in ultimate justice."
                },
                {
                    "id": f"mcq_sec3_ch{cnum}_2",
                    "question": f"How does Edmond Dantés demonstrate his character in this chapter?",
                    "options": [
                        "Through unwavering loyalty, honesty, and moral resilience",
                        "By seeking violent revenge immediately without thought",
                        "By surrendering completely to hopelessness and giving up",
                        "By accepting money to abandon his principles"
                    ],
                    "correctAnswer": "Through unwavering loyalty, honesty, and moral resilience",
                    "explanation": "Edmond consistently maintains his dignity and integrity, holding fast to his core values."
                }
            ]
        }
        story["chapters"].append(chap_obj)
        print(f"Sec 3 Chapter {cnum}: {ten} parsed successfully.")
        
    out_file = os.path.join(output_dir, "sec3-story.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    print(f"Saved: {out_file}\n")

# ==============================================================================
# 2. PARSE SEC 2: THE LOST WORLD
# ==============================================================================
def parse_sec2():
    lines = get_lines("media_1794587867254_b9dc653e.docx")
    
    story = {
        "id": "story_sec_2_lost_world",
        "gradeCode": "sec_2",
        "gradeLabelAr": "الصف الثاني الثانوي",
        "gradeLabelEn": "Second Secondary",
        "term": "first",
        "termLabelAr": "الفصل الدراسي الأول 2026/2027",
        "termLabelEn": "First Term 2026/2027",
        "titleAr": "العالم المفقود",
        "titleEn": "The Lost World",
        "author": "Arthur Conan Doyle (آرثر كونان دويل)",
        "aboutAuthorEn": "Arthur Conan Doyle (1859-1930) was a renowned Scottish writer and physician, best known for creating Sherlock Holmes and famous adventure novels including The Lost World.",
        "aboutAuthorAr": "آرثر كونان دويل (1859-1930) كاتب وطبيب اسكتلندي بارز، اشتهر عالمياً بابتكار شخصية شيرلوك هولمز وروايات المغامرة والخيال العلمي الخالدة مثل العالم المفقود.",
        "coverImage": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "الرواية المقررة رسميًا للصف الثاني الثانوي 2026/2027: رحلة استكشافية جريئة إلى أعماق أمريكا الجنوبية بحثًا عن كائنات ما قبل التاريخ المجهولة، مجسدة قيم الشجاعة والعمل الجماعي والبحث العلمي.",
        "descriptionEn": "Official Second Secondary 2026/2027 novel: an exhilarating scientific expedition deep into an uncharted South American plateau where prehistoric creatures still survive.",
        "plotSummaryEn": "The Lost World tells the story of Edward Malone, a young reporter who wants to prove his bravery to Gladys. He joins an expedition led by Professor Challenger, who claims prehistoric animals survive on an isolated plateau in South America. Alongside Professor Summerlee and explorer Lord John Roxton, they navigate the Amazon, are betrayed and trapped on the plateau by Gomez, encounter dinosaurs and ape-men, and ultimately prove the extraordinary truth.",
        "plotSummaryAr": "تحكي الرواية قصة إدوارد مالون، الصحفي الشاب الساعي لإثبات شجاعته، الذي ينضم إلى بعثة استكشافية يقودها البروفيسور تشالنجر المقتنع بوجود حيوانات من عصور ما قبل التاريخ فوق هضبة معزولة في أمريكا الجنوبية، بصحبة البروفيسور سمرلي والمستكشف اللورد جون روكستون. يواجه الفريق أخطاراً جسيمة وخيانة جوميز التي تحاصرهم فوق الهضبة، ويكتشفون ديناصورات حية تثبت صحة النظرية العلمية.",
        "mainSettings": [
            {
                "en": "London",
                "ar": "لندن",
                "descriptionEn": "Where Malone works as a reporter, the adventure begins, and the final revelation takes place at the Zoological Institute.",
                "descriptionAr": "المدينة التي يعمل فيها مالون وتبدأ منها رحلة التحدي، وفيها تُعرض أدلة الاكتشاف في النهاية."
            },
            {
                "en": "The South American Plateau / Maple White Land",
                "ar": "هضبة أمريكا الجنوبية / أرض مابل وايت",
                "descriptionEn": "The isolated, prehistoric plateau surrounded by sheer red cliffs where dinosaurs, pterodactyls, and ape-men live.",
                "descriptionAr": "الهضبة البركانية المعزولة المحاطة بالمنحدرات الحمراء الشاهقة، موطن الديناصورات والكائنات الحية القديمة."
            },
            {
                "en": "The Amazon Region",
                "ar": "منطقة الأمازون",
                "descriptionEn": "The vast river network, dense jungle, and waterways navigated by canoe and on foot.",
                "descriptionAr": "شبكة أنهار وغابات الأمازون الكثيفة التي خاضها المستكشفون بالقوارب وسيراً على الأقدام."
            }
        ],
        "characters": [
            {
                "name": "Edward Malone (إدوارد مالون)",
                "role": "The Narrator & Brave Reporter",
                "roleAr": "الراوي وصحفي ديلي جازيت الشجاع",
                "descriptionEn": "A 23-year-old ambitious reporter who seeks danger to prove his bravery, discovering that true courage is about helping others rather than seeking personal approval.",
                "descriptionAr": "صحفي شاب طموح يبحث عن المغامرة، ويتعلم خلال الرحلة أن الشجاعة الحقيقية هي مواجهة الخطر لإنقاذ الآخرين واكتشاف الذات.",
                "isMain": True
            },
            {
                "name": "Professor George Edward Challenger (البروفيسور تشالنجر)",
                "role": "The Brilliant Leader & Zoologist",
                "roleAr": "عالم الحيوان العبقري وقائد البعثة",
                "descriptionEn": "A proud, brilliant, hot-tempered scientist whose unyielding determination leads the expedition to the plateau.",
                "descriptionAr": "عالم حيوان عبقري وعريض البنية وفخور، قاده إصراره ومعرفته العلمية لإثبات وجود مخلوقات ما قبل التاريخ.",
                "isMain": True
            },
            {
                "name": "Professor Summerlee (البروفيسور سمرلي)",
                "role": "The Sceptical Scientist",
                "roleAr": "العالم المتشكك والناقد",
                "descriptionEn": "An elderly, highly sceptical scientist who demands rigorous proof, eventually becoming Challenger's strongest witness.",
                "descriptionAr": "عالم مسن ونحيف وشديد الشك، يطالب بأدلة قاطعة، ويتحول إلى شاهد صادق على صحة الاكتشاف عند رؤية الكائنات.",
                "isMain": True
            },
            {
                "name": "Lord John Roxton (اللورد جون روكستون)",
                "role": "The Experienced Hunter & Explorer",
                "roleAr": "المستكشف والصياد الخبير",
                "descriptionEn": "A brave, cool-headed explorer with deep knowledge of the Amazon whose practical survival skills save the team repeatedly.",
                "descriptionAr": "صياد ومستكشف شجاع وهادئ الأعصاب، يمتلك خبرة عميقة بغابات وأنهار الأمازون ساهمت في نجاة البعثة.",
                "isMain": True
            },
            {
                "name": "Zambo (زامبو)",
                "role": "The Loyal Companion",
                "roleAr": "المساعد المخلص والشجاع",
                "descriptionEn": "A strong, faithful man who remains below the plateau, maintaining supplies and communication when the explorers are trapped.",
                "descriptionAr": "رجل قوي ومرح وشديد الوفاء، رابط أسفل الهضبة وأمدهم بالطعام والذخيرة طوال فترة حصارهم.",
                "isMain": False
            },
            {
                "name": "Gomez (جوميز)",
                "role": "The Treacherous Trapper",
                "roleAr": "الدليل الخائن والانتقامي",
                "descriptionEn": "A river guide who secretly seeks revenge against Lord John for his brother Pedro Lopez's death, trapping the team on the plateau.",
                "descriptionAr": "دليل محلي خائن دمّر جسر الشجرة وحاصر المستكشفين انتقاماً لمقتل أخيه بيدرو لوبيز.",
                "isMain": False
            }
        ],
        "themes": [
            {
                "themeEn": "Scientific Discovery",
                "themeAr": "الاكتشاف والبحث العلمي",
                "descriptionEn": "The tension between doubt and verification, demonstrating that open-minded exploration and empirical evidence reveal profound truths.",
                "descriptionAr": "أهمية البحث العلمي القائم على التجربة والأدلة المادية والانفتاح على الاكتشاف."
            },
            {
                "themeEn": "True Courage",
                "themeAr": "مفهوم الشجاعة الحقيقية",
                "descriptionEn": "Malone's transformation from seeking external validation into embracing authentic courage that protects and uplifts companions in danger.",
                "descriptionAr": "الشجاعة الحقيقية لا تنبع من الرغبة في إبهار الآخرين بل من الإقدام والتضحية من أجل الصالح العام."
            },
            {
                "themeEn": "Loyalty vs. Betrayal",
                "themeAr": "الوفاء في مواجهة الخيانة",
                "descriptionEn": "Contrasted through Zambo's steadfast devotion and Gomez's vengeful destruction of the bridge.",
                "descriptionAr": "التباين الأخلاقي الواضح بين وفاء زامبو المستميت وخيانة جوميز الماكرة."
            },
            {
                "themeEn": "Teamwork and Complementary Strengths",
                "themeAr": "العمل الجماعي وتكامل المهارات",
                "descriptionEn": "Challenger's knowledge, Summerlee's criticism, Roxton's outdoor skills, and Malone's adaptability combine to achieve what no individual could alone.",
                "descriptionAr": "تكامل العقل العلمي مع الخبرة الميدانية وحسن التوثيق لتحقيق النجاح الجماعي."
            }
        ],
        "chapters": []
    }

    chap_defs = [
        (1, "A Dream of Adventure", "حلم بالمغامرة", "chapter 1"),
        (2, "Professor Challenger's Secret", "سر البروفيسور تشالنجر", "chapter 2"),
        (3, "The Expedition is Chosen", "تم اختيار البعثة", "chapter 3"),
        (4, "Into the Unknown", "إلى المجهول", "chapter 4"),
        (5, "Trapped in the Lost World", "عالقون في العالم المفقود", "chapter 5")
    ]
    
    c_indices = []
    for cnum, ten, tar, key in chap_defs:
        f_idx = -1
        for i, l in enumerate(lines):
            norm = l.lower().strip()
            if norm == key:
                f_idx = i
                break
        c_indices.append((cnum, ten, tar, f_idx))
        
    for k in range(len(c_indices)):
        cnum, ten, tar, start_idx = c_indices[k]
        end_idx = c_indices[k+1][3] if k+1 < len(c_indices) else len(lines)
        chap_lines = lines[start_idx:end_idx]
        
        vocab = []
        points = []
        text_paras = []
        qa_list = []
        jre_list = []
        hw_list = []
        
        section = "vocab"
        curr_en_text = ""
        
        for line in chap_lines:
            ll = line.lower()
            if "in points" in ll or "في نقاط" in line:
                section = "points"
                continue
            elif "translated" in ll or "مترجم" in line:
                section = "text"
                continue
            elif "summative" in ll or "sb q&a" in ll or "أسئلة واجابات الكتاب" in line:
                section = "qa"
                continue
            elif "jre" in ll or "justify" in ll or "التبرير" in line:
                section = "jre"
                continue
            elif "homework" in ll or "واجب" in line:
                section = "homework"
                continue
                
            if section == "vocab":
                words = re.findall(r'([a-zA-Z\s\(\)\.\,\'-]+)\s+([\u0600-\u06FF\s/]+)', line)
                for w_en, w_ar in words:
                    w_en = w_en.strip()
                    w_ar = w_ar.strip()
                    if len(w_en) > 2 and len(w_ar) > 1 and not is_header_or_page(w_en):
                        vocab.append({"word": w_en, "meaningAr": w_ar})
            elif section == "points":
                if re.match(r'^\d+[\.\-]', line):
                    pts = re.split(r'[\u0600-\u06FF]', line, maxsplit=1)
                    p_en = re.sub(r'^\d+[\.\-]\s*', '', line)
                    points.append({"en": p_en.strip(), "ar": ""})
                elif has_arabic(line) and points and not points[-1]["ar"]:
                    points[-1]["ar"] = line.strip()
            elif section == "text":
                if has_english(line) and not has_arabic(line):
                    curr_en_text = line
                elif has_arabic(line):
                    if curr_en_text:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": curr_en_text,
                            "paragraphAr": line
                        })
                        curr_en_text = ""
                    else:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": "",
                            "paragraphAr": line
                        })
                elif has_english(line) and has_arabic(line):
                    text_paras.append({
                        "order": len(text_paras) + 1,
                        "paragraphEn": line,
                        "paragraphAr": line
                    })
            elif section == "qa":
                if ("?" in line or "؟" in line or re.match(r'^\d+[\.\-]', line)) and len(line) > 10:
                    qa_list.append({
                        "id": f"sec2_ch{cnum}_qa_{len(qa_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "sb_wb"
                    })
                elif qa_list and not qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] = line
                elif qa_list and qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] += "\n" + line
            elif section == "jre":
                if ("?" in line or "؟" in line or "justify" in ll or "reasoning" in ll or "evidence" in ll):
                    jre_list.append({
                        "id": f"sec2_ch{cnum}_jre_{len(jre_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "jre"
                    })
                elif jre_list and not jre_list[-1]["answer"]:
                    jre_list[-1]["answer"] = line
                elif jre_list and jre_list[-1]["answer"]:
                    jre_list[-1]["answer"] += "\n" + line
            elif section == "homework":
                if len(line) > 10:
                    hw_list.append({
                        "id": f"sec2_ch{cnum}_hw_{len(hw_list)+1}",
                        "question": line,
                        "answer": "مناقشة وتحليل أدبي يجيب عنها الطالب استناداً إلى وقائع الفصل وتوجيهات مستر حبيب الرحمن.",
                        "type": "homework"
                    })

        clean_vocab = []
        seen = set()
        for v in vocab:
            k_v = v["word"].lower().strip()
            if k_v not in seen and len(k_v) > 2:
                seen.add(k_v)
                clean_vocab.append(v)
                
        chap_obj = {
            "id": f"sc_sec_2_ch_{cnum}",
            "chapterNumber": cnum,
            "titleEn": ten,
            "titleAr": tar,
            "term": "first",
            "summaryEn": points[0]["en"] if points else f"Chapter {cnum}: {ten}",
            "summaryAr": points[0]["ar"] if points else f"الفصل {cnum}: {tar}",
            "chapterInPoints": points,
            "vocabulary": clean_vocab,
            "theText": text_paras,
            "questionsAndAnswers": qa_list,
            "importantQuestions": jre_list if jre_list else [q for q in qa_list if any(kw in q["question"].lower() for kw in ["why", "how", "evaluate", "analyse"])],
            "homeworkQuestions": hw_list,
            "mcqQuestions": [
                {
                    "id": f"mcq_sec2_ch{cnum}_1",
                    "question": f"What major discovery or turning point defines Chapter {cnum} ({ten})?",
                    "options": [
                        points[0]["en"] if points else "The expedition encounters an astonishing prehistoric revelation",
                        "The explorers decide to abandon the quest and head home",
                        "Professor Challenger admits that all his theories were false",
                        "The team loses all their scientific instruments in London"
                    ],
                    "correctAnswer": points[0]["en"] if points else "The expedition encounters an astonishing prehistoric revelation",
                    "explanation": "Chapter events advance the scientific quest through evidence, teamwork, and bravery."
                },
                {
                    "id": f"mcq_sec2_ch{cnum}_2",
                    "question": "How does the team overcome the perilous challenges in this chapter?",
                    "options": [
                        "Through complementary expertise: scientific insight, tactical hunting skills, and observant courage",
                        "By relying entirely on luck without any preparation",
                        "By dividing and competing against one another",
                        "By retreating whenever danger appears"
                    ],
                    "correctAnswer": "Through complementary expertise: scientific insight, tactical hunting skills, and observant courage",
                    "explanation": "The characters' diverse talents are essential to their collective survival and success."
                }
            ]
        }
        story["chapters"].append(chap_obj)
        print(f"Sec 2 Chapter {cnum}: {ten} parsed successfully.")
        
    out_file = os.path.join(output_dir, "sec2-story.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    print(f"Saved: {out_file}\n")

# ==============================================================================
# 3. PARSE SEC 1: THE OLD MAN AND THE SEA
# ==============================================================================
def parse_sec1():
    lines = get_lines("media_1794587867252_46988ea0.docx")
    
    story = {
        "id": "story_sec_1_old_man_sea",
        "gradeCode": "sec_1",
        "gradeLabelAr": "الصف الأول الثانوي",
        "gradeLabelEn": "First Secondary",
        "term": "full_year",
        "termLabelAr": "المنهج المقرر 2026/2027",
        "termLabelEn": "Full Academic Year 2026/2027",
        "titleAr": "العجوز والبحر",
        "titleEn": "The Old Man and the Sea",
        "author": "Ernest Hemingway (إرنست همنغواي)",
        "aboutAuthorEn": "Ernest Hemingway (1899-1961) was an American novelist and journalist who won the Nobel Prize for Literature in 1954. The Old Man and the Sea is considered his supreme masterpiece.",
        "aboutAuthorAr": "إرنست همنغواي (1899-1961) روائي وصحفي أمريكي نال جائزة نوبل في الأدب عام 1954، وتعتبر رواية العجوز والبحر درة تاجه الأدبي وإحدى أعظم روايات الأدب العالمي.",
        "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "رواية نوبل الخالدة للصف الأول الثانوي: كفاح الصياد العجوز سانتياغو ضد سمكة المارلين وأسماك القرش، رمز الصمود الإنساني والكرامة والروح التي لا تُقهر.",
        "descriptionEn": "Hemingway's Nobel-winning masterpiece for First Secondary: Santiago's epic contest with a giant marlin and marauding sharks, celebrating human endurance and dignity.",
        "plotSummaryEn": "Santiago, an aging Cuban fisherman down on his luck after 84 days without a fish, sails far into the Gulf Stream. On the 85th day, he hooks an immense marlin. For days and nights, Santiago endures immense pain, physical strain, and exhaustion, seeing the noble fish as his brother. After finally subduing the marlin, sharks scent the blood and attack. Despite fighting heroically with harpoon, knife, and tiller, only the marlin's skeleton remains upon his return. Yet his spirit is triumphantly undefeated, gaining the profound respect of his village and devoted apprentice Manolin.",
        "plotSummaryAr": "سانتياغو صياد كوبي مسن لم يصطد سمكة منذ 84 يوماً. في اليوم الـ 85 يبحر بعيداً في عرض البحر حيث تعلق بصنارته سمكة مارلين عملاقة تجر قاربه ليومين وليلتين. يقاوم سانتياغو الآلام والإرهاق باحترام عميق لخصمه النبيل، وينجح في صيدها. لكن هجمات أسماك القرش المتتالية تلتهم لحم السمكة رغم دفاعه البطولي بالرمح والسكين والمجداف. يعود سانتياغو بهيكل السمكة العظمي فقط، محتفظاً بكرامته وكبريائه، معلناً أن الإنسان قد يُدمر لكن لا يُهزم أبداً.",
        "characters": [
            {
                "name": "Santiago (سانتياغو)",
                "role": "The Resilient Cuban Fisherman",
                "roleAr": "الصياد الكوبي العجوز وبطل الرواية",
                "descriptionEn": "An aging, humble fisherman whose weathered hands and poverty contrast with clear, undefeated eyes reflecting perseverance, dignity, and deep affinity with nature.",
                "descriptionAr": "صياد مسن صبور وذو كرامة شامخة، يمثل جوهر الصمود الإنساني في وجه الشدائد وعلاقته العميقة بأسرار البحر.",
                "isMain": True
            },
            {
                "name": "Manolin (مانولين)",
                "role": "The Loyal Apprentice & Boy",
                "roleAr": "الصبي الوفي والتلميذ المخلص",
                "descriptionEn": "A devoted young boy who cares for Santiago like family, honoring his wisdom, supplying him with food, and promising to fish together again.",
                "descriptionAr": "فتى وفي يحب سانتياغو حباً جماً، يرعاه ويجلب له الطعام ويصر على التعلم من خبرته وأخلاقه العالية.",
                "isMain": True
            },
            {
                "name": "The Great Marlin (سمكة المارلين)",
                "role": "The Noble Adversary",
                "roleAr": "السمكة العملاقة والمنافس النبيل",
                "descriptionEn": "A magnificent, powerful marlin that tests Santiago to his utmost limits. Santiago regards the fish with reverence and brotherhood.",
                "descriptionAr": "سمكة ضخمة وسريعة وفضية، قاتلت بشرف وشجاعة حتى الموت، واعتبرها سانتياغو أخاً وخصماً جديراً بكل احترام.",
                "isMain": True
            },
            {
                "name": "The Sharks (أسماك القرش)",
                "role": "The Merciless Scavengers",
                "roleAr": "قروش البحر والمفترسات القاسية",
                "descriptionEn": "Predatory scavengers (Mako and Galanos) that strip the marlin's flesh, symbolizing ruthless destructive forces and inevitable material loss.",
                "descriptionAr": "قروش شرسة ترمز إلى القوى المدمرة في الحياة التي تسلب المكاسب المادية دون أن تنال من الكرامة الروحية.",
                "isMain": False
            }
        ],
        "themes": [
            {
                "themeEn": "Endurance and Undefeated Spirit",
                "themeAr": "الصمود والروح التي لا تهزم",
                "descriptionEn": "'A man can be destroyed but not defeated.' True victory lies in fighting with all one's might and maintaining dignity through suffering.",
                "descriptionAr": "الإنسان يمكن أن يُدمر لكن لا يُهزم أبداً، فالانتصار الحقيقي يكمن في المحاولة بشرف والصمود حتى النهاية."
            },
            {
                "themeEn": "Respect for the Natural World",
                "themeAr": "احترام الطبيعة والارتباط بالكون",
                "descriptionEn": "Santiago perceives the sea (la mar) as a feminine living entity and views creatures as fellow brothers sharing life's struggle.",
                "descriptionAr": "يرى سانتياغو البحر كائناً حياً محباً، ويعامل المخلوقات بروح الإخاء والتقدير العميق لعظمة الخلق."
            },
            {
                "themeEn": "Mentorship and Generational Love",
                "themeAr": "الوفاء وتوارث الخبرة بين الأجيال",
                "descriptionEn": "The pure bond between Santiago and Manolin exemplifies how wisdom, empathy, and loyalty transcend age.",
                "descriptionAr": "علاقة سانتياغو بمانولين تمثل أسمى معاني الوفاء وانتقال الحكمة والخبرة من جيل إلى جيل."
            }
        ],
        "chapters": []
    }

    chap_defs = [
        (1, "Santiago's Appearance and Spirit", "صراع سانتياغو وكرامته", "chapter one in points"),
        (2, "Departure & Farther Than Others", "الانطلاق وأبعد من الآخرين", "chapter two in points"),
        (3, "Signs in the Sky & The Great Pull", "علامات في السماء والشدة العظيمة", "chapter three in points"),
        (4, "Morning Struggle & The Powerful Fish", "صراع الصباح والسمكة القوية", "chapter four in points"),
        (5, "The Final Struggle & Brother of the Sea", "المعركة الأخيرة وأخو البحر", "chapter five in points"),
        (6, "The Return & The Sharks Attack", "العودة وهجوم القروش", "chapter six in points")
    ]

    c_indices = []
    for cnum, ten, tar, key in chap_defs:
        f_idx = -1
        for i, l in enumerate(lines):
            norm = l.lower()
            if key in norm:
                f_idx = i
                break
        c_indices.append((cnum, ten, tar, f_idx))
        
    for k in range(len(c_indices)):
        cnum, ten, tar, start_idx = c_indices[k]
        end_idx = c_indices[k+1][3] if k+1 < len(c_indices) else len(lines)
        chap_lines = lines[start_idx:end_idx]
        
        vocab = []
        points = []
        text_paras = []
        qa_list = []
        crit_list = []
        exam_list = []
        
        section = "points"
        curr_en_text = ""
        
        for line in chap_lines:
            ll = line.lower()
            if any(s in ll for s in ["santiago was an old", "in the early morning", "the sun was high now", "the morning sun rose golden", "the sun was rising again", "the morning sun rose as santiago"]):
                section = "text"
            elif "part 1- open-ended" in ll or "open-ended" in ll:
                section = "qa"
                continue
            elif "critical thinking" in ll or "تفكير نقدي" in line:
                section = "critical"
                continue
            elif "امتحانات الادارات" in line or "امتحانات الإدارات" in line:
                section = "exam"
                continue

            if section == "points":
                if any(line.startswith(pfx) for pfx in ["©", "@", "•", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Santiago", "Manolin", "He", "By", "At"]):
                    if has_english(line):
                        clean_pt = re.sub(r'^[©@•\d\.\s\(\)]+', '', line).strip()
                        points.append({"en": clean_pt, "ar": ""})
                    elif has_arabic(line) and points:
                        points[-1]["ar"] = line.strip()
                elif has_arabic(line) and points and not points[-1]["ar"]:
                    points[-1]["ar"] = line.strip()
            elif section == "text":
                if has_english(line) and not has_arabic(line):
                    curr_en_text = line
                elif has_arabic(line):
                    if curr_en_text:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": curr_en_text,
                            "paragraphAr": line
                        })
                        curr_en_text = ""
                    else:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": "",
                            "paragraphAr": line
                        })
                elif has_english(line) and has_arabic(line):
                    text_paras.append({
                        "order": len(text_paras) + 1,
                        "paragraphEn": line,
                        "paragraphAr": line
                    })
            elif section == "qa":
                if ("?" in line or "؟" in line) and len(line) > 10:
                    qa_list.append({
                        "id": f"sec1_ch{cnum}_qa_{len(qa_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "sb_wb"
                    })
                elif qa_list and not qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] = line
                elif qa_list and qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] += "\n" + line
            elif section == "critical":
                if ("?" in line or "؟" in line) and len(line) > 10:
                    crit_list.append({
                        "id": f"sec1_ch{cnum}_crit_{len(crit_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "critical_thinking"
                    })
                elif crit_list and not crit_list[-1]["answer"]:
                    crit_list[-1]["answer"] = line
                elif crit_list and crit_list[-1]["answer"]:
                    crit_list[-1]["answer"] += "\n" + line
            elif section == "exam":
                if len(line) > 10:
                    exam_list.append({
                        "id": f"sec1_ch{cnum}_exam_{len(exam_list)+1}",
                        "question": line,
                        "answer": "سؤال امتحاني وزاري معتمد يتطلب استيعاباً دقيقاً لمعاني الصمود والرمزية في رواية العجوز والبحر.",
                        "type": "homework"
                    })

        chap_obj = {
            "id": f"sc_sec_1_ch_{cnum}",
            "chapterNumber": cnum,
            "titleEn": ten,
            "titleAr": tar,
            "term": "first" if cnum <= 3 else "second",
            "summaryEn": points[0]["en"] if points else f"Chapter {cnum}: {ten}",
            "summaryAr": points[0]["ar"] if points else f"الفصل {cnum}: {tar}",
            "chapterInPoints": points,
            "vocabulary": [
                {"word": "saláo", "meaningAr": "أسوأ أنواع سوء الحظ"},
                {"word": "skiff", "meaningAr": "قارب صيد صغير خفيف"},
                {"word": "harpoon", "meaningAr": "حربة صيد الأسماك الكبيرة"},
                {"word": "endurance", "meaningAr": "الصمود والجلد وتحمل المشاق"},
                {"word": "gaff", "meaningAr": "خطاف معدني لجذب الصيد"},
                {"word": "marlin", "meaningAr": "سمكة المارلين العملاقة ذات السيف"},
                {"word": "scavenger", "meaningAr": "مخلوق مفترس أو ناهش للفضلات"}
            ],
            "theText": text_paras,
            "questionsAndAnswers": qa_list,
            "importantQuestions": crit_list if crit_list else [q for q in qa_list if any(kw in q["question"].lower() for kw in ["symbolize", "why", "how"])],
            "homeworkQuestions": exam_list,
            "mcqQuestions": [
                {
                    "id": f"mcq_sec1_ch{cnum}_1",
                    "question": f"What key moral lesson is demonstrated in Chapter {cnum} ({ten})?",
                    "options": [
                        points[0]["en"] if points else "Endurance and quiet dignity triumph over physical pain",
                        "Material wealth is more important than personal honor",
                        "Santiago regrets choosing the fisherman's life",
                        "Giving up early prevents unnecessary suffering"
                    ],
                    "correctAnswer": points[0]["en"] if points else "Endurance and quiet dignity triumph over physical pain",
                    "explanation": "Santiago embodies persistent effort, self-respect, and unbreakable determination."
                },
                {
                    "id": f"mcq_sec1_ch{cnum}_2",
                    "question": "How does Santiago view his relationship with the great marlin?",
                    "options": [
                        "As a brother and noble opponent worthy of reverence",
                        "As a cruel enemy to be hated and reviled",
                        "As an easy catch with no real challenge",
                        "With indifference and emotional detachment"
                    ],
                    "correctAnswer": "As a brother and noble opponent worthy of reverence",
                    "explanation": "Santiago respects the fish's majesty, courage, and equality in the great web of nature."
                }
            ]
        }
        story["chapters"].append(chap_obj)
        print(f"Sec 1 Chapter {cnum}: {ten} parsed successfully.")

    out_file = os.path.join(output_dir, "sec1-story.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    print(f"Saved: {out_file}\n")

# ==============================================================================
# 4. PARSE PREP 3: THE SCHOOL GARDEN PROJECT
# ==============================================================================
def parse_prep3():
    lines = get_lines("media_1794587867252_6b9ee57b.docx")
    
    story = {
        "id": "story_prep_3_garden_project",
        "gradeCode": "prep_3",
        "gradeLabelAr": "الصف الثالث الإعدادي",
        "gradeLabelEn": "Third Preparatory",
        "term": "full_year",
        "termLabelAr": "المنهج المطور للشهادة الإعدادية 2026/2027",
        "termLabelEn": "Official 2026/2027 Novella",
        "titleAr": "مشروع حديقة المدرسة",
        "titleEn": "The School Garden Project",
        "author": "Ministry of Education (وزارة التربية والتعليم)",
        "aboutAuthorEn": "Official English reader written and published by the Ministry of Education for Third Preparatory students (Connect Plus & New Hello!).",
        "aboutAuthorAr": "القصة الرسمية المقررة والمطورة من وزارة التربية والتعليم لطلاب الشهادة الإعدادية للعام الدراسي 2026/2027.",
        "coverImage": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "القصة الملهمة المقررة للشهادة الإعدادية 2026/2027: كيف حوّلت زينة ورفاقها فناء المدرسة المهمل إلى واحة بيئية خضراء بفضل المبادرة والعمل الجماعي والصدق في القيادة.",
        "descriptionEn": "An uplifting educational story for Third Prep: Zeina and her classmates transform a barren, concrete playground into a vibrant school garden through teamwork, initiative, and determination.",
        "plotSummaryEn": "Zeina, a new student at a preparatory school, notices the empty, gray, concrete playground covered in trash. She dreams of transforming it into a lush garden. Despite early skepticism from peers, she presents a proposal to the student council with the encouragement of Ms. Hoda, the biology teacher. Together with Nancy, Amal, Noha, and Sarah, they encounter weather setbacks, dead seedlings, and resource shortages. Through innovative eco-friendly techniques, shared responsibility, and honest leadership, they build a thriving garden that feeds the cafeteria and inspires the entire school community.",
        "plotSummaryAr": "تلاحظ زينة، الطالبة الجديدة في المدرسة الإعدادية، كآبة فناء المدرسة الخرساني وتراكم القمامة، فتفكر في تحويله إلى حديقة خضراء تجمع الطلاب. بدعم من معلمة الأحياء مس هدى، تقدم مقترحاً لمجلس الطلاب. تشكل فريقاً متميزاً يضم نانسي وأمل ونهى وسارة. يواجه الفريق أمطاراً غزيرة وتلفاً في النباتات، لكن الإصرار والأساليب البيئية المستدامة والقيادة الصادقة تتوج جهودهم بإنشاء حديقة نموذجية تثمر خضروات طازجة للمقصف وتغير ثقافة المدرسة بأسرها.",
        "characters": [
            {
                "name": "Zeina (زينة)",
                "role": "The Visionary Leader",
                "roleAr": "الطالبة الجديدة وقائدة المبادرة",
                "descriptionEn": "A curious, proactive, and honest new student who conceives the school garden project, unites diverse classmates, and becomes student council president.",
                "descriptionAr": "طالبة جديدة فضولية وشجاعة، تبادر بفكرة الحديقة المدرسية وتتحمل المسؤولية وتقود الفريق بالصدق والتواضع.",
                "isMain": True
            },
            {
                "name": "Nancy (نانسي)",
                "role": "The Practical Craftsman",
                "roleAr": "الصديقة الماهرة في استخدام الأدوات",
                "descriptionEn": "Zeina's first friend at school, honest about her feelings, skilled with tools, who discovers a passion for agriculture.",
                "descriptionAr": "أول صديقة لزينة، صريحة وماهرة في استخدام أدوات النجارة والزراعة، واكتشفت شغفها بدراسة العلوم الزراعية.",
                "isMain": True
            },
            {
                "name": "Amal (أمل)",
                "role": "The Dedicated Gardener",
                "roleAr": "الطالبة القوية التي تغلبت على الإحباط",
                "descriptionEn": "A strong, hardworking student who nearly quits after heavy rain destroys early crops, but emerges as the most devoted gardener.",
                "descriptionAr": "طالبة قوية شعرت بالإحباط بعد تلف الشتلات بالأمطار، لكنها بإصرار أصبحت أشد أعضاء الفريق تفانياً وحرصاً على ري الحديقة.",
                "isMain": True
            },
            {
                "name": "Ms. Hoda (مس هدى)",
                "role": "The Supportive Biology Teacher",
                "roleAr": "معلمة الأحياء الداعمة والمشجعة",
                "descriptionEn": "An inspiring educator who mentors Zeina, validates her initiative, and bridges connections across the student body.",
                "descriptionAr": "معلمة أحياء قديرة آمنت بفكرة زينة وساعدتها في تنظيم العرض والتواصل مع مختلف الطلاب.",
                "isMain": True
            },
            {
                "name": "Noha (نهى)",
                "role": "The Creative Artist",
                "roleAr": "الفنانة المبدعة",
                "descriptionEn": "A talented student whose painted signs, decorative boards, and artwork enrich the garden's visual charm.",
                "descriptionAr": "طالبة موهوبة زيّنت الحديقة باللافتات والرسومات الجميلة وألهمت الجميع بنشر الفنون في المدرسة.",
                "isMain": False
            }
        ],
        "themes": [
            {
                "themeEn": "Proactive Initiative and Responsibility",
                "themeAr": "المبادرة الإيجابية وتحمل المسؤولية",
                "descriptionEn": "Real leadership begins with observing a communal problem and taking constructive ownership rather than passively complaining.",
                "descriptionAr": "القيادة الحقيقية تبدأ برؤية المشكلة وتحمل المسؤولية العملية لحلها بدلاً من الشكوى والتذمر."
            },
            {
                "themeEn": "Environmental Responsibility",
                "themeAr": "المسؤولية البيئية والزراعة النظيفة",
                "descriptionEn": "Adopting eco-friendly methods, natural fertilizers, and zero harmful chemicals protects the soil and models sustainable living.",
                "descriptionAr": "تطبيق الزراعة الصديقة للبيئة واستخدام الأسمدة الطبيعية وتدوير المخلفات لحماية التربة والمناخ."
            },
            {
                "themeEn": "Teamwork and Diverse Talents",
                "themeAr": "العمل الجماعي وتكامل المواهب",
                "descriptionEn": "Every individual possesses unique strengths; when combined respectfully, small ideas blossom into transformative communal reality.",
                "descriptionAr": "كل طالب يمتلك ميزة خاصة، وعندما تتحد السواعد باحترام متبادل تتحقق أعظم الإنجازات."
            }
        ],
        "chapters": []
    }

    chap_defs = [
        (1, "A New Challenge", "تحدٍ جديد", "chapter anew"),
        (2, "Taking Initiative and Building a Team", "المبادرة وبناء فريق عمل", "taking initiative and building a team"),
        (3, "Facing Problems with Determination", "مواجهة المشكلات بإصرار", "facing problems with determination"),
        (4, "Growing Success", "تحقيق النجاح", "growing success"),
        (5, "The Impact of Growth", "أثر النمو", "impact of growth"),
        (6, "Looking Forward", "التطلع للأمام", "looking forward")
    ]

    c_indices = []
    for cnum, ten, tar, key in chap_defs:
        f_idx = -1
        for i, l in enumerate(lines):
            norm = l.lower()
            if key in norm or (cnum == 1 and "chapter anew" in norm) or (cnum == 4 and "growing" in norm and "success" in norm):
                f_idx = i
                break
        c_indices.append((cnum, ten, tar, f_idx))
        
    for k in range(len(c_indices)):
        cnum, ten, tar, start_idx = c_indices[k]
        end_idx = c_indices[k+1][3] if k+1 < len(c_indices) else len(lines)
        chap_lines = lines[start_idx:end_idx]
        
        vocab = []
        points = []
        text_paras = []
        qa_list = []
        crit_list = []
        hw_list = []
        
        section = "vocab"
        curr_en_text = ""
        
        for line in chap_lines:
            ll = line.lower()
            if "key points" in ll or "أهم النقاط" in line:
                section = "points"
                continue
            elif any(s in ll for s in ["zeina was a new student", "zeina decided to take", "the project started", "after three months", "at the end of the school", "the next year, zeina was chosen"]):
                section = "text"
            elif "answer the following" in ll or "اجابات الكتاب" in line:
                section = "qa"
                continue
            elif "critical thinking" in ll or "تفكير نقدي" in line:
                section = "critical"
                continue
            elif "exercises on chapter" in ll or "choose the correct" in ll:
                section = "exercises"
                continue

            if section == "vocab":
                words = re.findall(r'([a-zA-Z\s\(\)\.\,\'-]+)\s+([\u0600-\u06FF\s/]+)', line)
                for w_en, w_ar in words:
                    w_en = w_en.strip()
                    w_ar = w_ar.strip()
                    if len(w_en) > 2 and len(w_ar) > 1 and not is_header_or_page(w_en):
                        vocab.append({"word": w_en, "meaningAr": w_ar})
            elif section == "points":
                if any(line.startswith(pfx) for pfx in ["©", "@", "•", "s@", "هر", "جر", "حمر", "خهر"]):
                    if has_english(line):
                        clean_pt = re.sub(r'^[©@•s@هرجرخمر\d\.\s\(\)]+', '', line).strip()
                        points.append({"en": clean_pt, "ar": ""})
                    elif has_arabic(line) and points:
                        points[-1]["ar"] = line.strip()
                elif has_arabic(line) and points and not points[-1]["ar"]:
                    points[-1]["ar"] = line.strip()
            elif section == "text":
                if has_english(line) and not has_arabic(line):
                    curr_en_text = line
                elif has_arabic(line):
                    if curr_en_text:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": curr_en_text,
                            "paragraphAr": line
                        })
                        curr_en_text = ""
                    else:
                        text_paras.append({
                            "order": len(text_paras) + 1,
                            "paragraphEn": "",
                            "paragraphAr": line
                        })
                elif has_english(line) and has_arabic(line):
                    text_paras.append({
                        "order": len(text_paras) + 1,
                        "paragraphEn": line,
                        "paragraphAr": line
                    })
            elif section == "qa":
                if ("?" in line or "؟" in line) and len(line) > 10:
                    qa_list.append({
                        "id": f"prep3_ch{cnum}_qa_{len(qa_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "sb_wb"
                    })
                elif qa_list and not qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] = line
                elif qa_list and qa_list[-1]["answer"]:
                    qa_list[-1]["answer"] += "\n" + line
            elif section == "critical":
                if ("?" in line or "؟" in line) and len(line) > 10:
                    crit_list.append({
                        "id": f"prep3_ch{cnum}_crit_{len(crit_list)+1}",
                        "question": line,
                        "answer": "",
                        "type": "critical_thinking"
                    })
                elif crit_list and not crit_list[-1]["answer"]:
                    crit_list[-1]["answer"] = line
                elif crit_list and crit_list[-1]["answer"]:
                    crit_list[-1]["answer"] += "\n" + line
            elif section == "exercises":
                if len(line) > 15:
                    hw_list.append({
                        "id": f"prep3_ch{cnum}_ex_{len(hw_list)+1}",
                        "question": line,
                        "answer": "تدريب تطبيقي على استيعاب أحداث الفصل والمفردات اللغوية الجديدة.",
                        "type": "homework"
                    })

        clean_vocab = []
        seen = set()
        for v in vocab:
            k_v = v["word"].lower().strip()
            if k_v not in seen and len(k_v) > 2:
                seen.add(k_v)
                clean_vocab.append(v)

        chap_obj = {
            "id": f"sc_prep_3_ch_{cnum}",
            "chapterNumber": cnum,
            "titleEn": ten,
            "titleAr": tar,
            "term": "first" if cnum <= 3 else "second",
            "summaryEn": points[0]["en"] if points else f"Chapter {cnum}: {ten}",
            "summaryAr": points[0]["ar"] if points else f"الفصل {cnum}: {tar}",
            "chapterInPoints": points,
            "vocabulary": clean_vocab if clean_vocab else [
                {"word": "initiative", "meaningAr": "المبادرة"},
                {"word": "eco-friendly", "meaningAr": "صديق للبيئة"},
                {"word": "determination", "meaningAr": "العزيمة والإصرار"},
                {"word": "proposal", "meaningAr": "مقترح عملي"},
                {"word": "fertilizer", "meaningAr": "سماد طبيعي"}
            ],
            "theText": text_paras,
            "questionsAndAnswers": qa_list,
            "importantQuestions": crit_list if crit_list else [q for q in qa_list if any(kw in q["question"].lower() for kw in ["why", "how", "what"])],
            "homeworkQuestions": hw_list,
            "mcqQuestions": [
                {
                    "id": f"mcq_prep3_ch{cnum}_1",
                    "question": f"What is the main achievement described in Chapter {cnum} ({ten})?",
                    "options": [
                        points[0]["en"] if points else "The students work as an integrated team to improve the school environment",
                        "The students decide to close the garden project permanently",
                        "Zeina moves to another school and stops participating",
                        "The school playground is paved with more asphalt"
                    ],
                    "correctAnswer": points[0]["en"] if points else "The students work as an integrated team to improve the school environment",
                    "explanation": "Chapter events showcase student collaboration, creative problem-solving, and communal pride."
                },
                {
                    "id": f"mcq_prep3_ch{cnum}_2",
                    "question": "What leadership quality does Zeina demonstrate?",
                    "options": [
                        "Taking responsibility, admitting limitations honestly, and encouraging everyone's talents",
                        "Blaming other students whenever problems occur",
                        "Doing all the work alone without listening to teammates",
                        "Quitting the project as soon as difficulties arise"
                    ],
                    "correctAnswer": "Taking responsibility, admitting limitations honestly, and encouraging everyone's talents",
                    "explanation": "True leadership fosters shared purpose, mutual respect, and honest communication."
                }
            ]
        }
        story["chapters"].append(chap_obj)
        print(f"Prep 3 Chapter {cnum}: {ten} parsed successfully.")

    out_file = os.path.join(output_dir, "prep3-story.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(story, f, ensure_ascii=False, indent=2)
    print(f"Saved: {out_file}\n")

# ==============================================================================
# 5. PARSE PREP 2: THE LITTLE INVENTOR & THE ADVENTURE OF THE HIDDEN ISLAND
# ==============================================================================
def parse_prep2():
    lines = get_lines("media_1794587867254_76a8c8d0.docx")
    
    # Story 1: The Little Inventor (Amal) - Term 1
    story1 = {
        "id": "story_prep_2_little_inventor",
        "gradeCode": "prep_2",
        "gradeLabelAr": "الصف الثاني الإعدادي",
        "gradeLabelEn": "Second Preparatory",
        "term": "first",
        "termLabelAr": "الفصل الدراسي الأول 2026/2027",
        "termLabelEn": "First Term 2026/2027",
        "titleAr": "المخترعة الصغيرة (معرض الإبداع)",
        "titleEn": "The Little Inventor",
        "author": "Ministry of Education (وزارة التربية والتعليم)",
        "aboutAuthorEn": "Official reader for Second Preparatory students promoting innovation, resilience, and digital safety.",
        "aboutAuthorAr": "القصة المقررة لطلاب الصف الثاني الإعدادي الهادفة إلى غرس قيم الابتكار والثبات والمسؤولية الرقمية.",
        "coverImage": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "قصة الطالبة المبدعة أمل التي تواجه سخرية بعض زملائها بصناعة روبوت متكلم لمعرض الإبداع المدرسي، متسلحة بالثقة بالنفس ودعم الصداقة الحقيقية والمسؤولية الرقمية.",
        "descriptionEn": "The inspiring journey of Amal, an imaginative girl who builds a talking robot for the school Creative Fair, learning perseverance, self-confidence, and responsible digital research.",
        "plotSummaryEn": "Amal loves building innovative machines from discarded toys and wires, though some peers mock her. Supported by her parents and best friend Yara, she decides to construct a talking robot for the school Creative Fair. When the robot malfunctions and wires break on the eve of the fair, Amal refuses to quit. By responsibly researching solutions online without copying others' work, she overcomes every obstacle. Her talking robot delivers an inspiring message of self-belief, winning the heartfelt admiration of teachers and classmates.",
        "plotSummaryAr": "تعشق أمل ابتكار الآلات المفيدة من الأسلاك والألعاب القديمة في غرفتها. عندما يُعلن المعلم عن معرض الإبداع، تقرر صناعة روبوت متكلم بمساعدة صديقتها المخلصة يارا. تواجه انقطاع الأسلاك وتعطل الصوت وسخرية البعض، لكنها تثابر وتبحث في مصادر موثوقة عبر الإنترنت بأمان دون نسخ أعمال الآخرين. في يوم المعرض، يرمش الروبوت وينطق بعبارة: 'كن نفسك ولا تستسلم أبداً'، لتنال أمل تقدير الجميع على إبداعها وأمانتها.",
        "characters": [
            {
                "name": "Amal (أمل)",
                "role": "The Young Inventor",
                "roleAr": "المخترعة الصغيرة وبطلة القصة",
                "descriptionEn": "A curious, creative girl who loves building machines and perseveres through technical failures and peer criticism.",
                "descriptionAr": "فتاة فضولية ومبدعة تعشق التكنولوجيا والاختراع، وتتعلم التمسك بهويتها والمثابرة حتى النجاح.",
                "isMain": True
            },
            {
                "name": "Yara (يارا)",
                "role": "The Loyal Best Friend",
                "roleAr": "الصديقة المخلصة والداعمة",
                "descriptionEn": "Amal's compassionate friend who shares creative ideas, shows deep empathy, and encourages her never to give up.",
                "descriptionAr": "صديقة أمل المقربة التي تساندها بالتشجيع والتعاطف والأفكار المبتكرة في أصعب اللحظات.",
                "isMain": True
            },
            {
                "name": "Amal's Parents (والدا أمل)",
                "role": "The Encouraging Mentors",
                "roleAr": "الوالدان الحكيمان",
                "descriptionEn": "Loving parents who teach Amal that her unique identity is her greatest strength and encourage her to express herself freely.",
                "descriptionAr": "يدعمان موهبة ابنتهما ويرسخان فيها قيم الثقة بالنفس والاعتزاز بالهوية الخاصة.",
                "isMain": False
            },
            {
                "name": "The Teacher (المعلمة)",
                "role": "The Creative Fair Organizer",
                "roleAr": "معلمة الفصل ومنظمة المعرض",
                "descriptionEn": "A dedicated teacher who organizes the Creative Fair and commends Amal's integrity, hard work, and digital responsibility.",
                "descriptionAr": "تنظم معرض الإبداع المدرسي وتشيد بإصرار أمل وأمانتها العلمية أمام جميع الطلاب.",
                "isMain": False
            }
        ],
        "themes": [
            {
                "themeEn": "Perseverance in the Face of Failure",
                "themeAr": "المثابرة وتجاوز عثرات البداية",
                "descriptionEn": "Errors and broken wires are opportunities for learning; giving up guarantees defeat, but persistent effort unlocks breakthrough.",
                "descriptionAr": "الأخطاء والانكسارات جزء من رحلة التعلم، والنجاح الحقيقي ثمرة مواصلة المحاولة وعدم اليأس."
            },
            {
                "themeEn": "Digital Responsibility and Academic Honesty",
                "themeAr": "المسؤولية الرقمية والأمانة العلمية",
                "descriptionEn": "Using trustworthy sources, asking permission, protecting private data, and never copying others' work without attribution.",
                "descriptionAr": "استخدام الإنترنت بوعي وحماية البيانات الشخصية والاعتماد على المصادر الموثوقة دون سرقة أعمال الآخرين."
            }
        ],
        "chapters": [
            {
                "id": "sc_prep_2_ch_1",
                "chapterNumber": 1,
                "titleEn": "The Creative Fair",
                "titleAr": "المعرض الإبداعي",
                "term": "first",
                "summaryEn": "Amal decides to build a talking robot for the school Creative Fair, supported by her family and Yara.",
                "summaryAr": "تقرر أمل ابتكار روبوت متكلم للمشاركة في معرض الإبداع، متسلحة بالتشجيع وبحث الإنترنت الآمن.",
                "chapterInPoints": [
                    {"en": "Amal was a curious girl who loved building machines from old toys.", "ar": "كانت أمل فتاة فضولية تحب صنع الآلات من الألعاب القديمة."},
                    {"en": "Her parents advised her that her unique identity makes her special.", "ar": "أخبرها والداها أن هويتها وتميزها هما سر نجاحها."},
                    {"en": "The teacher announced a Creative Fair for all passionate students.", "ar": "أعلنت المعلمة عن معرض الإبداع لجميع الطلاب."},
                    {"en": "Amal decided to build a talking robot with Yara's encouragement.", "ar": "قررت أمل صناعة روبوت ناطق بتشجيع من صديقتها يارا."},
                    {"en": "She practiced digital responsibility by asking permission before downloading.", "ar": "مارست المسؤولية الرقمية بطلب الإذن وحماية بياناتها."}
                ],
                "vocabulary": [
                    {"word": "curious", "meaningAr": "فضولي ومحب للاستكشاف"},
                    {"word": "identity", "meaningAr": "الهوية الشخصية"},
                    {"word": "passionate", "meaningAr": "شغوف ومتحمس"},
                    {"word": "digital responsibility", "meaningAr": "المسؤولية الرقمية"},
                    {"word": "talking robot", "meaningAr": "روبوت متكلم"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "In a village, there lived a curious girl named Amal. Amal loved to build things. Her room was full of old toys, wires, and little machines she had created. Sometimes, other children annoyed her and said, 'You are strange.' But Amal's parents always told her, 'Your identity is what makes you special. Never be afraid to express who you are.'",
                        "paragraphAr": "في إحدى القرى، عاشت فتاة فضولية تدعى أمل. كانت تحب صنع الأشياء، وكانت غرفتها مليئة بالألعاب القديمة والأسلاك والآلات الصغيرة التي ابتكرتها. كان بعض الأطفال يضايقونها قائلين: 'أنتِ غريبة'، لكن والديها كانا يذكرانها دائماً: 'هويتكِ هي ما يجعلكِ مميزة، فلا تخافي أبداً من التعبير عن نفسكِ'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "One day, the teacher announced a Creative Fair. Amal decided to build a talking robot! Her best friend, Yara, encouraged her, 'Just be yourself, Amal. We believe in you.' Amal started working day and night, making sure to use the internet safely, asking permission before downloading anything.",
                        "paragraphAr": "في يوم من الأيام، أعلنت المعلمة عن معرض الإبداع المدرسي. قررت أمل صنع روبوت متكلم! وشجعتها صديقتها المقربة يارا: 'كوني على طبيعتكِ يا أمل، نحن نثق بكِ'. وبدأت أمل العمل ليلاً ونهاراً مع الحرص على تصفح الإنترنت بأمان وطلب الإذن قبل تنزيل أي محتوى."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep2_ch1_qa_1", "question": "What kind of things did Amal like to build?", "answer": "She liked to build little machines and devices from old toys and wires."},
                    {"id": "prep2_ch1_qa_2", "question": "What steps did Amal take to stay safe online?", "answer": "She asked for permission before downloading anything and never shared personal information."}
                ],
                "importantQuestions": [
                    {"id": "prep2_ch1_crit_1", "question": "Why is having a friend like Yara a valuable support?", "answer": "Because Yara provides unconditional encouragement, shares constructive ideas, and helps Amal feel strong."}
                ],
                "homeworkQuestions": [
                    {"id": "prep2_ch1_hw_1", "question": "Explain how Amal's parents helped shape her self-confidence.", "answer": "By reinforcing that uniqueness and individual identity are strengths rather than reasons to feel ashamed."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep2_ch1_1",
                        "question": "What project did Amal choose to present at the Creative Fair?",
                        "options": ["A talking robot", "A dancing doll", "A paper airplane", "A painted canvas"],
                        "correctAnswer": "A talking robot",
                        "explanation": "Amal selected a talking robot to showcase her passion for invention and mechanics."
                    }
                ]
            },
            {
                "id": "sc_prep_2_ch_2",
                "chapterNumber": 2,
                "titleEn": "Never Stop Trying",
                "titleAr": "لا تتوقف عن المحاولة",
                "term": "first",
                "summaryEn": "Facing technical breakdowns and peer mockery, Amal perseveres with Yara's empathy and trustworthy digital learning.",
                "summaryAr": "تواجه أمل انقطاع الأسلاك وتعطل الروبوت، لكنها ترفض الاستسلام وتصلح الأعطال خطوة بخطوة.",
                "chapterInPoints": [
                    {"en": "Amal faced repeated problems with broken wires and a mute robot.", "ar": "واجهت أمل مشكلات متكررة في انقطاع الأسلاك وصمت الروبوت."},
                    {"en": "Some children laughed behind her back, tempting her to quit.", "ar": "سخر بعض الأطفال منها، مما جعلها تفكر في التراجع."},
                    {"en": "She remembered her parents' advice and decided to persevere.", "ar": "تذكرت نصيحة والديها وقررت مواصلة المحاولة بعزم."},
                    {"en": "Yara showed empathy, reminding her that mistakes help us learn.", "ar": "أظهرت يارا تعاطفاً كبيراً وأكدت لها أن الأخطاء تعلمنا."},
                    {"en": "Amal consulted trustworthy online sources and fixed the robot.", "ar": "اعتمدت أمل على مصادر موثوقة وأصلحت الروبوت خطوة بخطوة."}
                ],
                "vocabulary": [
                    {"word": "persevere", "meaningAr": "يثابر ويواصل المحاولة"},
                    {"word": "empathy", "meaningAr": "التعاطف ومشاركة المشاعر"},
                    {"word": "frustrated", "meaningAr": "محبط ومنزعج"},
                    {"word": "trustworthy", "meaningAr": "موثوق وآمن"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "As the fair day came closer, Amal faced many problems. The robot wouldn't talk, and the wires kept breaking. Some children laughed behind her back. But she remembered her parents' words and decided to persevere: 'I won't give up. I will fix this.'",
                        "paragraphAr": "مع اقتراب يوم المعرض، واجهت أمل مشكلات كثيرة؛ فالروبوت لم يتكلم، والأسلاك انقطعت مراراً، وضحك بعض الأطفال من خلفها. لكنها تذكرت وصية والديها وقررت الثبات: 'لن أستسلم، سأصلح هذا الخلل'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "Yara helped her by showing empathy: 'It's okay to make mistakes. You can do it.' Little by little, Amal checked trustworthy sources online and solved each technical issue without copying. The night before the fair, the robot blinked its eyes and said: 'Hello!'",
                        "paragraphAr": "ساندتها يارا بتعاطف: 'لا بأس في ارتكاب الأخطاء، أنتِ قادرة على النجاح'. وشيئاً فشيئاً، راجعت أمل مصادر آمنة وحلت المشكلات بجهدها الخاص. وفي الليلة السابقة للمعرض، رمش الروبوت وقال: 'مرحباً!'."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep2_ch2_qa_1", "question": "Why did Yara say 'It's okay to make mistakes'?", "answer": "To comfort Amal, relieve her frustration, and encourage her to keep trying until she succeeded."}
                ],
                "importantQuestions": [
                    {"id": "prep2_ch2_crit_1", "question": "What does Amal's reaction to technical failure teach us about resilience?", "answer": "That true resilience means confronting difficulty with problem-solving rather than giving in to despair."}
                ],
                "homeworkQuestions": [
                    {"id": "prep2_ch2_hw_1", "question": "Describe the moment the robot finally spoke.", "answer": "On the night before the fair, the robot blinked its eyes and said 'Hello!', filling Amal and Yara with joy."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep2_ch2_1",
                        "question": "What value did Amal demonstrate by not copying other people's designs?",
                        "options": ["Academic honesty", "Impatience", "Competition", "Hesitation"],
                        "correctAnswer": "Academic honesty",
                        "explanation": "Amal respected original work and practiced genuine intellectual integrity."
                    }
                ]
            },
            {
                "id": "sc_prep_2_ch_3",
                "chapterNumber": 3,
                "titleEn": "Inspiring Success",
                "titleAr": "نجاح ملهم",
                "term": "first",
                "summaryEn": "Amal's robot inspires the whole school with its message 'Be yourself. Never give up!', earning praise for honesty and determination.",
                "summaryAr": "ينطق الروبوت بعبارة 'كن نفسك ولا تستسلم'، محققاً إعجاب المعلمين والطلاب بروح المثابرة والأمانة.",
                "chapterInPoints": [
                    {"en": "All children displayed their creative projects proudly at the fair.", "ar": "عرض جميع الطلاب مشروعاتهم الابتكارية بفخر في المعرض."},
                    {"en": "Amal's robot spoke clearly: 'Be yourself. Never give up!'", "ar": "نطق روبوت أمل بوضوح: 'كن نفسك، ولا تستسلم أبداً!'."},
                    {"en": "Former skeptics applauded and admired her creativity and effort.", "ar": "صفق من سخروا منها سابقاً مبدين إعجابهم باجتهادها وإبداعها."},
                    {"en": "The teacher praised Amal's determination, honesty, and character.", "ar": "أشادت المعلمة بإصرار أمل وأمانتها وشخصيتها الأصيلة."},
                    {"en": "Amal felt true victory because she remained authentic and helped others.", "ar": "شعرت أمل بالفوز الحقيقي لأنها عبرت عن نفسها بصدق وألهمت زملاءها."}
                ],
                "vocabulary": [
                    {"word": "inspiring", "meaningAr": "ملهم ومحفز للآخرين"},
                    {"word": "determination", "meaningAr": "الإصرار والعزيمة"},
                    {"word": "honesty", "meaningAr": "الأمانة والصدق"},
                    {"word": "creativity", "meaningAr": "الإبداع والابتكار"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "On the day of the fair, Amal stood proudly with her robot. When she presented it, the robot spoke: 'Be yourself. Never give up!' Everyone clapped. The children who once laughed now admired Amal's hard work and creativity.",
                        "paragraphAr": "في يوم المعرض، وقفت أمل بفخر بجوار روبوتها. وعندما قدمت العرض، تكلم الروبوت: 'كن على طبيعتك، ولا تستسلم أبداً!'. صفق الجميع بحرارة، وأبدى من سخروا منها سابقاً إعجابهم باجتهادها وابتكارها."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "The teacher smiled and said, 'Amal, you showed determination and honesty. You worked hard without giving up, and you stayed true to who you are.' From that day on, Amal inspired others to follow their dreams.",
                        "paragraphAr": "ابتسمت المعلمة وقالت: 'يا أمل، لقد أظهرتِ عزيمة وأمانة استثنائيتين؛ عملتِ بجد دون استسلام وبقيتِ مخلصة لنفسكِ'. ومنذ ذلك الحين، غدت أمل مصدر إلهام لزملائها لتحقيق أحلامهم."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep2_ch3_qa_1", "question": "What inspirational message did the robot share?", "answer": "'Be yourself. Never give up!'"}
                ],
                "importantQuestions": [
                    {"id": "prep2_ch3_crit_1", "question": "Why was the teacher's commendation focused on values rather than just technology?", "answer": "Because character traits like persistence, ethical conduct, and authenticity are far more enduring and meaningful than mere mechanical skill."}
                ],
                "homeworkQuestions": [
                    {"id": "prep2_ch3_hw_1", "question": "How did Amal's presentation transform peer relationships in her school?", "answer": "It replaced mockery with mutual respect and inspired other students to pursue creative goals."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep2_ch3_1",
                        "question": "What was the real victory Amal celebrated at the end of the fair?",
                        "options": ["Expressing herself honestly and inspiring others", "Winning a gold medal", "Defeating her classmates", "Selling the robot for money"],
                        "correctAnswer": "Expressing herself honestly and inspiring others",
                        "explanation": "True victory was personal growth, integrity, and inspiring positive change."
                    }
                ]
            }
        ]
    }

    # Story 2: The Adventure of the Hidden Island (Hany, Faris, Malik, Sami) - Term 2
    story2 = {
        "id": "story_prep_2_hidden_island",
        "gradeCode": "prep_2",
        "gradeLabelAr": "الصف الثاني الإعدادي",
        "gradeLabelEn": "Second Preparatory",
        "term": "second",
        "termLabelAr": "الفصل الدراسي الثاني 2026/2027",
        "termLabelEn": "Second Term 2026/2027",
        "titleAr": "مغامرة الجزيرة المخفية",
        "titleEn": "The Adventure of the Hidden Island",
        "author": "Ministry of Education (وزارة التربية والتعليم)",
        "aboutAuthorEn": "Official preparatory reader highlighting youth exploration, natural appreciation, and collaborative leadership.",
        "aboutAuthorAr": "قصة مقررة لطلاب المرحلة الإعدادية تبرز قيم الاستكشاف واحترام البيئة والقيادة بالمشاركة والمحبة.",
        "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "مغامرة شيقة لأربعة أصدقاء يستكشفون جزيرة ساحرة عبر البحر وفق قاعدة ذهبية: 'لا يوجد رئيس، بل نعمل معاً ونستمع لأفكار الجميع باحترام ومسؤولية'.",
        "descriptionEn": "Four friends embark on a voyage to a mysterious island, learning that true freedom means mutual respect, safety, and creative collaboration.",
        "plotSummaryEn": "In a peaceful coastal town, four friends—Hany, Faris, Malik, and Sami—discover an old map of a Hidden Island. They set sail with clear rules: no single boss, complete mutual respect, and listening to all voices. On the island, they split safely into pairs, uncovering waterfalls, mysterious caves, and unusual plants. Malik sketches maps, Faris watches over safety, and shy Sami discovers his voice and leadership. They return to their village celebrated as 'The Island Explorers', demonstrating that caring leadership makes everyone shine.",
        "plotSummaryAr": "في بلدة ساحلية هادئة، يجد الأصدقاء الأربعة (هاني وفارس ومالك وسامي) خريطة قديمة لجزيرة مخفية. يقررون الإبحار بميثاق مشترك: لا رئيس متسلط، بل احترام متبادل وحرية مسؤولة. في الجزيرة يكتشفون شلالات وكهوفاً سرية وصخوراً براقة. يرسم مالك الخرائط بفنه، ويسهر فارس على السلامة، بينما يكتشف سامي الخجول ثقته بنفسه ويسهم باكتشاف كهف خفي. يعودون إلى قريتهم ليصبحوا قدوة في القيادة بالتعاون واللطف.",
        "characters": [
            {
                "name": "Hany (هاني)",
                "role": "The Brave Instigator",
                "roleAr": "الصديق الشجاع وصاحب فكرة المغامرة",
                "descriptionEn": "A courageous, dynamic boy with natural enthusiasm who suggests the expedition while championing safety.",
                "descriptionAr": "شاب شجاع وحيوي اقترح خوض المغامرة وحث رفاقه على البقاء قريبين وآمنين.",
                "isMain": True
            },
            {
                "name": "Faris (فارس)",
                "role": "The Thoughtful Guardian",
                "roleAr": "الصديق الحكيم والحريص",
                "descriptionEn": "A thoughtful, prudent boy who emphasizes environmental conservation and leads pairs carefully to avoid hazards.",
                "descriptionAr": "صديق عاقل ومتزن، يذكر الجميع باحترام الطبيعة ويحرص على سلامة زملائه طوال الرحلة.",
                "isMain": True
            },
            {
                "name": "Malik (مالك)",
                "role": "The Creative Artist",
                "roleAr": "الفنان المبدع ورسام الخرائط",
                "descriptionEn": "An observant, artistic friend who sketches natural scenery and illustrates exploratory maps of the island.",
                "descriptionAr": "عضو مبدع يحب الرسم ويوثق المناظر الطبيعية والخرائط الاستكشافية للجزيرة.",
                "isMain": True
            },
            {
                "name": "Sami (سامي)",
                "role": "The Observant Scout",
                "roleAr": "الصديق الخجول ودقيق الملاحظة",
                "descriptionEn": "Initially shy, Sami feels empowered by the team's respect, discovers a hidden cave, and blossoms with newfound confidence.",
                "descriptionAr": "شاب خجول في البداية، وجد في احترام أصدقائه متسعاً ليعبر عن آرائه ويكتشف كهفاً مخفياً ويشعر بحريته الذاتية.",
                "isMain": True
            }
        ],
        "themes": [
            {
                "themeEn": "Responsible Freedom and Respect",
                "themeAr": "الحرية المسؤولة والاحترام المتبادل",
                "descriptionEn": "Freedom is not doing whatever one pleases recklessly, but engaging with nature and fellow humans in harmony, dialogue, and mutual consideration.",
                "descriptionAr": "الحرية الحقيقية ليست فوضى، بل ممارسة واعية تحترم الطبيعة والآخرين وتبني الثقة."
            },
            {
                "themeEn": "Empathetic, Caring Leadership",
                "themeAr": "القيادة بالرعاية والاهتمام",
                "descriptionEn": "'Leadership isn't about being the loudest; it's about caring for others and helping them shine.'",
                "descriptionAr": "القيادة ليست علو الصوت أو التسلط، بل مساعدة كل عضو في الفريق على إبراز أفضل ما لديه."
            }
        ],
        "chapters": [
            {
                "id": "sc_prep_2_ch_4",
                "chapterNumber": 1,
                "titleEn": "Different, but connected",
                "titleAr": "مختلفون، لكنهم مترابطون",
                "term": "second",
                "summaryEn": "The four friends discover an ancient map and set sail under the egalitarian rule: 'No one is the boss.'",
                "summaryAr": "يعثر الأصدقاء على خريطة الجزيرة المخفية وينطلقون في رحلتهم متفقين على المساواة والاحترام التام.",
                "chapterInPoints": [
                    {"en": "In a coastal town, Hany, Faris, Malik, and Sami found an old map of a Hidden Island.", "ar": "في بلدة ساحلية، وجد هاني وفارس ومالك وسامي خريطة قديمة لجزيرة مخفية."},
                    {"en": "They packed food, water, compass, and notebooks, agreeing: 'No one is the boss.'", "ar": "جهزوا طعاماً وماءً وبوصلة ودفاتر، واتفقوا: 'لا رئيس متسلط بيننا'."},
                    {"en": "As they sailed, Malik sketched scenery and shy Sami felt free to share thoughts.", "ar": "أثناء الإبحار، رسم مالك المناظر الطبيعية وشعر سامي بالحرية لطرح أفكاره."},
                    {"en": "Their mutual respect allowed diverse personalities to unite harmoniously.", "ar": "شكّل الاحترام المتبادل جسراً جمع شخصياتهم المختلفة في تناغم تام."}
                ],
                "vocabulary": [
                    {"word": "hidden island", "meaningAr": "جزيرة مخفية"},
                    {"word": "sketch", "meaningAr": "يرسم رسماً أولياً"},
                    {"word": "appreciate", "meaningAr": "يقدّر ويحترم"},
                    {"word": "compass", "meaningAr": "بوصلة ملاحية"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "In a quiet coastal town, a group of friends—Hany, Faris, Malik, and Sami—loved to explore. One sunny morning, they found an old map showing a Hidden Island across the sea. Hany said, 'Let's go on an adventure!' Faris added, 'We have freedom to explore, but we must respect nature and each other.'",
                        "paragraphAr": "في بلدة ساحلية هادئة، عاش أربعة أصدقاء—هاني وفارس ومالك وسامي—يهوون الاستكشاف. في صباح مشمس، عثروا على خريطة قديمة لجزيرة مخفية في عرض البحر. قال هاني: 'هيا في مغامرة!'، وأضاف فارس: 'نملك حرية الاستكشاف، لكن علينا احترام الطبيعة وبعضنا البعض'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "They agreed on one rule: 'No one is the boss. We work together and listen to everyone's ideas.' As they sailed, Malik sketched the scenery while Sami, who was shy, felt free to share his ideas for the first time. They were different, but united in respect.",
                        "paragraphAr": "اتفقوا على قاعدة واحدة: 'لا يوجد رئيس، بل نعمل معاً ونستمع لأفكار الجميع'. وأثناء إبحارهم، رسم مالك المناظر البحرية، بينما شعر سامي الخجول بالحرية لطرح أفكاره لأول مرة؛ كانوا مختلفين في الطباع لكنهم متحدون بالاحترام."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep2_ch4_qa_1", "question": "What key rule did the four friends agree on?", "answer": "'No one is the boss. We work together and listen to everyone's ideas.'"}
                ],
                "importantQuestions": [
                    {"id": "prep2_ch4_crit_1", "question": "Why did Sami feel free to participate for the first time?", "answer": "Because the group cultivated a supportive, egalitarian environment where every opinion was received with genuine respect."}
                ],
                "homeworkQuestions": [
                    {"id": "prep2_ch4_hw_1", "question": "What essential supplies did the boys pack before setting sail?", "answer": "Food, fresh water, a magnetic compass, and drawing notebooks."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep2_ch4_1",
                        "question": "What principle guided the boys' interaction on the boat?",
                        "options": ["Equality and mutual listening", "Obeying a single captain", "Ignoring quiet members", "Speed above all"],
                        "correctAnswer": "Equality and mutual listening",
                        "explanation": "They committed to teamwork with no authoritarian leader."
                    }
                ]
            },
            {
                "id": "sc_prep_2_ch_5",
                "chapterNumber": 2,
                "titleEn": "Freedom and Friendship",
                "titleAr": "الحرية والصداقة",
                "term": "second",
                "summaryEn": "Exploring the island safely in pairs, the boys discover shiny minerals, waterfalls, and a hidden cave, realizing true freedom means collaboration.",
                "summaryAr": "يستكشف الأصدقاء معالم الجزيرة بأمان ويكتشفون شلالات وكهفاً غامضاً، مستنتجين أن الحرية الحقيقية تعني التعاون والاحترام.",
                "chapterInPoints": [
                    {"en": "On the island, the boys saw colorful birds, strange plants, and mysterious caves.", "ar": "في الجزيرة، شاهد الأصدقاء طيوراً زاهية ونباتات فريدة وكهوفاً غامضة."},
                    {"en": "Hany suggested splitting into pairs while maintaining proximity and safety.", "ar": "اقترح هاني الانقسام إلى ثنائيات مع البقاء على مقربة لضمان السلامة."},
                    {"en": "Malik drafted maps while Sami made an exciting discovery of a hidden cave.", "ar": "رسم مالك خرائط جغرافية، بينما اكتشف سامي كهفاً سرياً مذهلاً."},
                    {"en": "Resting near the water, they realized freedom thrives through mutual care.", "ar": "عند استراحتهم بجانب الماء، أدركوا أن الحرية تثمر بالرعاية المتبادلة."}
                ],
                "vocabulary": [
                    {"word": "mysterious cave", "meaningAr": "كهف غامض"},
                    {"word": "waterfall", "meaningAr": "شلال ماء"},
                    {"word": "shiny stones", "meaningAr": "أحجار براقة"},
                    {"word": "safe exploration", "meaningAr": "استكشاف آمن"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "When they reached the Hidden Island, they found strange plants and colorful birds. Hany suggested, 'Let's split into pairs and explore, but stay close and safe.' Faris led carefully, Malik drew maps of the terrain, and Sami proudly showed them a hidden cave he discovered.",
                        "paragraphAr": "عندما وصلوا إلى الجزيرة، وجدوا نباتات بديعة وطيوراً ملونة. اقترح هاني: 'دعونا ننقسم إلى ثنائيات للاستكشاف مع البقاء قريبين وبأمان'. قاد فارس بحذر، ورسم مالك تضاريس الجزيرة، بينما قادهم سامي بفخر إلى كهف خفي اكتشفه بنفسه."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "When tired, they rested by the water. 'I feel free to be myself,' Sami reflected. The friends smiled, knowing freedom wasn't about doing whatever they wanted, but about respecting each other and working together.",
                        "paragraphAr": "وعندما نال منهم التعب، استراحوا بجانب الماء. قال سامي بتأمل: 'أشعر بالحرية لأكون نفسي'. ابتسم الأصدقاء مدركين أن الحرية لا تعني التصرف بلا ضوابط، بل احترام الآخر والعمل المشترك."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep2_ch5_qa_1", "question": "What surprising discovery did Sami make on the island?", "answer": "He discovered a mysterious hidden cave."}
                ],
                "importantQuestions": [
                    {"id": "prep2_ch5_crit_1", "question": "How did the boys define 'freedom' during their rest by the waterfall?", "answer": "They understood that freedom is grounded in mutual respect, active listening, and collective harmony rather than selfish whim."}
                ],
                "homeworkQuestions": [
                    {"id": "prep2_ch5_hw_1", "question": "Why did Hany insist on pairing up instead of solo exploration?", "answer": "To protect everyone from unforeseen hazards on an unfamiliar island."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep2_ch5_1",
                        "question": "What did Malik use his creativity for on the island?",
                        "options": ["Drawing maps of the island", "Building a stone house", "Catching wild birds", "Writing a song"],
                        "correctAnswer": "Drawing maps of the island",
                        "explanation": "Malik utilized his artistic talents to map the terrain."
                    }
                ]
            },
            {
                "id": "sc_prep_2_ch_6",
                "chapterNumber": 3,
                "titleEn": "Teamwork",
                "titleAr": "العمل الجماعي",
                "term": "second",
                "summaryEn": "The boys sail home as 'The Island Explorers', sharing the insight that true leadership is caring for others and helping them shine.",
                "summaryAr": "يعود الأصدقاء كـ 'مستكشفي الجزيرة' ناشرين الحكمة القائلة بأن القيادة الحقيقية هي خدمة الآخرين ومساعدتهم على النجاح.",
                "chapterInPoints": [
                    {"en": "At sunset, the children gathered, realizing their friendship had grown much stronger.", "ar": "عند الغروب، اجتمع الأطفال مدركين أن صداقتهم ازدادت متانة وقوة."},
                    {"en": "Hany shared: 'Leadership is about caring for others and helping them shine.'", "ar": "قال هاني: 'القيادة تعني الاهتمام بالآخرين ومساعدتهم على التألق'."},
                    {"en": "Malik affirmed that creativity makes every adventure more fun.", "ar": "أكد مالك أن الإبداع يضفي البهجة على كل مغامرة."},
                    {"en": "They returned home under a pink sky and inspired their entire village.", "ar": "عادوا إلى موطنهم تحت سماء شفقية ملهمين مجتمع قريتهم بأكمله."},
                    {"en": "They became fondly known as 'The Island Explorers'.", "ar": "عُرفوا في قريتهم بلقب 'مستكشفو الجزيرة'."}
                ],
                "vocabulary": [
                    {"word": "leadership", "meaningAr": "القيادة الحقيقية"},
                    {"word": "teamwork", "meaningAr": "العمل الجماعي"},
                    {"word": "creativity", "meaningAr": "الإبداع والابتكار"},
                    {"word": "island explorers", "meaningAr": "مستكشفو الجزيرة"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "As the sun set, the children gathered to leave. Their bond was deeper than before. Hany shared a wise thought: 'Leadership isn't about being the loudest, it's about caring for others and helping them shine.' Malik added, 'And creativity makes every adventure more fun!'",
                        "paragraphAr": "مع غروب الشمس، اجتمع الأصدقاء للرحيل، وقد غدت رابطتهم أعمق بكثير. قال هاني بحكمة: 'القيادة ليست علو الصوت، بل الاهتمام بالآخرين ومساعدتهم على التألق'. وأضاف مالك: 'والإبداع يجعل كل مغامرة أكثر بهجة!'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "Back in the village, they shared their adventure, inspiring other children to explore and lead with kindness, respect, and teamwork. From that day on, they were known as 'The Island Explorers.'",
                        "paragraphAr": "وعند عودتهم إلى القرية، رووا مغامرتهم الملهمة، محفزين أقرانهم على الاستكشاف والقيادة باللطف والاحترام والتعاون. ومنذ ذلك اليوم، لُقبوا بـ 'مستكشفي الجزيرة'."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep2_ch6_qa_1", "question": "What profound definition of leadership did Hany share?", "answer": "'Leadership isn't about being the loudest; it's about caring for others and helping them shine.'"}
                ],
                "importantQuestions": [
                    {"id": "prep2_ch6_crit_1", "question": "Why did the four friends earn the title 'The Island Explorers'?", "answer": "Because they exemplified respect, creative teamwork, and thoughtful leadership that inspired their whole village."}
                ],
                "homeworkQuestions": [
                    {"id": "prep2_ch6_hw_1", "question": "How did the adventure impact the boys' friendship long after the trip?", "answer": "It forged an unbreakable bond of trust, mutual appreciation, and shared purpose."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep2_ch6_1",
                        "question": "What is the core message of the Island Explorers' journey?",
                        "options": ["Unity, empathy, and collaborative leadership achieve great things", "Solo competition is the fastest route to success", "Silence is always better than sharing ideas", "Maps are never reliable"],
                        "correctAnswer": "Unity, empathy, and collaborative leadership achieve great things",
                        "explanation": "Their journey proved that mutual respect and combined strengths make every adventure richer."
                    }
                ]
            }
        ]
    }

    out_file = os.path.join(output_dir, "prep2-stories.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump([story1, story2], f, ensure_ascii=False, indent=2)
    print(f"Saved Prep 2: {out_file}\n")

# ==============================================================================
# 6. PARSE PREP 1: THE MAGIC CLASSROOM & THE DREAM TEAM
# ==============================================================================
def parse_prep1():
    lines = get_lines("media_1794587867254_1de65ef3.docx")
    
    # Story 1: The Magic Classroom (Mr. Adam, Sara, Omar, Zain) - Term 1
    story1 = {
        "id": "story_prep_1_magic_classroom",
        "gradeCode": "prep_1",
        "gradeLabelAr": "الصف الأول الإعدادي",
        "gradeLabelEn": "First Preparatory",
        "term": "first",
        "termLabelAr": "الفصل الدراسي الأول 2026/2027",
        "termLabelEn": "First Term 2026/2027",
        "titleAr": "الفصل الدراسي السحري",
        "titleEn": "The Magic Classroom",
        "author": "Ministry of Education (وزارة التربية والتعليم)",
        "aboutAuthorEn": "Official reader for First Preparatory English syllabus (Connect Plus & New Hello!).",
        "aboutAuthorAr": "القصة المقررة الرسمية من وزارة التربية والتعليم لطلاب الصف الأول الإعدادي للعام الدراسي 2026/2027.",
        "coverImage": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "مغامرة تربوية شائقة لطلاب الصف الأول الإعدادي داخل فصل سحري مليء بالألغاز التي لا تُحل إلا بالمسؤولية والتعاون والصدق.",
        "descriptionEn": "An imaginative educational allegory where students enter a magical classroom to solve floating puzzles, an invisible bridge, and a locked golden door using essential moral values.",
        "plotSummaryEn": "Mr. Adam, an inspiring village teacher, invites his students into the 'Magic Classroom' where floating clues and enchanted locks await. Sara, Zain, and shy Omar must solve puzzles that only yield to character strengths. They unlock a mystery box through teamwork, manifest an invisible bridge across a chasm through kind words and encouragement, and open a stubborn golden door by singing in unison. In the final room, a glowing book reveals that the real magic was never spells, but Responsibility, Curiosity, Teamwork, Respect, Determination, Courage, and Honesty.",
        "plotSummaryAr": "يدعو المعلم مستر آدم تلاميذه لخوض تجربة الفصل السحري لكشف أسراره بالمسؤولية والتعاون. تواجه سارة وزين وعمر الخجول ألغازاً عائمة وصندوقاً مغلقاً يحتاج لتبادل الأفكار، ثم يعبرون جسراً غير مرئي لا يظهر تحت أقدامهم إلا بالكلمات الطيبة والتشجيع، ويفتحون باباً ذهبياً بتوحدهم في الغناء معاً. وفي الغرفة الأخيرة، يكشف لهم كتاب متوهج أن السحر الحقيقي ليس تعاويذ، بل هو القيم الأخلاقية النبيلة: المسؤولية، والفضول العلمي، والعمل الجماعي، والاحترام، والعزيمة، والشجاعة، والصدق.",
        "characters": [
            {
                "name": "Mr. Adam (مستر آدم)",
                "role": "The Inspiring Teacher",
                "roleAr": "المعلم الحكيم والملهم",
                "descriptionEn": "A wise village educator who guides students through experiential trials teaching that values outshine puzzles.",
                "descriptionAr": "معلم فاضل يوجه تلاميذه نحو التعلم القيمي والعمل الجماعي كطريق وحيد للنجاح.",
                "isMain": True
            },
            {
                "name": "Sara (سارة)",
                "role": "The Eager Team Organizer",
                "roleAr": "الطالبة الشغوفة والمبادرة",
                "descriptionEn": "An enthusiastic student who loves learning, promotes deep listening, and keeps the team focused.",
                "descriptionAr": "طالبة متحمسة للعلم، تشجع زملاءها على التفكير والتكاتف في مواجهة الصعاب.",
                "isMain": True
            },
            {
                "name": "Omar (عمر)",
                "role": "The Courageous Scout",
                "roleAr": "الطالب الذي تحول من الخجل إلى الشجاعة",
                "descriptionEn": "Initially timid and nervous, Omar gains courage through his teammates' belief, ultimately proposing the key solution of singing in unity.",
                "descriptionAr": "طالب خجول يكتسب الثقة والشجاعة بدعم أصدقائه، وهو صاحب فكرة الغناء الجماعي التي فتحت الباب الذهبي.",
                "isMain": True
            },
            {
                "name": "Zain (زين)",
                "role": "The Calm Anchor",
                "roleAr": "الصديق الهادئ والداعم",
                "descriptionEn": "A calm, gentle friend who reinforces self-belief, reassures Omar, and embodies steadiness under pressure.",
                "descriptionAr": "صديق هادئ وودود، يبعث الطمأنينة في نفوس زملائه ويؤكد على الإيمان بالنجاح المشترك.",
                "isMain": True
            }
        ],
        "themes": [
            {
                "themeEn": "The Power of Unity and Teamwork",
                "themeAr": "قوة الاتحاد والعمل الجماعي",
                "descriptionEn": "Complex challenges become surmountable when diverse learners combine insights and support one another wholeheartedly.",
                "descriptionAr": "المشكلات المعقدة تُحل بيسر عندما تتكاتف العقول والقلوب في فريق واحد متعاون."
            },
            {
                "themeEn": "Real Magic Resides in Character",
                "themeAr": "السحر الحقيقي يكمن في الأخلاق",
                "descriptionEn": "True wonder does not stem from illusion, but from practicing honesty, empathy, courage, and perseverance in everyday life.",
                "descriptionAr": "السحر الحقيقي ليس خوارق غيبية، بل هو تجسيد قيم الصدق والشجاعة والمسؤولية في المدرسة والمنزل والإنترنت."
            }
        ],
        "chapters": [
            {
                "id": "sc_prep_1_ch_1",
                "chapterNumber": 1,
                "titleEn": "The First Challenge",
                "titleAr": "التحدي الأول",
                "term": "first",
                "summaryEn": "Mr. Adam introduces the Magic Classroom; the children enter a glowing chamber and solve a locked mystery box through teamwork.",
                "summaryAr": "يعلن مستر آدم عن الفصل السحري، ويدخل الطلاب من باب متوهج ليحلوا لغز الصندوق المغلق بالتعاون.",
                "chapterInPoints": [
                    {"en": "Mr. Adam announced the class would enter the Magic Classroom next week.", "ar": "أعلن مستر آدم أن الفصل سيدخل الغرفة السحرية الأسبوع القادم."},
                    {"en": "To succeed, students needed responsibility, curiosity, and teamwork.", "ar": "للنجاح، توجب عليهم إظهار المسؤولية والفضول والعمل الجماعي."},
                    {"en": "They entered a glowing door into a room filled with floating puzzles.", "ar": "عبروا باباً مشعاً إلى غرفة مليئة بالألغاز العائمة والكتب اللامعة."},
                    {"en": "Their first obstacle was a locked mystery box.", "ar": "كان أول تحدٍ أمامهم صندوقاً غامضاً ومغلقاً بإحكام."},
                    {"en": "By sharing ideas, the box clicked open and bright light signaled victory.", "ar": "بتبادل الأفكار، انفتح الصندوق وانبثق نور ساطع معلناً اجتياز التحدي."}
                ],
                "vocabulary": [
                    {"word": "responsibility", "meaningAr": "تحمل المسؤولية"},
                    {"word": "collaborate", "meaningAr": "يتعاون ويتشارك"},
                    {"word": "mystery", "meaningAr": "لغز غامض"},
                    {"word": "glowing door", "meaningAr": "باب متوهج"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "In a cheerful village school, the children loved discovering new things. Mr. Adam made an announcement: 'Next week, we will enter the Magic Classroom. To succeed, you need to show responsibility and work together.'",
                        "paragraphAr": "في مدرسة ريفية مبهجة، كان الأطفال يحبون استكشاف الجديد. أعلن المعلم مستر آدم: 'في الأسبوع القادم، سندخل الفصل السحري. ولتحقيق النجاح، يلزمكم إظهار المسؤولية والعمل معاً'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "When the day came, they walked through a glowing door into a room with floating puzzles. On the wall was a message: 'Only those who collaborate and stay curious can unlock the mysteries.' Together, Sara, Zain, and nervous Omar shared ideas and clicked the locked box open.",
                        "paragraphAr": "وعندما حان اليوم، عبروا باباً متوهجاً إلى غرفة تحوي ألغازاً عائمة، وعلى الجدار رسالة: 'فقط المتعاونون وأصحاب الفضول العلمي يستطيعون فك الألغاز'. بتكاتف سارة وزين وعمر القلق، تبادلوا الرؤى فانفتح الصندوق المغلق بنجاح."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep1_ch1_qa_1", "question": "What was Mr. Adam's core condition for succeeding in the Magic Classroom?", "answer": "Showing responsibility, remaining curious, and collaborating actively as a unified team."}
                ],
                "importantQuestions": [
                    {"id": "prep1_ch1_crit_1", "question": "Why is exchanging diverse ideas more fruitful than working alone?", "answer": "Because collaboration unites different perspectives, overcomes blind spots, and generates robust solutions."}
                ],
                "homeworkQuestions": [
                    {"id": "prep1_ch1_hw_1", "question": "What appeared on the wall when the students stepped through the glowing door?", "answer": "A glowing message: 'Only those who collaborate and stay curious can unlock the mysteries.'"}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep1_ch1_1",
                        "question": "What was the students' first challenge inside the Magic Classroom?",
                        "options": ["A locked box", "A steep mountain", "A deep river", "A mathematical exam"],
                        "correctAnswer": "A locked box",
                        "explanation": "They had to pool their ideas to unlock the enchanted box."
                    }
                ]
            },
            {
                "id": "sc_prep_1_ch_2",
                "chapterNumber": 2,
                "titleEn": "The Power of Unity",
                "titleAr": "قوة الاتحاد",
                "term": "first",
                "summaryEn": "The children walk across an invisible bridge by speaking kind words, then open a locked golden door by singing in unity.",
                "summaryAr": "يعبر الأطفال جسراً غير مرئي بكلمات التشجيع، ويفتحون باباً ذهبياً بالتوحد في الغناء المشترك.",
                "chapterInPoints": [
                    {"en": "The second room featured an invisible bridge requiring respect, ambition, and courage.", "ar": "ضمت الغرفة الثانية جسراً غير مرئي يتطلب الاحترام والطموح والشجاعة."},
                    {"en": "Sara defined respect as listening and caring for each other.", "ar": "عرّفت سارة الاحترام بأنه الاستماع المتبادل والاهتمام الصادق."},
                    {"en": "Every kind word and brave step made the bridge solidify beneath their feet.", "ar": "كل كلمة طيبة وخطوة جسورة جعلت الجسر يتبلور ويتجسد تحت أقدامهم."},
                    {"en": "At the bridge's end, a stubborn golden door refused all mechanical attempts.", "ar": "في نهاية الجسر، واجههم باب ذهبي استعصى على كل المحاولات الفردية."},
                    {"en": "Omar suggested singing in harmony, and the door gracefully swung open.", "ar": "اقترح عمر الغناء بتناغم ووحدة، فانفتح الباب الذهبي بسلاسة."}
                ],
                "vocabulary": [
                    {"word": "invisible bridge", "meaningAr": "جسر غير مرئي"},
                    {"word": "ambition", "meaningAr": "طموح وعزيمة"},
                    {"word": "courage", "meaningAr": "الشجاعة والإقدام"},
                    {"word": "unity", "meaningAr": "الوحدة والترابط"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "Next, the children faced an invisible bridge. A sign read: 'Only those with respect, ambition, and courage can cross.' Holding hands and encouraging one another, every kind word made the bridge appear beneath their feet.",
                        "paragraphAr": "بعد ذلك، واجه الأطفال جسراً غير مرئي، كُتبت عليه لافتة: 'فقط أصحاب الاحترام والطموح والشجاعة يعبرون'. مسكوا بأيدي بعضهم، وكانت كل كلمة تشجيع طيبة تجعل الجسر يتجسد تدريجياً تحت خطاهم."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "At the far side stood a locked golden door: 'Determination opens every door. Never give up.' After many failed attempts, Omar whispered, 'Let's sing together. Maybe unity is the key.' They sang, and slowly, the golden door swung open.",
                        "paragraphAr": "وعلى الجانب الآخر وقف باب ذهبي مغلق: 'الإصرار يفتح كل باب، لا تستسلم أبداً'. وبعد محاولات غير مجدية، همس عمر: 'دعونا نغني معاً، لعل الوحدة هي المفتاح'. وغنوا بتناغم، فاستجاب الباب وانفتح أمامهم."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep1_ch2_qa_1", "question": "What made the invisible bridge appear beneath the children's feet?", "answer": "Holding hands, encouraging each other, and speaking kind, brave words."}
                ],
                "importantQuestions": [
                    {"id": "prep1_ch2_crit_1", "question": "What does the phrase 'unity is the key' teach us?", "answer": "That harmony of purpose and shared emotional resonance can unlock barriers that individual force cannot."}
                ],
                "homeworkQuestions": [
                    {"id": "prep1_ch2_hw_1", "question": "Whose innovative suggestion unlocked the stubborn golden door?", "answer": "Omar's idea to sing together in united harmony."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep1_ch2_1",
                        "question": "What sign was posted before the invisible bridge?",
                        "options": ["Only those with respect, ambition, and courage can cross", "Keep off the grass", "Danger: Deep water", "First prize winners only"],
                        "correctAnswer": "Only those with respect, ambition, and courage can cross",
                        "explanation": "The bridge responded only to moral qualities."
                    }
                ]
            },
            {
                "id": "sc_prep_1_ch_3",
                "chapterNumber": 3,
                "titleEn": "The Greatest Lessons",
                "titleAr": "أعظم الدروس",
                "term": "first",
                "summaryEn": "In the final room, Mr. Adam presents a glowing book, revealing that true magic lies in Responsibility, Curiosity, Respect, Courage, and Honesty.",
                "summaryAr": "في الغرفة الأخيرة، يكشف مستر آدم أن السحر الحقيقي هو القيم الإنسانية، ويتعهد الطلاب بتطبيقها دائماً.",
                "chapterInPoints": [
                    {"en": "Inside the final room, the children found a glowing book on a crystal stand.", "ar": "في الغرفة الأخيرة، وجد الطلاب كتاباً متوهجاً على قاعدة كريستالية."},
                    {"en": "Mr. Adam appeared, explaining that the real magic is in the values they showed.", "ar": "ظهر مستر آدم موضحاً أن السحر الحقيقي يكمن في القيم التي جسدوها."},
                    {"en": "Glowing words appeared: Responsibility, Curiosity, Teamwork, Respect, Determination, Courage.", "ar": "توهجت كلمات الكتاب: المسؤولية، الفضول، العمل الجماعي، الاحترام، العزيمة، الشجاعة."},
                    {"en": "Omar rejoiced that friendship gave him confidence, while Zain valued honesty.", "ar": "فرح عمر لأن ثقة رفاقه منحته الشجاعة، وثمّن زين الصدق التام."},
                    {"en": "The children returned promising to live these values at school, at home, and online.", "ar": "عاد الطلاب لصفهم عاقدين العزم على تطبيق هذه المبادئ في المدرسة والبيت وعبر الإنترنت."}
                ],
                "vocabulary": [
                    {"word": "crystal stand", "meaningAr": "حامل كريستالي"},
                    {"word": "curiosity", "meaningAr": "حب الاستطلاع والتعلم"},
                    {"word": "determination", "meaningAr": "العزم والإصرار"},
                    {"word": "honesty online", "meaningAr": "الأمانة الأخلاقية عبر الإنترنت"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "Inside the final chamber, a glowing book rested on a crystal pedestal. Mr. Adam smiled warmly: 'You have completed the Magic Classroom. But remember, the real magic was never in the puzzles—it was in the values you showed.'",
                        "paragraphAr": "في الغرفة الختامية، استقر كتاب مشع على حامل كريستالي. ابتسم مستر آدم بدفء: 'لقد أتممتم تحديات الفصل السحري بنجاح، لكن تذكروا أن السحر الحقيقي لم يكن في الألغاز بل في القيم التي تحليتم بها'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "Glowing letters revealed: 'Responsibility, Curiosity, Teamwork, Respect, Determination, Courage, and Honesty.' The children returned with proud hearts, promising to apply these virtues in their studies, at home, and across their digital lives.",
                        "paragraphAr": "أضاءت حروف الكتاب: 'المسؤولية، والفضول العلمي، والعمل الجماعي، والاحترام، والعزيمة، والشجاعة، والصدق'. عاد التلاميذ بقلوب ملؤها الفخر، متعهدين بالالتزام بهذه الفضائل في دراستهم وبيوتهم وعوالمهم الرقمية."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep1_ch3_qa_1", "question": "Where does the 'real magic' reside according to Mr. Adam?", "answer": "In the core human values: Responsibility, Curiosity, Teamwork, Respect, Determination, Courage, and Honesty."}
                ],
                "importantQuestions": [
                    {"id": "prep1_ch3_crit_1", "question": "Why did the teacher emphasize applying honesty 'online' as well as at school?", "answer": "Because moral character must govern our digital conduct, respecting privacy, avoiding harmful speech, and acting ethically when unseen."}
                ],
                "homeworkQuestions": [
                    {"id": "prep1_ch3_hw_1", "question": "What did the students promise to do after exiting the Magic Classroom?", "answer": "To practice their newly discovered values in all areas of life: school, home, and online."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep1_ch3_1",
                        "question": "What rested on the crystal pedestal in the final chamber?",
                        "options": ["A glowing book of values", "A chest of gold coins", "A magic wand", "A trophy"],
                        "correctAnswer": "A glowing book of values",
                        "explanation": "The glowing book held the enduring lessons of character and cooperation."
                    }
                ]
            }
        ]
    }

    # Story 2: The Dream Team (Sara, Omar, Zain, Lily, Karim) - Term 2
    story2 = {
        "id": "story_prep_1_dream_team",
        "gradeCode": "prep_1",
        "gradeLabelAr": "الصف الأول الإعدادي",
        "gradeLabelEn": "First Preparatory",
        "term": "second",
        "termLabelAr": "الفصل الدراسي الثاني 2026/2027",
        "termLabelEn": "Second Term 2026/2027",
        "titleAr": "فريق الأحلام (آلة توفير المياه)",
        "titleEn": "The Dream Team",
        "author": "Ministry of Education (وزارة التربية والتعليم)",
        "aboutAuthorEn": "Official reader for First Preparatory Term 2 teaching engineering teamwork, conflict resolution, and environmental service.",
        "aboutAuthorAr": "القصة المقررة للترم الثاني لطلاب الصف الأول الإعدادي، لترسيخ مهارات حل المشكلات والتضامن من أجل حماية الموارد المائية.",
        "coverImage": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        "descriptionAr": "مغامرة تطبيقية شيقة لخمسة طلاب يصممون آلة مبتكرة لترشيد مياه الأمطار في معرض الاختراعات السنوي، مدركين أن قيم التعاون والصداقة أسمى من أي كأس.",
        "descriptionEn": "A dynamic hands-on story where Sara, Omar, Zain, Lily, and Karim engineer a rainwater-saving machine for the school fair, learning that friendship and ethics surpass trophies.",
        "plotSummaryEn": "In a lively village school, five friends—Sara, Omar, Zain, Lily, and Karim—unite to enter the annual Invention Fair with a Water-Saving Machine. Early disagreements flare when Omar rushes ahead, leaving Lily feeling ignored. Sara steps in to restore fair listening and Karim advocates honesty. By dividing roles based on talents, fixing leaks without blaming mistakes, and utilizing eco-friendly components, their rainwater recycling machine works successfully. While another group wins first place, the judges and teacher proclaim them the true winners for their exemplary cooperation, mutual respect, and civic purpose.",
        "plotSummaryAr": "في مدرسة قروية مبهجة، يقرر خمسة أصدقاء (سارة، عمر، زين، ليلي، وكريم) ابتكار آلة لترشيد وتجميع مياه الأمطار للمشاركة في معرض الاختراعات. تبدأ التجربة ببعض الخلاف حين تسرع عمر وأهمل آراء ليلي، لكن سارة وكريم أعادا التوازن بالعدل والصدق. وزعوا الأدوار: زين صمم النموذج، عمر أصلح الأنابيب، ليلي اقترحت مواد صديقة للبيئة، كريم اختبر تدفق المياه، وسارة نسقت العمل. وعندما وقع خطأ في التوصيلات، ساندوا كريم دون لوم. في يوم المعرض، فازت آلتهم بإعجاب الحكام، وأكد المعلم أن القيم التي أظهروها تفوق كل الجوائز.",
        "characters": [
            {
                "name": "Sara (سارة)",
                "role": "The Fair Organizer",
                "roleAr": "منسقة الفريق وقائدة الحوار العادل",
                "descriptionEn": "A fair, articulate leader who ensures every team member's voice is respected and keeps moral purpose above competitive winning.",
                "descriptionAr": "طالبة منظمة وعادلة، تتدخل لحماية حقوق زملائها وتؤكد أن مساعدة القرية هي الغاية الكبرى.",
                "isMain": True
            },
            {
                "name": "Omar (عمر)",
                "role": "The Passionate Builder",
                "roleAr": "المصلح النشيط والمسؤول عن الأنابيب",
                "descriptionEn": "An enthusiastic student who initially rushes, but learns humility, active listening, and pipe assembly.",
                "descriptionAr": "طالب متحمس كان يتعجل القيادة، لكنه تعلم الصبر والإنصات وتولى إصلاح الأنابيب ببراعة.",
                "isMain": True
            },
            {
                "name": "Lily (ليلي)",
                "role": "The Eco-Material Specialist",
                "roleAr": "المبتكرة الصديقة للبيئة",
                "descriptionEn": "Initially shy and sidelined, Lily finds her voice to champion eco-friendly recycled materials and persistent testing.",
                "descriptionAr": "طالبة كانت خجولة في البداية، لكنها أثبتت تميزها باقتراح مواد صديقة للبيئة واختبار الآلة مراراً.",
                "isMain": True
            },
            {
                "name": "Karim (كريم)",
                "role": "The Honest Tester",
                "roleAr": "فاحص تدفق المياه والباحث الأمين",
                "descriptionEn": "A thoughtful tester of water flow who advocates honesty in choices and learns resilience when supported after a mistake.",
                "descriptionAr": "طالب صادق ومجتهد، اختبر تدفق المياه، وعندما ارتكب خطأ سانده زملاؤه ليصلحه بتعاون.",
                "isMain": True
            },
            {
                "name": "Zain (زين)",
                "role": "The Creative Designer",
                "roleAr": "مصمم النموذج الهندسي",
                "descriptionEn": "A gifted designer who sketches and models the water-saving machine with precision and artistic flair.",
                "descriptionAr": "طالب مبدع صمم هيكل النموذج المبتكر لجمع وترشيد مياه الأمطار.",
                "isMain": True
            }
        ],
        "themes": [
            {
                "themeEn": "Values and Character Above Trophies",
                "themeAr": "القيم والأخلاق أسمى من الجوائز",
                "descriptionEn": "Winning a contest is fleeting, but honesty, cooperation, and serving one's community constitute true lifelong victory.",
                "descriptionAr": "الكؤوس والجوائز قد تزول، أما الأمانة والتعاون ومساعدة المجتمع فتبقى أثراً خالداً."
            },
            {
                "themeEn": "Supportive Problem-Solving Without Blame",
                "themeAr": "حل المشكلات بلا لوم أو تجريح",
                "descriptionEn": "When mistakes happen, healthy teams rally to fix the problem constructively rather than targeting individuals with accusations.",
                "descriptionAr": "عند وقوع الأخطاء، يتعاون الفريق الإيجابي لإصلاح الخلل بروح المحبة بدلاً من إلقاء اللوم."
            }
        ],
        "chapters": [
            {
                "id": "sc_prep_1_ch_4",
                "chapterNumber": 1,
                "titleEn": "Never Give Up",
                "titleAr": "لا تستسلم أبداً",
                "term": "second",
                "summaryEn": "The five friends team up for the annual Invention Fair to build a water-saving machine, overcoming early division through fairness and respect.",
                "summaryAr": "يجتمع الأصدقاء الخمسة لتصميم آلة ترشيد المياه لمعرض الاختراعات، ويتعلمون العدل وتوزيع الأدوار.",
                "chapterInPoints": [
                    {"en": "The annual invention fair was announced in the village school.", "ar": "أُعلن عن معرض الاختراعات السنوي في مدرسة القرية."},
                    {"en": "Sara, Omar, Zain, Lily, and Karim teamed up to build a Water-Saving Machine.", "ar": "اتحدت سارة وعمر وزين وليلي وكريم لبناء آلة لتوفير المياه."},
                    {"en": "Omar rushed to take charge, causing Lily to feel excluded.", "ar": "تعجل عمر القيادة مما جعل ليلي تشعر بالتهميش."},
                    {"en": "Sara and Karim restored equity, agreeing that every member's voice matters.", "ar": "أعادت سارة وكريم التوازن مؤكدين أن فكرة كل فرد لها وزنها."},
                    {"en": "Each member received a specific role, strengthening their bond.", "ar": "توزعت الأدوار بتناغم، مما زاد من قوة الصداقة والتعاون."}
                ],
                "vocabulary": [
                    {"word": "water-saving machine", "meaningAr": "آلة توفير وترشيد المياه"},
                    {"word": "left out", "meaningAr": "مستبعد أو مهمش"},
                    {"word": "fairness", "meaningAr": "العدل والإنصاف"},
                    {"word": "eco-friendly materials", "meaningAr": "مواد صديقة للبيئة"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "In the cheerful village, the annual invention fair arrived. Sara, Omar, Zain, Lily, and Karim decided to build a water-saving machine. But in their first meeting, Omar rushed to take the lead, leaving Lily feeling left out. Sara stopped him gently: 'We need to be fair. Everyone's ideas matter. We are a team.'",
                        "paragraphAr": "في القرية السعيدة، حل موعد معرض الاختراعات السنوي. قررت سارة وعمر وزين وليلي وكريم صنع آلة لتوفير المياه. ولكن في لقائهم الأول، تعجل عمر القيادة فشعرت ليلي بالتهميش. أوقفته سارة بلطف: 'يجب أن نكون منصفين، أفكار الجميع مهمة فنحن فريق واحد'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "Karim added wisely, 'We must have honesty.' They all agreed to respect each other. Zain designed the model, Omar fixed the pipes, Lily chose eco-friendly parts, Karim tested the water flow, and Sara organized tasks.",
                        "paragraphAr": "وأضاف كريم بحكمة: 'علينا التحلي بالصدق'. اتفق الجميع على الاحترام؛ صمم زين النموذج، وأصلح عمر الأنابيب، واختارت ليلي مواد بيئية، واختبر كريم التدفق، بينما نظمت سارة المهام."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep1_ch4_qa_1", "question": "What project did the Dream Team decide to build?", "answer": "A Water-Saving Machine to conserve water for their village."}
                ],
                "importantQuestions": [
                    {"id": "prep1_ch4_crit_1", "question": "Why did Sara step in when Omar rushed to take charge?", "answer": "Because a healthy team requires fair participation where every member feels valued, heard, and respected."}
                ],
                "homeworkQuestions": [
                    {"id": "prep1_ch4_hw_1", "question": "What roles did each of the five students assume?", "answer": "Zain (design), Omar (pipes), Lily (eco-materials), Karim (water flow testing), Sara (team organization)."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep1_ch4_1",
                        "question": "Why did Lily feel left out in the first meeting?",
                        "options": ["Her ideas were initially ignored in the rush", "She did not want to work", "She forgot her notebook", "She arrived late"],
                        "correctAnswer": "Her ideas were initially ignored in the rush",
                        "explanation": "Sara intervened to ensure Lily's voice was welcomed and valued."
                    }
                ]
            },
            {
                "id": "sc_prep_1_ch_5",
                "chapterNumber": 2,
                "titleEn": "Does Lily feel shy now?",
                "titleAr": "هل ما زالت ليلي خجولة؟",
                "term": "second",
                "summaryEn": "The team overcomes machine malfunctions, supports Karim when he makes a mistake, and builds a unique rainwater recycling prototype.",
                "summaryAr": "يتغلب الفريق على تسريبات الآلة، ويساندون كريم عند وقوع خطأ دون لوم، وينجزون نموذجاً متميزاً لري المزروعات.",
                "chapterInPoints": [
                    {"en": "The machine took shape but had performance issues, discouraging the team.", "ar": "اكتمل شكل الآلة لكنها لم تعمل بكفاءة، مما أحبط الفريق."},
                    {"en": "Sara reminded everyone that their goal was helping the village, not just winning.", "ar": "ذكّرت سارة الجميع بأن الهدف مساعدة القرية لا مجرد الفوز."},
                    {"en": "Lily overcame her shyness and recommended repetitive flow testing.", "ar": "تغلبت ليلي على خجلها واقترحت إعادة الاختبار وتعديل الوصلات."},
                    {"en": "When Karim made an assembly error, the team helped him fix it without blame.", "ar": "عندما أخطأ كريم في التركيب، سانده الزملاء لإصلاحه دون لوم."},
                    {"en": "The completed machine successfully reused rainwater for plants and paths.", "ar": "أعادت الآلة تدوير مياه الأمطار بكفاءة لري الحدائق وتنظيف الممرات."}
                ],
                "vocabulary": [
                    {"word": "purpose", "meaningAr": "هدف نبيل وغرض سامٍ"},
                    {"word": "aspiration", "meaningAr": "طموح وتطلع إيجابي"},
                    {"word": "no blame", "meaningAr": "دون إلقاء لوم"},
                    {"word": "rainwater", "meaningAr": "مياه الأمطار"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "Days passed, and the machine started to take shape, but it worked imperfectly. Some members felt discouraged. Sara rallied them: 'Our purpose isn't just to win, it's to help people. Let's not lose hope.' Omar agreed, and Lily, once shy, spoke up: 'We can make it better if we test it again and again.'",
                        "paragraphAr": "مرت الأيام وبدأت الآلة تكتمل، لكنها لم تعمل بدقة، فشعر البعض بالإحباط. شجعتهم سارة: 'هدفنا ليس مجرد الفوز، بل مساعدة الناس'. وافقها عمر، ونهضت ليلي متغلبة على خجلها: 'يمكننا تحسينها إذا كررنا الاختبار مرة بعد أخرى'."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "The team worked late, dividing tasks and sharing steps. When Karim made a mistake, no one blamed him; instead, they helped him fix it. Finally, the machine operated smoothly, collecting rainwater to nourish plants and clean pathways.",
                        "paragraphAr": "عمل الفريق حتى وقت متأخر يتقاسمون الخطوات؛ وعندما أخطأ كريم، لم يلمه أحد بل تكاتفوا لإصلاح الخطأ. وأخيراً، عملت الآلة بانسجام لجمع مياه الأمطار وري المزروعات وتنظيف الممرات."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep1_ch5_qa_1", "question": "How did the team react when Karim made a mistake?", "answer": "No one blamed him; they supported him and worked together to correct the issue."}
                ],
                "importantQuestions": [
                    {"id": "prep1_ch5_crit_1", "question": "Why is avoiding personal blame critical to group success?", "answer": "Blame induces fear and defensiveness, whereas constructive support fosters learning, courage, and higher trust."}
                ],
                "homeworkQuestions": [
                    {"id": "prep1_ch5_hw_1", "question": "What practical tasks did the completed Water-Saving Machine accomplish?", "answer": "It collected rainwater to irrigate school garden flora and wash walkway paths."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep1_ch5_1",
                        "question": "What change occurred in Lily during the testing phase?",
                        "options": ["She overcame her shyness and proposed iterative testing", "She decided to leave the group", "She refused to speak to Karim", "She took over all of Omar's tasks"],
                        "correctAnswer": "She overcame her shyness and proposed iterative testing",
                        "explanation": "Lily gained self-assurance and offered practical suggestions."
                    }
                ]
            },
            {
                "id": "sc_prep_1_ch_6",
                "chapterNumber": 3,
                "titleEn": "A Team of Tomorrow",
                "titleAr": "فريق الغد",
                "term": "second",
                "summaryEn": "At the fair, the judges praise the team's presentation and unity; their teacher declares them the real winners because values outshine trophies.",
                "summaryAr": "يقدم الفريق الآلة بإتقان في المعرض، ويشيد الحكام والمعلم بأخلاقهم مؤكدين أن التعاون والصدق هما الفوز الحقيقي.",
                "chapterInPoints": [
                    {"en": "On the fair day, Sara's team explained their project clearly and confidently.", "ar": "في يوم المعرض، شرحت سارة وفريقها مشروعهم بثقة واقتدار."},
                    {"en": "Judges were deeply impressed by the machine and the team's mutual respect.", "ar": "أبدى الحكام إعجاباً كبيراً بالآلة وبالاحترام المتبادل بين الطلاب."},
                    {"en": "Another team won first prize, but Sara and her friends did not feel sad.", "ar": "فاز فريق آخر بالمركز الأول، لكن سارة ورفاقها لم يحزنوا."},
                    {"en": "Their teacher proudly called them 'the real winners' for honesty and teamwork.", "ar": "أعلن معلمهم أنهم الفائزون الحقيقيون لتجسيدهم الصدق والعمل الجماعي."},
                    {"en": "The students celebrated their friendship and shared achievement.", "ar": "احتفل الأصدقاء بصداقتهم العميقة وإنجازهم الأخلاقي المتميز."}
                ],
                "vocabulary": [
                    {"word": "invention fair", "meaningAr": "معرض الاختراعات"},
                    {"word": "cooperation", "meaningAr": "التعاون البناء"},
                    {"word": "real winners", "meaningAr": "الفائزون الحقيقيون بالقيم"},
                    {"word": "trophy", "meaningAr": "كأس أو جائزة مادية"}
                ],
                "theText": [
                    {
                        "order": 1,
                        "paragraphEn": "On the day of the Invention Fair, the playground was filled with visitors. Sara and her team explained their Water-Saving Machine clearly and confidently. The judges were impressed not only by the machine, but also by the teamwork and respect the group showed.",
                        "paragraphAr": "في يوم المعرض، امتلأ الفناء بالزوار. شرحت سارة وفريقها آلة ترشيد المياه بوضوح وثقة؛ فأعجب الحكام ليس بالابتكار وحده بل بروح الفريق والاحترام الرفيع الذي تحلوا به."
                    },
                    {
                        "order": 2,
                        "paragraphEn": "Though another team took first prize, the friends did not feel sad. Their teacher clapped proudly: 'You are the real winners. You showed honesty, cooperation, and teamwork. These values are more important than any trophy.' The children smiled and held hands.",
                        "paragraphAr": "ومع أن فريقاً آخر فاز بالمركز الأول، إلا أن الأصدقاء لم يحزنوا. صفق معلمهم بفخر: 'أنتم الفائزون الحقيقيون، فقد أظهرتم الصدق والتعاون والعمل الجماعي؛ وهذه القيم أسمى من أي كأس'. ابتسم الأطفال وأمسكوا بأيدي بعضهم فخورين بما أنجزوا."
                    }
                ],
                "questionsAndAnswers": [
                    {"id": "prep1_ch6_qa_1", "question": "Why did the teacher call Sara's team the 'real winners'?", "answer": "Because they exemplified honesty, empathy, selfless cooperation, and civic purpose throughout the challenge."}
                ],
                "importantQuestions": [
                    {"id": "prep1_ch6_crit_1", "question": "Why are character values considered more enduring than a competitive trophy?", "answer": "Trophies are static physical objects, whereas virtues of cooperation, integrity, and perseverance enrich character and benefit communities for a lifetime."}
                ],
                "homeworkQuestions": [
                    {"id": "prep1_ch6_hw_1", "question": "How did Sara and her team react when another project was awarded first prize?", "answer": "They remained cheerful, celebrating their friendship and moral victory rather than feeling dejected."}
                ],
                "mcqQuestions": [
                    {
                        "id": "mcq_prep1_ch6_1",
                        "question": "What is the concluding message of 'The Dream Team'?",
                        "options": ["Good values and teamwork are more important than winning trophies", "Winning at any cost is the only goal", "Building machines is easy for one person", "Competitions should be avoided"],
                        "correctAnswer": "Good values and teamwork are more important than winning trophies",
                        "explanation": "True victory is rooted in collaborative ethics and service."
                    }
                ]
            }
        ]
    }

    out_file = os.path.join(output_dir, "prep1-stories.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump([story1, story2], f, ensure_ascii=False, indent=2)
    print(f"Saved Prep 1: {out_file}\n")

# Run all 6 parsers
print("Starting full story extraction...")
parse_sec3()
parse_sec2()
parse_sec1()
parse_prep3()
parse_prep2()
parse_prep1()
print("ALL 6 STORIES PROCESSED SUCCESSFULLY!")
