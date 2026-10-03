import sys
import os
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img_cv = cv2.imread(oriented_path)
gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

edges = cv2.Canny(gray, 50, 150, apertureSize=3)
lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=20)
angles = [np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) for l in lines if -30 < np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) < 30]
skew_angle = float(np.median(angles))
print(f"Detected Hough line slope: {skew_angle:.2f}°")

# Counter-clockwise rotation (+skew_angle)
img_pil = Image.open(oriented_path)
deskewed_pil = img_pil.rotate(skew_angle, expand=True, resample=Image.Resampling.BICUBIC)
deskewed_np = np.array(deskewed_pil)

results, _ = ocr_engine._engine(deskewed_np)
tokens = []
for r in (results or []):
    bbox = r[0]
    y_c = sum(pt[1] for pt in bbox) / 4.0
    x_c = sum(pt[0] for pt in bbox) / 4.0
    tokens.append((y_c, x_c, str(r[1]).strip()))

tokens.sort(key=lambda t: t[0])
print(f"\nTotal tokens with POSITIVE {skew_angle:.2f}° rotation: {len(tokens)}")
for y_c, x_c, text in tokens:
    print(f"y={y_c:.1f}, x={x_c:.1f}: '{text}'")
