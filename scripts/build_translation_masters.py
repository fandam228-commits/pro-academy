import os
import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BASE_DIR = r"C:\Users\fanda\Documents\pro-academy"
DATA_DIR = os.path.join(BASE_DIR, "translation-academy-data")
SRC_DIR = r"C:\Users\fanda\.gemini\antigravity\brain\9e49d30e-0f2a-4ab8-8f0f-f12ca9606afd\.user_uploaded"

os.makedirs(DATA_DIR, exist_ok=True)

# Styling helpers for OpenPyXL
HEADER_FILL = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
HEADER_FONT = Font(name="Arial", size=11, bold=True, color="FFFFFF")
ZEBRA_FILL = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
REG_FONT = Font(name="Arial", size=10)
BOLD_FONT = Font(name="Arial", size=10, bold=True)
THIN_BORDER = Border(
    left=Side(style='thin', color='E5E7EB'),
    right=Side(style='thin', color='E5E7EB'),
    top=Side(style='thin', color='E5E7EB'),
    bottom=Side(style='thin', color='E5E7EB')
)

def format_sheet(ws, title, headers, rows):
    ws.title = title
    ws.append(headers)
    for col_num, _ in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws.row_dimensions[1].height = 28

    for r_idx, row in enumerate(rows, start=2):
        ws.append(row)
        ws.row_dimensions[r_idx].height = 22
        fill = ZEBRA_FILL if r_idx % 2 == 0 else PatternFill(fill_type=None)
        for col_num in range(1, len(row) + 1):
            cell = ws.cell(row=r_idx, column=col_num)
            cell.font = REG_FONT
            cell.border = THIN_BORDER
            if fill.fill_type:
                cell.fill = fill
            cell.alignment = Alignment(vertical="center", wrap_text=True)

    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 55)

print("Master styling and builder initialized.")
