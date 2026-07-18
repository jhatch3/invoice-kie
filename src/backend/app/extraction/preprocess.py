"""Turn a CORD document into the words / boxes / label-ids LayoutLMv3 consumes.

This module handles the pure, dependency-free part of preprocessing: reading CORD's
`valid_line` word annotations into aligned lists of words, normalized boxes (0-1000), and BIO
label ids. The LayoutLMv3Processor encode step (which needs transformers/torch) is added in
Phase 2b and consumes the output of `cord_to_features`.
"""

from __future__ import annotations

import json
from typing import TypedDict

from app.extraction.labels import bio_tag, label_maps


class Features(TypedDict):
    words: list[str]
    boxes: list[list[int]]  # [x0, y0, x1, y1], each 0..1000
    labels: list[int]  # BIO label ids


def quad_to_bbox(quad: dict) -> list[int]:
    """Convert a CORD quad (x1..x4, y1..y4) to an axis-aligned [x0, y0, x1, y1] box."""
    xs = [quad["x1"], quad["x2"], quad["x3"], quad["x4"]]
    ys = [quad["y1"], quad["y2"], quad["y3"], quad["y4"]]
    return [min(xs), min(ys), max(xs), max(ys)]


def normalize_bbox(bbox: list[int], width: int, height: int) -> list[int]:
    """Scale a pixel box to LayoutLMv3's 0..1000 coordinate space, clamped."""

    def scale(value: int, size: int) -> int:
        if size <= 0:
            return 0
        return max(0, min(1000, round(value * 1000 / size)))

    x0, y0, x1, y1 = bbox
    return [scale(x0, width), scale(y0, height), scale(x1, width), scale(y1, height)]


def cord_to_features(ground_truth: str | dict) -> Features:
    """Read a CORD `ground_truth` into aligned words, normalized boxes, and BIO label ids."""
    gt = json.loads(ground_truth) if isinstance(ground_truth, str) else ground_truth
    size = gt.get("meta", {}).get("image_size", {})
    width, height = int(size.get("width", 0)), int(size.get("height", 0))
    label2id, _ = label_maps()

    words: list[str] = []
    boxes: list[list[int]] = []
    labels: list[int] = []

    for line in gt.get("valid_line", []):
        category = line.get("category", "")
        line_words = [w for w in line.get("words", []) if (w.get("text") or "").strip()]
        for i, word in enumerate(line_words):
            tag = bio_tag(category, is_first=(i == 0))
            words.append(word["text"])
            boxes.append(normalize_bbox(quad_to_bbox(word["quad"]), width, height))
            labels.append(label2id[tag])

    return {"words": words, "boxes": boxes, "labels": labels}
