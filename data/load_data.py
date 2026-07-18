"""Load the CORD-v2 receipt KIE dataset from the Hugging Face Hub and store it locally.

CORD (naver-clova-ix/cord-v2, CC-BY-4.0) is a clean, viewer-enabled Parquet dataset of
1,000 receipts with header fields and line items. This is the anchor dataset for the
invoice-kie document-KIE benchmark.

Outputs (all under data/cord/, git-ignored):
  raw/{split}.parquet        the full split as downloaded (image + ground_truth)
  processed/{split}.jsonl    the target schema per document (subtotal/tax/total + line_items)
  samples/*.png              a few decoded receipt images for a sanity check

Run:  python data/load_data.py
"""

from __future__ import annotations

import json
from pathlib import Path

from datasets import load_dataset

DATASET = "naver-clova-ix/cord-v2"
OUT = Path(__file__).resolve().parent / "cord"


def target_schema(ground_truth: str) -> dict:
    """Reduce a CORD ground_truth string to the benchmark's target fields."""
    gt = json.loads(ground_truth).get("gt_parse", {}) or {}

    sub = gt.get("sub_total") or {}
    if isinstance(sub, list):
        sub = sub[0] if sub else {}
    total = gt.get("total") or {}
    if isinstance(total, list):
        total = total[0] if total else {}

    menu = gt.get("menu", [])
    if isinstance(menu, dict):
        menu = [menu]
    line_items = [
        {
            "name": m.get("nm"),
            "qty": m.get("cnt"),
            "unit_price": m.get("unitprice"),
            "price": m.get("price"),
        }
        for m in menu
        if isinstance(m, dict)
    ]

    return {
        "subtotal": sub.get("subtotal_price"),
        "tax": sub.get("tax_price"),
        "total": total.get("total_price"),
        "line_items": line_items,
    }


def main() -> None:
    (OUT / "raw").mkdir(parents=True, exist_ok=True)
    (OUT / "processed").mkdir(parents=True, exist_ok=True)
    (OUT / "samples").mkdir(parents=True, exist_ok=True)

    print(f"loading {DATASET} from the Hub ...", flush=True)
    ds = load_dataset(DATASET)  # DatasetDict: train / validation / test
    print(f"splits: { {k: len(v) for k, v in ds.items()} }", flush=True)

    total_items = 0
    for split, dset in ds.items():
        # 1) raw split (image + ground_truth) as parquet
        dset.to_parquet(str(OUT / "raw" / f"{split}.parquet"))

        # 2) processed target schema
        out_path = OUT / "processed" / f"{split}.jsonl"
        n_items = 0
        with out_path.open("w", encoding="utf-8") as fh:
            for i, gt in enumerate(dset["ground_truth"]):
                record = {"id": f"{split}-{i}", **target_schema(gt)}
                n_items += len(record["line_items"])
                fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        total_items += n_items
        print(f"[{split}] {len(dset)} docs -> {out_path.name} ({n_items} line items)", flush=True)

    # 3) a few sample images for a visual check
    for i in range(min(3, len(ds["train"]))):
        ds["train"][i]["image"].save(OUT / "samples" / f"train-{i}.png")
    print(f"[samples] saved images", flush=True)

    print(f"\nDone. {total_items} line items total. Data stored under {OUT}", flush=True)


if __name__ == "__main__":
    main()
