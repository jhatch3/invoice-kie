"""Request-scoped dependency for POST /chat: validate the uploaded image.

Validation that can fail lives here so the route stays thin. Checks content type, emptiness,
and size (in that order), returning (filename, media_type, content).
"""

from __future__ import annotations

from fastapi import UploadFile

from app.chat.constants import ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES
from app.chat.exceptions import EmptyImage, ImageTooLarge, UnsupportedImageType


async def valid_image_upload(image: UploadFile) -> tuple[str, str, bytes]:
    """Validate the uploaded image, returning (filename, media_type, content).

    Raises UnsupportedImageType (415), EmptyImage (400), or ImageTooLarge (413).
    """
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise UnsupportedImageType()
    content = await image.read()
    if not content:
        raise EmptyImage()
    if len(content) > MAX_UPLOAD_BYTES:
        raise ImageTooLarge()
    return image.filename or "image", image.content_type, content
