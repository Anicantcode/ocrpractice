import sys
import os
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import parse_sheet_rows

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img = Image.open(oriented_path)
results, _ = ocr_engine._engine(np.array(img))

tokens = []
for r in (results or []):
    tokens.append({
        "bbox": r[0],
        "text": str(r[1]).strip(),
        "confidence": round(float(r[2]), 3)
    })

rows = parse_sheet_rows(tokens)
print(f"Parsed {len(rows)} rows:")
for r in rows:
    print(r)
