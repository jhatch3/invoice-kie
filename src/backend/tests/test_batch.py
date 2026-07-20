"""Tests for POST /internal/extract-batch (hidden internal endpoint)."""

from __future__ import annotations

from httpx import AsyncClient


async def test_batch_returns_one_result_per_file(client: AsyncClient) -> None:
    files = [
        ("files", ("a.pdf", b"%PDF a", "application/pdf")),
        ("files", ("b.pdf", b"%PDF b", "application/pdf")),
    ]
    resp = await client.post("/internal/extract-batch", files=files)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 2
    assert [item["source_file"] for item in body] == ["a.pdf", "b.pdf"]


async def test_batch_hidden_from_openapi(client: AsyncClient) -> None:
    schema = (await client.get("/openapi.json")).json()
    assert "/internal/extract-batch" not in schema["paths"]
    assert "/extract" in schema["paths"]
