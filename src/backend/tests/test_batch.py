"""Tests for POST /internal/extract-batch (hidden internal endpoint)."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.skip(reason="wireframe — implement in Phase 5 (TDD)")


async def test_batch_returns_one_result_per_file(client) -> None:
    """Multiple uploads return a list of ExtractResponse, one per file, in order."""
    raise NotImplementedError


async def test_batch_hidden_from_openapi(client) -> None:
    """/internal/extract-batch is absent from the OpenAPI schema (include_in_schema=False)."""
    raise NotImplementedError
