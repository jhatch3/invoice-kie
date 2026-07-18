# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state: aspirational vs. implemented

Read this first — the docs describe a project that does not exist yet.

- **`README.md` and `requirements.txt` are aspirational.** They describe the intended
  product: fine-tune LayoutLMv3 to extract fields (total, tax, subtotal, date, invoice
  number) from invoice PDFs, and benchmark it against a zero-shot VLM (Qwen2-VL / GPT-4o)
  on the CORD and DocILE datasets. **None of this is built.** There is no `invoice_kie`
  package, no `train` module, no `tests/` directory, and the benchmark table is empty.
- **What actually exists** is two pieces of scaffolding:
  - `main.py` — a Python 3.12 hello-world stub. `pyproject.toml` declares `dependencies = []`
    (the real deps in `requirements.txt` are *planned*, not installed).
  - `src/frontend/` — a freshly generated Vue 3 + Vite + TypeScript app (empty router,
    default counter store, template README). No invoice-specific UI yet.

When asked to "add a feature," clarify whether it belongs to the Python ML pipeline
(mostly greenfield) or the Vue frontend (scaffold), and don't assume README commands like
`python -m invoice_kie.train` work — they don't until that module is written.

## Commands

### Python (repo root)
- Python 3.12 (`.python-version`). Deps are currently empty in `pyproject.toml`.
- Run the stub: `python main.py`
- The README's `pip install -e .` / `pytest` / `python -m invoice_kie.train` are for the
  future pipeline and will fail today.

### Frontend (`cd src/frontend`)
- Install: `npm install`
- Dev server: `npm run dev`
- Build (runs type-check + build): `npm run build`
- Type-check only: `npm run type-check` (uses `vue-tsc`, not plain `tsc`, for `.vue` types)
- Unit tests (Vitest): `npm run test:unit`
  - Single file: `npm run test:unit -- src/__tests__/App.spec.ts`
- E2E tests (Cypress): `npm run test:e2e:dev` (against dev server) or `npm run test:e2e`
  (against production preview build)
- Lint: `npm run lint` (runs oxlint then eslint, both with `--fix`)
- Format: `npm run format` (Prettier)

## Architecture

### Intended data flow (Python, not yet implemented)
`PDF → OCR (tokens + layout via Tesseract/PaddleOCR) → LayoutLMv3 token tagging → normalized JSON`,
with a parallel zero-shot VLM path for the accuracy/latency/cost benchmark. Requires system
Tesseract and poppler when built.

### Frontend (`src/frontend/`)
Standard Vue 3 SFC app: entry `src/main.ts` mounts `App.vue` with Pinia + vue-router.
`src/router/index.ts` currently has an empty `routes: []`. Notable: this uses the **Vue
beta** channel (pinned via `overrides` in `package.json`), Vite 8, and Node `^22.18 || >=24.12`.

## Layout notes
- The Python pipeline and the Vue frontend are separate stacks in one repo (root vs.
  `src/frontend/`), each with its own tooling and dependency management.
- `data/` is empty (intended for datasets). `node_modules/` exists at the repo root but the
  root `package.json`/`package-lock.json` are essentially empty — real JS work happens in
  `src/frontend/`.
