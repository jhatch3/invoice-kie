# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A **reproducible document-KIE benchmark**: fine-tune **LayoutLMv3** for field + line-item
extraction on public receipts and compare it against a **zero-shot open VLM (Qwen2-VL)** on
accuracy, latency, and estimated cost. Public data, open weights, no paid APIs. Framed honestly as
receipt/document KIE that transfers to invoices — not a SOTA invoice claim.

The authoritative design is `docs/superpowers/specs/2026-07-18-invoice-kie-cord-benchmark-design.md`.

## Project state (ground truth)

- **Phase 1 (done): data.** `data/load_data.py` downloads **CORD v2** (`naver-clova-ix/cord-v2`)
  and writes `data/cord/` (git-ignored): `raw/{split}.parquet`, `processed/{split}.jsonl` (the
  target schema), and `samples/*.png`.
- **Phases 2-4 (not built): prep → train → eval → wire-up.** `src/backend/` is where the Python
  prep/train/eval and the Qwen2-VL runner will live; it is currently mostly empty.
- **Frontend (built): `src/frontend/`** — a Next.js App Router demo that shows the pipeline and a
  benchmark table. Benchmark numbers are **illustrative placeholders** until Phase 3 emits a real
  `results.json`.

## Target schema (both systems must emit this)

```json
{ "subtotal": "…|null", "tax": "…|null", "total": "…|null",
  "line_items": [ { "name": "…", "qty": "…", "unit_price": "…", "price": "…" } ] }
```
Header fields come from CORD `gt_parse.sub_total` / `gt_parse.total`; line items from `gt_parse.menu`.

## Commands

### Python (repo root)
- Python 3.12. `pip install -r requirements.txt`
- Load + store the dataset locally: `python data/load_data.py`

### Frontend (`cd src/frontend`)
- Install `npm install` · Dev `npm run dev` (http://localhost:3000) · Build `npm run build`
- Lint `npm run lint` · Sample receipt PDFs `npm run gen:samples`
- Stack: Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui. Editorial monochrome look
  driven by the `.claude/skills/antislop-saas` skill. One component per file under
  `src/frontend/components/` (landing/, demo/, ui/); non-visual code in `src/frontend/lib/`.

## Layout notes

- `data/` holds the loader and the git-ignored `cord/` cache.
- The Python benchmark (root / `src/backend`) and the Next.js frontend (`src/frontend/`) are
  separate stacks with their own tooling.
- Frontend extraction is currently **mocked** via a Next.js Route Handler (`app/api/extract`); it
  is a stub, not the real model. It returns the target schema so the demo works before the backend
  exists.
