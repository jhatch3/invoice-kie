"""Chat route: POST /chat — ask Claude (vision) a question about an uploaded image.

Sync `def` route because the SDK call is blocking I/O, so FastAPI runs it in its threadpool;
`valid_image_upload` (async) has already read + validated the image.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Form

from app.chat.client import ChatClient, get_chat_client
from app.chat.dependencies import valid_image_upload
from app.chat.schemas import ChatResponse
from app.chat.service import ask

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse, status_code=200)
def chat(
    message: str = Form(..., min_length=1),
    upload: tuple[str, str, bytes] = Depends(valid_image_upload),
    client: ChatClient = Depends(get_chat_client),
) -> ChatResponse:
    """Answer a free-form question about one uploaded receipt/invoice image."""
    _, media_type, content = upload
    return ask(content, media_type, message, client)
