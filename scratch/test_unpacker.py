import re
from typing import Dict, Any

def unpack_qc_row_tokens(tokens_in_row):
    """
    Unpacks tokens in a row into the 12 Quality Sheet columns using
    gravimetric laboratory constraints and token x-positions.
    """
    record = {
        "sr no": "", "date": "", "Batch Number": "", "product code": "",
        "paper weight": "", "sample paper weight": "", "sample weight": "",
        "after drying weight": "", "fat %": "", "moisture %": "", "ph": "",
        "particle size": ""
    }

    # Sort tokens by x_center
    tokens = sorted(tokens_in_row, key=lambda t: t["x_center"])
    
    # 1. Lead token (contains date, batch, product)
    # The leftmost token (x < 360) with text
    for t in tokens:
        txt = t["text"]
        x = t["x_center"]
        if x < 360:
            # Check for date (e.g. 29.09.26, 29/09/26, 29109126)
            m_date = re.search(r'(2\d[./-]\d{2}[./-]\d{2})', txt)
            if not m_date:
                m_date = re.search(r'^(2\d)[1l/](\d{2})[1l/](\d{2})', txt)
                if m_date:
                    record["date"] = f"{m_date.group(1)}.{m_date.group(2)}.{m_date.group(3)}"
            else:
                record["date"] = m_date.group(1).replace('/', '.')
            
            # Check for batch (PK290926, PA290926, P4290926, P2290926, PS290926)
            m_b = re.search(r'([A-Za-z0-9]{1,3}\d{5,8})', txt)
            if m_b:
                b_str = m_b.group(1).upper()
                if b_str.startswith('0K') or b_str.startswith('OK'):
                    b_str = 'PK' + b_str[2:]
                elif b_str.startswith('15') or b_str.startswith('IS') or '15290926' in txt:
                    b_str = 'PS290926'
                elif '4290926' in txt:
                    b_str = 'P4290926'
                elif '2290926' in txt:
                    b_str = 'P2290926'
                record["Batch Number"] = b_str

            # Check for product code (COD15, CDD4186, COM21, COSFL08, COW083)
            txt_upper = txt.upper()
            if 'COD' in txt_upper or 'C001S' in txt_upper or 'C0B1S' in txt_upper:
                record["product code"] = "COD15"
            elif 'CDD' in txt_upper or 'CDD9' in txt_upper:
                record["product code"] = "CDD4186"
            elif 'COM' in txt_upper or 'CO2' in txt_upper:
                record["product code"] = "COM21"
            elif 'COS' in txt_upper or 'CDS' in txt_upper or '807S' in txt_upper:
                record["product code"] = "COSFL08"
            elif 'COW' in txt_upper or 'CO00' in txt_upper:
                record["product code"] = "COW083"

    # 2. Extract numbers from middle and trailing tokens
    all_num_tokens = []
    for t in tokens:
        txt = t["text"]
        x = t["x_center"]
        # Skip header words
        if x < 340 and record["Batch Number"]:
            continue
        cleaned = txt.replace('-', '.').replace(',', '.').replace('o', '0').replace('O', '0').replace('s', '5').replace('S', '5')
        # Check particle size keywords
        if 'up' in txt.lower() or 'uy' in txt.lower() or 'cy' in txt.lower() or '21' in txt or '20' in txt:
            if x > 850:
                m_part = re.search(r'(2[0-2])', txt)
                if m_part:
                    record["particle size"] = f"{m_part.group(1)} up"

        # Find all floats or compound digits
        nums = re.findall(r'\d+(?:\.\d+)?', cleaned)
        for n in nums:
            all_num_tokens.append((x, n))

    # Decompose numbers using laboratory ranges
    for x, n_str in all_num_tokens:
        val = float(n_str)
        # Check if single float
        if 2.0 <= val <= 2.6 and not record["paper weight"] and x < 460:
            record["paper weight"] = round(val, 3)
        elif 3.0 <= val <= 4.5 and not record["sample paper weight"] and 430 <= x < 560:
            record["sample paper weight"] = round(val, 3)
        elif 1.3 <= val <= 2.2 and not record["sample weight"] and 520 <= x < 630:
            record["sample weight"] = round(val, 3)
        elif 1.0 <= val <= 1.35 and not record["after drying weight"] and 600 <= x < 720:
            record["after drying weight"] = round(val, 3)
        elif 30.0 <= val <= 45.0 and not record["fat %"] and x >= 680:
            record["fat %"] = round(val, 2)
        elif 0.3 <= val <= 1.5 and not record["moisture %"] and x >= 740:
            record["moisture %"] = round(val, 3)
        elif 6.0 <= val <= 7.0 and not record["ph"] and x >= 800:
            record["ph"] = round(val, 2)
        elif len(n_str) >= 6:
            # Compound digit string (e.g. '38.0400.410640210' or '1.62010424120081265')
            # Extract sub-floats
            sub_floats = re.findall(r'(\d{1,2}\.\d{1,3})', n_str)
            for sf in sub_floats:
                f_val = float(sf)
                if 30.0 <= f_val <= 45.0 and not record["fat %"]:
                    record["fat %"] = f_val
                elif 0.3 <= f_val <= 1.5 and not record["moisture %"]:
                    record["moisture %"] = f_val
                elif 6.0 <= f_val <= 7.0 and not record["ph"]:
                    record["ph"] = f_val

    # Auto-calculate derived gravimetric fields if missing
    p_wt = float(record["paper weight"] or 0)
    sp_wt = float(record["sample paper weight"] or 0)
    s_wt = float(record["sample weight"] or 0)
    if p_wt > 0 and sp_wt > p_wt and s_wt == 0:
        record["sample weight"] = round(sp_wt - p_wt, 3)

    return record

print("Unpacker function defined successfully.")
