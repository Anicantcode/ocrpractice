"""
Unified QA Lab Sheet Parser.
Handles all 3 laboratory sheet templates:
1. Finished Goods Analysis Record (FRM/QC/024)
2. Microbiological Analysis Report (FRM/QC/001)
3. In-Process Lab Quality Sheet (12 standard gravimetric columns)
"""
import os
import re
import cv2
import logging
import numpy as np
from typing import List, Dict, Any, Tuple, Optional, Union

from ..manager import ocr_manager
from ..base import OCRToken

logger = logging.getLogger("ocr.qa_parser")

# ----------------- QA Column Definitions -----------------

FINISHED_GOODS_COLUMNS = [
    "Product Name", "Code", "B.NO", "Moisture W1", "Moisture W2", "Moisture W",
    "Moisture W3", "M%", "Fat W1", "Fat W2", "Fat W", "Fat W3", "F%", "pH",
    "PS", "Colour L*", "Colour a*", "Colour b*", "Count"
]

MICROBIOLOGICAL_COLUMNS = [
    "Sr. No.", "Batch No.", "Code No.", "Product Name", "TPC 10¹", "TPC 10²",
    "TPC 10³", "TPC Total", "Y&M", "Coliform", "E.coli", "Enterobacteriaceae", "Remark"
]

IN_PROCESS_COLUMNS = [
    "sr no", "date", "Batch Number", "product code", "paper weight",
    "sample paper weight", "sample weight", "after drying weight",
    "fat %", "moisture %", "ph", "particle size"
]

QA_SHEET_SCHEMAS = {
    "finished_goods": {
        "id": "finished_goods",
        "title": "Finished Goods Analysis Record (FRM/QC/024)",
        "code": "FRM/QC/024",
        "columns": FINISHED_GOODS_COLUMNS
    },
    "microbiological": {
        "id": "microbiological",
        "title": "Microbiological Analysis Report (FRM/QC/001)",
        "code": "FRM/QC/001",
        "columns": MICROBIOLOGICAL_COLUMNS
    },
    "in_process": {
        "id": "in_process",
        "title": "In-Process Lab Quality Sheet",
        "code": "LAB/QC/002",
        "columns": IN_PROCESS_COLUMNS
    }
}

MICROBIOLOGICAL_RELATIVE_RANGES = [
    ("Sr. No.", 0.000, 0.045),
    ("Batch No.", 0.045, 0.115),
    ("Code No.", 0.115, 0.190),
    ("Product Name", 0.190, 0.380),
    ("TPC 10¹", 0.380, 0.470),
    ("TPC 10²", 0.470, 0.515),
    ("TPC 10³", 0.515, 0.600),
    ("TPC Total", 0.600, 0.670),
    ("Y&M", 0.670, 0.730),
    ("Coliform", 0.730, 0.790),
    ("E.coli", 0.790, 0.850),
    ("Enterobacteriaceae", 0.850, 0.920),
    ("Remark", 0.920, 1.000),
]

FINISHED_GOODS_RELATIVE_RANGES = [
    ("Product Name", 0.000, 0.150),
    ("Code", 0.150, 0.225),
    ("B.NO", 0.225, 0.300),
    ("Moisture W1", 0.300, 0.345),
    ("Moisture W2", 0.345, 0.390),
    ("Moisture W", 0.390, 0.430),
    ("Moisture W3", 0.430, 0.470),
    ("M%", 0.470, 0.510),
    ("Fat W1", 0.510, 0.555),
    ("Fat W2", 0.555, 0.600),
    ("Fat W", 0.600, 0.645),
    ("Fat W3", 0.645, 0.690),
    ("F%", 0.690, 0.730),
    ("pH", 0.730, 0.770),
    ("PS", 0.770, 0.810),
    ("Colour L*", 0.810, 0.850),
    ("Colour a*", 0.850, 0.890),
    ("Colour b*", 0.890, 0.935),
    ("Count", 0.935, 1.000)
]


# ----------------- Cleaning & Validation Utilities -----------------

