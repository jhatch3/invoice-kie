# Vue Reference

Depth behind the `vue` SKILL.md. Vue 3 Composition API, aligned to this repo's stack
(Vite + Pinia + vue-router + TypeScript + Vitest/@vue/test-utils + Cypress).

## SFC structure & conventions

- Order blocks: `<script setup lang="ts">`, then `<template>`, then `<style scoped>`.
- **`PascalCase` component filenames** and PascalCase in templates (`<UserCard />`). Multi-word
  names avoid clashing with HTML elements (lint rule `vue/multi-word-component-names`).
- **Scope styles** with `<style scoped>`; use `:deep()` sparingly to reach child internals.
  Prefer CSS custom properties / design tokens over hardcoded values.
- Keep components small and single-purpose; extract logic to composables in `src/composables/`.

## Reactivity — deeper notes

- `toRef`/`toRefs` to keep reactivity when destructuring props or reactive objects.
- `shallowRef`/`shallowReactive` for large immutable-ish structures you replace wholesale
  (big lists, editor docs) — avoids deep-reactivity cost.
- `readonly()` to hand out state you don't want callers mutating.
- Avoid the classic bug: copying a prop into a local `ref` at setup and expecting it to update
  when the prop changes — it won't. Use `computed(() => props.x)` or `watch` the prop.
- `nextTick()` when you must read the DOM after a reactive change.

## Props, emits, and v-model

- Type-based `defineProps<T>()` with `withDefaults(defineProps<T>(), { count: 0 })`.
- `defineEmits<{ submit: [payload: Form]; cancel: [] }>()` — typed, self-documenting events.
- **`defineModel`** (Vue 3.4+) for two-way binding instead of the manual
  `modelValue` prop + `update:modelValue` emit. Multiple models:
  `defineModel<string>('first')`, `defineModel<string>('last')`.
- `defineExpose` to selectively expose methods/refs to a parent (`<script setup>` is closed by
  default) — use rarely; prefer props/emits.

## Composables (reusable logic)

- Name `useX`, return an object of refs/computeds/functions. Accept args as refs or getters and
  normalize with `toValue()` so callers can pass values, refs, or getters.
- Register lifecycle hooks (`onMounted`, `onUnmounted`) *inside* the composable to co-locate
  setup/teardown (e.g. add/remove event listeners). This is the main win over mixins.
- Consider VueUse before writing your own (`useLocalStorage`, `useFetch`, `useEventListener`, …).

## Pinia patterns

- **Setup store** shape:
  ```ts
  export const useCounter = defineStore('counter', () => {
    const count = ref(0)                       // state
    const double = computed(() => count.value * 2) // getter
    function increment() { count.value++ }     // action
    return { count, double, increment }        // public surface
  })
  ```
- Keep stores focused (per domain), not one god-store. Actions hold async logic.
- **Don't destructure reactivity away:** `const { count } = store` loses it — use
  `storeToRefs(store)` for state/getters, call actions directly off `store`.
- Server data (invoices, results) → a query cache; Pinia for genuinely client-owned state
  (UI prefs, auth session, cross-view selections).

## vue-router patterns

- Lazy components for splitting: `{ path: '/x', component: () => import('@/views/X.vue') }`.
- Typed params; use named routes for links. Navigation guards (`beforeEach`) for auth/redirects.
- Manage focus and title on `afterEach` for a11y/SEO. `<RouterLink>` over manual anchors.
- Data loading: fetch in the component's setup with a query lib, or use route-level guards for
  must-have-before-render data.

## Performance

- `v-memo` on large static-ish `v-for` rows to skip re-render when deps are unchanged.
- Async components (`defineAsyncComponent`) + `<Suspense>` for lazy, awaited subtrees.
- `shallowRef` for big data; avoid unnecessary deep watchers (`{ deep: true }` is expensive).
- Stable keys; don't recreate inline objects/arrays in template bindings hot paths.
- Vite: rely on route-level code-splitting; check the bundle with `vite build --report`-style
  analysis before adding heavy deps.

## Forms

- Native constraints first (`required`, `type`, `pattern`). `defineModel`/`v-model` for binding.
- Validate on blur then on change-after-error; always on submit; always re-validate server-side.
- Schema with **Zod** (or VeeValidate + Zod) as one source of truth for types + validation.
- a11y: `<label for>`, `aria-invalid`, `aria-describedby` for errors, focus first invalid field.

## Testing

- **Component/unit:** Vitest + `@vue/test-utils`. `mount()` the component, drive it as a user
  (`wrapper.find('button').trigger('click')`, set input values), assert on rendered output.
  Prefer role/text-based queries; use `@testing-library/vue` if the team prefers its API.
- Test composables directly by calling them inside a throwaway component or `withSetup` helper.
- Test Pinia by `setActivePinia(createTestingPinia())` in a `beforeEach`.
- **MSW** for network mocking at the HTTP boundary.
- **E2E:** Cypress (already configured — `cypress/e2e/`, `npm run test:e2e:dev`). Cover only
  critical flows; keep the suite small.
- Include automated a11y checks; avoid snapshot-as-primary and testing internal reactive state.

## Repo command recap (`cd src/frontend`)

- Dev `npm run dev` · Build+type-check `npm run build` · Type-check `npm run type-check`
- Unit `npm run test:unit` (single file: `npm run test:unit -- src/__tests__/App.spec.ts`)
- E2E `npm run test:e2e:dev` · Lint `npm run lint` (oxlint + eslint) · Format `npm run format`

## Definition of done

- [ ] `<script setup lang="ts">`, typed props/emits, no prop mutation
- [ ] Derived data via `computed`; watchers only for side effects
- [ ] Shared logic in composables; Pinia setup stores focused; server data in a query layer
- [ ] Routes lazy-loaded; focus managed on navigation
- [ ] Loading/error/empty handled; no `v-html` on untrusted input
- [ ] a11y: roles, labels, keyboard, focus; contrast AA
- [ ] Stable `:key`s; scoped styles; tokens not magic values
- [ ] Vitest component tests + critical-path Cypress e2e; type-check clean
