# Invoice-kie Frontend Mockup Implementation Plan (Next.js) — SUPERSEDED

> **SUPERSEDED 2026-07-18.** Scope expanded to a full-stack (Next.js + FastAPI) app. This
> plan's Next Route Handler stub, hand-written `extractClient`, and CSS Modules are replaced by
> a FastAPI `/extract` endpoint, an OpenAPI-generated typed client, and Tailwind/shadcn. The
> active design is
> [`../specs/2026-07-18-invoice-frontend-mockup-nextjs-design.md`](../specs/2026-07-18-invoice-frontend-mockup-nextjs-design.md)
> (full-stack, phased). A detailed Phase 1 plan will be written from that spec's task outline.
> Reusable parts of this plan (types, formatters, component structure, sample data, tests) carry
> over. This plan was never executed. Kept for history.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js single-page mockup where a user downloads a sample invoice PDF, uploads it back, and runs it through a stubbed Route Handler that populates a results table.

**Architecture:** Next.js App Router. `app/page.tsx` (server component) renders header + pipeline diagram + sample-download links + one client island (`ExtractionWorkbench`). The "run" POSTs the PDF to `app/api/extract/route.ts`, which returns a mock `ExtractionResult` after a delay (500 for `fail.pdf`). Client run-state is plain React state in the workbench; no MSW, no TanStack Query. Swapping the real backend later means editing only the Route Handler body.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · CSS Modules + CSS-variable tokens · Vitest + @testing-library/react + user-event + jsdom · Playwright (e2e) · `pdf-lib` (build-time sample generation).

## Global Constraints

- The Next.js app lives in `src/frontend/` (replacing the removed Vue scaffold). Run all `npm` commands from `src/frontend/`.
- Import alias `@/*` resolves to the `src/frontend/` project root (configured by create-next-app).
- Every component is its own file under `src/frontend/app/components/` (one component per file).
- Server components by default; add `"use client"` only to interactive leaves.
- TypeScript strict; no `any`. Boundary types live in `src/frontend/lib/types.ts`.
- Accessibility: semantic HTML, labelled inputs, keyboard operability, visible focus, `aria-live` for status, contrast AA, respect `prefers-reduced-motion`.
- Styling via CSS-variable design tokens (`app/tokens.css`) + per-component CSS Modules; light + dark; no horizontal body scroll (wide table scrolls in its own container).
- Currency via `Intl.NumberFormat`, dates via `Intl.DateTimeFormat`, `null` fields render as em-dash `—`.
- Single source of truth for sample data: `src/frontend/lib/samples.json` (drives PDF generation and the Route Handler mock).

---

## Task 1: Scaffold Next.js + test tooling

**Files:**
- Delete: `src/frontend/**` (Vue scaffold)
- Create (via create-next-app): `src/frontend/` Next.js app
- Create: `src/frontend/vitest.config.ts`, `src/frontend/vitest.setup.ts`, `src/frontend/playwright.config.ts`
- Modify: `src/frontend/package.json`, `src/frontend/tsconfig.json`
- Create: `src/frontend/app/tokens.css`
- Modify: `src/frontend/app/layout.tsx`, `src/frontend/app/page.tsx`
- Test: `src/frontend/lib/smoke.spec.ts`

**Interfaces:**
- Produces: a booting Next.js app with Vitest (jsdom + React) and Playwright configured; token stylesheet imported in the root layout.

- [ ] **Step 1: Remove the Vue scaffold**

Run (from repo root):
```bash
git rm -r src/frontend
```

- [ ] **Step 2: Scaffold Next.js into src/frontend**

Run (from `src/`):
```bash
npx create-next-app@latest frontend --ts --app --eslint --no-tailwind --no-src-dir --import-alias "@/*" --use-npm --turbopack
```
Expected: a Next.js app at `src/frontend/` with `app/`, `package.json`, `tsconfig.json`.

- [ ] **Step 3: Install test tooling**

Run (from `src/frontend/`):
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test pdf-lib
npx playwright install chromium
```

- [ ] **Step 4: Configure Vitest**

Create `src/frontend/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['node_modules', 'e2e', '.next'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
})
```

Create `src/frontend/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Configure Playwright**

