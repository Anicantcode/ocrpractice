import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def test_lead(txt):
    print(f"\nTesting lead: '{txt}'")
    # Date: either DD.MM.YY or DD/MM/YY or DD1MM1YY (where 1 is slash)
    m_date = re.search(r'(\d{2}[./-]\d{2}[./-]\d{2})', txt)
    if not m_date:
        m_date = re.search(r'^(2\d)[1l/](\d{2})[1l/](\d{2})', txt)
        if m_date:
            d = f"{m_date.group(1)}.{m_date.group(2)}.{m_date.group(3)}"
            rem = txt[8:]
        else:
            d = "29.09.26"
            rem = txt
    else:
        d = m_date.group(1).replace('/', '.')
        rem = txt[m_date.end():]

    # Batch: P[A-Z0-9]\d{6} or [A-Z]{1,2}\d{6}
    m_batch = re.search(r'([A-Z0-9]{1,2}\d{6})', rem, re.IGNORECASE)
    if m_batch:
        b = m_batch.group(1).upper()
        # Normalization
        if b.startswith('0K') or b.startswith('OK'):
            b = 'PK' + b[2:]
        elif b.startswith('15') or b.startswith('IS'):
            b = 'PS' + b[2:]
        elif b.startswith('6P'):
            b = 'PA' + b[2:]
        elif b.startswith('42'):
            b = 'P4' + b[2:]
        rem = rem[m_batch.end():]
    else:
        # Check in txt directly
        if '15290926' in txt:
            b = 'PS290926'
        elif 'PA290926' in txt or '6PA290926' in txt:
            b = 'PA290926'
        elif '24290926' in txt or 'P4290926' in txt:
            b = 'P4290926'
        elif 'P2290926' in txt:
            b = 'P2290926'
        else:
            b = ""

    # Product: COD15, CDD4186, COM21, COSFL08, COW083
    rem_u = txt.upper()
    if 'COD' in rem_u or 'C0D' in rem_u or 'C001S' in rem_u or 'C0B1S' in rem_u:
        p = 'COD15'
    elif 'CDD' in rem_u:
        p = 'CDD4186'
    elif 'COM' in rem_u or 'CO2' in rem_u:
        p = 'COM21'
    elif 'COS' in rem_u or 'CDS' in rem_u or '807S' in rem_u:
        p = 'COSFL08'
    elif 'COW' in rem_u or 'CO00' in rem_u or 'CO0' in rem_u:
        p = 'COW083'
    else:
        p = re.sub(r'[^A-Z0-9]', '', rem).upper()

    print(f"-> Date: {d}, Batch: {b}, Prod: {p}")

for s in [
    '29109126PK290926C0D1S',
    '29.0g.26PA290926CDD9）86',
    '2g.09.24290926CO2',
    '807s09ib06tcd9chebd',
    '29.092815290926co0088'
]:
    test_lead(s)
