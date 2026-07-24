"""Unit tests for the valid_image_upload dependency."""

from __future__ import annotations

import io

import pytest
from starlette.datastructures import Headers, UploadFile

from app.chat.dependencies import valid_image_upload
from app.chat.exceptions import EmptyImage, ImageTooLarge, UnsupportedImageType


def _upload(data: bytes = b"pngbytes", name: str = "r.png", ctype: str = "image/png") -> UploadFile:
    return UploadFile(
        file=io.BytesIO(data),
        filename=name,
        headers=Headers({"content-type": ctype}),
    )


async def test_accepts_png() -> None:
    filename, media_type, content = await valid_image_upload(_upload())
    assert filename == "r.png"
    assert media_type == "image/png"
    assert content == b"pngbytes"


async def test_accepts_jpeg() -> None:
    _, media_type, _ = await valid_image_upload(_upload(name="r.jpg", ctype="image/jpeg"))
    assert media_type == "image/jpeg"


async def test_rejects_non_image() -> None:
    with pytest.raises(UnsupportedImageType):
        await valid_image_upload(_upload(ctype="text/plain"))


async def test_rejects_pdf() -> None:
    with pytest.raises(UnsupportedImageType):
        await valid_image_upload(_upload(ctype="application/pdf"))


async def test_rejects_empty() -> None:
    with pytest.raises(EmptyImage):
        await valid_image_upload(_upload(data=b""))


async def test_rejects_too_large() -> None:
    with pytest.raises(ImageTooLarge):
        await valid_image_upload(_upload(data=b"x" * 4_500_001))
