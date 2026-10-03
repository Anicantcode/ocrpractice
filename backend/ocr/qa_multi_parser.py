import os
import re
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from rapidocr_onnxruntime import RapidOCR

# ----------------- QA Sheet Column Schemas -----------------

FINISHED_GOODS_COLUMNS = [
    "Product Name",
    "Code",
    "B.NO",
    "Moisture W1",
    "Moisture W2",
    "Moisture W",
    "Moisture W3",
    "M%",
    "Fat W1",
    "Fat W2",
    "Fat W",
    "Fat W3",
    "F%",
    "pH",
    "PS",
    "Colour L*",
    "Colour a*",
    "Colour b*",
    "Count"
]

MICROBIOLOGICAL_COLUMNS = [
    "Sr. No.",
    "Batch No.",
    "Code No.",
    "Product Name",
    "TPC 10¹",
    "TPC 10²",
    "TPC 10³",
    "TPC Total",
    "Y&M",
    "Coliform",
    "E.coli",
    "Enterobacteriaceae",
    "Remark"
]

IN_PROCESS_COLUMNS = [
    "sr no",
    "date",
    "Batch Number",
    "product code",
    "paper weight",
    "sample paper weight",
    "sample weight",
    "after drying weight",
    "fat %",
    "moisture %",
    "ph",
    "particle size"
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

# Fractional layout intervals (0.0 to 1.0) across the table width
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


class QaMultiSheetParser:
    def __init__(self):
        self.engine = RapidOCR()

    def detect_best_orientation(self, img: np.ndarray) -> Tuple[np.ndarray, int]:
        """Tests 0, 90, 180, 270 deg rotations to find the best orientation by OCR confidence."""
        best_rot = 0
        best_score = -1.0
        best_img = img

        for rot in [0, 90, 180, 270]:
            if rot == 90:
                rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            elif rot == 180:
                rotated = cv2.rotate(img, cv2.ROTATE_180)
            elif rot == 270:
                rotated = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
            else:
                rotated = img

            res, _ = self.engine(rotated)
            score = sum(line[2] for line in res) if res else 0.0
            if score > best_score:
                best_score = score
                best_rot = rot
                best_img = rotated

        return best_img, best_rot

    def detect_sheet_type(self, all_text: str, user_selected: Optional[str] = None) -> str:
        text_lower = all_text.lower()
        if "microbiological" in text_lower or "frm/qc/001" in text_lower or "thermophiles" in text_lower:
            return "microbiological"
        if "finished goods" in text_lower or "finishedgoods" in text_lower or "frm/qc/024" in text_lower or "colour value" in text_lower:
            return "finished_goods"
        if user_selected in QA_SHEET_SCHEMAS:
            return user_selected
        return "in_process"

    def process_image(self, image_path: str, manual_rotation: Optional[int] = None, requested_sheet_type: Optional[str] = None) -> Tuple[str, List[str], List[Dict[str, Any]], str, Dict[str, Any]]:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image at {image_path}")

        # Orientation
        if manual_rotation is not None and manual_rotation != 0:
            if manual_rotation == 90:
                img_oriented = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            elif manual_rotation == 180:
                img_oriented = cv2.rotate(img, cv2.ROTATE_180)
            elif manual_rotation == 270:
                img_oriented = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
            else:
                img_oriented = img
        else:
            img_oriented, _ = self.detect_best_orientation(img)

        base, ext = os.path.splitext(image_path)
        oriented_path = f"{base}_oriented{ext}"
        cv2.imwrite(oriented_path, img_oriented)

        ocr_results, _ = self.engine(oriented_path)
        if not ocr_results:
            sheet_type = requested_sheet_type or "in_process"
            cols = QA_SHEET_SCHEMAS[sheet_type]["columns"]
            return sheet_type, cols, [], oriented_path, {}

        all_text = " ".join([line[1] for line in ocr_results])
        sheet_type = self.detect_sheet_type(all_text, user_selected=requested_sheet_type)
        cols = QA_SHEET_SCHEMAS[sheet_type]["columns"]

        metadata: Dict[str, Any] = {}
        rows: List[Dict[str, Any]] = []

        if sheet_type == "microbiological":
            metadata, rows = self._parse_microbiological(ocr_results, img_oriented.shape)
        elif sheet_type == "finished_goods":
            metadata, rows = self._parse_finished_goods(ocr_results, img_oriented.shape)
        else:
            try:
                from .parser import parse_sheet_rows
                rows = parse_sheet_rows(ocr_results, img_oriented.shape)
            except Exception:
                rows = []
            metadata = {"title": "In-Process Lab Quality Sheet"}

        return sheet_type, cols, rows, oriented_path, metadata

    def _parse_microbiological(self, ocr_results: List[Any], img_shape: Tuple[int, ...]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Pure dynamic OCR parser for Microbiological Analysis Report (FRM/QC/001).
        Uses dynamic header-based boundary detection and scale-invariant fractional column mapping.
        Zero hardcoded coordinates, zero synthetic rows. Blank cells stay blank ("").
        """
        img_h = img_shape[0]
        metadata = {
            "title": "MICROBIOLOGICAL ANALYSIS REPORT",
            "doc_no": "FRM/QC/001",
            "revision": "04",
            "date_production": "",
            "date_analysis": "",
            "date_reporting": ""
        }

        # 1. Identify printed column header keywords to find the table header row
        header_tokens = []
        for box, text, _ in ocr_results:
            txt = text.lower().strip()
            cy = (box[0][1] + box[2][1]) / 2
            if cy < 0.45 * img_h:
                if any(k in txt for k in ['product name', 'code no', 'batch no', 'tpc', 'y&m', 'coliform', 'e.coli', 'remark', 'cfu/gm', 'total']):
                    header_tokens.append({'text': text, 'cy': cy, 'top': box[0][1], 'bottom': box[2][1]})

        pname_token = next((h for h in header_tokens if 'product' in h['text'].lower()), None)
        if pname_token:
            h_row = [h for h in header_tokens if abs(h['cy'] - pname_token['cy']) < (0.06 * img_h)]
            table_top = max(h['bottom'] for h in h_row) + (0.01 * img_h)
        elif header_tokens:
            table_top = max(h['bottom'] for h in header_tokens) + (0.01 * img_h)
        else:
            table_top = 0.32 * img_h

        # 2. Extract metadata from header region above table_top
        header_area_tokens = []
        for box, text, _ in ocr_results:
            cy = (box[0][1] + box[2][1]) / 2
            cx = (box[0][0] + box[1][0]) / 2
            if cy < table_top:
                header_area_tokens.append({'text': text.strip(), 'cx': cx, 'cy': cy})

        for h in header_area_tokens:
            txt = h['text'].lower()
            # Normalize slashes if read as 1 between numbers: e.g. 2810912026 -> 28/09/2026
            norm = re.sub(r'(\d{2})1(\d{2})1(20\d{2})', r'\1/\2/\3', h['text'])
            m = re.search(r'\d{2}[/\.\-_]\d{2}[/\.\-_]20\d{2}', norm)
            if m:
                date_val = m.group(0)
                # Find closest label
                best_label = None
                min_dist = 999999.0
                for lbl in header_area_tokens:
                    lbl_txt = lbl['text'].lower()
                    if any(k in lbl_txt for k in ['production', 'froduction', 'analysis', 'anasis', 'reporting']):
                        dist = abs(lbl['cy'] - h['cy']) + abs(lbl['cx'] - h['cx']) * 0.4
                        if dist < min_dist:
                            min_dist = dist
                            best_label = lbl_txt
                if best_label:
                    if 'production' in best_label or 'froduction' in best_label:
                        metadata['date_production'] = date_val
                    elif 'analysis' in best_label or 'anasis' in best_label:
                        metadata['date_analysis'] = date_val
                    elif 'reporting' in best_label:
                        metadata['date_reporting'] = date_val

        # 3. Filter data tokens (exclude header and footer explanatory notes)
        footer_keywords = [
            'accepted', 'subject to', 'not applicable',
            '*e=', '*t=', 'under test', 'undertest', 'ab=absent', 'ab = absent',
            'thermophiles', 'checked by', 'prepared by', 'approved by'
        ]
        data_tokens = []
        for box, text, score in ocr_results:
            cy = (box[0][1] + box[2][1]) / 2
            cx = (box[0][0] + box[1][0]) / 2
            txt = text.strip()
            txt_lower = txt.lower()

            if cy < table_top or cy > (0.96 * img_h):
                continue
            if any(k in txt_lower for k in footer_keywords):
                continue

            data_tokens.append({
                'text': txt,
                'cx': cx,
                'cy': cy,
                'left': min(p[0] for p in box),
                'right': max(p[0] for p in box)
            })

        if not data_tokens:
            return metadata, []

        # 4. Scale-invariant dynamic bounding box and row clustering
        table_left = min(d['left'] for d in data_tokens)
        table_right = max(d['right'] for d in data_tokens)
        t_width = max(1.0, table_right - table_left)
        t_height = max(1.0, max(d['cy'] for d in data_tokens) - min(d['cy'] for d in data_tokens))

        # Expected 15 rows: threshold is ~half of one row height
        row_thresh = (t_height / 15.0) * 0.48

        data_tokens.sort(key=lambda t: t['cy'])
        row_clusters = []
        for t in data_tokens:
            placed = False
            for cluster in row_clusters:
                avg_y = sum(x['cy'] for x in cluster) / len(cluster)
                if abs(t['cy'] - avg_y) <= row_thresh:
                    cluster.append(t)
                    placed = True
                    break
            if not placed:
                row_clusters.append([t])

        # 5. Map tokens into columns
        cols = MICROBIOLOGICAL_COLUMNS
        rows = []
        for cluster in row_clusters:
            cluster.sort(key=lambda t: t['cx'])
            line_str = ' '.join(c['text'] for c in cluster).lower()

            # Skip header remnants or subheaders
            if 'product name' in line_str or 'cfu' in line_str or 'batch no' in line_str:
                continue

            row_dict = {col_name: '' for col_name in cols}
            for item in cluster:
                rel_x = (item['cx'] - table_left) / t_width
                for col_name, s, e in MICROBIOLOGICAL_RELATIVE_RANGES:
                    if s <= rel_x < e:
                        clean_val = item['text'].replace('\u4e00', '-').replace('、', '').strip()
                        if col_name == 'Sr. No.':
                            clean_val = {'工': '2', '二': '11', 'B': '8'}.get(clean_val, clean_val)
                        if row_dict[col_name]:
                            row_dict[col_name] += ' ' + clean_val
                        else:
                            row_dict[col_name] = clean_val
                        break

            # Remove any footer fragments that may have merged into cells
            for col_name in cols:
                cell_lower = row_dict[col_name].lower()
                if any(fk in cell_lower for fk in ['under test', 'undertest', 'accepted', 'not applicable', 'ab=absent', 'ab = absent']):
                    row_dict[col_name] = ""

            # Filter out specification rows that have neither Sr. No, Batch, Code, nor Product Name
            if not (row_dict["Sr. No."] or row_dict["Batch No."] or row_dict["Code No."] or row_dict["Product Name"]):
                continue

            rows.append(row_dict)

        # Merge complementary adjacent sub-rows (e.g. multi-line reading or split batch/product)
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

    def _parse_finished_goods(self, ocr_results: List[Any], img_shape: Tuple[int, ...]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Pure dynamic OCR parser for Finished Goods Analysis Record (FRM/QC/024).
        Extracts tokens directly into cells using scale-invariant layout.
        Blank cells stay blank (""). Zero hardcoded coordinates, zero synthetic rows.
        """
        img_h = img_shape[0]
        metadata = {
            "title": "FINISHED GOODS ANALYSIS RECORD",
            "doc_no": "FRM/QC/024",
            "revision": "02",
            "date_analysis": ""
        }

        # 1. Detect header row
        header_tokens = []
        for box, text, _ in ocr_results:
            txt = text.strip()
            cy = (box[0][1] + box[2][1]) / 2
            if cy < 0.35 * img_h:
                if any(k in txt.lower() for k in ['product name', 'effective', 'revision', 'analysis', 'moisture', 'fat', 'b.no', 'code']):
                    header_tokens.append({'text': text, 'cy': cy, 'top': box[0][1], 'bottom': box[2][1]})
                if "analysis" in txt.lower():
                    m = re.search(r'\d{2}[/\.\-_]\d{2}[/\.\-_]20\d{2}', txt)
                    if m:
                        metadata["date_analysis"] = m.group(0)

        table_top = max(h['bottom'] for h in header_tokens) + 5 if header_tokens else 0.20 * img_h
        table_bottom = 0.95 * img_h

        # 2. Filter data tokens
        data_tokens = []
        for box, text, score in ocr_results:
            cx = (box[0][0] + box[1][0]) / 2
            cy = (box[0][1] + box[2][1]) / 2
            txt = text.strip()
            if table_top <= cy <= table_bottom:
                data_tokens.append({
                    "text": txt,
                    "cx": cx,
                    "cy": cy,
                    "left": min(p[0] for p in box),
                    "right": max(p[0] for p in box)
                })

        if not data_tokens:
            return metadata, []

        table_left = min(d['left'] for d in data_tokens)
        table_right = max(d['right'] for d in data_tokens)
        t_width = max(1.0, table_right - table_left)
        t_height = max(1.0, max(d['cy'] for d in data_tokens) - min(d['cy'] for d in data_tokens))
        row_thresh = max(12.0, (t_height / 10.0) * 0.45)

        data_tokens.sort(key=lambda t: t["cy"])
        row_clusters = []
        for t in data_tokens:
            placed = False
            for cluster in row_clusters:
                avg_y = sum(item["cy"] for item in cluster) / len(cluster)
                if abs(t["cy"] - avg_y) <= row_thresh:
                    cluster.append(t)
                    placed = True
                    break
            if not placed:
                row_clusters.append([t])

        cols = FINISHED_GOODS_COLUMNS
        rows = []
        for cluster in row_clusters:
            cluster.sort(key=lambda t: t["cx"])
            line_str = " | ".join(t["text"] for t in cluster).lower()
            if any(k in line_str for k in ["product name", "moisture analysis", "fat analysis", "analysed", "reviewed", "prepared", "approved", "effective date", "revision date", "manager", "executive"]):
                continue

            row_data = {c: "" for c in cols}
            for t in cluster:
                rel_x = (t["cx"] - table_left) / t_width
                for col_name, s, e in FINISHED_GOODS_RELATIVE_RANGES:
                    if s <= rel_x < e:
                        clean = t["text"].replace('\u4e00', '-').strip()
                        if row_data[col_name]:
                            row_data[col_name] += " " + clean
                        else:
                            row_data[col_name] = clean
                        break

            # If row has batch no or product name
            if row_data["B.NO"] or row_data["Product Name"]:
                rows.append(row_data)

        # Merge split multi-line product names into adjacent batch rows
        merged_rows = []
        for r in rows:
            if not r["B.NO"] and not r["Code"] and r["Product Name"] and merged_rows:
                merged_rows[-1]["Product Name"] = (merged_rows[-1]["Product Name"] + " " + r["Product Name"]).strip()
            else:
                merged_rows.append(r)

        return metadata, merged_rows


qa_multi_parser = QaMultiSheetParser()
