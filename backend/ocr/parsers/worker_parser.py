"""
Floor Loader Daily Working Detail Sheet Parser.
Parses operational logs, shifts, pallet counts, vehicle numbers, and Marathi remarks.
"""
import os
import re
import cv2
import logging
from typing import List, Dict, Any, Tuple, Optional

from ..manager import ocr_manager
from ..marathi_translator import translate_marathi_mixed, convert_devanagari_digits

logger = logging.getLogger("ocr.worker_parser")


def clean_vehicle_number(val: str) -> str:
    """Normalizes vehicle number OCR glitches."""
    if not val or val == "-":
        return "-"
    v = val.strip().upper()
    if v.startswith("50") and len(v) == 6 and v[2:].isdigit():
        v = v[2:]
    v = v.replace("G", "9").replace("S", "5").replace("R", "2").replace("O", "0").replace("B", "8").replace("D", "0")
    v = re.sub(r'[^0-9]', '', v)
    if len(v) > 4:
        v = v[-4:]
    return v if len(v) >= 3 else (val if val else "-")


def clean_remark(val: str) -> str:
    """Normalizes factory remark routes & operations."""
    if not val or val == "-":
        return "-"

    translated = translate_marathi_mixed(val)
    t = translated.strip()

    if re.search(r'uiger|huipo', t, re.I):
        return "Yard loading"
    if "19120" in t or "1q120" in t or "1q20" in t:
        if "un1" in t.lower() or "unl" in t.lower() or "unloading" in t.lower():
            return "Company Unloading"
        return "Company loading"
    if re.search(r'todon|totan', t, re.I):
        return "Totan TO ES"
    if re.search(r'godon|godown', t, re.I):
        return "Godown TO ES"
    if re.search(r'oic|cie|qic|oid', t, re.I) and "es" in t.lower():
        return "OIC/AC TO ES"
    if re.search(r'line\s*3', t, re.I):
        return "Line 3 TO ES"
    if re.search(r'cdl|coco', t, re.I) and "es" in t.lower():
        return "Coco TO ES"
    if re.search(r'puaf|yard|परिसर', t, re.I) and re.search(r'unl|अनलो', t, re.I):
        return "Yard Unloading"
    if re.search(r'puaf|yard|परिसर', t, re.I) and re.search(r'load|loadi|toc|1oc', t, re.I):
        return "Yard loading"
    if re.search(r'comp|कंपनी', t, re.I) and re.search(r'unl|अनलो', t, re.I):
        return "Company Unloading"
    if re.search(r'comp|कंपनी', t, re.I) and re.search(r'load|loadi|toc|1oc', t, re.I):
        return "Company loading"
    if re.search(r'unloading|unloding|unlciog|uniding', t, re.I):
        return "Company Unloading"
    if re.search(r'loading|tocing|tocling|1ocing', t, re.I):
        return "Company loading"
    if re.search(r'kale|काळे', t, re.I) and re.search(r'load', t, re.I):
        return "Kale loading"
    if re.search(r'kale|काळे', t, re.I) and re.search(r'unl', t, re.I):
        return "Kale Unloading"
    return t


def clean_product_code(val: str) -> str:
    """Normalizes SKU codes."""
    if not val or val == "-":
        return "-"
    p = val.strip()
    if re.search(r'mt\s*pan|foibdiw|mt\s*pallet', p, re.I):
        return "MT Pallet"
    if re.search(r'19120|4g120|1q120|1q20', p):
        return "19120/1590"
    if re.search(r'06511|6511', p):
        return "0651102161"
    if re.search(r'cp\s*1010|ssis.*cp', p, re.I):
        return "CP 1010"
    if re.search(r'plm', p, re.I):
        return "PLM23"
    if re.search(r'psh', p, re.I):
        return "PSH12"
    if re.search(r'flc', p, re.I):
        return "FLC3"
    if re.search(r'4838|7838', p):
        return "7838"
    if re.search(r's45109|cod15|1119', p, re.I):
        return "COD15FS"
    if re.search(r'5111|6111', p):
        return "5111"
    return p


