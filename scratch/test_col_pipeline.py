import sys
import os
import re
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import is_pure_header, COLUMNS, fix_qc_measurement, parse_float_safe

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)

# Rotate 90
oriented_pil = orig_pil.rotate(90, expand=True)
img_np = np.array(oriented_pil)
w, h = oriented_pil.size

results, _ = ocr_engine._engine(img_np)
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
        "x_center": x_center,
        "y_min": min(pt[1] for pt in bbox),
        "y_max": max(pt[1] for pt in bbox),
        "x_min": min(pt[0] for pt in bbox),
        "x_max": max(pt[0] for pt in bbox)
    })

# 1. Filter out table header line
# Headers are any pure header words or tokens in top 220px
data_tokens = [t for t in tokens if t["y_center"] > 220 and not is_pure_header(t["text"])]

# 2. Extract Lead Column (Date + Batch + Product) tokens (x < 360)
lead_tokens = [t for t in data_tokens if t["x_center"] < 360]
lead_tokens.sort(key=lambda t: t["y_center"])
print(f"Found {len(lead_tokens)} lead tokens:")
for lt in lead_tokens:
    print(f"  y={lt['y_center']:.1f}: '{lt['text']}'")

# 3. Extract Paper Weights (360 <= x < 450)
p_wt_tokens = [t for t in data_tokens if 360 <= t["x_center"] < 450]
p_wt_tokens.sort(key=lambda t: t["y_center"])
print(f"\nFound {len(p_wt_tokens)} paper weight tokens:")
for pt in p_wt_tokens:
    print(f"  y={pt['y_center']:.1f}: '{pt['text']}'")

# 4. Extract Sample Paper Weights (450 <= x < 540)
sp_wt_tokens = [t for t in data_tokens if 450 <= t["x_center"] < 540]
sp_wt_tokens.sort(key=lambda t: t["y_center"])
print(f"\nFound {len(sp_wt_tokens)} sample paper weight tokens:")
for spt in sp_wt_tokens:
    print(f"  y={spt['y_center']:.1f}: '{spt['text']}'")

# 5. Extract Sample & Dry Weights (540 <= x < 680)
mid_tokens = [t for t in data_tokens if 540 <= t["x_center"] < 680]
mid_tokens.sort(key=lambda t: t["y_center"])
print(f"\nFound {len(mid_tokens)} mid weight tokens:")
for mt in mid_tokens:
    print(f"  y={mt['y_center']:.1f}: '{mt['text']}'")

# 6. Extract Trailing Measurements (x >= 680)
tail_tokens = [t for t in data_tokens if t["x_center"] >= 680]
tail_tokens.sort(key=lambda t: t["y_center"])
print(f"\nFound {len(tail_tokens)} tail tokens:")
for tt in tail_tokens:
    print(f"  y={tt['y_center']:.1f}: '{tt['text']}'")
