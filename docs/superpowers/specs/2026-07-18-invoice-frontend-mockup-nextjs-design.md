# Invoice-kie Frontend Mockup — Design (Next.js)

**Date:** 2026-07-18
**Status:** Approved (brainstorming)
**Supersedes:** `2026-07-18-invoice-frontend-mockup-design.md` (Vue version)
**Stack:** Next.js 15 (App Router) + React 19 + TypeScript (strict), replacing the Vue scaffold in `src/frontend/`.

## Goal

A single-page frontend mockup for invoice-kie that lets a user **see the full extraction
pipeline end-to-end** before any real backend exists:

1. Download a bundled test invoice PDF.
2. Upload that PDF back into the app.
3. Run it — the app POSTs the PDF to a **stubbed Route Handler** that returns the extracted
   fields (total, tax, subtotal, date, invoice number), which populate a results table.

The table starts blank. The extraction call is a real HTTP endpoint (`POST /api/extract`)
whose handler currently returns mock data; swapping in the real LayoutLMv3 backend later means
changing only the handler body — no UI changes.

## Non-goals

- No real ML/OCR pipeline (the backend does not exist yet).
- No authentication, persistence, or multi-user features.
- No production deployment config.

## Framework decisions

- **Next.js App Router**, React Server Components by default; `"use client"` only on the
  interactive leaves (upload, run, results). Replaces the Vue scaffold at `src/frontend/`.
- **Stubbed API = Route Handler** (`app/api/extract/route.ts`) returning mock JSON after a
  ~1.2s delay. No MSW, no TanStack Query — the "run" is a one-shot mutation via `fetch`.
- Client run-state is plain React state in one client component (`ExtractionWorkbench`); no
  global store needed at this scale.

## Architecture

```
app/
  layout.tsx           Root layout: <html>, tokens.css, theme setup
  page.tsx             Server component: AppHeader + PipelineDiagram + SampleDownload
                       + <ExtractionWorkbench/> (client island)
  api/extract/route.ts POST handler: parse multipart, return mock ExtractionResult
  components/
    AppHeader.tsx          (server) title + tagline
    PipelineDiagram.tsx    (server) PDF -> OCR -> LayoutLMv3 -> JSON
    SampleDownload.tsx     (server) <a download> links from samples data
    ExtractionWorkbench.tsx("use client") owns run rows state; composes the three below
    UploadDropzone.tsx     ("use client") drag/drop + file picker, .pdf validation
    RunButton.tsx          ("use client") triggers run; pending/disabled states
    ExtractionTable.tsx    ("use client") empty/loading/populated table
    StatusBadge.tsx        ("use client") status pill
lib/
  types.ts             RunStatus, ExtractionResult, RunRow
  format.ts            formatCurrency/formatDate/formatConfidence (em-dash for null)
  samples.ts           typed loader over samples.json (+ SampleRecord type)
  extractClient.ts     postExtract(file): Promise<ExtractionResult>
  hooks/useExtraction.ts client hook: run(rowId,file) -> fetch -> update state
  samples.json         single source of truth for sample data + mock results
scripts/
  gen-samples.mjs      pdf-lib: write sample PDFs to public/samples + ../../src/data
public/samples/*.pdf   downloadable test invoices
```

Each component is its own file (one component per file).

## Data model (`lib/types.ts`)

```ts
export type RunStatus = 'idle' | 'running' | 'done' | 'error'

export interface ExtractionResult {
  invoiceNumber: string | null
  date: string | null   // ISO yyyy-mm-dd
  subtotal: number | null
  tax: number | null
  total: number | null
  currency: string
  confidence: number    // 0..1
}

export interface RunRow {
  id: string
  fileName: string
  status: RunStatus
  result: ExtractionResult | null
  error: string | null
}
```

## Route Handler (`app/api/extract/route.ts`)

- `POST` reads `multipart/form-data`, takes the `file` field's name.
- `fail.pdf` → HTTP 500 (demonstrates the error path).
- Known sample filename → that sample's fields; unknown → a generic result.
- ~1.2s artificial delay to make the pipeline feel real.
- Returns `ExtractionResult` JSON. Later: replace the body with a real backend call.

## Data flow

```
SampleDownload  ──download──▶  browser saves /samples/acme-invoice.pdf
        │
        ▼ (user uploads it back)
UploadDropzone  ──valid .pdf──▶  Workbench: add RunRow (status 'idle'), remember File
        │
        ▼ (click Run)
RunButton ─▶ useExtraction.run(id, file) ─▶ POST /api/extract (fetch)
        │                                       │
        │                                app/api/extract/route.ts
        ▼                                       ▼
row status 'running'                    ExtractionResult JSON (~1.2s)
        │                                       │
        ▼◀───────────────────────────────────────┘
row status 'done' + result            (or 'error' on non-2xx)
        │
        ▼
ExtractionTable renders the row
```

## Table columns

File · Invoice # · Date · Subtotal · Tax · Total · Confidence · Status

- Empty state: prompt to download a sample and upload it.
- Currency via `Intl.NumberFormat`, dates via `Intl.DateTimeFormat`, `null` → em-dash `—`.

## Sample PDFs

- **Two** samples with different layouts (`acme-invoice.pdf`, `globex-invoice.pdf`), generated
  by `scripts/gen-samples.mjs` (pdf-lib devDependency) from `lib/samples.json`.
- Written to `public/samples/` (served for download) and `src/data/` (canonical copies).
- Each sample's known fields drive the Route Handler's mock result, so download → upload → run
  is internally consistent. `samples.json` is the single source of truth for both.

## Error handling

- Non-PDF upload → rejected in `UploadDropzone`, inline `role="alert"` message, nothing added.
- `POST /api/extract` non-2xx → row status `error`, message in the Status cell, retry affordance.
- `fail.pdf` sample-less filename returns 500 to exercise the error path on demand.

## Quality bar (frontend + react skills)

- **RSC discipline:** server components by default; `"use client"` only where interactivity is
  needed (Workbench, dropzone, run button, table, badge). Keep client islands at the leaves.
- **a11y:** semantic `<table>` with `<th scope>`; dropzone is a labelled `<input type=file>`
  styled as a dropzone (keyboard operable, visible focus); status announced via
  `aria-live="polite"`; contrast AA; respect `prefers-reduced-motion`.
- **States:** loading (running rows / disabled controls), error, and empty all designed.
- **TypeScript:** strict; boundary types in `lib/types.ts`; no `any`; typed props.
- **Styling:** CSS custom-property tokens; light + dark; CSS Modules per component; mobile-first
  responsive; table scrolls horizontally in its own container.

## Testing

- **Vitest + @testing-library/react + user-event** — component behavior:
  - `ExtractionTable`: empty / populated rendering; `null` → `—`; currency/date/confidence format.
  - `UploadDropzone`: accepts `.pdf`; rejects other types with an announced error.
  - `StatusBadge`: right label/variant per status.
  - `format.ts`: currency/date/confidence + em-dash.
- **Route Handler test** — `POST /api/extract` returns the right result per filename and 500
  for `fail.pdf` (invoke the handler directly with a `Request`).
- **Playwright e2e** — happy path: upload a fixture PDF → Run → row populates with expected
  fields (`INV-2041`, `$1,339.20`, `Done`).

## Open decisions (resolved)

- Framework: **Next.js 15 App Router** (replaces the Vue scaffold in `src/frontend/`).
- Run behavior: **Route Handler** stub (no MSW / no TanStack Query).
- Samples: **two** bundled PDFs, generated to `public/samples` + `src/data`.
