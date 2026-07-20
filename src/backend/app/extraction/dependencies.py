"""Request-scoped dependencies for the extraction routes.

Per fastapi-best-practices, validation that can fail lives in dependencies so routes stay thin
and errors are raised in one place.
"""

from __future__ import annotations

from fastapi import UploadFile

from app.extraction.constants import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES
from app.extraction.exceptions import EmptyUpload, FileTooLarge, UnsupportedFileType


async def valid_upload(file: UploadFile) -> tuple[str, bytes]:
    """Validate content type / size, returning (filename, content).

    Raises UnsupportedFileType (415), EmptyUpload (400), or FileTooLarge (413).
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise UnsupportedFileType()
    content = await file.read()
    if not content:
        raise EmptyUpload()
    if len(content) > MAX_UPLOAD_BYTES:
        raise FileTooLarge()
    return file.filename or "upload", content
