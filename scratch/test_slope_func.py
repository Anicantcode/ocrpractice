import sys
import os
sys.path.insert(0, ".")
import numpy as np

def estimate_text_row_slope(tokens):
    """
    Finds the slant angle / slope that best aligns text tokens into horizontal rows.
    Tests candidate slopes and picks the one minimizing vertical dispersion.
    """
    if len(tokens) < 8:
        return 0.105

    tok_coords = []
    for t in tokens:
        xc = t["x_center"]
        yc = t["y_center"]
        tok_coords.append((xc, yc))

    best_slope = 0.105
    best_score = float('inf')

    # Test candidate slopes from 0.00 to 0.14
    for cand in np.linspace(0.00, 0.14, 29):
        # Project Y coordinates
        y_projs = np.array([yc - cand * (xc - 200.0) for xc, yc in tok_coords])
        # Data tokens (below header)
        y_data = y_projs[y_projs >= 210]
        if len(y_data) < 8:
            continue
        
        # Sort and evaluate consecutive differences
        y_sorted = np.sort(y_data)
        # In a well-aligned table, items in the same row have very small delta Y (< 8px),
        # while jumps between rows are large (> 25px).
        # We want small intra-cluster variance.
        # Sum of min distance to 5 row centroids (quantiles):
        quantiles = np.quantile(y_sorted, [0.1, 0.3, 0.5, 0.7, 0.9])
        dists = np.min(np.abs(y_sorted[:, None] - quantiles[None, :]), axis=1)
        score = np.mean(dists)
        if score < best_score:
            best_score = score
            best_slope = cand

    return round(float(best_slope), 4)

# Test on user tokens
from PIL import Image
from backend.ocr.engine import ocr_engine

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)
oriented_pil = orig_pil.rotate(90, expand=True)
results, _ = ocr_engine._engine(np.array(oriented_pil))
toks = []
for r in results:
    bbox = r[0]
    toks.append({
        "x_center": sum(pt[0] for pt in bbox)/4.0,
        "y_center": sum(pt[1] for pt in bbox)/4.0,
        "text": str(r[1]).strip()
    })

est = estimate_text_row_slope(toks)
print(f"Estimated best slope: {est}")
