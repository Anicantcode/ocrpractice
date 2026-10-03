import sys
import os
import cv2
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("."))
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import is_pure_header
from scratch.test_unpacker import unpack_qc_row_tokens

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)
oriented_pil = orig_pil.rotate(90, expand=True)

# Deskew with 3.16 deg
deskewed_pil = oriented_pil.rotate(3.16, expand=True, resample=Image.Resampling.BICUBIC)
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

data_tokens = [t for t in tokens if not is_pure_header(t["text"]) and t["y_center"] >= 260]

# Define 5 row bands around y=275, 315, 360, 410, 450
row_centers = [275, 315, 360, 410, 450]
rows_data = {i+1: [] for i in range(len(row_centers))}

for t in data_tokens:
    best_row_idx = min(range(len(row_centers)), key=lambda i: abs(row_centers[i] - t["y_center"]))
    rows_data[best_row_idx + 1].append(t)

print("Parsed Rows:")
for sr, r_tokens in rows_data.items():
    rec = unpack_qc_row_tokens(r_tokens)
    rec["sr no"] = sr
    print(f"Row {sr}: Date:{rec['date']} | Batch:{rec['Batch Number']} | Prod:{rec['product code']} | "
          f"P:{rec['paper weight']} | SP:{rec['sample paper weight']} | S:{rec['sample weight']} | "
          f"Dry:{rec['after drying weight']} | Fat:{rec['fat %']} | Moist:{rec['moisture %']} | "
          f"pH:{rec['ph']} | Part:{rec['particle size']}")
