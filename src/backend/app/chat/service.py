"""Business logic for chat — calls the ChatClient and maps SDK failures to HTTP errors.

The route stays thin; it calls `ask`. Anthropic SDK exceptions are translated into chat-domain
exceptions (AppError subclasses) so the caller gets a meaningful status code — 429 for rate
limits, 422 for a rejected request, 503 for auth/connection/credentials failures — instead of a
generic 500. Order matters: catch the specific subclasses before the AnthropicError base.
"""

from __future__ import annotations

import anthropic

from app.chat.client import ChatClient
from app.chat.exceptions import ChatBadRequest, ChatRateLimited, ChatUnavailable
from app.chat.schemas import ChatResponse
from app.config import get_settings


def ask(image: bytes, media_type: str, message: str, client: ChatClient) -> ChatResponse:
    """Ask Claude about an image and wrap the answer in a ChatResponse."""
    try:
        reply = client.reply(image, media_type, message)
    except anthropic.RateLimitError:
        raise ChatRateLimited() from None
    except anthropic.BadRequestError:
        raise ChatBadRequest() from None
    except anthropic.AnthropicError:
        raise ChatUnavailable() from None
    return ChatResponse(reply=reply, model=get_settings().chat_model)
