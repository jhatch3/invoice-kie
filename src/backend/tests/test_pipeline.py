"""Unit tests for the pipeline layer."""

from __future__ import annotations

from app.extraction.pipeline import MockPipeline
from app.extraction.schemas import ExtractionResult


def test_mock_pipeline_returns_target_schema() -> None:
    result = MockPipeline().extract(b"pdf-bytes", "receipt.pdf")
    assert isinstance(result, ExtractionResult)
    assert result.total is not None
    assert len(result.line_items) >= 1


def test_mock_pipeline_is_deterministic() -> None:
    a = MockPipeline().extract(b"one", "a.pdf")
    b = MockPipeline().extract(b"two", "b.pdf")
    assert a == b
