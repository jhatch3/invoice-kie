# Design Tokens — Clean/Minimal SaaS

The point of a token system is that every visual decision traces back to one
committed source, so nothing drifts toward the default. This file gives you a
starting system and, more importantly, the *rules* for tuning it to a specific
product. Don't paste the example values verbatim across every project — that
just creates a new default. Tune the accent and neutral temperature to the
subject.

## Table of contents
1. Color
2. Typography
3. Spacing & sizing
4. Radius
5. Elevation (instead of borders)
6. Motion
7. Wiring into shadcn (`globals.css` + Tailwind)

---

## 1. Color

**Rules**
- One brand accent. One. Everything else is neutral + semantic.
- The accent is **not** default Tailwind blue (`#3B82F6`) or violet (`#8B5CF6`).
  Those two colors are the single biggest "AI built this" tell.
- Give the neutral ramp a temperature. Pure gray (`#808080` family) reads
  lifeless. Nudge it slightly warm (toward stone) or slightly cool (toward
  slate) and keep it consistent.
- Semantic colors (success / warning / danger / info) are muted, not fully
  saturated. Saturated system colors look like a bootstrap template.
- Backgrounds separate by lightness, not by borders. Reserve 2–3 background
  levels: page, raised surface, sunken/input.

**Example ramp (cool neutral + a considered accent).** Replace the accent with
one that suits the product — a document-extraction tool might use a precise
ink-blue or a signal teal, not a generic blue.

```
Neutral (cool slate)
--bg            #FBFCFD   page background
--surface       #FFFFFF   raised card/surface
--surface-sunk  #F4F6F8   inputs, wells
--border        #E3E8EE   only when a hairline is truly needed
--muted-fg      #5B6672   secondary text
--fg            #1A2129   primary text (not pure black)

Accent (example: ink teal — pick your own)
--accent        #0E7C86
--accent-hover  #0B656D
--accent-fg     #FFFFFF   text on accent

Semantic (muted)
--success       #2E7D5B
--warning       #B4791F
--danger        #C0463B
```

Notes:
- `--fg` is near-black, not `#000`. Pure black on white is harsh and, oddly,
  reads cheaper.
- Contrast: check text/background pairs with **APCA** (the modern contrast
  model), aiming for Lc 75+ for body text, Lc 60+ for large text. WCAG 2 ratios
  are the fallback if APCA isn't available.

---

## 2. Typography

**The tell:** Inter (or the shadcn default) used for headings, body, and UI
alike, at default tracking. It's not ugly — it's just what every generated app
ships.

**Rules**
- Two roles minimum: a **display/heading** face with some character, and a
  clean **body/UI** face. A third **mono/data** face if the product shows code,
  IDs, or numbers (a data-extraction tool does — use it for extracted values).
- Headings want deliberate tracking. Large headings almost always read better
  `tracking-tight` (≈ -0.02em). Don't leave them at default.
- Set a real scale and stick to it. Example modular scale (1.25):
  `12 / 14 / 16 / 20 / 25 / 31 / 39 / 49 px`. Map these to Tailwind's `text-*`
  or custom values; don't hand-pick arbitrary sizes per component.
- Weight is a design axis: pick 2–3 weights (e.g. 400 body, 500 UI labels,
  600/700 headings) and don't sprinkle others.

**Non-default pairings for clean/minimal SaaS** (all free / Google-hostable via
`next/font`):
- **Geist** (display + body) + **Geist Mono** — Vercel's family; crisp,
  contemporary, reads as "designed" without shouting. Good default upgrade.
- **General Sans** (display) + **Inter** (body) — keeps a familiar body but
  gives headings a distinct voice.
- **Söhne / Suisse** vibe on a budget: **Instrument Sans** (display) + **IBM
  Plex Sans** (body) + **IBM Plex Mono** (data).
- **Space Grotesk** (display, used sparingly for big headings only) + **Inter**
  (body) — subtle personality in the headings, neutral everywhere else.

