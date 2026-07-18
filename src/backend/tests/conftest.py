"""Shared test fixtures.

Per fastapi-best-practices: an async httpx client over ASGITransport, and `get_pipeline`
overridden with a deterministic stub via `dependency_overrides` (never monkeypatching internals).
"""

from __future__ import annotations

import pytest


@pytest.fixture
def stub_pipeline():
    """A deterministic Pipeline returning a fixed ExtractionResult, for overriding get_pipeline."""
    raise NotImplementedError


@pytest.fixture
async def client(stub_pipeline):
    """httpx.AsyncClient bound to the app (ASGITransport) with get_pipeline overridden."""
    raise NotImplementedError
