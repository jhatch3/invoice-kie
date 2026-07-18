# React Reference

Depth behind the `react` SKILL.md. React 19; notes for Vite SPA and Next.js App Router.

## Performance

- **Measure before optimizing.** React DevTools Profiler → find the actual re-render cost.
  Most "perf fixes" are premature.
- **React Compiler (React 19).** If the project enables the compiler, it auto-memoizes —
  do **not** litter code with manual `useMemo`/`useCallback`/`memo`. Check `babel-plugin-react-compiler`
  / the framework flag first. Without it, apply manual memoization deliberately:
  - `React.memo` a component only when it's expensive *and* re-renders with equal props.
  - `useMemo` for expensive computations; `useCallback` for callbacks passed to memoized
    children or effect deps. Wrapping everything adds overhead and noise for no gain.
- **Re-render hygiene:** don't create new object/array/function literals in props of memoized
  children; split context so unrelated consumers don't re-render; move state down to the
  smallest subtree that needs it.
- **Lists:** stable keys, virtualize long lists (TanStack Virtual). **Code-split** routes and
  heavy components with `React.lazy` + `<Suspense>`.
- **Transitions:** `useTransition`/`useDeferredValue` to keep input responsive during heavy
  renders (INP).

## Suspense & error boundaries

- Wrap async/lazy subtrees in `<Suspense fallback>`; co-locate fallbacks near where data is
  needed, not one giant spinner at the root.
- Add **error boundaries** (class component or `react-error-boundary`) around feature areas so
  one failure doesn't blank the app. Boundaries catch render errors — not event-handler or
  async errors; handle those explicitly.

## Routing

- **Vite SPA:** React Router or **TanStack Router** (type-safe params/loaders). Define routes
  declaratively; use loaders/deferred data where supported; lazy-load route components.
- **Next.js:** file-system App Router. Use `layout.tsx`, `loading.tsx` (Suspense), `error.tsx`
  (boundary), `not-found.tsx`. Prefer `<Link>`; use `redirect()`/`notFound()` in Server
  Components; read params from the typed props.

## Forms

- **Controlled** for validation-as-you-type and cross-field logic; **uncontrolled**
  (`defaultValue` + `FormData` on submit) for simple forms — cheaper, less re-render.
- Libraries: **React Hook Form** (+ Zod resolver) for complex client forms — minimal
  re-renders, good a11y wiring. **Next.js:** progressive-enhancement forms with Server Actions
  + `useActionState` for pending/error and `useFormStatus` in submit buttons.
- Accessibility: `<label htmlFor>`, `aria-invalid`, `aria-describedby` for errors, focus the
  first invalid field on failed submit. Always validate on the server too.

## TypeScript patterns

- Props via `interface`/`type`; discriminated unions for variant props. Generic components:
  `function List<T>(props: { items: T[]; render: (t: T) => React.ReactNode })`.
- Event types: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`.
- Prefer `ComponentProps<'button'>` to reuse native element prop types when wrapping elements.
- Type context with a non-null assertion helper (throw if used outside provider) so consumers
  aren't forced to null-check.

## Testing

- **Vitest + @testing-library/react + @testing-library/user-event.** Render, interact as a
  user (`userEvent.click/type/tab`), assert on accessible output. Query by role/label/text.
- **MSW** for network — mock at the HTTP boundary, not by stubbing fetch per test.
- Wrap renders in the real providers (QueryClient, Router, theme) via a custom `renderWithProviders`.
- Test custom hooks with `renderHook`. Include `axe` assertions for a11y.
- **E2E:** Playwright for critical flows. Keep few; they're slow and flakier.
- Avoid snapshot-as-primary and asserting on internal state/implementation.

## Project conventions

- Co-locate component + test + styles. `PascalCase.tsx` for components, `useX.ts` for hooks.
- One component per file for anything non-trivial; export named, not default (better refactors
  and auto-import) except where the framework requires default (Next.js pages/layouts).
- ESLint with `eslint-plugin-react-hooks` (enforces the rules) + `jsx-a11y`. Prettier for format.

## Definition of done

- [ ] Rules of Hooks clean (lint passes); effects only for external sync
- [ ] Server data via a query lib / server components — not `useEffect` + `useState`
- [ ] Client components minimal (Next); state at smallest scope
- [ ] Loading/error/empty handled; error boundary around the feature
- [ ] a11y: roles, labels, keyboard, focus; axe clean
- [ ] Types strict, props typed, no `any`
- [ ] Behavior tests (Testing Library + MSW); critical path e2e
- [ ] No needless memoization (or compiler on); no index keys on dynamic lists
