---
layout: home

hero:
  name: AgentUI
  text: Render A2UI agents in Vue & Nuxt
  tagline: A tiny, type-safe renderer that streams A2UI protocol messages straight into your component tree — BYO design system.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/berkantdev/agentui

features:
  - icon: 🧩
    title: BYO components
    details: Pick a ready-made adapter (default HTML, shadcn-vue) or wire up your own design system — AgentUI never imports UI libraries you don't use.
  - icon: 📡
    title: Auth-ready SSE
    details: Built on `fetch` + `ReadableStream`, so bearer tokens and custom headers just work. Exponential backoff and typed errors included.
  - icon: 🪶
    title: Tiny runtime
    details: Core <1 kB brotli, Vue layer ~2 kB, Nuxt module ~400 B. Zero dependencies beyond Zod for validation.
  - icon: 🔒
    title: Fully typed
    details: TypeScript strict mode with `exactOptionalPropertyTypes`. No `any` in the public API. Zod schemas validate every message at the SSE boundary.
---

## What is AgentUI?

[A2UI](https://github.com/agentic-ui/a2ui) is a JSON protocol for agents
that stream interactive user interfaces over server-sent events. AgentUI
is a reference renderer for that protocol, split into three packages:

| Package | Purpose | Size |
|---|---|---|
| [`@berkantdev/agentui-core`](/api/core) | Types, Zod schemas, adapter factory | ~0.6 KB |
| [`@berkantdev/agentui-vue`](/api/vue) | Vue 3 composables, components, adapters | ~2.3 KB |
| [`@berkantdev/agentui-nuxt`](/api/nuxt) | Nuxt module with auto-imports | ~0.4 KB |

## Quick example

Drop an `<A2Surface>` into a page, give it the SSE endpoint, and you're done:

```vue
<script setup lang="ts">
const url = '/agent/stream'
const headers = async () => ({
  Authorization: `Bearer ${await refreshToken()}`,
})
</script>

<template>
  <A2Surface :url="url" :headers="headers">
    <template #status="{ status }">
      <p v-if="status !== 'open'">Connecting…</p>
    </template>
  </A2Surface>
</template>
```

The surface handles reconnection, Zod-validates every incoming message,
and renders each component through whichever adapter you registered.

[**→ Continue with the Getting Started guide**](/guide/getting-started)
