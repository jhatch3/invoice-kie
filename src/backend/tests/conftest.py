"""Shared test fixtures.

Per fastapi-best-practices: an async httpx client over ASGITransport, and `get_pipeline`
overridden with a deterministic stub via `dependency_overrides` (never monkeypatching internals).
"""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.extraction.pipeline import get_pipeline
from app.extraction.schemas import ExtractionResult, LineItem
from app.main import create_app


class StubPipeline:
    """Deterministic pipeline used in tests (no model, no I/O)."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        return ExtractionResult(
            subtotal="10.00",
            tax="1.00",
            total="11.00",
            currency="USD",
            confidence=0.9,
            line_items=[LineItem(name="Widget", qty="2", unit_price="5.00", price="10.00")],
        )


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    """httpx.AsyncClient bound to the app (ASGITransport) with get_pipeline overridden."""
    app = create_app()
    app.dependency_overrides[get_pipeline] = lambda: StubPipeline()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client
    app.dependency_overrides.clear()
