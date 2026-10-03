import requests
import json

raw_img_path = r"C:/Users/Lenovo/.gemini/antigravity/brain/d608a0ba-abc4-49f6-b806-178ef07eb8bd/.user_uploaded/media_1790682917162.jpg"

with open(raw_img_path, 'rb') as f:
    files = {'file': ('user_sheet.jpg', f, 'image/jpeg')}
    # Do NOT pass rotation parameter - test auto-detection and extraction
    resp = requests.post('http://127.0.0.1:8000/api/ocr/process', files=files)

print("HTTP Status Code:", resp.status_code)
data = resp.json()
print("Report ID:", data.get("report_id"))
print(f"Extracted {len(data.get('rows', []))} rows:")
for r in data.get("rows", []):
    print(f"Row {r['sr no']}: Date:{r['date']} | Batch:{r['Batch Number']} | Prod:{r['product code']} | "
          f"P:{r['paper weight']} | SP:{r['sample paper weight']} | S:{r['sample weight']} | "
          f"Dry:{r['after drying weight']} | Fat:{r['fat %']} | Moist:{r['moisture %']} | "
          f"pH:{r['ph']} | Part:{r['particle size']}")
