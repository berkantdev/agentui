# AgentUI

[![CI](https://github.com/berkantdev/agentui/actions/workflows/ci.yml/badge.svg)](https://github.com/berkantdev/agentui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A tiny, type-safe [A2UI](https://github.com/agentic-ui/a2ui) renderer for
Vue 3 and Nuxt — bring your own design system.

## What's in the box

| Package | Purpose | Size (brotli) |
|---|---|---|
| [`@berkantdev/agentui-core`](./packages/core) | Framework-agnostic types, Zod schemas, parsers, adapter factory | ~0.6 KB |
| [`@berkantdev/agentui-vue`](./packages/vue) | Vue 3 composables, components, default + shadcn adapters | ~2.3 KB |
| [`@berkantdev/agentui-nuxt`](./packages/nuxt) | Nuxt module with auto-imports and global components | ~0.4 KB |

All three ship ESM + CJS, carry full `.d.ts` typings, and rely only on
`zod` at runtime.

## Quick start

```bash
pnpm add @berkantdev/agentui-core @berkantdev/agentui-vue zod
```

```vue
<script setup lang="ts">
import { A2Surface } from '@berkantdev/agentui-vue'

const headers = async () => ({
  Authorization: `Bearer ${await refreshAccessToken()}`,
})
</script>

<template>
  <A2Surface url="/agent/stream" :headers="headers" />
</template>
```

The surface streams A2UI messages over `fetch` + `ReadableStream`,
Zod-validates every one, reconnects with exponential backoff, and
renders each component through whichever adapter you registered.

See the [Getting Started guide](./docs/guide/getting-started.md) for
Nuxt, standalone Vue, shadcn-vue BYO-adapter, and static-rendering
examples.

## Repo layout

```
agentui/
├── packages/
│   ├── core/        # @berkantdev/agentui-core
│   ├── vue/         # @berkantdev/agentui-vue
│   └── nuxt/        # @berkantdev/agentui-nuxt
│       └── playground/   # runnable Nuxt dev app
├── storybook/       # visual tests, default|shadcn side-by-side
├── docs/            # VitePress site
└── .changeset/      # per-change release notes
```

## Development

```bash
pnpm install
pnpm build       # core → vue → nuxt
pnpm test        # 91+ tests across all packages
pnpm lint
pnpm typecheck
pnpm size        # per-package bundle budget check
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full PR checklist,
code-style rules, and versioning policy.

## Scripts that matter

| Command | What it does |
|---|---|
| `pnpm --filter @berkantdev/agentui-nuxt-playground dev` | Live Nuxt playground with mock SSE agent |
| `pnpm --filter @berkantdev/agentui-storybook dev` | Storybook on :6006 |
| `pnpm --filter @berkantdev/agentui-docs dev` | VitePress docs site |
| `pnpm changeset` | Record a user-visible change before PRing |

## License

[MIT](./LICENSE) © Berkantdev
