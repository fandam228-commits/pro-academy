import os
import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BASE_DIR = r"C:\Users\fanda\Documents\pro-academy"
DATA_DIR = os.path.join(BASE_DIR, "translation-academy-data")
SRC_DIR = r"C:\Users\fanda\.gemini\antigravity\brain\9e49d30e-0f2a-4ab8-8f0f-f12ca9606afd\.user_uploaded"

os.makedirs(DATA_DIR, exist_ok=True)

# Styling helpers
HEADER_FILL = PatternFill(start_color="1E1B4B", end_color="1E1B4B", fill_type="solid") # Dark purple/indigo
HEADER_FONT = Font(name="Arial", size=11, bold=True, color="FFFFFF")
ZEBRA_FILL = PatternFill(start_color="F5F3FF", end_color="F5F3FF", fill_type="solid") # Light purple
REG_FONT = Font(name="Arial", size=10)
BOLD_FONT = Font(name="Arial", size=10, bold=True)
BORDER_GRAY = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)

def create_excel_workbook(filepath, sheet_title, headers, rows):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = sheet_title

    # Header Row
    ws.append(headers)
    ws.row_dimensions[1].height = 28
    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    # Data Rows
    for r_idx, row in enumerate(rows, start=2):
        ws.append(row)
        ws.row_dimensions[r_idx].height = 22
        fill = ZEBRA_FILL if r_idx % 2 == 0 else PatternFill(fill_type=None)
        for col_num in range(1, len(row) + 1):
            cell = ws.cell(row=r_idx, column=col_num)
            cell.font = REG_FONT
            cell.border = BORDER_GRAY
            if fill.fill_type:
                cell.fill = fill
            # Center ID, pages, codes, otherwise left-aligned
            val_str = str(cell.value or "")
            if col_num in [1, 2, 4, 5, 8, 9] and len(val_str) < 25:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    # Column widths
    for col in ws.columns:
        max_len = 0
        for cell in col:
            v = str(cell.value or '')
            # If string contains newlines, take max line length
            lines = v.split('\n')
            max_line = max(len(l) for l in lines) if lines else 0
            if max_line > max_len:
                max_len = max_line
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min(max(max_len + 4, 12), 60)

    wb.save(filepath)
    print(f"Saved: {filepath} ({len(rows)} records)")

print("Helper ready.")
