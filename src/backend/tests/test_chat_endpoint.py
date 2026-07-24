"""Integration tests for POST /chat, with get_chat_client overridden by a fake."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import anthropic
import httpx
from httpx import ASGITransport, AsyncClient

from app.chat.client import get_chat_client
from app.main import create_app


class _FakeChat:
    """Records calls; returns a canned reply or raises a preset exception."""

    def __init__(self, reply: str = "The total is $11.00.", error: Exception | None = None) -> None:
        self._reply = reply
        self._error = error
        self.calls: list[tuple[bytes, str, str]] = []

    def reply(self, image: bytes, media_type: str, message: str) -> str:
        self.calls.append((image, media_type, message))
        if self._error is not None:
            raise self._error
        return self._reply


@asynccontextmanager
async def _client_with(chat: _FakeChat) -> AsyncIterator[AsyncClient]:
    app = create_app()
    app.dependency_overrides[get_chat_client] = lambda: chat
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client
    app.dependency_overrides.clear()


def _png(name: str = "receipt.png", content: bytes = b"\x89PNG fake") -> dict:
    return {"image": (name, content, "image/png")}


def _status_error(cls: type, status: int) -> anthropic.APIStatusError:
    response = httpx.Response(status, request=httpx.Request("POST", "https://api.anthropic.com"))
    return cls("boom", response=response, body=None)


async def test_chat_happy_path() -> None:
    fake = _FakeChat()
    async with _client_with(fake) as client:
        resp = await client.post("/chat", data={"message": "What is the total?"}, files=_png())
    assert resp.status_code == 200
    body = resp.json()
    assert body["reply"] == "The total is $11.00."
    assert body["model"] == "claude-opus-4-8"
    # the fake received the right media type + message
    assert fake.calls[0][1] == "image/png"
    assert fake.calls[0][2] == "What is the total?"


async def test_chat_rejects_non_image() -> None:
    async with _client_with(_FakeChat()) as client:
        resp = await client.post(
            "/chat", data={"message": "hi"}, files={"image": ("x.txt", b"hi", "text/plain")}
        )
    assert resp.status_code == 415


async def test_chat_rejects_empty_image() -> None:
    async with _client_with(_FakeChat()) as client:
        resp = await client.post(
            "/chat", data={"message": "hi"}, files={"image": ("e.png", b"", "image/png")}
        )
    assert resp.status_code == 400


async def test_chat_rejects_oversize_image() -> None:
    async with _client_with(_FakeChat()) as client:
        resp = await client.post(
            "/chat", data={"message": "hi"}, files=_png(content=b"x" * 4_500_001)
        )
    assert resp.status_code == 413


async def test_chat_requires_message() -> None:
    async with _client_with(_FakeChat()) as client:
        resp = await client.post("/chat", files=_png())
    assert resp.status_code == 422


async def test_chat_rejects_blank_message() -> None:
    async with _client_with(_FakeChat()) as client:
        resp = await client.post("/chat", data={"message": ""}, files=_png())
    assert resp.status_code == 422


async def test_chat_maps_rate_limit_to_429() -> None:
    fake = _FakeChat(error=_status_error(anthropic.RateLimitError, 429))
    async with _client_with(fake) as client:
        resp = await client.post("/chat", data={"message": "hi"}, files=_png())
    assert resp.status_code == 429


async def test_chat_maps_bad_request_to_422() -> None:
    fake = _FakeChat(error=_status_error(anthropic.BadRequestError, 400))
    async with _client_with(fake) as client:
        resp = await client.post("/chat", data={"message": "hi"}, files=_png())
    assert resp.status_code == 422


async def test_chat_maps_auth_error_to_503() -> None:
    fake = _FakeChat(error=_status_error(anthropic.AuthenticationError, 401))
    async with _client_with(fake) as client:
        resp = await client.post("/chat", data={"message": "hi"}, files=_png())
    assert resp.status_code == 503
