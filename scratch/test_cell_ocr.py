import cv2
import numpy as np
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

table_img = cv2.imread("scratch/table_all.jpg")

col_ranges = [
    ("sr no", 10, 68),
    ("date", 68, 145),
    ("Batch Number", 145, 230),
    ("product code", 230, 355),
    ("paper weight", 355, 435),
    ("sample paper weight", 435, 525),
    ("sample weight", 525, 600),
    ("after drying weight", 600, 675),
    ("fat %", 675, 755),
    ("moisture %", 755, 815),
    ("ph", 815, 860),
    ("particle size", 860, 970)
]

row_ranges = [
    (1, 60, 115),
    (2, 115, 170),
    (3, 170, 225),
    (4, 225, 280),
    (5, 280, 335),
]

print("Running cell-by-cell OCR test:")
for sr, r_top, r_bot in row_ranges:
    row_vals = {}
    for col_name, c_left, c_right in col_ranges:
        # Crop cell with small padding
        cell = table_img[max(0, r_top-2):r_bot+2, max(0, c_left-2):c_right+2]
        res, _ = ocr_engine._engine(cell)
        txt = " ".join(r[1] for r in (res or []))
        row_vals[col_name] = txt
    print(f"Row {sr}: {row_vals}")
