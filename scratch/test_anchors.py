import sys
import os
import re
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import is_pure_header, COLUMNS

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)

# Rotate 90
oriented_pil = orig_pil.rotate(90, expand=True)
img_np = np.array(oriented_pil)

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

# Project with slope 0.088
slope = 0.088
for t in tokens:
    t["y_proj"] = t["y_center"] - slope * (t["x_center"] - 200.0)

# Filter headers (y_proj < 215)
headers = [t for t in tokens if t["y_proj"] < 215 or is_pure_header(t["text"])]
data = [t for t in tokens if t not in headers]

# Find row lead anchors (x < 260)
lead_tokens = [t for t in data if t["x_center"] < 260]
lead_tokens.sort(key=lambda t: t["y_proj"])
print(f"Found {len(lead_tokens)} row lead anchors:")
for idx, lt in enumerate(lead_tokens):
    print(f"Anchor {idx+1}: y_proj={lt['y_proj']:.1f}, text='{lt['text']}'")

rows_assigned = {idx+1: [lt] for idx, lt in enumerate(lead_tokens)}
non_leads = [t for t in data if t not in lead_tokens]

for t in non_leads:
    best_anchor_idx = min(range(len(lead_tokens)), key=lambda i: abs(lead_tokens[i]["y_proj"] - t["y_proj"]))
    rows_assigned[best_anchor_idx + 1].append(t)

print("\nGrouped Rows:")
for sr, r_toks in rows_assigned.items():
    r_toks.sort(key=lambda t: t["x_center"])
    texts = [f"'{t['text']}'" for t in r_toks]
    print(f"Row {sr} ({len(r_toks)} tokens): {', '.join(texts)}")
