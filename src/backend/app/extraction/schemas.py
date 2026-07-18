"""Pydantic schemas for the extraction API — the CORD target schema.

Amounts are strings (matching CORD ground truth); `null` means the field was not found.
These are the wire contract; the LayoutLMv3 pipeline and the VLM baseline both emit
`ExtractionResult`.
"""

from __future__ import annotations

from pydantic import BaseModel


class LineItem(BaseModel):
    name: str | None = None
    qty: str | None = None
    unit_price: str | None = None
    price: str | None = None


class ExtractionResult(BaseModel):
    subtotal: str | None = None
    tax: str | None = None
    total: str | None = None
    currency: str = "USD"
    confidence: float = 0.0
    line_items: list[LineItem] = []


class ExtractResponse(BaseModel):
    """Envelope returned by the extract endpoints."""

    source_file: str
    model_version: str
    result: ExtractionResult
