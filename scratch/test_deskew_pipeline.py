import sys
import os
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import parse_sheet_rows

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img_cv = cv2.imread(oriented_path)
gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

edges = cv2.Canny(gray, 50, 150, apertureSize=3)
lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=20)
angles = [np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) for l in lines if -30 < np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) < 30]
skew_angle = float(np.median(angles))
print(f"Applying auto-deskew: {-skew_angle:.2f}°")

img_pil = Image.open(oriented_path)
deskewed_pil = img_pil.rotate(-skew_angle, expand=True, resample=Image.Resampling.BICUBIC)
deskewed_np = np.array(deskewed_pil)

results, _ = ocr_engine._engine(deskewed_np)
tokens = []
for r in (results or []):
    tokens.append({
        "bbox": r[0],
        "text": str(r[1]).strip(),
        "confidence": round(float(r[2]), 3)
    })

print(f"Total tokens after deskew: {len(tokens)}")
for t in tokens:
    y_c = sum(pt[1] for pt in t["bbox"]) / 4
    x_c = sum(pt[0] for pt in t["bbox"]) / 4
    print(f"y={y_c:.1f}, x={x_c:.1f}: '{t['text']}'")

rows = parse_sheet_rows(tokens)
print(f"\nParsed {len(rows)} structured rows:")
for r in rows:
    print(f"Row {r['sr no']}: {r['date']} | {r['Batch Number']} | {r['product code']} | "
          f"P:{r['paper weight']} | SP:{r['sample paper weight']} | S:{r['sample weight']} | "
          f"Dry:{r['after drying weight']} | Fat:{r['fat %']} | Moist:{r['moisture %']} | "
          f"pH:{r['ph']} | Part:{r['particle size']}")