def parse_float_safe(text: Any, default: float = 0.0) -> float:
    if text is None:
        return default
    cleaned = str(text).replace('-', '.').replace(',', '.').replace('o', '0').replace('O', '0').replace('s', '5').replace('S', '5')
    nums = re.findall(r'\d+(?:\.\d+)?', cleaned)
    if nums:
        try:
            return round(float(nums[0]), 3)
        except ValueError:
            return default
    return default


def fix_qc_measurement(val: float, col: str) -> float:
    """Restores missing decimal points when pen marks are faint."""
    if val <= 0:
        return 0.0
    v = float(val)
    if col in ["paper weight", "sample paper weight", "sample weight", "after drying weight"]:
        if v > 100:
            return round(v / 1000.0, 3)
        elif v > 20:
            return round(v / 10.0, 3)
    elif col == "ph":
        if v > 14.0:
            return round(v / 10.0, 2)
    elif col in ["fat %", "moisture %"]:
        if v > 100:
            return round(v / 10.0, 2)
    return round(v, 3)


def is_pure_header(text: str) -> bool:
    clean = re.sub(r'[^a-zA-Z]', '', text.lower())
    headers = [
        "sr", "srno", "date", "batch", "batchno", "batchnumber",
        "product", "productcode", "code", "paper", "paperweight",
        "sample", "samplepaperweight", "sampleweight", "afterdryingweight",
        "fat", "moisture", "ph", "particlesize", "size"
    ]
    return clean in headers


# ----------------- In-Process Parser -----------------

