import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath("."))

from backend.ocr.engine import ocr_engine

img_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"
rows, oriented_path = ocr_engine.process_image(img_path, manual_rotation=90)

print(f"\nExtracted {len(rows)} rows from user's image:")
for r in rows:
    print(f"Row {r['sr no']}: {r['date']} | {r['Batch Number']} | {r['product code']} | "
          f"P_Wt:{r['paper weight']} | SP_Wt:{r['sample paper weight']} | S_Wt:{r['sample weight']} | "
          f"Dry_Wt:{r['after drying weight']} | Fat:{r['fat %']} | Moist:{r['moisture %']} | "
          f"pH:{r['ph']} | Particle:{r['particle size']}")