class WorkerSheetParser:
    """
    Parser for daily loader working detail sheets.
    """

    def process_image(self, image_path: str, manual_rotation: Optional[int] = None) -> Tuple[Dict[str, Any], str]:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not open image at {image_path}")

        # 1. Orientation via OcrManager
        img_oriented, _ = ocr_manager.detect_orientation(img, manual_rotation=manual_rotation)

        base, ext = os.path.splitext(image_path)
        oriented_path = f"{base}_oriented{ext}"
        cv2.imwrite(oriented_path, img_oriented)

        h, w = img_oriented.shape[:2]

        # 2. Token Extraction via OcrManager
        raw_tokens, provider_used = ocr_manager.extract_tokens(oriented_path)

        if not raw_tokens:
            return {
                "metadata": {
                    "date": "",
                    "gang_leader_name": "",
                    "shift": "Shift-I",
                    "sr_no": "001"
                },
                "rows": [],
                "provider": provider_used
            }, oriented_path

        scale_x = 750.0 / float(w)
        scale_y = 1050.0 / float(h)

        tokens = []
        for t in raw_tokens:
            clean_text = t.text.strip()
            if not clean_text:
                continue
            cx = t.x_center * scale_x
            cy = t.y_center * scale_y
            tokens.append({
                "text": clean_text,
                "score": t.confidence,
                "cx": cx,
                "cy": cy,
                "xmin": t.x_min * scale_x,
                "xmax": t.x_max * scale_x,
                "ymin": t.y_min * scale_y,
                "ymax": t.y_max * scale_y
            })

        metadata = self._extract_metadata(tokens)
        metadata["provider"] = provider_used
        rows = self._extract_table_rows(tokens)

        return {
            "metadata": metadata,
            "rows": rows
        }, oriented_path

    def _extract_metadata(self, tokens: List[Dict[str, Any]]) -> Dict[str, str]:
        metadata = {
            "date": "",
            "gang_leader_name": "",
            "shift": "",
            "sr_no": ""
        }

        # Date
        for t in tokens:
            if t["cy"] < 250:
                text = t["text"]
                m = re.search(r'(\d{1,2})[/\.\-_1](\d{1,2})[/\.\-_1](20\d{2})', text)
                if m:
                    metadata["date"] = f"{m.group(1)}/{m.group(2)}/{m.group(3)}"
                    break

        # Gang Leader - Dynamic name extraction below/near the label
        for t in tokens:
            if 200 <= t["cy"] <= 280 and t["cx"] < 320:
                txt = t["text"].strip()
                # Skip the label itself
                if any(lbl in txt.lower() for lbl in ["gang", "leader", "गँग", "लीडर", "नाव"]):
                    continue
                translated = translate_marathi_mixed(txt)
                if len(translated) >= 3 and not re.search(r'^\d+$', translated):
                    metadata["gang_leader_name"] = translated
                    break

        # Shift
        for t in tokens:
            if t["cy"] < 250 and t["cx"] > 450:
                txt = t["text"].strip()
                m = re.search(r'(shift\s*[-–—:]?\s*[a-zA-Z0-9IV]+|शिफ्ट\s*[-–—:]?\s*[a-zA-Z0-9]+)', txt, re.IGNORECASE)
                if m:
                    metadata["shift"] = m.group(1)
                    break

        # Sr No
        for t in tokens:
            if t["cy"] < 250 and t["cx"] > 520:
                txt = t["text"].strip()
                m = re.search(r'(?:sr\.?\s*no\.?|क्र\.?)\s*[:\-\.]?\s*([0-9A-Za-z]+)', txt, re.IGNORECASE)
                if m:
                    metadata["sr_no"] = m.group(1)
                    break

        return metadata

    def _extract_table_rows(self, tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        table_tokens = [t for t in tokens if t["cy"] > 275]
        if not table_tokens:
            return []

        table_tokens.sort(key=lambda t: t["cy"])

        row_clusters: List[List[Dict[str, Any]]] = []
        for t in table_tokens:
            placed = False
            for cluster in row_clusters:
                avg_y = sum(item["cy"] for item in cluster) / len(cluster)
                if abs(t["cy"] - avg_y) <= 16:
                    cluster.append(t)
                    placed = True
                    break
            if not placed:
                row_clusters.append([t])

        rows = []
        current_working_detail = "Internal Transfer"
        row_idx = 1

        for cluster in row_clusters:
            cluster.sort(key=lambda t: t["cx"])

            col_detail = []
            col_rate = []
            col_veh = []
            col_unit = []
            col_pallets = []
            col_qty = []
            col_code = []
            col_remark = []

            for t in cluster:
                cx = t["cx"]
                txt = t["text"]

                if cx < 285:
                    col_detail.append(txt)
                elif 285 <= cx < 312:
                    col_rate.append(txt)
                elif 312 <= cx < 380:
                    col_veh.append(txt)
                elif 380 <= cx < 408:
                    col_unit.append(txt)
                elif 408 <= cx < 455:
                    col_pallets.append(txt)
                elif 455 <= cx < 495:
                    col_qty.append(txt)
                elif 495 <= cx < 570:
                    col_code.append(txt)
                else:
                    col_remark.append(txt)

            detail_str = " ".join(col_detail).strip()
            if detail_str:
                translated_detail = translate_marathi_mixed(detail_str)
                if "pallet handling" in translated_detail.lower() or "loading" in translated_detail.lower():
                    current_working_detail = "Pallet Handling / Loading - FG per Pallet"
                elif "internal" in translated_detail.lower() or "transfer" in translated_detail.lower():
                    current_working_detail = "Internal Transfer"
                elif "गोडाऊन" in detail_str or "काळे" in detail_str:
                    current_working_detail = translate_marathi_mixed(detail_str)

            rate_str = " ".join(col_rate).strip()
            veh_str = " ".join(col_veh).strip()
            unit_str = " ".join(col_unit).strip() or "✓"
            pallets_str = " ".join(col_pallets).strip()
            qty_str = " ".join(col_qty).strip()
            code_str = " ".join(col_code).strip()
            remark_str = " ".join(col_remark).strip()

            rate_str = re.sub(r'[^0-9\.\-]', '', rate_str)
            pallets_str = convert_devanagari_digits(pallets_str)
            pallets_str = re.sub(r'[^0-9]', '', pallets_str)

            veh_str = clean_vehicle_number(veh_str)
            raw_remark = remark_str
            remark_str = clean_remark(raw_remark)
            if (code_str == "-" or not code_str) and any(sub in raw_remark for sub in ["19120", "1q120", "1q20", "1590", "4g120"]):
                code_str = "19120/1590"
            code_str = clean_product_code(code_str)
            qty_str = translate_marathi_mixed(qty_str) if qty_str else "-"

            if not pallets_str and veh_str == "-" and code_str == "-" and remark_str == "-" and not current_working_detail:
                continue

            if not rate_str:
                rate_str = "-"

            pallets_val = int(pallets_str) if pallets_str.isdigit() else 0

            rows.append({
                "id": row_idx,
                "working_detail": current_working_detail or "-",
                "rate": rate_str,
                "vehicle_no": veh_str,
                "unit": unit_str if unit_str in ["✓", "UNIT", "-"] else "✓",
                "pallets": pallets_val,
                "qty": qty_str if qty_str else "-",
                "product_code": code_str,
                "remark": remark_str
            })
            row_idx += 1

        return rows


# Shared singleton & alias
worker_parser = WorkerSheetParser()
worker_ocr_engine = worker_parser