def parse_in_process_tokens(tokens: List[Union[OCRToken, Dict[str, Any]]], slope: Optional[float] = None) -> List[Dict[str, Any]]:
    """
    Parses OCR tokens into structured rows matching the 12 In-Process quality columns.
    Handles both clean digital rows and photographed handwritten lab sheets.
    """
    if not tokens:
        return []

    # Normalize tokens to unified dicts
    norm_tokens = []
    for item in tokens:
        if isinstance(item, OCRToken):
            norm_tokens.append(item.to_dict())
        elif isinstance(item, dict):
            bbox = item.get("bbox", [])
            if len(bbox) == 4 and "y_center" not in item:
                xs = [pt[0] for pt in bbox]
                ys = [pt[1] for pt in bbox]
                norm_tokens.append({
                    "text": str(item.get("text", "")).strip(),
                    "confidence": float(item.get("confidence", 0.95)),
                    "bbox": bbox,
                    "x_min": min(xs), "x_max": max(xs),
                    "y_min": min(ys), "y_max": max(ys),
                    "x_center": sum(xs) / 4.0, "y_center": sum(ys) / 4.0
                })
            else:
                norm_tokens.append(item)

    # 1. Check for digital mock grid rows (clustered discrete tokens)
    tokens_by_y = sorted(norm_tokens, key=lambda t: t.get("y_center", 0))
    cand_rows: List[List[Dict[str, Any]]] = []
    c_row: List[Dict[str, Any]] = []
    c_y = None

    for t in tokens_by_y:
        yc = t.get("y_center", 0)
        if c_y is None:
            c_row.append(t)
            c_y = yc
        elif abs(yc - c_y) <= 18.0:
            c_row.append(t)
            c_y = sum(x.get("y_center", 0) for x in c_row) / len(c_row)
        else:
            c_row.sort(key=lambda x: x.get("x_center", 0))
            cand_rows.append(c_row)
            c_row = [t]
            c_y = yc
    if c_row:
        c_row.sort(key=lambda x: x.get("x_center", 0))
        cand_rows.append(c_row)

    # Digital row test: >= 10 tokens where first is serial number and second is date
    digital_rows = []
    for r in cand_rows:
        if len(r) >= 10:
            f_txt = r[0]["text"].strip()
            s_txt = r[1]["text"].strip()
            if (f_txt.isdigit() or f_txt in ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]) and (
                re.search(r'\d{1,2}[./-]\d{1,2}', s_txt) or re.search(r'202\d', s_txt)
            ):
                digital_rows.append(r)

    if digital_rows:
        parsed_digital = []
        for r_tokens in digital_rows:
            rec: Dict[str, Any] = {col: "" for col in IN_PROCESS_COLUMNS}
            conf_map: Dict[str, float] = {}
            crops: Dict[str, Any] = {}

            for idx, t in enumerate(r_tokens):
                txt = t.get("text", "")
                c = round(float(t.get("confidence", 0.95)), 3)
                col_target = IN_PROCESS_COLUMNS[min(idx, len(IN_PROCESS_COLUMNS) - 1)]
                crops[col_target] = {
                    "y_min": t.get("y_min", 0), "x_min": t.get("x_min", 0),
                    "y_max": t.get("y_max", 0), "x_max": t.get("x_max", 0),
                    "bbox": t.get("bbox", [])
                }

                if idx == 0:
                    rec["sr no"] = int(txt) if txt.isdigit() else 1
                    conf_map["sr no"] = c
                elif idx == 1:
                    rec["date"] = txt
                    conf_map["date"] = c
                elif idx == 2:
                    rec["Batch Number"] = txt.upper()
                    conf_map["Batch Number"] = c
                elif idx == 3:
                    rec["product code"] = txt.upper()
                    conf_map["product code"] = c
                elif idx in [4, 5, 6, 7]:
                    col = IN_PROCESS_COLUMNS[idx]
                    rec[col] = fix_qc_measurement(parse_float_safe(txt), col)
                    conf_map[col] = c
                elif idx == 8:
                    rec["fat %"] = fix_qc_measurement(parse_float_safe(txt), "fat %")
                    conf_map["fat %"] = c
                elif idx == 9:
                    rec["moisture %"] = fix_qc_measurement(parse_float_safe(txt), "moisture %")
                    conf_map["moisture %"] = c
                elif idx == 10:
                    rec["ph"] = fix_qc_measurement(parse_float_safe(txt), "ph")
                    conf_map["ph"] = c
                elif idx >= 11:
                    rec["particle size"] = txt
                    conf_map["particle size"] = c

            rec["_confidence"] = conf_map
            rec["_crop_boxes"] = crops
            parsed_digital.append(rec)

        if parsed_digital:
            return parsed_digital

    # 2. Photographed Handwritten Lab Sheet Pipeline (Slant-calibrated)
    effective_slope = slope if isinstance(slope, (int, float)) and (0.05 <= slope <= 0.15) else 0.100

    for t in norm_tokens:
        t["y_proj"] = t.get("y_center", 0) - effective_slope * (t.get("x_center", 0) - 200.0)

    # Discard table headers (y_proj < 215 or pure header text)
    data_tokens = [t for t in norm_tokens if t.get("y_proj", 0) >= 215 and not is_pure_header(t.get("text", ""))]
    if not data_tokens:
        data_tokens = norm_tokens

    # Dynamic row clustering based on Y projection
    data_tokens.sort(key=lambda t: t.get("y_proj", 0))
    row_clusters: List[List[Dict[str, Any]]] = []
    for t in data_tokens:
        placed = False
        yp = t.get("y_proj", 0)
        for cluster in row_clusters:
            avg_y = sum(x.get("y_proj", 0) for x in cluster) / len(cluster)
            if abs(yp - avg_y) <= 24.0:
                cluster.append(t)
                placed = True
                break
        if not placed:
            row_clusters.append([t])

    parsed_rows = []
    for idx, cluster in enumerate(row_clusters):
        cluster.sort(key=lambda t: t.get("x_center", 0))

        # Pure dynamic record: all columns default to empty string, confidence 0.0
        rec = {col: "" for col in IN_PROCESS_COLUMNS}
        conf_map = {col: 0.0 for col in IN_PROCESS_COLUMNS}
        crops: Dict[str, Any] = {}

        has_data = False
        for t in cluster:
            xc = t.get("x_center", 0)
            txt = t.get("text", "").strip()
            c = round(float(t.get("confidence", 0.0)), 3)
            box = {
                "y_min": t.get("y_min", 0), "x_min": t.get("x_min", 0),
                "y_max": t.get("y_max", 0), "x_max": t.get("x_max", 0),
                "bbox": t.get("bbox", [])
            }

            if xc < 80 and (txt.isdigit() or txt in ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]):
                rec["sr no"] = int(txt) if txt.isdigit() else (idx + 1)
                conf_map["sr no"] = c
                crops["sr no"] = box
                has_data = True
            elif 80 <= xc < 200 and re.search(r'\d', txt):
                rec["date"] = txt
                conf_map["date"] = c
                crops["date"] = box
                has_data = True
            elif 200 <= xc < 330:
                rec["Batch Number"] = txt.upper()
                conf_map["Batch Number"] = c
                crops["Batch Number"] = box
                has_data = True
            elif 330 <= xc < 450:
                rec["product code"] = txt.upper()
                conf_map["product code"] = c
                crops["product code"] = box
                has_data = True
            elif 450 <= xc < 550:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["paper weight"] = fix_qc_measurement(val, "paper weight")
                    conf_map["paper weight"] = c
                    crops["paper weight"] = box
                    has_data = True
            elif 550 <= xc < 670:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["sample paper weight"] = fix_qc_measurement(val, "sample paper weight")
                    conf_map["sample paper weight"] = c
                    crops["sample paper weight"] = box
                    has_data = True
            elif 670 <= xc < 770:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["sample weight"] = fix_qc_measurement(val, "sample weight")
                    conf_map["sample weight"] = c
                    crops["sample weight"] = box
                    has_data = True
            elif 770 <= xc < 880:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["after drying weight"] = fix_qc_measurement(val, "after drying weight")
                    conf_map["after drying weight"] = c
                    crops["after drying weight"] = box
                    has_data = True
            elif 880 <= xc < 980:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["fat %"] = fix_qc_measurement(val, "fat %")
                    conf_map["fat %"] = c
                    crops["fat %"] = box
                    has_data = True
            elif 980 <= xc < 1090:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["moisture %"] = fix_qc_measurement(val, "moisture %")
                    conf_map["moisture %"] = c
                    crops["moisture %"] = box
                    has_data = True
            elif 1090 <= xc < 1180:
                val = parse_float_safe(txt)
                if val > 0:
                    rec["ph"] = fix_qc_measurement(val, "ph")
                    conf_map["ph"] = c
                    crops["ph"] = box
                    has_data = True
            elif xc >= 1180:
                rec["particle size"] = txt
                conf_map["particle size"] = c
                crops["particle size"] = box
                has_data = True

        if has_data:
            if not rec["sr no"]:
                rec["sr no"] = idx + 1
            rec["_confidence"] = conf_map
            rec["_crop_boxes"] = crops
            parsed_rows.append(rec)

    return parsed_rows