Pick one pairing per product and commit. Load via `next/font/google` or
`next/font/local` and expose as CSS variables (`--font-display`, `--font-sans`,
`--font-mono`).

---

## 3. Spacing & sizing

- Use one spacing scale, 4px-based: `4 8 12 16 20 24 32 40 48 64 80 96`. Every
  margin/padding/gap comes from it. Arbitrary values like `p-[13px]` or
  `mt-[27px]` are a tell that no system is in charge.
- Minimal SaaS breathes: be generous with section spacing on marketing pages,
  tighter and denser in dashboards. Decide the density per surface and hold it.
- Max content width for reading: ~65–75ch for prose, and a defined container
  max for app shells. Don't let hero text run the full viewport.

---

## 4. Radius

- Pick **one** base radius and derive the rest. Clean SaaS usually lives in the
  `6–10px` range for cards/inputs (shadcn default is `0.5rem`/8px — fine, but
  make it a *choice*, and consider going slightly smaller for a sharper feel).
- Buttons and inputs share the radius; don't mix a pill button with an 8px card
  unless that contrast is intentional.
- Fully-round (`9999px`) is reserved for avatars, dots, and true pills — not for
  every element.

---

## 5. Elevation (use instead of borders)

Borders on everything is the #1 structural tell. Prefer, in order:
1. **Whitespace** — often no container is needed at all.
2. **Background shift** — raise a surface with a 3–5% lightness change
   (`--surface` on `--bg`).
3. **Soft shadow** — low, diffuse, low-opacity. Example scale:
   - `sm`: `0 1px 2px rgba(16,24,40,0.04)`
   - `md`: `0 4px 12px rgba(16,24,40,0.06)`
   - `lg`: `0 12px 32px rgba(16,24,40,0.08)`
   Keep shadows tinted with the neutral's hue, not pure black.
4. **Hairline border** — last resort, and use `--border`, never a flat mid-gray.

---

## 6. Motion

- Durations: `120ms` (hover/tap feedback), `200ms` (small transitions),
  `320–400ms` (entrances). Nothing slower unless it's a deliberate hero moment.
- Easing: a custom ease like `cubic-bezier(0.2, 0, 0, 1)` reads more intentional
  than the browser default `ease`.
- One orchestrated moment per page beats effects on everything.
- Always guard with `@media (prefers-reduced-motion: reduce)`.

---

## 7. Wiring into shadcn (globals.css + Tailwind)

shadcn reads its colors from CSS variables and its radius from `--radius`.
Override them centrally so every primitive inherits the system.

```css
/* app/globals.css */
@layer base {
  :root {
    /* shadcn expects HSL triplets (no hsl() wrapper) for its default setup,
       or raw values if you've switched to the newer @theme approach.
       Map YOUR tokens onto shadcn's slots: */
    --background: 210 20% 99%;      /* --bg */
    --foreground: 213 20% 13%;      /* --fg (near-black, not 0 0% 0%) */
    --card: 0 0% 100%;              /* --surface */
    --muted: 210 20% 96%;          /* --surface-sunk */
    --muted-foreground: 212 12% 40%;
    --primary: 186 82% 29%;        /* --accent (NOT default blue/violet) */
    --primary-foreground: 0 0% 100%;
    --border: 213 25% 91%;
    --ring: 186 82% 29%;           /* focus ring = accent */
    --radius: 0.5rem;              /* your chosen base radius */
  }
}
```

```ts
// tailwind.config.ts (or @theme in globals.css for Tailwind v4)
fontFamily: {
  display: ["var(--font-display)", "sans-serif"],
  sans:    ["var(--font-sans)", "sans-serif"],
  mono:    ["var(--font-mono)", "monospace"],
},
```

```tsx
// app/layout.tsx — load real fonts
import { Geist, Geist_Mono } from "next/font/google";
const display = Geist({ subsets: ["latin"], variable: "--font-display" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
// apply the variable classes on <html> or <body>
```

Once these are set, most components inherit the system automatically and you
only override intentionally — which is the whole point.
