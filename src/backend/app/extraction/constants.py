"""Extraction-domain constants: accepted upload types and size limit."""

from __future__ import annotations

# Content types the pipeline accepts as input documents.
ALLOWED_CONTENT_TYPES: frozenset[str] = frozenset(
    {"application/pdf", "image/png", "image/jpeg"}
)

# Reject uploads larger than this (bytes).
MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MiB

# Reported in responses so callers know which pipeline produced a result.
MODEL_VERSION: str = "mock-0"
