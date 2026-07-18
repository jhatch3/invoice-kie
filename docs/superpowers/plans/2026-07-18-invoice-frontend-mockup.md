# Invoice-kie Frontend Mockup Implementation Plan (Vue) — SUPERSEDED

> **SUPERSEDED 2026-07-18** by
> [`2026-07-18-invoice-frontend-mockup-nextjs.md`](2026-07-18-invoice-frontend-mockup-nextjs.md).
> The project pivoted from Vue to Next.js. This Vue plan was never executed. Kept for history.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vue 3 single-page mockup where a user downloads a sample invoice PDF, uploads it back, and runs it through a stubbed extraction API that populates a results table.

**Architecture:** Single route (`/` → `HomeView.vue`) composed of small one-file components under `src/frontend/src/components/`. The "run" action calls `POST /api/extract` through a TanStack Query (Vue Query) mutation; MSW intercepts it in dev/test and returns mock `ExtractionResult` JSON per uploaded filename. Client run-state lives in a Pinia store; extraction results live in the Query cache. The data layer is backend-swappable — replacing the MSW handler with a real URL requires no component changes.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Vite, Pinia, vue-router, TypeScript (strict), `@tanstack/vue-query`, `msw`, `pdf-lib` (build-time sample generation), Vitest + @vue/test-utils, Cypress.

## Global Constraints

- All work happens inside `src/frontend/`. Run all `npm` commands from `src/frontend/`.
- Import alias `@` resolves to `src/frontend/src` (already configured in `vite.config.ts`).
- Every component is its own file under `src/frontend/src/components/` (one component per file).
- TypeScript strict; no `any` in shipped code. Boundary types live in `src/types/invoice.ts`.
- Accessibility: semantic HTML, labelled inputs, keyboard operability, visible focus, `aria-live` for status, contrast AA, respect `prefers-reduced-motion`.
- Styling via CSS custom-property design tokens; support light + dark; scoped SFC styles; no horizontal body scroll (wide table scrolls in its own container).
- Currency formatted with `Intl.NumberFormat`; dates with `Intl.DateTimeFormat`; `null` fields render as em-dash `—`.
- Single source of truth for sample data: `src/frontend/src/mocks/samples.json` (drives both the PDF generator and the MSW mock).

---

## Task 1: Dependencies & data-layer bootstrap

**Files:**
- Modify: `src/frontend/package.json` (add deps)
- Modify: `src/frontend/src/main.ts`
- Modify: `src/frontend/src/App.vue`
- Modify: `src/frontend/src/__tests__/App.spec.ts`
- Modify: `src/frontend/src/router/index.ts`
- Delete: `src/frontend/src/stores/counter.ts`
- Modify: `src/frontend/vitest.config.ts`
- Create: `src/frontend/vitest.setup.ts`

**Interfaces:**
- Produces: a booting app with `VueQueryPlugin` installed and MSW started in dev; `/` route lazy-loading `@/views/HomeView.vue`; Vitest configured with an MSW node server via `vitest.setup.ts`.
- Consumes: nothing.

- [ ] **Step 1: Install dependencies**

Run (from `src/frontend/`):
```bash
npm install @tanstack/vue-query msw
npm install -D pdf-lib
npx msw init public --save
```
Expected: `@tanstack/vue-query` + `msw` in `dependencies`, `pdf-lib` in `devDependencies`, and `public/mockServiceWorker.js` created.

- [ ] **Step 2: Create a temporary HomeView placeholder so the router resolves**

Create `src/frontend/src/views/HomeView.vue`:
```vue
<script setup lang="ts"></script>

<template>
  <main><h1>invoice-kie</h1></main>
</template>
```
(Replaced fully in Task 12.)

- [ ] **Step 3: Wire the router**

Replace `src/frontend/src/router/index.ts`:
```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
  ],
})

export default router
```

- [ ] **Step 4: Render the router outlet from App.vue**

Replace `src/frontend/src/App.vue`:
```vue
<script setup lang="ts"></script>

<template>
  <RouterView />
</template>

<style scoped></style>
```

- [ ] **Step 5: Update the App test to the new render**

Replace `src/frontend/src/__tests__/App.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the router outlet', () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: true, RouterLink: RouterLinkStub },
      },
    })
    expect(wrapper.html()).toContain('router-view')
  })
})
```

- [ ] **Step 6: Delete the scaffold counter store**

Run:
```bash
git rm src/frontend/src/stores/counter.ts
```

- [ ] **Step 7: Install Vue Query and MSW in main.ts**

Replace `src/frontend/src/main.ts`:
```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'

async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(VueQueryPlugin)
  app.mount('#app')
})
```
(`./mocks/browser` is created in Task 5; until then dev boot logs a resolve warning that disappears after Task 5. Type-check/tests do not import it yet.)

- [ ] **Step 8: Add a Vitest setup file for the MSW node server**

