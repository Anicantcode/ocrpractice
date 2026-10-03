"""
Voucher Slip Parser for Morde Foods Pvt. Ltd.
Performs orientation detection, token extraction, and field-mapping onto official Morde voucher columns:
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
import cv2
import uuid
import datetime
import logging
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from PIL import Image

from ..manager import ocr_manager

logger = logging.getLogger("ocr.voucher_parser")

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


class VoucherParser:
    """
    Parser for Morde official voucher slips.
    """

    def process_voucher_image(
        self, image_path: str, manual_rotation: Optional[int] = None
    ) -> Tuple[Dict[str, Any], str]:
        """
        Processes voucher image with auto-rotation and OCR field extraction.
        Returns: (voucher_data_dict, oriented_image_path)
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image at {image_path}")

        # 1. Orientation via OcrManager
        img_oriented, _ = ocr_manager.detect_orientation(img, manual_rotation=manual_rotation)

        base, ext = os.path.splitext(image_path)
        oriented_path = f"{base}_oriented{ext}"
        cv2.imwrite(oriented_path, img_oriented)

        # 2. Token extraction via OcrManager
        raw_tokens, provider_used = ocr_manager.extract_tokens(oriented_path)

        tokens = []
        for t in raw_tokens:
            tokens.append({
                "bbox": t.bbox,
                "text": t.text,
                "score": t.confidence,
                "center_y": int(t.y_center),
                "center_x": int(t.x_center)
            })

        voucher_data = self._extract_voucher_fields(tokens)
        voucher_data["provider"] = provider_used
        return voucher_data, oriented_path

    def _extract_voucher_fields(self, tokens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Maps extracted text tokens into the voucher fields.
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
            "cheque_no_cash": "Cash",
            "prepared_by": "",
            "accountant": "",
            "sanctioned_by": "",
            "status": "Prepared",
        }

        if not tokens:
            data["voucher_no"] = f"VR-{datetime.date.today().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
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
                    if len(cand) >= 4 and cand != "400012":
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
            m = re.search(r'(?:cheque\s*no\.?\s*/?\s*cash\s*[:\-\.]?\s*)?(CHQ[\-_0-9]+|\b\d{6}\b)', txt, re.IGNORECASE)
            if m:
                data["cheque_no_cash"] = m.group(1).upper()
            elif "cash" in txt.lower() and "cheque" not in txt.lower():
                data["cheque_no_cash"] = "Cash"

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
        for t in tokens:
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
        cheque_digits = re.sub(r'\D', '', data.get("cheque_no_cash", ""))
        gl_digits = re.sub(r'\D', '', data.get("gl_code", ""))
        voucher_digits = re.sub(r'\D', '', data.get("voucher_no", ""))
        amount_candidates = []
        for t in tokens:
            txt = t["text"].replace(",", "")
            # Skip tokens associated with GL code, Voucher number, or Date
            if any(lbl in txt.lower() for lbl in ["g/l", "gl code", "voucher", "date", "c/o", "cc/io"]):
                continue
            m = re.findall(r'\b(\d{2,6}(?:\.\d{1,2})?)\b', txt)
            for num in m:
                val = float(num)
                val_str = str(int(val))
                if val_str in ["400012", "410020", "2026", "2025", "2024", "1046"]:
                    continue
                if cheque_digits and val_str == cheque_digits:
                    continue
                if gl_digits and val_str == gl_digits:
                    continue
                if voucher_digits and val_str in voucher_digits:
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

        # Do not fabricate random voucher number; leave empty if not detected on the physical paper
        return data


# Shared singleton & alias
voucher_parser = VoucherParser()
voucher_ocr_engine = voucher_parser
