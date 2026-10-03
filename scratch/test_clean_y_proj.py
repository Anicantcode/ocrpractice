import sys
import os
import re
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)
oriented_pil = orig_pil.rotate(90, expand=True)

results, _ = ocr_engine._engine(np.array(oriented_pil))
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
    })

slope = 0.088
data_tokens = []
for t in tokens:
    y_proj = t["y_center"] - slope * (t["x_center"] - 200.0)
    t["y_proj"] = y_proj
    if y_proj >= 225:
        data_tokens.append(t)

data_tokens.sort(key=lambda t: t["y_proj"])

print(f"Data tokens with y_proj >= 225: {len(data_tokens)}")
for t in data_tokens:
    print(f"y_proj={t['y_proj']:.1f}, x={t['x_center']:.1f}, y={t['y_center']:.1f}: '{t['text']}'")
