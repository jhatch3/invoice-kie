# De-Defaulting shadcn/ui Primitives

shadcn ships intentionally neutral so you can customize it — but if you *don't*,
every shadcn app looks like every other shadcn app: gray cards with a 1px
border, blue primary buttons, default badges. This file is how to make the
common primitives read as yours. The tokens do most of the work (see
`tokens.md`); these are the per-primitive adjustments on top.

Assumes the RSC pattern where server components use `buttonVariants` /
`badgeVariants` class strings and only interactive leaves are `"use client"`.

## Button

Defaults that read as stock: default variant in Tailwind blue, medium size,
uniform radius, no press feedback.

- Primary uses `--primary` (your accent, not blue). Give it a real hover
  (`--accent-hover`) and a subtle active state (`active:translate-y-px` or a
  slight scale) — the tactile feedback is what makes it feel built.
- Prefer a tighter, more confident size for SaaS: reduce default height a touch
  and use `font-medium`, `tracking-tight` labels.
- Secondary/ghost buttons: no border. Use a `--surface-sunk` background on hover
  instead of a gray outline.
- Focus ring = accent (`--ring`), visible and offset. Never remove focus styles.

```tsx
// extend buttonVariants — keep the RSC-friendly class-string API
primary: "bg-primary text-primary-foreground hover:bg-[--accent-hover] " +
         "active:translate-y-px transition-[transform,background-color] " +
         "duration-120 font-medium tracking-tight",
ghost:   "hover:bg-muted text-foreground", // no border
```

## Card

Defaults that read as stock: `rounded-lg border bg-card` on everything — the
gray-bordered box.

- Drop the border. Separate with whitespace first, then `bg-card` on `bg-muted`,
  then a soft `shadow-sm`. Add `border` back only when a card must sit on the
  same background as its neighbors with no gap.
- Kill nested cards. A card inside a card inside a card is almost always
  whitespace pretending to be structure.
- Tighten internal padding to your spacing scale; don't accept the default if it
  feels loose for a dense dashboard.

```tsx
// a de-defaulted card
<div className="rounded-[--radius] bg-card shadow-sm p-6">…</div>
// on a marketing page, often even simpler:
<section className="py-16">…</section>   // just whitespace, no card at all
```

## Badge / status pill

Defaults that read as stock: saturated solid fills, uniform pill for everything.

- Use **muted** semantic colors: tinted background + darker text of the same
  hue (e.g. `bg-success/10 text-success`), not a solid saturated block.
- Reserve solid fills for one high-emphasis state only.
- For a data/extraction product, status badges (`parsed`, `low-confidence`,
  `failed`) map cleanly to success/warning/danger — keep them muted and
  consistent.

```tsx
success: "bg-[--success]/10 text-[--success] border-0",
warning: "bg-[--warning]/10 text-[--warning] border-0",
danger:  "bg-[--danger]/10 text-[--danger] border-0",
```

## Table (dense data — key for dashboards/extraction UIs)

Defaults that read as stock: heavy borders on every cell, zebra striping,
centered text.

- No cell borders. Separate rows with a single `--border` hairline *between*
  rows only (`divide-y`), or with row-hover background — not a full grid.
- Left-align text; **right-align numbers** and use the mono font for numeric /
  ID / extracted-value columns. This one change makes data tables look
  professional instantly.
- Sticky header with a subtle `--surface-sunk` background, `text-muted-fg`,
  `text-xs`, `font-medium`, `uppercase tracking-wide` *only if* the label set is
  short — otherwise skip the uppercase.
- Generous row height; cramped rows read as a raw dump.

```tsx
<td className="text-right font-mono tabular-nums">{value}</td>
```

## Input / dropzone

Defaults that read as stock: gray-bordered box, blue focus ring, default radius.

- Input background = `--surface-sunk` with no border, or a hairline `--border`;
  focus brings the accent ring, not a blue glow.
- For the upload dropzone: a dashed border is fine *here* (it signals
  drop-target affordance), but tint it toward the accent on drag-over rather
  than turning blue.

## Tabs

- Underline-style tabs (active = accent underline + `--fg` text, inactive =
  `--muted-fg`) read cleaner for SaaS than the default filled "pill" tabs.
- Keep the indicator animation short (`200ms`) and eased.

---

## The meta-rule

After customizing, look at a rendered screen and ask: *if I removed the
content, could I still tell this apart from a stock shadcn demo?* If not, the
tokens or these overrides didn't go far enough. Push the accent, the type, and
the border removal until the answer is yes — then stop (over-decorating is its
own kind of slop).
