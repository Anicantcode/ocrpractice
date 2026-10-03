"""
PaddleOCR / RapidOCR (PP-OCRv4 ONNX) Provider.
Serves as the local backdrop/fallback engine running 100% on-device.
"""
import os
import cv2
import logging
import numpy as np
from typing import List, Tuple, Union, Optional
from PIL import Image

from .base import BaseOcrProvider, OCRToken

logger = logging.getLogger("ocr.paddle")


class PaddleOcrProvider(BaseOcrProvider):
    """
    Local ONNX-based PaddleOCR provider using RapidOCR.
    Manages a single global instance to avoid multi-engine memory bloat.
    """

    def __init__(self):
        self._engine = None
        self._init_attempted = False

    @property
    def name(self) -> str:
        return "paddleocr"

    def _ensure_engine(self):
        if not self._init_attempted:
            self._init_attempted = True
            try:
                from rapidocr_onnxruntime import RapidOCR
                self._engine = RapidOCR()
                logger.info("RapidOCR (PaddleOCR PP-OCRv4 ONNX) engine initialized successfully.")
            except Exception as e:
                logger.warning(f"RapidOCR not available or failed to initialize: {e}")
                self._engine = None
        return self._engine

    @property
    def is_ready(self) -> bool:
        engine = self._ensure_engine()
        return engine is not None

    def detect_orientation(self, image_np: np.ndarray) -> Tuple[np.ndarray, int]:
        """
        Determines the correct orientation (0, 90, 180, 270 deg)
        by evaluating total OCR score across 4 rotations.
        Returns: (oriented_image_np, rotation_angle)
        """
        engine = self._ensure_engine()
        if not engine:
            return image_np, 0

        best_rot = 0
        best_score = -1.0
        best_img = image_np

        h, w = image_np.shape[:2]
        # For tall photos where documents are usually wide, prioritize 90 and 270
        test_angles = [90, 270, 0, 180] if h > w else [0, 90, 180, 270]

        for rot in test_angles:
            if rot == 90:
                rotated = cv2.rotate(image_np, cv2.ROTATE_90_CLOCKWISE)
            elif rot == 180:
                rotated = cv2.rotate(image_np, cv2.ROTATE_180)
            elif rot == 270:
                rotated = cv2.rotate(image_np, cv2.ROTATE_90_COUNTERCLOCKWISE)
            else:
                rotated = image_np

            # Use lightweight downscaled preview for fast orientation scoring
            rh, rw = rotated.shape[:2]
            scale = 800.0 / max(rh, rw) if max(rh, rw) > 800 else 1.0
            if scale < 1.0:
                preview = cv2.resize(rotated, (int(rw * scale), int(rh * scale)))
            else:
                preview = rotated

            res, _ = engine(preview)
            score = sum(line[2] for line in res) if res else 0.0

            if score > best_score:
                best_score = score
                best_rot = rot
                best_img = rotated

        return best_img, best_rot

    def extract_tokens(self, image_path_or_np: Union[str, np.ndarray]) -> List[OCRToken]:
        """
        Runs RapidOCR detection & recognition on the given image.
        Returns list of OCRToken dataclass objects.
        """
        engine = self._ensure_engine()
        if not engine:
            logger.error("PaddleOCR engine is not available.")
            return []

        if isinstance(image_path_or_np, str):
            if not os.path.exists(image_path_or_np):
                raise FileNotFoundError(f"Image not found at {image_path_or_np}")
            img_input = image_path_or_np
        else:
            img_input = image_path_or_np

        raw_results, _ = engine(img_input)
        if not raw_results:
            return []

        tokens: List[OCRToken] = []
        for line in raw_results:
            try:
                tokens.append(OCRToken.from_rapidocr(line))
            except Exception as e:
                logger.debug(f"Skipping malformed token: {e}")
        return tokens


# Shared singleton instance
paddle_provider = PaddleOcrProvider()
