import sys
import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, ".")
from backend.ocr.engine import ocr_engine

raw_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
orig_pil = Image.open(raw_path)
oriented_pil = orig_pil.rotate(90, expand=True)
results, _ = ocr_engine._engine(np.array(oriented_pil))

toks = []
for r in results:
    bbox = r[0]
    yc = sum(pt[1] for pt in bbox)/4.0
    xc = sum(pt[0] for pt in bbox)/4.0
    toks.append((yc, xc, str(r[1]).strip()))

def score_slope(slope):
    # Project Y to xc=200
    y_projs = np.array([yc - slope * (xc - 200.0) for yc, xc, _ in toks])
    # Filter to data region
    y_data = y_projs[y_projs >= 210]
    if len(y_data) < 10:
        return 999.0
    # Sort
    y_sorted = np.sort(y_data)
    # The sum of squared differences to 5 cluster centers (k-means 1D)
    # Or simply: KDE peak sharpness / 1D k-means inertia
    from scipy.cluster.vq import kmeans, vq
    centroids, _ = kmeans(y_sorted, 5)
    _, dist = vq(y_sorted, centroids)
    inertia = np.sum(dist ** 2)
    return inertia

for s in np.linspace(0.0, 0.15, 31):
    try:
        sc = score_slope(s)
        print(f"slope={s:6.4f}  inertia={sc:7.1f}")
    except Exception as e:
        print(f"slope={s:6.4f} err: {e}")
