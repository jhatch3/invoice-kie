"""Request-scoped dependencies for the extraction routes.

Per fastapi-best-practices, validation that can fail lives in dependencies so routes stay thin
and errors are raised in one place.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import UploadFile


async def valid_upload(file: "UploadFile") -> "UploadFile":
    """Validate content type and size; raise UnsupportedFileType / FileTooLarge / EmptyUpload."""
    raise NotImplementedError
