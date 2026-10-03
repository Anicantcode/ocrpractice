import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def unpack_trailing_compound(txt):
    """
    Decomposes fused trailing measurements:
    e.g. '38.0400.4106.40210' -> fat=38.04, moisture=0.410, ph=6.40, particle=21 up
    e.g. '3980909426-802109' or '3730074265021'
    """
    fat, moist, ph, part = "", "", "", ""
    cleaned = txt.replace('-', '.').replace(',', '.')
    
    # Check for decimal numbers
    # In '38.0400.4106.40210', re.split on '.' or matching patterns:
    # 1. Fat: 25.0 - 55.0
    # 2. Moisture: 0.1 - 3.0
    # 3. pH: 5.5 - 8.5
    # 4. Particle: 20 up, 21 up
    
    # Pattern matching for: (Fat: 2 digits.2 digits)(Moist: 0.3 digits)(pH: 6.2 digits)(Part: 21)
    m = re.search(r'(\d{2}\.\d{2})0*(\d\.\d{2,3})(\d\.\d{2})(\d{2})', cleaned)
    if m:
        fat = float(m.group(1))
        moist = float(m.group(2))
        ph = float(m.group(3))
        part = f"{m.group(4)} up"
        return fat, moist, ph, part

    # Sub-float matches
    floats = re.findall(r'(\d{1,2}\.\d{1,3})', cleaned)
    for f_str in floats:
        val = float(f_str)
        if 25.0 <= val <= 55.0 and not fat:
            fat = val
        elif 0.2 <= val <= 2.5 and not moist:
            moist = val
        elif 5.5 <= val <= 8.5 and not ph:
            ph = val

    # Check for particle size
    m_p = re.search(r'(2[0-2])', txt)
    if m_p:
        part = f"{m_p.group(1)} up"

    return fat, moist, ph, part

for s in ['38.0400.4106.40210', '3980909426-802109', '1.5401126']:
    print(f"Testing '{s}':")
    if '1.5401126' in s:
        # Mid weight compound
        m_mid = re.findall(r'(\d\.\d{3})', s)
        print("  Mid weights:", m_mid)
    else:
        f, m, p, pt = unpack_trailing_compound(s)
        print(f"  Fat={f}, Moist={m}, pH={p}, Part={pt}")
