import numpy as np
from PIL import Image

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
oriented_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162_oriented.jpg"

raw = Image.open(raw_path)
target = Image.open(oriented_path)

target_np = np.array(target)

for angle in [0, 90, 180, 270]:
    rot = raw.rotate(angle, expand=True)
    if rot.size == target.size:
        diff = np.mean(np.abs(np.array(rot).astype(float) - target_np.astype(float)))
        print(f"Angle {angle}: mean diff = {diff:.2f}")

# Also test transpose
for method in [Image.Transpose.ROTATE_90, Image.Transpose.ROTATE_180, Image.Transpose.ROTATE_270]:
    tr = raw.transpose(method)
    if tr.size == target.size:
        diff = np.mean(np.abs(np.array(tr).astype(float) - target_np.astype(float)))
        print(f"Transpose {method}: mean diff = {diff:.2f}")
