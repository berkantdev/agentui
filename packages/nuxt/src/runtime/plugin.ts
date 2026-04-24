import type { App } from 'vue'
import { AgentUIPlugin } from '@berkantdev/agentui-vue'
import { createDefaultAdapter } from '@berkantdev/agentui-vue/adapters'
// @ts-expect-error `#app` is a Nuxt virtual module resolved at build time.
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Minimal shape of the Nuxt app object we actually touch — avoids pulling
 * in `#app` types, which are only generated inside a running Nuxt project.
 */
interface NuxtAppLike {
  readonly vueApp: App
}

interface PublicRuntimeConfigLike {
  readonly agentui?: { readonly adapter: 'default' | 'none' }
}

const installAgentUI = (nuxtApp: NuxtAppLike): void => {
  const publicConfig = useRuntimeConfig().public as PublicRuntimeConfigLike
  const config = publicConfig.agentui ?? { adapter: 'default' }

  if (config.adapter === 'none') return
  if (config.adapter === 'default') {
    nuxtApp.vueApp.use(AgentUIPlugin, { adapter: createDefaultAdapter() })
  }
}

/**
 * Nuxt plugin that installs {@link AgentUIPlugin} with the adapter chosen
 * in `nuxt.config.ts` → `agentui.adapter`.
 *
 * Registered automatically by `@berkantdev/agentui-nuxt`. Never call this
 * directly from application code.
 */
export default defineNuxtPlugin(installAgentUI)
