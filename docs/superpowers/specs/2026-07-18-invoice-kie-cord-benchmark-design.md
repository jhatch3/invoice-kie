# invoice-kie — Reproducible Document-KIE Benchmark (CORD)

**Date:** 2026-07-18
**Status:** Approved (brainstorming) — active project spec
**Supersedes:** the earlier "fine-tune LayoutLMv3 on invoice PDFs vs. GPT-4o" framing in the
original README.

## What this project is now

A **reproducible key-information-extraction (KIE) benchmark** on public receipt documents:
fine-tune **LayoutLMv3** for field + line-item extraction and compare it head-to-head against a
**zero-shot open VLM (Qwen2-VL)** on accuracy, latency, and (estimated) cost. Everything runs on
public data with open weights — no paid APIs, no gated datasets.

Positioned honestly as **document/receipt KIE that transfers to invoices** (not a claim of
state-of-the-art invoice extraction). The existing Next.js frontend demos the pipeline and shows
the benchmark table.

## Why this framing

The cleanest, viewer-enabled, permissively licensed KIE data on Hugging Face is receipts (CORD,
SROIE), not invoices. Real invoice datasets (DocILE) are larger, gated, and non-commercial. For a
reproducible portfolio project, receipts give a defensible, rerunnable story; invoices (DocILE)
are documented as a future phase.

## Dataset — CORD v2

- **Source:** `naver-clova-ix/cord-v2` (Hugging Face, Parquet, CC-BY-4.0).
- **Size:** 800 train / 100 validation / 100 test receipts.
- **Columns:** `image`, `ground_truth` (JSON string with `gt_parse`).
- **Target schema** (both systems must emit this):
  ```json
  {
    "subtotal": "string|null",
    "tax": "string|null",
    "total": "string|null",
    "line_items": [ { "name": "...", "qty": "...", "unit_price": "...", "price": "..." } ]
  }
  ```
  Header fields come from `gt_parse.sub_total` (`subtotal_price`, `tax_price`) and
  `gt_parse.total` (`total_price`); line items from `gt_parse.menu` (`nm`, `cnt`, `unitprice`,
  `price`).
- **LayoutLMv3 token labels:** derived from CORD word-level annotations (`valid_line` word boxes +
  categories); fallback is aligning `gt_parse` values to OCR tokens by string match.

### Local data (this milestone)
`data/load_data.py` downloads all splits and writes, under `data/cord/` (git-ignored):
- `raw/{split}.parquet` — full split as downloaded (image + ground_truth).
- `processed/{split}.jsonl` — the target schema per document.
- `samples/*.png` — a few decoded receipts for a sanity check.

A secondary `data/load_sroie.ipynb` keeps the SROIE header-field set available for cross-dataset
sanity checks.

## Systems compared

1. **LayoutLMv3 (fine-tuned)** — token classification on CORD; decode token labels, assemble the
   target JSON.
2. **Qwen2-VL (zero-shot)** — prompt the receipt image to emit the target JSON directly; parse it.
   Open weights, run locally.

Both consume the same test split and must produce the same schema, so scores are comparable.

## Metrics (identical protocol for both systems)

- **Field F1** — per-field and macro over `{subtotal, tax, total}`. Exact match after
  normalization (amounts parsed to numbers; case/whitespace folded).
- **Line-item F1** — greedily match predicted↔gold rows (by name similarity), then score field
  matches across `{name, qty, unit_price, price}`.
- **Latency** — median ms/doc, batch size 1, one fixed GPU.
- **Cost / 1k docs** — *estimate* = median seconds/doc × 1000 ÷ 3600 × assumed GPU $/hr (rate
  stated in a footnote). No real spend.

Evaluation is seeded and run on the CORD **test** split (100 docs).

## Architecture / components

```
data/
  load_data.py            download + store CORD locally (this milestone)
  load_sroie.ipynb        secondary: SROIE header fields
  cord/                   git-ignored local data (raw/ processed/ samples/)
src/backend/              Python (future phases)
  prep/                   CORD JSON -> LayoutLMv3 token labels
  train/                  fine-tune LayoutLMv3
  eval/                   run both systems, compute metrics -> results.json
  vlm/                    Qwen2-VL zero-shot runner
src/frontend/             existing Next.js demo; Benchmark section reflects results.json
```

## Phasing

1. **Data (now):** load + store CORD locally; target-schema extraction. *(this milestone)*
2. **Prep + train:** CORD → token labels; fine-tune LayoutLMv3; field/line-item decoder.
3. **Baseline + eval:** Qwen2-VL zero-shot runner; shared metrics; emit `results.json`.
4. **Wire-up:** frontend Benchmark section shows real numbers; README reproduction steps.
5. **Future:** DocILE (real invoices) as a follow-on dataset.

## What changes in the repo

- **README** rewritten to the CORD benchmark framing with real reproduction steps.
- **CLAUDE.md** updated to describe the new direction (receipts/CORD, not aspirational invoices).
- **requirements.txt** focused on the actual stack (datasets, transformers, torch, qwen-vl-utils,
  seqeval/evaluate, pandas/pyarrow, pillow).
- **Frontend** copy softened from "invoice" to "document/receipt KIE (transfers to invoices)";
  Benchmark numbers become real once phase 3 lands (kept illustrative until then, with the
  existing footnote).
- **`.gitignore`** excludes `data/cord/` (multi-GB local data).

## Non-goals

- No paid-API baselines (GPT-4o) in the core benchmark.
- No claim of SOTA invoice extraction.
- No DocILE in the reproducible path (documented as future).

## Open decisions (resolved)

- Framing: reproducible portfolio demo on public receipts.
- Dataset: CORD v2 (fields + line items).
- Baseline: zero-shot Qwen2-VL (open, free); cost is an estimate from GPU-time.
