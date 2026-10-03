import sys
import os
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import parse_sheet_rows, is_pure_header

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)
oriented_pil = orig_pil.rotate(90, expand=True)

img_np = np.array(oriented_pil)
gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150, apertureSize=3)
lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80, minLineLength=80, maxLineGap=20)
angles = [np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) for l in lines if -25 < np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) < 25]
median_angle = float(np.median(angles))

deskewed_pil = oriented_pil.rotate(median_angle, expand=True, resample=Image.Resampling.BICUBIC)
deskewed_np = np.array(deskewed_pil)

results, _ = ocr_engine._engine(deskewed_np)
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
        "x_center": x_center
    })

data_tokens = [t for t in tokens if not is_pure_header(t["text"])]
data_tokens.sort(key=lambda t: t["y_center"])

print("Data tokens sorted by y_center:")
for t in data_tokens:
    print(f"y={t['y_center']:.1f}, x={t['x_center']:.1f}: '{t['text']}'")
