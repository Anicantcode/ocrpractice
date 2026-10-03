"""
Synthetic Laboratory Sheet Generator.
Generates an authentic handwritten-styled laboratory quality control sheet for 1-click demos and tests.
"""
import os
from PIL import Image, ImageDraw


def generate_sample_quality_sheet(output_path: str) -> str:
    """
    Creates a realistic quality assurance report image with the 12 standard parameters.
    """
    width, height = 1400, 900
    img = Image.new("RGB", (width, height), color=(252, 252, 250))
    draw = ImageDraw.Draw(img)

    # Header Card
    draw.rectangle([(40, 30), (width - 40, 115)], fill=(253, 251, 247), outline=(228, 2, 45), width=2)
    draw.text((60, 45), "QUALITY ASSURANCE REPORT", fill=(228, 2, 45))
    draw.text((60, 75), "Quality Control Laboratory   |   Shift: Morning", fill=(45, 20, 12))
    draw.text((width - 340, 50), "FORM: QA-LOG-01", fill=(125, 88, 67))
    draw.text((width - 340, 75), "SAP QM Ready", fill=(228, 2, 45))

    columns = [
        ("Sr No", 70), ("Date", 110), ("Batch Number", 130), ("Product Code", 130),
        ("Paper Wt (g)", 100), ("S.Paper Wt (g)", 110), ("Sample Wt (g)", 110),
        ("Dry Wt (g)", 100), ("Fat %", 90), ("Moisture %", 100),
        ("pH", 80), ("Particle Size", 110)
    ]

    start_x = 50
    start_y = 140
    row_height = 42

    # Column Headers
    curr_x = start_x
    for name, col_w in columns:
        draw.rectangle([(curr_x, start_y), (curr_x + col_w, start_y + row_height)], fill=(27, 11, 7), outline=(62, 31, 19), width=1)
        draw.text((curr_x + 6, start_y + 12), name, fill=(234, 203, 133))
        curr_x += col_w

    ink_color = (25, 12, 8)
    rows_data = [
        ["1", "29/09/26", "PK290926", "COD15", "2.345", "3.685", "1.450", "1.203", "38.04", "0.410", "6.40", "21 up"],
        ["2", "29.09.26", "PA290926", "CDD4186", "2.350", "3.812", "1.620", "1.042", "31.27", "0.81", "6.50", "21 up"],
        ["3", "29.09.26", "P4290926", "COM21", "2.298", "4.105", "1.540", "1.126", "37.30", "0.74", "6.50", "21 up"],
        ["4", "29.09.26", "P2290926", "COSFL08", "2.330", "3.782", "1.810", "1.260", "36.40", "0.91", "6.30", "20 up"],
        ["5", "29.09.26", "PS290926", "COW083", "2.312", "3.240", "2.103", "1.082", "38.10", "1.02", "6.50", "21 up"],
    ]

    curr_y = start_y + row_height
    for r_idx, row in enumerate(rows_data):
        curr_x = start_x
        bg_fill = (255, 255, 255) if r_idx % 2 == 0 else (250, 246, 238)
        for val, (_, col_w) in zip(row, columns):
            draw.rectangle([(curr_x, curr_y), (curr_x + col_w, curr_y + row_height)], fill=bg_fill, outline=(232, 222, 201), width=1)
            draw.text((curr_x + 8, curr_y + 12), str(val), fill=ink_color)
            curr_x += col_w
        curr_y += row_height

    # Footer verification badge
    draw.rectangle([(width - 340, curr_y + 40), (width - 60, curr_y + 130)], outline=(228, 2, 45), width=3)
    draw.text((width - 320, curr_y + 55), "QA VERIFIED", fill=(228, 2, 45))
    draw.text((width - 320, curr_y + 80), "Ready for SAP QM Sync", fill=(228, 2, 45))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    return output_path
