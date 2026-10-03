import sys
import os
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import is_pure_header, decompose_compound_lead

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

tokens.sort(key=lambda t: t["y_center"])

print(f"Total tokens: {len(tokens)}")
for t in tokens:
    is_hdr = is_pure_header(t["text"])
    lead = decompose_compound_lead(t["text"])
    print(f"y={t['y_center']:.1f}, x={t['x_center']:.1f} | hdr={is_hdr} | text='{t['text']}' | lead={lead}")
