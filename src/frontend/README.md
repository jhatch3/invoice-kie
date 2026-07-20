# invoice-kie — frontend

Next.js (App Router) demo for the invoice-kie document-KIE benchmark. It shows the pipeline
stages, the benchmark table, and an interactive "try the pipeline" console. See the repository
root `README.md` for the overall project.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 + shadcn/ui (editorial, monochrome look)
- Extraction goes through a Next.js Route Handler (`app/api/extract`) that **proxies to the FastAPI
  backend** when `BACKEND_URL` is set and reachable, and falls back to a built-in **mock**
  otherwise — so the demo always works. To use the real model locally, set
  `BACKEND_URL=http://localhost:8000` in `.env.local` and start the backend
  (`uvicorn app.main:app` from `src/backend`). The demo shows a `live model` / `demo · mock`
  label so it's clear which ran.

## Develop

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (also type-checks)
npm run lint
npm run gen:samples  # regenerate the sample receipt PDFs in public/samples
```

## Layout

```
app/                 routes: / (landing), /demo, /api/extract (mock)
components/
  landing/           hero, hero-stats, pipeline-diagram, benchmark-table
  demo/              try-pipeline, demo-console, pdf-viewer, output-json, upload-dropzone
  ui/                shadcn primitives (button, card, table, badge)
  site-header.tsx    site-footer.tsx
lib/                 types, samples, format, extract-client, utils
```

One component per file. Server components by default; `"use client"` only on interactive leaves.