Create `src/frontend/playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

- [ ] **Step 6: Add npm scripts**

In `src/frontend/package.json` `scripts`, add:
```json
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "gen:samples": "node scripts/gen-samples.mjs"
```

- [ ] **Step 7: Ensure strict TS + JSON imports**

In `src/frontend/tsconfig.json` `compilerOptions`, confirm/add: `"strict": true` and `"resolveJsonModule": true`.

- [ ] **Step 8: Add design tokens and import them in the layout**

Create `src/frontend/app/tokens.css`:
```css
:root {
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
  --space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem;
  --radius: 8px;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --bg: #ffffff; --surface: #f7f8fa; --border: #e2e5ea;
  --text: #1a1c20; --text-muted: #5b6270;
  --accent: #2563eb; --accent-contrast: #ffffff;
  --success: #15803d; --danger: #b91c1c; --focus: #2563eb;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f1115; --surface: #171a21; --border: #2a2f3a;
    --text: #e6e8ec; --text-muted: #9aa2b1;
    --accent: #60a5fa; --accent-contrast: #0f1115;
    --success: #4ade80; --danger: #f87171; --focus: #60a5fa;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: var(--font-sans); line-height: 1.5;
}
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Replace `src/frontend/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import './tokens.css'

export const metadata: Metadata = {
  title: 'invoice-kie',
  description: 'Extract key fields from invoice PDFs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Delete the create-next-app `app/globals.css` import (we use tokens.css). Replace `src/frontend/app/page.tsx` with a temporary placeholder (fully written in Task 12):
```tsx
export default function Home() {
  return <main><h1>invoice-kie</h1></main>
}
```

- [ ] **Step 9: Add a smoke test**

Create `src/frontend/lib/smoke.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('tooling', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 10: Verify tooling**

Run: `npm run test:run -- lib/smoke.spec.ts`
Expected: PASS. Also `npm run dev` boots and `/` shows "invoice-kie".

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore(frontend): replace Vue with Next.js app + Vitest/Playwright tooling"
```

---

## Task 2: Boundary types

**Files:**
- Create: `src/frontend/lib/types.ts`
- Test: `src/frontend/lib/types.spec.ts`

**Interfaces:**
- Produces: `RunStatus`, `ExtractionResult`, `RunRow`, `emptyResult()`.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/lib/types.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { emptyResult, type ExtractionResult, type RunRow } from './types'

describe('invoice types', () => {
  it('emptyResult has nulls except currency/confidence', () => {
    const r: ExtractionResult = emptyResult()
    expect(r.invoiceNumber).toBeNull()
    expect(r.total).toBeNull()
    expect(r.currency).toBe('USD')
    expect(r.confidence).toBe(0)
  })
  it('RunRow composes a result', () => {
    const row: RunRow = { id: 'x', fileName: 'a.pdf', status: 'idle', result: null, error: null }
    expect(row.status).toBe('idle')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- lib/types.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/frontend/lib/types.ts`:
```ts
export type RunStatus = 'idle' | 'running' | 'done' | 'error'

export interface ExtractionResult {
  invoiceNumber: string | null
  date: string | null
  subtotal: number | null
  tax: number | null
  total: number | null
  currency: string
  confidence: number
}

export interface RunRow {
  id: string
  fileName: string
  status: RunStatus
  result: ExtractionResult | null
  error: string | null
}

export function emptyResult(): ExtractionResult {
  return {
    invoiceNumber: null, date: null, subtotal: null,
    tax: null, total: null, currency: 'USD', confidence: 0,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- lib/types.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/lib/types.ts src/frontend/lib/types.spec.ts
git commit -m "feat(frontend): add invoice boundary types"
```

---

## Task 3: Formatting utilities

**Files:**
- Create: `src/frontend/lib/format.ts`
- Test: `src/frontend/lib/format.spec.ts`

**Interfaces:**
- Produces: `formatCurrency(value: number | null, currency: string): string`, `formatDate(iso: string | null): string`, `formatConfidence(value: number | null): string`, `EM_DASH`. All return `—` for `null`.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/lib/format.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatConfidence, EM_DASH } from './format'

