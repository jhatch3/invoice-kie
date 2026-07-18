---
name: react
description: Production-grade React 19 engineering across Vite SPA, Next.js App Router (RSC/Server Actions), and framework-agnostic core — hooks discipline, component composition, data fetching, state, performance, TypeScript, accessibility, and testing. Use when building or reviewing React code, when the user mentions React, hooks, JSX/TSX, Next.js, RSC, Server Actions, TanStack Query/Router, or wants a production-grade React app or component.
---

# React (production-grade, React 19)

Self-contained React guidance. Covers three contexts — pick based on the repo:
**Vite SPA**, **Next.js App Router**, and **agnostic core** (patterns true everywhere).
Detect the context from `package.json` (`next` present → Next; `vite` + `react` → SPA)
before choosing data-fetching/routing patterns.

## Non-negotiables

- **Semantic HTML + a11y.** `<button>`/`<a>`/`<form>`, one `<h1>`, labelled inputs, visible
  focus, keyboard operability. JSX is HTML — the same rules apply.
- **TypeScript strict.** Type props with explicit interfaces; no `any`. Prefer `type` for
  props/unions. Type `children` as `React.ReactNode`. Avoid `React.FC` (implicit children,
  awkward generics) — declare `function Comp(props: Props)`.
- **Rules of Hooks.** Call hooks unconditionally at the top level, same order every render.
  Custom hooks start with `use`. Every effect that reads props/state lists them as deps.
- **Keys are stable IDs**, never array index for dynamic lists.
- **Handle loading/error/empty** for every async view.

## Hooks discipline

- `useEffect` is for **synchronizing with external systems** (subscriptions, DOM, non-React
  widgets), *not* for deriving data. Derive during render; if it's expensive, `useMemo`.
  Don't copy props into state "to modify them" — compute or lift instead.
- Prefer `useState` initializer functions for expensive initial values: `useState(() => …)`.
- `useReducer` when the next state depends on complex prior state or many related transitions.
- Extract reusable stateful logic into **custom hooks**; keep components declarative.
- React 19: `use()` to read promises/context conditionally; `useOptimistic`, `useActionState`,
  and `useFormStatus` for form/pending UX; the compiler may make manual memoization unnecessary
  (see Performance).

## Component composition

- Small, single-purpose components. Compose with `children` and slots over deep prop-drilling
  and boolean-flag soup (`isPrimary`, `isSecondary`, `isDanger` → one `variant` prop).
- Container/presentational split only where it earns its keep; don't over-abstract early.
- Lift state to the lowest common ancestor; pass callbacks down. For wide, low-frequency
  values (theme/auth/locale) use Context — never for high-frequency updates.

## Data fetching & state (context-specific)

- **Server data is a cache, not state.** Use **TanStack Query** (Vite SPA) or framework data
  APIs — never hand-sync fetched data into `useState` + `useEffect`.
- **Next.js App Router:** default to **Server Components**; fetch on the server, pass data
  down. Add `"use client"` only for interactivity (state, effects, event handlers, browser
  APIs) — keep client components at the leaves. Mutations via **Server Actions** +
  `useActionState`/`useOptimistic`.
- **Client state:** local `useState` first; **Zustand** for small global client state; reach
  for Redux Toolkit only on large apps with complex shared logic. Avoid Context as a store.

## Performance, testing, and full patterns

Memoization (and when the React Compiler removes the need), Suspense/error boundaries,
routing, forms, and the testing setup (Vitest + Testing Library + MSW, Playwright) are in
[REFERENCE.md](REFERENCE.md).
