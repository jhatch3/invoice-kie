# Invoice-kie — Full-Stack App Design (Next.js + FastAPI), Phased

**Date:** 2026-07-18
**Status:** Approved (brainstorming) — active spec
**Supersedes:** `2026-07-18-invoice-frontend-mockup-design.md` (Vue) and the earlier
frontend-only Next.js version of this document (Next Route Handler + CSS Modules), which is
replaced by the FastAPI backend + OpenAPI-typed client + Tailwind/shadcn architecture below.

> This document is the single source of truth for the invoice-kie web app. The project grew
> from "a frontend mockup" into a full-stack, production-grade template built in **phases**.
> Phase 1 is fully specified here; Phases 2–3 are scoped at outline level and will be detailed
> when we reach them.

## Product goal

Let a user **see the invoice-extraction pipeline end-to-end** before the real ML model exists:
download a bundled test invoice PDF, upload it, run it, and see the extracted fields (total,
tax, subtotal, date, invoice number) in a results table. The extraction call is a real HTTP API
whose implementation is currently mocked and later swapped for the LayoutLMv3 backend — with no
frontend changes.

## Confirmed decisions (2026-07-18)

- **Framework:** Next.js 15 (App Router) frontend + **FastAPI** backend. Replaces the Vue
  scaffold at `src/frontend/`; backend lives at `src/backend/` (dir already exists).
- **Sequencing:** incremental, 3 phases (below). Each phase ships something usable.
- **UI stack:** **Tailwind CSS + shadcn/ui** (replaces the previously-planned CSS Modules +
  design tokens).
- **Extraction endpoint:** **FastAPI `/extract`** now, returning mock data; the frontend
  consumes it through an **OpenAPI-generated typed client** (openapi-typescript + openapi-fetch).
  No Next.js Route Handler, no MSW.
- **Auth:** **deferred** to Phase 2 (fastapi-users). Phase 1 is unauthenticated.
- **Type safety:** end-to-end — Pydantic models on the backend generate the OpenAPI schema,
  which generates TS types for the frontend; **Zod** validates the upload form (file type/size)
  client-side.
- **Tooling:** **UV** for Python deps/packaging; **Docker Compose** to run frontend + backend
  together; pre-commit hooks and Vercel deployment in Phase 2.

## Phase breakdown

### Phase 1 — Full-stack core (build now)
Working demo across a real frontend and backend, no auth.
- FastAPI backend: `GET /samples` (list downloadable samples), `GET /samples/{fileName}`
  (download a sample PDF), `POST /extract` (mock extraction). Pydantic schemas drive OpenAPI.
- Sample invoice PDFs generated in Python (reportlab/fpdf2) and served by the backend; sample
  metadata + mock results owned by the backend (single source of truth).
- Next.js frontend (Tailwind + shadcn/ui): header, pipeline diagram, sample-download list,
  upload dropzone, run button, results table, status badges.
- OpenAPI-typed client: generate `openapi/schema.ts` from the backend, call via openapi-fetch.
- UV-managed backend; Docker Compose runs both services for local dev.
- Tests: pytest (backend endpoints), Vitest + Testing Library (frontend components),
  Playwright (e2e happy path across the running stack).

### Phase 2 — Auth + delivery
- **fastapi-users:** register/login, secure password hashing, JWT auth, email-based password
  recovery. Frontend login/register screens (shadcn forms + Zod); protect the app behind auth.
- **Pre-commit hooks:** enforce lint/format/type-check on both stacks before commit.
- **Vercel deployment:** frontend on Vercel; backend as serverless/containerized; env config.

### Phase 3 — Real extraction (future, the README vision)
- Replace the mock `/extract` with the actual pipeline: PDF → OCR (tokens + layout) →
  LayoutLMv3 token tagging → normalized JSON. Benchmark vs. a zero-shot VLM (per README).

## Phase 1 architecture

```
src/
  backend/                     FastAPI app (UV)
    pyproject.toml             uv-managed; deps: fastapi, uvicorn, fpdf2 (or reportlab), pytest, httpx
    app/
      main.py                  FastAPI app; CORS for the frontend origin; include routers
      schemas/invoice.py       Pydantic: ExtractionResult, SampleInfo (drive OpenAPI)
      routers/extract.py       POST /extract  -> ExtractionResult (mock, ~1.2s delay; 500 for fail.pdf)
      routers/samples.py       GET /samples -> SampleInfo[]; GET /samples/{fileName} -> PDF
      services/samples.py      sample metadata + mock results (single source of truth)
      services/pdf.py          generate sample invoice PDFs (Python)
    tests/                     pytest: test_extract.py, test_samples.py
    Dockerfile
  frontend/                    Next.js (App Router, Tailwind, shadcn/ui)
    app/
      layout.tsx, page.tsx     server components; compose the UI
      components/              one component per file (see below)
    lib/
      types.ts                 re-exports/aliases over generated types where convenient
      api.ts                   openapi-fetch client bound to the backend base URL
      upload-schema.ts         Zod schema for upload validation
      hooks/useExtraction.ts   client hook: call typed client, track run rows
    openapi/schema.ts          generated from backend OpenAPI (openapi-typescript)
    components.json            shadcn/ui config
  data/ (repo src/data)        canonical copies of generated sample PDFs
docker-compose.yml             backend (uvicorn) + frontend (next) services
```

