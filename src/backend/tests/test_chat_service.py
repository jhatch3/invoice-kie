"""Unit tests for the chat service: happy path + SDK-error → chat-exception mapping."""

from __future__ import annotations

import httpx
import pytest

import anthropic
from app.chat.exceptions import ChatBadRequest, ChatRateLimited, ChatUnavailable
from app.chat.service import ask


class _FakeChat:
    """Fake ChatClient: returns a canned reply, or raises a preset exception."""

    def __init__(self, reply: str = "answer", error: Exception | None = None) -> None:
        self._reply = reply
        self._error = error

    def reply(self, image: bytes, media_type: str, message: str) -> str:
        if self._error is not None:
            raise self._error
        return self._reply


def _status_error(cls: type, status: int) -> anthropic.APIStatusError:
    response = httpx.Response(status, request=httpx.Request("POST", "https://api.anthropic.com"))
    return cls("boom", response=response, body=None)


def test_ask_returns_reply_and_model() -> None:
    result = ask(b"img", "image/png", "hi", _FakeChat(reply="The total is $11.00."))
    assert result.reply == "The total is $11.00."
    assert result.model == "claude-opus-4-8"


def test_ask_maps_rate_limit_to_chat_rate_limited() -> None:
    client = _FakeChat(error=_status_error(anthropic.RateLimitError, 429))
    with pytest.raises(ChatRateLimited):
        ask(b"img", "image/png", "hi", client)


def test_ask_maps_bad_request_to_chat_bad_request() -> None:
    client = _FakeChat(error=_status_error(anthropic.BadRequestError, 400))
    with pytest.raises(ChatBadRequest):
        ask(b"img", "image/png", "hi", client)


def test_ask_maps_auth_error_to_chat_unavailable() -> None:
    client = _FakeChat(error=_status_error(anthropic.AuthenticationError, 401))
    with pytest.raises(ChatUnavailable):
        ask(b"img", "image/png", "hi", client)


def test_ask_maps_missing_credentials_to_chat_unavailable() -> None:
    # Constructing anthropic.Anthropic() with no key raises the base AnthropicError.
    client = _FakeChat(error=anthropic.AnthropicError("no api key"))
    with pytest.raises(ChatUnavailable):
        ask(b"img", "image/png", "hi", client)
