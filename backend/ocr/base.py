"""
Base contracts and data models for OCR providers.
Enables pluggable OCR engines: Primary Cloud/Vision API with PaddleOCR fallback.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple, Union
import numpy as np


@dataclass
class OCRToken:
    text: str
    confidence: float
    bbox: List[List[float]] = field(default_factory=list)
    x_min: float = 0.0
    y_min: float = 0.0
    x_max: float = 0.0
    y_max: float = 0.0
    x_center: float = 0.0
    y_center: float = 0.0

    @classmethod
    def from_rapidocr(cls, raw_entry: Any) -> "OCRToken":
        """
        Builds OCRToken from a RapidOCR result tuple: (bbox, text, score).
        bbox is 4 points: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]].
        """
        bbox = raw_entry[0]
        text = str(raw_entry[1]).strip()
        confidence = round(float(raw_entry[2]), 3)

        if len(bbox) == 4:
            xs = [pt[0] for pt in bbox]
            ys = [pt[1] for pt in bbox]
            x_min, x_max = float(min(xs)), float(max(xs))
            y_min, y_max = float(min(ys)), float(max(ys))
            x_center = float(sum(xs)) / 4.0
            y_center = float(sum(ys)) / 4.0
        else:
            x_min = y_min = x_max = y_max = x_center = y_center = 0.0

        return cls(
            text=text,
            confidence=confidence,
            bbox=bbox,
            x_min=x_min,
            y_min=y_min,
            x_max=x_max,
            y_max=y_max,
            x_center=x_center,
            y_center=y_center
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "confidence": self.confidence,
            "bbox": self.bbox,
            "x_min": self.x_min,
            "y_min": self.y_min,
            "x_max": self.x_max,
            "y_max": self.y_max,
            "x_center": self.x_center,
            "y_center": self.y_center
        }


class BaseOcrProvider(ABC):
    """
    Abstract interface for OCR Providers.
    Any provider (PaddleOCR, Gemini Vision, OpenAI, Google Document AI)
    implements this contract.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier (e.g. 'paddleocr', 'gemini_vision', 'openai_vision')."""
        pass

    @property
    @abstractmethod
    def is_ready(self) -> bool:
        """True if provider dependencies/keys are available and initialized."""
        pass

    @abstractmethod
    def detect_orientation(self, image_np: np.ndarray) -> Tuple[np.ndarray, int]:
        """
        Detects document orientation (0, 90, 180, 270) and returns (oriented_img, rotation_angle).
        """
        pass

    @abstractmethod
    def extract_tokens(self, image_path_or_np: Union[str, np.ndarray]) -> List[OCRToken]:
        """
        Extracts bounding-box tokens from an image.
        """
        pass

    def extract_structured(self, image_path: str, schema_or_prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Optional structured direct extraction for Vision LLMs.
        Defaults to None (falls back to token parsing).
        """
        return None
