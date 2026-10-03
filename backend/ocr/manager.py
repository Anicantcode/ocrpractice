"""
OCR Orchestrator / Manager.
Coordinates Primary OCR Provider (Cloud/Vision API) and Backdrop Provider (PaddleOCR).
Handles automatic fallback so processing never fails if an API key is missing or quota is reached.
"""
import logging
import numpy as np
from typing import List, Dict, Any, Tuple, Optional, Union

from .base import BaseOcrProvider, OCRToken
from .paddle_provider import paddle_provider
from .api_provider import cloud_api_provider

logger = logging.getLogger("ocr.manager")


class OcrManager:
    """
    Central OCR coordinator that manages provider selection and fallback strategy.
    """

    def __init__(self):
        self.fallback_provider: BaseOcrProvider = paddle_provider
        self.primary_provider: BaseOcrProvider = cloud_api_provider

    @property
    def active_provider_name(self) -> str:
        if self.primary_provider.is_ready:
            return self.primary_provider.name
        return self.fallback_provider.name

    @property
    def is_paddle_ready(self) -> bool:
        return self.fallback_provider.is_ready

    @property
    def is_api_ready(self) -> bool:
        return self.primary_provider.is_ready

    def get_status(self) -> Dict[str, Any]:
        return {
            "active_provider": self.active_provider_name,
            "paddle_ready": self.is_paddle_ready,
            "api_ready": self.is_api_ready,
            "primary_configured": bool(self.primary_provider.is_ready)
        }

    def detect_orientation(self, image_np: np.ndarray, manual_rotation: Optional[int] = None) -> Tuple[np.ndarray, int]:
        """
        Applies manual rotation if requested, or auto-detects using the local backdrop engine.
        Returns: (oriented_image_np, rotation_angle)
        """
        import cv2

        if manual_rotation is not None and manual_rotation != 0:
            if manual_rotation == 90:
                return cv2.rotate(image_np, cv2.ROTATE_90_CLOCKWISE), 90
            elif manual_rotation == 180:
                return cv2.rotate(image_np, cv2.ROTATE_180), 180
            elif manual_rotation == 270:
                return cv2.rotate(image_np, cv2.ROTATE_90_COUNTERCLOCKWISE), 270
            return image_np, 0

        # Run orientation detection via Paddle provider
        return self.fallback_provider.detect_orientation(image_np)

    def extract_tokens(self, image_path_or_np: Union[str, np.ndarray]) -> Tuple[List[OCRToken], str]:
        """
        Extracts tokens using primary provider if ready;
        falls back to PaddleOCR automatically.
        Returns: (tokens, provider_used)
        """
        # 1. Try Primary Cloud API if ready
        if self.primary_provider.is_ready:
            try:
                tokens = self.primary_provider.extract_tokens(image_path_or_np)
                if tokens:
                    return tokens, self.primary_provider.name
                logger.info("Primary provider yielded no tokens; falling back to PaddleOCR.")
            except Exception as e:
                logger.warning(f"Primary OCR provider error: {e}. Falling back to PaddleOCR.")

        # 2. Backdrop: PaddleOCR
        tokens = self.fallback_provider.extract_tokens(image_path_or_np)
        return tokens, self.fallback_provider.name

    def extract_structured_with_fallback(
        self,
        image_path: str,
        schema: Dict[str, Any]
    ) -> Tuple[Optional[Dict[str, Any]], str]:
        """
        Attempts direct structured extraction via Vision API first.
        Returns (result_dict, provider_name). If not available, result is None.
        """
        if self.primary_provider.is_ready:
            res = self.primary_provider.extract_structured(image_path, schema)
            if res:
                return res, self.primary_provider.name
        return None, self.fallback_provider.name


# Global singleton
ocr_manager = OcrManager()
