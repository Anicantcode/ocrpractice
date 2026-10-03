import sys
import re
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, ".")
from backend.ocr.engine import ocr_engine
from backend.ocr.parser import decompose_compound_lead, fix_qc_measurement, parse_float_safe, COLUMNS

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)
oriented_pil = orig_pil.rotate(90, expand=True)
results, _ = ocr_engine._engine(np.array(oriented_pil))

slope = 0.100
toks = []
for r in results:
    bbox = r[0]
    yc = sum(pt[1] for pt in bbox)/4.0
    xc = sum(pt[0] for pt in bbox)/4.0
    yp = yc - slope * (xc - 200.0)
    toks.append({
        'text': str(r[1]).strip(),
        'confidence': round(float(r[2]), 3),
        'yc': yc, 'xc': xc, 'yp': yp,
        'bbox': bbox,
        'ymin': min(pt[1] for pt in bbox),
        'ymax': max(pt[1] for pt in bbox),
        'xmin': min(pt[0] for pt in bbox),
        'xmax': max(pt[0] for pt in bbox)
    })

row_bands = [
    (1, 218, 248),
    (2, 248, 288),
    (3, 288, 345),
    (4, 345, 395),
    (5, 395, 450)
]

for sr, y_min, y_max in row_bands:
    r_toks = [t for t in toks if y_min <= t['yp'] < y_max]
    print(f"\n=== ROW {sr} (tokens: {len(r_toks)}) ===")
    for t in sorted(r_toks, key=lambda x: x['xc']):
        print(f"   xc={t['xc']:5.1f} yp={t['yp']:5.1f}: \"{t['text']}\"")
