# Contributing to AgentUI

Thanks for considering a contribution. AgentUI is a small project that
lives and dies by its discipline: tight bundles, strict types, and a
protocol surface that stays honest. This doc keeps the on-ramp short.

## Setup

```bash
git clone https://github.com/berkantdev/agentui.git
cd agentui
pnpm install
pnpm build       # builds core → vue → nuxt
pnpm test        # 91+ tests across the three packages
```

Node 20 or newer, pnpm 10+.

## Workflow

1. Branch from `main`: `feat/<short-name>` or `fix/<short-name>`.
2. Make the change — **and a test that would have failed before it**.
3. Run `pnpm changeset` and describe what shipped (see
   [.changeset/README.md](./.changeset/README.md) for the policy).
4. Open a PR against `main`.

CI runs typecheck, lint, tests, a size-limit budget check, and a
`pnpm audit` on every PR. Everything has to be green before review.

## PR checklist

- [ ] `pnpm typecheck` — strict mode, no `any` in source (tests are free to relax)
- [ ] `pnpm lint` — ESLint 9 flat config, zero errors
- [ ] `pnpm format:check` — Prettier-clean
- [ ] `pnpm test` — all packages green
- [ ] `pnpm size` — new code stays inside the per-package budget
- [ ] JSDoc on every new public export
- [ ] Changeset file under `.changeset/` for any user-visible change
- [ ] Browser-verified for UI changes (A2Surface, adapters, components)

## Code style

- **Conventional Commits** for the subject line: `feat(vue):`, `fix(core):`,
  `docs(nuxt):`, `chore(repo):`, `test(vue):`. Breaking changes get `!`
  after the scope, e.g. `feat(vue)!: rewrite useSSE on fetch`.
- **No `any`** — the lint config errors on it. If you genuinely need an
  escape hatch in tests, the rule is already relaxed there.
- **Barrel exports only** — consumers import from `@berkantdev/agentui-*`,
  never from deep paths. Add new exports to the nearest `index.ts`.
- **Zod `safeParse`** at every SSE or user boundary — never `.parse()`.
- **`onUnmounted` cleanup** in every composable that registers a side
  effect. If there's a side effect and no cleanup, add one.
- **No `watch(..., { deep: true })`** without a written justification in
  the PR description — `shallowRef` + `triggerRef` is almost always
  what you want for A2UI state.
- **`markRaw`** every component exposed through an adapter. Adapter
  components must never be made reactive.
- **No UI-library imports outside `packages/vue/src/adapters/**`.**
  Core stays UI-agnostic; the Vue layer's only UI dependency is Vue
  itself.

## Versioning

Every published package is versioned independently:

- **patch** — refactors, bug fixes, doc-only changes
- **minor** — new optional APIs, additive changes
- **major** — any breaking change in the public API or observable
  runtime behaviour

See [.changeset/README.md](./.changeset/README.md) for the policy and
release flow.

## Issues

Found a bug? Want a feature? Open an issue using one of the templates
in [.github/ISSUE_TEMPLATE/](./.github/ISSUE_TEMPLATE/). A clear,
minimal reproduction is worth more than a long description.

## Security

Please **do not** file public issues for security-sensitive reports.
Email the maintainers first — see [SECURITY.md](./SECURITY.md) for
the contact and disclosure timeline.