describe('formatCurrency', () => {
  it('formats USD', () => expect(formatCurrency(1339.2, 'USD')).toBe('$1,339.20'))
  it('null -> em-dash', () => expect(formatCurrency(null, 'USD')).toBe(EM_DASH))
})
describe('formatDate', () => {
  it('formats ISO', () => expect(formatDate('2026-03-14')).toBe('Mar 14, 2026'))
  it('null -> em-dash', () => expect(formatDate(null)).toBe(EM_DASH))
})
describe('formatConfidence', () => {
  it('formats percent', () => expect(formatConfidence(0.97)).toBe('97%'))
  it('null -> em-dash', () => expect(formatConfidence(null)).toBe(EM_DASH))
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- lib/format.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

Create `src/frontend/lib/format.ts`:
```ts
export const EM_DASH = '—'

export function formatCurrency(value: number | null, currency: string): string {
  if (value === null) return EM_DASH
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function formatDate(iso: string | null): string {
  if (iso === null) return EM_DASH
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(date)
}

export function formatConfidence(value: number | null): string {
  if (value === null) return EM_DASH
  return `${Math.round(value * 100)}%`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- lib/format.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/lib/format.ts src/frontend/lib/format.spec.ts
git commit -m "feat(frontend): add currency/date/confidence formatters"
```

---

## Task 4: Sample data, loader, and PDF generator

**Files:**
- Create: `src/frontend/lib/samples.json`
- Create: `src/frontend/lib/samples.ts`
- Test: `src/frontend/lib/samples.spec.ts`
- Create: `src/frontend/scripts/gen-samples.mjs`
- Modify: `src/frontend/package.json` (already has `gen:samples` from Task 1)
- Generates: `src/frontend/public/samples/*.pdf`, `src/data/*.pdf`

**Interfaces:**
- Produces: `SampleRecord` type, `samples: SampleRecord[]`, `toResult(s)`, `sampleResults(): Record<string, ExtractionResult>`, `genericResult: ExtractionResult`.

- [ ] **Step 1: Create the sample data**

Create `src/frontend/lib/samples.json`:
```json
[
  {
    "fileName": "acme-invoice.pdf",
    "seller": "Acme Corp",
    "invoiceNumber": "INV-2041",
    "date": "2026-03-14",
    "currency": "USD",
    "lineItems": [
      { "description": "Widget assembly (x40)", "amount": 880.0 },
      { "description": "Onsite calibration", "amount": 360.0 }
    ],
    "subtotal": 1240.0,
    "tax": 99.2,
    "total": 1339.2,
    "confidence": 0.97
  },
  {
    "fileName": "globex-invoice.pdf",
    "seller": "Globex LLC",
    "invoiceNumber": "GBX-7788",
    "date": "2026-05-02",
    "currency": "USD",
    "lineItems": [
      { "description": "Cloud hosting — May", "amount": 500.0 },
      { "description": "Support retainer", "amount": 250.0 }
    ],
    "subtotal": 750.0,
    "tax": 60.0,
    "total": 810.0,
    "confidence": 0.91
  }
]
```

- [ ] **Step 2: Write the failing test**

Create `src/frontend/lib/samples.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { samples, sampleResults, genericResult } from './samples'

describe('samples', () => {
  it('exposes two samples', () => {
    expect(samples).toHaveLength(2)
    expect(samples[0].fileName).toBe('acme-invoice.pdf')
  })
  it('maps to results keyed by filename', () => {
    const r = sampleResults()
    expect(r['acme-invoice.pdf'].invoiceNumber).toBe('INV-2041')
    expect(r['acme-invoice.pdf'].total).toBe(1339.2)
  })
  it('has a generic fallback result', () => {
    expect(genericResult.invoiceNumber).toMatch(/^INV-/)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:run -- lib/samples.spec.ts`
Expected: FAIL.

- [ ] **Step 4: Write the loader**

Create `src/frontend/lib/samples.ts`:
```ts
import samplesData from './samples.json'
import type { ExtractionResult } from './types'

export interface SampleRecord {
  fileName: string
  seller: string
  invoiceNumber: string
  date: string
  currency: string
  lineItems: { description: string; amount: number }[]
  subtotal: number
  tax: number
  total: number
  confidence: number
}

export const samples: SampleRecord[] = samplesData as SampleRecord[]

export function toResult(s: SampleRecord): ExtractionResult {
  return {
    invoiceNumber: s.invoiceNumber,
    date: s.date,
    subtotal: s.subtotal,
    tax: s.tax,
    total: s.total,
    currency: s.currency,
    confidence: s.confidence,
  }
}

export function sampleResults(): Record<string, ExtractionResult> {
  return Object.fromEntries(samples.map((s) => [s.fileName, toResult(s)]))
}

export const genericResult: ExtractionResult = {
  invoiceNumber: 'INV-0000',
  date: '2026-01-01',
  subtotal: 1000,
  tax: 80,
  total: 1080,
  currency: 'USD',
  confidence: 0.82,
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- lib/samples.spec.ts`
Expected: PASS.

- [ ] **Step 6: Write the PDF generator**

Create `src/frontend/scripts/gen-samples.mjs`:
```js
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const here = dirname(fileURLToPath(import.meta.url))
const frontendRoot = resolve(here, '..')
const repoRoot = resolve(frontendRoot, '..', '..')

const samples = JSON.parse(await readFile(resolve(frontendRoot, 'lib/samples.json'), 'utf8'))

const money = (n, currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

async function buildPdf(sample) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const ink = rgb(0.1, 0.1, 0.12)
  const muted = rgb(0.42, 0.45, 0.5)

  let y = 780
  const line = (text, { x = 50, size = 11, f = font, color = ink } = {}) =>
    page.drawText(String(text), { x, y, size, font: f, color })

  line(sample.seller, { size: 22, f: bold }); y -= 18
  line('INVOICE', { size: 12, f: bold, color: muted }); y -= 40
  line(`Invoice #: ${sample.invoiceNumber}`, { f: bold }); y -= 18
  line(`Date: ${sample.date}`, { color: muted }); y -= 40

  line('Description', { f: bold }); line('Amount', { x: 430, f: bold }); y -= 6
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: muted }); y -= 22
  for (const item of sample.lineItems) {
    line(item.description); line(money(item.amount, sample.currency), { x: 430 }); y -= 20
  }
  y -= 10
  line('Subtotal', { x: 350 }); line(money(sample.subtotal, sample.currency), { x: 430 }); y -= 18
  line('Tax', { x: 350 }); line(money(sample.tax, sample.currency), { x: 430 }); y -= 20
  line('Total', { x: 350, f: bold }); line(money(sample.total, sample.currency), { x: 430, f: bold })
  return doc.save()
}

for (const dir of [resolve(repoRoot, 'src/data'), resolve(frontendRoot, 'public/samples')]) {
  await mkdir(dir, { recursive: true })
}
for (const sample of samples) {
  const bytes = await buildPdf(sample)
  await writeFile(resolve(repoRoot, 'src/data', sample.fileName), bytes)
  await writeFile(resolve(frontendRoot, 'public/samples', sample.fileName), bytes)
}
console.log(`Generated ${samples.length} sample PDF(s).`)
```

- [ ] **Step 7: Generate the PDFs and verify**

Run (from `src/frontend/`):
```bash
npm run gen:samples
node -e "const fs=require('fs');console.log(fs.readFileSync('public/samples/acme-invoice.pdf').slice(0,5).toString())"
```
Expected: `Generated 2 sample PDF(s).` then `%PDF-`.

- [ ] **Step 8: Commit**

```bash
git add src/frontend/lib/samples.json src/frontend/lib/samples.ts src/frontend/lib/samples.spec.ts src/frontend/scripts/gen-samples.mjs src/frontend/public/samples src/data
git commit -m "feat(frontend): sample data loader + PDF generator"
```

---

## Task 5: Extraction Route Handler

**Files:**
- Create: `src/frontend/app/api/extract/route.ts`
- Test: `src/frontend/app/api/extract/route.spec.ts`

**Interfaces:**
- Consumes: `sampleResults`, `genericResult` (Task 4), `ExtractionResult` (Task 2).
- Produces: `POST(request: Request): Promise<Response>`. Reads `file` from form-data; `fail.pdf` → 500; known filename → its result; unknown → generic; delay from `process.env.EXTRACT_DELAY_MS` (default 1200).

- [ ] **Step 1: Write the failing test**

Create `src/frontend/app/api/extract/route.spec.ts`:
```ts
// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import { POST } from './route'

beforeAll(() => {
  process.env.EXTRACT_DELAY_MS = '0'
})

function request(fileName: string) {
  const body = new FormData()
  body.append('file', new File(['%PDF-1.4'], fileName, { type: 'application/pdf' }))
  return new Request('http://localhost/api/extract', { method: 'POST', body })
}

