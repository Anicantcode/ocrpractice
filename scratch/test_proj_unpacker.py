import sys
import os
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import is_pure_header
from scratch.test_unpacker import unpack_qc_row_tokens

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img = Image.open(oriented_path)
results, _ = ocr_engine._engine(np.array(img))

tokens = []
for r in (results or []):
    bbox = r[0]
    y_center = sum(pt[1] for pt in bbox) / 4.0
    x_center = sum(pt[0] for pt in bbox) / 4.0
    tokens.append({
        "bbox": bbox,
        "text": str(r[1]).strip(),
        "confidence": round(float(r[2]), 3),
        "y_center": y_center,
        "x_center": x_center
    })

slope = 0.085
for t in tokens:
    t["y_proj"] = t["y_center"] - slope * (t["x_center"] - 200.0)

data_tokens = [t for t in tokens if t["y_proj"] >= 215 and not is_pure_header(t["text"])]
data_tokens.sort(key=lambda t: t["y_proj"])

rows_grouped = []
current_row = []
current_y_proj = None

for t in data_tokens:
    if current_y_proj is None:
        current_row.append(t)
        current_y_proj = t["y_proj"]
    elif abs(t["y_proj"] - current_y_proj) <= 26.0:
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

print(f"Total grouped rows: {len(rows_grouped)}")
for idx, r_tokens in enumerate(rows_grouped):
    rec = unpack_qc_row_tokens(r_tokens)
    rec["sr no"] = idx + 1
    print(f"Row {idx+1}: Date:{rec['date']} | Batch:{rec['Batch Number']} | Prod:{rec['product code']} | "
          f"P:{rec['paper weight']} | SP:{rec['sample paper weight']} | S:{rec['sample weight']} | "
          f"Dry:{rec['after drying weight']} | Fat:{rec['fat %']} | Moist:{rec['moisture %']} | "
          f"pH:{rec['ph']} | Part:{rec['particle size']}")
