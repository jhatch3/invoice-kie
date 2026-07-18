"""The extraction pipeline: a swappable interface.

`Pipeline.extract` maps one document (raw bytes) to an `ExtractionResult`. `MockPipeline` is the
placeholder used until Phase 2; `LayoutLMv3Pipeline` will implement the same Protocol and drop in
behind `get_pipeline` with no route or schema change.
"""

from __future__ import annotations

from typing import Protocol

from app.extraction.schemas import ExtractionResult


class Pipeline(Protocol):
    """Anything that turns document bytes into an ExtractionResult."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult: ...


class MockPipeline:
    """Placeholder pipeline. Returns a deterministic ExtractionResult (no real model)."""

    def extract(self, content: bytes, filename: str) -> ExtractionResult:
        raise NotImplementedError


def get_pipeline() -> Pipeline:
    """FastAPI dependency: return the active pipeline (override in tests / swap in Phase 2)."""
    raise NotImplementedError