describe('POST /api/extract', () => {
  it('returns the matching sample result', async () => {
    const res = await POST(request('acme-invoice.pdf'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.invoiceNumber).toBe('INV-2041')
    expect(json.total).toBe(1339.2)
  })
  it('returns a generic result for an unknown file', async () => {
    const res = await POST(request('mystery.pdf'))
    expect(res.status).toBe(200)
    expect((await res.json()).invoiceNumber).toMatch(/^INV-/)
  })
  it('returns 500 for fail.pdf', async () => {
    const res = await POST(request('fail.pdf'))
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app/api/extract/route.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the handler**

Create `src/frontend/app/api/extract/route.ts`:
```ts
import { sampleResults, genericResult } from '@/lib/samples'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData()
  const file = form.get('file')
  const name = file instanceof File ? file.name : ''
  const ms = Number(process.env.EXTRACT_DELAY_MS ?? 1200)

  if (name === 'fail.pdf') {
    await delay(Math.min(ms, 400))
    return Response.json({ message: 'Extraction failed' }, { status: 500 })
  }

  await delay(ms)
  const results = sampleResults()
  return Response.json(results[name] ?? genericResult)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- app/api/extract/route.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/app/api
git commit -m "feat(frontend): add stubbed /api/extract route handler"
```

---

## Task 6: Extract API client

**Files:**
- Create: `src/frontend/lib/extractClient.ts`
- Test: `src/frontend/lib/extractClient.spec.ts`

**Interfaces:**
- Consumes: `ExtractionResult` (Task 2).
- Produces: `postExtract(file: File): Promise<ExtractionResult>` — POSTs multipart to `/api/extract`; throws on non-2xx.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/lib/extractClient.spec.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { postExtract } from './extractClient'

const pdf = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' })

afterEach(() => vi.restoreAllMocks())

describe('postExtract', () => {
  it('posts form-data and returns parsed JSON', async () => {
    const spy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ invoiceNumber: 'INV-1' }), { status: 200 }),
    )
    const result = await postExtract(pdf)
    expect(result.invoiceNumber).toBe('INV-1')
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe('/api/extract')
    expect((init as RequestInit).method).toBe('POST')
    expect((init as RequestInit).body).toBeInstanceOf(FormData)
  })
  it('throws on non-2xx', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }))
    await expect(postExtract(pdf)).rejects.toThrow(/500/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- lib/extractClient.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

Create `src/frontend/lib/extractClient.ts`:
```ts
import type { ExtractionResult } from './types'

export async function postExtract(file: File): Promise<ExtractionResult> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/extract', { method: 'POST', body })
  if (!res.ok) throw new Error(`Extraction failed (${res.status})`)
  return (await res.json()) as ExtractionResult
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- lib/extractClient.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/lib/extractClient.ts src/frontend/lib/extractClient.spec.ts
git commit -m "feat(frontend): add extract API client"
```

---

## Task 7: useExtraction hook

**Files:**
- Create: `src/frontend/lib/hooks/useExtraction.ts`
- Test: `src/frontend/lib/hooks/useExtraction.spec.ts`

**Interfaces:**
- Consumes: `postExtract` (Task 6), `RunRow` (Task 2).
- Produces: `useExtraction()` → `{ rows: RunRow[], isPending: boolean, addFile(fileName: string): string, run(id: string, file: File): Promise<void> }`. `addFile` appends an `idle` row (id via `crypto.randomUUID()`); `run` sets running → done/error.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/lib/hooks/useExtraction.spec.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useExtraction } from './useExtraction'
import * as client from '@/lib/extractClient'

const pdf = new File(['%PDF-1.4'], 'acme-invoice.pdf', { type: 'application/pdf' })

beforeEach(() => vi.restoreAllMocks())

describe('useExtraction', () => {
  it('adds an idle row', () => {
    const { result } = renderHook(() => useExtraction())
    act(() => { result.current.addFile('a.pdf') })
    expect(result.current.rows[0]).toMatchObject({ fileName: 'a.pdf', status: 'idle' })
  })

  it('runs to done with a result', async () => {
    vi.spyOn(client, 'postExtract').mockResolvedValue({
      invoiceNumber: 'INV-2041', date: '2026-03-14', subtotal: 1240,
      tax: 99.2, total: 1339.2, currency: 'USD', confidence: 0.97,
    })
    const { result } = renderHook(() => useExtraction())
    let id = ''
    act(() => { id = result.current.addFile('acme-invoice.pdf') })
    await act(async () => { await result.current.run(id, pdf) })
    await waitFor(() => expect(result.current.rows[0].status).toBe('done'))
    expect(result.current.rows[0].result?.invoiceNumber).toBe('INV-2041')
  })

  it('runs to error on failure', async () => {
    vi.spyOn(client, 'postExtract').mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useExtraction())
    let id = ''
    act(() => { id = result.current.addFile('x.pdf') })
    await act(async () => { await result.current.run(id, pdf) })
    await waitFor(() => expect(result.current.rows[0].status).toBe('error'))
    expect(result.current.rows[0].error).toBe('boom')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- lib/hooks/useExtraction.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Write the hook**

Create `src/frontend/lib/hooks/useExtraction.ts`:
```ts
'use client'
import { useCallback, useState } from 'react'
import type { RunRow } from '@/lib/types'
import { postExtract } from '@/lib/extractClient'

export function useExtraction() {
  const [rows, setRows] = useState<RunRow[]>([])
  const [isPending, setPending] = useState(false)

  const addFile = useCallback((fileName: string): string => {
    const id = crypto.randomUUID()
    setRows((prev) => [...prev, { id, fileName, status: 'idle', result: null, error: null }])
    return id
  }, [])

  const update = useCallback((id: string, patch: Partial<RunRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])

  const run = useCallback(
    async (id: string, file: File): Promise<void> => {
      setPending(true)
      update(id, { status: 'running', error: null })
      try {
        const result = await postExtract(file)
        update(id, { status: 'done', result })
      } catch (err) {
        update(id, { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        setPending(false)
      }
    },
    [update],
  )

  return { rows, isPending, addFile, run }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- lib/hooks/useExtraction.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/lib/hooks
git commit -m "feat(frontend): add useExtraction client hook"
```

---

## Task 8: StatusBadge

**Files:**
- Create: `src/frontend/app/components/StatusBadge.tsx`
- Create: `src/frontend/app/components/StatusBadge.module.css`
- Test: `src/frontend/app/components/StatusBadge.spec.tsx`

**Interfaces:**
- Consumes: `RunStatus` (Task 2).
- Produces: `<StatusBadge status={RunStatus} />` — pill with human label + status class.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/app/components/StatusBadge.spec.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the label per status', () => {
    render(<StatusBadge status="running" />)
    expect(screen.getByText('Running')).toBeInTheDocument()
  })
  it('exposes status via data attribute', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('Error')).toHaveAttribute('data-status', 'error')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app/components/StatusBadge.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the component + styles**

Create `src/frontend/app/components/StatusBadge.tsx`:
```tsx
import type { RunStatus } from '@/lib/types'
import styles from './StatusBadge.module.css'

const LABELS: Record<RunStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  done: 'Done',
  error: 'Error',
}

export default function StatusBadge({ status }: { status: RunStatus }) {
  return (
    <span className={styles.badge} data-status={status}>
      {LABELS[status]}
    </span>
  )
}
```

Create `src/frontend/app/components/StatusBadge.module.css`:
```css
.badge {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: var(--surface);
}
.badge[data-status='running'] { color: var(--accent); border-color: var(--accent); }
.badge[data-status='done'] { color: var(--success); border-color: var(--success); }
.badge[data-status='error'] { color: var(--danger); border-color: var(--danger); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- app/components/StatusBadge.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/app/components/StatusBadge.tsx src/frontend/app/components/StatusBadge.module.css src/frontend/app/components/StatusBadge.spec.tsx
git commit -m "feat(frontend): add StatusBadge component"
```

---

## Task 9: Server presentational components (AppHeader, PipelineDiagram, SampleDownload)

**Files:**
- Create: `src/frontend/app/components/AppHeader.tsx` (+ `.module.css`)
- Create: `src/frontend/app/components/PipelineDiagram.tsx` (+ `.module.css`)
- Create: `src/frontend/app/components/SampleDownload.tsx` (+ `.module.css`)
- Test: `src/frontend/app/components/SampleDownload.spec.tsx`

**Interfaces:**
- `AppHeader` / `PipelineDiagram` — no props; server components.
- `SampleDownload` — no props; renders `<a download>` links to `/samples/<fileName>` from `samples` (Task 4).

- [ ] **Step 1: Write the failing test (SampleDownload)**

Create `src/frontend/app/components/SampleDownload.spec.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SampleDownload from './SampleDownload'

describe('SampleDownload', () => {
  it('links to each sample PDF as a download', () => {
    render(<SampleDownload />)
    const link = screen.getByRole('link', { name: /acme-invoice\.pdf/i })
    expect(link).toHaveAttribute('href', '/samples/acme-invoice.pdf')
    expect(link).toHaveAttribute('download')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app/components/SampleDownload.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write AppHeader**

Create `src/frontend/app/components/AppHeader.tsx`:
```tsx
import styles from './AppHeader.module.css'

export default function AppHeader() {
  return (
    <header>
      <h1 className={styles.title}>invoice-kie</h1>
      <p className={styles.tagline}>
        Download a sample invoice, upload it, and run it through the extraction pipeline.
      </p>
    </header>
  )
}
```

Create `src/frontend/app/components/AppHeader.module.css`:
```css
.title { margin: 0; font-size: 1.6rem; }
.tagline { margin: var(--space-2) 0 0; color: var(--text-muted); }
```

- [ ] **Step 4: Write PipelineDiagram**

Create `src/frontend/app/components/PipelineDiagram.tsx`:
```tsx
import styles from './PipelineDiagram.module.css'

const STAGES = ['PDF', 'OCR (tokens + layout)', 'LayoutLMv3 tagging', 'Normalized JSON']

export default function PipelineDiagram() {
  return (
    <section aria-labelledby="pipeline-heading">
      <h2 id="pipeline-heading" className={styles.title}>How it works</h2>
      <ol className={styles.steps}>
        {STAGES.map((stage, i) => (
          <li key={stage} className={styles.step}>
            <span className={styles.index}>{i + 1}</span>
            <span>{stage}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

Create `src/frontend/app/components/PipelineDiagram.module.css`:
```css
.title { font-size: 1rem; color: var(--text-muted); margin: 0 0 var(--space-3); }
.steps { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: var(--space-2); }
.step {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-3); border: 1px solid var(--border);
  border-radius: var(--radius); background: var(--surface); font-size: 0.9rem;
}
.index {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.4rem; height: 1.4rem; border-radius: 999px;
  background: var(--accent); color: var(--accent-contrast); font-size: 0.8rem; font-weight: 700;
}
```

- [ ] **Step 5: Write SampleDownload**

Create `src/frontend/app/components/SampleDownload.tsx`:
```tsx
import { samples } from '@/lib/samples'
import styles from './SampleDownload.module.css'

export default function SampleDownload() {
  return (
    <section aria-labelledby="samples-heading">
      <h2 id="samples-heading" className={styles.title}>1. Download a test invoice</h2>
      <ul className={styles.list}>
        {samples.map((s) => (
          <li key={s.fileName}>
            <a className={styles.link} href={`/samples/${s.fileName}`} download={s.fileName}>
              ⬇ {s.seller} — {s.fileName}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Create `src/frontend/app/components/SampleDownload.module.css`:
```css
.title { font-size: 1rem; margin: 0 0 var(--space-3); }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
.link {
  display: inline-block; width: fit-content;
  padding: var(--space-2) var(--space-3); border: 1px solid var(--border);
  border-radius: var(--radius); background: var(--surface); color: var(--accent); text-decoration: none;
}
.link:hover { border-color: var(--accent); }
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test:run -- app/components/SampleDownload.spec.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/frontend/app/components/AppHeader.* src/frontend/app/components/PipelineDiagram.* src/frontend/app/components/SampleDownload.*
git commit -m "feat(frontend): add AppHeader, PipelineDiagram, SampleDownload"
```

---

## Task 10: UploadDropzone + RunButton

**Files:**
- Create: `src/frontend/app/components/UploadDropzone.tsx` (+ `.module.css`)
- Create: `src/frontend/app/components/RunButton.tsx` (+ `.module.css`)
- Test: `src/frontend/app/components/UploadDropzone.spec.tsx`

**Interfaces:**
- `UploadDropzone` — props `{ onFile: (file: File) => void }`; client; validates `.pdf`, shows `role="alert"` error for non-PDF, calls `onFile` for valid.
- `RunButton` — props `{ disabled?: boolean; pending?: boolean; onRun: () => void }`; client; label toggles to "Running…"; disabled when `disabled || pending`.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/app/components/UploadDropzone.spec.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadDropzone from './UploadDropzone'

describe('UploadDropzone', () => {
  it('calls onFile for a valid pdf', async () => {
    const onFile = vi.fn()
    render(<UploadDropzone onFile={onFile} />)
    const pdf = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' })
    await userEvent.upload(screen.getByLabelText(/upload/i), pdf)
    expect(onFile).toHaveBeenCalledWith(pdf)
  })

  it('rejects a non-pdf with an alert and does not call onFile', async () => {
    const onFile = vi.fn()
    render(<UploadDropzone onFile={onFile} />)
    const txt = new File(['hi'], 'a.txt', { type: 'text/plain' })
    await userEvent.upload(screen.getByLabelText(/upload/i), txt)
    expect(onFile).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/pdf/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app/components/UploadDropzone.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write UploadDropzone**

Create `src/frontend/app/components/UploadDropzone.tsx`:
```tsx
'use client'
import { useState, type ChangeEvent, type DragEvent } from 'react'
import styles from './UploadDropzone.module.css'

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export default function UploadDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [over, setOver] = useState(false)

  function handle(file: File | undefined) {
    if (!file) return
    if (!isPdf(file)) {
      setError('Please choose a PDF file.')
      return
    }
    setError(null)
    onFile(file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handle(e.target.files?.[0])
    e.target.value = ''
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setOver(false)
    handle(e.dataTransfer.files?.[0])
  }

  return (
    <section aria-labelledby="upload-heading">
      <h2 id="upload-heading" className={styles.title}>2. Upload the invoice</h2>
      <label
        className={`${styles.zone} ${over ? styles.zoneOver : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); setOver(false) }}
        onDrop={onDrop}
      >
        <span>Upload a PDF: drag one here, or <strong>browse</strong></span>
        <input
          className={styles.input}
          type="file"
          accept="application/pdf,.pdf"
          aria-label="Upload a PDF invoice"
          onChange={onChange}
        />
      </label>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </section>
  )
}
```

Create `src/frontend/app/components/UploadDropzone.module.css`:
```css
.title { font-size: 1rem; margin: 0 0 var(--space-3); }
.zone {
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-8); border: 2px dashed var(--border);
  border-radius: var(--radius); background: var(--surface); cursor: pointer; text-align: center;
}
.zoneOver { border-color: var(--accent); }
.zone:focus-within { outline: 2px solid var(--focus); outline-offset: 2px; }
.input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.error { color: var(--danger); margin: var(--space-2) 0 0; }
```

- [ ] **Step 4: Write RunButton**

Create `src/frontend/app/components/RunButton.tsx`:
```tsx
'use client'
import styles from './RunButton.module.css'

interface Props {
  disabled?: boolean
  pending?: boolean
  onRun: () => void
}

export default function RunButton({ disabled, pending, onRun }: Props) {
  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled || pending}
      onClick={onRun}
    >
      {pending ? 'Running…' : 'Run extraction'}
    </button>
  )
}
```

Create `src/frontend/app/components/RunButton.module.css`:
```css
.button {
  padding: var(--space-2) var(--space-6);
  border: 1px solid var(--accent); border-radius: var(--radius);
  background: var(--accent); color: var(--accent-contrast); font-weight: 600; cursor: pointer;
}
.button:disabled { opacity: 0.55; cursor: not-allowed; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- app/components/UploadDropzone.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/app/components/UploadDropzone.* src/frontend/app/components/RunButton.*
git commit -m "feat(frontend): add UploadDropzone and RunButton"
```

---

## Task 11: ExtractionTable

**Files:**
- Create: `src/frontend/app/components/ExtractionTable.tsx` (+ `.module.css`)
- Test: `src/frontend/app/components/ExtractionTable.spec.tsx`

**Interfaces:**
- Consumes: `RunRow` (Task 2), formatters (Task 3), `StatusBadge` (Task 8).
- Produces: `<ExtractionTable rows={RunRow[]} />` — empty state when `rows` is empty, else a semantic table.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/app/components/ExtractionTable.spec.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExtractionTable from './ExtractionTable'
import type { RunRow } from '@/lib/types'

const doneRow: RunRow = {
  id: '1', fileName: 'acme-invoice.pdf', status: 'done', error: null,
  result: {
    invoiceNumber: 'INV-2041', date: '2026-03-14', subtotal: 1240,
    tax: 99.2, total: 1339.2, currency: 'USD', confidence: 0.97,
  },
}

describe('ExtractionTable', () => {
  it('shows an empty state with no rows', () => {
    render(<ExtractionTable rows={[]} />)
    expect(screen.getByText(/no invoices yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })
  it('renders a formatted row', () => {
    render(<ExtractionTable rows={[doneRow]} />)
    expect(screen.getByText('acme-invoice.pdf')).toBeInTheDocument()
    expect(screen.getByText('INV-2041')).toBeInTheDocument()
    expect(screen.getByText('$1,339.20')).toBeInTheDocument()
    expect(screen.getByText('Mar 14, 2026')).toBeInTheDocument()
    expect(screen.getByText('97%')).toBeInTheDocument()
  })
  it('renders em-dashes for a row without a result', () => {
    const idle: RunRow = { id: '2', fileName: 'x.pdf', status: 'idle', error: null, result: null }
    render(<ExtractionTable rows={[idle]} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app/components/ExtractionTable.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the component + styles**

Create `src/frontend/app/components/ExtractionTable.tsx`:
```tsx
import type { RunRow } from '@/lib/types'
import { formatCurrency, formatDate, formatConfidence, EM_DASH } from '@/lib/format'
import StatusBadge from './StatusBadge'
import styles from './ExtractionTable.module.css'

export default function ExtractionTable({ rows }: { rows: RunRow[] }) {
  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading" className={styles.title}>Extracted fields</h2>

      {rows.length === 0 ? (
        <p className={styles.empty}>
          No invoices yet. Download a sample above, then upload it to see the extracted fields.
        </p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">File</th>
                <th scope="col">Invoice #</th>
                <th scope="col">Date</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Tax</th>
                <th scope="col">Total</th>
                <th scope="col">Confidence</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const currency = row.result?.currency ?? 'USD'
                return (
                  <tr key={row.id}>
                    <td>{row.fileName}</td>
                    <td>{row.result?.invoiceNumber ?? EM_DASH}</td>
                    <td>{formatDate(row.result?.date ?? null)}</td>
                    <td>{formatCurrency(row.result?.subtotal ?? null, currency)}</td>
                    <td>{formatCurrency(row.result?.tax ?? null, currency)}</td>
                    <td>{formatCurrency(row.result?.total ?? null, currency)}</td>
                    <td>{formatConfidence(row.result?.confidence ?? null)}</td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
```

Create `src/frontend/app/components/ExtractionTable.module.css`:
```css
.title { font-size: 1rem; margin: 0 0 var(--space-3); }
.empty {
  color: var(--text-muted); padding: var(--space-6);
  border: 1px dashed var(--border); border-radius: var(--radius); text-align: center;
}
.scroll { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
.table th, .table td {
  text-align: left; padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border); white-space: nowrap;
}
.table th { color: var(--text-muted); font-weight: 600; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- app/components/ExtractionTable.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/app/components/ExtractionTable.*
git commit -m "feat(frontend): add ExtractionTable component"
```

---

## Task 12: ExtractionWorkbench + page wiring

**Files:**
- Create: `src/frontend/app/components/ExtractionWorkbench.tsx` (+ `.module.css`)
- Test: `src/frontend/app/components/ExtractionWorkbench.spec.tsx`
- Modify: `src/frontend/app/page.tsx`

**Interfaces:**
- Consumes: `UploadDropzone`, `RunButton`, `ExtractionTable` (Tasks 10–11), `useExtraction` (Task 7).
- Produces: `<ExtractionWorkbench />` client island. On upload adds an idle row + remembers the File; on run, runs each idle row; renders the table; announces status via `aria-live`. `page.tsx` (server) composes header + diagram + samples + the workbench.

- [ ] **Step 1: Write the failing integration test**

Create `src/frontend/app/components/ExtractionWorkbench.spec.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExtractionWorkbench from './ExtractionWorkbench'
import * as client from '@/lib/extractClient'

beforeEach(() => vi.restoreAllMocks())

describe('ExtractionWorkbench', () => {
  it('adds a row on upload and populates it on run', async () => {
    vi.spyOn(client, 'postExtract').mockResolvedValue({
      invoiceNumber: 'INV-2041', date: '2026-03-14', subtotal: 1240,
      tax: 99.2, total: 1339.2, currency: 'USD', confidence: 0.97,
    })
    render(<ExtractionWorkbench />)
    const pdf = new File(['%PDF-1.4'], 'acme-invoice.pdf', { type: 'application/pdf' })
    await userEvent.upload(screen.getByLabelText(/upload/i), pdf)
    expect(screen.getByText('acme-invoice.pdf')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /run extraction/i }))
    expect(await screen.findByText('INV-2041')).toBeInTheDocument()
    expect(screen.getByText('$1,339.20')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app/components/ExtractionWorkbench.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Write ExtractionWorkbench**

Create `src/frontend/app/components/ExtractionWorkbench.tsx`:
```tsx
'use client'
import { useRef } from 'react'
import UploadDropzone from './UploadDropzone'
import RunButton from './RunButton'
import ExtractionTable from './ExtractionTable'
import { useExtraction } from '@/lib/hooks/useExtraction'
import styles from './ExtractionWorkbench.module.css'

export default function ExtractionWorkbench() {
  const { rows, isPending, addFile, run } = useExtraction()
  const files = useRef(new Map<string, File>())

  function onFile(file: File) {
    const id = addFile(file.name)
    files.current.set(id, file)
  }

  async function onRun() {
    const idle = rows.filter((r) => r.status === 'idle')
    for (const row of idle) {
      const file = files.current.get(row.id)
      if (file) {
        await run(row.id, file)
        files.current.delete(row.id)
      }
    }
  }

  const hasIdle = rows.some((r) => r.status === 'idle')
  const last = rows[rows.length - 1]
  const announcement = isPending
    ? 'Running extraction…'
    : last?.status === 'done'
      ? `Extraction complete for ${last.fileName}.`
      : last?.status === 'error'
        ? `Extraction failed for ${last.fileName}.`
        : ''

  return (
    <>
      <div className={styles.upload}>
        <UploadDropzone onFile={onFile} />
        <RunButton disabled={!hasIdle} pending={isPending} onRun={onRun} />
      </div>
      <ExtractionTable rows={rows} />
      <p role="status" aria-live="polite" className={styles.srOnly}>{announcement}</p>
    </>
  )
}
```

Create `src/frontend/app/components/ExtractionWorkbench.module.css`:
```css
.upload { display: flex; flex-direction: column; gap: var(--space-4); align-items: flex-start; }
.srOnly {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 4: Wire the page**

Replace `src/frontend/app/page.tsx`:
```tsx
import AppHeader from './components/AppHeader'
import PipelineDiagram from './components/PipelineDiagram'
import SampleDownload from './components/SampleDownload'
import ExtractionWorkbench from './components/ExtractionWorkbench'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.page}>
      <AppHeader />
      <PipelineDiagram />
      <div className={styles.actions}>
        <SampleDownload />
        <ExtractionWorkbench />
      </div>
    </main>
  )
}
```

Create `src/frontend/app/page.module.css`:
```css
.page {
  max-width: 960px; margin: 0 auto; padding: var(--space-8) var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-8);
}
.actions { display: grid; grid-template-columns: 1fr; gap: var(--space-6); }
@media (min-width: 720px) { .actions { grid-template-columns: 1fr 1fr; } }
```

Note: `ExtractionWorkbench` renders both the upload controls and the results table; on wide screens they share the two-column `actions` grid with `SampleDownload`. If the table feels cramped in a column during the smoke test (Task 14), move `<ExtractionWorkbench/>` out of `.actions` to full width — acceptable layout tweak, no logic change.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- app/components/ExtractionWorkbench.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/app/components/ExtractionWorkbench.* src/frontend/app/page.tsx src/frontend/app/page.module.css
git commit -m "feat(frontend): wire ExtractionWorkbench and home page"
```

---

## Task 13: Playwright e2e happy path

**Files:**
- Create: `src/frontend/e2e/extract.spec.ts`
- Uses: `src/frontend/public/samples/acme-invoice.pdf` (Task 4)

**Interfaces:**
- Consumes: the running dev server (started by Playwright `webServer`). The real Route Handler returns mock data, so no extra mocking is needed.

- [ ] **Step 1: Write the e2e spec**

Create `src/frontend/e2e/extract.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test('upload a sample and see extracted fields', async ({ page }) => {
  await page.goto('/')
  await page.setInputFiles('input[type="file"]', 'public/samples/acme-invoice.pdf')
  await expect(page.getByText('acme-invoice.pdf')).toBeVisible()
  await page.getByRole('button', { name: /run extraction/i }).click()
  await expect(page.getByText('INV-2041')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('$1,339.20')).toBeVisible()
  await expect(page.getByText('Done')).toBeVisible()
})
```

- [ ] **Step 2: Run the e2e test**

Run (from `src/frontend/`): `npm run test:e2e`
Expected: Playwright starts the dev server and the test passes (row shows `INV-2041`, `$1,339.20`, `Done`).

- [ ] **Step 3: Commit**

```bash
git add src/frontend/e2e/extract.spec.ts src/frontend/playwright.config.ts
git commit -m "test(frontend): add e2e happy path for invoice extraction"
```

---

## Task 14: Full verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Type-check + lint**

Run (from `src/frontend/`): `npx tsc --noEmit` then `npm run lint`
Expected: no errors.

- [ ] **Step 2: Full unit suite**

Run: `npm run test:run`
Expected: all suites PASS.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds (validates RSC/client boundaries and the Route Handler).

- [ ] **Step 4: Dev smoke test**

Run: `npm run dev`, open the app, and confirm: download a sample, upload it, click Run, watch the row go Running → Done with populated fields; trigger the error path by uploading a file named `fail.pdf`; toggle OS dark mode for theming; tab through with the keyboard to confirm focus rings and dropzone reachability.

- [ ] **Step 5: Commit any fixups**

```bash
git add -A
git commit -m "chore(frontend): lint/build fixups" || echo "nothing to commit"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** download samples (Tasks 4, 9 `SampleDownload`), upload + validation (Task 10 `UploadDropzone`), stubbed Route Handler (Task 5), fetch client + hook (Tasks 6, 7), blank/loading/error/empty table (Task 11), pipeline visual (Task 9 `PipelineDiagram`), types (Task 2), formatting/em-dash (Task 3), a11y/tokens/theme (Task 1 tokens + component modules + Task 12 `aria-live`), RSC/client split (server components Tasks 9; `"use client"` Tasks 7/10/11/12), tests incl. e2e (every task + Task 13). All spec sections mapped.

**Placeholder scan:** none — every code step contains full code; the Task 1 `page.tsx` placeholder is intentional and fully replaced in Task 12.

**Type consistency:** `ExtractionResult`/`RunRow`/`RunStatus` used consistently; `postExtract(file)` matches across Tasks 6/7; hook surface (`rows`/`isPending`/`addFile`/`run`) matches between Task 7 and Task 12; `SampleRecord`/`sampleResults`/`genericResult` consistent Tasks 4/5/9; formatter names (`formatCurrency`/`formatDate`/`formatConfidence`/`EM_DASH`) consistent Tasks 3/11.
