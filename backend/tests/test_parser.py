import pytest
from backend.ocr.parser import parse_sheet_rows, COLUMNS, parse_float_safe

def test_columns_spec():
    expected = [
        "sr no", "date", "Batch Number", "product code", "paper weight",
        "sample paper weight", "sample weight", "after drying weight",
        "fat %", "moisture %", "ph", "particle size"
    ]
    assert COLUMNS == expected
    assert len(COLUMNS) == 12

def test_parse_float_safe():
    assert parse_float_safe("12.5%") == 12.5
    assert parse_float_safe("1,24") == 1.24
    assert parse_float_safe("6.8") == 6.8
    assert parse_float_safe("invalid", 0.0) == 0.0

def test_parse_sheet_rows_mock_tokens():
    tokens = [
        {"bbox": [[50, 80], [130, 80], [130, 105], [50, 105]], "text": "Sr No", "confidence": 0.99},
        {"bbox": [[140, 80], [220, 80], [220, 105], [140, 105]], "text": "Date", "confidence": 0.99},
        {"bbox": [[50, 130], [100, 130], [100, 155], [50, 155]], "text": "1", "confidence": 0.98},
        {"bbox": [[120, 130], [200, 130], [200, 155], [120, 155]], "text": "2026-09-29", "confidence": 0.97},
        {"bbox": [[220, 130], [300, 130], [300, 155], [220, 155]], "text": "B260901", "confidence": 0.95},
        {"bbox": [[320, 130], [420, 130], [420, 155], [320, 155]], "text": "PRD-CHOC-10", "confidence": 0.96},
        {"bbox": [[440, 130], [500, 130], [500, 155], [440, 155]], "text": "1.24", "confidence": 0.94},
        {"bbox": [[520, 130], [580, 130], [580, 155], [520, 155]], "text": "5.34", "confidence": 0.91},
        {"bbox": [[600, 130], [660, 130], [660, 155], [600, 155]], "text": "4.10", "confidence": 0.95},
        {"bbox": [[680, 130], [740, 130], [740, 155], [680, 155]], "text": "2.85", "confidence": 0.92},
        {"bbox": [[760, 130], [820, 130], [820, 155], [760, 155]], "text": "12.5", "confidence": 0.93},
        {"bbox": [[840, 130], [900, 130], [900, 155], [840, 155]], "text": "4.2", "confidence": 0.88},
        {"bbox": [[920, 130], [980, 130], [980, 155], [920, 155]], "text": "6.8", "confidence": 0.98},
        {"bbox": [[1000, 130], [1080, 130], [1080, 155], [1000, 155]], "text": "75um", "confidence": 0.91},
    ]
    rows = parse_sheet_rows(tokens)
    assert len(rows) == 1
    row = rows[0]
    assert row["sr no"] == 1
    assert row["date"] == "2026-09-29"
    assert row["Batch Number"] == "B260901"
    assert row["product code"] == "PRD-CHOC-10"
    assert row["paper weight"] == 1.24
    assert row["sample paper weight"] == 5.34
    assert row["sample weight"] == 4.10
    assert row["after drying weight"] == 2.85
    assert row["fat %"] == 12.5
    assert row["moisture %"] == 4.2
    assert row["ph"] == 6.8
    assert row["particle size"] == "75um"
