"""Tests for POST /extract (public single-document endpoint)."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.skip(reason="wireframe — implement in Phase 5 (TDD)")


async def test_extract_returns_result_for_valid_pdf(client) -> None:
    """A valid PDF returns 200 and an ExtractResponse with the CORD schema."""
    raise NotImplementedError


async def test_extract_rejects_unsupported_type(client) -> None:
    """A non-PDF/image upload returns 415."""
    raise NotImplementedError


async def test_extract_rejects_file_too_large(client) -> None:
    """An upload over MAX_UPLOAD_BYTES returns 413."""
    raise NotImplementedError


async def test_extract_rejects_empty_file(client) -> None:
    """An empty upload returns 400."""
    raise NotImplementedError


async def test_extract_requires_file(client) -> None:
    """Missing the file field returns 422."""
    raise NotImplementedError