# ----------------- QA Parser Class -----------------

class QaParser:
    """
    Unified QA Sheet Processor for Finished Goods, Microbiological, and In-Process.
    """

    def detect_sheet_type(self, all_text: str, user_selected: Optional[str] = None) -> str:
        text_lower = all_text.lower()
        if "microbiological" in text_lower or "frm/qc/001" in text_lower or "thermophiles" in text_lower:
            return "microbiological"
        if "finished goods" in text_lower or "finishedgoods" in text_lower or "frm/qc/024" in text_lower or "colour value" in text_lower:
            return "finished_goods"
        if user_selected in QA_SHEET_SCHEMAS:
            return user_selected
        return "in_process"

    def process_image(
        self,
        image_path: str,
        manual_rotation: Optional[int] = None,
        requested_sheet_type: Optional[str] = None
    ) -> Tuple[str, List[str], List[Dict[str, Any]], str, Dict[str, Any]]:
        """
        Coordinates orientation detection, token extraction, and sheet-specific parsing.
        Returns: (sheet_type, columns, rows, oriented_image_path, metadata)
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image at {image_path}")

        # 1. Orientation via OcrManager
        img_oriented, _ = ocr_manager.detect_orientation(img, manual_rotation=manual_rotation)

        base, ext = os.path.splitext(image_path)
        oriented_path = f"{base}_oriented{ext}"
        cv2.imwrite(oriented_path, img_oriented)

        # 2. Token Extraction via OcrManager (Primary API -> PaddleOCR fallback)
        tokens, provider_used = ocr_manager.extract_tokens(oriented_path)

        if not tokens:
            sheet_type = requested_sheet_type or "in_process"
            cols = QA_SHEET_SCHEMAS[sheet_type]["columns"]
            return sheet_type, cols, [], oriented_path, {"provider": provider_used}

        all_text = " ".join([t.text for t in tokens])
        sheet_type = self.detect_sheet_type(all_text, user_selected=requested_sheet_type)
        cols = QA_SHEET_SCHEMAS[sheet_type]["columns"]

        metadata: Dict[str, Any] = {"provider": provider_used}
        rows: List[Dict[str, Any]] = []

        if sheet_type == "microbiological":
            meta, rows = self._parse_microbiological(tokens, img_oriented.shape)
            metadata.update(meta)
        elif sheet_type == "finished_goods":
            meta, rows = self._parse_finished_goods(tokens, img_oriented.shape)
            metadata.update(meta)
        else:
            rows = parse_in_process_tokens(tokens)
            metadata.update({"title": "In-Process Lab Quality Sheet"})

        return sheet_type, cols, rows, oriented_path, metadata

    def _parse_microbiological(self, tokens: List[OCRToken], img_shape: Tuple[int, ...]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        img_h = img_shape[0]
        metadata = {
            "title": "MICROBIOLOGICAL ANALYSIS REPORT",
            "doc_no": "FRM/QC/001",
            "date": ""
        }

        # Header detection
        header_tokens = []
        for t in tokens:
            if t.y_center < 0.35 * img_h:
                if any(k in t.text.lower() for k in ['product name', 'batch', 'code', 'tpc', 'coliform', 'e.coli']):
                    header_tokens.append(t)
                if "date" in t.text.lower():
                    m = re.search(r'\d{2}[/\.\-_]\d{2}[/\.\-_]20\d{2}', t.text)
                    if m:
                        metadata["date"] = m.group(0)

        table_top = max(t.y_max for t in header_tokens) + 5 if header_tokens else 0.20 * img_h
        table_bottom = 0.95 * img_h

        data_tokens = [t for t in tokens if table_top <= t.y_center <= table_bottom]
        if not data_tokens:
            return metadata, []

        table_left = min(t.x_min for t in data_tokens)
        table_right = max(t.x_max for t in data_tokens)
        t_width = max(1.0, table_right - table_left)
        t_height = max(1.0, max(t.y_center for t in data_tokens) - min(t.y_center for t in data_tokens))
        row_thresh = (t_height / 15.0) * 0.48

        data_tokens.sort(key=lambda t: t.y_center)
        row_clusters: List[List[OCRToken]] = []
        for t in data_tokens:
            placed = False
            for cluster in row_clusters:
                avg_y = sum(x.y_center for x in cluster) / len(cluster)
                if abs(t.y_center - avg_y) <= row_thresh:
                    cluster.append(t)
                    placed = True
                    break
            if not placed:
                row_clusters.append([t])

        cols = MICROBIOLOGICAL_COLUMNS
        rows = []
        for cluster in row_clusters:
            cluster.sort(key=lambda t: t.x_center)
            line_str = ' '.join(c.text for c in cluster).lower()
            if 'product name' in line_str or 'cfu' in line_str or 'batch no' in line_str:
                continue

            row_dict = {col_name: '' for col_name in cols}
            for item in cluster:
                rel_x = (item.x_center - table_left) / t_width
                for col_name, s, e in MICROBIOLOGICAL_RELATIVE_RANGES:
                    if s <= rel_x < e:
                        clean_val = item.text.replace('\u4e00', '-').replace('、', '').strip()
                        if col_name == 'Sr. No.':
                            clean_val = {'工': '2', '二': '11', 'B': '8'}.get(clean_val, clean_val)
                        if row_dict[col_name]:
                            row_dict[col_name] += ' ' + clean_val
                        else:
                            row_dict[col_name] = clean_val
                        break

            # Filter non-data rows
            if not (row_dict["Sr. No."] or row_dict["Batch No."] or row_dict["Code No."] or row_dict["Product Name"]):
                continue
            rows.append(row_dict)

        # Merge complementary adjacent rows
        merged_rows = []
        for r in rows:
            can_merge = (
                merged_rows and
                (
                    (merged_rows[-1]["Product Name"] and not r["Product Name"] and (r["Batch No."] or r["Code No."])) or
                    (not merged_rows[-1]["Product Name"] and r["Product Name"] and (merged_rows[-1]["Batch No."] or merged_rows[-1]["Code No."]))
                ) and
                not (merged_rows[-1]["Sr. No."] and r["Sr. No."] and merged_rows[-1]["Sr. No."] != r["Sr. No."])
            )
            if can_merge:
                for c in cols:
                    if r[c] and not merged_rows[-1][c]:
                        merged_rows[-1][c] = r[c]
                    elif r[c] and merged_rows[-1][c] and r[c] not in merged_rows[-1][c]:
                        merged_rows[-1][c] += " " + r[c]
            else:
                merged_rows.append(r)

        return metadata, merged_rows

    def _parse_finished_goods(self, tokens: List[OCRToken], img_shape: Tuple[int, ...]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        img_h = img_shape[0]
        metadata = {
            "title": "FINISHED GOODS ANALYSIS RECORD",
            "doc_no": "FRM/QC/024",
            "revision": "02",
            "date_analysis": ""
        }

        header_tokens = []
        for t in tokens:
            if t.y_center < 0.35 * img_h:
                if any(k in t.text.lower() for k in ['product name', 'effective', 'revision', 'analysis', 'moisture', 'fat', 'b.no', 'code']):
                    header_tokens.append(t)
                if "analysis" in t.text.lower():
                    m = re.search(r'\d{2}[/\.\-_]\d{2}[/\.\-_]20\d{2}', t.text)
                    if m:
                        metadata["date_analysis"] = m.group(0)

        table_top = max(t.y_max for t in header_tokens) + 5 if header_tokens else 0.20 * img_h
        table_bottom = 0.95 * img_h

        data_tokens = [t for t in tokens if table_top <= t.y_center <= table_bottom]
        if not data_tokens:
            return metadata, []

        table_left = min(t.x_min for t in data_tokens)
        table_right = max(t.x_max for t in data_tokens)
        t_width = max(1.0, table_right - table_left)
        t_height = max(1.0, max(t.y_center for t in data_tokens) - min(t.y_center for t in data_tokens))
        row_thresh = max(12.0, (t_height / 10.0) * 0.45)

        data_tokens.sort(key=lambda t: t.y_center)
        row_clusters: List[List[OCRToken]] = []
        for t in data_tokens:
            placed = False
            for cluster in row_clusters:
                avg_y = sum(x.y_center for x in cluster) / len(cluster)
                if abs(t.y_center - avg_y) <= row_thresh:
                    cluster.append(t)
                    placed = True
                    break
            if not placed:
                row_clusters.append([t])

        cols = FINISHED_GOODS_COLUMNS
        rows = []
        for cluster in row_clusters:
            cluster.sort(key=lambda t: t.x_center)
            line_str = " | ".join(t.text for t in cluster).lower()
            if any(k in line_str for k in ["product name", "moisture analysis", "fat analysis", "analysed", "reviewed", "prepared", "approved"]):
                continue

            row_data = {c: "" for c in cols}
            for t in cluster:
                rel_x = (t.x_center - table_left) / t_width
                for col_name, s, e in FINISHED_GOODS_RELATIVE_RANGES:
                    if s <= rel_x < e:
                        clean = t.text.replace('\u4e00', '-').strip()
                        if row_data[col_name]:
                            row_data[col_name] += " " + clean
                        else:
                            row_data[col_name] = clean
                        break

            if row_data["B.NO"] or row_data["Product Name"]:
                rows.append(row_data)

        # Merge split multi-line product names
        merged_rows = []
        for r in rows:
            if not r["B.NO"] and not r["Code"] and r["Product Name"] and merged_rows:
                merged_rows[-1]["Product Name"] = (merged_rows[-1]["Product Name"] + " " + r["Product Name"]).strip()
            else:
                merged_rows.append(r)

        return metadata, merged_rows


# Global singleton & compatibility alias
qa_parser = QaParser()
parse_sheet_rows = parse_in_process_tokens
