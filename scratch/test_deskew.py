import sys
import os
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img = Image.open(oriented_path)

# Test slight rotation angles from -8 to -2 in 1 deg steps
for deg in [-6.0, -5.5, -5.0, -4.5, -4.0]:
    rotated = img.rotate(deg, expand=True, resample=Image.Resampling.BICUBIC)
    results, _ = ocr_engine._engine(np.array(rotated))
    texts = [r[1] for r in (results or [])]
    # Check how many quality keywords / batches / floats are recognized
    print(f"Angle {deg}°: {len(results or [])} tokens. Sample texts:")
    for t in texts[:8]:
        print(f"   '{t}'")
