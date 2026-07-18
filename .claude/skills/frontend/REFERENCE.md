# Frontend Reference

Depth behind the `frontend` SKILL.md. Framework-agnostic.

## Forms & validation

- **Native first.** Use `<form>`, `required`, `type="email"`, `min`/`max`, `pattern`. Native
  constraint validation is free, accessible, and works without JS.
- **Validate on the right event.** Validate a field on `blur` (first time) and on `change`
  after it has errored — not on every keystroke from the start (annoying). Always re-validate
  everything on submit, and never trust the client: re-validate on the server too.
- **Errors are accessible.** Link the message to the field with `aria-describedby`, set
  `aria-invalid="true"`, and move focus to the first invalid field on failed submit.
- **Schema-driven.** For non-trivial forms, define one schema (e.g. Zod) and derive both
  types and runtime validation from it — one source of truth for client and API boundary.
- **Submission UX.** Disable the submit button while pending, show progress, and prevent
  double-submit. Preserve user input on error. Support Enter-to-submit.

## State management decision guide

Escalate only when the current level hurts:

1. **Local component state** — default. Most state is local.
2. **Lifted state / props** — when two siblings need the same value, lift to the parent.
3. **Context / provide-inject** — for low-frequency, wide-reach values (theme, locale, auth
   user). Not for high-frequency updates (causes broad re-renders).
4. **Server-cache library** — for anything that lives on a server (lists, entities), use a
   data-fetching cache (TanStack Query, RTK Query, Vue Query, or framework loaders). This is
   *not* "global state" — treat server data as a cache, not something you hand-sync.
5. **Global client store** — (Zustand/Redux, Pinia) only for genuinely global *client* state
   that many unrelated parts mutate. Keep it small.

Rule of thumb: **server state ≠ client state.** Most "global state" pain is really cached
server data being managed by hand — move it to a query library and the store shrinks.

## CSS & design systems

- **Tokens, not magic values.** Define colors, spacing, radii, typography, shadows as CSS
  custom properties (or a token layer). Reference tokens everywhere; never hardcode `#3b82f6`
  or `13px` in components.
- **Theming.** Light/dark via a `[data-theme]` attribute or `prefers-color-scheme`; put both
  in the token layer so components stay theme-agnostic. Support the user toggle winning over
  the OS default.
- **Layout.** Flexbox/grid, `gap` over margins, logical properties (`margin-inline`) for i18n.
  Mobile-first media queries; container queries for component-level responsiveness.
- **Scope styles.** CSS Modules, scoped SFC styles, or a utility framework — avoid unscoped
  global selectors that leak. Keep specificity flat.
- **No horizontal body scroll.** Wide content (tables, code, diagrams) scrolls inside its own
  `overflow-x:auto` container.

## Security (client-side responsibilities)

- **XSS.** Never inject unsanitized HTML (`innerHTML` / `v-html` / `dangerouslySetInnerHTML`).
  If you must render user HTML, sanitize with a vetted library (DOMPurify). Prefer text.
- **URLs.** Validate `href`/`src` schemes; block `javascript:` URIs. Add
  `rel="noopener noreferrer"` to `target="_blank"` links.
- **CSP.** Ship a Content-Security-Policy that disallows inline script where possible.
- **Dependencies.** Audit regularly; pin versions; minimize transitive surface. Every dep is
  attack surface and bundle weight.
- **Auth tokens.** Prefer httpOnly, Secure, SameSite cookies over `localStorage` for session
  tokens (localStorage is readable by any XSS).

## Testing strategy

Test behavior the user can observe, not implementation details.

- **Unit / component (most tests).** Render the component, interact the way a user would
  (click, type, tab), assert on visible/accessible output. Query by role/label/text, not by
  CSS class or test-id where a semantic query works. Tools: Vitest + Testing Library.
- **Integration.** Multiple components + real store + mocked network (MSW). Highest value per
  test — catches wiring bugs unit tests miss.
- **E2E (few, critical paths).** Real browser, real routes, the money flows only (login,
  checkout, the core task). Tools: Playwright or Cypress. Slow and flakier — keep the set small.
- **Accessibility checks.** Include automated axe checks in component/e2e tests; they catch
  ~30–40% of issues (the rest needs manual keyboard/SR testing).
- **Avoid:** snapshot tests as a primary strategy (brittle, low signal), and tests that assert
  internal state or call counts instead of user-visible behavior.

## Definition of done

- [ ] Loading, error, and empty states handled
- [ ] Keyboard-operable with visible focus; screen-reader sane
- [ ] Contrast AA; respects reduced-motion; not color-only
- [ ] Responsive (mobile → desktop) and theme-aware
- [ ] Types strict, boundaries typed, no `any`
- [ ] Behavior-level tests for the new logic; critical path has e2e
- [ ] No secrets in the bundle; user HTML sanitized
- [ ] Bundle/image impact checked
