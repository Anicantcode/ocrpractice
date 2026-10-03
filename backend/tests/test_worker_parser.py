"""
End-to-end tests for Floor Loader Daily Working Detail sheet parser on real physical scan.
No mock token dictionaries or fake data.
"""
import os
import pytest
from backend.ocr.parsers.worker_parser import (
    worker_parser,
    clean_vehicle_number,
    clean_remark,
    clean_product_code
)

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
SAMPLE_WORKER_PATH = os.path.join(ASSETS_DIR, "sample_worker.jpg")


def test_clean_vehicle_number():
    assert clean_vehicle_number("MH12 AB 509282") == "9282"
    assert clean_vehicle_number("501234") == "1234"
    assert clean_vehicle_number("G432") == "9432"
    assert clean_vehicle_number("-") == "-"
    assert clean_vehicle_number("") == "-"


def test_clean_remark():
    assert clean_remark("परिसर loading") == "Yard loading"
    assert clean_remark("कंपनी Unloading") == "Company Unloading"
    assert clean_remark("godown to es") == "Godown TO ES"
    assert clean_remark("Line 3 to ES") == "Line 3 TO ES"
    assert clean_remark("-") == "-"


def test_clean_product_code():
    assert clean_product_code("mt pallet") == "MT Pallet"
    assert clean_product_code("cp 1010") == "CP 1010"
    assert clean_product_code("19120") == "19120/1590"
    assert clean_product_code("cod15") == "COD15FS"
    assert clean_product_code("-") == "-"


def test_real_worker_sheet_extraction():
    assert os.path.exists(SAMPLE_WORKER_PATH), f"Real test asset missing: {SAMPLE_WORKER_PATH}"

    data, oriented_path = worker_parser.process_image(SAMPLE_WORKER_PATH)

    assert os.path.exists(oriented_path)
    assert "metadata" in data
    assert "rows" in data
    assert len(data["rows"]) > 0

    # Ensure each row has expected structure from real paper
    for r in data["rows"]:
        assert "id" in r
        assert "working_detail" in r
        assert "rate" in r
        assert "vehicle_no" in r
        assert "pallets" in r
        assert "product_code" in r
        assert "remark" in r
