import os
import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BASE_DIR = r"C:\Users\fanda\Documents\pro-academy"
DATA_DIR = os.path.join(BASE_DIR, "translation-academy-data")
SRC_DIR = r"C:\Users\fanda\.gemini\antigravity\brain\9e49d30e-0f2a-4ab8-8f0f-f12ca9606afd\.user_uploaded"
JSON_OUT_DIR = os.path.join(BASE_DIR, "src", "data")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(JSON_OUT_DIR, exist_ok=True)

# Styling helpers
HEADER_FILL = PatternFill(start_color="1E1B4B", end_color="1E1B4B", fill_type="solid")
HEADER_FONT = Font(name="Arial", size=10, bold=True, color="FFFFFF")
ZEBRA_FILL = PatternFill(start_color="F5F3FF", end_color="F5F3FF", fill_type="solid")
REG_FONT = Font(name="Arial", size=9)
BOLD_FONT = Font(name="Arial", size=9, bold=True)
BORDER_GRAY = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)

def save_excel(filepath, sheet_name, headers, rows):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_name

    ws.append(headers)
    ws.row_dimensions[1].height = 26
    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    for r_idx, row in enumerate(rows, start=2):
        ws.append(row)
        ws.row_dimensions[r_idx].height = 20
        fill = ZEBRA_FILL if r_idx % 2 == 0 else PatternFill(fill_type=None)
        for col_num in range(1, len(row) + 1):
            cell = ws.cell(row=r_idx, column=col_num)
            cell.font = REG_FONT
            cell.border = BORDER_GRAY
            if fill.fill_type:
                cell.fill = fill
            val_str = str(cell.value or "")
            if col_num in [1, 2, 4, 5, 8, 9] and len(val_str) < 20:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    for col in ws.columns:
        max_len = 0
        for cell in col:
            v = str(cell.value or '')
            lines = v.split('\n')
            max_line = max(len(l) for l in lines) if lines else 0
            if max_line > max_len:
                max_len = max_line
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 11), 50)

    wb.save(filepath)
    print(f"Generated: {os.path.basename(filepath)} with {len(rows)} records")

# ==========================================
# 1. SOURCE MASTER INDEX
# ==========================================
source_master_headers = [
    "Source ID", "Source Title", "File Name", "Page Count", "Booklet Page Range",
    "Primary Educational Domain", "Key Sections Extracted", "Completeness", "Review Status"
]
source_master_rows = [
    [
        "SRC_001",
        "Translation Level 1 — Principles, Grammar & Strategies",
        "media_1794430995034_777c6742.pdf",
        18,
        "Pages 9–26",
        "Foundations, Sentence Structure, 33 Core Grammar Rules & Core Vocabulary",
        "Introduction, S+V+O, Tenses, Verb to be/have, Cognates, Adjectives, Idioms, Vocab tables (pp. 22-26)",
        "100% Extracted",
        "Verified"
    ],
    [
        "SRC_002",
        "Applied Translation Exercises, Texts & Vocabulary",
        "media_1794430995035_5e415589.pdf",
        25,
        "Pages 27–51",
        "94 Bilingual Exercise Units, Specialized Topics, Past General Secondary Exams (pp. 39-44), Difficult Vocab",
        "94 Translation Units with Vocab, 45 Exam Texts, 55 AR->EN Sentences, 4-Page Difficult Vocab Directory",
        "100% Extracted",
        "Verified"
    ],
    [
        "SRC_003",
        "General Secondary & Ministry Exams, Paragraphs & Terminology",
        "media_1794430995037_6791a59a.pdf",
        24,
        "Pages 52–75",
        "Ministry Booklet Models, 1980-2008 Exams, Workbook Drills, 75 Long Paragraphs, Medicine Terminology",
        "47 Applied Sentences, 24 Ministry Booklet Models, 60 Past Exam Drills, 75 Paragraphs, Medical Vocab (p. 75)",
        "100% Extracted",
        "Verified"
    ],
    [
        "SRC_004",
        "Bilingual Vocabulary & Terminology by Topics (Upcoming)",
        "source 4.pdf (Expected from user)",
        37,
        "Pages 76–112 (Estimated)",
        "Specialized Dictionaries: Economics, Politics, Education, Psychology, Sports, Sciences, Arts & Culture",
        "Pre-allocated in schema; awaiting file upload from user to ingest full 37 pages",
        "Pre-structured (Ready for Ingestion)",
        "Pending Upload"
    ]
]
save_excel(os.path.join(DATA_DIR, "SOURCE_MASTER_INDEX.xlsx"), "Sources", source_master_headers, source_master_rows)

