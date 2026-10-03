import sys
import os
import json
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ocr.worker_parser import worker_ocr_engine

img_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\136c6451-672f-47d1-b820-ff39e1133be4\.user_uploaded\media_1790957102536.jpg"
data, oriented_path = worker_ocr_engine.process_image(img_path)

print("Metadata:")
print(json.dumps(data["metadata"], indent=2))
print("\nExtracted Rows Count:", len(data["rows"]))
print("-" * 105)
print(f"{'#':<3} | {'WORKING DETAIL':<30} | {'RATE':<5} | {'VEHICLE':<7} | {'UNIT':<4} | {'PALLETS':<7} | {'QTY':<8} | {'CODE':<12} | {'REMARK'}")
print("-" * 105)
for r in data["rows"]:
    print(f"{r['id']:<3} | {r['working_detail'][:30]:<30} | {r['rate']:<5} | {r['vehicle_no']:<7} | {r['unit']:<4} | {r['pallets']:<7} | {r['qty']:<8} | {r['product_code'][:12]:<12} | {r['remark']}")
print("-" * 105)
