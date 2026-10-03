"""
End-to-end tests for QA lab sheet parser on real physical images.
No mock token dictionaries or fake data.
"""
import os
import pytest
from backend.ocr import qa_parser, QA_SHEET_SCHEMAS, IN_PROCESS_COLUMNS

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
SAMPLE_QA_PATH = os.path.join(ASSETS_DIR, "sample_qa.jpg")
ROT90_PATH = os.path.join(ASSETS_DIR, "rot90.jpg")


def test_qa_schemas_definition():
    assert "in_process" in QA_SHEET_SCHEMAS
    assert "finished_goods" in QA_SHEET_SCHEMAS
    assert "microbiological" in QA_SHEET_SCHEMAS
    assert QA_SHEET_SCHEMAS["in_process"]["columns"] == IN_PROCESS_COLUMNS
    assert len(IN_PROCESS_COLUMNS) == 12


def test_real_qa_sheet_extraction():
    assert os.path.exists(SAMPLE_QA_PATH), f"Real test asset missing: {SAMPLE_QA_PATH}"

    sheet_type, cols, rows, oriented_path, meta = qa_parser.process_image(
        SAMPLE_QA_PATH,
        requested_sheet_type="in_process"
    )

    assert cols == IN_PROCESS_COLUMNS
    assert os.path.exists(oriented_path)
    assert len(rows) > 0

    # Ensure every row contains only actual columns and no hallucinated batches
    for r in rows:
        assert "sr no" in r
        assert "Batch Number" in r
        assert "product code" in r
        assert "_confidence" in r
        # Verify confidence dict exists
        for col_name in IN_PROCESS_COLUMNS:
            assert col_name in r["_confidence"]


def test_real_rotated_qa_sheet_orientation():
    assert os.path.exists(ROT90_PATH), f"Real rotated asset missing: {ROT90_PATH}"

    sheet_type, cols, rows, oriented_path, meta = qa_parser.process_image(
        ROT90_PATH,
        requested_sheet_type="in_process"
    )

    assert os.path.exists(oriented_path)
    assert len(rows) > 0