# ==========================================
# 2. LESSONS MASTER (12 Core Lessons)
# ==========================================
lessons_master_headers = [
    "Lesson ID", "Code", "Lesson Title (AR)", "Lesson Title (EN)",
    "Learning Objectives", "Core Rules & Strategies", "Examples Count", "Exercises Count", "Source PDF", "Source Pages"
]

lessons_master_rows = [
    [
        "LES_001", "TR_BASICS", "أساسيات وفلسفة الترجمة", "Translation Basics & Philosophy",
        "فهم الترجمة كفن لنقل المعنى وليس نقلاً حرفياً للألفاظ، مراعاة روح النص والسياق الاجتماعي والثقافي",
        "1. الترجمة فن نقل المعنى 2. مراعاة السياق العام 3. رفض الحرفية العقيمة 4. تحديد الفاعل والمفعول",
        8, 12, "Source 1", "Pages 9–10"
    ],
    [
        "LES_002", "TR_CONTEXT", "فهم السياق وتعدد المعاني", "Understanding Context & Polysemy",
        "القدرة على استنتاج المعنى الدقيق للكلمة متعددة الدلالات بحسب الجملة والنص ككل",
        "1. كلمة Home ومعانيها المتعددة 2. كلمات مثل Plant, Flat, Run 3. التخمين الذكي من سياق الفقرة",
        6, 10, "Source 1 & 2", "Pages 9, 19, 27"
    ],
    [
        "LES_003", "TR_SENT_STRUCT", "بناء الجملة الإنجليزية ونظام الفاعل", "Sentence Structure & Word Order",
        "إتقان ترتيب الجملة الإنجليزية (S + V + O) مقابل الجملة الفعلية والاسمية في العربية",
        "1. الفاعل أولاً دائماً 2. موضع الصفة قبل الاسم 3. المضاف والمضاف إليه 4. ترتيب الظروف الزمانية والمكانية",
        10, 15, "Source 1", "Pages 9, 11, 20"
    ],
    [
        "LES_004", "TR_AR_TO_EN", "استراتيجيات الترجمة من العربية إلى الإنجليزية", "Arabic to English Translation Strategies",
        "صياغة الجمل العربية المعقدة والمجازية والمفعول المطلق وكلمات التوكيد إلى لغة إنجليزية طبيعية",
        "1. إهمال 'إنّ' و'لقد' التوكيدية 2. تحويل المفعول المطلق إلى ظروف (severely, greatly) 3. إظهار الضمائر المستترة 4. دمج الألفاظ",
        12, 20, "Source 1 & 2", "Pages 11, 12, 16, 45–47"
    ],
    [
        "LES_005", "TR_EN_TO_AR", "استراتيجيات الترجمة من الإنجليزية إلى العربية", "English to Arabic Translation Strategies",
        "صياغة النص الإنجليزي بأسلوب عربي فصيح وتفضيل الجملة الفعلية وتجنب الركاكة",
        "1. إسقاط Verb to be أو استبداله بفعل دلالي (يشكل، يعتبر) 2. صياغة صفة الملكية 3. جمع الصفات (the rich) 4. صياغة كلمة Only",
        10, 18, "Source 1 & 3", "Pages 10, 11, 19, 20, 63–75"
    ],
    [
        "LES_006", "TR_GRAMMAR", "قواعد اللغة والتحولات الزمنية في الترجمة", "Grammar & Tense Shifts in Translation",
        "المطابقة الدقيقة بين أزمنة الفعل في العربية والإنجليزية ودلالاتها الزمنية",
        "1. لقد + ماضي = مضارع تام 2. لقد + ماضي + إشارة ماضية = ماضي بسيط 3. كان + مضارع = ماضي مستمر 4. قد + مضارع = may 5. لن = won't 6. لم = didn't 7. كان قد = ماضي تام",
        14, 22, "Source 1", "Pages 10, 16, 17"
    ],
    [
        "LES_007", "TR_VOCAB_CTX", "المفردات والتصاحبات اللفظية في السياق", "Vocabulary & Collocations in Context",
        "استخدام المتلازمات اللفظية الصحيحة وحروف الجر المناسبة وتجنب الأخطاء الشائعة",
        "1. أفعال تأخذ حروف جر محددة (pleased with, afraid of) 2. أفعال إنجليزية بلا حرف جر (affect, celebrate, enjoy) 3. المتلازمات الشائعة",
        16, 25, "Source 1 & 2", "Pages 12, 13, 22–26, 48–51"
    ],
    [
        "LES_008", "TR_TECHNIQUES", "فنون وتقنيات التصرف وإعادة الصياغة", "Translation Techniques & Paraphrasing",
        "إتقان تقنيات التصرف اللغوي والبدائل عندما تغيب الكلمة المباشرة عن الذاكرة",
        "1. الترجمة لغة التصرف 2. بدائل المنتجات الوطنية (national products / local goods) 3. التعبير عن النفي والإثبات 4. التعامل مع التعبيرات الاصطلاحية",
        8, 14, "Source 1", "Pages 18, 21"
    ],
    [
        "LES_009", "TR_MISTAKES", "الأخطاء الشائعة وكيفية تفاديها", "Common Translation Mistakes & Pitfalls",
        "رصد الأخطاء القاتلة في امتحانات الثانوية العامة وتصحيحها الفوري",
        "1. ترجمة الكلمة خارج سياقها 2. إغفال الفاعل 3. جمع الصفات بالخطأ 4. وضع the مع الأسماء المعنوية وغير المعدودة 5. الخلط في موضع only",
        10, 16, "Source 1 & 3", "Pages 9, 10, 14, 15, 20"
    ],
    [
        "LES_010", "TR_SENTENCES", "ترجمة الجمل في القضايا الوطنية والمعاصرة", "Sentence Translation in Contemporary Topics",
        "ترجمة جمل متقدمة تغطي المشروعات القومية، البيئة، الذكاء الاصطناعي، والتعليم",
        "1. ترجمة قضايا الاستصلاح وتوشكى 2. الطاقة المتجددة والمياه 3. ثقافة القراءة ومكتبات الطفل 4. العولمة والتنمية الاقتصادية",
        20, 30, "Source 2 & 3", "Pages 27–34, 45–47, 52–54"
    ],
    [
        "LES_011", "TR_PARAGRAPHS", "ترجمة الفقرات وأدوات الربط وعلامات الترقيم", "Paragraph Translation & Cohesive Devices",
        "ترجمة نصوص وفقرات كاملة مع الحفاظ على ترابط الجمل وسلاسة الانتقال",
        "1. أدوات الربط (Moreover, Therefore, Hence, In addition) 2. علامات الترقيم وتأثيرها على المعنى 3. المحافظة على التناغم الأسلوبي",
        15, 20, "Source 2 & 3", "Pages 35–38, 63–75"
    ],
    [
        "LES_012", "TR_EXAM_PRACTICE", "نماذج امتحانات الثانوية العامة وبوكليت الوزارة", "Exam Translation Practice & Ministry Booklets",
        "التدريب المكثف على نماذج امتحانات الثانوية العامة من 1980 حتى 2008 ونماذج الوزارة الحديثة",
        "1. استراتيجيات الاستبعاد في الاختيار من متعدد 2. إدارة وقت سؤال الترجمة 3. مراجعة الإجابة وفق معايير التصحيح الخمسة 4. بنك امتحانات شامل",
        25, 45, "Source 2 & 3", "Pages 39–44, 54–57"
    ]
]
save_excel(os.path.join(DATA_DIR, "LESSONS_MASTER.xlsx"), "Lessons", lessons_master_headers, lessons_master_rows)

print("Step 2 (Lessons Master) done.")
