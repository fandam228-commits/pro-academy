import os
import re
import json
from pypdf import PdfReader
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

BASE_DIR = r"C:\Users\fanda\Documents\pro-academy"
DATA_DIR = os.path.join(BASE_DIR, "translation-academy-data")
SRC_DIR = r"C:\Users\fanda\.gemini\antigravity\brain\9e49d30e-0f2a-4ab8-8f0f-f12ca9606afd\.user_uploaded"

PDF_SOURCES = {
    "source_1": {
        "file": "media_1794430995034_777c6742.pdf",
        "title": "Translation Level 1 — Rules, Principles & Vocabulary",
        "page_offset": 9, # pages 9-26
        "expected_pages": 18
    },
    "source_2": {
        "file": "media_1794430995035_5e415589.pdf",
        "title": "Applied Translation Exercises, Texts & Vocabulary",
        "page_offset": 27, # pages 27-51
        "expected_pages": 25
    },
    "source_3": {
        "file": "media_1794430995037_6791a59a.pdf",
        "title": "General Secondary & Ministry Exams, Paragraphs & Terminology",
        "page_offset": 52, # pages 52-75
        "expected_pages": 24
    }
}

print("Configured PDF sources successfully.")
