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

# Rotate 90
oriented_pil = orig_pil.rotate(90, expand=True)
img_np = np.array(oriented_pil)

# Hough line slope
gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
edges = cv2.Canny(gray, 50, 150, apertureSize=3)
lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80, minLineLength=80, maxLineGap=20)
angles = [np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) for l in lines if -25 < np.degrees(np.arctan2(l[0][3] - l[0][1], l[0][2] - l[0][0])) < 25]
skew_angle = float(np.median(angles)) if angles else 0.0
slope = float(np.tan(np.radians(skew_angle)))
print(f"Hough skew angle: {skew_angle:.2f}°, slope: {slope:.4f}")

# Extract tokens
results, _ = ocr_engine._engine(img_np)
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
        "x_center": x_center,
        "y_min": min(pt[1] for pt in bbox),
        "y_max": max(pt[1] for pt in bbox),
        "x_min": min(pt[0] for pt in bbox),
        "x_max": max(pt[0] for pt in bbox)
    })

print(f"Tokens: {len(tokens)}")

# Now test projection
for t in tokens:
    t["y_proj"] = t["y_center"] - slope * (t["x_center"] - 200.0)

tokens.sort(key=lambda t: t["y_proj"])
for t in tokens:
    print(f"y_proj={t['y_proj']:.1f}, x={t['x_center']:.1f}: '{t['text']}'")
