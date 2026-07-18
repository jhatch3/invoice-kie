"""Tests for CORD -> LayoutLMv3 feature preprocessing."""

from __future__ import annotations

from app.extraction.labels import label_maps
from app.extraction.preprocess import cord_to_features, normalize_bbox, quad_to_bbox


def test_quad_to_bbox_takes_min_max() -> None:
    quad = {"x1": 100, "y1": 200, "x2": 300, "y2": 205, "x3": 300, "y3": 260, "x4": 100, "y4": 258}
    assert quad_to_bbox(quad) == [100, 200, 300, 260]


def test_normalize_bbox_scales_and_clamps() -> None:
    # width 1000 -> x unchanged; height 2000 -> y halved.
    assert normalize_bbox([100, 200, 300, 260], 1000, 2000) == [100, 100, 300, 130]
    # values beyond the page clamp to 1000.
    assert normalize_bbox([0, 0, 5000, 5000], 1000, 1000) == [0, 0, 1000, 1000]


def test_cord_to_features_aligns_words_boxes_labels() -> None:
    label2id, _ = label_maps()
    gt = {
        "meta": {"image_size": {"width": 1000, "height": 2000}},
        "valid_line": [
            {
                "category": "menu.nm",
                "words": [
                    {"quad": _quad(100, 200, 300, 260), "text": "COFFEE"},
                    {"quad": _quad(320, 200, 400, 260), "text": "LATTE"},
                ],
            },
            {
                "category": "total.total_price",
                "words": [{"quad": _quad(500, 1000, 700, 1060), "text": "50,000"}],
            },
        ],
    }

    feats = cord_to_features(gt)

    assert feats["words"] == ["COFFEE", "LATTE", "50,000"]
    assert feats["labels"] == [
        label2id["B-menu.nm"],
        label2id["I-menu.nm"],
        label2id["B-total.total_price"],
    ]
    assert feats["boxes"][0] == [100, 100, 300, 130]  # y halved by height=2000
    assert feats["boxes"][2] == [500, 500, 700, 530]
    assert len(feats["words"]) == len(feats["boxes"]) == len(feats["labels"])


def test_cord_to_features_skips_empty_words_and_accepts_json_string() -> None:
    import json

    gt = {
        "meta": {"image_size": {"width": 100, "height": 100}},
        "valid_line": [
            {
                "category": "menu.nm",
                "words": [
                    {"quad": _quad(0, 0, 10, 10), "text": "  "},  # empty -> skipped
                    {"quad": _quad(0, 0, 10, 10), "text": "TEA"},
                ],
            }
        ],
    }
    feats = cord_to_features(json.dumps(gt))
    # First real word becomes the B- tag even though an empty word preceded it.
    label2id, _ = label_maps()
    assert feats["words"] == ["TEA"]
    assert feats["labels"] == [label2id["B-menu.nm"]]


def _quad(x0: int, y0: int, x1: int, y1: int) -> dict:
    """Axis-aligned quad from a top-left / bottom-right corner."""
    return {"x1": x0, "y1": y0, "x2": x1, "y2": y0, "x3": x1, "y3": y1, "x4": x0, "y4": y1}
