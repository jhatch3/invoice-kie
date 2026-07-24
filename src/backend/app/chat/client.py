"""The chat client boundary: a swappable interface over the Anthropic vision API.

`ChatClient.reply` maps (image bytes, media type, question) to Claude's free-form answer.
`AnthropicChatClient` is the real implementation; tests inject a fake behind the same Protocol,
and `get_chat_client` is the FastAPI dependency (a singleton). This mirrors the extraction
module's Pipeline / get_pipeline seam.
"""

from __future__ import annotations

import base64
from functools import lru_cache
from typing import Protocol

import anthropic

from app.chat.constants import MAX_TOKENS
from app.config import Settings, get_settings


class ChatClient(Protocol):
    """Anything that answers a question about an image."""

    def reply(self, image: bytes, media_type: str, message: str) -> str: ...


class AnthropicChatClient:
    """Sends the image + question to Claude (vision) and returns the text answer.

    The SDK client is constructed lazily on first use so a missing-credentials error surfaces
    inside `reply` (where the service maps it to a clean 503) rather than at dependency time.
    """

    def __init__(
        self,
        sdk: anthropic.Anthropic | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._sdk = sdk

    def _client(self) -> anthropic.Anthropic:
        if self._sdk is None:
            sdk = anthropic.Anthropic()
            # anthropic.Anthropic() does not raise when no key/token is configured — it just
            # sets api_key/auth_token to None and only fails later, inside messages.create(),
            # with a bare TypeError (not an AnthropicError subclass). Raise here instead so the
            # service's `except anthropic.AnthropicError` maps missing credentials to a clean 503.
            if sdk.api_key is None and sdk.auth_token is None:
                raise anthropic.AnthropicError("Missing Anthropic credentials (no api_key or auth_token).")
            self._sdk = sdk
        return self._sdk

    def reply(self, image: bytes, media_type: str, message: str) -> str:
        data = base64.standard_b64encode(image).decode("utf-8")
        response = self._client().messages.create(
            model=self._settings.chat_model,
            max_tokens=MAX_TOKENS,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": data,
                            },
                        },
                        {"type": "text", "text": message},
                    ],
                }
            ],
        )
        text = "".join(block.text for block in response.content if block.type == "text")
        return text or "(no answer)"


@lru_cache
def get_chat_client() -> ChatClient:
    """FastAPI dependency: the active chat client (a singleton; overridden in tests)."""
    return AnthropicChatClient()
