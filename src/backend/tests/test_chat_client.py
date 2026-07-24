"""Unit tests for AnthropicChatClient — message construction and text extraction.

A fake SDK stands in for anthropic.Anthropic so no network call is made.
"""

from __future__ import annotations

import base64
from types import SimpleNamespace

from app.chat.client import AnthropicChatClient
from app.config import Settings


class _FakeMessages:
    def __init__(self, blocks: list) -> None:
        self._blocks = blocks
        self.captured: dict | None = None

    def create(self, **kwargs: object) -> SimpleNamespace:
        self.captured = kwargs
        return SimpleNamespace(content=self._blocks)


class _FakeSDK:
    def __init__(self, blocks: list) -> None:
        self.messages = _FakeMessages(blocks)


def _text_block(text: str) -> SimpleNamespace:
    return SimpleNamespace(type="text", text=text)


def test_reply_extracts_and_joins_text_blocks() -> None:
    sdk = _FakeSDK([_text_block("The total "), _text_block("is $11.00.")])
    client = AnthropicChatClient(sdk=sdk, settings=Settings())
    assert client.reply(b"rawpng", "image/png", "What is the total?") == "The total is $11.00."


def test_reply_builds_correct_message_payload() -> None:
    sdk = _FakeSDK([_text_block("ok")])
    client = AnthropicChatClient(sdk=sdk, settings=Settings())
    client.reply(b"rawpng", "image/png", "hello")

    kw = sdk.messages.captured
    assert kw["model"] == "claude-opus-4-8"
    assert kw["max_tokens"] == 1024
    content = kw["messages"][0]["content"]
    image_block, text_block = content[0], content[1]
    assert image_block["type"] == "image"
    assert image_block["source"]["media_type"] == "image/png"
    assert image_block["source"]["data"] == base64.standard_b64encode(b"rawpng").decode()
    assert text_block == {"type": "text", "text": "hello"}


def test_reply_falls_back_when_no_text_blocks() -> None:
    sdk = _FakeSDK([SimpleNamespace(type="thinking", thinking="...")])
    client = AnthropicChatClient(sdk=sdk, settings=Settings())
    assert client.reply(b"x", "image/png", "hi") == "(no answer)"


def test_get_chat_client_is_singleton() -> None:
    from app.chat.client import get_chat_client

    assert get_chat_client() is get_chat_client()
