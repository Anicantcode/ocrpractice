import sys
import os
import json
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.ocr.qa_multi_parser import qa_multi_parser

print("=" * 80)
print("TEST 1: MULTI-SHEET DYNAMIC OCR ON MICROBIOLOGICAL REPORT (HIGH RES / LANDSCAPE)")
print("=" * 80)

p1 = r"C:\Users\Lenovo\.gemini\antigravity\brain\136c6451-672f-47d1-b820-ff39e1133be4\.user_uploaded\media_1790960474744.jpg"
if os.path.exists(p1):
    sheet_type, cols, rows, oriented_path, meta = qa_multi_parser.process_image(p1)
    print(f"Sheet Type: {sheet_type}")
    print(f"Metadata: {meta}")
    print(f"Total Rows Extracted: {len(rows)}")
    for idx, r in enumerate(rows):
        sr = r.get("Sr. No.", "")
        batch = r.get("Batch No.", "")
        code = r.get("Code No.", "")
        pname = r.get("Product Name", "")
        tpc = r.get("TPC Total", "")
        ym = r.get("Y&M", "")
        coli = r.get("Coliform", "")
        ecoli = r.get("E.coli", "")
        entero = r.get("Enterobacteriaceae", "")
        rem = r.get("Remark", "")
        print(f"Row {idx+1:02d}: Sr={sr:3s} | Batch={batch:15s} | Code={code:10s} | Product={pname:28s} | TPC={tpc:5s} | Y&M={ym:4s} | Coli={coli:4s} | Ecoli={ecoli:4s} | Entero={entero:4s} | Rem={rem}")
else:
    print(f"Image not found at {p1}")

print("\n" + "=" * 80)
print("TEST 2: MULTI-SHEET DYNAMIC OCR ON FINISHED GOODS RECORD")
print("=" * 80)

p2 = r"C:\Users\Lenovo\.gemini\antigravity\brain\136c6451-672f-47d1-b820-ff39e1133be4\.user_uploaded\media_1790958859091.jpg"
if os.path.exists(p2):
    sheet_type, cols, rows, oriented_path, meta = qa_multi_parser.process_image(p2)
    print(f"Sheet Type: {sheet_type}")
    print(f"Metadata: {meta}")
    print(f"Total Rows Extracted: {len(rows)}")
    for idx, r in enumerate(rows[:10]):
        print(f"Row {idx+1:02d}: { {k: v for k, v in r.items() if v} }")
else:
    print(f"Image not found at {p2}")
