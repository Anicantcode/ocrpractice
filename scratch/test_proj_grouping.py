import sys
import os
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import decompose_compound_lead, parse_float_safe, fix_qc_measurement, is_pure_header, COLUMNS

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
        "bbox": bbox
    })

# Compute slope: in this image, angle is ~4.88 deg -> slope = tan(4.88 deg) = 0.085
slope = 0.085

# Project each token to left reference line x = 200
for t in tokens:
    t["y_proj"] = t["y_center"] - slope * (t["x_center"] - 200.0)

# Filter out headers: headers have y_proj < 215
header_tokens = [t for t in tokens if t["y_proj"] < 215 or is_pure_header(t["text"])]
data_tokens = [t for t in tokens if t not in header_tokens]

data_tokens.sort(key=lambda t: t["y_proj"])

# Group into rows using y_proj with threshold 28px
rows_grouped = []
current_row = []
current_y_proj = None

for t in data_tokens:
    if current_y_proj is None:
        current_row.append(t)
        current_y_proj = t["y_proj"]
    elif abs(t["y_proj"] - current_y_proj) <= 28.0:
        current_row.append(t)
        current_y_proj = sum(item["y_proj"] for item in current_row) / len(current_row)
    else:
        current_row.sort(key=lambda x: x["x_center"])
        rows_grouped.append(current_row)
        current_row = [t]
        current_y_proj = t["y_proj"]

if current_row:
    current_row.sort(key=lambda x: x["x_center"])
    rows_grouped.append(current_row)

print(f"Grouped into {len(rows_grouped)} rows:")
for idx, r in enumerate(rows_grouped):
    toks_str = ", ".join(f"'{t['text']}'(x={t['x_center']:.0f},y={t['y_center']:.0f})" for t in r)
    print(f"Row {idx+1}: {toks_str}")
