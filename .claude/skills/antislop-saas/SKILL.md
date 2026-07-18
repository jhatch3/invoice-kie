---
name: antislop-saas
description: >-
  Build and audit clean, minimal SaaS front ends (Next.js + Tailwind + shadcn/ui)
  that don't read as AI-generated. Use this skill WHENEVER the user is building,
  styling, reviewing, or "fixing the look of" a React/Next.js UI — landing pages,
  dashboards, marketing sites, product demos — and wants it to feel deliberately
  designed rather than templated. Trigger it even when the user just says the UI
  "looks AI", "looks generic", "looks like slop", "needs polish", "feels off", or
  asks to make something "look more like Linear/Vercel/Stripe". Also trigger when
  generating a new component or page from scratch in a shadcn codebase, so the
  output starts from the design system instead of the defaults. Applies to
  clean/minimal SaaS aesthetics specifically.
---

# Anti-Slop SaaS Front End

The goal: UI that a human would clock as *decided*, not averaged. "AI slop" is
what a model produces when nothing tells it which direction to commit to — it
falls back on the statistically safe look: a purple→blue gradient, a gray 1px
border on every card, Inter everywhere, three feature cards in a row, dark mode
nobody asked for. An average isn't a style; it's the absence of one. This skill
supplies the direction so the output stops being average.

The aesthetic target is **clean/minimal SaaS** — think Linear, Vercel, Stripe.
In minimal work there's nowhere to hide, so precision in spacing, type, and
contrast *is* the design. Don't compensate for restraint with decoration.

## Two modes

Figure out which the user needs (often both):

- **BUILD** — generating or restyling a component/page. Start from the token
  system, never from shadcn defaults. → read `references/tokens.md` and
  `references/shadcn-recipes.md` before writing code.
- **REVIEW** — auditing existing UI for slop tells and fixing them. → read
  `references/review-checklist.md` and run the loop below.

When restyling existing UI, do REVIEW first (find the tells), then BUILD (apply
fixes). They chain.

## The seven rules that kill slop

These are the load-bearing decisions. Apply all of them; each one on its own
isn't enough.

1. **Lock the tokens first.** Before touching a component, make sure the project
   has a committed token set (color, type, spacing, radius, elevation, motion)
   in one place — for shadcn that's the CSS variables in `globals.css` plus the
   Tailwind theme. If it doesn't exist, create it (see `references/tokens.md`).
   Every color and size in a component must trace back to a token, never a
   one-off hex or arbitrary `p-[13px]`.

2. **Cap the palette, commit to one accent.** One brand accent, a full neutral
   ramp, and semantic colors (success/warn/danger) — that's it. The tell is
   Tailwind-blue `#3B82F6` as the primary and gray-on-gray everything else.
   Pick a neutral with a slight temperature (warm or cool, not pure `#808080`)
   and an accent that isn't the default blue or violet.

3. **Kill the gradient and the default dark mode.** No purple→blue hero
   gradients. No dark mode unless the user asked for it. If you want depth, use a
   3–5% background-lightness shift, not a gradient and not a glow.

4. **Cards are borderless by default.** To separate content, reach in this
   order and stop as soon as it reads: (a) whitespace, (b) a 3–5% background
   shift, (c) soft elevation. Add a border only if all three fail — and never a
   flat 1px gray line. Most "card in a card in a card" layouts should just be
   whitespace.

5. **Real type, real scale.** Don't ship Inter-for-everything. Pick a deliberate
   pairing (a display/heading face with personality used with restraint + a
   clean body/UI face) and a real type scale with intentional weight and
   tracking. Tighten tracking on large headings; SaaS headings almost always
   want `tracking-tight`. See `references/tokens.md` for pairings that aren't
   defaults.

6. **Structure must mean something.** Numbered markers (01/02/03), eyebrows,
   dividers — only if the content is *actually* a sequence or a real category.
   Three feature cards in a row is the template answer; use it only if you'd
   arrive there by choice. Question every structural device: does it encode
   something true, or is it decoration?

7. **Copy is design material.** "Empower your team to unlock productivity" and
   "Built for modern teams" are the textual purple gradient — people clock them
   instantly. Write plain, specific, active copy in the product's own voice.
   Name things by what the user controls, not how the system is built. See the
   copy section in `references/review-checklist.md`.

## Motion

Restraint wins for minimal SaaS. One orchestrated moment (a page-load reveal, a
single scroll trigger, tight hover states on interactive elements) lands harder
than scattered effects, and scattered animation is itself a slop tell. Respect
`prefers-reduced-motion` always.

## BUILD workflow

1. Confirm the token system exists and is committed. If not, create it from
   `references/tokens.md`, tuned to this product's subject — don't paste a
   generic palette. Ground choices in what the product actually is.
2. Build the component using tokens only. For shadcn primitives, apply the
   de-defaulting recipes in `references/shadcn-recipes.md` (override the CSS
   variables and the primitive class strings rather than accepting stock).
3. Before finishing, run the REVIEW checklist against your own output. Fix the
   highest-impact tell, then re-check. Minimal work fails on small things —
   inconsistent spacing, loose tracking, a stray border — so this pass matters.

## REVIEW workflow (the loop)

A one-shot audit doesn't converge; a loop does.

1. Read `references/review-checklist.md`.
2. Scan the target UI (component file, page, or screenshot) against every tell.
   Report each finding as: **tell → why it reads as slop → the specific fix**,
   referencing the actual file/line or element.
3. Rank findings by impact. Apply the top fix.
4. Re-scan. Repeat until it passes the bar or the user stops you.

Never just list what's wrong and stop — that's what linters do. Carry each
finding through to a concrete change in the code.

## Output format for a REVIEW

```
## Slop audit: <target>

### Findings (highest impact first)
1. <tell> — <why it reads as machine-made> → <specific fix, with token/class>
2. ...

### Applied
<the change(s) you made, or the diff>

### Re-check
<what still needs attention, if anything>
```

## Reference files

- `references/tokens.md` — the design-token system for clean/minimal SaaS: color
  ramps, non-default font pairings, spacing/radius/elevation/motion scales, and
  how to wire them into shadcn's `globals.css` + Tailwind theme.
- `references/shadcn-recipes.md` — how to de-default the common shadcn primitives
  (button, card, badge, table, input, tabs) so they stop reading as stock.
- `references/review-checklist.md` — the full list of slop tells with fixes,
  including a copy section, for the REVIEW loop.
