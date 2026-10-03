import sys
import os
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import parse_sheet_rows

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)

# Rotate 90 to make landscape
oriented_pil = orig_pil.rotate(90, expand=True)

# Deskew
img_np = np.array(oriented_pil)
gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
edges = cv2.Canny(gray, 50, 150, apertureSize=3)
lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80, minLineLength=80, maxLineGap=20)
angles = [np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) for l in lines if -25 < np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) < 25]
median_angle = float(np.median(angles))
print(f"Median skew: {median_angle:.2f}°")

deskewed_pil = oriented_pil.rotate(median_angle, expand=True, resample=Image.Resampling.BICUBIC)
deskewed_np = np.array(deskewed_pil)

results, _ = ocr_engine._engine(deskewed_np)
tokens = []
for r in (results or []):
    tokens.append({
        "bbox": r[0],
        "text": str(r[1]).strip(),
        "confidence": round(float(r[2]), 3)
    })

rows = parse_sheet_rows(tokens)
print(f"Extracted {len(rows)} rows:")
for r in rows:
    print(f"Row {r['sr no']}: Date:{r['date']} | Batch:{r['Batch Number']} | Prod:{r['product code']} | "
          f"P:{r['paper weight']} | SP:{r['sample paper weight']} | S:{r['sample weight']} | "
          f"Dry:{r['after drying weight']} | Fat:{r['fat %']} | Moist:{r['moisture %']} | "
          f"pH:{r['ph']} | Part:{r['particle size']}")
