# invoice-kie — frontend

Next.js (App Router) demo for the invoice-kie document-KIE benchmark. It shows the pipeline
stages, the benchmark table, and an interactive "try the pipeline" console. See the repository
root `README.md` for the overall project.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 + shadcn/ui (editorial, monochrome look)
- Extraction is currently **mocked** by a Next.js Route Handler (`app/api/extract`) that returns
  the CORD target schema. It is a stub, not the real model.

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
