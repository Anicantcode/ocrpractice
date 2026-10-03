import sys
import os
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

raw_img_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"

rows, oriented_path = ocr_engine.process_image(raw_img_path, manual_rotation=None)
print("Oriented path:", oriented_path)
print("Oriented image size:", Image.open(oriented_path).size)
print(f"Total rows returned: {len(rows)}")
for r in rows:
    print(r)
