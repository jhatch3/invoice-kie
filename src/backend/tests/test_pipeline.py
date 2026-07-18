"""Unit tests for the pipeline layer."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.skip(reason="wireframe — implement in Phase 5 (TDD)")


def test_mock_pipeline_returns_target_schema() -> None:
    """MockPipeline.extract returns a valid ExtractionResult (fields + line items)."""
    raise NotImplementedError


def test_mock_pipeline_is_deterministic() -> None:
    """MockPipeline.extract returns the same result for the same input."""
    raise NotImplementedError
