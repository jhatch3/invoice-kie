"""Tests for POST /extract (public single-document endpoint)."""

from __future__ import annotations

from httpx import AsyncClient


def _pdf(name: str = "receipt.pdf", content: bytes = b"%PDF-1.4 fake") -> dict:
    return {"file": (name, content, "application/pdf")}


async def test_extract_returns_result_for_valid_pdf(client: AsyncClient) -> None:
    resp = await client.post("/extract", files=_pdf())
    assert resp.status_code == 200
    body = resp.json()
    assert body["source_file"] == "receipt.pdf"
    assert body["result"]["total"] == "11.00"
    assert body["result"]["line_items"][0]["name"] == "Widget"


async def test_extract_rejects_unsupported_type(client: AsyncClient) -> None:
    resp = await client.post("/extract", files={"file": ("x.txt", b"hi", "text/plain")})
    assert resp.status_code == 415


async def test_extract_rejects_empty_file(client: AsyncClient) -> None:
    resp = await client.post("/extract", files={"file": ("empty.pdf", b"", "application/pdf")})
    assert resp.status_code == 400


async def test_extract_requires_file(client: AsyncClient) -> None:
    resp = await client.post("/extract")
    assert resp.status_code == 422
