---
name: vue
description: Production-grade Vue 3 engineering with the Composition API and `<script setup>` — reactivity discipline, typed props/emits, Pinia stores, vue-router, component composition, performance, accessibility, and testing (Vitest + Vue Test Utils, Cypress). Matches this repo's stack (Vue 3 + Vite + Pinia + vue-router + TypeScript in src/frontend). Use when building or reviewing Vue code, SFCs (.vue files), or when the user mentions Vue, Composition API, Pinia, vue-router, ref/reactive/computed, or the frontend app.
---

# Vue (production-grade, Vue 3 Composition API)

Self-contained Vue guidance, aligned to this repo's `src/frontend/` stack: **Vue 3**
(`<script setup>` SFCs), **Vite**, **Pinia**, **vue-router**, **TypeScript**, tested with
**Vitest + @vue/test-utils** and **Cypress**. Note: this repo pins Vue to the **beta**
channel (via `overrides`) — check `package.json` before assuming API stability.

## Non-negotiables

- **`<script setup lang="ts">` + Composition API** for all new components. Don't mix in the
  Options API.
- **Semantic HTML + a11y.** `<button>`/`<a>`/`<form>`, one `<h1>`, labelled inputs, visible
  focus, keyboard operability. Templates are HTML — the same rules apply.
- **Typed props & emits.** Use the type-based forms:
  `const props = defineProps<{ id: string; count?: number }>()` and
  `const emit = defineEmits<{ change: [value: string] }>()`. Defaults via `withDefaults`.
- **Handle loading/error/empty** for every async view.
- **Never `v-html` untrusted content** (XSS). Sanitize if you must render user HTML.

## Reactivity discipline

- **`ref` by default**; `reactive` only for objects you never reassign. `ref` is uniform
  (always `.value` in script) and survives destructuring via `toRefs`. Don't destructure a
  `reactive` object — it loses reactivity.
- **`computed` for derived state** — never duplicate derivable data into a `ref` you hand-sync.
  Computeds are cached; getters should be pure (no side effects).
- **`watch` vs `watchEffect`:** `watch(source, cb)` when you need old/new values or a specific
  trigger; `watchEffect` when you just want to run reactive code and auto-track deps. Prefer
  computed over watchers for deriving values — watchers are for *side effects*.
- **Props are read-only.** Don't mutate a prop; emit an event or use `defineModel` for
  two-way binding (`const model = defineModel<string>()`).
- `v-for` needs a **stable `:key`** (an id), never the index for dynamic lists. Don't put
  `v-if` and `v-for` on the same element.

## Component composition

- Extract reusable stateful logic into **composables** (`useXxx()` returning refs/computeds) —
  Vue's answer to shared logic. Keep components declarative.
- Compose with **slots** (default + named + scoped) over prop explosions. One `variant` prop
  beats `isPrimary`/`isDanger` booleans.
- `provide`/`inject` (with `InjectionKey<T>` for types) for wide, low-frequency values
  (theme/auth) — not as a general store.

## State (Pinia) & routing (vue-router)

- **Pinia** for shared client state. Prefer **setup stores** (`defineStore('x', () => { … })`)
  — refs = state, computed = getters, functions = actions; return what should be public.
  Keep server data in a query layer (Vue Query / TanStack Query), not hand-synced in a store.
- **vue-router:** the repo's `src/router/index.ts` currently has empty `routes: []`. Use
  lazy route components (`component: () => import('…')`) for code-splitting, typed route
  params, and navigation guards for auth. Manage focus on route change for a11y.

## Performance, testing, and full patterns

`v-memo`/`shallowRef`/async components, SFC style scoping, forms, and the testing setup
(Vitest + Vue Test Utils + MSW, Cypress e2e) are in [REFERENCE.md](REFERENCE.md).
