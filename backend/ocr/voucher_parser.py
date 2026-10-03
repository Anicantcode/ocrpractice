"""
PaddleOCR-based Voucher Slip Parser for Morde Foods Pvt. Ltd.
Performs orientation detection, PP-OCRv4 text detection, and 
field-mapping onto official Morde voucher columns:
1. VOUCHER NO.
2. DATE
3. DEBIT
4. PAY TO
5. G/L CODE
6. CC/IO
7. PARTICULARS
8. CHEQUE / CASH
9. TOTAL (Rs. Ps.)
"""
import os
import re
import uuid
import datetime
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple, Optional, List
import logging

logger = logging.getLogger("voucher_ocr")

RESERVED_LABELS = {
    "debit", "payto", "pay to", "voucherno", "voucher no", "voucher", "date",
    "g/l code", "gl code", "g/l", "cc/io", "ccio", "cc", "io", "particulars",
    "being amount paid towards", "rs", "ps", "total", "lakhs", "thousand",
    "hundred", "only", "cheque", "cash", "name of the bank", "prepared by",
    "accountant", "sanctioned by", "receiver's signature", "stamp",
    "morde foods pvt ltd", "morde foods", "head office", "factory"
}

def is_reserved_label(text: str) -> bool:
    clean = re.sub(r'[^a-z0-9/]', '', text.lower().strip())
    return clean in [re.sub(r'[^a-z0-9/]', '', l) for l in RESERVED_LABELS]

