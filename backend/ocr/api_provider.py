"""
External Cloud / Vision API OCR Provider.
Ready for integrating high-accuracy Cloud Vision APIs (e.g. Gemini 2.0 Flash, OpenAI Vision, Google Document AI).
When configured and healthy, this acts as the PRIMARY engine; otherwise OcrManager falls back to PaddleOCR.
"""
import os
import json
import base64
import logging
import requests
import numpy as np
import cv2
from typing import List, Dict, Any, Optional, Tuple, Union

from .base import BaseOcrProvider, OCRToken

logger = logging.getLogger("ocr.api_provider")


class CloudVisionApiProvider(BaseOcrProvider):
    """
    Pluggable external OCR API provider.
    Configured via environment variables:
    - OCR_API_PROVIDER: 'gemini' | 'openai' | 'generic'
    - OCR_API_KEY: Secret key for API access
    - OCR_API_ENDPOINT: Optional custom URL
    """

    def __init__(self):
        self.provider_type = os.getenv("OCR_API_PROVIDER", "").lower()
        self.api_key = os.getenv("OCR_API_KEY", "")
        self.endpoint = os.getenv("OCR_API_ENDPOINT", "")

    @property
    def name(self) -> str:
        return f"cloud_api_{self.provider_type or 'unconfigured'}"

    @property
    def is_ready(self) -> bool:
        """Ready only if both provider type and API key are set."""
        return bool(self.provider_type and self.api_key)

    def configure(self, provider_type: str, api_key: str, endpoint: Optional[str] = None):
        """Allows runtime configuration from admin dashboard."""
        self.provider_type = provider_type.lower()
        self.api_key = api_key
        if endpoint:
            self.endpoint = endpoint
        logger.info(f"Cloud OCR API provider updated to {self.provider_type}")

    def detect_orientation(self, image_np: np.ndarray) -> Tuple[np.ndarray, int]:
        """
        Vision models typically handle rotated inputs natively,
        but for local deskewing we default to 0 (or can delegate to paddle).
        """
        return image_np, 0

    def extract_tokens(self, image_path_or_np: Union[str, np.ndarray]) -> List[OCRToken]:
        """
        Calls cloud OCR endpoint to retrieve bounding box tokens.
        If not configured or an error occurs, returns empty list so fallback activates.
        """
        if not self.is_ready:
            logger.debug("Cloud OCR API is not configured; skipping.")
            return []

        try:
            # Placeholder for Cloud Vision token response parsing
            logger.info(f"Extracting tokens using {self.provider_type} API...")
            # For instance, Google Cloud Vision or Azure Vision response parsing:
            return []
        except Exception as e:
            logger.error(f"Cloud OCR API call failed: {e}")
            return []

    def extract_structured(self, image_path: str, schema_or_prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Direct structured extraction using Vision LLM (e.g. Gemini / GPT-4o).
        Returns parsed JSON dict matching schema if successful, or None.
        """
        if not self.is_ready:
            return None

        # When the user supplies their API key in future, this executes direct
        # high-accuracy JSON extraction with zero OpenCV coordinate fragility:
        try:
            if self.provider_type == "gemini":
                return self._call_gemini_vision(image_path, schema_or_prompt)
            elif self.provider_type == "openai":
                return self._call_openai_vision(image_path, schema_or_prompt)
        except Exception as e:
            logger.warning(f"Cloud Vision structured extraction error: {e}")
            return None
        return None

    def _call_gemini_vision(self, image_path: str, schema_or_prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with open(image_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")

        url = self.endpoint or f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
        prompt = (
            "You are a factory document OCR specialist. Extract all table rows and metadata from this physical sheet. "
            f"Conform strictly to schema: {json.dumps(schema_or_prompt)}. Return pure JSON only."
        )

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": "image/jpeg", "data": b64_data}}
                ]
            }],
            "generationConfig": {"response_mime_type": "application/json"}
        }

        resp = requests.post(url, json=payload, timeout=20)
        if resp.status_code == 200:
            res_json = resp.json()
            raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(raw_text)
        else:
            logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
            return None

    def _call_openai_vision(self, image_path: str, schema_or_prompt: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with open(image_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")

        url = self.endpoint or "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        prompt = (
            "Extract all table rows and metadata from this physical laboratory or factory sheet. "
            f"Conform strictly to schema: {json.dumps(schema_or_prompt)}. Return pure JSON only."
        )

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_data}"}}
                    ]
                }
            ],
            "response_format": {"type": "json_object"}
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=25)
        if resp.status_code == 200:
            res_json = resp.json()
            raw_content = res_json["choices"][0]["message"]["content"]
            return json.loads(raw_content)
        else:
            logger.error(f"OpenAI API returned status {resp.status_code}: {resp.text}")
            return None


# Shared singleton instance
cloud_api_provider = CloudVisionApiProvider()
