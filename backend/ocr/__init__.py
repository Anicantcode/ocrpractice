"""
Unified OCR Module for Morde Enterprise Portal.
Provides Primary Cloud/Vision API support with PaddleOCR on-device backdrop fallback.
"""
from .base import BaseOcrProvider, OCRToken
from .manager import ocr_manager
from .paddle_provider import paddle_provider
from .api_provider import cloud_api_provider
from .sample_generator import generate_sample_quality_sheet
from .marathi_translator import translate_marathi_mixed, convert_devanagari_digits
from .parsers import (
    qa_parser,
    worker_parser,
    voucher_parser,
    QA_SHEET_SCHEMAS,
    IN_PROCESS_COLUMNS,
    FINISHED_GOODS_COLUMNS,
    MICROBIOLOGICAL_COLUMNS,
    parse_float_safe,
    fix_qc_measurement,
    parse_sheet_rows
)

# Backwards compatibility aliases
ocr_engine = ocr_manager
qa_multi_parser = qa_parser
worker_ocr_engine = worker_parser
voucher_ocr_engine = voucher_parser
COLUMNS = IN_PROCESS_COLUMNS

__all__ = [
    "ocr_manager",
    "ocr_engine",
    "paddle_provider",
    "cloud_api_provider",
    "qa_parser",
    "qa_multi_parser",
    "worker_parser",
    "worker_ocr_engine",
    "voucher_parser",
    "voucher_ocr_engine",
    "generate_sample_quality_sheet",
    "translate_marathi_mixed",
    "convert_devanagari_digits",
    "QA_SHEET_SCHEMAS",
    "IN_PROCESS_COLUMNS",
    "FINISHED_GOODS_COLUMNS",
    "MICROBIOLOGICAL_COLUMNS",
    "COLUMNS",
    "parse_float_safe",
    "fix_qc_measurement",
    "parse_sheet_rows"
]
