import sys
import os
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import decompose_compound_lead, parse_float_safe, fix_qc_measurement, COLUMNS

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img = Image.open(oriented_path)
results, _ = ocr_engine._engine(np.array(img))

tokens = []
for r in (results or []):
    bbox = r[0]
    y_center = sum(pt[1] for pt in bbox) / 4.0
    x_center = sum(pt[0] for pt in bbox) / 4.0
    tokens.append({
        "text": str(r[1]).strip(),
        "confidence": round(float(r[2]), 3),
        "y_center": y_center,
        "x_center": x_center,
        "y_min": min(pt[1] for pt in bbox),
        "y_max": max(pt[1] for pt in bbox),
        "x_min": min(pt[0] for pt in bbox),
        "x_max": max(pt[0] for pt in bbox),
        "bbox": bbox
    })

# Filter out top headers (y < 230)
# Notice all table headers are at y < 233
row_anchors = [
    {"sr": 1, "y_center": 240.0},
    {"sr": 2, "y_center": 288.0},
    {"sr": 3, "y_center": 338.0},
    {"sr": 4, "y_center": 385.0},
    {"sr": 5, "y_center": 428.0},
]

# Estimate table tilt slope
slope = 0.085 # ~5 degrees

data_tokens = [t for t in tokens if t["y_center"] >= 230]

rows_assigned = {i: [] for i in range(1, 6)}
for t in data_tokens:
    # Project y to left margin (x=200)
    y_proj = t["y_center"] - slope * (t["x_center"] - 200.0)
    # Find closest row anchor
    best_row = min(row_anchors, key=lambda a: abs(a["y_center"] - y_proj))
    rows_assigned[best_row["sr"]].append(t)

for sr, toks in rows_assigned.items():
    toks.sort(key=lambda t: t["x_center"])
    texts = [f"'{t['text']}'(x={t['x_center']:.0f})" for t in toks]
    print(f"Row {sr} ({len(toks)} tokens): {', '.join(texts)}")
