import { addComponent, addImportsDir, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

/**
 * Module options configurable via `nuxt.config.ts` under the `agentui` key.
 */
export interface ModuleOptions {
  /**
   * Which adapter to auto-install.
   *
   * - `'default'` — the built-in {@link createDefaultAdapter} (6 core
   *   HTML components + placeholder for the rest).
   * - `'none'` — register no adapter; the app provides one via its own
   *   Nuxt plugin, e.g. for shadcn-vue components (which are
   *   copy-paste and must be supplied by the user).
   */
  readonly adapter?: 'default' | 'none'
}

/**
 * Runtime config surface exposed under `runtimeConfig.public.agentui`.
 * Keep it tiny — only primitives travel cleanly from server to client.
 */
export interface RuntimeAgentUIConfig {
  readonly adapter: 'default' | 'none'
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    agentui?: RuntimeAgentUIConfig
  }
}

const MODULE_NAME = '@berkantdev/agentui-nuxt'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'agentui',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    adapter: 'default',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const adapter: 'default' | 'none' = options.adapter ?? 'default'
    const publicConfig = (nuxt.options.runtimeConfig.public ??= {})
    publicConfig.agentui = { adapter }

    addPlugin(resolver.resolve('./runtime/plugin'))
    addImportsDir(resolver.resolve('./runtime/composables'))

    addComponent({
      name: 'A2Surface',
      export: 'A2Surface',
      filePath: '@berkantdev/agentui-vue',
    })
    addComponent({
      name: 'A2StaticRenderer',
      export: 'A2StaticRenderer',
      filePath: '@berkantdev/agentui-vue',
    })
  },
})
