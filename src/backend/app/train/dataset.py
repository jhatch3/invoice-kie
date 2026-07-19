"""Build an encoded HF Dataset from CORD for LayoutLMv3 token classification.

The CORD parquet is read as a memory-mapped HF Dataset and everything — parsing ground truth,
decoding images, running LayoutLMv3Processor (apply_ocr=False) — happens inside a streaming
`.map(batched=...)`. Nothing is materialized in RAM for the whole split, so this scales to the
full 800-doc train split (the earlier dict-based build OOM'd on fingerprint pickling).
"""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

from datasets import Dataset
from PIL import Image as PILImage

from app.extraction.preprocess import cord_to_features


def _to_pil(cell: Any) -> PILImage.Image:
    """Decode a parquet image cell (PIL image, or a {bytes,...} struct) to RGB."""
    if isinstance(cell, PILImage.Image):
        return cell.convert("RGB")
    if isinstance(cell, dict) and cell.get("bytes"):
        return PILImage.open(io.BytesIO(cell["bytes"])).convert("RGB")
    if isinstance(cell, (bytes, bytearray)):
        return PILImage.open(io.BytesIO(cell)).convert("RGB")
    raise TypeError(f"Unsupported image cell type: {type(cell)!r}")


def build_dataset(
    split: str,
    processor: Any,
    data_dir: Path,
    limit: int | None = None,
    max_length: int = 512,
    batch_size: int = 4,
) -> Dataset:
    """Return an encoded, torch-formatted Dataset for the given CORD split.

    Peak memory is bounded to ~`batch_size` decoded images regardless of split size.
    """
    ds = Dataset.from_parquet(str(data_dir / f"{split}.parquet"))
    if limit is not None:
        ds = ds.select(range(min(limit, len(ds))))

    # Drop docs with no labelled words so the processor never sees empty input.
    ds = ds.filter(
        lambda gt: bool(cord_to_features(gt)["words"]),
        input_columns=["ground_truth"],
    )

    def encode(batch: dict[str, list]) -> dict:
        feats = [cord_to_features(gt) for gt in batch["ground_truth"]]
        images = [_to_pil(cell) for cell in batch["image"]]
        return processor(
            images,
            [f["words"] for f in feats],
            boxes=[f["boxes"] for f in feats],
            word_labels=[f["labels"] for f in feats],
            truncation=True,
            padding="max_length",
            max_length=max_length,
        )

    encoded = ds.map(encode, batched=True, batch_size=batch_size, remove_columns=ds.column_names)
    encoded.set_format("torch")
    return encoded
