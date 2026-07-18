"""CORD label schema for LayoutLMv3 token classification.

The model is trained on the full CORD category set as BIO tags; at decode time only a handful of
categories map to the API's target fields (subtotal / tax / total / line items). The category
list is frozen here (derived from naver-clova-ix/cord-v2) so the label ids are stable across
train, eval, and serve.
"""

from __future__ import annotations

# Frozen CORD-v2 category set (29 categories), sorted for a deterministic id assignment.
CORD_CATEGORIES: tuple[str, ...] = (
    "menu.cnt",
    "menu.discountprice",
    "menu.etc",
    "menu.itemsubtotal",
    "menu.nm",
    "menu.num",
    "menu.price",
    "menu.sub.cnt",
    "menu.sub.nm",
    "menu.sub.price",
    "menu.sub.unitprice",
    "menu.unitprice",
    "menu.vatyn",
    "sub_total.discount_price",
    "sub_total.etc",
    "sub_total.othersvc_price",
    "sub_total.service_price",
    "sub_total.subtotal_price",
    "sub_total.tax_price",
    "total.cashprice",
    "total.changeprice",
    "total.creditcardprice",
    "total.emoneyprice",
    "total.menuqty_cnt",
    "total.menutype_cnt",
    "total.total_etc",
    "total.total_price",
    "void_menu.nm",
    "void_menu.price",
)

# The outside tag.
OUTSIDE = "O"

# CORD category -> API target field. Categories absent here are not part of the output schema.
TARGET_FIELD_BY_CATEGORY: dict[str, str] = {
    "menu.nm": "name",
    "menu.cnt": "qty",
    "menu.unitprice": "unit_price",
    "menu.price": "price",
    "sub_total.subtotal_price": "subtotal",
    "sub_total.tax_price": "tax",
    "total.total_price": "total",
}


def build_label_list(categories: tuple[str, ...] = CORD_CATEGORIES) -> list[str]:
    """Return BIO labels: ['O', 'B-<cat>', 'I-<cat>', ...] with 'O' at index 0."""
    labels = [OUTSIDE]
    for category in categories:
        labels.append(f"B-{category}")
        labels.append(f"I-{category}")
    return labels


def label_maps(
    labels: list[str] | None = None,
) -> tuple[dict[str, int], dict[int, str]]:
    """Return (label2id, id2label) for the given (or default) label list."""
    labels = labels or build_label_list()
    label2id = {label: i for i, label in enumerate(labels)}
    id2label = {i: label for label, i in label2id.items()}
    return label2id, id2label


def bio_tag(category: str, is_first: bool) -> str:
    """BIO tag for a word: 'B-<cat>' for the first word of a line, else 'I-<cat>'.

    Unknown categories fall back to the outside tag 'O'.
    """
    if category not in CORD_CATEGORIES:
        return OUTSIDE
    return f"{'B' if is_first else 'I'}-{category}"


def target_field(category: str) -> str | None:
    """API target field for a CORD category, or None if it isn't part of the output schema."""
    return TARGET_FIELD_BY_CATEGORY.get(category)
