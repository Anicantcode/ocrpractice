import cv2
import numpy as np
from PIL import Image

oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"
img = cv2.imread(oriented_path)
h, w = img.shape[:2]

# Let's crop vertical slices:
# Slice 1: Left columns (Date, Batch, Product, Paper wt)
cv2.imwrite("scratch/col_left.jpg", img[:, :int(w*0.5)])
# Slice 2: Right columns (Dry wt, Fat %, Moist %, pH, Particle)
cv2.imwrite("scratch/col_right.jpg", img[:, int(w*0.5):])

# Slice table rows:
# Table is roughly from y=170 to y=520
cv2.imwrite("scratch/table_all.jpg", img[170:520, :])
print(f"Saved crops. Image size: {w}x{h}")