### Frontend components (one file each, Tailwind + shadcn/ui)
`AppHeader`, `PipelineDiagram`, `SampleDownload` (server) and `ExtractionWorkbench`,
`UploadDropzone`, `RunButton`, `ExtractionTable`, `StatusBadge` (client). Same responsibilities
as the earlier design; styling via Tailwind utility classes + shadcn primitives (Button, Table,
Card, Badge) instead of CSS Modules.

### Data model
Pydantic (`app/schemas/invoice.py`) is the source; TS types are generated from OpenAPI.
```
ExtractionResult: invoiceNumber: str|None, date: str|None (ISO), subtotal/tax/total: float|None,
                  currency: str, confidence: float (0..1)
SampleInfo:       fileName: str, seller: str
RunStatus (frontend-only): 'idle' | 'running' | 'done' | 'error'
RunRow (frontend-only):    id, fileName, status, result: ExtractionResult|null, error: str|null
```

### Data flow (Phase 1)
```
GET /samples ──▶ SampleDownload lists samples ──▶ user downloads GET /samples/{file}
        │
        ▼ (user uploads the PDF back)
UploadDropzone (Zod validates .pdf) ──▶ Workbench: add RunRow (idle), remember File
        │
        ▼ (Run)
useExtraction ──▶ openapi-fetch POST /extract (multipart) ──▶ FastAPI mock (~1.2s)
        │                                                          │
        ▼                                                    ExtractionResult / 500 (fail.pdf)
row 'running' ──────────────────────────────────────────────▶ row 'done'+result / 'error'
        │
        ▼
ExtractionTable renders the row
```

### Mock extraction rules (backend)
- Multipart `file` field; match by filename against known samples.
- `fail.pdf` → HTTP 500 (error-path demo). Known sample → its fields. Unknown → generic result.
- Artificial delay (default ~1.2s; `EXTRACT_DELAY_MS`/env `0` in tests) so the pipeline feels real.

### Table columns
File · Invoice # · Date · Subtotal · Tax · Total · Confidence · Status.
Empty state prompts download+upload; currency via `Intl.NumberFormat`, dates via
`Intl.DateTimeFormat`, `null` → em-dash `—`.

## Quality bar (frontend + react skills; backend best practices)
- **RSC discipline:** server components by default; `"use client"` only on interactive leaves.
- **a11y:** semantic table (`<th scope>`), labelled dropzone (keyboard + visible focus), status
  via `aria-live`, contrast AA, respects `prefers-reduced-motion`. shadcn/ui primitives are
  accessible by default — keep it that way.
- **Type safety:** strict TS, no `any`; backend Pydantic; generated OpenAPI types are the
  contract; Zod for form validation.
- **States:** loading/error/empty all designed.
- **CORS/security:** backend restricts origins; no secrets in the frontend bundle.
- **Testing:** pytest (backend), Vitest + Testing Library (frontend), Playwright (e2e).

## Phase 1 task outline (to be detailed into a step-by-step plan)
1. Backend scaffold (UV): FastAPI app, CORS, health check, pytest wired.
2. Pydantic schemas (`ExtractionResult`, `SampleInfo`) + unit checks.
3. Sample service: metadata + mock results (single source of truth) + tests.
4. PDF generation service (Python) + write canonical copies to `src/data`.
5. `GET /samples` and `GET /samples/{fileName}` routers + tests.
6. `POST /extract` mock router (delay, per-file result, 500 for fail.pdf) + tests.
7. Frontend scaffold: Next.js + Tailwind + shadcn/ui init; base layout/theme.
8. OpenAPI type generation from the backend (`openapi/schema.ts`) + `lib/api.ts` (openapi-fetch).
9. Zod upload schema + `lib/types.ts` helpers + formatters + tests.
10. `useExtraction` hook (typed client) + tests.
11. Presentational components (AppHeader, PipelineDiagram, SampleDownload via `GET /samples`).
12. Interactive components (UploadDropzone, RunButton, ExtractionTable, StatusBadge) + tests.
13. ExtractionWorkbench + page wiring + component/integration tests.
14. Docker Compose (backend + frontend) for local dev.
15. Playwright e2e happy path across the running stack.
16. Full verification sweep (pytest, vitest, tsc, next build, docker compose up smoke).

## Open questions to resolve before/while planning Phase 1
- **PDF library:** `fpdf2` vs `reportlab` for Python sample generation (default: `fpdf2`, lighter).
- **OpenAPI generation trigger:** committed generated `schema.ts` regenerated via an npm script
  against a running backend, vs. generated in CI. Default: an npm script `gen:api` + commit.
- **shadcn components to add:** Button, Table, Card, Badge, Input (add as needed).

## History
- v1 (Vue): `2026-07-18-invoice-frontend-mockup-design.md` — superseded.
- v2 (Next.js, frontend-only, Route Handler + CSS Modules) — superseded by this document.
- v3 (this doc): full-stack Next.js + FastAPI, phased, Tailwind/shadcn, OpenAPI-typed client.
