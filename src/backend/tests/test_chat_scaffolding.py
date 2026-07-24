"""Unit tests for chat scaffolding: constants, exceptions, schema, config default."""

from __future__ import annotations

from app.chat.constants import ALLOWED_IMAGE_TYPES, MAX_TOKENS, MAX_UPLOAD_BYTES
from app.chat.exceptions import (
    ChatBadRequest,
    ChatRateLimited,
    ChatUnavailable,
    EmptyImage,
    ImageTooLarge,
    UnsupportedImageType,
)
from app.chat.schemas import ChatResponse
from app.config import Settings


def test_constants() -> None:
    assert ALLOWED_IMAGE_TYPES == frozenset({"image/png", "image/jpeg"})
    assert MAX_UPLOAD_BYTES == 4_500_000
    assert MAX_TOKENS == 1024


def test_exception_status_codes() -> None:
    assert UnsupportedImageType().status_code == 415
    assert EmptyImage().status_code == 400
    assert ImageTooLarge().status_code == 413
    assert ChatRateLimited().status_code == 429
    assert ChatBadRequest().status_code == 422
    assert ChatUnavailable().status_code == 503


def test_chat_response_shape() -> None:
    r = ChatResponse(reply="hi", model="claude-opus-4-8")
    assert r.model_dump() == {"reply": "hi", "model": "claude-opus-4-8"}


def test_chat_model_default() -> None:
    assert Settings().chat_model == "claude-opus-4-8"
