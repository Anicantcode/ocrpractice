import sys
import os
import cv2
import numpy as np
from PIL import Image

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img_cv = cv2.imread(oriented_path)
gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

# Find horizontal lines or edges
edges = cv2.Canny(gray, 50, 150, apertureSize=3)
lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=20)

angles = []
if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle_rad = np.arctan2(y2 - y1, x2 - x1)
        angle_deg = np.degrees(angle_rad)
        # We only care about near-horizontal lines (-30 to +30 deg)
        if -30 < angle_deg < 30:
            angles.append(angle_deg)

if angles:
    median_angle = float(np.median(angles))
    print(f"Detected {len(angles)} near-horizontal lines. Median skew angle: {median_angle:.2f}°")
else:
    print("No lines detected")
