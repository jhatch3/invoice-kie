"""Build an encoded HF Dataset from CORD for LayoutLMv3 token classification.

Reads the local CORD parquet (image + ground_truth), turns each doc into words / boxes / BIO
label ids via `cord_to_features`, then runs the LayoutLMv3Processor (apply_ocr=False) to produce
input_ids / attention_mask / bbox / pixel_values / labels.

Encoding happens through `Dataset.map(batched=...)` so only a few images are decoded at a time and
the encoded features stream to Arrow on disk — full-resolution receipts are never all held in RAM
at once.
"""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

import pandas as pd
from datasets import Dataset
from PIL import Image

from app.extraction.preprocess import cord_to_features


def _image_bytes(cell: Any) -> bytes:
    """Extract the raw (compressed) image bytes from a parquet image cell."""
    if isinstance(cell, dict) and "bytes" in cell:
        return cell["bytes"]
    if isinstance(cell, (bytes, bytearray)):
        return bytes(cell)
    # Already a PIL image — re-encode to PNG bytes.
    buf = io.BytesIO()
    cell.save(buf, format="PNG")
    return buf.getvalue()


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
    df = pd.read_parquet(data_dir / f"{split}.parquet")
    if limit is not None:
        df = df.head(limit)

    # Keep only compressed bytes + lightweight annotations in memory.
    rows: dict[str, list] = {"image_bytes": [], "words": [], "boxes": [], "labels": []}
    for _, row in df.iterrows():
        feats = cord_to_features(row["ground_truth"])
        if not feats["words"]:
            continue
        rows["image_bytes"].append(_image_bytes(row["image"]))
        rows["words"].append(feats["words"])
        rows["boxes"].append(feats["boxes"])
        rows["labels"].append(feats["labels"])

    base = Dataset.from_dict(rows)

    def encode(batch: dict[str, list]) -> dict:
        images = [Image.open(io.BytesIO(b)).convert("RGB") for b in batch["image_bytes"]]
        return processor(
            images,
            batch["words"],
            boxes=batch["boxes"],
            word_labels=batch["labels"],
            truncation=True,
            padding="max_length",
            max_length=max_length,
        )

    ds = base.map(encode, batched=True, batch_size=batch_size, remove_columns=base.column_names)
    ds.set_format("torch")
    return ds
