---
name: frontend
description: Production-grade, framework-agnostic web frontend engineering — accessibility, performance (Core Web Vitals), forms & validation, state, TypeScript, CSS/design systems, security, and testing strategy. Use when building or reviewing any web UI, when the user mentions accessibility/a11y, performance/bundle size/Core Web Vitals, responsive or dark-mode CSS, forms, or wants "production-grade" frontend work, regardless of framework.
---

# Frontend (framework-agnostic, production-grade)

Apply these defaults to any web UI work. Framework specifics live in the `react` and `vue`
skills — this skill is the shared baseline. When in doubt, prefer the platform (HTML/CSS/
web APIs) over a library.

## Non-negotiables (do these every time)

- **Semantic HTML first.** A `<button>` is a button, a `<a href>` is a link, a `<form>`
  submits. Reach for `<div onClick>` only when no element fits, and then add role + keyboard
  handlers. Landmarks: `<header> <nav> <main> <footer>`, one `<h1>`, no skipped heading levels.
- **Keyboard + focus.** Every interactive element is reachable and operable by keyboard,
  has a visible focus ring (never `outline: none` without a replacement), and focus is
  managed on route change / modal open (trap + restore).
- **Type safety.** TypeScript in `strict` mode. No `any` in shipped code — use `unknown` +
  narrowing. Type the boundaries (API responses, props, form state).
- **No secrets in the client.** Anything in the bundle is public. API keys, tokens, and
  business logic that must stay private belong on a server.
- **Handle the three UI states.** Every async view designs for loading, error, and empty —
  not just the happy path.

## Workflow for a new feature/component

1. Model the data and states first (loading/error/empty/success). Type them.
2. Build with semantic HTML + native controls; add ARIA only to fill real gaps.
3. Make it responsive (mobile-first) and theme-aware (light/dark) using tokens, not magic values.
4. Wire state at the smallest scope that works (local → lifted → shared store).
5. Add tests at the behavior level (see Testing below).
6. Check the budget: bundle impact, image sizes, unnecessary re-renders/reflows.

## Accessibility (WCAG 2.2 AA baseline)

- Text contrast ≥ 4.5:1 (3:1 for large text and UI component boundaries).
- All images have `alt` (empty `alt=""` for decorative). Icons that convey meaning need an
  accessible name.
- Form fields have associated `<label>`; errors are programmatically linked
  (`aria-describedby`) and announced.
- Respect `prefers-reduced-motion`; don't convey information by color alone.
- Test with keyboard-only and a screen reader before calling it done.

## Performance (Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1)

- Ship less JS: code-split by route, lazy-load below-the-fold and heavy deps, tree-shake.
- Images: correct format (AVIF/WebP), responsive `srcset`/`sizes`, explicit
  width/height (or `aspect-ratio`) to prevent layout shift, `loading="lazy"` off-screen.
- Fonts: `font-display: swap`, preload the critical font, subset it.
- Avoid layout thrash; keep the main thread free (defer non-critical work, debounce input).

## More depth

Forms & validation, state-management decision guide, CSS/design tokens & theming, security
(XSS/CSP/dependencies), and the full testing strategy are in
[REFERENCE.md](REFERENCE.md).
