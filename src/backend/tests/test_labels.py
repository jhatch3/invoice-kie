"""Tests for the CORD label schema."""

from __future__ import annotations

from app.extraction.labels import (
    CORD_CATEGORIES,
    build_label_list,
    bio_tag,
    label_maps,
    target_field,
)


def test_label_list_has_outside_first_and_bio_pairs() -> None:
    labels = build_label_list()
    assert labels[0] == "O"
    assert len(labels) == 1 + 2 * len(CORD_CATEGORIES)
    assert "B-menu.nm" in labels
    assert "I-menu.nm" in labels


def test_label_maps_round_trip() -> None:
    label2id, id2label = label_maps()
    for label, i in label2id.items():
        assert id2label[i] == label
    assert label2id["O"] == 0


def test_bio_tag_first_vs_inside_and_unknown() -> None:
    assert bio_tag("menu.nm", is_first=True) == "B-menu.nm"
    assert bio_tag("menu.nm", is_first=False) == "I-menu.nm"
    # Categories not in the frozen set fall back to O.
    assert bio_tag("menu.not_a_real_category", is_first=True) == "O"


def test_target_field_mapping() -> None:
    assert target_field("menu.price") == "price"
    assert target_field("sub_total.tax_price") == "tax"
    assert target_field("total.total_price") == "total"
    assert target_field("menu.etc") is None
