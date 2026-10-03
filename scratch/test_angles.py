import sys
import os
from PIL import Image

sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"

raw_img = Image.open(raw_path)
print("Raw image size:", raw_img.size) # width, height

orient_img = Image.open(oriented_path)
print("Oriented image size:", orient_img.size)

# Test auto-orientation angle on raw_img
auto_angle = ocr_engine.auto_detect_orientation(raw_img)
print("Auto detect orientation returned:", auto_angle)

for angle in [270, 90, 0]:
    rows, _ = ocr_engine.process_image(raw_path, manual_rotation=angle)
    non_empty = sum(1 for r in rows if r.get("Batch Number") and not r["Batch Number"].startswith("B26"))
    print(f"Angle {angle}: {len(rows)} rows, non-default batches: {non_empty}")
    if rows:
        print("  Row 0 sample:", {k: v for k, v in rows[0].items() if k in ["date", "Batch Number", "product code", "paper weight", "fat %"]})
