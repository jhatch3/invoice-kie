"""The extraction pipeline: a swappable interface.

`Pipeline.extract` maps one document (raw bytes) to an `ExtractionResult`. `MockPipeline` is the
placeholder used until the trained model is wired in; `LayoutLMv3Pipeline` will implement the same
Protocol and drop in behind `get_pipeline` with no route or schema change.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Protocol

from app.extraction.schemas import ExtractionResult, LineItem


class Pipeline(Protocol):
    """Anything that turns document bytes into an ExtractionResult."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult: ...


class MockPipeline:
    """Placeholder pipeline. Returns a deterministic ExtractionResult (no real model)."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        return ExtractionResult(
            subtotal="12.00",
            tax="1.20",
            total="13.20",
            currency="USD",
            confidence=0.5,
            line_items=[
                LineItem(name="Sample item", qty="1", unit_price="12.00", price="12.00"),
            ],
        )


@lru_cache
def get_pipeline() -> Pipeline:
    """FastAPI dependency: the active pipeline (a singleton; override in tests / swap later)."""
    return MockPipeline()
