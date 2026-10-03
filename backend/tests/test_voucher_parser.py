"""
End-to-end tests for Morde Voucher Slip Parser on real physical voucher slip.
No mock token dictionaries or fake data.
"""
import os
import pytest
from backend.ocr.parsers.voucher_parser import voucher_parser, is_reserved_label

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
SAMPLE_VOUCHER_PATH = os.path.join(ASSETS_DIR, "sample_voucher.jpeg")


def test_is_reserved_label():
    assert is_reserved_label("DEBIT") is True
    assert is_reserved_label("PAY TO") is True
    assert is_reserved_label("VOUCHER NO") is True
    assert is_reserved_label("Random Vendor Pvt Ltd") is False


def test_real_voucher_extraction():
    assert os.path.exists(SAMPLE_VOUCHER_PATH), f"Real test asset missing: {SAMPLE_VOUCHER_PATH}"

    voucher_data, oriented_path = voucher_parser.process_voucher_image(SAMPLE_VOUCHER_PATH)

    assert os.path.exists(oriented_path)
    assert isinstance(voucher_data, dict)
    assert "voucher_no" in voucher_data
    assert "debit_account" in voucher_data
    assert "pay_to" in voucher_data
    assert "amount" in voucher_data
    assert "status" in voucher_data