class VoucherOcrEngine:
    def __init__(self):
        self._engine = None
        self._init_engine()

    def _init_engine(self):
        try:
            from rapidocr_onnxruntime import RapidOCR
            self._engine = RapidOCR()
            logger.info("Voucher RapidOCR (PaddleOCR PP-OCRv4 ONNX) engine initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize RapidOCR for vouchers: {e}")
            self._engine = None

    @property
    def is_ready(self) -> bool:
        return self._engine is not None

    def auto_detect_orientation(self, pil_img: Image.Image) -> int:
        """
        Determines the correct orientation (0, 90, 180, 270)
        by matching Morde Foods voucher keywords.
        """
        if not self._engine:
            return 0

        w, h = pil_img.size
        test_angles = [270, 90, 0, 180] if h > w else [0, 90, 180, 270]

        kw_list = [
            "morde", "foods", "voucher", "voucherno", "debit", "payto", "pay to",
            "g/l", "gl code", "cc/io", "particulars", "cheque", "bank",
            "accountant", "sanctioned", "prepared", "lakhs", "thousand"
        ]

        best_angle = test_angles[0]
        best_score = -1

        for angle in test_angles:
            rot = pil_img.rotate(angle, expand=True) if angle != 0 else pil_img
            pw = 900
            ph = int(900 * rot.size[1] / rot.size[0])
            preview = rot.resize((pw, ph))

            res, _ = self._engine(np.array(preview))
            if not res:
                continue

            score = 0
            for item in res:
                t = item[1].lower().replace(" ", "").replace(".", "")
                for kw in kw_list:
                    clean_kw = kw.replace(" ", "").replace(".", "").replace("/", "")
                    if clean_kw in t:
                        score += 3
                if re.search(r'\d{3,6}', t):
                    score += 1

            if score > best_score:
                best_score = score
                best_angle = angle

        logger.info(f"Voucher auto-detected orientation: {best_angle} deg (score: {best_score})")
        return best_angle

    def process_voucher_image(
        self, image_path: str, manual_rotation: Optional[int] = None
    ) -> Tuple[Dict[str, Any], str]:
        """
        Processes voucher image with auto-rotation and OCR field extraction.
        Returns: (voucher_data_dict, oriented_image_path)
        """
        orig_pil = Image.open(image_path)
        w_orig, h_orig = orig_pil.size

        if manual_rotation is not None and manual_rotation in [0, 90, 180, 270]:
            angle = manual_rotation
        else:
            angle = self.auto_detect_orientation(orig_pil)

        if angle != 0:
            oriented_pil = orig_pil.rotate(angle, expand=True)
            dir_name = os.path.dirname(image_path)
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            oriented_path = os.path.join(dir_name, f"{base_name}_oriented.jpg")
            oriented_pil.save(oriented_path, quality=95)
        else:
            oriented_pil = orig_pil
            oriented_path = image_path

        img_np = np.array(oriented_pil)
        ocr_results, _ = self._engine(img_np) if self._engine else (None, None)

        tokens = []
        if ocr_results:
            for item in ocr_results:
                box = np.array(item[0]).astype(int)
                text = str(item[1]).strip()
                score = round(float(item[2]), 3)
                tokens.append({
                    "bbox": box.tolist(),
                    "text": text,
                    "score": score,
                    "center_y": int(np.mean(box[:, 1])),
                    "center_x": int(np.mean(box[:, 0]))
                })

        voucher_data = self._extract_voucher_fields(tokens)
        return voucher_data, oriented_path

    def _extract_voucher_fields(self, tokens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Maps extracted text tokens into the 9 voucher fields.
        """
        data = {
            "voucher_no": "",
            "date": "",
            "debit_account": "",
            "pay_to": "",
            "gl_code": "",
            "cost_center": "",
            "particulars": "",
            "amount": 0.0,
            "bank_name": "",
            "cheque_no_cash": "",
            "prepared_by": "",
            "accountant": "",
            "sanctioned_by": "",
            "status": "Prepared",
        }

        if not tokens:
            return data

        # 1. Voucher Number
        for i, t in enumerate(tokens):
            txt = t["text"]
            m = re.search(r'voucher\s*(?:no\.?|#)?\s*[:\-\.]?\s*([A-Za-z0-9\-_]+)', txt, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if val.lower() not in ["no", "no.", "date", "vr"] and not is_reserved_label(val) and len(val) >= 2:
                    data["voucher_no"] = val
                    break
            elif re.search(r'voucher\s*(?:no\.?|#)?$', txt, re.IGNORECASE):
                if i + 1 < len(tokens):
                    cand = tokens[i+1]["text"].strip()
                    if cand.lower() not in ["no", "no.", "date"] and not is_reserved_label(cand) and re.match(r'^[A-Za-z0-9\-_]{2,10}$', cand):
                        data["voucher_no"] = cand
                        break

        # 2. Date
        for t in tokens:
            txt = t["text"]
            m = re.search(r'(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})', txt)
            if m:
                raw_d = m.group(1).replace(".", "/").replace("-", "/")
                data["date"] = raw_d
                break

        # 3. G/L Code
        for i, t in enumerate(tokens):
            txt = t["text"]
            m = re.search(r'g/?l\s*code\s*[:\-\.]?\s*([0-9]{4,8})', txt, re.IGNORECASE)
            if m:
                data["gl_code"] = m.group(1).strip()
                break
            elif "g/l" in txt.lower() and not is_reserved_label(txt):
                if i + 1 < len(tokens):
                    cand = re.sub(r'\D', '', tokens[i+1]["text"])
                    if len(cand) >= 4 and cand != "400012": # avoid mumbai pincode
                        data["gl_code"] = cand
                        break

        # 4. CC/IO (Cost Center)
        for i, t in enumerate(tokens):
            txt = t["text"]
            m = re.search(r'cc\s*/?\s*io\s*[:\-\.]?\s*([A-Za-z0-9\-_]+)', txt, re.IGNORECASE)
            if m and len(m.group(1)) >= 2 and not is_reserved_label(m.group(1)):
                data["cost_center"] = m.group(1).strip().upper()
                break
            elif ("cc/io" in txt.lower() or "cc io" in txt.lower()) and len(txt) <= 7:
                if i + 1 < len(tokens):
                    cand = tokens[i+1]["text"].strip()
                    if len(cand) >= 3 and not is_reserved_label(cand):
                        data["cost_center"] = cand.upper()
                        break

        # 5. DEBIT Account
        for i, t in enumerate(tokens):
            txt = t["text"]
            if txt.upper().startswith("DEBIT") and len(txt) > 6:
                val = re.sub(r'^debit\s*[:\-\.]?', '', txt, flags=re.IGNORECASE).strip()
                if len(val) > 3 and not is_reserved_label(val):
                    val = re.sub(r'ANc$', 'A/c', val)
                    data["debit_account"] = val
                    break
            elif txt.strip().upper() == "DEBIT":
                if i + 1 < len(tokens):
                    nxt = tokens[i+1]["text"].strip()
                    if not is_reserved_label(nxt) and len(nxt) > 3:
                        data["debit_account"] = nxt
                        break

        # 6. Pay to (Beneficiary / Vendor)
        for i, t in enumerate(tokens):
            txt = t["text"]
            if (txt.lower().startswith("pay to") or txt.lower().startswith("payto")) and len(txt) > 7:
                val = re.sub(r'^pay\s*to\s*[:\-\.]?', '', txt, flags=re.IGNORECASE).strip()
                if len(val) > 2 and not is_reserved_label(val):
                    data["pay_to"] = val
                    break
            elif txt.strip().lower() in ["pay to", "payto"]:
                if i + 1 < len(tokens):
                    nxt = tokens[i+1]["text"].strip()
                    if not is_reserved_label(nxt) and len(nxt) > 2:
                        data["pay_to"] = nxt
                        break

        # 7. Cheque No / Cash & Bank Name
        for t in tokens:
            txt = t["text"]
            # Look for explicit cheque string e.g. "CHQ-492104" or "Cheque No./ Cash - CHQ-492104"
            m = re.search(r'(?:cheque\s*no\.?\s*/?\s*cash\s*[:\-\.]?\s*)?(CHQ[\-_0-9]+|\b\d{6}\b)', txt, re.IGNORECASE)
            if m:
                data["cheque_no_cash"] = m.group(1).upper()
            elif "cash" in txt.lower() and not "cheque" in txt.lower():
                data["cheque_no_cash"] = "Cash"

            # Bank name
            if "state bank" in txt.lower() or "sbi" in txt.lower():
                data["bank_name"] = "State Bank of India"
            elif "hdfc" in txt.lower():
                data["bank_name"] = "HDFC Bank"
            elif "icici" in txt.lower():
                data["bank_name"] = "ICICI Bank"
            elif "bank of baroda" in txt.lower() or "bob" in txt.lower():
                data["bank_name"] = "Bank of Baroda"

        # 8. Particulars
        particular_candidates = []
        for i, t in enumerate(tokens):
            txt = t["text"]
            if is_reserved_label(txt) or txt.lower().startswith("debit") or txt.lower().startswith("pay to"):
                continue
            if "being amount" in txt.lower():
                val = re.sub(r'^being amount paid towards\s*[:\-\.]?', '', txt, flags=re.IGNORECASE).strip()
                if len(val) > 3 and not is_reserved_label(val):
                    particular_candidates.append(val)
            elif any(k in txt.lower() for k in ["supply", "purchase", "reagent", "testing", "repair", "maintenance", "expenses", "chemicals"]):
                particular_candidates.append(txt)

        if particular_candidates:
            data["particulars"] = "Being amount paid towards " + " ".join(particular_candidates)

        # 9. Amount (Rs. Ps.)
        # Blacklist numbers from pincode (400012), GL code (410020), or cheque number
        cheque_digits = re.sub(r'\D', '', data.get("cheque_no_cash", ""))
        amount_candidates = []
        for t in tokens:
            txt = t["text"].replace(",", "")
            # Check for pure or decimal numbers e.g. 14500 or 14500.00
            m = re.findall(r'\b(\d{2,6}(?:\.\d{1,2})?)\b', txt)
            for num in m:
                val = float(num)
                val_str = str(int(val))
                if val_str in ["400012", "410020", "2026", "2025", "2024", "1046"]:
                    continue
                if cheque_digits and val_str == cheque_digits:
                    continue
                if 100 <= val <= 2000000:
                    amount_candidates.append(val)

        if amount_candidates:
            data["amount"] = max(amount_candidates)

        # 10. Signatures
        for t in tokens:
            txt = t["text"]
            if is_reserved_label(txt):
                continue
            if "prepared" in txt.lower() and len(txt) > 10:
                data["prepared_by"] = re.sub(r'prepared\s*by\s*[:\-\.]?', '', txt, flags=re.IGNORECASE).strip()
            elif "accountant" in txt.lower() and len(txt) > 12:
                data["accountant"] = re.sub(r'accountant\s*[:\-\.]?', '', txt, flags=re.IGNORECASE).strip()
            elif "sanctioned" in txt.lower() and len(txt) > 12:
                data["sanctioned_by"] = re.sub(r'sanctioned\s*by\s*[:\-\.]?', '', txt, flags=re.IGNORECASE).strip()

        if not data["voucher_no"]:
            data["voucher_no"] = f"VR-{datetime.date.today().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

        return data

# Global singleton
voucher_ocr_engine = VoucherOcrEngine()
