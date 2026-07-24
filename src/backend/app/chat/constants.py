"""Chat-domain constants: accepted image types, upload size cap, output token cap.

The upload cap (~4.5 MB) is intentionally smaller than the extraction module's 10 MiB, to
stay under the Anthropic API's per-image base64 limit so oversize images fail fast with a 413
instead of a confusing upstream error.
"""

from __future__ import annotations

ALLOWED_IMAGE_TYPES: frozenset[str] = frozenset({"image/png", "image/jpeg"})

MAX_UPLOAD_BYTES: int = 4_500_000  # ~4.5 MB, under the Anthropic per-image limit

MAX_TOKENS: int = 1024  # short chat answers; non-streaming