Create `src/frontend/vitest.setup.ts`:
```ts
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './src/mocks/node'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
(`./src/mocks/node` is created in Task 5.)

- [ ] **Step 9: Register the setup file in Vitest**

In `src/frontend/vitest.config.ts`, add `setupFiles` inside `test`:
```ts
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      setupFiles: ['./vitest.setup.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
```

- [ ] **Step 10: Verify the existing test still passes**

Run: `npm run test:unit -- --run src/__tests__/App.spec.ts`
Expected: PASS. (This will error on the missing `mocks/node` import until Task 5 — if so, temporarily comment the two lines in `vitest.setup.ts`, or implement Task 5 next before running. Prefer implementing Task 5 before running the full suite.)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore(frontend): add vue-query + msw, wire router/query, drop counter store"
```

---

## Task 2: Boundary types

**Files:**
- Create: `src/frontend/src/types/invoice.ts`
- Test: `src/frontend/src/types/invoice.spec.ts`

**Interfaces:**
- Produces: `RunStatus`, `ExtractionResult`, `RunRow` types used by every later task.

- [ ] **Step 1: Write the failing test (type-level + a tiny factory)**

Create `src/frontend/src/types/invoice.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { emptyResult, type ExtractionResult, type RunRow } from './invoice'

describe('invoice types', () => {
  it('emptyResult has all fields null except currency/confidence', () => {
    const r: ExtractionResult = emptyResult()
    expect(r.invoiceNumber).toBeNull()
    expect(r.total).toBeNull()
    expect(r.currency).toBe('USD')
    expect(r.confidence).toBe(0)
  })

  it('a RunRow composes the result', () => {
    const row: RunRow = {
      id: 'x',
      fileName: 'a.pdf',
      status: 'idle',
      result: null,
      error: null,
    }
    expect(row.status).toBe('idle')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/types/invoice.spec.ts`
Expected: FAIL (`emptyResult` / module not found).

- [ ] **Step 3: Write the implementation**

Create `src/frontend/src/types/invoice.ts`:
```ts
export type RunStatus = 'idle' | 'running' | 'done' | 'error'

export interface ExtractionResult {
  invoiceNumber: string | null
  date: string | null // ISO yyyy-mm-dd
  subtotal: number | null // major units
  tax: number | null
  total: number | null
  currency: string
  confidence: number // 0..1
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
    invoiceNumber: null,
    date: null,
    subtotal: null,
    tax: null,
    total: null,
    currency: 'USD',
    confidence: 0,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- --run src/types/invoice.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/types/invoice.ts src/frontend/src/types/invoice.spec.ts
git commit -m "feat(frontend): add invoice boundary types"
```

---

## Task 3: Formatting utilities

**Files:**
- Create: `src/frontend/src/utils/format.ts`
- Test: `src/frontend/src/utils/format.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `formatCurrency(value: number | null, currency: string): string`, `formatDate(iso: string | null): string`, `formatConfidence(value: number | null): string`. All return the em-dash `—` for `null`.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/src/utils/format.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatConfidence, EM_DASH } from './format'

describe('formatCurrency', () => {
  it('formats a USD amount', () => {
    expect(formatCurrency(1339.2, 'USD')).toBe('$1,339.20')
  })
  it('returns em-dash for null', () => {
    expect(formatCurrency(null, 'USD')).toBe(EM_DASH)
  })
})

describe('formatDate', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2026-03-14')).toBe('Mar 14, 2026')
  })
  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe(EM_DASH)
  })
})

describe('formatConfidence', () => {
  it('formats a 0..1 value as a percent', () => {
    expect(formatConfidence(0.97)).toBe('97%')
  })
  it('returns em-dash for null', () => {
    expect(formatConfidence(null)).toBe(EM_DASH)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/utils/format.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/frontend/src/utils/format.ts`:
```ts
export const EM_DASH = '—'

export function formatCurrency(value: number | null, currency: string): string {
  if (value === null) return EM_DASH
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatDate(iso: string | null): string {
  if (iso === null) return EM_DASH
  // Parse as UTC to avoid timezone drift on a date-only string.
  const date = new Date(`${iso}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatConfidence(value: number | null): string {
  if (value === null) return EM_DASH
  return `${Math.round(value * 100)}%`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- --run src/utils/format.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/utils/format.ts src/frontend/src/utils/format.spec.ts
git commit -m "feat(frontend): add currency/date/confidence formatters"
```

---

## Task 4: Sample data + PDF generator

**Files:**
- Create: `src/frontend/src/mocks/samples.json`
- Create: `src/frontend/scripts/gen-samples.mjs`
- Modify: `src/frontend/package.json` (add `gen:samples` script)
- Generates: `src/data/acme-invoice.pdf`, `src/data/globex-invoice.pdf`, `src/frontend/public/samples/*.pdf`, `src/frontend/cypress/fixtures/acme-invoice.pdf`

**Interfaces:**
- Produces: `samples.json` — an array of sample records that drive both the generated PDFs and the MSW mock. Record shape:
  ```ts
  interface SampleRecord {
    fileName: string
    seller: string
    invoiceNumber: string
    date: string        // ISO yyyy-mm-dd
    currency: string
    lineItems: { description: string; amount: number }[]
    subtotal: number
    tax: number
    total: number
    confidence: number  // 0..1
  }
  ```

- [ ] **Step 1: Create the sample data**

Create `src/frontend/src/mocks/samples.json`:
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

- [ ] **Step 2: Write the generator script**

Create `src/frontend/scripts/gen-samples.mjs`:
```js
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const here = dirname(fileURLToPath(import.meta.url))
const frontendRoot = resolve(here, '..')
const repoRoot = resolve(frontendRoot, '..', '..')

const samples = JSON.parse(
  await readFile(resolve(frontendRoot, 'src/mocks/samples.json'), 'utf8'),
)

const money = (n, currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

async function buildPdf(sample) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4 portrait, points
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const ink = rgb(0.1, 0.1, 0.12)
  const muted = rgb(0.42, 0.45, 0.5)

  let y = 780
  const line = (text, { x = 50, size = 11, f = font, color = ink } = {}) => {
    page.drawText(String(text), { x, y, size, font: f, color })
  }

  line(sample.seller, { size: 22, f: bold })
  y -= 18
  line('INVOICE', { size: 12, f: bold, color: muted })
  y -= 40
  line(`Invoice #: ${sample.invoiceNumber}`, { f: bold })
  y -= 18
  line(`Date: ${sample.date}`, { color: muted })
  y -= 40

  line('Description', { f: bold })
  line('Amount', { x: 430, f: bold })
  y -= 6
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: muted,
  })
  y -= 22
  for (const item of sample.lineItems) {
    line(item.description)
    line(money(item.amount, sample.currency), { x: 430 })
    y -= 20
  }
  y -= 10
  line('Subtotal', { x: 350 })
  line(money(sample.subtotal, sample.currency), { x: 430 })
  y -= 18
  line('Tax', { x: 350 })
  line(money(sample.tax, sample.currency), { x: 430 })
  y -= 20
  line('Total', { x: 350, f: bold })
  line(money(sample.total, sample.currency), { x: 430, f: bold })

  return doc.save()
}

const outDirs = [
  resolve(repoRoot, 'src/data'),
  resolve(frontendRoot, 'public/samples'),
  resolve(frontendRoot, 'cypress/fixtures'),
]
for (const dir of outDirs) await mkdir(dir, { recursive: true })

for (const sample of samples) {
  const bytes = await buildPdf(sample)
  await writeFile(resolve(repoRoot, 'src/data', sample.fileName), bytes)
  await writeFile(resolve(frontendRoot, 'public/samples', sample.fileName), bytes)
}
// Only the first sample is needed as a Cypress fixture.
const first = samples[0]
const firstBytes = await buildPdf(first)
await writeFile(resolve(frontendRoot, 'cypress/fixtures', first.fileName), firstBytes)

console.log(`Generated ${samples.length} sample PDF(s).`)
```

- [ ] **Step 3: Add the npm script**

In `src/frontend/package.json` `scripts`, add:
```json
    "gen:samples": "node scripts/gen-samples.mjs",
```

- [ ] **Step 4: Generate the PDFs**

Run (from `src/frontend/`): `npm run gen:samples`
Expected: `Generated 2 sample PDF(s).` and the files exist.

- [ ] **Step 5: Verify the PDFs are valid**

Run: `node -e "const fs=require('fs');const b=fs.readFileSync('public/samples/acme-invoice.pdf');console.log(b.slice(0,5).toString())"`
Expected: prints `%PDF-` .

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/mocks/samples.json src/frontend/scripts/gen-samples.mjs src/frontend/package.json src/frontend/package-lock.json
git add src/frontend/public/samples src/frontend/cypress/fixtures src/data
git commit -m "feat(frontend): generate sample invoice PDFs from samples.json"
```

---

## Task 5: MSW handlers (browser + node)

**Files:**
- Create: `src/frontend/src/mocks/handlers.ts`
- Create: `src/frontend/src/mocks/browser.ts`
- Create: `src/frontend/src/mocks/node.ts`
- Test: `src/frontend/src/mocks/handlers.spec.ts`

**Interfaces:**
- Consumes: `samples.json` (Task 4), `ExtractionResult` (Task 2).
- Produces: MSW handler for `POST /api/extract`. Given multipart form-data with a `file`, returns the matching sample's `ExtractionResult` (matched by filename); unknown files get a generic result; a file named `fail.pdf` returns HTTP 500. `worker` (browser) and `server` (node) exports.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/src/mocks/handlers.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'

async function post(fileName: string) {
  const file = new File(['%PDF-1.4'], fileName, { type: 'application/pdf' })
  const body = new FormData()
  body.append('file', file)
  return fetch('/api/extract', { method: 'POST', body })
}

describe('POST /api/extract (MSW)', () => {
  it('returns the matching sample result for a known file', async () => {
    const res = await post('acme-invoice.pdf')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.invoiceNumber).toBe('INV-2041')
    expect(json.total).toBe(1339.2)
    expect(json.currency).toBe('USD')
  })

  it('returns a generic result for an unknown file', async () => {
    const res = await post('mystery.pdf')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.invoiceNumber).toMatch(/^INV-/)
    expect(typeof json.total).toBe('number')
  })

  it('returns 500 for fail.pdf', async () => {
    const res = await post('fail.pdf')
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/mocks/handlers.spec.ts`
Expected: FAIL (module `./node` / handlers not found; setup file import unresolved).

- [ ] **Step 3: Write the handlers**

Create `src/frontend/src/mocks/handlers.ts`:
```ts
import { http, HttpResponse, delay } from 'msw'
import type { ExtractionResult } from '@/types/invoice'
import samples from './samples.json'

const bySample: Record<string, ExtractionResult> = Object.fromEntries(
  samples.map((s) => [
    s.fileName,
    {
      invoiceNumber: s.invoiceNumber,
      date: s.date,
      subtotal: s.subtotal,
      tax: s.tax,
      total: s.total,
      currency: s.currency,
      confidence: s.confidence,
    },
  ]),
)

const generic: ExtractionResult = {
  invoiceNumber: 'INV-0000',
  date: '2026-01-01',
  subtotal: 1000,
  tax: 80,
  total: 1080,
  currency: 'USD',
  confidence: 0.82,
}

export const handlers = [
  http.post('/api/extract', async ({ request }) => {
    const form = await request.formData()
    const file = form.get('file')
    const name = file instanceof File ? file.name : ''

    if (name === 'fail.pdf') {
      await delay(400)
      return HttpResponse.json({ message: 'Extraction failed' }, { status: 500 })
    }

    await delay(1200)
    return HttpResponse.json(bySample[name] ?? generic)
  }),
]
```

Create `src/frontend/src/mocks/browser.ts`:
```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

Create `src/frontend/src/mocks/node.ts`:
```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 4: Allow JSON module imports (if type-check complains)**

Ensure `resolveJsonModule` is effectively on (Vite handles runtime; for `vue-tsc` the `@vue/tsconfig` base enables it). If `vue-tsc` errors on the `samples.json` import, add to `src/frontend/tsconfig.app.json` `compilerOptions`: `"resolveJsonModule": true`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:unit -- --run src/mocks/handlers.spec.ts`
Expected: PASS (all three cases). Also re-run App test to confirm the setup file now resolves: `npm run test:unit -- --run src/__tests__/App.spec.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/src/mocks
git commit -m "feat(frontend): add MSW /api/extract mock (browser + node)"
```

---

## Task 6: API client

**Files:**
- Create: `src/frontend/src/api/extractClient.ts`
- Test: `src/frontend/src/api/extractClient.spec.ts`

**Interfaces:**
- Consumes: MSW handler (Task 5), `ExtractionResult` (Task 2).
- Produces: `postExtract(file: File): Promise<ExtractionResult>` — POSTs multipart to `/api/extract`; throws `Error` on non-2xx.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/src/api/extractClient.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { postExtract } from './extractClient'

const pdf = (name: string) =>
  new File(['%PDF-1.4'], name, { type: 'application/pdf' })

describe('postExtract', () => {
  it('resolves to the extraction result', async () => {
    const result = await postExtract(pdf('acme-invoice.pdf'))
    expect(result.invoiceNumber).toBe('INV-2041')
    expect(result.total).toBe(1339.2)
  })

  it('throws on a server error', async () => {
    await expect(postExtract(pdf('fail.pdf'))).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/api/extractClient.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/frontend/src/api/extractClient.ts`:
```ts
import type { ExtractionResult } from '@/types/invoice'

const EXTRACT_URL = '/api/extract'

export async function postExtract(file: File): Promise<ExtractionResult> {
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(EXTRACT_URL, { method: 'POST', body })
  if (!res.ok) {
    throw new Error(`Extraction failed (${res.status})`)
  }
  return (await res.json()) as ExtractionResult
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- --run src/api/extractClient.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/api
git commit -m "feat(frontend): add extract API client"
```

---

## Task 7: Runs Pinia store

**Files:**
- Create: `src/frontend/src/stores/runs.ts`
- Test: `src/frontend/src/stores/runs.spec.ts`

**Interfaces:**
- Consumes: `RunRow`, `RunStatus`, `ExtractionResult` (Task 2).
- Produces: `useRunsStore()` setup store with `rows: Ref<RunRow[]>`, and actions `addFile(fileName: string): string` (returns new row id), `markRunning(id)`, `markDone(id, result)`, `markError(id, message)`, `reset()`. New rows start `status: 'idle'`. IDs are generated with `crypto.randomUUID()`.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/src/stores/runs.spec.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRunsStore } from './runs'
import { emptyResult } from '@/types/invoice'

describe('runs store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds an idle row and returns its id', () => {
    const store = useRunsStore()
    const id = store.addFile('acme-invoice.pdf')
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0]).toMatchObject({ id, fileName: 'acme-invoice.pdf', status: 'idle' })
  })

  it('transitions running -> done with a result', () => {
    const store = useRunsStore()
    const id = store.addFile('a.pdf')
    store.markRunning(id)
    expect(store.rows[0].status).toBe('running')
    const result = { ...emptyResult(), total: 10 }
    store.markDone(id, result)
    expect(store.rows[0].status).toBe('done')
    expect(store.rows[0].result?.total).toBe(10)
  })

  it('records an error', () => {
    const store = useRunsStore()
    const id = store.addFile('a.pdf')
    store.markError(id, 'boom')
    expect(store.rows[0].status).toBe('error')
    expect(store.rows[0].error).toBe('boom')
  })

  it('reset clears rows', () => {
    const store = useRunsStore()
    store.addFile('a.pdf')
    store.reset()
    expect(store.rows).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/stores/runs.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/frontend/src/stores/runs.ts`:
```ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ExtractionResult, RunRow } from '@/types/invoice'

export const useRunsStore = defineStore('runs', () => {
  const rows = ref<RunRow[]>([])

  function find(id: string): RunRow | undefined {
    return rows.value.find((r) => r.id === id)
  }

  function addFile(fileName: string): string {
    const id = crypto.randomUUID()
    rows.value.push({ id, fileName, status: 'idle', result: null, error: null })
    return id
  }

  function markRunning(id: string) {
    const row = find(id)
    if (row) {
      row.status = 'running'
      row.error = null
    }
  }

  function markDone(id: string, result: ExtractionResult) {
    const row = find(id)
    if (row) {
      row.status = 'done'
      row.result = result
    }
  }

  function markError(id: string, message: string) {
    const row = find(id)
    if (row) {
      row.status = 'error'
      row.error = message
    }
  }

  function reset() {
    rows.value = []
  }

  return { rows, addFile, markRunning, markDone, markError, reset }
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- --run src/stores/runs.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/stores/runs.ts src/frontend/src/stores/runs.spec.ts
git commit -m "feat(frontend): add runs Pinia store"
```

---

## Task 8: useExtraction composable

**Files:**
- Create: `src/frontend/src/composables/useExtraction.ts`
- Test: `src/frontend/src/composables/useExtraction.spec.ts`

**Interfaces:**
- Consumes: `postExtract` (Task 6), `useRunsStore` (Task 7).
- Produces: `useExtraction()` returning `{ run(rowId: string, file: File): Promise<void>, isPending: Ref<boolean> }`. `run` marks the row running, calls the API via a Vue Query mutation, then marks the row done or error.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/src/composables/useExtraction.spec.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { useExtraction } from './useExtraction'
import { useRunsStore } from '@/stores/runs'

const pdf = (name: string) =>
  new File(['%PDF-1.4'], name, { type: 'application/pdf' })

// Mount a host component so the composable runs inside a Vue Query context.
function withComposable() {
  let api!: ReturnType<typeof useExtraction>
  const Host = defineComponent({
    setup() {
      api = useExtraction()
      return () => h('div')
    },
  })
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return api
}

describe('useExtraction', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('marks the row done with the extracted result', async () => {
    const store = useRunsStore()
    const id = store.addFile('acme-invoice.pdf')
    const api = withComposable()
    await api.run(id, pdf('acme-invoice.pdf'))
    await flushPromises()
    expect(store.rows[0].status).toBe('done')
    expect(store.rows[0].result?.invoiceNumber).toBe('INV-2041')
  })

  it('marks the row error on failure', async () => {
    const store = useRunsStore()
    const id = store.addFile('fail.pdf')
    const api = withComposable()
    await api.run(id, pdf('fail.pdf'))
    await flushPromises()
    expect(store.rows[0].status).toBe('error')
    expect(store.rows[0].error).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/composables/useExtraction.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

Create `src/frontend/src/composables/useExtraction.ts`:
```ts
import { useMutation } from '@tanstack/vue-query'
import { postExtract } from '@/api/extractClient'
import { useRunsStore } from '@/stores/runs'

export function useExtraction() {
  const runs = useRunsStore()

  const mutation = useMutation({
    mutationFn: (file: File) => postExtract(file),
  })

  async function run(rowId: string, file: File): Promise<void> {
    runs.markRunning(rowId)
    try {
      const result = await mutation.mutateAsync(file)
      runs.markDone(rowId, result)
    } catch (err) {
      runs.markError(rowId, err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return { run, isPending: mutation.isPending }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- --run src/composables/useExtraction.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/composables
git commit -m "feat(frontend): add useExtraction mutation composable"
```

---

## Task 9: Design tokens & base styles

**Files:**
- Create: `src/frontend/src/assets/tokens.css`
- Modify: `src/frontend/src/main.ts` (import tokens)

**Interfaces:**
- Produces: CSS custom properties (color, spacing, radius, font) on `:root` with a `prefers-color-scheme: dark` block and a `[data-theme="dark"]` / `[data-theme="light"]` override. Consumed by all component `<style scoped>` blocks.

- [ ] **Step 1: Create the tokens stylesheet**

Create `src/frontend/src/assets/tokens.css`:
```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --radius: 8px;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  --bg: #ffffff;
  --surface: #f7f8fa;
  --border: #e2e5ea;
  --text: #1a1c20;
  --text-muted: #5b6270;
  --accent: #2563eb;
  --accent-contrast: #ffffff;
  --success: #15803d;
  --danger: #b91c1c;
  --focus: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f1115;
    --surface: #171a21;
    --border: #2a2f3a;
    --text: #e6e8ec;
    --text-muted: #9aa2b1;
    --accent: #60a5fa;
    --accent-contrast: #0f1115;
    --success: #4ade80;
    --danger: #f87171;
    --focus: #60a5fa;
  }
}

:root[data-theme='light'] {
  --bg: #ffffff;
  --surface: #f7f8fa;
  --border: #e2e5ea;
  --text: #1a1c20;
  --text-muted: #5b6270;
  --accent: #2563eb;
  --accent-contrast: #ffffff;
  --success: #15803d;
  --danger: #b91c1c;
  --focus: #2563eb;
}

:root[data-theme='dark'] {
  --bg: #0f1115;
  --surface: #171a21;
  --border: #2a2f3a;
  --text: #e6e8ec;
  --text-muted: #9aa2b1;
  --accent: #60a5fa;
  --accent-contrast: #0f1115;
  --success: #4ade80;
  --danger: #f87171;
  --focus: #60a5fa;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.5;
}

:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Import the tokens in main.ts**

At the top of `src/frontend/src/main.ts`, add:
```ts
import './assets/tokens.css'
```

- [ ] **Step 3: Verify the app type-checks**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/src/assets/tokens.css src/frontend/src/main.ts
git commit -m "feat(frontend): add design tokens with light/dark themes"
```

---

## Task 10: Presentational components (StatusBadge, PipelineDiagram, AppHeader)

**Files:**
- Create: `src/frontend/src/components/StatusBadge.vue`
- Create: `src/frontend/src/components/PipelineDiagram.vue`
- Create: `src/frontend/src/components/AppHeader.vue`
- Test: `src/frontend/src/components/StatusBadge.spec.ts`

**Interfaces:**
- `StatusBadge.vue` — props `{ status: RunStatus }`; renders a pill with the human label (`Idle`/`Running`/`Done`/`Error`) and a variant class. Consumes `RunStatus` (Task 2).
- `PipelineDiagram.vue` — no props; renders the four pipeline stages as an ordered list.
- `AppHeader.vue` — no props; renders the app `<h1>` and a one-line description.

- [ ] **Step 1: Write the failing test (StatusBadge)**

Create `src/frontend/src/components/StatusBadge.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders the human label for each status', () => {
    expect(mount(StatusBadge, { props: { status: 'idle' } }).text()).toBe('Idle')
    expect(mount(StatusBadge, { props: { status: 'running' } }).text()).toBe('Running')
    expect(mount(StatusBadge, { props: { status: 'done' } }).text()).toBe('Done')
    expect(mount(StatusBadge, { props: { status: 'error' } }).text()).toBe('Error')
  })

  it('applies a status-specific class', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'error' } })
    expect(wrapper.classes()).toContain('badge--error')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/components/StatusBadge.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write StatusBadge.vue**

Create `src/frontend/src/components/StatusBadge.vue`:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { RunStatus } from '@/types/invoice'

const props = defineProps<{ status: RunStatus }>()

const LABELS: Record<RunStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  done: 'Done',
  error: 'Error',
}

const label = computed(() => LABELS[props.status])
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ label }}</span>
</template>

<style scoped>
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
.badge--running {
  color: var(--accent);
  border-color: var(--accent);
}
.badge--done {
  color: var(--success);
  border-color: var(--success);
}
.badge--error {
  color: var(--danger);
  border-color: var(--danger);
}
</style>
```

- [ ] **Step 4: Write PipelineDiagram.vue**

Create `src/frontend/src/components/PipelineDiagram.vue`:
```vue
<script setup lang="ts">
const stages = ['PDF', 'OCR (tokens + layout)', 'LayoutLMv3 tagging', 'Normalized JSON']
</script>

<template>
  <section aria-labelledby="pipeline-heading" class="pipeline">
    <h2 id="pipeline-heading" class="pipeline__title">How it works</h2>
    <ol class="pipeline__steps">
      <li v-for="(stage, i) in stages" :key="stage" class="pipeline__step">
        <span class="pipeline__index">{{ i + 1 }}</span>
        <span>{{ stage }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.pipeline__title {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0 0 var(--space-3);
}
.pipeline__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.pipeline__step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 0.9rem;
}
.pipeline__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 0.8rem;
  font-weight: 700;
}
</style>
```

- [ ] **Step 5: Write AppHeader.vue**

Create `src/frontend/src/components/AppHeader.vue`:
```vue
<script setup lang="ts"></script>

<template>
  <header class="app-header">
    <h1 class="app-header__title">invoice-kie</h1>
    <p class="app-header__tagline">
      Download a sample invoice, upload it, and run it through the extraction pipeline.
    </p>
  </header>
</template>

<style scoped>
.app-header__title {
  margin: 0;
  font-size: 1.6rem;
}
.app-header__tagline {
  margin: var(--space-2) 0 0;
  color: var(--text-muted);
}
</style>
```

- [ ] **Step 6: Run the StatusBadge test to verify it passes**

Run: `npm run test:unit -- --run src/components/StatusBadge.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/frontend/src/components/StatusBadge.vue src/frontend/src/components/StatusBadge.spec.ts src/frontend/src/components/PipelineDiagram.vue src/frontend/src/components/AppHeader.vue
git commit -m "feat(frontend): add StatusBadge, PipelineDiagram, AppHeader"
```

---

## Task 11: SampleDownload, UploadDropzone, RunButton, ExtractionTable

**Files:**
- Create: `src/frontend/src/components/SampleDownload.vue`
- Create: `src/frontend/src/components/UploadDropzone.vue`
- Create: `src/frontend/src/components/RunButton.vue`
- Create: `src/frontend/src/components/ExtractionTable.vue`
- Test: `src/frontend/src/components/UploadDropzone.spec.ts`
- Test: `src/frontend/src/components/ExtractionTable.spec.ts`

**Interfaces:**
- `SampleDownload.vue` — no props; renders `<a download>` links to `/samples/<fileName>` from `samples.json`.
- `UploadDropzone.vue` — emits `file(file: File)` when a valid `.pdf` is selected/dropped; shows an `aria-live` error and emits nothing for non-PDFs.
- `RunButton.vue` — props `{ disabled?: boolean; pending?: boolean }`; emits `run`; shows "Running…" and is disabled while `pending` or `disabled`.
- `ExtractionTable.vue` — props `{ rows: RunRow[] }`; renders the empty state when `rows` is empty, otherwise a semantic table using `formatCurrency`/`formatDate`/`formatConfidence` and `StatusBadge`. Consumes `RunRow` (Task 2), formatters (Task 3), `StatusBadge` (Task 10).

- [ ] **Step 1: Write the failing tests**

Create `src/frontend/src/components/UploadDropzone.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UploadDropzone from './UploadDropzone.vue'

function fileList(...files: File[]): FileList {
  return {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    ...files,
  } as unknown as FileList
}

describe('UploadDropzone', () => {
  it('emits file for a valid pdf', async () => {
    const wrapper = mount(UploadDropzone)
    const input = wrapper.get('input[type="file"]')
    const pdf = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: fileList(pdf) })
    await input.trigger('change')
    expect(wrapper.emitted('file')?.[0][0]).toBe(pdf)
  })

  it('rejects a non-pdf with an announced error and emits nothing', async () => {
    const wrapper = mount(UploadDropzone)
    const input = wrapper.get('input[type="file"]')
    const txt = new File(['hi'], 'a.txt', { type: 'text/plain' })
    Object.defineProperty(input.element, 'files', { value: fileList(txt) })
    await input.trigger('change')
    expect(wrapper.emitted('file')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toMatch(/pdf/i)
  })
})
```

Create `src/frontend/src/components/ExtractionTable.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExtractionTable from './ExtractionTable.vue'
import type { RunRow } from '@/types/invoice'

const doneRow: RunRow = {
  id: '1',
  fileName: 'acme-invoice.pdf',
  status: 'done',
  error: null,
  result: {
    invoiceNumber: 'INV-2041',
    date: '2026-03-14',
    subtotal: 1240,
    tax: 99.2,
    total: 1339.2,
    currency: 'USD',
    confidence: 0.97,
  },
}

describe('ExtractionTable', () => {
  it('shows an empty state when there are no rows', () => {
    const wrapper = mount(ExtractionTable, { props: { rows: [] } })
    expect(wrapper.text()).toMatch(/no invoices yet/i)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('renders a formatted row', () => {
    const wrapper = mount(ExtractionTable, { props: { rows: [doneRow] } })
    const text = wrapper.text()
    expect(text).toContain('acme-invoice.pdf')
    expect(text).toContain('INV-2041')
    expect(text).toContain('$1,339.20')
    expect(text).toContain('Mar 14, 2026')
    expect(text).toContain('97%')
  })

  it('renders em-dashes for a row with no result', () => {
    const idleRow: RunRow = {
      id: '2',
      fileName: 'x.pdf',
      status: 'idle',
      error: null,
      result: null,
    }
    const wrapper = mount(ExtractionTable, { props: { rows: [idleRow] } })
    expect(wrapper.text()).toContain('—')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -- --run src/components/UploadDropzone.spec.ts src/components/ExtractionTable.spec.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write SampleDownload.vue**

Create `src/frontend/src/components/SampleDownload.vue`:
```vue
<script setup lang="ts">
import samples from '@/mocks/samples.json'

const files = samples.map((s) => ({ fileName: s.fileName, seller: s.seller }))
</script>

<template>
  <section aria-labelledby="samples-heading" class="samples">
    <h2 id="samples-heading" class="samples__title">1. Download a test invoice</h2>
    <ul class="samples__list">
      <li v-for="f in files" :key="f.fileName">
        <a class="samples__link" :href="`/samples/${f.fileName}`" :download="f.fileName">
          ⬇ {{ f.seller }} — {{ f.fileName }}
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.samples__title {
  font-size: 1rem;
  margin: 0 0 var(--space-3);
}
.samples__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.samples__link {
  display: inline-block;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--accent);
  text-decoration: none;
  width: fit-content;
}
.samples__link:hover {
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 4: Write UploadDropzone.vue**

Create `src/frontend/src/components/UploadDropzone.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ file: [file: File] }>()

const error = ref<string | null>(null)
const dragover = ref(false)

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function handle(file: File | undefined) {
  if (!file) return
  if (!isPdf(file)) {
    error.value = 'Please choose a PDF file.'
    return
  }
  error.value = null
  emit('file', file)
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  handle(input.files?.[0])
  input.value = '' // allow re-selecting the same file
}

function onDrop(event: DragEvent) {
  dragover.value = false
  handle(event.dataTransfer?.files?.[0])
}
</script>

<template>
  <section aria-labelledby="upload-heading" class="upload">
    <h2 id="upload-heading" class="upload__title">2. Upload the invoice</h2>
    <label
      class="upload__zone"
      :class="{ 'upload__zone--over': dragover }"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="onDrop"
    >
      <span>Drag a PDF here, or <strong>browse</strong></span>
      <input class="upload__input" type="file" accept="application/pdf,.pdf" @change="onChange" />
    </label>
    <p v-if="error" role="alert" class="upload__error">{{ error }}</p>
  </section>
</template>

<style scoped>
.upload__title {
  font-size: 1rem;
  margin: 0 0 var(--space-3);
}
.upload__zone {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
  text-align: center;
}
.upload__zone--over {
  border-color: var(--accent);
}
.upload__zone:focus-within {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
.upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.upload__error {
  color: var(--danger);
  margin: var(--space-2) 0 0;
}
</style>
```

- [ ] **Step 5: Write RunButton.vue**

Create `src/frontend/src/components/RunButton.vue`:
```vue
<script setup lang="ts">
const props = defineProps<{ disabled?: boolean; pending?: boolean }>()
const emit = defineEmits<{ run: [] }>()
</script>

<template>
  <button
    type="button"
    class="run-button"
    :disabled="props.disabled || props.pending"
    @click="emit('run')"
  >
    {{ props.pending ? 'Running…' : 'Run extraction' }}
  </button>
</template>

<style scoped>
.run-button {
  padding: var(--space-2) var(--space-6);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
  cursor: pointer;
}
.run-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 6: Write ExtractionTable.vue**

Create `src/frontend/src/components/ExtractionTable.vue`:
```vue
<script setup lang="ts">
import type { RunRow } from '@/types/invoice'
import { formatCurrency, formatDate, formatConfidence, EM_DASH } from '@/utils/format'
import StatusBadge from './StatusBadge.vue'

defineProps<{ rows: RunRow[] }>()
</script>

<template>
  <section aria-labelledby="results-heading" class="results">
    <h2 id="results-heading" class="results__title">Extracted fields</h2>

    <p v-if="rows.length === 0" class="results__empty">
      No invoices yet. Download a sample above, then upload it to see the extracted fields.
    </p>

    <div v-else class="results__scroll">
      <table class="results__table">
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
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.fileName }}</td>
            <td>{{ row.result?.invoiceNumber ?? EM_DASH }}</td>
            <td>{{ formatDate(row.result?.date ?? null) }}</td>
            <td>{{ formatCurrency(row.result?.subtotal ?? null, row.result?.currency ?? 'USD') }}</td>
            <td>{{ formatCurrency(row.result?.tax ?? null, row.result?.currency ?? 'USD') }}</td>
            <td>{{ formatCurrency(row.result?.total ?? null, row.result?.currency ?? 'USD') }}</td>
            <td>{{ formatConfidence(row.result?.confidence ?? null) }}</td>
            <td><StatusBadge :status="row.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.results__title {
  font-size: 1rem;
  margin: 0 0 var(--space-3);
}
.results__empty {
  color: var(--text-muted);
  padding: var(--space-6);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  text-align: center;
}
.results__scroll {
  overflow-x: auto;
}
.results__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
.results__table th,
.results__table td {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.results__table th {
  color: var(--text-muted);
  font-weight: 600;
}
</style>
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm run test:unit -- --run src/components/UploadDropzone.spec.ts src/components/ExtractionTable.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/frontend/src/components
git commit -m "feat(frontend): add SampleDownload, UploadDropzone, RunButton, ExtractionTable"
```

---

## Task 12: HomeView integration

**Files:**
- Modify: `src/frontend/src/views/HomeView.vue` (replace placeholder)
- Test: `src/frontend/src/views/HomeView.spec.ts`

**Interfaces:**
- Consumes: all components (Tasks 10–11), `useRunsStore` (Task 7), `useExtraction` (Task 8).
- Produces: the full page. On `file` from the dropzone it adds a row (idle) and remembers the pending file; on `run` it calls `useExtraction().run` for each idle row's file; renders `ExtractionTable` from the store; announces status via `aria-live`.

- [ ] **Step 1: Write the failing integration test**

Create `src/frontend/src/views/HomeView.spec.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from './HomeView.vue'

function mountView() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return mount(HomeView, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  })
}

describe('HomeView', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds a row on upload and populates it on run', async () => {
    const wrapper = mountView()
    const input = wrapper.get('input[type="file"]')
    const pdf = new File(['%PDF-1.4'], 'acme-invoice.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', {
      value: { length: 1, 0: pdf, item: () => pdf },
    })
    await input.trigger('change')
    expect(wrapper.text()).toContain('acme-invoice.pdf')

    await wrapper.get('.run-button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('INV-2041')
    expect(wrapper.text()).toContain('$1,339.20')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- --run src/views/HomeView.spec.ts`
Expected: FAIL (placeholder HomeView has no upload input).

- [ ] **Step 3: Write HomeView.vue**

Replace `src/frontend/src/views/HomeView.vue`:
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import PipelineDiagram from '@/components/PipelineDiagram.vue'
import SampleDownload from '@/components/SampleDownload.vue'
import UploadDropzone from '@/components/UploadDropzone.vue'
import RunButton from '@/components/RunButton.vue'
import ExtractionTable from '@/components/ExtractionTable.vue'
import { useRunsStore } from '@/stores/runs'
import { useExtraction } from '@/composables/useExtraction'

const runs = useRunsStore()
const { run, isPending } = useExtraction()

// Pending files keyed by the row id they created.
const pending = ref(new Map<string, File>())

const hasIdle = computed(() => runs.rows.some((r) => r.status === 'idle'))

const announcement = computed(() => {
  if (isPending.value) return 'Running extraction…'
  const last = runs.rows[runs.rows.length - 1]
  if (!last) return ''
  if (last.status === 'done') return `Extraction complete for ${last.fileName}.`
  if (last.status === 'error') return `Extraction failed for ${last.fileName}.`
  return ''
})

function onFile(file: File) {
  const id = runs.addFile(file.name)
  pending.value.set(id, file)
}

async function onRun() {
  const idle = runs.rows.filter((r) => r.status === 'idle')
  for (const row of idle) {
    const file = pending.value.get(row.id)
    if (file) {
      await run(row.id, file)
      pending.value.delete(row.id)
    }
  }
}
</script>

<template>
  <main class="home">
    <AppHeader />
    <PipelineDiagram />

    <div class="home__actions">
      <SampleDownload />
      <div class="home__upload">
        <UploadDropzone @file="onFile" />
        <RunButton :disabled="!hasIdle" :pending="isPending" @run="onRun" />
      </div>
    </div>

    <ExtractionTable :rows="runs.rows" />

    <p class="visually-hidden" role="status" aria-live="polite">{{ announcement }}</p>
  </main>
</template>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}
.home__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}
@media (min-width: 720px) {
  .home__actions {
    grid-template-columns: 1fr 1fr;
  }
}
.home__upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- --run src/views/HomeView.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/src/views/HomeView.vue src/frontend/src/views/HomeView.spec.ts
git commit -m "feat(frontend): wire HomeView (upload -> run -> results)"
```

---

## Task 13: Cypress e2e happy path

**Files:**
- Modify: `src/frontend/cypress/e2e/example.cy.ts` → rename to `src/frontend/cypress/e2e/extract.cy.ts`
- Uses fixture: `src/frontend/cypress/fixtures/acme-invoice.pdf` (created in Task 4)

**Interfaces:**
- Consumes: the running dev/preview app with MSW active.

- [ ] **Step 1: Replace the example e2e spec**

Run: `git mv src/frontend/cypress/e2e/example.cy.ts src/frontend/cypress/e2e/extract.cy.ts`

Then replace `src/frontend/cypress/e2e/extract.cy.ts`:
```ts
describe('invoice extraction', () => {
  it('uploads a sample and shows extracted fields', () => {
    cy.visit('/')
    cy.get('input[type="file"]').selectFile('cypress/fixtures/acme-invoice.pdf', {
      force: true,
    })
    cy.contains('acme-invoice.pdf')
    cy.get('.run-button').click()
    cy.contains('INV-2041', { timeout: 10000 })
    cy.contains('$1,339.20')
    cy.contains('Done')
  })
})
```

- [ ] **Step 2: Ensure MSW runs under the preview build**

MSW currently starts only in `import.meta.env.DEV` (Task 1). For `test:e2e` (preview build) the mock must also run. In `src/frontend/src/main.ts`, change the guard in `enableMocking` from `if (!import.meta.env.DEV) return` to:
```ts
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS !== 'true') return
```
Then run e2e against the dev server (which is simplest and always has mocks): use `npm run test:e2e:dev`. (The `VITE_ENABLE_MOCKS` hook lets a future CI enable mocks on the preview build without code changes.)

- [ ] **Step 3: Run the e2e test**

Run (from `src/frontend/`): `npm run test:e2e:dev` (Cypress opens; run the `extract` spec) — or headless once configured. Expected: the spec passes; the row shows `INV-2041`, `$1,339.20`, `Done`.

- [ ] **Step 4: Commit**

```bash
git add src/frontend/cypress/e2e/extract.cy.ts src/frontend/src/main.ts
git commit -m "test(frontend): add e2e happy path for invoice extraction"
```

---

## Task 14: Full verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Type-check**

Run (from `src/frontend/`): `npm run type-check`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors (auto-fixes applied are fine; re-commit if files change).

- [ ] **Step 3: Full unit suite**

Run: `npm run test:unit -- --run`
Expected: all suites PASS.

- [ ] **Step 4: Dev smoke test**

Run: `npm run dev`, open the app, confirm: download a sample, upload it, click Run, watch the row go Running → Done with populated fields; toggle OS dark mode to confirm theming; tab through with the keyboard to confirm focus rings and that the dropzone is reachable.

- [ ] **Step 5: Commit any lint/format fixups**

```bash
git add -A
git commit -m "chore(frontend): lint/format fixups" || echo "nothing to commit"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** download samples (Task 4, 11 `SampleDownload`), upload + validation (Task 11 `UploadDropzone`), run via stubbed API (Tasks 5, 6, 8), blank table + populated states (Task 11 `ExtractionTable`), pipeline visual (Task 10 `PipelineDiagram`), Pinia client state (Task 7), types (Task 2), formatting/em-dash (Task 3), a11y/tokens/theme (Task 9, components), tests incl. e2e (every task + Task 13). All spec sections mapped.

**Placeholder scan:** none — every code step contains full code; the Task 1 HomeView placeholder is intentional and fully replaced in Task 12.

**Type consistency:** `ExtractionResult`/`RunRow`/`RunStatus` used consistently; store actions (`addFile`/`markRunning`/`markDone`/`markError`/`reset`) match between Task 7 definition and Task 8/12 use; `postExtract(file)` signature matches across Tasks 6/8; formatter names (`formatCurrency`/`formatDate`/`formatConfidence`/`EM_DASH`) consistent Tasks 3/11.
