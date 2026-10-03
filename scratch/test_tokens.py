import sys
import os
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img = Image.open(oriented_path)
results, _ = ocr_engine._engine(np.array(img))

print("Total OCR tokens found:", len(results or []))
for r in (results or []):
    print(f"Bbox: {r[0]}, Text: '{r[1]}', Conf: {r[2]:.2f}")
