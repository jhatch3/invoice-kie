"""Pydantic schema for the chat API response."""

from __future__ import annotations

from pydantic import BaseModel


class ChatResponse(BaseModel):
    """Envelope returned by POST /chat."""

    reply: str
    model: str
