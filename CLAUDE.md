# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All scripts run from the repo root. pnpm 10 required (enforced via `packageManager`).

```bash
# One-time — install all workspace deps
pnpm install

# Standard PR-readiness cycle (always in this order — see "Build before typecheck" below)
pnpm build          # core → vue → nuxt, in topological order
pnpm typecheck      # per-package tsc / vue-tsc
pnpm lint           # ESLint 9 flat config
pnpm format:check   # Prettier
pnpm test           # 91 tests across core/vue/nuxt
pnpm size           # per-package bundle budget

# Formatting fixes
pnpm format         # write mode

# Changesets (record a user-visible change)
pnpm changeset

# Single-package shortcuts
pnpm --filter @berkantdev/agentui-core test
pnpm --filter @berkantdev/agentui-vue test
pnpm --filter @berkantdev/agentui-nuxt build

# Run one test file with Vitest (from the package dir)
cd packages/vue && pnpm vitest run tests/composables/useSSE.test.ts

# Runnable dev targets
pnpm --filter @berkantdev/agentui-nuxt-playground dev   # :3000, mock SSE agent
pnpm --filter @berkantdev/agentui-storybook dev         # :6006, side-by-side stories
pnpm --filter @berkantdev/agentui-docs dev              # VitePress
```

### Build before typecheck — non-obvious gotcha

`packages/vue` and `packages/nuxt` resolve `@berkantdev/agentui-core` via
its `exports` field, which points at `./dist/index.d.ts`. If `dist/`
isn't populated, downstream `vue-tsc` / `tsc` fails with
`Cannot find module '@berkantdev/agentui-core' or its corresponding type declarations`.

**Always run `pnpm build` before `pnpm typecheck` on a fresh checkout.**
CI enforces this ordering in `.github/workflows/ci.yml`; locally stale
`dist/` masks the issue.

## Architecture

### Three-package split

| Package | Responsibility |
|---|---|
| `@berkantdev/agentui-core` | Framework-agnostic. Types, Zod schemas, SSE message parsers, `createAdapter` factory. **Zero UI-framework dependencies** — only `zod` at runtime. |
| `@berkantdev/agentui-vue` | Vue 3 layer. Composables (`useSSE`, `useSurface`, `useDataModel`, `useA2UI`), components (`A2Surface`, `A2StaticRenderer`, `A2Renderer`), plugin, built-in default adapter, shadcn adapter factory. |
| `@berkantdev/agentui-nuxt` | Nuxt 3.13+ / Nuxt 4 module. Auto-imports composables, globally registers components, installs the adapter via a runtime plugin. |

Each package is **independently versioned** via Changesets. `vue`
depends on `core`, `nuxt` depends on `vue` — all via `workspace:*`.

### The `AgentUIAdapter<TComponent>` generic is load-bearing

`core` must stay UI-agnostic. The adapter type is generic over its
component representation, so the Vue package specialises it as
`AgentUIAdapter<import('vue').Component>`. **Never import anything
from `vue` (or any UI library) inside `packages/core/`** — the lint
rule against direct UI imports outside `packages/vue/src/adapters/`
exists for this reason.

### A2UI v0.10 protocol surface

Four discriminated-union message types (`createSurface`,
`updateComponents`, `updateDataModel`, `deleteSurface`) defined once
as TypeScript interfaces in `packages/core/src/types/protocol.ts` and
mirrored one-to-one as Zod schemas in
`packages/core/src/schema/protocol.schema.ts`. `parseMessage` is the
single SSE boundary — everything downstream trusts the validated shape.

The v0.8 legacy type alias (`A2UIMessageLegacy`) is preserved but
**not** parsed by `parseMessage`. A v0.8 compat parser lives in the
TODO list as a separate pass — do not try to merge v0.8 and v0.10 in
one parser.

### `useSSE` uses `fetch` + `ReadableStream`, not `EventSource`

Native `EventSource` cannot send custom headers, which blocks
bearer-token auth on agent endpoints. The composable is rewritten on
`fetch` with a hand-rolled SSE framing parser
(`parseSSEBuffer` — handles multi-chunk reassembly, multi-line
`data:`, `:` comments, non-message events).

Key semantics to preserve when touching `useSSE`:

- **Object-based API**: `useSSE({ url, headers, onMessage, ... })`, not
  positional arguments.
- **`headers` re-resolved every (re)connect** — factory form is
  awaited, so refreshed tokens flow into reconnects automatically.
