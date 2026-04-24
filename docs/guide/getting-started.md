# Getting Started

AgentUI ships as three npm packages. Pick the setup that matches your
project and you'll be streaming A2UI surfaces in a minute.

## Requirements

- **Node** 20 or newer
- **pnpm / npm / yarn** — any modern package manager works
- **Vue 3.4+** or **Nuxt 3** for the UI bindings
- An SSE endpoint that speaks A2UI v0.10 (a mock is fine to start)

## Nuxt 3

The fastest path — the Nuxt module wires up auto-imports, global
components, and plugin registration for you.

### Install

```bash
pnpm add @berkantdev/agentui-core @berkantdev/agentui-vue @berkantdev/agentui-nuxt zod
```

### Register the module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@berkantdev/agentui-nuxt'],
  agentui: {
    adapter: 'default', // 'default' | 'none'
  },
})
```

With `adapter: 'default'`, the built-in HTML adapter is installed
automatically. The surface component is globally registered, and every
composable (`useSurface`, `useSSE`, `useDataModel`, `useA2UI`) is
available without explicit imports.

### Use it

```vue
<!-- pages/agent.vue -->
<script setup lang="ts">
const token = useCookie('access_token')
const headers = () => ({ Authorization: `Bearer ${token.value}` })
</script>

<template>
  <A2Surface url="/api/agent/stream" :headers="headers" />
</template>
```

That's the whole setup — reconnection, validation, and rendering are all
handled by the module.

## Vue 3 (standalone)

If you're not on Nuxt, install the plugin manually:

### Install

```bash
pnpm add @berkantdev/agentui-core @berkantdev/agentui-vue zod
```

### Register the plugin

```ts
// main.ts
import { createApp } from 'vue'
import { AgentUIPlugin } from '@berkantdev/agentui-vue'
import { createDefaultAdapter } from '@berkantdev/agentui-vue/adapters'
import App from './App.vue'

createApp(App)
  .use(AgentUIPlugin, { adapter: createDefaultAdapter() })
  .mount('#app')
```

### Use it

```vue
<script setup lang="ts">
import { A2Surface } from '@berkantdev/agentui-vue'
</script>

<template>
  <A2Surface url="/agent/stream" />
</template>
```

## Using shadcn-vue components

[shadcn-vue](https://www.shadcn-vue.com) is copy-paste, so AgentUI
can't bundle it — you supply your components and AgentUI maps them to
the A2UI protocol names.

### Nuxt

Set `adapter: 'none'` in `nuxt.config.ts` and create a plugin:

```ts
// ~/plugins/agentui.ts
import { AgentUIPlugin } from '@berkantdev/agentui-vue'
import { createShadcnAdapter } from '@berkantdev/agentui-vue/adapters'

import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Dialog } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'

export default defineNuxtPlugin((nuxtApp) => {
  const adapter = createShadcnAdapter({
    Button,
    Card,
    Modal: Dialog,
    TextField: Input,
    CheckBox: Checkbox,
  })
  nuxtApp.vueApp.use(AgentUIPlugin, { adapter })
})
```

### Vue (standalone)

Same idea without the plugin wrapper:

```ts
import { createApp } from 'vue'
import { AgentUIPlugin } from '@berkantdev/agentui-vue'
import { createShadcnAdapter } from '@berkantdev/agentui-vue/adapters'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

createApp(App)
  .use(AgentUIPlugin, {
    adapter: createShadcnAdapter({
      Button,
      Card,
      Modal: Dialog,
      TextField: Input,
    }),
  })
  .mount('#app')
```

Any A2UI component you don't supply falls back to an unmapped-component
marker, so you'll see it immediately during development.

## Auth with custom headers

`<A2Surface>` accepts a `headers` prop — either a static object or a
(possibly async) factory that is re-resolved on every connect and
reconnect. Use the factory form for bearer tokens that expire:

```vue
<script setup lang="ts">
const headers = async () => ({
  Authorization: `Bearer ${await refreshAccessToken()}`,
  'X-Tenant': currentTenant.value,
})
</script>

<template>
  <A2Surface url="/agent/stream" :headers="headers" />
</template>
```

The factory is awaited before every fetch, so a refreshed token
automatically flows into the next reconnect attempt.

## Static rendering (no SSE)

For Storybook, offline previews, or tests you can skip the connection
and render a static message list:

```vue
<script setup lang="ts">
import { A2StaticRenderer } from '@berkantdev/agentui-vue'

const components = [
  {
    id: 'root',
    component: { Card: { title: 'Hello AgentUI' } },
  },
  {
    id: 'body',
    component: { Text: { text: 'This is a static render.' } },
  },
]
</script>

<template>
  <A2StaticRenderer :components="components" />
</template>
```

## Next steps

- **[Adapters guide](./adapters)** — how to build your own adapter
  against any component library.
- **[A2UI Protocol](./protocol)** — the message types and data-model
  semantics.
- **[API Reference](../api/core)** — every export, every prop.
