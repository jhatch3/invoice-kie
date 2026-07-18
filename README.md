# invoice-kie

A reproducible **key-information-extraction (KIE)** benchmark on public receipt documents.
Fine-tune **LayoutLMv3** for field + line-item extraction and compare it head-to-head against a
**zero-shot open vision-language model (Qwen2-VL)** on accuracy, latency, and estimated cost.

Everything runs on public data with open weights: **no paid APIs, no gated datasets.** The work
is framed honestly as document/receipt KIE that transfers to invoices, not a claim of
state-of-the-art invoice extraction.

## Dataset

**CORD v2** — [`naver-clova-ix/cord-v2`](https://huggingface.co/datasets/naver-clova-ix/cord-v2)
(Hugging Face, Parquet, CC-BY-4.0): 800 train / 100 validation / 100 test receipts, each with an
`image` and a `ground_truth` JSON parse.

Every system in the benchmark produces the same target schema:

```json
{
  "subtotal": "string|null",
  "tax": "string|null",
  "total": "string|null",
  "line_items": [ { "name": "...", "qty": "...", "unit_price": "...", "price": "..." } ]
}
```

Header fields come from `gt_parse.sub_total` / `gt_parse.total`; line items from `gt_parse.menu`.

### Load and store the data locally

```sh
pip install -r requirements.txt
python data/load_data.py
```

This downloads all splits and writes, under `data/cord/` (git-ignored):

- `raw/{split}.parquet` — the full split as downloaded (image + ground_truth)
- `processed/{split}.jsonl` — the target schema per document
- `samples/*.png` — a few decoded receipts for a sanity check

## Systems compared

1. **LayoutLMv3 (fine-tuned)** — token classification on CORD; decode token labels into the
   target JSON.
2. **Qwen2-VL (zero-shot)** — prompt the receipt image to emit the target JSON directly. Open
   weights, run locally.

Both consume the same test split and emit the same schema, so scores are comparable.

## Metrics

| Metric | Definition |
|--------|------------|
| **Field F1** | Per-field and macro over `subtotal / tax / total`, exact match after normalization. |
| **Line-item F1** | Greedily match predicted rows to gold, then score `name / qty / unit_price / price`. |
| **Latency** | Median ms/doc, batch size 1, one fixed GPU. |
| **Cost / 1k docs** | Estimate: latency times an assumed GPU hourly rate (no real spend). |

Evaluation is seeded and run on the CORD **test** split (100 receipts).

## Status

- [x] **Phase 1 — Data:** load + store CORD locally, target-schema extraction (`data/load_data.py`).
- [ ] **Phase 2 — Prep + train:** CORD to LayoutLMv3 token labels; fine-tune; field/line-item decoder.
- [ ] **Phase 3 — Baseline + eval:** Qwen2-VL zero-shot runner; shared metrics to `results.json`.
- [ ] **Phase 4 — Wire-up:** frontend Benchmark section reflects real `results.json`.
- [ ] **Future:** DocILE (real invoices) as a follow-on dataset.

Benchmark numbers shown in the frontend are **illustrative placeholders** until Phase 3 lands.

## Repository layout

```
data/
  load_data.py       download + store CORD locally
  cord/              git-ignored local data (raw/ processed/ samples/)
src/backend/         Python: prep, train, eval, Qwen2-VL runner (phases 2-3)
src/frontend/        Next.js demo + benchmark UI
```

## Frontend

A Next.js (App Router) demo that shows the pipeline stages and the benchmark table. From
`src/frontend/`:

```sh
npm install
npm run dev      # http://localhost:3000
```

## License

Code: MIT. CORD data: CC-BY-4.0 (see the dataset card).