- **Backoff**: `min(initialDelayMs * 2^retries, maxDelayMs)`, default
  `500ms × 2^n capped at 30s`. Retry counter resets to `0` on `open`.
- **Clean server close triggers a reconnect** — matches `EventSource`
  behaviour.
- **Typed `SSEError`** with discriminated `type` (`network` | `http` | `parse`).
  Never surface raw `Event` or `Error`.

### Reactivity choices

- `useSurface` stores components in `shallowRef<Map>`. Deep reactivity
  on a 100-component surface would be ruinous.
- Adapter components are wrapped with `markRaw` in both
  `createDefaultAdapter` and `createShadcnAdapter`. **Never make an
  adapter component reactive** — render perf cliff.
- No `watch(..., { deep: true })` anywhere. If tempted, use
  `triggerRef` after a `shallowRef` mutation instead.

### Shadcn is a factory, not a bundled adapter

shadcn-vue is copy-paste, not an npm package — the adapter package
can't import shadcn components directly. `createShadcnAdapter(components)`
accepts user-supplied Vue components keyed by A2UI type name
(`Button`, `Modal → user's Dialog`, `TextField → user's Input`, etc.)
and wraps each with `markRaw` internally.

The canonical `shadcn → A2UI` mapping table lives in JSDoc on
`createShadcnAdapter` — keep it in sync when adding new A2UI types.

## Conventions

- **No `any` in source.** ESLint errors on it; tests are free to relax.
- **Barrel exports only.** Consumers import from `@berkantdev/agentui-*`,
  never deep paths. Add new exports to the nearest `index.ts`.
- **Zod `safeParse` at every boundary** — never `.parse()`. Fail soft,
  return `null`, log once via `console.warn`.
- **`onUnmounted` cleanup in every composable with a side effect.**
- **Conventional Commits** on commit subjects. Breaking changes get
  `!` after the scope (e.g. `feat(vue)!:`).
- **Prettier owns formatting.** ESLint's Vue formatting rules
  (`max-attributes-per-line`, `singleline-html-element-content-newline`,
  `html-self-closing`, `html-closing-bracket-newline`, `html-indent`)
  are deliberately disabled in `eslint.config.js` to avoid
  double-formatting conflicts.

## Bundle budgets (per-package, enforced by `pnpm size`)

| Package | Limit | Current |
|---|---|---|
| `core` | 8 KB brotli | ~0.6 KB |
| `vue` | 15 KB brotli | ~2.3 KB |
| `nuxt` | 5 KB brotli | ~0.4 KB |

Peer deps (`vue`, `zod`, workspace packages) are externalised in the
`size-limit` `ignore` arrays — budgets measure **our** code only.

## Release flow

On push to `main`, `.github/workflows/release.yml` runs
`changesets/action@v1`:

- With pending changesets → opens/updates a **"Version Packages" PR**
  that bumps versions, writes `CHANGELOG.md` per package, and deletes
  the consumed changesets.
- Merge that PR → same workflow runs `pnpm changeset publish` → npm.

`NPM_TOKEN` must be in repo secrets (Automation token for the
`@berkantdev` scope on npmjs.com).

## Nuxt 3 + 4 dual support

The module peer-ranges `"nuxt": "^3.13.0 || ^4.0.0"`. Day-to-day
development and the playground pin Nuxt 3.21 (latest 3.x). A
dedicated CI job (`nuxt4-compat` in `ci.yml`) uses `pnpm.overrides`
to force-resolve Nuxt 4.4, then runs module typecheck + tests +
module build + full playground build on v4 — so every PR verifies
both versions actually work, not just the range claim.

When editing the module's `src/module.ts` or `src/runtime/plugin.ts`,
stick to APIs present in both majors (`defineNuxtModule`, `addPlugin`,
`addImportsDir`, `addComponent`, `createResolver`). These are stable
across 3 → 4.

## Playground + Storybook layout

- `packages/nuxt/playground/` — runnable Nuxt app. Mock SSE agent at
  `server/api/mock-agent.get.ts`. Use this to smoke-test the module
  end-to-end in a real browser.
- `storybook/components/ui/` — shadcn-vue copy-paste components
  (Button, Card, Dialog, Input). They use hand-written `.sb-shadcn-*`
  CSS rather than Tailwind because the Storybook doesn't run a
  Tailwind processor — see `storybook/components/ui/README.md`. The
  component API is 1:1 with upstream shadcn-vue.
- `storybook/stories/SideBySide.vue` is the shared shell — every
  component story renders through the default adapter and the shadcn
  adapter in parallel so drift is immediately visible.
